<?php
/**
 * ACF fields for reviews section.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter( 'acf/load_field/name=home_page_sections', 'alfa_reviews_add_widget_image_field', 20 );
function alfa_reviews_add_widget_image_field( $field ) {
	if ( empty( $field['type'] ) || 'flexible_content' !== $field['type'] || empty( $field['layouts'] ) ) {
		return $field;
	}

	foreach ( $field['layouts'] as $layout_index => $layout ) {
		$is_reviews_layout = ( $layout['name'] ?? '' ) === 'reviews';

		if ( ! $is_reviews_layout && ! empty( $layout['sub_fields'] ) ) {
			foreach ( $layout['sub_fields'] as $sub_field ) {
				if ( ( $sub_field['name'] ?? '' ) === 'ruchnaya_nastrojka_yandeks_vidzhet' ) {
					$is_reviews_layout = true;
					break;
				}
			}
		}

		if ( ! $is_reviews_layout ) {
			continue;
		}

		foreach ( $layout['sub_fields'] as $sub_field ) {
			if ( ( $sub_field['name'] ?? '' ) === 'izobrazhenie_vidzheta' ) {
				return $field;
			}
		}

		$toggle_key = '';
		foreach ( $layout['sub_fields'] as $sub_field ) {
			if ( ( $sub_field['name'] ?? '' ) === 'ruchnaya_nastrojka_yandeks_vidzhet' ) {
				$toggle_key = $sub_field['key'] ?? '';
				break;
			}
		}

		$image_field = array(
			'key'           => 'field_reviews_widget_image',
			'label'         => 'Изображение виджета',
			'name'          => 'izobrazhenie_vidzheta',
			'type'          => 'image',
			'parent'        => $layout['key'],
			'return_format' => 'id',
			'preview_size'  => 'medium',
			'library'       => 'all',
			'instructions'  => 'Картинка слева от виджета отзывов (режим Яндекс-виджета).',
		);

		if ( $toggle_key ) {
			$image_field['conditional_logic'] = array(
				array(
					array(
						'field'    => $toggle_key,
						'operator' => '!=',
						'value'    => '1',
					),
				),
			);
		}

		$field['layouts'][ $layout_index ]['sub_fields'][] = $image_field;
		break;
	}

	return $field;
}
