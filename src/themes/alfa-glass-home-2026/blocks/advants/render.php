<?php
$classes = isset($block['className']) ? $block['className'] : '';

$bg = get_field('bg');
$label = get_field('label');
$title = get_field('title');
$advants = get_field('advants');

?>
<?php if(!empty($advants)) { ?>
    <div class="advants-block alignfull <?=$classes?>">
        <?php if(!empty($bg)) { ?>
            <div class="advants-bg">
                <video src="<?=$bg?>" muted autoplay loop playsinline></video>
            </div>
        <?php } ?>
        <div class="container">
            <div class="wrapper">
                <div class="top">
                    <div class="top-top">
                        <?php if(!empty($label)) { ?>
                            <div class="block-label"><?=$label?></div>
                        <?php } ?>
                        <div class="link" data-src="modal-callback">Заказать консультацию</div>
                    </div>
                    <?php if(!empty($title)) { ?>
                        <h2 class="title"><?=$title?></h2>
                    <?php } ?>
                </div>
                <div class="advants">
                    <?php foreach($advants as $item) { ?>
                        <div class="advant-item"><?=$item['advant']?></div>
                    <?php } ?>
                </div>
            </div>
        </div>
    </div>
<?php } ?>