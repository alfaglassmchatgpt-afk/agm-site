<?php
/**
 * Alfa-glass Theme Customizer
 *
 * @package Alfa-glass
 */

/**
 * Add postMessage support for site title and description for the Theme Customizer.
 *
 * @param WP_Customize_Manager $wp_customize Theme Customizer object.
 */
function alfa_glass_customize_register( $wp_customize ) {
	$wp_customize->add_section('alfa_pages_settings', array(
		'title'    => __('Настройки страниц', 'alfa-glass'),
		'priority' => 30,
	));
	$wp_customize->add_setting( 'alfa_selected_page_404', array(
        'default'           => '',
        'sanitize_callback' => 'absint', // Для очистки и валидации значения
    ) );
	$wp_customize->add_control( 'alfa_selected_page_404', array(
		'label'       => __( 'Страница 404', 'alfa-glass' ),
		'section'     => 'alfa_pages_settings', // ID секции, где это поле будет отображено
		'type'        => 'dropdown-pages',
		'settings'	=> 'alfa_selected_page_404'
	) );

	 




}
add_action( 'customize_register', 'alfa_glass_customize_register' );


if (class_exists('Kirki')) {
	new \Kirki\Section(
		'contacts_section',
		[
			'title'       => esc_html__('Контакты', 'alfa-glass'),
			'priority'    => 40,
		]
	);
	new \Kirki\Field\Text( [
		'settings' => 'contact_phone',
		'label'    => esc_html__( 'Телефон', 'alfa-glass' ),
		'section'  => 'contacts_section',
		'priority' => 10,
	]);
	new \Kirki\Field\Text( [
		'type'		=> 'text',
		'settings' => 'contact_mail',
		'label'    => esc_html__( 'E-mail', 'alfa-glass' ),
		'section'  => 'contacts_section',
		'priority' => 20,
	]);
	new \Kirki\Field\Textarea( [
		'type'		=> 'text',
		'settings' => 'contact_address',
		'label'    => esc_html__( 'Адрес', 'alfa-glass' ),
		'section'  => 'contacts_section',
		'priority' => 25,
	]);
	new \Kirki\Field\Repeater( [
		'settings'    => 'contacts_links',
		'label'       => esc_html__('Социальные сети и мессенджеры', 'alfa-glass'),
		'section'     => 'contacts_section',
		'priority'    => 30,
		'row_label'   => [
			'value' => esc_html__('Соцсеть', 'alfa-glass'),
		],
		'button_label' => esc_html__('Добавить соцсеть', 'alfa-glass'),
		'fields'      => [
			'link' => [
					'type'        => 'link',
					'label'       => esc_html__('Ссылка', 'alfa-glass'),
					'description' => esc_html__('Введите URL', 'alfa-glass'),
			],
			'icon' => [
					'type'        => 'image',
					'label'       => esc_html__('Выберите иконку (SVG)', 'alfa-glass'),
					'description' => esc_html__('Выберите SVG файл из медиабиблиотеки', 'alfa-glass'),
					'mime_type'   => 'image/svg+xml',
			],
		],
	]);

	new \Kirki\Section(
		'product_section',
		[
			'title'       => esc_html__('Страница товара', 'alfa-glass'),
			'priority'    => 40,
		]
	);
	new \Kirki\Field\Textarea(
		[
			'settings'    => 'price_desc',
			'label'       => esc_html__( 'Текст сноски о цене', 'alfa-glass' ),
			'section'     => 'product_section',
			'default'     => esc_html__( '*(Стоимость является ориентировочной, для получения подробного рассчета отправьте тех. задание в офис нашей компании)', 'alfa-glass' ),
		]
	);

	$forms = array();
	$cf7_forms = get_posts( array( 'post_type' => 'wpcf7_contact_form', 'numberposts' => -1 ) );

	if ( $cf7_forms ) {
		foreach ( $cf7_forms as $form ) {
			$forms[ $form->ID ] = $form->post_title;
		}
	}

	new \Kirki\Section(
		'footer_section',
		[
			'title'       => esc_html__('Подвал сайта', 'alfa-glass'),
			'priority'    => 45,
		]
	);
	new \Kirki\Field\Text(
		[
			'type'		=> 'text',
			'settings'    => 'consalt_title',
			'label'       => esc_html__( 'Заголовок блока Консультация', 'alfa-glass' ),
			'section'     => 'footer_section',
			'default'     => '',
		]
	);
	new \Kirki\Field\Text(
		[
			'type'		=> 'text',
			'settings'    => 'consalt_subtitle',
			'label'       => esc_html__( 'Подзаголовок блока Консультация', 'alfa-glass' ),
			'section'     => 'footer_section',
			'default'     => '',
		]
	);
	new \Kirki\Field\Textarea(
		[
			'settings'    => 'consalt_desc',
			'label'       => esc_html__( 'Текст блока Консультация', 'alfa-glass' ),
			'section'     => 'footer_section',
			'default'     => '',
		]
	);
	new \Kirki\Field\Image(
		[
			'settings'    => 'consalt_setting_url',
			'label'       => esc_html__( 'Фотография фона', 'alfa-glass' ),
			'section'     => 'footer_section',
			'default'     => '',
		]
	);
	new \Kirki\Field\Text(
		[
			'type'		=> 'text',
			'settings'    => 'consalt_btn_text',
			'label'       => esc_html__( 'Текст кнопки', 'alfa-glass' ),
			'section'     => 'footer_section',
			'default'     => '',
		]
	);
	new \Kirki\Field\Select(
		[
			'settings'    => 'consalt_form',
			'label'       => esc_html__( 'Форма консультации', 'alfa-glass' ),
			'section'     => 'footer_section',
			'default'     => '',
			'placeholder' => esc_html__( 'Выберите форму', 'alfa-glass' ),
			'choices'     => $forms
		]
	);
	new \Kirki\Field\Select(
		[
			'settings'    => 'contact_form',
			'label'       => esc_html__( 'Форма контакта', 'alfa-glass' ),
			'section'     => 'footer_section',
			'default'     => '',
			'placeholder' => esc_html__( 'Выберите форму', 'alfa-glass' ),
			'choices'     => $forms
		]
	);
	new \Kirki\Field\Select(
		[
			'settings'    => 'main_form',
			'label'       => esc_html__( 'Основная Форма заявки', 'alfa-glass' ),
			'section'     => 'footer_section',
			'default'     => '',
			'placeholder' => esc_html__( 'Выберите форму', 'alfa-glass' ),
			'choices'     => $forms
		]
	);


}