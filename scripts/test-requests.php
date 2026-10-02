<?php
/** Isolated transport tests: no WordPress bootstrap, network, real mail or client data. */
define('ABSPATH', __DIR__);
define('AGM_REQUESTS_ENABLED', true);
define('AGM_REQUESTS_TO', 'manager@example.invalid');
define('AGM_REQUESTS_FROM', 'sender@example.invalid');
if (in_array('--staging', $argv, true)) { define('AGM_STAGING', true); }
$store = []; $options = []; $mail = []; $mail_results = [];
function add_action(...$args) {}
function is_email($value) { return filter_var($value, FILTER_VALIDATE_EMAIL); }
function get_privacy_policy_url() { return 'https://example.invalid/privacy/'; }
function wp_salt($type) { return 'isolated-test-key-' . $type; }
function get_transient($key) { global $store; return $store[$key] ?? false; }
function set_transient($key, $value, $ttl) { global $store; $store[$key] = $value; return true; }
function add_option($key, $value, ...$args) { global $options; if (isset($options[$key])) return false; $options[$key] = $value; return true; }
function delete_option($key) { global $options; unset($options[$key]); }
function wp_schedule_single_event(...$args) {}
function sanitize_textarea_field($value) { return strip_tags($value); }
function sanitize_file_name($value) { return preg_replace('/[^a-zA-Z0-9._-]/', '-', basename($value)); }
function wp_mail(...$args) { global $mail, $mail_results; $mail[] = $args; return array_shift($mail_results) ?? true; }
class WP_REST_Response {
    public $data, $status;
    function __construct($data, $status) { $this->data = $data; $this->status = $status; }
    function header(...$args) {}
}
class Request {
    public $p;
    function __construct($p) { $this->p = $p; }
    function get_body_params() { return $this->p; }
    function get_file_params() { return []; }
}
require $argv[1];
function check($condition, $label) { if (!$condition) { throw new Exception($label); } }
function request_data() {
    $id = bin2hex(random_bytes(16)); $issued = time() - 5;
    return ['name' => 'Test', 'phone' => '1234567890', 'email' => 'client@example.invalid', 'request_text' => 'Test order', 'consent' => '1', 'request_id' => $id,
        'csrf' => $issued . '.' . hash_hmac('sha256', $id . ':' . $issued . ':' . $_COOKIE['agm_request_session'], wp_salt('nonce'))];
}
$_COOKIE['agm_request_session'] = str_repeat('a', 64);
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$p = request_data();
if (defined('AGM_STAGING')) {
    check(!AGM_Requests::enabled(), 'staging disabled');
    check(AGM_Requests::submit(new Request($p))->status === 503 && !$mail, 'no staging mail');
    echo "PASS staging guard\n"; exit;
}
check(AGM_Requests::validate_fields($p) === '', 'valid fields');
check(AGM_Requests::validate_fields(array_replace($p, ['email' => "a@b.com\r\nBcc: x@y.com"])) !== '', 'header injection');
check(AGM_Requests::validate_fields(array_replace($p, ['consent' => ''])) !== '', 'consent');
check(AGM_Requests::validate_fields(array_replace($p, ['name' => []])) !== '', 'array field');
$response = AGM_Requests::submit(new Request($p));
check($response->status === 200 && count($mail) === 2, 'manager and confirmation');
check($mail[0][0] === AGM_REQUESTS_TO && $mail[1][0] === $p['email'], 'destinations');
check(strpos($mail[1][2], 'Test order') === false && count($mail[1]) === 4, 'fixed confirmation without attachments');
AGM_Requests::submit(new Request($p));
check(count($mail) === 2, 'idempotency');
$store = []; $mail_results = [false];
check(AGM_Requests::submit(new Request(request_data()))->status === 502, 'mail failure not success');
check(!$options, 'lock cleanup');
$store = []; $mail_results = [true, false];
$r = AGM_Requests::submit(new Request(request_data()));
check($r->data['ok'] && strpos($r->data['message'], 'повторять') !== false, 'confirmation failure preserves order');
$bad = request_data(); $bad['csrf'] = 'broken'; $before = count($mail);
check(AGM_Requests::submit(new Request($bad))->status === 403 && count($mail) === $before, 'csrf');
$store = [];
for ($i=0; $i<5; $i++) AGM_Requests::submit(new Request(request_data()));
check(AGM_Requests::submit(new Request(request_data()))->status === 429, 'rate limit');
$_SERVER['CONTENT_LENGTH'] = AGM_Requests::LIMIT + 1048577;
check(AGM_Requests::submit(new Request(request_data()))->status === 413, 'post limit');
$file = tempnam(sys_get_temp_dir(), 'agm-test-');
try {
    file_put_contents($file, "%PDF-1.4\nfixture");
    check(AGM_Requests::validate_file('drawing.pdf', $file, AGM_Requests::LIMIT) === '', '20MiB boundary');
    check(AGM_Requests::validate_file('drawing.pdf', $file, AGM_Requests::LIMIT+1) !== '', 'over limit');
    check(AGM_Requests::validate_file('drawing.php', $file, 20) !== '', 'extension');
    check(AGM_Requests::validate_file('drawing.jpg', $file, 20) !== '', 'fake image');
    file_put_contents($file, '<?php echo 1;');
    check(AGM_Requests::validate_file('drawing.dwg', $file, 20) !== '', 'executable renamed');
    file_put_contents($file, '<svg xmlns="http://www.w3.org/2000/svg"><script>1</script></svg>');
    check(AGM_Requests::validate_file('drawing.svg', $file, 70) !== '', 'active svg');
} finally { unlink($file); }
echo "PASS request validation, mail outcomes, deduplication, rate limit and attachment checks\n";
