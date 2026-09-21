

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


	$('.category__list_mobile .menu-item-has-children>a').on('click', function (e) {
		e.preventDefault();
		const $this = $(this);
		const $parent = $this.parent();
		$parent.siblings().removeClass('_active').find('.sub-menu').slideUp(300);
		$parent.toggleClass('_active');
		$this.siblings('.sub-menu').slideToggle(300);
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



















// === ОСНОВНОЙ КОД ===

$(document).on('wpcf7mailsent', function (event) {
	var $form = $(event.target);
	var successMessage = event.detail.apiResponse.message;

	var customBlock = '<div class="custom-success-block"><svg width="60" height="59" viewBox="0 0 60 59" fill="none" xmlns="http://www.w3.org/2000/svg"><path d = "M54.6306 23.1241C54.5323 22.7094 54.1176 22.4533 53.7024 22.5519C53.2888 22.6511 53.0334 23.0674 53.1323 23.482C53.5374 25.1853 53.7431 26.984 53.7431 28.8289C53.7431 42.0065 42.8107 52.7272 29.3724 52.7272C15.934 52.7272 5.00163 42.0065 5.00163 28.8289C5.00163 15.6503 15.934 4.92896 29.3724 4.92896C34.7243 4.92896 39.8367 6.62693 44.1563 9.83939C44.4969 10.0934 44.9803 10.0218 45.2336 9.67925C45.487 9.33668 45.4156 8.85306 45.0739 8.59906C40.4873 5.1872 35.0576 3.38477 29.3724 3.38477C15.0846 3.38477 3.46094 14.7986 3.46094 28.8289C3.46094 42.8581 15.0846 54.272 29.3724 54.272C43.6602 54.272 55.2838 42.8581 55.2838 28.8289C55.2838 26.8642 55.0638 24.9451 54.6306 23.1241Z" fill = "#231F20" stroke = "black" /><path d="M28.8336 40.3264C28.6294 40.3264 28.4337 40.2452 28.2888 40.1005L13.8429 25.6189C13.542 25.3172 13.542 24.8283 13.8429 24.5265C14.1433 24.2248 14.631 24.2248 14.9319 24.5265L28.8013 38.4301L55.0021 9.00667C55.2856 8.6885 55.7721 8.66093 56.0895 8.94516C56.4068 9.22939 56.4343 9.71725 56.1514 10.0354L29.408 40.0686C29.2667 40.2272 29.0668 40.3205 28.8553 40.3264C28.8479 40.3264 28.841 40.3264 28.8336 40.3264Z" fill="#231F20" stroke="black" /></svg ><h3>' + successMessage + '</h3> <p>Менеджер свяжется с вами в ближайшее время</p></div > ';

	$form.html(customBlock);
});

// === МАСКА ТЕЛЕФОНА ===
$(".phone-mask").mask("+70000000000",{autoclear: false});

$.fn.setCursorPosition = function(pos) {
    if ($(this).get(0).setSelectionRange) {
        $(this).get(0).setSelectionRange(pos, pos);
    } else if ($(this).get(0).createTextRange) {
        var range = $(this).get(0).createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
    }
};    

$('.phone-mask').click(function(){
    const placeholder = '+7 (___) ___-__-__';
    const cleanNumber = $(this).val().replace(/[^\d]/g, '');

    if($(this).val() === placeholder) {
        $(this).setCursorPosition(4);
    }
});

// === ПАТТЕРН EMAIL ===
//var pattern = /^[a-z0-9_-]+@[a-z0-9-]+\.[a-z]{2,6}$/i;
var pattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i

// === ПРОСТАЯ РАЗБЛОКИРОВКА КНОПОК ===
$(document).ready(function() {
    $('.wpcf7-submit').prop('disabled', false);
});

// === ВАЛИДАЦИЯ ПРИ КЛИКЕ НА КНОПКУ ===
// === ВАЛИДАЦИЯ ПРИ КЛИКЕ НА КНОПКУ ===
// === ОСНОВНОЙ КОД (упрощенная версия) ===

/* аккуратно чистим, удаляем дубли, временно закоментировали и наблюдаем */
/*
$(document).on('wpcf7mailsent', function (event) {
	var $form = $(event.target);
	var successMessage = event.detail.apiResponse.message;

	var customBlock = '<div class="custom-success-block"><svg width="60" height="59" viewBox="0 0 60 59" fill="none" xmlns="http://www.w3.org/2000/svg"><path d = "M54.6306 23.1241C54.5323 22.7094 54.1176 22.4533 53.7024 22.5519C53.2888 22.6511 53.0334 23.0674 53.1323 23.482C53.5374 25.1853 53.7431 26.984 53.7431 28.8289C53.7431 42.0065 42.8107 52.7272 29.3724 52.7272C15.934 52.7272 5.00163 42.0065 5.00163 28.8289C5.00163 15.6503 15.934 4.92896 29.3724 4.92896C34.7243 4.92896 39.8367 6.62693 44.1563 9.83939C44.4969 10.0934 44.9803 10.0218 45.2336 9.67925C45.487 9.33668 45.4156 8.85306 45.0739 8.59906C40.4873 5.1872 35.0576 3.38477 29.3724 3.38477C15.0846 3.38477 3.46094 14.7986 3.46094 28.8289C3.46094 42.8581 15.0846 54.272 29.3724 54.272C43.6602 54.272 55.2838 42.8581 55.2838 28.8289C55.2838 26.8642 55.0638 24.9451 54.6306 23.1241Z" fill = "#231F20" stroke = "black" /><path d="M28.8336 40.3264C28.6294 40.3264 28.4337 40.2452 28.2888 40.1005L13.8429 25.6189C13.542 25.3172 13.542 24.8283 13.8429 24.5265C14.1433 24.2248 14.631 24.2248 14.9319 24.5265L28.8013 38.4301L55.0021 9.00667C55.2856 8.6885 55.7721 8.66093 56.0895 8.94516C56.4068 9.22939 56.4343 9.71725 56.1514 10.0354L29.408 40.0686C29.2667 40.2272 29.0668 40.3205 28.8553 40.3264C28.8479 40.3264 28.841 40.3264 28.8336 40.3264Z" fill="#231F20" stroke="black" /></svg ><h3>' + successMessage + '</h3> <p>Менеджер свяжется с вами в ближайшее время</p></div > ';

	$form.html(customBlock);
});
*/
// === МАСКА ТЕЛЕФОНА ===
$(".phone-mask").mask("+70000000000",{autoclear: false});

$.fn.setCursorPosition = function(pos) {
    if ($(this).get(0).setSelectionRange) {
        $(this).get(0).setSelectionRange(pos, pos);
    } else if ($(this).get(0).createTextRange) {
        var range = $(this).get(0).createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
    }
};    

$('.phone-mask').click(function(){
    const placeholder = '+7 (___) ___-__-__';
    const cleanNumber = $(this).val().replace(/[^\d]/g, '');

    if($(this).val() === placeholder) {
        $(this).setCursorPosition(4);
    }
});

// === ПАТТЕРН EMAIL ===
//var pattern = /^[a-z0-9_-]+@[a-z0-9-]+\.[a-z]{2,6}$/i;
var pattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

// === ПРОСТАЯ РАЗБЛОКИРОВКА КНОПОК ===
$(document).ready(function() {
    $('.wpcf7-submit').prop('disabled', false);
});

// === УПРОЩЕННАЯ ВАЛИДАЦИЯ ПРИ КЛИКЕ ===
$(document).on('click', '.wpcf7-submit', function(e) {
    let $submitBtn = $(this);

    // БЛОКИРОВКА ПОВТОРНЫХ КЛИКОВ
    if ($submitBtn.hasClass('is-submitting')) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
    }


    let $form = $(this).closest('form');
    let box = $form.find('.box-mask').length;
    let phone = $form.find('.phone-mask');
    let cb = $form.find('input[type="checkbox"]'); 
    let name = $form.find('._user-name');
    
    let isFormValid = true;
    let messages = [];
    
    const fieldMessages = {
        'common-msg': 'Не заполнены обязательные поля',
        'phone-mask': 'Укажите контактный номер',
        'box-mask': 'Укажите электронную почту', 
        'name-field': 'Укажите ваше имя',
        'checkbox-privacy': 'Вы должны дать согласие на обработку своих персональных данных.'
    };
    
    // Проверка чекбокса
    if (cb.length && !cb.is(':checked')) {
        isFormValid = false;
        cb.attr('aria-invalid', 'true');
        messages.push(fieldMessages['checkbox-privacy']);
    } else if (cb.length) {
        cb.removeAttr('aria-invalid');
    }
    
    let hasFieldErrors = false;
    
    // Проверка email
    if(box === 1) {
        let mail = $form.find('.box-mask');
        if(mail.val().search(pattern) == 0){
            mail.removeAttr('aria-invalid');
        } else {
            isFormValid = false;
            hasFieldErrors = true;
            mail.attr('aria-invalid', 'true');
        }
    }

    // Проверка имени
    if(name.length === 1) {
        if(name.val().trim()){
            name.removeAttr('aria-invalid');
        } else {
            isFormValid = false;
            hasFieldErrors = true;
            name.attr('aria-invalid', 'true');
        }
    } 

    // Проверка телефона
    if(phone.length === 1) {
        const cleanNumber = phone.val().replace(/[^\d]/g, '');
        if(cleanNumber.length === 11) {
            phone.removeAttr('aria-invalid');
        } else {
            isFormValid = false;
            hasFieldErrors = true;
            phone.attr('aria-invalid', 'true');
        } 
    }

    if (hasFieldErrors) {
        messages.unshift(fieldMessages['common-msg']);
    }

    // ТОЛЬКО блокируем отправку если есть ошибки
    if (!isFormValid) {
        showFormMessages($form, messages);
        e.preventDefault();
        e.stopImmediatePropagation();
    } else {
        // Если форма валидна - разрешаем отправку (кнопка остается активной)
        // ВАЖНО: блокируем ТОЛЬКО при успешной валидации!
        
        //$submitBtn.addClass('is-submitting');
        
        $submitBtn
            .addClass('is-submitting')
            .children('span')        // Только прямые потомки span
            .first()                 // Берем первый (текст "Отправить")
            .html('Отправляется<span class="sequential-dots"></span>');
            
            
        // ДОБАВЛЯЕМ ЛОАДЕР К СТРЕЛКЕ
        
        $submitBtn.find('.item__arrow')
            .html('<div class="custom-loader"></div>')
            .addClass('_has-loader');

        
    }

});
// Разблокировка после отправки
$(document).on('wpcf7mailsent wpcf7mailfailed', function(event) {
    $(event.target).find('.wpcf7-submit').removeClass('is-submitting');
});  


// Функция показа сообщений над кнопкой
function showFormMessages($form, messages) {
    hideFormMessages($form);
    
    let $messagesContainer = $('<div class="form-messages-container"></div>');
    
    messages.forEach(function(message) {
        $messagesContainer.append('<div class="form-message">' + message + '</div>');
    });
    
    if ($form.closest('.form__simple').length) {
        $form.append($messagesContainer);
    } else {
        $form.find('.wpcf7-submit').before($messagesContainer);
    }
    
    $messagesContainer.show();
}

// СБРОС СООБЩЕНИЙ И ВЫДЕЛЕНИЯ ПРИ ФОКУСЕ НА ПОЛЕ
$(document).on('focus', '.wpcf7-form-control', function() {
    let $field = $(this);
    let $form = $field.closest('form');
    
    // Скрываем сообщения
    hideFormMessages($form);
    
    // Снимаем красное выделение с ЭТОГО поля
    if ($field.attr('aria-invalid') === 'true') {
        $field.removeAttr('aria-invalid');
    }
});

// СБРОС СООБЩЕНИЙ ПРИ ВВОДЕ (но НЕ снимаем выделение)
$(document).on('input keydown keyup change', '.wpcf7-form-control', function() {
    let $field = $(this);
    let $form = $field.closest('form');
    
    // Скрываем сообщения, но НЕ снимаем подсветку полей
    hideFormMessages($form);
});

// Функция скрытия сообщений
function hideFormMessages($form) {
    $form.find('.form-messages-container').remove();
}

// Функция показа сообщений над кнопкой
function showFormMessages($form, messages) {
    // Удаляем старые сообщения
    hideFormMessages($form);
    
    let $messagesContainer = $('<div class="form-messages-container"></div>');
    
    // Добавляем сообщения
    messages.forEach(function(message) {
        $messagesContainer.append('<div class="form-message">' + message + '</div>');
    });
    
    // Определяем куда вставлять сообщения
    if ($form.closest('.form__simple').length) {
        // Если форма внутри элемента с form__simple - в конец формы
        $form.append($messagesContainer);
    } else {
        // Для остальных - перед кнопкой отправки
        $form.find('.wpcf7-submit').before($messagesContainer);
    }
    
    $messagesContainer.show();
}

// СБРОС СООБЩЕНИЙ И ВЫДЕЛЕНИЯ ПРИ ФОКУСЕ НА ПОЛЕ
$(document).on('focus', '.wpcf7-form-control', function() {
    let $field = $(this);
    let $form = $field.closest('form');
    
    // Скрываем сообщения
    hideFormMessages($form);
    
    // Снимаем красное выделение с ЭТОГО поля
    if ($field.attr('aria-invalid') === 'true') {
        $field.removeAttr('aria-invalid');
    }
});

// СБРОС СООБЩЕНИЙ ПРИ ВВОДЕ (но НЕ снимаем выделение)
$(document).on('input keydown keyup change', '.wpcf7-form-control', function() {
    let $field = $(this);
    let $form = $field.closest('form');
    
    // Скрываем сообщения, но НЕ снимаем подсветку полей
    hideFormMessages($form);
});

// Функция скрытия сообщений
function hideFormMessages($form) {
    $form.find('.form-messages-container').remove();
}














    /*--------------------------------------------------------------
    # Fancybox 
    # добавим лупу в где есть ссылки с data фанси в контенте
    --------------------------------------------------------------*/  
    $('body').find('a[data-fancybox="pgallery"]').each( function(){
        if($(this).find('i.fa-search-plus').length == 0) {
            $(this).append('<i class="fa fa-search-plus" aria-hidden="true"></i>')
        }
        
    });         

    let scrollPos = 0;
    $('[data-fancybox]').fancybox({

        beforeShow: function() {
            scrollPos = $(window).scrollTop();
        },
        afterClose: function() {
            setTimeout(() => {
                //window.scrollTo(0, scrollPos);
                const html = document.documentElement;
                const prevBehavior = html.style.scrollBehavior;
                html.style.scrollBehavior = 'auto';     // Убираем плавность
                window.scrollTo(0, scrollPos);          // Мгновенная прокрутка
                html.style.scrollBehavior = prevBehavior; // Восстанавливаем плавность
            }, 1);
        }
    });


   
    // мультибокс

    const wmbParent = $('.w-multibox');
    const wmbClose = $('.w-multibox__close');
    
    $(".w-multibox__button").click(function() {
       if (wmbParent.hasClass('_open')) {
           wmbParent.addClass('_closed').removeClass('_open');  
       } else if(wmbParent.hasClass('_closed')) {
           wmbParent.addClass('_open').removeClass('_closed');  
       }
    });
    
    
    const wmbBounceDelay = 5000;
    const wmbBounceDration = 700;
    const wmbBounceClass = 'bounce';
    
    wmbAnimateBounce();
    function wmbAnimateBounce() {
        setTimeout(function(){
            startBounce()
        }, wmbBounceDelay);
    }   
    function startBounce(){
        wmbParent.addClass(wmbBounceClass);
        setTimeout(function(){
            stopBounce()
        }, wmbBounceDration);
    }
    function stopBounce(){
        wmbParent.removeClass(wmbBounceClass);
        setTimeout(function(){
            startBounce()
        }, wmbBounceDelay);
    }    


})


document.addEventListener('DOMContentLoaded', () => {
    const currentUrl = window.location.pathname + window.location.hash; // Получаем относительный путь текущей страницы с якорем
    const homePagePath = '/'; // Относительный путь главной страницы

    // Проверка, является ли текущая страница главной
    const isHomePage = currentUrl === homePagePath || currentUrl.startsWith(homePagePath + '#');

    if (isHomePage) {
        document.querySelectorAll('.menu > li.current-menu-ancestor').forEach(parentItem => {
            const link = parentItem.querySelector('a');
            // Проверяем, есть ли у ссылки href атрибут и не является ли он пустым или равным '#'
            if (!link || !link.hasAttribute('href') || link.getAttribute('href').trim() === '' || link.getAttribute('href') === '#') {
                parentItem.classList.remove('current-menu-ancestor');
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const currentUrl = window.location.pathname; // Получаем относительный путь текущей страницы
    const homePagePath = '/'; // Относительный путь главной страницы
    const catalogPath = '/catalog/'; // Путь к разделу catalog
    const menuItemId = 'menu-item-1192'; // ID пункта меню

    // Проверка, является ли текущая страница главной
    const isHomePage = currentUrl === homePagePath || currentUrl.startsWith(homePagePath + '#');

    // Проверка, находится ли текущий URL в разделе catalog
    const isInCatalog = currentUrl.includes(catalogPath);

    // Если мы на главной странице, выполняем первую часть условия
    if (isHomePage) {
        document.querySelectorAll('.menu li.current-menu-ancestor').forEach(parentItem => {
            const link = parentItem.querySelector('a');

            // Проверяем, есть ли у ссылки href атрибут и не является ли он пустым или равным '#'
            if (!link || !link.hasAttribute('href') || link.getAttribute('href').trim() === '' || link.getAttribute('href') === '#') {
                parentItem.classList.remove('current-menu-ancestor');
            }
        });
    }

    // Если мы находимся в разделе catalog, добавляем класс current-menu-ancestor к элементу с нужным id
    if (isInCatalog) {
        const menuItem = document.getElementById(menuItemId);
        if (menuItem) {
            menuItem.classList.add('current-menu-ancestor');
        }
    }
});

/**
 * Установка корректного значения для --vh в css
 * т.к. мобильные включают в это значение свои панели
 */

function setVh() {
  // получаем 1% высоты окна
  let vh = window.innerHeight * 0.01;
  // задаём в корень CSS переменную --vh в формате px
  document.documentElement.style.setProperty('--vh', `${vh * 100}px`);

  // Определяем элемент шапки
  const header = document.querySelector('header.header'); // измените селектор, если нужно
  
  if (header) {
    // Получаем высоту шапки в пикселях
    const headerHeight = header.offsetHeight;
    // Записываем в CSS переменную --headerHeight
    document.documentElement.style.setProperty('--headerHeight', `${headerHeight}px`);
  } else {
    // Если шапки нет - сбрасываем в 0
    document.documentElement.style.setProperty('--headerHeight', `0px`);
  }  
}
setVh();
// обновляем при изменении размера окна (например, поворот устройства)
window.addEventListener('resize', setVh);




document.addEventListener('click', function(e) {
  // ищем кликнутое .thumbnail (поддерживает вложенные <img>)
  var thumb = e.target.closest('.thumbnail');
  if (!thumb) return;

  // находим ближайший контейнер галереи (подойдёт и для первого, и для второго блока)
  var gallery = thumb.closest('.product__img');
  if (!gallery) return;
  e.preventDefault();

  // коллекции миниатюр и основных фото внутри этого контейнера
  var thumbs = Array.from(gallery.querySelectorAll('.thumbnail'));
  var mains = Array.from(gallery.querySelectorAll('.main-photo'));

  // индекс текущей миниатюры
  var idx = thumbs.indexOf(thumb);
  if (idx === -1) return;

  // снять active у всех миниатюр и поставить текущую
  thumbs.forEach(function(t){ t.classList.remove('_active'); });
  thumb.classList.add('_active');

  // скрыть все main-photo и показать нужную
  mains.forEach(function(m){
    m.classList.remove('_active');
    // если у тебя используется display:none/пустое для показа — корректируем
    m.style.display = 'none';
  });
  var target = mains[idx];
  if (target) {
    target.classList.add('_active');
    target.style.display = '';
  }
});




















/**
 * Вы смотрели
 */
(function(){
  var STORAGE_KEY = 'recent_products';
  var MAX = 20;
  var MIN_SLIDES_FOR_SWIPER = 5; // Минимум 5 доступных для показа слайдов
  var container = document.getElementById('ag-viewed');
  var section = document.getElementById('ag-viewed-section');
  var swiperInstance = null;

  function getRecent(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch(e){ return []; } }
  function setRecent(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

  function isSingleProduct(){
    var cls = document.body.className || '';
    return /\bsingle-product\b/.test(cls);
  }

  function getProductIdFromBody(){
    var cls = document.body.className || '';
    var m = cls.match(/postid-(\d+)/);
    return m ? parseInt(m[1], 10) : null;
  }

  function addToRecent(id){
    if(!id) return;
    var arr = getRecent();
    arr = arr.filter(function(x){ return x !== id; });
    arr.unshift(id);
    if(arr.length > MAX) arr = arr.slice(0, MAX);
    setRecent(arr);
  }

  /**
   * Считаем сколько будет доступно для показа слайдов
   * (исключая текущий товар)
   */
  function countAvailableSlides() {
    if(!container) return 0;
    
    var slides = container.querySelectorAll('.swiper-slide');
    var currentId = getProductIdFromBody();
    var availableSlides = 0;
    
    // Считаем слайды, которые не являются текущим товаром
    slides.forEach(function(slide) {
      var link = slide.querySelector('a.item__link');
      if(link) {
        var url = link.getAttribute('href');
        var productIdFromUrl = extractProductIdFromUrl(url);
        if(!currentId || productIdFromUrl !== currentId.toString()) {
          availableSlides++;
        }
      } else {
        availableSlides++; // На всякий случай считаем
      }
    });
    
    return availableSlides;
  }

  /**
   * Извлекает ID товара из URL
   */
  function extractProductIdFromUrl(url) {
    // Пример: https://site.ru/product/name-123/
    var match = url.match(/\/(\d+)\/?$/);
    return match ? match[1] : null;
  }

  /**
   * Инициализируем Swiper только если доступных слайдов достаточно
   */
  function initSwiperIfNeeded() {
    if(!container || !section) return;
    
    var availableSlides = countAvailableSlides();
    
    if(availableSlides === 0) {
      section.style.display = 'none';
      console.log('📭 Нет доступных слайдов (текущий товар исключён) - скрываем секцию');
      return;
    }
    
    // Показываем секцию
    section.style.display = '';
    
    // Если доступных слайдов меньше минимума - НЕ инициализируем Swiper
    if(availableSlides < MIN_SLIDES_FOR_SWIPER) {
      console.log('📱 Доступно слайдов ' + availableSlides + ' (<' + MIN_SLIDES_FOR_SWIPER + ') - Swiper НЕ инициализируем');
      
      // Отключаем loop в data-атрибуте на всякий случай
      section.setAttribute('data-loop', 'false');
      return;
    }
    
    // Если доступных слайдов достаточно - инициализируем Swiper
    console.log('🚀 Доступно слайдов ' + availableSlides + ' (≥' + MIN_SLIDES_FOR_SWIPER + ') - инициализируем Swiper');
    
    setTimeout(function() {
      if(typeof Swiper === 'undefined') {
        console.error('Swiper не загружен!');
        return;
      }
      
      // Проверяем актуальное количество слайдов
      var actualSlides = container.querySelectorAll('.swiper-slide').length;
      var shouldLoop = actualSlides >= MIN_SLIDES_FOR_SWIPER * 2; // Для loop нужно больше слайдов
      
        swiperInstance = new Swiper('#ag-viewed-section .block__content', {
            loop: true, // Включаем loop
            speed: 300,
            spaceBetween: 0,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            slidesPerView: 'auto',
            // Будет крутиться бесконечно
        });
    }, 100);
  }

  function loadRecentIntoContainer(){
    if(!container || !section) return;
    
    section.style.display = '';
    
    var arr = getRecent().slice(0);
    if(!arr.length){
      section.style.display = 'none';
      return;
    }

    var current = getProductIdFromBody();
    if(current){
      arr = arr.filter(function(id){ return id !== current; });
    }
    
    if(!arr.length){
      section.style.display = 'none';
      return;
    }

    fetch('/wp-json/custom/v1/recent', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ids: arr})
    })
    .then(function(r){ 
      if(!r.ok) throw new Error('Network response was not ok');
      return r.json(); 
    })
    .then(function(data){
      if(data && data.html) {
        container.innerHTML = data.html;
        initSwiperIfNeeded();
      } else {
        section.style.display = 'none';
      }
    })
    .catch(function(err){
      console.error('ag recent fetch err', err);
      section.style.display = 'none';
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    if(isSingleProduct()){
      var pid = getProductIdFromBody();
      if(pid) addToRecent(pid);
    }
    loadRecentIntoContainer();
  });
})();