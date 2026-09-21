<?php
$classes = isset($block['className']) ? $block['className'] : '';

$title = get_field('title');
$cats = get_field('cats');

?>
<?php if(!empty($cats)) { ?>
    <div class="material-cats-block <?=$classes?>">
        <?php if(!empty($title)) { ?>
            <h2 class="main-title"><?=$title?></h2>
        <?php } ?>
        <div class="tabs-holder">
            <div class="tab-btns">
                <?php foreach($cats as $key => $cat) {
                    $name = $cat->name;
                ?>
                    <div data-tab="cat-<?=$key?>" class="tab-btn<?php if($key <= 0) { ?> active<?php } ?>">
                        <p><?=$name?></p>
                    </div>
                <?php } ?>
            </div>
            <?php foreach($cats as $key => $cat) {
                $products = new WP_Query( array( 
                    'post_type' => 'materials',
                    'posts_per_page' => 4,
                    'order'   => 'ASC',
                    'tax_query' => array(
                        array(
                        'taxonomy' => 'materials_cat',
                        'terms' => $cat->term_id,
                        ),
                    )
                ));
            ?>
                <div tab-id="cat-<?=$key?>" class="tab-group<?php if($key <= 0) { ?> active<?php } ?>">
                    <?php foreach($products->posts as $item) {
                        $title = $item->post_title;
                        $price_from = get_field('price_from',$item) ? get_field('price_from',$item) : 'Подробнее';
                        $img = get_the_post_thumbnail_url($item);
                        $link_type = get_field('link_type',$item);
                        if($link_type === true && !empty(get_field('link_product',$item))) {
                            $link = get_the_permalink(get_field('link_product',$item)[0]->ID);
                        } else if(!empty(get_field('link_cat',$item))){
                            $link = get_term_link(get_field('link_cat',$item)->term_id);
                        }
                    ?>
                        <div class="material-item">
                            <?php if(!empty($img)) { ?>
                                <div class="material-item__img"><img src="<?=$img?>" alt="<?=$title?>"></div>
                            <?php } ?>
                            <div class="material-item__content">
                                <div class="material-item__name white-black"><?=$title?></div>
                                <a href="<?=$link?>" class="default-btn">
                                    <p><span class="first-span">Цена:</span><span class="second-span"><?=$price_from?></span></p>
                                </a>
                            </div>
                        </div>
                    <?php } ?>
                </div>
            <?php } ?>
        </div>
    </div>
<?php } ?>