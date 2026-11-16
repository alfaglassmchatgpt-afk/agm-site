<?php
defined('ABSPATH') || exit;

// Geometry is rebuilt from numeric fields. No client-supplied markup is used in mail.
function agm_shower_views($s) {
    $layout=$s['layout']??'';
    $mode=$s['mode']??'';
    if (!in_array($layout,['niche','corner','pentagon'],true) || !in_array($mode,['fixed','hinged','sliding'],true)) throw new UnexpectedValueException('Unknown shower layout');
    $number=static function($key)use($s){
        $v=filter_var($s[$key]??null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1,'max_range'=>10000]]);
        if ($v===false) throw new UnexpectedValueException('Invalid shower dimension');
        return $v;
    };
    $w=$number('width'); $h=$number('height');
    $depth=$layout==='niche'?'':' · глубина '.$number('depth').' мм';
    $fraction=$mode==='fixed'?.7:1-min(.95,$number('door')/$w);
    $pent=$layout==='pentagon';
    $walls=$layout==='niche'?'M45 112V34H225V112':($pent?'M67 150V18H199':'M45 112V34H225');
    $side=$pent?'M67 150H133 M199 18V84':($layout==='corner'?'M225 34V112':'');
    $length=$pent?round(hypot(66,66),2):180;
    $axis=$pent?'translate(133 150) rotate(-45)':'translate(45 112)';
    $split=round($length*$fraction,2); $leaf=round($length-$split,2);
    $glass='#137a80'; $door='#855124';
    $path=static function($d,$color,$weight,$dash=''){
        return '<path d="'.$d.'" fill="none" stroke="'.$color.'" stroke-width="'.$weight.'"'.($dash?' stroke-dasharray="'.$dash.'"':'').'/>';
    };
    $mirror=($s['opening']??'')==='left'?'translate(270 0) scale(-1 1)':'';
    $front=$path("M0 0H$split",$glass,4);
    if ($mode==='hinged') {
        $front.=$path("M$split 0H$length",$door,1,'3 3').$path("M$length 0v$leaf",$door,3)
            .$path("M$split 0a$leaf $leaf 0 0 0 $leaf $leaf",$door,1,'3 3');
        if (($s['swing']??'')==='both') $front.=$path("M$split 0a$leaf $leaf 0 0 1 $leaf -$leaf",$door,1,'3 3');
    } elseif ($mode==='sliding') {
        $front.=$path("M$split 5H$length",$door,3).$path("M$length 16h-22l5-4m-5 4 5 4",$door,1.5);
    } else {
        $middle=($length+$split)/2;
        $front.=$path("M$middle 18v-30l-4 5m4-5 4 5",$door,1.5);
    }
    $bounds=$mode==='hinged'?min(300,135+$leaf):145;
    $plan='<svg viewBox="-30 -4 330 '.$bounds.'"><g transform="'.$mirror.'">'.$path($walls,'#59646a',6)
        .$path($side,$glass,3).'<g transform="'.$axis.'">'.$front.'</g></g></svg>';
    $edge=round(45+180*$fraction,2);
    $pane=static function($x,$width,$color){return '<rect x="'.$x.'" y="30" width="'.$width.'" height="110" fill="#e8f5f5" stroke="'.$color.'" stroke-width="2"/>';};
    $elevation=$pane(45,$edge-45,$glass);
    if ($mode!=='fixed') {
        $elevation.=$pane($edge,225-$edge,$door);
        if ($mode==='sliding') {
            $elevation.=$path('M44 26H226','#586970',2);
            foreach ([$edge+4,221] as $cx) $elevation.='<circle cx="'.$cx.'" cy="26" r="2.4" fill="#586970"/>';
        } else {
            $elevation.=$path('M222 48h6 M222 120h6','#586970',4);
        }
        $hx=$edge+(225-$edge)*.20;
        $handle=$s['handle']??'';
        if ($handle==='bar') $elevation.=$path("M$hx 85v-12",'#394950',2.5);
        if ($handle==='knob'||$handle==='recessed') $elevation.='<ellipse cx="'.$hx.'" cy="80" rx="2.5" ry="'.($handle==='knob'?2.5:5).'" fill="white" stroke="#394950"/>';
    }
    $sidePane='<path d="M225 30l21-9v110l-21 9Z" fill="#d5e9eb" stroke="'.$glass.'" stroke-width="2"/>';
    if ($layout!=='niche') $elevation.=$sidePane;
    if ($pent) $elevation.='<g transform="translate(270 0) scale(-1 1)">'.$sidePane.'</g>';
    return '<div class="views"><figure><figcaption>Обмерный план · вид сверху</figcaption>'.$plan.'<small>Ширина '.$w.' мм'.$depth.'</small></figure><figure><figcaption>Вид со стороны входа</figcaption><svg viewBox="0 0 270 160"><g transform="'.$mirror.'">'.$elevation.'</g></svg><small>Высота конструкции '.$h.' мм</small></figure></div>';
}

function agm_shower_sample($summary) {
    if (!preg_match('/^Стекло: ([^\r\n]+)/mu',$summary,$match)) return '';
    $files=[
        'Стекло прозрачное (М1)'=>'clear-m1-4mm-v2.png',
        'Estriado'=>'estriado-ordinary-4-moru-style-v2.png',
        'Estriado Crystal'=>'estriado-crystal-4-moru-style-v2.png',
        'Estriado Ultra'=>'estriado-ultra-4-moru-style-v2.png',
        'Vision Sun Ultra'=>'vision-sun-ultra-approved-v1.png',
        'Рифлёное стекло MORU CRYSTAL'=>'moru-crystal-sample-v1.png',
        'Рифлёное стекло MORU ULTRA'=>'moru-ultra-sample-v1.png',
        'Тонированное стекло Серое'=>'tinted-grey-v1.png',
        'Тонированное стекло Бронза'=>'moru-bronze-v1.png',
        'Гладкое тонированное стекло Бронза'=>'moru-bronze-v1.png',
        'Рифлёное стекло MORU Bronze'=>'moru-bronze-toned-sample-8mm-v1.png',
        'Тонированное стекло зелёное (Green)'=>'tinted-green-4mm-v1.png',
        'Тонированное стекло Черное (Black)'=>'tinted-black-4mm-v1.png',
        'Матовое стекло Matelux'=>'steklo-matovoe-matelux-v1.png',
        'Матовое осветлённое стекло'=>'matte-lowiron-4mm-v1.png',
        'Матовое бронзовое стекло'=>'matte-bronze-4mm-v1.png',
        'Матовое серое стекло'=>'matte-grey-4mm-v1.png',
        'Стекло осветлённое Crystalvision'=>'clear-crystalvision-4mm-v2.png',
        'Стекло осветлённое Extra Clear, Optiwhite'=>'clear-extra-clear-4mm-v2.png',
    ];
    $name=$match[1];
    if (!isset($files[$name])) return '';
    $file=get_template_directory().'/agm-glass/assets/generated/'.$files[$name];
    if (!is_readable($file) || filesize($file)>2097152) return '';
    $png=file_get_contents($file);
    if (!$png) return '';
    return '<figure class="sample"><img alt="Образец стекла" width="120" height="96" src="data:image/png;base64,'.base64_encode($png).'"><figcaption>'.esc_html($name).'</figcaption></figure>';
}

function agm_shower_report($p) {
    $html='<!doctype html><html lang="ru"><meta charset="utf-8"><title>Заявка на расчёт душевой</title><style>body{max-width:900px;margin:24px auto;padding:0 16px;font:15px/1.45 Arial;color:#20353e}h1{font-size:24px}h2{font-size:18px}.views{display:flex;gap:12px}figure{flex:1;min-width:0;margin:0;border:1px solid #adbfc5;padding:10px}.sample{display:flex;align-items:center;gap:16px;margin:10px 0}.sample img{object-fit:contain}svg{display:block;width:100%;height:180px}pre{font:inherit;white-space:pre-wrap;overflow-wrap:anywhere}section+section{break-before:page}figure{break-inside:avoid}@page{size:A4;margin:13mm}</style>';
    foreach ($p['items'] as $index=>$item) {
        if ($item['type']!=='partition'||!isset($item['shower'])) continue;
        $html.='<section><h1>Заявка на расчёт душевой</h1><p>'.esc_html(implode(' · ',array_filter([$p['name'],$p['phone'],$p['email']]))).'</p>';
        if ($p['comment']!=='') $html.='<p>Комментарий к заказу: '.esc_html($p['comment']).'</p>';
        $html.='<h2>Позиция '.($index+1).' · '.esc_html($item['title']).'</h2>'.agm_shower_views($item['shower']);
        $html.=agm_shower_sample($item['summary']);
        $printSummary=preg_replace('/^(?:Материал|Каталог|Обмерная схема \(вид сверху\)): https?:\/\/[^\s]+\R?/mu','',$item['summary']);
        $html.='<p>Эскиз без масштаба. Геометрию скосов и размеры для изготовления уточнить по замеру.</p><pre>'.esc_html($printSummary).'</pre></section>';
    }
    return $html.'</html>';
}

function agm_with_shower_attachment($p,$files,$deliver) {
    $dir=sys_get_temp_dir().DIRECTORY_SEPARATOR.'agm-'.bin2hex(random_bytes(16));
    if (!mkdir($dir,0700)) return false;
    $file=$dir.'/ALFAGLASS-showers.html';
    try {
        $html=agm_shower_report($p);
        if (file_put_contents($file,$html)!==strlen($html)) return false;
        $files[]=$file;
        return $deliver($files);
    } catch (Throwable $error) { return false; }
    finally { if (is_file($file)) unlink($file); rmdir($dir); }
}
