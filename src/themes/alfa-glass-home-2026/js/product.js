jQuery(document).ready(function ($) {
	// Кнопка поделиться

	var $shareButton = $('.btn__shared');
	var $notification = $shareButton.siblings('.shared__tooltip');

	// Проверка поддержки Web Share API для мобильных устройств
	if (navigator.share) {
		$shareButton.on('click', function () {
			navigator.share({
				title: document.title,
				text: 'Посмотрите этот товар на моем сайте!',
				url: window.location.href,
			})
				.then(function () {
					console.log('Успешно поделились');
				})
				.catch(function (error) {
					console.error('Ошибка при попытке поделиться', error);
				});
		});
	} else {
		// Если Web Share API не поддерживается, копируем ссылку в буфер обмена
		$shareButton.on('click', function () {
			// Создаем временный элемент для копирования ссылки
			var $tempInput = $('<input>');
			var $url = $(this).data('link');
			var $link = $url ? $url : window.location.href
			$('body').append($tempInput);

			$tempInput.val($link).select();

			// Копируем текст в буфер обмена
			document.execCommand('copy');
			$tempInput.remove();

			// // Показываем уведомление "Ссылка скопирована!"
			$notification.show();
			setTimeout(function () {
				$notification.fadeOut();
			}, 2000);
		});
	}
	//слайдеры на странице продукта
	const $rem = Math.round(parseFloat($('html').css('font-size')));
	$('.alfa__slider').each(function (index, element) {
		// Уникальный идентификатор для слайдера, если нужно
		var $slider = $(element);
		const $data = $slider.data();
		const $loop = $data['loop'];
		const $speed = $data['speed'] ? $data['speed'] : 300;
		const $space = $data['spacebetween'] ? $data['spacebetween'] : 0;

		var swiperContainer = $slider.find('.swiper-wrapper').parent();
		var swiperOptions = {
			slidesPerView: "auto",
			spaceBetween: $rem * $space,
			loop: $loop,
			speed: $speed,
			navigation: {
				nextEl: $slider.find('.btn__next')[0],
				prevEl: $slider.find('.btn__prev')[0]
			}
		};
		if ($data['delay']) {
			swiperOptions.autoplay = {
				delay: $data['delay']
			};
		}
		// Инициализация Swiper для каждого блока
		var productSLider = new Swiper(swiperContainer[0], swiperOptions);
	});

	$('.product__features__list .small__title').on('click', function () {
		const $parent = $(this).parent();
		$(this).siblings('.item__content').slideToggle();
		$parent.toggleClass('_active');
		$parent.siblings().removeClass('_active').find('.item__content').slideUp();
	})
});