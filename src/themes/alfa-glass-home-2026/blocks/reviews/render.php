<?php
$classes = isset($block['className']) ? $block['className'] : '';

$title = get_field('title') ? get_field('title') : 'Отзывы клиентов';
$img = wp_get_attachment_image_url(get_field('img'),'full');
$reviews = get_field('reviews');
$archive_link = get_field('archive_link');
$archive_link_name = get_field('archive_link_name') ? get_field('archive_link_name') : 'Смотреть все отзывы';

?>
<?php if(!empty($reviews)) { ?>
    <div class="reviews-block <?=$classes?>">
        <div class="title-holder">
            <h2 class="main-title"><?=$title?></h2>
            <?php if(!empty($archive_link)) { ?>
                <a href="<?=$archive_link?>" class="default-link-second"><?=$archive_link_name?></a>
            <?php } ?>
        </div>
        <div class="wrapper">
            <?php if(!empty($img)) { ?>
                <div class="block-img"><img src="<?=$img?>" alt="" loading="lazy"></div>
            <?php } ?>
            <div class="right-side">
                <?php foreach(array_slice($reviews,0,3) as $item) {
                    $title = $item->post_title;
                    $date = get_field('date',$item);
                    $text = get_field('review_text',$item);
                    $count_stars = get_field('count_stars',$item);
                ?>
                    <div class="review-item">
                        <div class="review-item__top">
                            <div class="review-item__left">
                                <div class="review-item__name white-black"><?=$title?></div>
                                <?php if(!empty($date)) { ?>
                                    <div class="review-item__date"><?=$date?></div>
                                <?php } ?>
                            </div>
                            <div class="stars">
                                <div class="star<?php if($count_stars >= 1) { ?> active<?php } ?>"><img src="<?=get_template_directory_uri().'/assets/images/starFilled.svg'?>" alt=""></div>
                                <div class="star<?php if($count_stars >= 2) { ?> active<?php } ?>"><img src="<?=get_template_directory_uri().'/assets/images/starFilled.svg'?>" alt=""></div>
                                <div class="star<?php if($count_stars >= 3) { ?> active<?php } ?>"><img src="<?=get_template_directory_uri().'/assets/images/starFilled.svg'?>" alt=""></div>
                                <div class="star<?php if($count_stars >= 4) { ?> active<?php } ?>"><img src="<?=get_template_directory_uri().'/assets/images/starFilled.svg'?>" alt=""></div>
                                <div class="star<?php if($count_stars > 4) { ?> active<?php } ?>"><img src="<?=get_template_directory_uri().'/assets/images/starFilled.svg'?>" alt=""></div>
                            </div>
                        </div>
                        <?php if(!empty($text)) { ?>
                            <div class="review-item__text"><?=$text?></div>
                        <?php } ?>
                    </div>
                <?php } ?>
            </div>
        </div>
        <?php if(!empty($archive_link)) { ?>
            <a href="<?=$archive_link?>" class="default-link-second hidden-link" style="display:none"><?=$archive_link_name?></a>
        <?php } ?>
    </div>
<?php } ?>