jQuery(document).ready(function ($) {
	const $configurator = $(".configurator")[0];
	if ($configurator) {
		$(document).on('click', '.configurator__menu .tab__title', function () {
			var $parrent = $(this).parent();
			var $panes = $('.configurator__panes');
			var $target = $parrent.attr('data-target');
			if ($parrent.hasClass('_active')) return;
			$parrent.addClass('_active');
			$(this).siblings('.tab__content').slideDown();
			$parrent.siblings().removeClass('_active');
			$parrent.siblings().find('.tab__content').slideUp();

			$panes.find('.tab_pane._active').removeClass('_active');
			$panes.find(`.tab_pane[data-id="${$target}"]`).addClass('_active');


		})
		$(document).on('click', '.configurator__menu .tab__link', function () {
			var $productName = $(this).find('.item__name').text();
			const $conatiner = $(this).parents('.configurator');
			$conatiner.find('#configurator-form-modal #selected-product').val($productName);
			if ($(this).hasClass('_active')) return;
			$(this).addClass('_active').siblings('.tab__link._active').removeClass('_active');
			var $targetGallary = $(this).attr('data-target');
			var $targetPane = $(this).parents('.category__tab').attr('data-target');
			$(`.tab_pane[data-id="${$targetPane}"] .gallary._active`).removeClass('_active');
			$(`.tab_pane[data-id="${$targetPane}"] .gallary[data-id="${$targetGallary}"]`).addClass('_active');

		})

		$(document).on('click', '.configurator__panes .tab_pane .icons', function () {
			configuratorImgChange();
		})


		$(document).on('click', '.configurator .btn__group .btn', function () {
			configuratorImgChange();
		})

		function configuratorImgChange() {
			var $parrent = $('.configurator__panes');
			var $img = $parrent.find('.tab_pane._active .gallary._active .items img');
			var $icon = $parrent.find('.tab_pane._active .gallary._active .icons img');
			$img.toggleClass('_active');
			$icon.toggleClass('_active');
			return;
		}
	}
	const $rem = Math.round(parseFloat($('html').css('font-size')));

	const projectSliderThumb = new Swiper('.projects__slider_thumb', {
		slidesPerView: 1,
		loop: true,
		loopAdditionalSlides: 1,
		watchSlidesProgress: true,
		direction: 'vertical',
		breakpoints: {
			577: {
				direction: 'horizontal'
			}
		}

	});
	const projectSlider = new Swiper('.projects__slider', {
		slidesPerView: 1,
		allowTouchMove: false,
		loop: true,
		navigation: {
			nextEl: '.projects .slider__btn_next'
		},
		thumbs: {
			swiper: projectSliderThumb,
		},
		effect: "creative",
		creativeEffect: {
			prev: {
				translate: [0, "-50%", -1],
			},
			next: {
				translate: [0, "100%", 0],
			},
		},
		breakpoints: {
			577: {
				creativeEffect: {
					prev: {
						translate: ["-50%", 0, -1],
					},
					next: {
						translate: ["100%", 0, 0],
					},
				}
			}
		}


	});
	const partnersSlider = new Swiper('.partners__slider', {
		slidesPerView: 'auto',
		loop: true,
		freeMode: true,
		speed: 15000,
		autoplay: {
			delay: 0,
			disableOnInteraction: false
		},

	});

	const reviewsSlider = new Swiper('.reviews__slider', {
		slidesPerView: 1,
		spaceBetween: $rem * 2,
		navigation: {
			nextEl: '.reviews__slider .btn_next',
			prevEl: '.reviews__slider .btn_prev'
		}
	})
	const advantagesSlider = new Swiper('.advantages', {
		slidesPerView: "auto",
		navigation: {
			nextEl: '.advantages .btn__next',
			prevEl: '.advantages .btn__prev'
		},
		init: false
	})
	const blogSlider = new Swiper('.blog__slider', {
		slidesPerView: "auto",
		navigation: {
			nextEl: '.blog .btn__next',
			prevEl: '.blog .btn__prev'
		},
		init: false
	})
	if ($(window).width() <= 576) {
		advantagesSlider.init();
		blogSlider.init();
	}

	//управление видео в отзывах
	$('.reviews__item_video-wrapper').on('click', function () {
		const $video = $(this).find('video');
		$(this).find('.reviews__item_video-elements').fadeToggle();
		if ($video.get(0).paused) {
			$video.get(0).play();
			$video.prop('controls', true);

		} else {
			$video.get(0).pause();
			$video.prop('controls', false);
		}

	})

	$('.reviews .item__link a').on('click', function () {
		let index = $(this).data('index');
		reviewsSlider.slideTo(index);
	});
	$('.reviews .item__link a').on('click', function () {
		let index = $(this).data('index');
		reviewsSlider.slideTo(index);
	});
});