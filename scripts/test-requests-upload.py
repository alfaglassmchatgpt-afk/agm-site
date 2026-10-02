"""Isolated PHP upload integration test. Never loads WordPress or sends mail."""
import hashlib
import hmac
import http.client
import json
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import time

handler = Path(sys.argv[1]).resolve()
stubs = Path(__file__).with_name('test-requests.php').read_text().split('require $argv[1];')[0]
stubs = stubs.replace("if (in_array('--staging', $argv, true))", "if (false)")
stubs = stubs.replace('return [];', 'return $_FILES;')
stubs = stubs.replace('$mail[] = $args;', "$mail[] = $args; $GLOBALS['attached_bytes'] = array_sum(array_map('filesize', $args[4] ?? [])); $GLOBALS['attached_paths'] = $args[4] ?? [];")
with tempfile.TemporaryDirectory(prefix='agm-upload-test-') as folder:
    root = Path(folder)
    script = stubs + '\nrequire ' + json.dumps(str(handler)) + ";\n"
    script += "$r = AGM_Requests::submit(new Request($_POST)); http_response_code($r->status); echo json_encode(['result'=>$r->data,'mail_count'=>count($mail),'attached_bytes'=>$GLOBALS['attached_bytes']??0,'leftover'=>array_filter($GLOBALS['attached_paths']??[], 'file_exists')]);"
    (root/'index.php').write_text(script)
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0)); port = sock.getsockname()[1]
    process = subprocess.Popen(['php','-d','post_max_size=24M','-d','upload_max_filesize=20M','-S',f'127.0.0.1:{port}','-t',folder], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(50):
            try:
                with socket.create_connection(('127.0.0.1', port), timeout=.1): break
            except OSError: time.sleep(.1)
        def submit(sizes):
            boundary = 'agm-test-boundary-102030'
            request_id = 'b'*32; issued = str(int(time.time())-5); cookie = 'a'*64
            signature = hmac.new(b'isolated-test-key-nonce', f'{request_id}:{issued}:{cookie}'.encode(), hashlib.sha256).hexdigest()
            fields = {'name':'Test','phone':'1234567890','request_text':'Synthetic test','consent':'1','request_id':request_id,'csrf':issued+'.'+signature}
            chunks = []
            for key,value in fields.items():
                chunks.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{key}"\r\n\r\n{value}\r\n'.encode())
            for n,size in enumerate(sizes):
                chunks.append(f'--{boundary}\r\nContent-Disposition: form-data; name="attachments[]"; filename="test{n}.pdf"\r\nContent-Type: application/pdf\r\n\r\n'.encode())
                chunks.append(b'%PDF-1.4\n'+b' '*(size-9)+b'\r\n')
            chunks.append(f'--{boundary}--\r\n'.encode())
            conn = http.client.HTTPConnection('127.0.0.1', port, timeout=30)
            conn.request('POST','/',b''.join(chunks),{'Content-Type':'multipart/form-data; boundary='+boundary,'Cookie':'agm_request_session='+cookie})
            response = conn.getresponse(); data = response.read(); status = response.status; conn.close()
            return status, json.loads(data)
        status,data = submit([10*1024*1024,10*1024*1024])
        assert status == 200 and data['mail_count'] == 1 and data['attached_bytes'] == 20*1024*1024 and not data['leftover'], (status,data)
        status,data = submit([10*1024*1024,10*1024*1024+1])
        assert status == 413 and data['mail_count'] == 0 and not data['leftover'], (status,data)
        print('PASS real multipart: 20 MiB accepted, 20 MiB + 1 byte rejected, temporary files removed; mocked mail only')
    finally:
        process.terminate(); process.wait(timeout=10)
