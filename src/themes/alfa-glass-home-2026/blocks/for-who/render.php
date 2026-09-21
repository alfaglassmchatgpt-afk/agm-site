<?php
$classes = isset($block['className']) ? $block['className'] : '';

$title = get_field('title');
$planks = get_field('planks');

?>
<?php if(!empty($planks)) { ?>
    <div class="for-who-block <?=$classes?>">
        <?php if(!empty($title)) { ?>
            <h2 class="main-title"><?=$title?></h2>
        <?php } ?>
        <div class="nav-holder">
            <div class="planks swiper">
                <div class="planks-wrapper swiper-wrapper">
                    <?php foreach($planks as $item) {
                        $bg = wp_get_attachment_image_url($item['bg'],'full');
                        $name = $item['name'];
                        $desc = $item['desc'];
                        $icon = wp_get_attachment_image_url($item['icon'],'full');
                    ?>
                        <div class="swiper-slide">
                            <div class="plank-item">
                                <?php if(!empty($bg)) { ?>
                                    <div class="plank-item__bg"><img src="<?=$bg?>" alt="" loading="lazy"></div>
                                <?php } ?>
                                <div class="plank-item__content">
                                    <div class="plank-item__name white-black"><?=$name?></div>
                                    <?php if(!empty($desc)) { ?>
                                        <div class="plank-item__desc"><?=$desc?></div>
                                    <?php } ?>
                                    <?php if(!empty($icon)) { ?>
                                        <div class="plank-item__icon"><img src="<?=$icon?>" alt=""></div>
                                    <?php } ?>
                                </div>
                            </div>
                        </div>
                    <?php } ?>
                </div>
            </div>
            <?=slider_nav()?>
        </div>
    </div>
<?php } ?>