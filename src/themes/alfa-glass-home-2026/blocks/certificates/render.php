<?php
$classes = isset($block['className']) ? $block['className'] : '';

$title = get_field('title');
$certs = get_field('certs');

?>
<?php if(!empty($certs)) { ?>
    <div class="certificates-block <?=$classes?>">
        <?php if(!empty($title)) { ?>
            <h2 class="main-title"><?=$title?></h2>
        <?php } ?>
        <div class="nav-holder">
            <div class="certs swiper">
                <div class="certs-wrapper swiper-wrapper">
                    <?php foreach($certs as $cert) { ?>
                        <div class="swiper-slide">
                            <div class="cert-item" data-fancybox="certs" data-src="<?=wp_get_attachment_image_url($cert,'full')?>">
                                <img src="<?=wp_get_attachment_image_url($cert,'full')?>" alt="">
                            </div>
                        </div>
                    <?php } ?>
                </div>
            </div>
            <?=slider_nav()?>
        </div>
    </div>
<?php } ?>