<?php
$classes = isset($block['className']) ? $block['className'] : '';

$slides = get_field('slides');

?>
<?php if(!empty($slides)) { ?>
    <div class="mainbanner-block alignfull nav-holder<?=$classes?>">
        <div class="swiper">
            <div class="swiper-wrapper">
                <?php foreach($slides as $key => $item) {
                    $bg = $item['bg'];
                    $title = $item['title'];
                    $desc = $item['desc'];
                    $chars = $item['chars'];
                    $link_name = $item['link_name'] ? $item['link_name'] : 'Смотреть каталог';
                    $link = $item['link'];
                ?>
                    <div class="swiper-slide">
                        <?php if(!empty($bg)) { ?>
                            <div class="background"><video src="<?=$bg?>" data-counter="<?=$key?>" muted playsinline loop autoplay></video></div>
                        <?php } ?>
                        <div class="slide-item">
                            <?php if(!empty($title)) { ?>
                                <?php if($key <= 0) { ?>
                                    <h1 class="page-title white-black"><?=$title?></h1>
                                <?php } else { ?>
                                    <h2 class="main-title white-black"><?=$title?></h2>
                                <?php } ?>
                            <?php } ?>
                            <?php if(!empty($desc)) { ?>
                                <div class="slide-item__desc"><?=$desc?></div>
                            <?php } ?>
                            <div class="btns">
                                <div class="default-btn lighted" data-src="modal-callback"><p>Получить расчет</p></div>
                                <?php if(!empty($link)) { ?>
                                    <a href="<?=$link?>" class="second-btn"><p><?=$link_name?></p></a>
                                <?php } ?>
                            </div>
                            <?php if(!empty($chars)) { ?>
                                <div class="slide-item__chars">
                                    <?php foreach($chars as $char) {
                                        $value = $char['value'];
                                        $name = $char['name'];
                                    ?>
                                        <div class="slide-item__char">
                                            <?php if(!empty($value)) { ?>
                                                <div class="char-value"><?=$value?></div>
                                            <?php } ?>
                                            <?php if(!empty($name)) { ?>
                                                <div class="char-name"><?=$name?></div>
                                            <?php } ?>
                                        </div>
                                    <?php } ?>
                                </div>
                            <?php } ?>
                        </div>
                    </div>
                <?php } ?>
            </div>
        </div>
        <div class="swiper-pagination"></div>
    </div>
<?php } ?>