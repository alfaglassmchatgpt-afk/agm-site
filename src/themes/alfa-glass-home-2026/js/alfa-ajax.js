jQuery(function ($) {
	function loadMoreContent($btn, data, $listSelector, textSelector) {
		var $text = $btn.find(textSelector).text();
		$.ajax({
			url: alfa.ajaxurl,
			data: data,
			type: 'POST',
			beforeSend: function () {
				$btn.find(textSelector).text('Загрузка...');
			},
			success: function (response) {
				if (response.content) {
					$btn.parent().before(response.content);
					$btn.data('page', data.page + 1);
					if (response.is_last_page) {
						$btn.parent().remove();
					} else {
						$btn.find(textSelector).text($text);
					}
				} else {
					$btn.parent().remove();
				}
			}
		});
	}

	// Загрузка постов блога
	$('.blog .btn__load').on('click', function () {
		var $btn = $(this);
		var page = $btn.data('page');
		loadMoreContent($btn, { page: page, action: 'load_more_posts' }, 'span');
		return false;
	});

	// Загрузка продуктов
	$('.category__child-term .btn__load').on('click', function () {
		var $btn = $(this);
		var page = $btn.data('page');
		var term_id = $btn.data('term');
		var style = $btn.data('style');
		loadMoreContent($btn, { page: page, term: term_id, style: style, action: 'load_more_products' }, 'span');
		return false;
	});

	// Загрузка продуктов в конфигураторе
	$('.configurator__menu .load__more').on('click', function () {
		const $btn = $(this);
		const $target = $(this).data('term');
		const page = $btn.data('page');
		const $containerPane = $(`.tab_pane[data-id=${$target}]`);
		const data = {
			page: page,
			term_slug: $target,
			action: 'configurator_load_more',
		}
		$.ajax({
			url: alfa.ajaxurl,
			data: data,
			type: 'POST',
			success: function (response) {
				if (response.contentPane && response.contentTab) {
					$containerPane.append(response.contentPane);
					$btn.before(response.contentTab);
					$btn.data('page', data.page + 1);
					if (response.is_last_page) {
						$btn.remove();
					}
				} else {
					$btn.remove();
				}
			}
		});
		return false;
	});


	// Поиск
	$('.live-search-on input[name="s"]').on('focus', function () {
		const seff = $(this);
		if (seff.val() == seff.prop("defaultValue")) {
			seff.val('');
		}
	});

	$('.live-search-on input[name="s"]').on('keyup', function () {
		const key = $(this).val();
		const trim_key = key.trim();

		const seff = $(this);
		const post_type = seff.parents('.live-search-on').find('input[name="type"]').val();
		const container = $('.list-product-search');

		if (key && trim_key) {
			$.ajax({
				type: 'POST',
				url: alfa.ajaxurl,
				data: {
					action: 'live_search',
					key: key,
					post_type: post_type,
				},
				beforeSend: function (xhr) {
					container.html('<i>Поиск...</i>');
				},
				success: function (response) {
					var data = response.message;
					var status = response.status;
					container.html(data).addClass('search_val__find');
					container.append('<button class="search__reset">Сбросить поиск</button>')
					if ('false' == status) {
						seff.parents('.live-search-on').find('.search-submit').prop('disabled', true);
						seff.attr('aria-invalid', 'true');
					} else {
						seff.parents('.live-search-on').find('.search-submit').prop('disabled', false);
						seff.attr('aria-invalid', 'flase');
					}

				},
				error: function (MLHttpRequest, textStatus, errorThrown) {

					console.log(errorThrown);
				}
			});
		} else {
			$.ajax({
				type: 'POST',
				url: alfa.ajaxurl,
				data: {
					action: 'live_search_reset',
				},
				success: function (response) {
					var data = response.message;
					container.html(data).removeClass('search_val__find');
				}
			});
		}
	});

	$(document).on('click', '.search__reset', function () {
		const container = $('.list-product-search');
		$('.search-field').val('');
		$.ajax({
			type: 'POST',
			url: alfa.ajaxurl,
			data: {
				action: 'live_search_reset',
			},
			success: function (response) {
				var data = response.message;
				container.html(data).removeClass('search_val__find');
			}
		});
	})
});