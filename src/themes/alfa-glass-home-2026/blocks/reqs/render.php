<?php
$classes = isset($block['className']) ? $block['className'] : '';

$img = wp_get_attachment_image_url(get_field('img'),'full');
$title = get_field('title');
$reqs = get_field('reqs');

?>
<?php if(!empty($reqs)) { ?>
    <div class="reqs-block block-container <?=$classes?>">
        <div class="wrapper">
            <?php if(!empty($img)) { ?>
                <div class="block-img border-inverted"><img src="<?=$img?>" alt="" loading="lazy"></div>
            <?php } ?>
            <div class="right-side">
                <?php if(!empty($title)) { ?>
                    <h2 class="main-title small"><?=$title?></h2>
                <?php } ?>
                <div class="reqs">
                    <?php foreach($reqs as $item) {
                        $req_name = $item['req_name'];
                        $req_value = $item['req_value'];
                    ?>
                        <div class="req-item border-inverted">
                            <?php if(!empty($req_name)) { ?>
                                <div class="req-item__name white-black"><?=$req_name?></div>
                            <?php } ?>
                            <?php if(!empty($req_value)) { ?>
                                <div class="req-item__value white-black"><?=$req_value?></div>
                            <?php } ?>
                        </div>
                    <?php } ?>
                </div>
            </div>
        </div>
    </div>
<?php } ?>