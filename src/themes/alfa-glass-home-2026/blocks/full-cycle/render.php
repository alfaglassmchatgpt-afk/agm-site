<?php
$classes = isset($block['className']) ? $block['className'] : '';

$title = get_field('title');
$steps = get_field('steps');

?>
<?php if(!empty($steps)) { ?>
    <div class="full-cycle-block <?=$classes?>">
        <div class="title-holder">
            <?php if(!empty($title)) { ?>
                <h2 class="main-title"><?=$title?></h2>
            <?php } ?>
            <div class="default-link-second" data-src="modal-callback">Заказать консультацию</div>
        </div>
        <div class="steps">
            <?php foreach($steps as $key => $item) {
                $step_name = $item['step_name'];
                $step_desc = $item['step_desc'];
                $counter = ++$key;
            ?>
                <div class="step-item">
                    <div class="counter">0<?=$key?></div>
                    <?php if(!empty($step_name)) { ?>
                        <div class="step-item__name white-semiblack"><?=$step_name?></div>
                    <?php } ?>
                    <?php if(!empty($step_desc)) { ?>
                        <div class="step-item__desc gray-invert"><?=$step_desc?></div>
                    <?php } ?>
                </div>
            <?php } ?>
        </div>
    </div>
<?php } ?>