<?php
$classes = isset($block['className']) ? $block['className'] : '';

$title = get_field('title');
$teams = get_field('teams');

?>
<?php if(!empty($teams)) { ?>
    <div class="teams-block container-block <?=$classes?>">
        <?php if(!empty($title)) { ?>
            <h2 class="main-title"><?=$title?></h2>
        <?php } ?>
        <div class="teams-holder nav-holder">
            <div class="teams swiper">
                <div class="teams-wrapper swiper-wrapper">
                    <?php foreach($teams as $item) {
                        $name = $item->post_title;
                        $img = get_the_post_thumbnail_url($item);
                        $team_post = get_field('team_post',$item);
                    ?>
                        <div class="swiper-slide">
                            <div class="team-item">
                                <?php if(!empty($img)) { ?>
                                    <div class="team-item__img"><img src="<?=$img?>" alt="" loading="lazy"></div>
                                <?php } ?>
                                <div class="team-item__content">
                                    <div class="team-item__name white-semiblack"><?=$name?></div>
                                    <?php if(!empty($team_post)) { ?>
                                        <div class="team-item__post gray-invert"><?=$team_post?></div>
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