<?php
defined('ABSPATH') || exit;

function agm_facade_cells($head, $rows) {
    $html = '<table><thead><tr>';
    foreach ($head as $cell) $html .= '<th>'.esc_html($cell).'</th>';
    $html .= '</tr></thead><tbody>';
    foreach ($rows as $row) {
        $html .= '<tr>';
        foreach ($row as $cell) $html .= '<td>'.esc_html((string)$cell).'</td>';
        $html .= '</tr>';
    }
    return $html.'</tbody></table>';
}

function agm_facade_article($id) {
    return strpos($id,'MF') === 0 ? 'MF '.substr($id,2) : 'MZ '.$id;
}

function agm_facade_bars($lengths, $stock, $single) {
    rsort($lengths,SORT_NUMERIC);
    $usable = $stock - ($stock === 2850 ? 0 : 100);
    $bars = [];
    foreach ($lengths as $length) {
        $cost = $length + ($single ? 8 : 4);
        if ($cost > $usable) return null;
        $index = count($bars);
        if (!$single) foreach ($bars as $i=>$bar) {
            if ($bar['left'] >= $cost) { $index=$i; break; }
        }
        if (!isset($bars[$index])) $bars[$index]=['left'=>$usable,'parts'=>[]];
        $bars[$index]['left'] -= $cost;
        $bars[$index]['parts'][] = $length;
    }
    return $bars;
}

function agm_facade_sketch($c,$color,$glassColor,$ribbed) {
    $scale=min(165/$c['w'],185/$c['h']);
    $w=$c['w']*$scale; $h=$c['h']*$scale; $x=(240-$w)/2; $y=(240-$h)/2;
    $svg='<svg viewBox="0 0 240 240" width="200" aria-label="Размерный эскиз"><rect x="'.$x.'" y="'.$y.'" width="'.$w.'" height="'.$h.'" fill="'.esc_attr($glassColor).'" stroke="'.esc_attr($color).'" stroke-width="4"/>';
    if ($ribbed) {
        $v=$c['reed']==='vertical';
        for ($d=6;$d<($v?$w:$h);$d+=6) $svg.='<path stroke="#819397" d="M'.($v?$x+$d:$x).' '.($v?$y:$y+$d).($v?'v'.$h:'h'.$w).'"/>';
    }
    foreach ($c['hinges'] as $i=>$pos) {
        $cy=$c['hinge']==='mf20'?($i?$y+$h-4:$y+4):$y+$pos*$scale;
        $svg.='<circle cx="'.($c['side']==='left'?$x+3:$x+$w-3).'" cy="'.$cy.'" r="3" fill="#135275"/>';
    }
    return $svg.'<g text-anchor="middle" font-size="12"><text x="120" y="'.($y-8).'">'.$c['w'].' мм</text><text transform="translate('.($x-7).' 120) rotate(-90)">'.$c['h'].' мм</text></g></svg>';
}

function agm_facade_report($p) {
    $dir=get_template_directory().'/agm-aluminium-configurator/';
    $db=json_decode(file_get_contents($dir.'report-catalog.json'),true);
    $catalog=json_decode(file_get_contents($dir.'glass-catalog.json'),true);
    $profiles=array_column($db['profiles'],null,'id');
    $glasses=array_column($catalog['items'],null,'id');
    $hinges=['none'=>'Без петель','mf20'=>'Скрытые MF 20','mzf'=>'MZF 63','blum'=>'BLUM 71B950A','cup'=>'Чашка 35 мм','narrow'=>'Для узкого рамочного профиля'];
    $groups=[]; $items=$p['managerItems'];
    if (!is_array($items) || count($items)>1000 || strlen(wp_json_encode($items))>1048576) throw new InvalidArgumentException();
    foreach ($items as $i=>$item) {
        $key='item-'.$i;
        if ($item['type']==='facade') {
            $c=$item['config'];
            if (!is_array($c) || !is_array($c['hinges']) || count($c['hinges'])>6) throw new InvalidArgumentException();
            unset($c['origin'],$c['view'],$c['backdrop']);
            sort($c['hinges'],SORT_NUMERIC); ksort($c);
            $key=wp_json_encode($c);
        }
        if (!isset($groups[$key])) $groups[$key]=['item'=>$item,'qty'=>0];
        ++$groups[$key]['qty'];
    }
    if (count($groups)!==count($p['items'])) throw new InvalidArgumentException();
    $order='<h1>Заявка «Мой расчёт»</h1>';
    foreach (['name','phone','email','comment'] as $k) $order.='<p>'.esc_html($p[$k]).'</p>';
    $cards=''; $rails=[]; $glassRows=[]; $drilling=[]; $total=0;
    foreach (array_values($groups) as $i=>$group) {
        $item=$group['item']; $qty=$group['qty']; $summary=$item['summary'];
        if ($qty>1) $summary=preg_match('/количество: 1\b/iu',$summary)?preg_replace('/количество: 1\b/iu','количество: '.$qty,$summary,1):$summary."\nКоличество: ".$qty.' шт.';
        $public=$p['items'][$i];
        if ($public['title']!==$item['title'] || $public['type']!==$item['type'] || $public['summary']!==$summary) throw new InvalidArgumentException();
        $title=esc_html($item['title']);
        $order.='<h3>'.$title.'</h3><pre>'.esc_html($summary).'</pre>';
        if ($item['type']!=='facade') continue;
        $total+=$qty;
        $c=$item['config']; $w=$c['w']; $h=$c['h'];
        $profile=$profiles[$c['profile']]??null; $color=$db['colors'][$c['color']]??null;
        $glass=$glasses[$c['glass']]??null; $pins=$c['hinges']; sort($pins,SORT_NUMERIC);
        if (!$profile || !$color || (!isset($glass) && $c['glass']!=='none') || !isset($hinges[$c['hinge']]) || !in_array($c['side'],['left','right'],true) || !is_int($w) || !is_int($h) || min($w,$h)<200 || max($w,$h)>6000) throw new InvalidArgumentException();
        foreach ($pins as $pos) if (!is_int($pos)||$pos<=0||$pos>=$h) throw new InvalidArgumentException();
        $ribbed=$glass && in_array($glass['slug'],$db['reedSlugs'],true);
        $name=$glass['title']??'Без наполнения'; $side=$c['side']==='left'?'левая':'правая';
        $base=agm_facade_article($profile['baseId']??$profile['id']);
        $stock=$profile['series']==='MZ'?6000:5500;
        $add=function($label,$stock,$parts,$single=false)use(&$rails,$color,$qty){
            $key=$label.' · '.$color[0];
            if (!isset($rails[$key])) $rails[$key]=['stock'=>$stock,'single'=>$single,'parts'=>[]];
            for ($n=0;$n<$qty;++$n) array_push($rails[$key]['parts'],...$parts);
        };
        $handle='';
        if ($profile['id']==='13' && !empty($c['handle'])) {
            $span=min(250,$h-80); $end=($h-$span)/2;
            $add($base,$stock,[$w,$w,$h,$end,$end]);
            $handle='Профиль-ручка MZ 13-01'; $add($handle,2850,[$span]);
        } elseif (!empty($profile['baseId'])) {
            $width=$w-($profile['b']-$profile['baseWidth']);
            $add($base,$stock,[$width,$width,$h]);
            $single=!empty($profile['gripLength']);
            $handle='Профиль-ручка '.agm_facade_article($profile['id']);
            $add($handle,$single?2850:5500,[$h],$single);
        } else $add($base,$stock,[$w,$w,$h,$h]);
        if ($glass) {
            $size=($w-($profile['deltaW']??$profile['delta'])).' × '.($h-($profile['deltaH']??$profile['delta'])).' × 4 мм';
            $material=$name.($ribbed?' · рифление '.($c['reed']==='vertical'?'вертикально':'горизонтально'):'');
            $key=$material.'|'.$size;
            if (!isset($glassRows[$key])) $glassRows[$key]=[$material,$size,0];
            $glassRows[$key][2]+=$qty;
        }
        $sketch=agm_facade_sketch($c,$color[1],$glass['color']??'white',$ribbed);
        $cards.='<article>'.$sketch.'<div><h3>'.$title.' · '.$qty.' шт.</h3><p>'.esc_html($base.($handle?' + '.$handle:'').' · '.$color[0]).'</p><p>Стекло: '.esc_html($name).'</p><p>Петли: '.$hinges[$c['hinge']].($pins?' · '.count($pins).' шт. на фасад, '.$side.' стойка':'').'</p></div></article>';
        if ($pins) {
            $hidden=$c['hinge']==='mf20';
            $detail=$hidden?'Обработать верхний и нижний углы: поперечины и петлевая стойка. Чертежи MODUS, стр. 68–69.':($c['hinge']==='mzf'?'Паз 41 × 10 мм, R5. Окно 19 × 16 мм. Два отверстия Ø4,3 мм с зенковкой Ø8 мм, межцентровое расстояние 28 мм. Ориентацию и привязки сверить с чертежом MODUS, стр. 66.':'Размеры выборки и креплений согласовать по монтажному чертежу выбранной петли.');
            $rows=[]; foreach ($pins as $n=>$pos) $rows[]=[$n+1,$pos,$h-$pos];
            $drilling[]='<h2>Лист присадки под петли</h2><h3>'.$title.'</h3>'.$sketch.'<p>'.esc_html($base.' · '.$color[0]).', '.$side.' стойка · '.$h.' мм · '.$qty.' шт.</p><p>'.$hinges[$c['hinge']].'</p>'.($hidden?'':agm_facade_cells(['Петля','От верха, мм','От низа, мм'],$rows)).'<p>'.$detail.'</p>';
        }
    }
    $cuts='<h2>Карта раскроя рамочного профиля</h2><p>Длина по наружной стороне. Пропил 4 мм. При длине 5500 и 6000 мм торцовка по 50 мм с каждого конца. Профиль 2850 мм без торцовки.</p>';
    $purchase=[];
    foreach ($rails as $label=>$rail) {
        $bars=agm_facade_bars($rail['parts'],$rail['stock'],$rail['single']);
        $purchase[]=[$label,$rail['stock'],$bars===null?'Требуется согласование':count($bars)];
        $cuts.='<h3>'.esc_html($label).' · '.$rail['stock'].' мм</h3>';
        if ($bars===null) { $cuts.='<p>Деталь превышает рабочую длину. Уточните раскрой.</p>'; continue; }
        $rows=[]; foreach ($bars as $i=>$bar) $rows[]=[$i+1,implode(' + ',$bar['parts']),$bar['left']];
        $cuts.=agm_facade_cells(['Палка №','Детали по порядку, мм','Остаток, мм'],$rows);
        if ($rail['single']) $cuts.='<p>Центрировать по заводскому хвату. Остаток суммарный с обеих сторон.</p>';
    }
    $bill='<h1>Ведомость материалов для изготовления фасада</h1><p>Фасады в заявке: '.$total.' шт.</p>'.$cards.'<h2>Материалы для цеха</h2><h3>Стекло в раскрой</h3>'.($glassRows?agm_facade_cells(['Стекло','Размер','Количество'],array_values($glassRows)):'<p>Стекло не заказано.</p>').'<h3>Профиль к закупке</h3>'.agm_facade_cells(['Профиль и цвет','Длина, мм','Палок, шт.'],$purchase);
    $sheets=array_merge([$order,$bill,$cuts],$drilling);
    $html='<!doctype html><html lang="ru"><meta charset="utf-8"><title>Ведомость материалов для изготовления фасада</title><style>body{margin:24px auto;padding:0 16px;max-width:900px;color:#20333a;font:16px/1.45 Arial}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ccc;padding:6px;text-align:left}article{display:flex;align-items:center;gap:20px}pre{white-space:pre-wrap;font:inherit}section{margin-bottom:40px}@page{size:A4;margin:14mm}@media print{button{display:none}section+section{break-before:page}body.single section:not(.chosen){display:none}body.single section.chosen{break-before:auto}tr,article{break-inside:avoid}}</style><button onclick="document.body.className=\'\';print()">Печать всего комплекта</button>';
    foreach ($sheets as $sheet) $html.='<section><button onclick="document.querySelectorAll(\'.chosen\').forEach(e=>e.classList.remove(\'chosen\'));this.parentElement.classList.add(\'chosen\');document.body.className=\'single\';print()">Печать этого листа</button>'.$sheet.'</section>';
    return $html.'</html>';
}

function agm_with_facade_attachment($p,$deliver) {
    $dir=sys_get_temp_dir().DIRECTORY_SEPARATOR.'agm-'.bin2hex(random_bytes(16));
    if (!mkdir($dir,0700)) return false;
    $doc=$dir.'/ALFAGLASS-facades.html';
    try {
        $html=agm_facade_report($p);
        return file_put_contents($doc,$html)===strlen($html) && $deliver([$doc]);
    } catch (Throwable $error) { return false; }
    finally { if (is_file($doc)) unlink($doc); rmdir($dir); }
}
