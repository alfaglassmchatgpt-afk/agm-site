<?php
/** Shared material layout: gallery, choices, calculation sidebar. */
defined('ABSPATH') || exit;
function agm_order_material_layout($html, $slug) {
    return preg_replace_callback('~<main\b[^>]*>.*?</main>~s', function ($match) use ($slug) {
        $doc = new DOMDocument('1.0', 'UTF-8');
        $previous = libxml_use_internal_errors(true);
        $doc->loadHTML('<?xml encoding="UTF-8">' . $match[0], LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);
        $xp = new DOMXPath($doc);
        $byClass = function ($class, $root = null) use ($xp) {
            return $xp->query('.//*[contains(concat(" ", normalize-space(@class), " "), " ' . $class . ' ")]', $root)->item(0);
        };
        $main = $doc->getElementsByTagName('main')->item(0);
        $order = $doc->getElementById('material-request');
        $hero = $byClass('gc-product', $main);
        if (!$hero) {
            if ($slug !== 'zerkalo-gezella') { throw new RuntimeException('Material card requires a gallery and information column: ' . $slug); }
            // The two-way mirror has no product photo: show an explicitly labelled diagram.
            $heading = $main->getElementsByTagName('h1')->item(0);
            $hero = $heading->parentNode;
            $info = $doc->createElement('div');
            while ($hero->firstChild) { $info->appendChild($hero->firstChild); }
            $visual = $doc->createElement('div');
            $visual->setAttribute('class', 'agm-material-diagram');
            $visual->setAttribute('role', 'img');
            $visual->setAttribute('aria-label', 'Условная схема двухстороннего зеркала: отражение и частичное пропускание света');
            $visual->appendChild($doc->createElement('span', 'Свет → │ →'));
            $visual->appendChild($doc->createElement('p', 'Двухстороннее зеркало'));
            $visual->appendChild($doc->createElement('small', 'Условная схема, не фотография образца'));
            $hero->appendChild($visual);
            $hero->appendChild($info);
        }
        $hero->setAttribute('class', 'gc-product product-head');
        $columns = [];
        foreach ($hero->childNodes as $node) { if ($node instanceof DOMElement) { $columns[] = $node; } }
        if (count($columns) !== 2 || !$order) { throw new RuntimeException('Material layout requires two hero columns and one configurator.'); }
        $info = $columns[1];
        $info->setAttribute('class', 'product-info');
        foreach (iterator_to_array($xp->query('.//a[@href="#material-request"]', $info)) as $link) { $link->parentNode->removeChild($link); }
        $choices = $byClass('product-info', $order);
        $specs = $byClass('gc-specs', $info);
        if ($specs) { $info->removeChild($specs); }
        while ($choices->firstChild) { $info->appendChild($choices->firstChild); }
        $hint = $doc->createElement('p', 'Размеры можно указать после добавления.');
        $hint->setAttribute('class', 'small muted');
        $info->appendChild($hint);
        if ($specs) {
            $details = $doc->createElement('details');
            $details->setAttribute('class', 'agm-material-specs');
            $details->appendChild($doc->createElement('summary', 'Характеристики материала'));
            $details->appendChild($specs);
            $info->appendChild($details);
        }
        $content = $byClass('content', $order);
        $content->replaceChild($hero, $choices);
        $oldTitle = $doc->getElementById('operations-title');
        $newTitle = $doc->createElement('h2', $oldTitle->textContent);
        $newTitle->setAttribute('id', 'operations-title');
        $oldTitle->parentNode->replaceChild($newTitle, $oldTitle);
        $order->setAttribute('class', 'agm-order agm-material-layout container');
        $title = $xp->query('./h2', $order)->item(0);
        if ($title) { $order->removeChild($title); }
        $main->insertBefore($order, $byClass('ds-breadcrumb', $main)->nextSibling);
        foreach (iterator_to_array($main->childNodes) as $node) {
            if ($node instanceof DOMElement && $node !== $order && $node !== $byClass('ds-breadcrumb', $main)) {
                $content->appendChild($node);
            }
        }
        return $doc->saveHTML($main);
    }, $html, 1);
}
