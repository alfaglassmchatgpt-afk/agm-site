jQuery(document).ready(function ($) {
	$('.elementor-widget-article_cards').each(function () {
		var $block = $(this);

		// Получаем параметры из атрибута data-slider-options
		var sliderOptions = $block.data('settings');
		var $slider = $block.find('.post-list-wrapper');
		var $prev = $block.find('.btn__prev');
		var $next = $block.find('.btn__next');
		console.log($next);
		var swiperOptions = {
			slidesPerView: "auto",
			loop: sliderOptions.infinite === "yes",
			speed: sliderOptions.speed,
			navigation: {
				nextEl: $next[0],
				prevEl: $prev[0]
			}
		};
		if (sliderOptions.autoplay === "yes") {
			swiperOptions.autoplay = {
				delay: sliderOptions.autoplay_speed,
				disableOnInteraction: sliderOptions.pause_on_interaction === "yes",
				pauseOnMouseEnter: sliderOptions.pause_on_hover === "yes",
			};
		}
		var swiper = new Swiper($slider[0], swiperOptions);
	});
});