<?php
/** Plugin Name: AGM shelf manager attachments */
defined('ABSPATH') || exit;
function agm_shelf_image($item) {
    if (($item['type']??'')!=='material' || !is_array($item['shelf']??null) || !is_string($item['shelfImage']??null)) return false;
    $encoded=$item['shelfImage'];
    if (strlen($encoded)>1400000 || strpos($encoded,'data:image/png;base64,')!==0) return false;
    $bytes=base64_decode(substr($encoded,22),true);
    if (!$bytes || strlen($bytes)>1048576) return false;
    $size=@getimagesizefromstring($bytes);
    if (!$size || $size[2]!==IMAGETYPE_PNG || $size[0]!==1000 || $size[1]!==650) return false;
    return $bytes;
}
function agm_with_shelf_attachment($p,$images,$files,$deliver) {
    $dir=sys_get_temp_dir().DIRECTORY_SEPARATOR.'agm-shelves-'.bin2hex(random_bytes(16));
    if (!mkdir($dir,0700)) return false;
    $temporary=[];
    try {
        $html='<!doctype html><html lang="ru"><meta charset="utf-8"><title>Полки — заявка на расчёт</title><style>body{max-width:850px;margin:30px auto;padding:20px;font:16px/1.5 Arial;color:#20363b}img{width:100%;max-width:650px}pre{white-space:pre-wrap;font:inherit}article{break-inside:avoid;margin-bottom:40px}@media print{article+article{break-before:page}}</style><h1>Полки — заявка на расчёт</h1><p>Согласовательные схемы клиента. Проверить размеры, обработку и крепления перед изготовлением.</p>';
        foreach (['name'=>'Имя','phone'=>'Телефон','email'=>'Email','comment'=>'Комментарий'] as $key=>$label) {
            if (!empty($p[$key])) $html.='<p>'.esc_html($label.': '.$p[$key]).'</p>';
        }
        foreach ($images as $index=>$bytes) {
            $item=$p['items'][$index];
            $html.='<article><h2>'.esc_html(($index+1).'. '.$item['title']).'</h2><img alt="Схема полки с размерами" src="data:image/png;base64,'.base64_encode($bytes).'"><pre>'.esc_html($item['summary']).'</pre></article>';
            $png=$dir.'/shelf-'.($index+1).'.png';$temporary[]=$png;
            if (file_put_contents($png,$bytes)!==strlen($bytes)) return false;
            $files[]=$png;
        }
        $html.='</html>';
        $file=$dir.'/ALFAGLASS-shelves.html';$temporary[]=$file;
        if (file_put_contents($file,$html)!==strlen($html)) return false;
        $files[]=$file;
        return $deliver($files);
    } catch (Throwable $error) { return false; }
    finally { foreach ($temporary as $path) if (is_file($path)) unlink($path); rmdir($dir); }
}
