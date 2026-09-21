"""Tests use temporary synthetic files, never real backups or a database."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('backup', Path(__file__).resolve().parents[1] / 'infra/agm-site-backup.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class RotationTests(unittest.TestCase):
    def make_backup(self, root, day):
        path = root / ('backup-202609%02dT000000Z' % day)
        path.mkdir()
        files = {}
        for name in module.PAYLOADS:
            (path / name).write_bytes(b'fixture')
            files[name] = {'bytes': 7, 'sha256': module.digest(path / name)}
        (path / 'manifest.json').write_text(json.dumps({'format': 'agm-site-backup-v1', 'verified': True, 'files': files}))
        return path

    def test_keeps_three_newest_and_unmanaged_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for day in range(1, 6): self.make_backup(root, day)
            (root / 'legacy').mkdir()
            self.assertEqual(module.prune(root), 2)
            self.assertEqual([p.name for p in module.completed(root)], ['backup-20260905T000000Z', 'backup-20260904T000000Z', 'backup-20260903T000000Z'])
            self.assertTrue((root / 'legacy').is_dir())

    def test_corruption_never_evicts_old_backups(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for day in range(1, 5): self.make_backup(root, day)
            # Same size: checksum, not just length, must detect the corruption.
            (root / 'backup-20260904T000000Z/site.tar.gz').write_bytes(b'corrupt')
            with self.assertRaises(RuntimeError): module.prune(root)
            self.assertEqual(len(list(root.iterdir())), 4)

    def test_incomplete_completed_name_blocks_rotation(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for day in range(1, 5): self.make_backup(root, day)
            (root / 'backup-20260904T000000Z/manifest.json').unlink()
            with self.assertRaises(RuntimeError): module.prune(root)
            self.assertEqual(len(list(root.iterdir())), 4)

    def test_symlink_outside_root_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / 'backups'
            root.mkdir()
            outside = Path(tmp) / 'outside'
            outside.mkdir()
            (root / 'backup-20260901T000000Z').symlink_to(outside, target_is_directory=True)
            with self.assertRaises(RuntimeError): module.prune(root)
            self.assertTrue(outside.is_dir())


if __name__ == '__main__':
    unittest.main()
