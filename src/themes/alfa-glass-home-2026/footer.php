<?php
$socs = get_field('socs_footer', 'option');
$logo = wp_get_attachment_image_url(get_field('logo_footer','option'),'full');
$logo_inverted = wp_get_attachment_image_url(get_field('logo_footer_inverted','option'),'full');
$rights = get_field('rights','option');
$addr = get_field('addr','option');
$phone = get_field('phone','option');
$email = get_field('email','option');
?>
<?= alfa_modal('main-form-modal', get_theme_mod('main_form'))?>
<?= alfa_modal('consalt-form-modal', get_theme_mod('consalt_form'))?>
<div class="modal" id="cfr-modal-form">
    <div class="modal__dialog">
		<span class="close">
			<svg width="22" height="22" viewBox="0 0 22 22" fill="none">
				<path d="M1 1L11 11M21 21L11 11M11 11L21 1L1 21" stroke="black" stroke-width="1.6"></path>
			</svg>
		</span>
		<div class="modal__content">
			
        <?php echo do_shortcode('[contact-form-7 id="fe48e86" title="Основная форма завки"]') ?>

		</div>
	</div>
</div>
<footer id="footer" class="footer">
    <?php if(!is_front_page()) { ?>
        <div class="container-fluid">
            <div class="block__default cta" style="background: linear-gradient(180deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.40) 83.08%), url(<?=get_theme_mod('consalt_setting_url')?>)">
                <div class="container">
                    <div class="row row_first">
                        <div class="col-12">
                            <div class="small__title"><?=get_theme_mod('consalt_subtitle')?></div>
                        </div>
                    </div>
                    <div class="row row_second">
                        <div class="col-3 col-lg-12">
                            <p class="section__title"><?=get_theme_mod('consalt_title')?></p>
                        </div>
                        <div class="col-4 offset-1 col-lg-5 offset-lg-0 col-sm-12">
                            <div class="txt"><?=get_theme_mod('consalt_desc')?></div>
                        </div>
                        <div class="col-3 offset-1 offset-lg-3 col-lg-4 col-sm-12 offset-sm-0" >
                            <button class="btn btn__light btn__uppercase btn__hover" data-toggle="popup-open" data-modal-target="consalt-form-modal"><span><?=get_theme_mod('consalt_btn_text')?></span>
                                <span class="item__arrow">
                                    <span></span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    <?php } ?>
    <div class="container">
        <div class="footer-top">
            <?php if(!empty($logo) && !empty($logo_inverted)) { ?>
                <div class="logo-wrapper image-inverted-holder">
                    <a href="/" class="footer-logo light-image-invert"><img src="<?=$logo?>" alt=""></a>
                    <a href="/" class="footer-logo dark-image-invert" style="display:none"><img src="<?=$logo_inverted?>" alt=""></a>
                </div>
            <?php } ?>
            <div class="footer-contacts">
                <?php if(!empty($addr)) { ?>
                    <div class="footer-item white-semiblack"><?=$addr?></div>
                <?php } ?>
                <?php if(!empty($phone)) { ?>
                    <a href="<?=format($phone)?>" class="footer-item phone-item white-semiblack"><?=$phone?></a>
                <?php } ?>
                <?php if(!empty($email)) { ?>
                    <a href="mailto:<?=$email?>" class="footer-item white-semiblack"><?=$email?></a>
                <?php } ?>
            </div>
            <?php if(!empty($socs)) { ?>
                <div class="socs-wrapper">
                    <?php foreach($socs as $soc) { ?>
                        <a href="<?=$soc['socs_link']?>" target="_blank" class="socs-wrapper__item"><img src="<?=wp_get_attachment_image_url($soc['socs_icon'],'full')?>" alt=""></a>
                    <?php } ?>
                </div>
            <?php } ?>
        </div>
        <div class="footer-bottom">
            <div class="menu-wrapper small-menu">
                <div class="menu-wrapper__title">Разделы</div>
                <?php
                    wp_nav_menu( [
                        'theme_location'  => 'footer_first',
                        'container'       => false,
                        'menu'            => '',
                        'menu_class'      => 'footer_menu',
                        'echo'            => true,
                        'fallback_cb'     => 'wp_page_menu',
                        'items_wrap'      => '<ul id="%1$s" class="%2$s">%3$s</ul>',
                        'depth'           => 2,
                    ] );
                ?>
            </div>
            <div class="menu-wrapper">
                <div class="menu-wrapper__title">Услуги</div>
                <?php
                    wp_nav_menu( [
                        'theme_location'  => 'footer_second',
                        'container'       => false,
                        'menu'            => '',
                        'menu_class'      => 'footer_menu',
                        'echo'            => true,
                        'fallback_cb'     => 'wp_page_menu',
                        'items_wrap'      => '<ul id="%1$s" class="%2$s">%3$s</ul>',
                        'depth'           => 2,
                    ] );
                ?>
            </div>
            <div class="menu-wrapper small-menu toggle-item">
                <div class="menu-wrapper__title toggler">
                    Разделы
                    <div class="toggle-icon">
                        <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.4229 1.44755C11.7484 1.1164 11.7484 0.579506 11.4229 0.248359C11.0975 -0.0827865 10.5698 -0.0827865 10.2444 0.248359L5.83366 4.73649L1.42292 0.248359C1.0975 -0.0827869 0.569836 -0.082787 0.244419 0.248359C-0.0809975 0.579506 -0.0809975 1.1164 0.244419 1.44755L5.24441 6.53526C5.56985 6.86641 6.09748 6.86641 6.42292 6.53526L11.4229 1.44755Z" fill="black" />
                        </svg>
                    </div>
                </div>
                <?php
                    wp_nav_menu( [
                        'theme_location'  => 'footer_first',
                        'container'       => false,
                        'menu'            => '',
                        'menu_class'      => 'footer_menu toggle-content',
                        'echo'            => true,
                        'fallback_cb'     => 'wp_page_menu',
                        'items_wrap'      => '<ul id="%1$s" class="%2$s" style="display:none">%3$s</ul>',
                        'depth'           => 2,
                    ] );
                ?>
            </div>
            <div class="menu-wrapper toggle-item">
                <div class="menu-wrapper__title toggler">
                    Услуги
                    <div class="toggle-icon">
                        <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.4229 1.44755C11.7484 1.1164 11.7484 0.579506 11.4229 0.248359C11.0975 -0.0827865 10.5698 -0.0827865 10.2444 0.248359L5.83366 4.73649L1.42292 0.248359C1.0975 -0.0827869 0.569836 -0.082787 0.244419 0.248359C-0.0809975 0.579506 -0.0809975 1.1164 0.244419 1.44755L5.24441 6.53526C5.56985 6.86641 6.09748 6.86641 6.42292 6.53526L11.4229 1.44755Z" fill="black" />
                        </svg>
                    </div>
                </div>
                <?php
                    wp_nav_menu( [
                        'theme_location'  => 'footer_second',
                        'container'       => false,
                        'menu'            => '',
                        'menu_class'      => 'footer_menu toggle-content',
                        'echo'            => true,
                        'fallback_cb'     => 'wp_page_menu',
                        'items_wrap'      => '<ul id="%1$s" class="%2$s" style="display:none">%3$s</ul>',
                        'depth'           => 2,
                    ] );
                ?>
            </div>
        </div>
        <div class="footer-primary">
            <?php if(!empty($rights)) { ?>
                <div class="footer-primary__rights"><?=$rights?></div>
            <?php } ?>
            <div class="developer">Сайт разработан <a href="seolebedev.ru" class="developer">SEO Lebedev</a></div>
        </div>
    </div>
</footer>
<script src="https://cdn.jsdelivr.net/npm/swiper@14.0.1/swiper-bundle.min.js"></script>


<!--------------->
<div class="w-multibox _closed">
    <div class="w-multibox__block">
        <div class="w-multibox__items-outer">

            <?php if($mail):?>
            <div class="w-multibox__item">
                <a class="w-multibox__link" rel="nofollow noopener" href="mailto:<?php echo $mail;?>" target="_blank">

                    <span class="w-multibox__a-text">Написать нам на почту</span>
                    <i class="w-multibox__icon">
                        <svg width="28px" height="28px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 64H48C21.5 64 0 85.5 0 112v288c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM48 96h416c8.8 0 16 7.2 16 16v41.4c-21.9 18.5-53.2 44-150.6 121.3-16.9 13.4-50.2 45.7-73.4 45.3-23.2.4-56.6-31.9-73.4-45.3C85.2 197.4 53.9 171.9 32 153.4V112c0-8.8 7.2-16 16-16zm416 320H48c-8.8 0-16-7.2-16-16V195c22.8 18.7 58.8 47.6 130.7 104.7 20.5 16.4 56.7 52.5 93.3 52.3 36.4.3 72.3-35.5 93.3-52.3 71.9-57.1 107.9-86 130.7-104.7v205c0 8.8-7.2 16-16 16z"></path></svg>                                                
                    </i>        
                </a>
            </div>  
            <?php endif;?>       
            
  
            <div class="w-multibox__item">
                <?php /*<a class="w-multibox__link" href="https://example.invalid/contact-disabled" target="_blank">                    */?>
                <a class="w-multibox__link" href="https://example.invalid/contact-disabled" target="_blank">                    
                    <span class="w-multibox__a-text">Написать нам в MAX</span>
                    <i class="w-multibox__icon" style="padding: 2px !important;">
<?php
$max_icon_path = get_template_directory() . '/assets/icons/max.svg';
if ( file_exists( $max_icon_path ) ) {
	echo alfa_sanitize_inline_svg( file_get_contents( $max_icon_path ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
}
?>
                    </i>        
                    <?php /*
                    <i class="w-multibox__icon" >
<svg width="28px" height="28px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg>                      
                    </i>   */?>     
                </a>
            </div>     

            <div class="w-multibox__item">
                <?php /*<a class="w-multibox__link" href="https://example.invalid/contact-disabled" target="_blank">                    */?>
                <a class="w-multibox__link" href="https://example.invalid/contact-disabled " target="_blank">                    
                    <span class="w-multibox__a-text">Написать нам в Телеграм</span>
                    <i class="w-multibox__icon" >
<svg width="30" height="30px" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg" fill="none"><path stroke="#ffffff" stroke-width="12" d="M23.073 88.132s65.458-26.782 88.16-36.212c8.702-3.772 38.215-15.843 38.215-15.843s13.621-5.28 12.486 7.544c-.379 5.281-3.406 23.764-6.433 43.756-4.54 28.291-9.459 59.221-9.459 59.221s-.756 8.676-7.188 10.185c-6.433 1.509-17.027-5.281-18.919-6.79-1.513-1.132-28.377-18.106-38.214-26.404-2.649-2.263-5.676-6.79.378-12.071 13.621-12.447 29.891-27.913 39.728-37.72 4.54-4.527 9.081-15.089-9.837-2.264-26.864 18.483-53.35 35.835-53.35 35.835s-6.053 3.772-17.404.377c-11.351-3.395-24.594-7.921-24.594-7.921s-9.08-5.659 6.433-11.693Z"/></svg>

                    </i>        
                    <?php /*
                    <i class="w-multibox__icon" >
<svg width="28px" height="28px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg>                      
                    </i>   */?>     
                </a>
            </div>                 
           
            <?php 
            $phone = get_theme_mod('contact_phone');
            if($phone):?>
            <div class="w-multibox__item">
                
                
                <?php echo '<a class="w-multibox__link" href="tel:'.alfa_format_phone($phone).'">'?>
        
                
                    <span class="w-multibox__a-text">Позвонить нам по телефону</span>
                    <i class="w-multibox__icon" >
                        <svg width="28px" height="28px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M493.4 24.6l-104-24c-11.3-2.6-22.9 3.3-27.5 13.9l-48 112c-4.2 9.8-1.4 21.3 6.9 28l60.6 49.6c-36 76.7-98.9 140.5-177.2 177.2l-49.6-60.6c-6.8-8.3-18.2-11.1-28-6.9l-112 48C3.9 366.5-2 378.1.6 389.4l24 104C27.1 504.2 36.7 512 48 512c256.1 0 464-207.5 464-464 0-11.2-7.7-20.9-18.6-23.4z"></path></svg>                        
                    </i>        
                </a>
            </div>     
            <?php endif;?>          
            
            
            
        </div>
    </div>
    
    <!-- кнопка -->
    <div class="w-multibox__button">
        <div class="w-multibox__btn-name">Связаться</div>

        <div class="w-multibox__pulse"></div> 
        <div class="w-multibox__pulse"></div>   
        <div class="w-multibox__pulse _wide-pulse "></div>
        
        <div class="w-multibox__close">
            <svg class="s52_multiparent_frame_btn_svg_1045 s52_1045-close" viewBox="0 0 132 132" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M128.95 17.15C132.844 13.2564 132.844 6.94361 128.95 3.05C125.056 -0.843608 118.744 -0.843607 114.85 3.05L74.4853 43.4147C69.799 48.101 62.201 48.101 57.5147 43.4147L17.15 3.05001C13.2564 -0.843597 6.94361 -0.843608 3.05 3.05C-0.843608 6.94361 -0.843607 13.2564 3.05 17.15L43.4147 57.5147C48.101 62.201 48.101 69.799 43.4147 74.4853L3.05001 114.85C-0.843597 118.744 -0.843608 125.056 3.05 128.95C6.94361 132.844 13.2564 132.844 17.15 128.95L57.5147 88.5853C62.201 83.899 69.799 83.899 74.4853 88.5853L114.85 128.95C118.744 132.844 125.056 132.844 128.95 128.95C132.844 125.056 132.844 118.744 128.95 114.85L88.5853 74.4853C83.899 69.799 83.899 62.201 88.5853 57.5147L128.95 17.15Z" fill="white"></path>
            </svg>            
        </div>        
    </div>
    
</div>
<!--------------->



<?php get_template_part('modals')?>
<?php if(!is_front_page()) { ?>
    </div>
<?php } ?>

<?php wp_footer(); ?>
<script defer src="<?php echo esc_url( get_template_directory_uri() . '/js/killbot.js' ); ?>?ver=<?php echo esc_attr( _S_VERSION ); ?>"></script>
</body>
</html>
