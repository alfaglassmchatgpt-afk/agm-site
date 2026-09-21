#!/usr/bin/python3
"""Private on-VM backups. No network, credentials in arguments, or SQL in logs."""
import datetime as dt
import fcntl
import gzip
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import signal
import subprocess
import sys

ROOT = Path('/var/backups/agm-site')
SITE = Path('/srv/agm/site')
KEEP = 3
RESERVE = 2 * 1024**3
NAME = re.compile(r'backup-\d{8}T\d{6}Z')
PAYLOADS = ('site.tar.gz', 'database.sql.gz', 'config.tar.gz')


def run(args, **kwargs):
    result = subprocess.run(args, stderr=subprocess.DEVNULL, **kwargs)
    if result.returncode:
        raise RuntimeError('Backup command failed: ' + Path(args[0]).name)
    return result


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as source:
        for chunk in iter(lambda: source.read(8 * 1024**2), b''):
            h.update(chunk)
    return h.hexdigest()


def managed(path, root=ROOT):
    if path.is_symlink() or path.resolve().parent != root.resolve():
        raise RuntimeError('Refusing path outside backup directory')
    if not NAME.fullmatch(path.name):
        raise RuntimeError('Unrecognised backup name')


def completed(root=ROOT):
    result = []
    for path in root.iterdir():
        if not NAME.fullmatch(path.name):
            continue
        managed(path, root)
        marker = path / 'manifest.json'
        if not path.is_dir() or marker.is_symlink() or not marker.is_file():
            raise RuntimeError('Incomplete or unrecognised completed backup')
        data = json.loads(marker.read_text())
        if data.get('format') != 'agm-site-backup-v1' or data.get('verified') is not True:
            raise RuntimeError('Unverified backup; refusing automatic rotation')
        for filename in PAYLOADS:
            file = path / filename
            if file.is_symlink() or not file.is_file() or file.stat().st_size != data['files'][filename]['bytes']:
                raise RuntimeError('Backup payload missing or changed; rotation stopped')
        result.append(path)
    return sorted(result, key=lambda path: path.name, reverse=True)


def prune(root=ROOT, keep=KEEP):
    if keep < 3:
        raise RuntimeError('At least three successful backups must be retained')
    backups = completed(root)
    # Do not evict history if a retained backup was corrupted after creation.
    for path in backups[:keep]:
        data = json.loads((path / 'manifest.json').read_text())
        for filename in PAYLOADS:
            if digest(path / filename) != data['files'][filename]['sha256']:
                raise RuntimeError('Retained backup checksum mismatch; rotation stopped')
    removed = 0
    for path in backups[keep:]:
        managed(path, root)
        shutil.rmtree(path)
        removed += 1
    return removed


def verify_archive(path):
    run(['/usr/bin/gzip', '-t', str(path)], stdout=subprocess.DEVNULL)
    run(['/usr/bin/tar', '-tzf', str(path)], stdout=subprocess.DEVNULL)


def backup():
    os.umask(0o077)
    if os.geteuid() != 0 or SITE.resolve() != SITE:
        raise RuntimeError('Root and the expected dev site are required')
    ROOT.mkdir(mode=0o700, parents=True, exist_ok=True)
    if ROOT.is_symlink() or ROOT.resolve() != ROOT or ROOT.stat().st_uid != 0:
        raise RuntimeError('Unsafe backup directory')
    ROOT.chmod(0o700)
    lockdir = Path('/run/agm-site-backup')
    lockdir.mkdir(mode=0o700, exist_ok=True)
    with (lockdir / 'lock').open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        # Only remove this program's unfinished outputs after acquiring its lock.
        for stale in ROOT.iterdir():
            if re.fullmatch(r'\.incomplete-backup-\d{8}T\d{6}Z', stale.name):
                if stale.is_symlink() or stale.resolve().parent != ROOT or not stale.is_dir():
                    raise RuntimeError('Unsafe incomplete backup path')
                shutil.rmtree(stale)
        wp = ['/usr/sbin/runuser', '-u', 'www-data', '--', '/usr/local/bin/wp',
              '--path=' + str(SITE), '--skip-plugins', '--skip-themes', 'config', 'get']
        for flag in ('AGM_STAGING', 'DISABLE_WP_CRON'):
            if run(wp + [flag], stdout=subprocess.PIPE, text=True).stdout.strip() != '1':
                raise RuntimeError('Dev protection flag not enabled')
        database = run(wp + ['DB_NAME'], stdout=subprocess.PIPE, text=True).stdout.strip()
        if not re.fullmatch(r'[A-Za-z0-9_]+', database):
            raise RuntimeError('Unexpected database identifier')
        mysql = ['/usr/bin/mysql', '--no-defaults', '--protocol=socket', '-NBe']
        query = "SELECT COUNT(*) FROM information_schema.tables WHERE TABLE_SCHEMA='%s' AND TABLE_TYPE='BASE TABLE' AND ENGINE<>'InnoDB'" % database
        if run(mysql + [query], stdout=subprocess.PIPE, text=True).stdout.strip() != '0':
            raise RuntimeError('Nontransactional tables require a revised backup policy')
        size_query = "SELECT COALESCE(SUM(DATA_LENGTH+INDEX_LENGTH),0) FROM information_schema.tables WHERE TABLE_SCHEMA='%s'" % database
        dbsize = int(run(mysql + [size_query], stdout=subprocess.PIPE, text=True).stdout.strip())
        sitesize = int(run(['/usr/bin/du', '-sb', str(SITE)], stdout=subprocess.PIPE, text=True).stdout.split()[0])
        if shutil.disk_usage(ROOT).free < sitesize + dbsize + RESERVE:
            raise RuntimeError('Insufficient space; previous successful backups retained')
        stamp = dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
        final = ROOT / ('backup-' + stamp)
        pending = ROOT / ('.incomplete-' + final.name)
        if final.exists():
            raise RuntimeError('Backup name already exists')
        pending.mkdir(mode=0o700)
        try:
            run(['/usr/bin/tar', '-czpf', str(pending / 'site.tar.gz'), '-C', '/srv/agm', 'site'], stdout=subprocess.DEVNULL)
            configs = ['etc/apache2', 'etc/php', 'etc/mysql', 'etc/ssl/agm-staging',
                       'usr/local/sbin/agm-site-backup', 'etc/systemd/system/agm-site-backup.service',
                       'etc/systemd/system/agm-site-backup.timer']
            run(['/usr/bin/tar', '-czpf', str(pending / 'config.tar.gz'), '-C', '/'] + configs, stdout=subprocess.DEVNULL)
            # Root socket authentication; password and WP options are never printed.
            dump = ['/usr/bin/mysqldump', '--no-defaults', '--protocol=socket', '--single-transaction',
                    '--quick', '--routines', '--events', '--triggers', '--hex-blob',
                    '--no-tablespaces', '--set-gtid-purged=OFF', '--default-character-set=utf8mb4', database]
            with (pending / 'database.sql.gz').open('xb') as output:
                process = subprocess.Popen(dump, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
                try:
                    with gzip.GzipFile(fileobj=output, mode='wb', compresslevel=6) as compressed:
                        shutil.copyfileobj(process.stdout, compressed, length=1024**2)
                    if process.wait():
                        raise RuntimeError('Database dump failed')
                finally:
                    process.stdout.close()
                    if process.poll() is None:
                        process.terminate()
                        process.wait()
            for name in ('site.tar.gz', 'config.tar.gz'):
                verify_archive(pending / name)
            tail = b''
            with gzip.open(pending / 'database.sql.gz', 'rb') as source:
                for chunk in iter(lambda: source.read(1024**2), b''):
                    tail = (tail + chunk)[-65536:]
            if b'-- Dump completed on ' not in tail:
                raise RuntimeError('Database dump completion marker missing')
            files = {name: {'bytes': (pending / name).stat().st_size,
                            'sha256': digest(pending / name)} for name in PAYLOADS}
            manifest = {'format': 'agm-site-backup-v1', 'verified': True, 'utc': stamp,
                        'database': database, 'files': files}
            (pending / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
            (pending / 'SHA256SUMS').write_text(''.join(files[name]['sha256'] + '  ' + name + '\n' for name in PAYLOADS))
            # Flush payloads before atomic publication of the completed directory.
            for file in pending.iterdir():
                with file.open('rb') as stream:
                    os.fsync(stream.fileno())
            pending.rename(final)
            removed = prune()
            print(json.dumps({'backup': final.name, 'verified': True, 'rotated': removed,
                              'retention': KEEP, 'free_bytes': shutil.disk_usage(ROOT).free}), flush=True)
        finally:
            if pending.exists():
                shutil.rmtree(pending)


if __name__ == '__main__':
    signal.signal(signal.SIGTERM, lambda *_: sys.exit(1))
    try:
        backup()
    except Exception as exc:
        # Controlled failures contain no SQL, configuration values, or file contents.
        message = str(exc) if isinstance(exc, RuntimeError) else type(exc).__name__
        print('Backup failed: ' + message, file=sys.stderr)
        sys.exit(1)
