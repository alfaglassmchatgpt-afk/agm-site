<?php
$classes = isset($block['className']) ? $block['className'] : '';

$title = get_field('title');
$cats = get_field('cats');

?>
<?php if(!empty($cats)) { ?>
    <div class="personal-style-block <?=$classes?>">
        <div class="title-holder">
            <?php if(!empty($title)) { ?>
                <h2 class="main-title"><?=$title?></h2>
            <?php } ?>
            <div class="default-link-second" data-src="modal-callback">Заказать консультацию</div>
        </div>
        <div class="cats">
            <div class="left-side">
                <?php foreach($cats as $key => $cat) {
                    $models = $cat['models'];
                ?>
                    <?php if(!empty($models)) { ?>
                        <?php foreach($models as $index => $img) { ?>
                            <div class="model-img" data-fancybox="item-<?=$key?>-<?=$index?>" data-src="<?=wp_get_attachment_image_url($img['img'],'full')?>" data-img="item-<?=$key?>-<?=$index?>"><img src="<?=wp_get_attachment_image_url($img['img'],'full');?>" alt="" loading="lazy"></div>
                        <?php } ?>
                    <?php } ?>
                <?php } ?>
            </div>
            <div class="right-side">
                <div class="models-holder">
                    <?php foreach($cats as $key => $cat) {
                        $cat_name = $cat['cat_name'];
                        $models = $cat['models'];
                    ?>
                        <div class="cat-item toggle-item">
                            <div class="cat-item__wrapper">
                                <div class="cat-item__name toggler">
                                    <p><?=$cat_name?></p>
                                    <div class="toggle-icon">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0 5.99635C0 6.35251 0.298001 6.64321 0.64688 6.64321H5.34947V11.3458C5.34947 11.6947 5.64021 11.9927 5.99635 11.9927C6.35251 11.9927 6.65053 11.6947 6.65053 11.3458V6.64321H11.3458C11.6947 6.64321 11.9927 6.35251 11.9927 5.99635C11.9927 5.64021 11.6947 5.3422 11.3458 5.3422H6.65053V0.64688C6.65053 0.298001 6.35251 0 5.99635 0C5.64021 0 5.34947 0.298001 5.34947 0.64688V5.3422H0.64688C0.298001 5.3422 0 5.64021 0 5.99635Z" fill="black" />
                                        </svg>
                                    </div>
                                </div>
                                <?php if(!empty($models)) { ?>
                                    <div class="models-content toggle-content" style="display:none">
                                        <div class="models-images">
                                            <?php foreach($models as $index => $item) {
                                                $model_img = wp_get_attachment_image_url($item['img'],'full');
                                            ?>
                                                <div class="model-mobile-img" data-mobile-img="item-<?=$key?>-<?=$index?>"><img src="<?=$model_img?>" alt="" loading="lazy"></div>
                                            <?php } ?>
                                        </div>
                                        <div class="models">
                                            <?php foreach($models as $index => $item) {
                                                $model_name = $item['name'];
                                            ?>
                                                <div class="model-item" data-item="item-<?=$key?>-<?=$index?>"><?=$model_name?></div>
                                            <?php } ?>
                                        </div>
                                    </div>
                                <?php } ?>
                            </div>
                        </div>
                    <?php } ?>
                </div>
                <div class="config-holder">
                    <div class="config-holder__title">Выбранная конфигурация</div>
                    <div class="choised">
                        <div class="choised-name">
                            <p class="white-black"></p>
                            <span class="white-black"></span>
                        </div>
                        <div class="choise-drop">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0.163206 9.83677C0.383956 10.0512 0.749769 10.0512 0.964213 9.83677L5.00078 5.8002L9.03734 9.83677C9.25182 10.0512 9.62394 10.0575 9.83836 9.83677C10.0528 9.61605 10.0528 9.25653 9.83836 9.04211L5.80179 4.99921L9.83836 0.962636C10.0528 0.748192 10.0591 0.382379 9.83836 0.167936C9.61759 -0.052814 9.25182 -0.052814 9.03734 0.167936L5.00078 4.20451L0.964213 0.167936C0.749769 -0.052814 0.377649 -0.0591211 0.163206 0.167936C-0.0512369 0.388686 -0.0512369 0.748192 0.163206 0.962636L4.19978 4.99921L0.163206 9.04211C-0.0512369 9.25653 -0.0575443 9.62235 0.163206 9.83677Z" fill="black" />
                            </svg>
                        </div>
                    </div>
                    <div class="config-holder__bot">
                        <!-- <div class="files">
                            <?php foreach($cats as $key => $cat) {
                                $models = $cat['models'];
                            ?>
                                <?php if(!empty($models)) { ?>
                                    <?php foreach($models as $index => $file) {
                                        if($file['file']) {
                                            $size = ($file['file']['filesize'] / (1024 * 1024));
                                            $size_value = 0;
                                            if($size < 1) {
                                                $size_value = number_format($size * 1000) . ' Кб';
                                            } else {
                                                $size_value = number_format($size,0). ' Мб';
                                            }
                                        }
                                    ?>
                                        <div class="model-file" data-file="item-<?=$key?>-<?=$index?>">
                                            <div class="file-icon"><img src="<?=get_template_directory_uri().'/assets/images/file-icon.svg'?>" alt=""></div>
                                            <div class="model-file__right">
                                                <?php if(!empty($file['file'])) { ?>
                                                    <a href="<?=$file['file']['url']?>" target="_blank" class="file-link">Скачать файл</a>
                                                    <?php if(!empty($size_value)) { ?>
                                                        <div class="model-file__size"><?=$size_value?></div>
                                                    <?php } ?>
                                                <?php } ?>
                                            </div>
                                        </div>
                                    <?php } ?>
                                <?php } ?>
                            <?php } ?>
                        </div> -->
                        <!-- <div id="share-btn" class="share white-black">
                            Поделиться
                            <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.56216 10.2078C6.83487 10.2078 7.05753 10.0965 7.32469 9.84604L11.7162 5.69945C11.9277 5.49907 12 5.28757 12 5.1039C12 4.91468 11.9332 4.70872 11.7162 4.50279L7.32469 0.395177C7.0297 0.116883 6.84604 0 6.57327 0C6.18366 0 5.90539 0.306123 5.90539 0.679037V2.78294H5.744C1.74212 2.78294 0 5.34879 0 9.46199C0 9.94065 0.272728 10.2078 0.573284 10.2078C0.807052 10.2078 1.06308 10.1521 1.25789 9.79593C2.22635 7.9759 3.58998 7.43042 5.744 7.43042H5.90539V9.5566C5.90539 9.92948 6.18366 10.2078 6.56216 10.2078ZM6.87943 9.01116C6.83487 9.01116 6.80149 8.97772 6.80149 8.92766V6.77365C6.80149 6.64565 6.74582 6.58999 6.61782 6.58999H5.872C3.22821 6.58999 1.54174 7.50836 0.884973 8.90539C0.868273 8.94433 0.857145 8.96105 0.829313 8.96105C0.807052 8.96105 0.790352 8.94433 0.790352 8.89983C0.901672 6.27272 2.04824 3.62338 5.872 3.62338H6.61782C6.74582 3.62338 6.80149 3.56772 6.80149 3.43971V1.23005C6.80149 1.18553 6.83487 1.15213 6.88498 1.15213C6.91837 1.15213 6.95176 1.1744 6.97959 1.19666L10.9425 4.99813C10.9815 5.03713 10.9981 5.07051 10.9981 5.1039C10.9981 5.13729 10.987 5.16513 10.9425 5.20968L6.97404 8.96105C6.9462 8.99444 6.91281 9.01116 6.87943 9.01116Z" fill="black" fill-opacity="0.85" />
                            </svg>
                        </div> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
<?php } ?>