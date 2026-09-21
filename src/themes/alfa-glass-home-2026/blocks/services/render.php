<?php
$classes = isset($block['className']) ? $block['className'] : '';

$title = get_field('title');
$services = get_field('services');
$main_service = get_field('main_service');
$archive_link = get_field('archive_link');
$archive_link_name = get_field('archive_link_name') ? get_field('archive_link_name') : 'Смотреть все';

?>
<?php if(!empty($services)) { ?>
    <div class="services-block <?=$classes?>">
        <div class="title-holder">
            <?php if(!empty($title)) { ?>
                <h2 class="main-title"><?=$title?></h2>
            <?php } ?>
            <?php if(!empty($archive_link)) { ?>
                <a href="<?=$archive_link?>" class="default-link-second"><?=$archive_link_name?></a>
            <?php } ?>
        </div>
        <div class="wrapper">
            <div class="services">
                <?php foreach($services as $item) {
                    $name = $item->post_title;
                    $price_from = get_field('price_from',$item) ? get_field('price_from',$item) : 'Подробнее';
                    $short_desc = get_field('short_desc',$item);
                    $link = get_the_permalink($item);
                    $img = get_the_post_thumbnail_url($item);
                ?>
                    <a href="<?=$link?>" class="service-item">
                        <?php if(!empty($img)) { ?>
                            <div class="service-img"><img src="<?=$img?>" alt="<?=$name?>"></div>
                        <?php } ?>
                        <div class="service-item__content">
                            <div class="service-item__name white-black"><?=$name?></div>
                            <?php if(!empty($short_desc)) { ?>
                                <div class="service-item__desc gray-invert"><?=$short_desc?></div>
                            <?php } ?>
                            <div class="default-btn">
                                <p><?=$price_from?></p>
                            </div>
                        </div>
                    </a>
                <?php } ?>
            </div>
            <div class="main-service">
                <?php foreach($main_service as $item) {
                    $name = $item->post_title;
                    $price_from = get_field('price_from',$item) ? get_field('price_from',$item) : 'Подробнее';
                    $short_desc = get_field('short_desc',$item);
                    $link = get_the_permalink($item);
                    $img = get_the_post_thumbnail_url($item);
                ?>
                    <a href="<?=$link?>" class="service-item">
                        <?php if(!empty($img)) { ?>
                            <div class="service-img"><img src="<?=$img?>" alt="<?=$name?>"></div>
                        <?php } ?>
                        <div class="service-item__content">
                            <div class="service-item__name white-black"><?=$name?></div>
                            <?php if(!empty($short_desc)) { ?>
                                <div class="service-item__desc gray-invert"><?=$short_desc?></div>
                            <?php } ?>
                            <div class="default-btn">
                                <p><?=$price_from?></p>
                            </div>
                        </div>
                    </a>
                <?php } ?>
            </div>
        </div>
        <?php if(!empty($archive_link)) { ?>
            <a href="<?=$archive_link?>" class="default-link-second hidden"><?=$archive_link_name?></a>
        <?php } ?>
    </div>
<?php } ?>