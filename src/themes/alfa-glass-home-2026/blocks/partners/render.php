<?php
$classes = isset($block['className']) ? $block['className'] : '';

$title = get_field('title');
$partners = get_field('partners');
$dark = get_field('parnters_dark');

?>
<?php if(!empty($partners)) { ?>
    <div class="partners-block <?=$classes?>">
        <?php if(!empty($title)) { ?>
            <h2 class="main-title"><?=$title?></h2>
        <?php } ?>
        <div class="partners">
            <?php foreach($partners as $item) { ?>
                <div class="partner-item">
                    <img src="<?=wp_get_attachment_image_url($item,'full')?>" alt="" loading="lazy">
                </div>
            <?php } ?>
        </div>
         <div class="partners dark">
            <?php foreach($dark as $item) { ?>
                <div class="partner-item">
                    <img src="<?=wp_get_attachment_image_url($item,'full')?>" alt="" loading="lazy">
                </div>
            <?php } ?>
        </div>
    </div>
<?php } ?>