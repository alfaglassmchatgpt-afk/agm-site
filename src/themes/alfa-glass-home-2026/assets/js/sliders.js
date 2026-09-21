jQuery(document).ready(function($){
    const blog_banner = new Swiper('.blog-archive-banner .swiper', {
		direction: 'horizontal',
		navigation: {
			nextEl: '.blog-archive-banner .swiper-button-next',
			prevEl: '.blog-archive-banner .swiper-button-prev',
		},
        effect: 'fade',
		speed: 500,
        autoplay: {
            delay: 6800,
        },
        autoHeight: true,
        pagination: { 
            el: '.blog-archive-banner .swiper-pagination',
            type: 'bullets',
            clickable:  true,
        },
        slidesPerView: 1,
	});


    if(window.innerWidth > 498) {
        let banner_swipers = document.querySelectorAll('.banner-swiper');
        if(banner_swipers) {
            banner_swipers.forEach(el => {
                let banner_swiper = new Swiper(el, {
                    direction: 'horizontal',
                    effect: 'fade',
                    speed: 500,
                    autoplay: {
                        delay: 5000,
                    },
                    pagination: { 
                        el: el.parentElement.querySelector('.swiper-pagination'),
                        type: 'bullets',
                        clickable:  true,
                    },
                    slidesPerView: 1,
                });
            })
        }
    } else {
        let mobile_banner_swipers = document.querySelectorAll('.banner-mobile-swiper');
        if(mobile_banner_swipers) {
            mobile_banner_swipers.forEach(el => {
                let banner_mobile_swiper = new Swiper(el, {
                    direction: 'horizontal',
                    effect: 'fade',
                    speed: 500,
                    autoplay: {
                        delay: 5000,
                    },
                    pagination: { 
                        el: el.parentElement.querySelector('.swiper-pagination'),
                        type: 'bullets',
                        clickable:  true,
                    },
                    slidesPerView: 1,
                });
            })
        }
    }
    const shop_subcategories = new Swiper('.shop-subcategories-block .shop-subcategories', {
		direction: 'horizontal',
		speed: 500,
        slidesPerView: 'auto',
        breakpoints: {
            0: {
                spaceBetween: 8,
            },
            600: {
                spaceBetween: 12,
            }
        },
	});



    const gallery_single_product = new Swiper('.single-product .single-gallery', {
		direction: 'horizontal',
		slidesPerView: 1,
		spaceBetween: 5,
        navigation: {
            nextEl: '.single-product .swiper-button-next',
            prevEl: '.single-product .swiper-button-prev',
        },
		thumbs: {
			swiper: {
				el: '.single-product .gallery-thumbnails',
                breakpoints: {
                    0: {
                        direction: 'vertical',
                        slidesPerView: 4,
                        spaceBetween: 4,
                    },
                    996: {
                        direction: 'vertical',
                        slidesPerView: 4,
                        spaceBetween: 4,
                    },
                    1400: {
                        direction: 'horizontal',
                        slidesPerView: 4,
                        spaceBetween: 9,
                    },
                }
		    }
		}
	});
});