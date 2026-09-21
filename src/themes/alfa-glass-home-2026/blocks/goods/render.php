<?php
$classes = isset($block['className']) ? $block['className'] : '';

$title = get_field('title') ? get_field('title') : 'Готовые изделия';
$cats = get_field('cats');
$archive_link = get_field('archive_link');
$archive_link_name = get_field('archive_link_name') ? get_field('archive_link_name') : 'Смотреть все изделия';

?>
<?php if(!empty($cats)) { ?>
    <div class="goods-block <?=$classes?>">
        <div class="title-holder">
            <h2 class="main-title"><?=$title?></h2>
            <?php if(!empty($archive_link)) { ?>
                <a href="<?=$archive_link?>" class="default-link-second"><?=$archive_link_name?></a>
            <?php } ?>
        </div>
        <div class="wrapper">
            <div class="left-side-container">
                <div class="left-side swiper">
                    <div class="left-side-wrapper swiper-wrapper">
                        <?php foreach($cats as $key => $cat) {
                            $name = $cat['cat_name'];
                            $main_img = wp_get_attachment_image_url($cat['main_img'],'full');
                        ?>
                            <div class="swiper-slide">
                                <div class="cat-item__wrapper">
                                    <div class="cat-item">
                                        <?php if(!empty($main_img)) { ?>
                                            <div class="cat-item__thumb"><img src="<?=$main_img?>" alt="" loading="lazy"></div>
                                        <?php } ?>
                                        <div class="cat-item__name white-black"><?=$name?></div>
                                    </div>
                                </div>
                            </div>
                        <?php } ?>
                    </div>
                </div>
            </div>
            <div class="right-side swiper">
                <div class="right-side-wrapper swiper-wrapper">
                    <?php foreach($cats as $key => $cat) {
                        $main_img = wp_get_attachment_image_url($cat['main_img'],'full');
                        $desc = $cat['desc'];
                    ?>
                        <div class="swiper-slide<?php if($key <= 0) { ?> first<?php } ?><?php if(count($cats) === $key + 1) { ?> last<?php } ?>">
                            <div class="right-item">
                                <?php if(!empty($main_img)) { ?>
                                    <div class="right-item__img"><img src="<?=$main_img?>" alt="" loading="lazy"></div>
                                <?php } ?>
                                <div class="right-item__bot">
                                    <?php if(!empty($desc)) { ?>
                                        <div class="right-item__desc"><?=$desc?></div>
                                    <?php } ?>
                                    <!-- <a href="" class="link">
                                        Подробнее
                                        <div class="icon">
                                            <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3.7125 4.773L0 1.0605L1.0605 0L5.8335 4.773L1.0605 9.546L0 8.4855L3.7125 4.773Z" fill="#1B8CE7" />
                                            </svg>
                                        </div>
                                    </a> -->
                                </div>
                            </div>
                        </div>
                    <?php } ?>
                </div>
            </div>
        </div>
        <div class="mobile-wrapper">
            <?php foreach($cats as $cat) {
                $name = $cat['cat_name'];
                $img = wp_get_attachment_image_url($cat['main_img'],'full');
                $desc = $cat['desc'];
            ?>
                <div class="mobile-item-wrapper">
                    <div class="mobile-item toggle-item-second">
                        <div class="mobile-item__top toggler">
                            <?php if(!empty($img)) { ?>
                                <div class="mobile-thumb"><img src="<?=$img?>" alt="" loading="lazy"></div>
                            <?php } ?>
                            <div class="mobile-name white-black"><?=$name?></div>
                        </div>
                        <div class="mobile-content toggle-content" style="display:none">
                            <div class="mobile-img"><img src="<?=$img?>" alt="" loading="lazy"></div>
                            <div class="mobile-desc"><?=$desc?></div>
                            <div class="mobile-link">
                                Подробнее
                                <div class="icon">
                                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3.7125 4.773L0 1.0605L1.0605 0L5.8335 4.773L1.0605 9.546L0 8.4855L3.7125 4.773Z" fill="#1B8CE7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <?php } ?>
        </div>
    </div>
<?php } ?>