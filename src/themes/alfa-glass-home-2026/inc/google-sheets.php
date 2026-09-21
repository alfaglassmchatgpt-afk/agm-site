<?php
/**
 * Contact Form 7 → Google Sheets.
 *
 * Одна форма CF7 = один лист. На лист пишутся все поля формы,
 * плюс ID и время заявки.
 *
 * Диагностика: в ответе /feedback появляется ключ google_sheets,
 * плюс console.log в DevTools после отправки формы.
 *
 * Настройка:
 * 1. Вставьте URL веб-приложения Apps Script в AG_GS_WEBHOOK_URL.
 * 2. Секрет AG_GS_SECRET должен совпадать с SECRET в скрипте таблицы.
 * 3. При необходимости задайте названия листов в ag_gs_sheet_names().
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( function_exists( 'ag_gs_send_cf7_to_sheets' ) ) {
	return;
}

/** URL веб-приложения Google Apps Script (заканчивается на /exec). */
define('AG_GS_WEBHOOK_URL', getenv('AG_GS_WEBHOOK_URL') ?: '');

/** Общий секрет WordPress ↔ Apps Script. Смените на свой. */
define('AG_GS_SECRET', getenv('AG_GS_SECRET') ?: '');

/**
 * Необязательная карта: ID формы CF7 => имя листа.
 * Если формы нет в списке, берётся название формы из админки CF7.
 * Скрипт таблицы сам создаст лист, если его ещё нет.
 *
 * @return array<int, string>
 */
function ag_gs_sheet_names() {
	return array(
		// 3128 => 'Заявки',
	);
}

add_action( 'wpcf7_mail_sent', 'ag_gs_send_cf7_to_sheets' );
add_filter( 'wpcf7_feedback_response', 'ag_gs_add_debug_to_cf7_response', 10, 2 );
add_action( 'wp_footer', 'ag_gs_debug_console_script', 99 );

/**
 * Кладёт google_sheets в JSON ответа CF7 — видно в Network у /feedback.
 *
 * @param array $response Ответ REST CF7.
 * @param array $result   Результат сабмита.
 * @return array
 */
function ag_gs_add_debug_to_cf7_response( $response, $result ) {
	unset( $result );
	$response['google_sheets'] = ag_gs_last_result();
	if ( function_exists( 'cfr_request_last_result' ) ) {
		$response['request_post'] = cfr_request_last_result();
	}
	return $response;
}

/**
 * Хранит итог последней попытки записи в таблицу (в пределах запроса).
 *
 * @param array|null $set Новое значение.
 * @return array
 */
function ag_gs_last_result( $set = null ) {
	static $result = array(
		'attempted' => false,
		'ok'        => false,
		'message'   => 'Google Sheets ещё не вызывался. Хук срабатывает только после mail_sent.',
	);

	if ( $set !== null ) {
		$result = $set;
	}

	return $result;
}

/**
 * console.log статуса Sheets после сабмита CF7.
 */
function ag_gs_debug_console_script() {
	if ( is_admin() ) {
		return;
	}
	?>
<script>
(function () {
	console.log('[Alfa Glass] Диагностика заявок активна. Логи Google Sheets и request появятся ПОСЛЕ отправки формы CF7.');
	function logSheets(event) {
		var res = event && event.detail && event.detail.apiResponse ? event.detail.apiResponse : {};
		var sheets = res.google_sheets;
		var requestPost = res.request_post;
		if (event.type === 'wpcf7mailfailed') {
			console.warn('[Alfa Glass] Письмо CF7 не ушло, Google Sheets не вызывается.', res.status, res.message);
			return;
		}
		console.log('[Alfa Glass] CF7', event.type, '| status:', res.status, '| message:', res.message);
		if (!sheets) {
			console.warn('[Alfa Glass] В ответе нет google_sheets — google-sheets.php, скорее всего, не подключён.');
		} else if (sheets.ok) {
			console.log('[Alfa Glass] Google Sheets: OK', sheets);
		} else {
			console.warn('[Alfa Glass] Google Sheets: НЕ записалось', sheets);
		}
		if (requestPost) {
			if (requestPost.ok) {
				console.log('[Alfa Glass] Заявка в админке: OK', requestPost);
			} else {
				console.warn('[Alfa Glass] Заявка в админке: НЕ создана', requestPost);
			}
		}
	}
	document.addEventListener('wpcf7submit', logSheets, false);
	document.addEventListener('wpcf7mailsent', logSheets, false);
	document.addEventListener('wpcf7mailfailed', logSheets, false);
})();
</script>
	<?php
}

/**
 * Отправляет успешную заявку CF7 в Google Sheets.
 *
 * @param WPCF7_ContactForm $contact_form Форма.
 */
function ag_gs_send_cf7_to_sheets( $contact_form ) {
	$url = defined( 'AG_GS_WEBHOOK_URL' ) ? trim( (string) AG_GS_WEBHOOK_URL ) : '';

	if ( $url === '' || strpos( $url, 'https://' ) !== 0 ) {
		ag_gs_last_result(
			array(
				'attempted' => false,
				'ok'        => false,
				'message'   => 'AG_GS_WEBHOOK_URL пустой или не https.',
			)
		);
		return;
	}

	if ( ! class_exists( 'WPCF7_Submission' ) ) {
		ag_gs_last_result(
			array(
				'attempted' => false,
				'ok'        => false,
				'message'   => 'Класс WPCF7_Submission недоступен.',
			)
		);
		return;
	}

	$submission = WPCF7_Submission::get_instance();

	if ( ! $submission ) {
		ag_gs_last_result(
			array(
				'attempted' => false,
				'ok'        => false,
				'message'   => 'Нет объекта WPCF7_Submission.',
			)
		);
		return;
	}

	$form_id    = (int) $contact_form->id();
	$form_title = $contact_form->title();
	$sheet_map  = ag_gs_sheet_names();
	$sheet_name = isset( $sheet_map[ $form_id ] ) ? $sheet_map[ $form_id ] : $form_title;

	$payload = array(
		'secret'     => AG_GS_SECRET,
		'form_id'    => $form_id,
		'form_title' => $form_title,
		'sheet'      => $sheet_name,
		'submitted'  => current_time( 'mysql' ),
		'fields'     => ag_gs_collect_cf7_fields( $submission ),
	);

	$response = wp_remote_post(
		$url,
		array(
			'timeout'     => 15,
			// Apps Script отвечает 302; следование редиректу превращает POST в GET.
			'redirection' => 0,
			'blocking'    => true,
			'headers'     => array(
				'Content-Type' => 'application/json; charset=utf-8',
			),
			'body'        => wp_json_encode( $payload, JSON_UNESCAPED_UNICODE ),
		)
	);

	$debug = ag_gs_parse_apps_script_response( $response, $form_id, $sheet_name );

	ag_gs_last_result( $debug );
	error_log( 'CF7 Google Sheets: ' . wp_json_encode( $debug, JSON_UNESCAPED_UNICODE ) );
}

/**
 * Разбирает ответ Apps Script, при 302 читает Location (там JSON doPost).
 *
 * @param array|WP_Error $response   Ответ wp_remote_post.
 * @param int            $form_id    ID формы.
 * @param string         $sheet_name Имя листа.
 * @return array
 */
function ag_gs_parse_apps_script_response( $response, $form_id, $sheet_name ) {
	$debug = array(
		'attempted'  => true,
		'ok'         => false,
		'form_id'    => (int) $form_id,
		'sheet'      => (string) $sheet_name,
		'http_code'  => 0,
		'apps_script'=> null,
		'message'    => '',
	);

	if ( is_wp_error( $response ) ) {
		$debug['message'] = 'wp_remote_post: ' . $response->get_error_message();
		return $debug;
	}

	$code     = (int) wp_remote_retrieve_response_code( $response );
	$body     = (string) wp_remote_retrieve_body( $response );
	$location = wp_remote_retrieve_header( $response, 'location' );

	$debug['http_code'] = $code;

	// ContentService у Apps Script почти всегда отвечает 302 + Location с JSON.
	if ( $code === 302 && $location ) {
		$follow = wp_remote_get(
			$location,
			array(
				'timeout'     => 15,
				'redirection' => 5,
			)
		);

		if ( ! is_wp_error( $follow ) ) {
			$body = (string) wp_remote_retrieve_body( $follow );
		}
	}

	$decoded = json_decode( $body, true );

	if ( is_array( $decoded ) ) {
		$debug['apps_script'] = $decoded;
		if ( ! empty( $decoded['ok'] ) ) {
			$debug['ok']      = true;
			$debug['message'] = 'Записано в лист «' . ( isset( $decoded['sheet'] ) ? $decoded['sheet'] : $sheet_name ) . '»';
			if ( isset( $decoded['id'] ) ) {
				$debug['row_id'] = $decoded['id'];
			}
			return $debug;
		}

		$debug['message'] = isset( $decoded['error'] ) ? (string) $decoded['error'] : 'Apps Script вернул ok: false';
		return $debug;
	}

	if ( in_array( $code, array( 200, 302 ), true ) ) {
		$debug['ok']      = true;
		$debug['message'] = 'HTTP ' . $code . ', но тело Apps Script не JSON. POST, скорее всего, дошёл; проверьте таблицу.';
		return $debug;
	}

	$debug['message'] = 'HTTP ' . $code . ( $body !== '' ? ': ' . substr( $body, 0, 300 ) : '' );
	return $debug;
}

/**
 * Собирает все пользовательские поля формы, без служебных ключей CF7.
 *
 * @param WPCF7_Submission $submission Отправка.
 * @return array<string, string>
 */
function ag_gs_collect_cf7_fields( $submission ) {
	$posted = $submission->get_posted_data();

	if ( ! is_array( $posted ) ) {
		$posted = array();
	}

	$skip_exact = array(
		'g-recaptcha-response',
		'h-captcha-response',
		'cf-turnstile-response',
		'_wpcf7_unit_tag',
		'_wpcf7_container_post',
		'_wpcf7_posted_data_hash',
		'_wpcf7_recaptcha_response',
	);

	$fields = array();

	foreach ( $posted as $key => $value ) {
		$key = (string) $key;

		if ( $key === '' || strpos( $key, '_wpcf7' ) === 0 ) {
			continue;
		}

		if ( in_array( $key, $skip_exact, true ) ) {
			continue;
		}

		$fields[ $key ] = ag_gs_stringify_field( $value );
	}

	$uploaded = $submission->uploaded_files();

	if ( is_array( $uploaded ) ) {
		foreach ( $uploaded as $key => $paths ) {
			$key = (string) $key;

			if ( isset( $fields[ $key ] ) && $fields[ $key ] !== '' ) {
				continue;
			}

			if ( ! is_array( $paths ) ) {
				$paths = array( $paths );
			}

			$names = array();

			foreach ( $paths as $path ) {
				if ( is_string( $path ) && $path !== '' ) {
					$names[] = wp_basename( $path );
				}
			}

			if ( $names ) {
				$fields[ $key ] = implode( ', ', $names );
			}
		}
	}

	return $fields;
}

/**
 * @param mixed $value Значение поля CF7.
 * @return string
 */
function ag_gs_stringify_field( $value ) {
	if ( is_array( $value ) ) {
		$parts = array();

		foreach ( $value as $item ) {
			if ( $item === null || $item === false || $item === '' ) {
				continue;
			}

			$parts[] = is_scalar( $item ) ? (string) $item : wp_json_encode( $item, JSON_UNESCAPED_UNICODE );
		}

		return implode( ', ', $parts );
	}

	if ( $value === null || $value === false ) {
		return '';
	}

	return is_scalar( $value ) ? (string) $value : wp_json_encode( $value, JSON_UNESCAPED_UNICODE );
}
