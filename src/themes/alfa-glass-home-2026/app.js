

jQuery(document).ready(function ($) {
	var scrWidth = scrollbarWidth();

	$('[data-toggle="popup-menu"]').on('click', function (e) {
		e.preventDefault();
		var $curItem = $(this);

		$('[data-toggle="popup-menu"]').not($curItem).removeClass('_active');
		$curItem.toggleClass('_active')
		var attr = $curItem.attr('data-modal-target');
		if ($(attr).is(':visible') || !$(this).hasClass('_active')) {
			$('.header').css({ 'margin-right': '0', 'padding-right': '0', 'z-index': '100' });
			modalClose(attr);
			modalBackdropClose();

		}
		else if ($(this).hasClass('_active')) {
			modalBackdropOpen();
			$('.header').css({ 'margin-right': -scrWidth, 'padding-right': scrWidth, 'z-index': '1001' })
			modalClose($('.modal.show'));
			modalOpen($(this).attr('data-modal-target'));
		}

	});
	function modalBackdropOpen() {
		if ($('.modal-backdrop').length > 0) return;
		$('body').append('<div class="modal-backdrop"></div>');

		$('body').css({ 'overflow-y': 'hidden', 'padding-right': scrWidth, });
		$(document).find('.modal-backdrop').fadeIn(200);

	}
	function modalBackdropClose() {
		$('.modal-backdrop').fadeOut(200);
		setTimeout(function () {
			$('.modal-backdrop').remove();
			$('body').css({ 'overflow-y': 'auto', 'padding-right': '0' });
		}, 0)
	}
	function modalOpen(modal) {
		$(modal).fadeIn(100).addClass('show').removeAttr('aria-hidden').attr({ 'aria-modal': 'true', 'role': 'dialog' });
	}

	function modalClose(modal) {
		$(modal).removeClass('show').fadeOut(100).attr('aria-hidden', 'true').removeAttr('aria-modal role');
		if ($(modal).attr('id') === "popup-menu-main") {
			$('.header .popup-menu__page_first').fadeIn();
			$('.header .popup-menu__page_second').fadeOut();
		}
	}
	$('.sub-navigation .menu-item').on('click', function () {
		modalBackdropClose();
		modalClose($('.popup-menu.show'));
		$('[data-toggle="popup-menu"]').removeClass('_active');
	})
	function scrollbarWidth() {
		// Создаем временный элемент с полосой прокрутки
		var outer = document.createElement('div');
		outer.style.visibility = 'hidden';
		outer.style.overflow = 'scroll'; // Создаем полосу прокрутки
		outer.style.msOverflowStyle = 'scrollbar'; // Для IE и Edge
		outer.style.width = '50px';
		outer.style.height = '50px';
		document.body.appendChild(outer);

		var inner = document.createElement('div');
		inner.style.width = '100%';
		inner.style.height = '100%';
		outer.appendChild(inner);

		// Определяем ширину полосы прокрутки
		var scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

		// Удаляем элементы
		outer.parentNode.removeChild(outer);

		return scrollbarWidth;
	}
	$(document).on('mousedown', function (e) {
		if ($('.popup-menu').is(':visible')) {
			var modal = $('.popup-menu.show');
			var link = $('[data-toggle="popup-menu"]');
			if (!modal.is(e.target) && modal.has(e.target).length === 0 && !link.is(e.target) && link.has(e.target).length === 0) {
				$('.header').css({ 'margin-right': '0', 'padding-right': '0', 'z-index': '100' });
				modalClose(modal);
				modalBackdropClose();
				$('[data-toggle="popup-menu"]').removeClass('_active')
			}
		}
	});

	$(document).on('click', '.header .category__links a', function () {
		if ($(this).hasClass('_active')) return
		const $targetId = $(this).attr('data-target');
		$(this).siblings('._active').removeClass('_active');
		$(this).parents('.tabs').find($('.tab__pane._active')).removeClass('_active');
		$(this).addClass('_active');
		$(this).parents('.tabs').find($('.tab__pane[data-id="' + $targetId + '"]')).addClass('_active');
	});
	$(document).on('click', '.header .category__list a', function () {
		$('.header .popup-menu__page_first').fadeOut();
		$('.header .popup-menu__page_second').fadeIn();
		const $targetId = $(this).attr('data-target');
		const $parents = $(this).parents('.popup-menu');
		$parents.find('.category__links a._active').removeClass('_active');
		$parents.find('.tab__pane._active').removeClass('_active');
		$parents.find('.category__links a[data-target="' + $targetId + '"]').addClass('_active');
		$parents.find('.tab__pane[data-id="' + $targetId + '"]').addClass('_active');
	});


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
		loopAdditionalSlides: 1,
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

	//modal
	$('[data-toggle="popup-open"]').on('click', function () {
		var $curItem = $(this);
		var attr = $curItem.data('modal-target');

		modalBackdropOpen();
		$('.header').css({ 'margin-right': -scrWidth, 'padding-right': scrWidth })
		$('#' + attr).fadeIn().css('display', 'flex');
	});

	$('.modal .close').on('click', function () {
		$(this).closest('.modal').fadeOut();
		modalBackdropClose();
	});
	$(window).on('click', function (e) {
		if ($(e.target).hasClass('modal')) {
			$(e.target).fadeOut();
			modalBackdropClose();
		}
	});
	$('.reviews .item__link a').on('click', function () {
		let index = $(this).data('index');
		reviewsSlider.slideTo(index);
	});

	$('.category__list_mobile .menu-item-has-children>a').on('click', function (e) {
		e.preventDefault();
		const $this = $(this);
		const $parent = $this.parent();
		$parent.siblings().removeClass('_active').find('.sub-menu').slideUp(300);
		$parent.toggleClass('_active');
		$this.siblings('.sub-menu').slideToggle(300);
	})


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
	const draggedEls = $('[data-grabbing="true"]');
	if (draggedEls.length) {
		$.each(draggedEls, function (index, dragged) {
			const draggedEl = $(dragged);
			let pos = {
				left: 0,
				x: 0,
			}
			const mouseDownHandler = function (e) {
				e.preventDefault();
				draggedEl.css({
					'cursor': 'grabbing',
					'userSelect': 'none'
				});
				pos = {
					left: draggedEl.scrollLeft(),
					x: e.clientX,
				}
				$(document).on('mousemove', mouseMoveHandler);
				$(document).on('mouseup', mouseUpHandler);
			}
			const mouseMoveHandler = function (e) {
				e.preventDefault();
				const dx = e.clientX - pos.x;
				draggedEl.scrollLeft(pos.left - dx);
				draggedEl.data('dragged', Math.abs(dx) > 15);
			}

			const mouseUpHandler = function () {
				draggedEl.css({
					'cursor': 'pointer',
					'userSelect': 'auto',
				});
				$(document).off('mousemove');
				$(document).off('mouseup');
			}
			draggedEl.on('mousedown', mouseDownHandler);

			draggedEl.on('click', function (e) {

				if (draggedEl.data('dragged')) {
					e.preventDefault();
				}
			});
		})
	}


	$(document).on('wpcf7mailsent', function (event) {

		// Находим форму
		var $form = $(event.target);
		// Получаем стандартное сообщение из .wpcf7-response-output
		var successMessage = event.detail.apiResponse.message;

		// Создаем кастомный блок с текстом успешного сообщения
		var customBlock = '<div class="custom-success-block"><svg width="60" height="59" viewBox="0 0 60 59" fill="none" xmlns="http://www.w3.org/2000/svg"><path d = "M54.6306 23.1241C54.5323 22.7094 54.1176 22.4533 53.7024 22.5519C53.2888 22.6511 53.0334 23.0674 53.1323 23.482C53.5374 25.1853 53.7431 26.984 53.7431 28.8289C53.7431 42.0065 42.8107 52.7272 29.3724 52.7272C15.934 52.7272 5.00163 42.0065 5.00163 28.8289C5.00163 15.6503 15.934 4.92896 29.3724 4.92896C34.7243 4.92896 39.8367 6.62693 44.1563 9.83939C44.4969 10.0934 44.9803 10.0218 45.2336 9.67925C45.487 9.33668 45.4156 8.85306 45.0739 8.59906C40.4873 5.1872 35.0576 3.38477 29.3724 3.38477C15.0846 3.38477 3.46094 14.7986 3.46094 28.8289C3.46094 42.8581 15.0846 54.272 29.3724 54.272C43.6602 54.272 55.2838 42.8581 55.2838 28.8289C55.2838 26.8642 55.0638 24.9451 54.6306 23.1241Z" fill = "#231F20" stroke = "black" /><path d="M28.8336 40.3264C28.6294 40.3264 28.4337 40.2452 28.2888 40.1005L13.8429 25.6189C13.542 25.3172 13.542 24.8283 13.8429 24.5265C14.1433 24.2248 14.631 24.2248 14.9319 24.5265L28.8013 38.4301L55.0021 9.00667C55.2856 8.6885 55.7721 8.66093 56.0895 8.94516C56.4068 9.22939 56.4343 9.71725 56.1514 10.0354L29.408 40.0686C29.2667 40.2272 29.0668 40.3205 28.8553 40.3264C28.8479 40.3264 28.841 40.3264 28.8336 40.3264Z" fill="#231F20" stroke="black" /></svg ><h3>' + successMessage + '</h3> <p>Менеджер свяжется с вами в ближайшее время.</p></div > ';

		// Заменяем содержимое формы на кастомный блок
		$form.html(customBlock);
	});
})