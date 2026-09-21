<?php
$classes = isset($block['className']) ? $block['className'] : '';

$title = get_field('title');
$blogs = get_field('blogs');

?>
<?php if(!empty($blogs)) { ?>
    <div class="blogs-block block-container <?=$classes?>">
        <div class="title-holder">
            <?php if(!empty($title)) { ?>
                <h2 class="main-title"><?=$title?></h2>
            <?php } ?>
            <a href="/blogs" class="default-link-second">Смотреть все</a>
        </div>
        <div class="blogs">
            <?php foreach($blogs as $item) {
                $title = $item->post_title;
                $img = get_the_post_thumbnail_url($item);
                $date = get_field('date',$item);
                $duration = get_field('duration',$item);
                $short_desc = get_field('short_desc',$item);
                $link = get_the_permalink($item);
            ?>  
                <div class="blog-item">
                    <?php if(!empty($img)) { ?>
                        <div class="blog-item__img"><img src="<?=$img?>" alt="" loading="lazy"></div>
                    <?php } ?>
                    <div class="blog-item__content">
                        <div class="blog-item__top">
                            <?php if(!empty($date)) { ?>
                                <div class="blog-item__date"><?=$date?></div>
                            <?php } ?>
                            <?php if(!empty($duration)) { ?>
                                <div class="blog-item__duration"><?=$duration?></div>
                            <?php } ?>
                        </div>
                        <div class="blog-item__name white-black"><?=$title?></div>
                        <?php if(!empty($short_desc)) { ?>
                            <div class="blog-item__desc gray-invert"><?=$short_desc?></div>
                        <?php } ?>
                        <a href="<?=$link?>" class="default-btn">
                            <p>Читать</p>
                        </a>
                    </div>
                </div>
            <?php } ?>
        </div>
        <a href="/blog" class="default-link-second hidden-link">Смотреть все</a>
    </div>
<?php } ?>