<?php
$classes = isset($block['className']) ? $block['className'] : '';

$title = get_field('title');
$works = get_field('works');
$archive_link = get_field('archive_link');
$archive_link_name = get_field('archive_link_name') ? get_field('archive_link_name') : 'Смотреть все изделия';

?>
<?php if(!empty($works)) { ?>
    <div class="works-block <?=$classes?>">
        <div class="title-holder">
            <?php if(!empty($title)) { ?>
                <h2 class="main-title"><?=$title?></h2>
            <?php } ?>
            <?php if(!empty($archive_link)) { ?>
                <a href="<?=$archive_link?>" class="default-link-second"><?=$archive_link_name?></a>
            <?php } ?>
        </div>
        <div class="nav-holder">
            <div class="works">
                <?php foreach($works as $key => $item) {
                    $name = $item->post_title;
                    $desc = get_field('desc',$item);
                    $link = get_the_permalink($item);
                    $img = get_the_post_thumbnail_url($item);
                ?>
                    <div class="work-item<?php if($key <= 0) {?> active<?php } ?>" data-active="<?=$key?>">
                        <?php if(!empty($img)) { ?>
                            <div class="work-item__bg"><img src="<?=$img?>" alt=""></div>
                        <?php } ?>
                        <div class="work-item__content">
                            <div class="work-item__left">
                                <div class="work-item__title white-black"><?=$name?></div>
                                <?php if(!empty($desc)) { ?>
                                    <div class="work-item__desc gray-invert"><?=$desc?></div>
                                <?php } ?>
                            </div>
                            <!-- <a href="<?=$link?>" class="default-link">Подробнее</a> -->
                        </div>
                    </div>
                <?php } ?>
            </div>
            <div class="swiper">
                <div class="swiper-wrapper">
                    <?php foreach($works as $key => $item) {
                        $name = $item->post_title;
                        $desc = get_field('desc',$item);
                        $link = get_the_permalink($item);
                        $img = get_the_post_thumbnail_url($item);
                    ?>
                        <div class="swiper-slide border-inverted" data-item="<?=$key?>">
                            <div class="work-item">
                                <?php if(!empty($img)) { ?>
                                    <div class="work-item__bg"><img src="<?=$img?>" alt=""></div>
                                <?php } ?>
                            </div>
                        </div>
                    <?php } ?>
                </div>
            </div>
            <?=slider_nav()?>
        </div>
        <?php if(!empty($archive_link)) { ?>
            <a href="<?=$archive_link?>" class="default-link-second hidden"><?=$archive_link_name?></a>
        <?php } ?>
    </div>
<?php } ?>