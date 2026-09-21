<?php
$addr = get_field('addr','option');
$addr_icon = wp_get_attachment_image_url(get_field('addr_icon','option'),'full');
$phone = get_field('phone','option');
$phone_icon = wp_get_attachment_image_url(get_field('phone_icon','option'),'full');
$email = get_field('email','option');
$email_icon = wp_get_attachment_image_url(get_field('email_icon','option'),'full');
$socs = get_field('socs', 'option');
$time = get_field('work_time','option');
$time_icon = wp_get_attachment_image_url(get_field('work_time_icon','option'),'full');

$logo = wp_get_attachment_image_url(get_field('logo','option'),'full');
$logo_inverted = wp_get_attachment_image_url(get_field('logo_inverted','option'),'full');
$rights = get_field('rights','option');
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta name="format-detection" content="telephone=no">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,100..900;1,100..900&family=Frank+Ruhl+Libre:wght@300..900&family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&family=Noto+Serif+JP:wght@200..900&family=PT+Serif:ital,wght@0,400;0,700;1,400;1,700&family=Roboto:ital,wght@0,100..900;1,100..900&family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/inputmask/5.0.8/inputmask.min.js"></script> 
    <link rel="stylesheet" href="https://unpkg.com/lenis@1.3.25/dist/lenis.css">
    <script src="https://unpkg.com/lenis@1.3.26/dist/lenis.min.js"></script> 
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@14.0.1/swiper-bundle.min.css"/>
    <style>
        body {
            --gradient: linear-gradient(183deg, #43abff 13.89%, #077cdb 40.17%, #005397 94.7%);
            --font-family: "Helvetica", sans-serif;
            --second-family: "Helvetica Neue", sans-serif;
            --third-family: "Museo Sans Cyrl", sans-serif;
            --font3: "Arial", sans-serif;
            --font4: "Onest", sans-serif;
            --font5: "Inter", sans-serif;
        }
    </style>
    <?php
    if ( is_front_page() ) {
        $sections = get_field( 'home_page_sections' );
        if ( ! empty( $sections[0] ) ) {
            $section = $sections[0];

            if ( wp_is_mobile() && ! empty( $section['mobile_img'] ) ) {
                $mobile_id  = (int) $section['mobile_img'];
                $image_url  = wp_get_attachment_image_url( $mobile_id, 'large' );
                $image_srcset = wp_get_attachment_image_srcset( $mobile_id, 'large' );
                $image_sizes  = '(max-width: 576px) 100vw, 768px';

                if ( $image_url ) {
                    echo '<link rel="preload" as="image" href="' . esc_url( $image_url ) . '" fetchpriority="high"';
                    if ( $image_srcset ) {
                        echo ' imagesrcset="' . esc_attr( $image_srcset ) . '" imagesizes="' . esc_attr( $image_sizes ) . '"';
                    }
                    echo '>';
                }
            } elseif ( ! empty( $section['hero-slider'][0]['image'] ) ) {
                $image         = $section['hero-slider'][0]['image'];
                $sizes         = $image['sizes'] ?? array();
                $pic_2048      = $image['url'] ?? '';
                $pic_1536      = $sizes['1536x1536'] ?? $pic_2048;
                $pic_1024      = $sizes['large'] ?? $pic_2048;
                $pic_768       = $sizes['medium_large'] ?? ( $sizes['large'] ?? $pic_2048 );
                $srcset_parts  = array();

                if ( $pic_768 ) {
                    $srcset_parts[] = esc_url( $pic_768 ) . ' 768w';
                }
                if ( $pic_1024 && $pic_1024 !== $pic_768 ) {
                    $srcset_parts[] = esc_url( $pic_1024 ) . ' 1024w';
                }
                if ( $pic_1536 && $pic_1536 !== $pic_1024 ) {
                    $srcset_parts[] = esc_url( $pic_1536 ) . ' 1536w';
                }
                if ( $pic_2048 && $pic_2048 !== $pic_1536 ) {
                    $srcset_parts[] = esc_url( $pic_2048 ) . ' 2048w';
                }

                $preload_href = $pic_1024 ?: $pic_768;
                if ( $preload_href ) {
                    echo '<link rel="preload" as="image" href="' . esc_url( $preload_href ) . '" fetchpriority="high"';
                    if ( $srcset_parts ) {
                        echo ' imagesrcset="' . esc_attr( implode( ', ', $srcset_parts ) ) . '"';
                        echo ' imagesizes="(max-width: 768px) 100vw, (max-width: 1119px) 1024px, 1536px"';
                    }
                    echo '>';
                }
            } elseif ( ! empty( $section['mobile_img'] ) ) {
                $image_url = wp_get_attachment_image_url( $section['mobile_img'], 'large' );
                if ( $image_url ) {
                    printf(
                        '<link rel="preload" as="image" href="%s" fetchpriority="high">',
                        esc_url( $image_url )
                    );
                }
            }
        }
    }
    ?>

	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<div class="modal-background"></div>
<?php if(!is_front_page()) { ?>
    <div id="page" class="site">
<?php } ?>
	<a class="skip-link screen-reader-text" href="#primary"><?php esc_html_e( 'Skip to content', 'alfa-glass' ); ?></a>

	<?php
	if ( function_exists( 'alfa_load_social_links' ) ) {
		alfa_load_social_links();
	} elseif ( ! function_exists( 'get_social_links_content' ) ) {
		$social_file = get_template_directory() . '/inc/social-links.php';
		if ( is_readable( $social_file ) ) {
			require_once $social_file;
		}
	}
    $mail = get_theme_mod('contact_mail');							
	$phone = get_theme_mod('contact_phone');
	$social_links = function_exists( 'get_social_links_content' ) ? get_social_links_content() : '';
	$taxonomy = 'product_category';
	$parents_terms = get_terms([
		'taxonomy'   => $taxonomy,
		'parent'     => 0,
		'hide_empty' => true
	]);

	?>
	<header id="header" class="header">
        <div class="header-top-wrapper">
            <div class="container">
                <div class="header-top">
                    <?php if(!empty($logo) && !empty($logo_inverted)) { ?>
                        <div class="logo-wrapper image-inverted-holder">
                            <a class="header-logo light-image-invert" href="/"><img src="<?=$logo?>"></a>
                            <a class="header-logo dark-image-invert" href="/" style="display:none"><img src="<?=$logo_inverted?>" alt=""></a>
                        </div>
                    <?php } ?>
                    <div class="header-contacts">
                        <div class="contacts-left">
                            <?php if(!empty($addr)) { ?>
                                <div class="contact-item">
                                    <?php if(!empty($addr_icon)) { ?>
                                        <div class="contact-item__icon"><img src="<?=$addr_icon?>" alt=""></div>
                                    <?php } ?>
                                    <div class="contact-item__value white-black"><?=$addr?></div>
                                </div>
                            <?php } ?>
                            <?php if(!empty($time)) { ?>
                                <div class="contact-item">
                                    <?php if(!empty($time_icon)) { ?>
                                        <div class="contact-item__icon"><img src="<?=$time_icon?>" alt=""></div>
                                    <?php } ?>
                                    <div class="contact-item__value white-black"><?=$time?></div>
                                </div>
                            <?php } ?>
                        </div>
                        <div class="contacts-right">
                            <?php if(!empty($email)) { ?>
                                <div class="contact-item">
                                    <?php if(!empty($email_icon)) { ?>
                                        <div class="contact-item__icon"><img src="<?=$email_icon?>" alt=""></div>
                                    <?php } ?>
                                    <a href="mailto:<?=$email?>" class="contact-item__value white-black"><?=$email?></a>
                                </div>
                            <?php } ?>
                            <?php if(!empty($socs)) { ?>
                                <div class="socs-wrapper icon-inverted-holder">
                                    <?php foreach($socs as $soc) { ?>
                                        <a href="<?=$soc['socs_link']?>" target="_blank" class="socs-wrapper__item icon-inverted"><img src="<?=wp_get_attachment_image_url($soc['socs_icon'],'full')?>" alt=""></a>
                                    <?php } ?>
                                </div>
                            <?php } ?>
                        </div>
                    </div>
                    <div class="callback-wrapper">
                        <?php if(!empty($phone)) { ?>
                            <a href="<?=format($phone)?>" class="callback-item">
                                <?php if(!empty($phone_icon)) { ?>
                                    <div class="callback-item__icon"><img src="<?=$phone_icon?>" alt=""></div>
                                <?php } ?>
                                <div class="callback-item__value white-black"><?=$phone?></div>
                            </a>
                        <?php } ?>
                        <div class="default-link" data-src="modal-callback">Заказать звонок</div>
                    </div>
                    <div class="theme-thumbler">
                        <div class="theme-btn light-theme-btn active">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.6 10.2C5.64522 10.2 4.72955 9.82071 4.05442 9.14558C3.37928 8.47045 3 7.55478 3 6.6C3 5.64522 3.37928 4.72955 4.05442 4.05442C4.72955 3.37928 5.64522 3 6.6 3C7.55478 3 8.47045 3.37928 9.14558 4.05442C9.82071 4.72955 10.2 5.64522 10.2 6.6C10.2 7.55478 9.82071 8.47045 9.14558 9.14558C8.47045 9.82071 7.55478 10.2 6.6 10.2ZM6 0H7.2V1.8H6V0ZM6 11.4H7.2V13.2H6V11.4ZM1.509 2.3574L2.3574 1.509L3.63 2.7816L2.7816 3.63L1.509 2.358V2.3574ZM9.57 10.4184L10.4184 9.57L11.691 10.8426L10.8426 11.691L9.57 10.4184ZM10.8426 1.5084L11.691 2.3574L10.4184 3.63L9.57 2.7816L10.8426 1.509V1.5084ZM2.7816 9.57L3.63 10.4184L2.3574 11.691L1.509 10.8426L2.7816 9.57ZM13.2 6V7.2H11.4V6H13.2ZM1.8 6V7.2H0V6H1.8Z" fill="#D4E3F0" />
                            </svg>
                        </div>
                        <div class="theme-btn dark-theme-btn">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.628 0C5.18588 0.411972 4.83127 0.908775 4.58531 1.46077C4.33936 2.01277 4.20711 2.60865 4.19645 3.21286C4.18579 3.81708 4.29694 4.41726 4.52326 4.97759C4.74959 5.53791 5.08646 6.04692 5.51377 6.47423C5.94108 6.90154 6.45009 7.23841 7.01041 7.46474C7.57074 7.69106 8.17092 7.80221 8.77514 7.79155C9.37935 7.78089 9.97523 7.64864 10.5272 7.40269C11.0792 7.15673 11.576 6.80212 11.988 6.36C11.7972 9.501 9.1896 11.9886 6.0006 11.9886C2.6862 11.9886 0 9.3024 0 5.9886C0 2.7996 2.4876 0.192 5.628 0Z" fill="#D4E3F0" />
                            </svg>
                        </div>
                    </div>
                    <div class="open_menu">
                        <svg width="19" height="17" viewBox="0 0 19 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 0H18.9V2.1H0V0ZM0 7.35H18.9V9.45H0V7.35ZM0 14.7H18.9V16.8H0V14.7Z" fill="black" />
                        </svg>
                    </div>
                </div>  
            </div>
        </div>
        <div class="header-bot-wrapper">
            <div class="container">
                <?php
                    wp_nav_menu( [
                        'theme_location'  => 'header_menu',
                        'container'       => false,
                        'menu'            => '',
                        'menu_class'      => 'header_menu',
                        'echo'            => true,
                        'fallback_cb'     => 'wp_page_menu',
                        'items_wrap'      => '<ul id="%1$s" class="%2$s">%3$s</ul>',
                        'depth'           => 2,
                    ] );
                ?>
                <?=get_search_form()?>
            </div>
        </div>
        <div id="mobile-mnu">
            <div class="mobile-top">
                <?=get_search_form()?>
                <div id="close-mnu">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.70711 18.7072C6.09763 19.0977 6.7308 19.0977 7.12132 18.7072L18.435 7.39351C18.8256 7.00299 18.8256 6.36982 18.435 5.9793C18.0445 5.58877 17.4113 5.58878 17.0208 5.9793L5.70711 17.293C5.31658 17.6835 5.31658 18.3167 5.70711 18.7072Z" fill="black" />
                        <path d="M16.6066 18.435L5.29289 7.1213C4.90237 6.73077 4.90237 6.09761 5.29289 5.70708C5.68342 5.31656 6.31658 5.31656 6.70711 5.70708L18.0208 17.0208C18.4113 17.4113 18.4113 18.0445 18.0208 18.435C17.6303 18.8255 16.9971 18.8255 16.6066 18.435Z" fill="black" />
                    </svg>
                </div>
            </div>
            <?php
                wp_nav_menu( [
                    'theme_location'  => 'mobile_catalog_menu',
                    'container'       => false,
                    'menu'            => '',
                    'menu_class'      => 'header_mobile_menu',
                    'echo'            => true,
                    'fallback_cb'     => 'wp_page_menu',
                    'items_wrap'      => '<ul id="%1$s" class="%2$s">%3$s</ul>',
                    'depth'           => 2,
                ] );
            ?>
            <div class="mobile-center">
                <div class="callback-wrapper">
                    <?php if(!empty($phone)) { ?>
                        <a href="<?=format($phone)?>" class="callback-item">
                            <?php if(!empty($phone_icon)) { ?>
                                <div class="callback-item__icon"><img src="<?=$phone_icon?>" alt=""></div>
                            <?php } ?>
                            <div class="callback-item__value white-black"><?=$phone?></div>
                        </a>
                    <?php } ?>
                    <div class="default-link" data-src="callback">Заказать звонок</div>
                </div>
                <div class="values">
                    <?php if(!empty($addr)) { ?>
                        <div class="contact-item">
                            <?php if(!empty($addr_icon)) { ?>
                                <div class="contact-item__icon"><img src="<?=$addr_icon?>" alt=""></div>
                            <?php } ?>
                            <div class="contact-item__value white-black"><?=$addr?></div>
                        </div>
                    <?php } ?>
                    <?php if(!empty($time)) { ?>
                        <div class="contact-item">
                            <?php if(!empty($time_icon)) { ?>
                                <div class="contact-item__icon"><img src="<?=$time_icon?>" alt=""></div>
                            <?php } ?>
                            <div class="contact-item__value white-black"><?=$time?></div>
                        </div>
                    <?php } ?>
                    <?php if(!empty($email)) { ?>
                        <div class="contact-item">
                            <?php if(!empty($email_icon)) { ?>
                                <div class="contact-item__icon"><img src="<?=$email_icon?>" alt=""></div>
                            <?php } ?>
                            <a href="mailto:<?=$email?>" class="contact-item__value white-black"><?=$email?></a>
                        </div>
                    <?php } ?>
                </div>
                <?php if(!empty($socs)) { ?>
                    <div class="socs-wrapper icon-inverted-holder">
                        <?php foreach($socs as $soc) { ?>
                            <a href="<?=$soc['socs_link']?>" target="_blank" class="socs-wrapper__item icon-inverted"><img src="<?=wp_get_attachment_image_url($soc['socs_icon'],'full')?>" alt=""></a>
                        <?php } ?>
                    </div>
                <?php } ?>
            </div>
            <div class="mobile-bot">
                <?php if(!empty($rights)) { ?>
                    <div class="mobile-bot__rights"><?=$rights?></div>
                <?php } ?>
                <div class="developer">Сайт разработан <a href="seolebedev.ru" class="developer">SEO Lebedev</a></div>
            </div>
        </div>
    </header>