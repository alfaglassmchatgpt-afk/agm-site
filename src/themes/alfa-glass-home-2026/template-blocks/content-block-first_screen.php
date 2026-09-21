<?php
/**
 * Template section
 * name: first_screen
 */
global $loaded_blocks;
$loaded_blocks[] = 'block_first_screen';

$hero_slides = get_sub_field('hero-slider');
$is_mobile_hero = wp_is_mobile();



###################
/*
$current_user = wp_get_current_user();
if ( $current_user->exists() && $current_user->ID == 4 ) {
    //echo '<pre>';
    //print_r(get_sub_field('hero-slider'));
    //echo '</pre>';

//foreach($hero_slides as $key => $hero_slide) {
//    $slide_heading = $hero_slide['heading'];
//    $slide_descr = $hero_slide['description'];
//    $pic_2048 = $hero_slide['image']['url'];
//}

}
*/
###################
?>


<?php if ( ! $is_mobile_hero ) : ?>
<section class="container main-screen mb__section hero-slider-container">
    <?php if ( ! empty( $hero_slides ) && is_array( $hero_slides ) ) : ?>
    <div class="swiper hero-slider">
        <div class="swiper-wrapper">
            <?php
            foreach ( $hero_slides as $key => $hero_slide ) :
                $slide_heading = $hero_slide['heading'] ?? '';
                $slide_descr   = $hero_slide['description'] ?? '';
                $btn_text      = $hero_slide['btn-text'] ?? '';
                $btn_url       = $hero_slide['link'] ?? '';
                $image         = $hero_slide['image'] ?? array();
                $sizes         = $image['sizes'] ?? array();

                $pic_2048 = $image['url'] ?? '';
                $pic_1536 = $sizes['1536x1536'] ?? $pic_2048;
                $pic_1024 = $sizes['large'] ?? $pic_2048;
                $pic_768  = $sizes['medium_large'] ?? ( $sizes['large'] ?? $pic_2048 );
                $hero_srcset_parts = array();
                if ( $pic_768 ) {
                    $hero_srcset_parts[] = esc_url( $pic_768 ) . ' 768w';
                }
                if ( $pic_1024 ) {
                    $hero_srcset_parts[] = esc_url( $pic_1024 ) . ' 1024w';
                }
                if ( $pic_1536 ) {
                    $hero_srcset_parts[] = esc_url( $pic_1536 ) . ' 1536w';
                }
                if ( $pic_2048 ) {
                    $hero_srcset_parts[] = esc_url( $pic_2048 ) . ' 2048w';
                }
                $hero_srcset = implode( ', ', $hero_srcset_parts );
                ?>
            <div class="swiper-slide block__default block__main d-flex">
                <picture>
                    <source media="(min-width: 1677px)" srcset="<?php echo esc_url( $pic_2048 ); ?>">
                    <source media="(min-width: 1119px)" srcset="<?php echo esc_url( $pic_1536 ); ?>">
                    <source media="(min-width: 768px)" srcset="<?php echo esc_url( $pic_1024 ); ?>">
                    <img src="<?php echo esc_url( $pic_768 ); ?>"
                         class="skip-lazy hero-slide__img"
                         alt="<?php echo esc_attr( wp_strip_all_tags( $slide_heading ) ); ?>"
                         fetchpriority="high"
                         loading="eager"
                         decoding="async"
                         <?php if ( $hero_srcset ) : ?>
                         srcset="<?php echo esc_attr( $hero_srcset ); ?>"
                         sizes="(max-width: 768px) 100vw, (max-width: 1119px) 1024px, 1536px"
                         <?php endif; ?>>
                </picture>

                <div class="col__left">
                    <div class="wrapper"></div>
                    <?php if ( $slide_heading ) : ?>
                        <?php if ( 0 === $key ) : ?>
                        <h1><?php echo wp_kses_post( $slide_heading ); ?></h1>
                        <?php else : ?>
                        <p class="hero-slide__title"><?php echo wp_kses_post( $slide_heading ); ?></p>
                        <?php endif; ?>
                    <?php endif; ?>
                    <div class="description small__title">
                        <?php echo wp_kses_post( $slide_descr ); ?>
                    </div>
                </div>

                <div class="col__right">
                    <?php if ( ! empty( trim( $btn_url ) ) ) : ?>
                    <a class="btn btn__small btn__light btn__uppercase btn__hover" href="<?php echo esc_url( $btn_url ); ?>">
                        <span><?php echo esc_html( $btn_text ); ?></span>
                    <span class="item__arrow"><span></span></span>
                    </a>
                    <?php else : ?>
                    <button class="btn btn__small btn__light btn__uppercase btn__hover"
                            data-toggle="popup-open" data-modal-target="main-form-modal">
                        <span><?php echo esc_html( $btn_text ); ?></span>
                    <span class="item__arrow"><span></span></span>
                    </button>
                    <?php endif; ?>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        <div class="swiper-pagination"></div>
    </div>
    <?php endif; ?>
</section>
<?php endif; ?>


<?php if ( $is_mobile_hero ) : ?>
<section class="container main-screen mb__section hero-static">
    <div class="main-screen__wrapper d-flex" style="width: 100%;">
        <?php
        // Получение данных
        //$main_img = get_sub_field('main_img');
        $mobile_img = get_sub_field('mobile_img');
        //$product_id = get_sub_field('product_item');
        $block_title = get_sub_field('block_title');
        $description = get_sub_field('description');
        $modal_btn_text = get_sub_field('modal_btn_text');
        //$form_img = get_sub_field('form_img');
        //$simple_form = get_sub_field('simple_form');
        ?>

        <div class="block__default block__main d-flex">
            <div class="col__left">
                <div class="wrapper"></div>
                <?php if ($block_title): ?>
                    <h1><?= wp_kses_post($block_title) ?></h1>
                <?php endif; ?>
                <div class="description small__title">
                    <?= wp_kses_post($description) ?>
                </div>
            </div>
            <div class="col__right">
                <?php if ( $mobile_img ) : ?>
                    <?php
                    echo wp_get_attachment_image(
                        $mobile_img,
                        'large',
                        false,
                        array(
                            'class'         => 'mobile__bgr d-none d-sm-block',
                            'fetchpriority' => 'high',
                            'loading'       => 'eager',
                            'decoding'      => 'async',
                            'sizes'         => '(max-width: 576px) 100vw, 768px',
                        )
                    );
                    ?>
                <?php endif; ?>


                <button class="btn btn__small btn__light btn__uppercase btn__hover" 
                        data-toggle="popup-open" data-modal-target="main-form-modal">
                    <span><?= esc_html($modal_btn_text) ?></span>
                    <span class="item__arrow">
                        <span></span>
                    </span>
                </button>
            </div>
        </div>

    </div>
</section>
<?php endif; ?>





<?php if ( ! $is_mobile_hero ) : ?>
<script>
document.addEventListener('DOMContentLoaded', function() {
    const heroSlider = document.querySelector('.hero-slider-container .hero-slider');

    if (!heroSlider) {
        return;
    }

    let swiperInstance = null;

    function waitForSwiper(callback, attempts = 20) {
        if (typeof Swiper !== 'undefined') {
            callback();
            return;
        }
        if (attempts > 0) {
            setTimeout(() => waitForSwiper(callback, attempts - 1), 100);
        }
    }

    function initSlider() {
        if (window.innerWidth <= 576) {
            return;
        }

        if (!swiperInstance) {
            waitForSwiper(() => {
                if (!document.body.contains(heroSlider)) {
                    return;
                }

                try {
                    swiperInstance = new Swiper(heroSlider, {
                        effect: 'fade',
                        fadeEffect: { crossFade: true },
                        slidesPerView: 1,
                        speed: 1000,
                        loop: true,
                        allowTouchMove: false,
                        pagination: {
                            el: heroSlider.querySelector('.swiper-pagination'),
                            clickable: true,
                        },
                        autoplay: {
                            delay: 5000,
                            disableOnInteraction: false,
                        },
                        on: {
                            init: function() {
                                setTimeout(() => {
                                    if (this && !this.destroyed) {
                                        this.autoplay.start();
                                    }
                                }, 200);
                            },
                        },
                    });
                } catch (e) {
                    console.error('Swiper init error:', e);
                }
            });
        }
    }

    initSlider();
});
</script>
<?php endif; ?>