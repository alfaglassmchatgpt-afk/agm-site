<?php
$classes = isset($block['className']) ? $block['className'] : '';

$title = get_field('title');
$desc = get_field('desc');
$achives = get_field('achives');
$form_title = get_field('form_title');
$form_desc = get_field('form_desc');

?>
<div class="about-block <?=$classes?>">
    <div class="wrapper">
        <div class="left-side">
            <?php if(!empty($title)) { ?>
                <h2 class="main-title"><?=$title?></h2>
            <?php } ?>
            <?php if(!empty($desc)) { ?>
                <div class="desc"><?=$desc?></div>
            <?php } ?>
            <?php if(!empty($achives)) { ?>
                <div class="achives">
                    <?php foreach($achives as $item) {
                        $value = $item['value'];
                        $achive = $item['achive'];    
                    ?>
                        <div class="achive-item">
                            <?php if(!empty($value)) { ?>
                                <div class="achive-value"><?=$value?></div>
                            <?php } ?>
                            <?php if(!empty($achive)) { ?>
                                <div class="achive"><?=$achive?></div>
                            <?php } ?>
                        </div>
                    <?php } ?>
                </div>
            <?php } ?>
        </div>
        <div class="right-side">
            <?php if(!empty($form_title)) { ?>
                <div class="form-title white-black"><?=$form_title?></div>
            <?php } ?>
            <?php if(!empty($form_desc)) { ?>
                <div class="form-desc"><?=$form_desc?></div>
            <?php } ?>
            <?=do_shortcode('[contact-form-7 id="575712f" title="Форма для блока: о компании"]')?>
            <div class="form-end">Ваши данные защищены и не передаются третьим лицам.</div>
        </div>
    </div>
</div>