<?php
defined('ABSPATH') || exit;
// Render from validated structured data. Never accept HTML, attachment paths or recipients from the browser.
function agm_with_facade_attachment($p, $deliver) {
    if (!isset($p['managerItems']) || !is_array($p['managerItems']) || count($p['managerItems'])>1000 || strlen(wp_json_encode($p['managerItems']))>1048576 || !function_exists('proc_open')) return false;
    $dir=sys_get_temp_dir().DIRECTORY_SEPARATOR.'agm-'.bin2hex(random_bytes(16));
    if (!mkdir($dir,0700)) return false;
    $doc=$dir.'/ALFAGLASS-facades.html';
    $input=$dir.'/order.json';
    try {
        $payload=['items'=>$p['managerItems'],'customerItems'=>$p['items']];
        foreach (['name','email','phone','comment'] as $k) $payload[$k]=$p[$k];
        if(file_put_contents($input,wp_json_encode($payload))===false)return false;
        $cmd=[defined('AGM_NODE_BINARY')?AGM_NODE_BINARY:'node',get_template_directory().'/agm-aluminium-configurator/manager-mail.mjs'];
        $process=proc_open($cmd,[0=>['file',$input,'r'],1=>['file',$doc,'w'],2=>['file',PHP_OS_FAMILY==='Windows'?'NUL':'/dev/null','w']],$pipes);
        if(!is_resource($process)||proc_close($process)!==0||!is_file($doc)||!filesize($doc))return false;
        return $deliver([$doc]);
    } catch (Throwable $e) { return false; } finally {
        if(is_file($input))unlink($input);
        if(is_file($doc))unlink($doc);
        rmdir($dir);
    }
}
