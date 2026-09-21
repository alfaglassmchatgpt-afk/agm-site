<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
class Elementor_Article_Cards_Widget extends \Elementor\Widget_Base {
	
   public function get_name() {
		return 'article_cards';
	}

	public function get_title() {
		return __( 'Article Cards', 'elementor-screpter' );
	}

	public function get_icon() {
		return 'eicon-post-list';
	}
	public function get_keywords() {
		return [ 'blog', 'post', 'recent post', 'carousel', 'slider' ];
	}
	public function get_categories() {
		return [ 'screpter-addon' ];
	}
	protected function is_dynamic_content(): bool {
		return false;
	}
	public function get_style_depends(): array {
        return [ 'article-cards-style' ]; // Имя вашего стиля
    }
	 public function get_script_depends() {
        return [ 'swiper', 'article-cards-script' ]; // Указываем ваш скрипт
    }

	

    protected function _register_controls() {		
		$this->start_controls_section(
			'content_title',
			[
					'label' => __( 'Заголовок', 'elementor-screpter' ),
					'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
			]
		);				
		
		$this->add_control(
			'title_text',
			[
				'label' => __( 'Текст заголовка', 'elementor-screpter' ),
				'type' => \Elementor\Controls_Manager::TEXT,
				'default' => __( 'Другие статьи', 'elementor-screpter' ),
				'label_block' => true,
			]
		);
		$this->add_control(
			'title_size',
			[
				'label' => esc_html__( 'HTML Tag', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SELECT,
				'options' => [
					'h1' => 'H1',
					'h2' => 'H2',
					'h3' => 'H3',
					'h4' => 'H4',
					'h5' => 'H5',
					'h6' => 'H6',
					'div' => 'div',
					'span' => 'span',
					'p' => 'p',
				],
				'default' => 'h2',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'content_section',
			[
					'label' => __( 'Запрос', 'elementor-screpter' ),
					'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'posts_number',
			[
					'label' => __( 'Number of Posts', 'elementor-screpter' ),
					'type' => \Elementor\Controls_Manager::NUMBER,
					'default' => 4,
			]
		);

		$this->add_control(
			'sort_order',
			[
				'label' => __( 'Sort Order', 'elementor-screpter' ),
				'type' => \Elementor\Controls_Manager::SELECT,
				'default' => 'default',
				'options' => [
						'default' => __( 'По порядку', 'elementor-screpter' ),
						'date' => __( 'По дате', 'elementor-screpter' ),
						'rand' => __( 'Случайный порядок', 'elementor-screpter' ),
				],
			]
		);
		$this->add_control(
			'manual_posts',
			[
				'label' => __( 'Select Posts', 'elementor-screpter' ),
				'type' => \Elementor\Controls_Manager::SELECT2,
				'options' => $this->get_available_posts(), // Метод для получения списка постов
				'multiple' => true,
				'label_block' => true,
				'default' => [],
				
			]
		);
      $this->end_controls_section();

		$this->start_controls_section(
			'hover_section',
			[
				'label' => __( 'Настройки ховера', 'elementor-screpter' ),
				'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
			]
		);
		$this->add_control(
			'hover_text',
			[
				'label' => __( 'Текст кнопки/ховера', 'elementor-screpter' ),
				'type' => \Elementor\Controls_Manager::TEXT,
				'default' => __( 'Читать больше', 'elementor-screpter' ),
				'label_block' => true,
			]
		);
		$this->add_control(
			'hover_icon',
			[
				'label' => __( 'Иконка', 'elementor-screpter' ),
				'type' => \Elementor\Controls_Manager::ICONS,
				'default' => [
						'value' => 'fas fa-arrow-right',
						'library' => 'fa-solid',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'slider',
			[
				'label' => __( 'Слайдер', 'elementor-screpter' ),
				'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
			]
		);

		$slides_to_show = range( 1, 10 );
		$slides_to_show = array_combine( $slides_to_show, $slides_to_show );

		$this->add_responsive_control(
			'slides_to_show',
			[
				'label' => esc_html__( 'Slides to Show', 'elementor' ),
				'type' =>\Elementor\Controls_Manager::SELECT,
				'options' => [
					'' => esc_html__( 'Default', 'elementor' ),
				] + $slides_to_show,
				'frontend_available' => true,
				'render_type' => 'template',
				'selectors' => [
					'{{WRAPPER}}' => '--e-image-carousel-slides-to-show: {{VALUE}}',
				],
				'content_classes' => 'elementor-control-field-select-small',
			]
		);
		$this->add_control(
			'lazyload',
			[
				'label' => esc_html__( 'Lazyload', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SWITCHER,
				'frontend_available' => true,
			]
		);
		$this->add_control(
			'autoplay',
			[
				'label' => esc_html__( 'Autoplay', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default' => 'yes',
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'pause_on_hover',
			[
				'label' => esc_html__( 'Pause on Hover', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default' => 'yes',
				'condition' => [
					'autoplay' => 'yes',
				],
				'render_type' => 'none',
				'frontend_available' => true,
			]
		);
		$this->add_control(
			'pause_on_interaction',
			[
				'label' => esc_html__( 'Pause on Interaction', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default' => 'yes',
				'condition' => [
					'autoplay' => 'yes',
				],
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'autoplay_speed',
			[
				'label' => esc_html__( 'Autoplay Speed', 'elementor' ),
				'type' => \Elementor\Controls_Manager::NUMBER,
				'default' => 5000,
				'condition' => [
					'autoplay' => 'yes',
				],
				'render_type' => 'none',
				'frontend_available' => true,
			]
		);

		// Loop requires a re-render so no 'render_type = none'
		$this->add_control(
			'infinite',
			[
				'label' => esc_html__( 'Infinite Loop', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default' => 'yes',
				'frontend_available' => true,
			]
		);
		$this->add_control(
			'speed',
			[
				'label' => esc_html__( 'Animation Speed', 'elementor' ),
				'type' => \Elementor\Controls_Manager::NUMBER,
				'default' => 500,
				'render_type' => 'none',
				'frontend_available' => true,
			]
		);
		$this->end_controls_section();
		$this->start_controls_section(
			'section_title_style',
			[
				'label' => esc_html__( 'Heading', 'elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);
		$this->add_control(
			'title_color',
			[
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => \Elementor\Controls_Manager::COLOR,
				'global' => [
					'default' => Global_Colors::COLOR_PRIMARY,
				],
				'selectors' => [
					'{{WRAPPER}} .blog__header .title' => 'color: {{VALUE}};',
				],
			]
		);
		$this->add_group_control(
			\Elementor\Group_Control_Typography::get_type(),
			[
				'name' => 'typography',
				'global' => [
					'default' => Global_Typography::TYPOGRAPHY_PRIMARY,
				],
				'selector' => '{{WRAPPER}} .blog__header .title',
			]
		);
		$this->add_responsive_control(
			'title_gap',
			[
				'label' => __( 'Нижний отступ', 'elementor-screpter' ),
				'type' => \Elementor\Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem' ], // Единицы измерения
				'range' => [
						'px' => [
							'min' => 0,
							'max' => 100,
						],
						'em' => [
							'min' => 0,
							'max' => 5,
						],
						'rem' => [
							'min' => 0,
							'max' => 10,
						],
				],
				'selectors' => ['{{WRAPPER}} .blog__header'=> 'margin-bottom: {{SIZE}}{{UNIT}};'],
				'default' => [
						'unit' => 'rem',
						'size' => 6,
				],
				'render_type' => 'template'
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style_hover',
			[
				'label' => esc_html__( 'Ховер', 'elementor-screpter' ),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);
		$this->add_responsive_control(
			'icon_size',
			[
				'label' => esc_html__( 'Размер иконки', 'elementor-screpter' ),
				'type' => \Elementor\Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'range' => [
					'rem' => [
						'max' => 10,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .screpter-article-cards .swiper-slide .item__hover .hover__text svg' => 'height: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .screpter-article-cards .swiper-slide .item__hover .hover__text i' => 'font-size: {{SIZE}}{{UNIT}};',
				],
			]
		);
		$this->add_group_control(
			\Elementor\Group_Control_Typography::get_type(),
			[
				'name' => 'hover_text_typography', 
				'label' => __( 'Типографика текста', 'elementor-screpter' ),
				'selector' => '{{WRAPPER}} .item__hover .hover__text span',
			]
		);
		$this->add_responsive_control(
			'icon_color',
			[
				'label' => esc_html__( 'Цвет', 'elementor-screpter' ),
				'type' => \Elementor\Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .screpter-article-cards .swiper-slide .item__hover .hover__text' => 'color: {{VALUE}};',
					'{{WRAPPER}} .screpter-article-cards .swiper-slide .item__hover .hover__text svg, {{WRAPPER}} .screpter-article-cards .swiper-slide .item__hover .hover__text path' => 'fill: {{VALUE}};',
				],
			]
		);
		$this->add_responsive_control(
			'hover_text_icon_gap',
			[
				'label' => __( 'Расстояние между текстом и иконкой', 'elementor-screpter' ),
				'type' => \Elementor\Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem' ], // Единицы измерения
				'range' => [
						'px' => [
							'min' => 0,
							'max' => 100,
						],
						'em' => [
							'min' => 0,
							'max' => 5,
						],
						'rem' => [
							'min' => 0,
							'max' => 5,
						],
				],
				'selectors' => [
						'{{WRAPPER}} .item__hover .hover__text' => 'gap: {{SIZE}}{{UNIT}};',
				],
				'default' => [
						'unit' => 'rem',
						'size' => 1,
				],
			]
		);
		$this->end_controls_section();

		$this->start_controls_section(
			'section_style_image',
			[
				'label' => esc_html__( 'Изображение', 'elementor-screpter' ),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);
		$this->add_responsive_control(
			'items_gap',
			[
				'label' => __( 'Отступ между карточками', 'elementor-screpter' ),
				'type' => \Elementor\Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem' ], // Единицы измерения
				'range' => [
						'px' => [
							'min' => 0,
							'max' => 100,
						],
						'em' => [
							'min' => 0,
							'max' => 5,
						],
						'rem' => [
							'min' => 0,
							'max' => 5,
						],
				],
				'selectors' => [
					'{{WRAPPER}} .screpter-article-cards .post-list .swiper-slide' => 'padding-right: calc({{SIZE}}{{UNIT}} / 2); padding-left: calc({{SIZE}}{{UNIT}} / 2);',
					'{{WRAPPER}} .screpter-article-cards .post-list' => 'margin-right: calc({{SIZE}}{{UNIT}} / -2); margin-left: calc({{SIZE}}{{UNIT}} / -2);',
						
				],
				'default' => [
						'unit' => 'rem',
						'size' => 2,
				],
				'render_type' => 'template'
			]
		);
		$this->add_responsive_control(
			'image_border_radius',
			[
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => \Elementor\Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors' => [
					'{{WRAPPER}} .screpter-article-cards .swiper-slide .item__link' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);
		$this->end_controls_section();

		$this->start_controls_section(
			'description_style',
			[
				'label' => esc_html__( 'Подпись', 'elementor-screpter' ),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);
		$this->add_control(
			'text_color',
			[
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => \Elementor\Controls_Manager::COLOR,
				'global' => [
					'default' => Global_Colors::COLOR_PRIMARY,
				],
				'selectors' => [
					'{{WRAPPER}} .item .title' => 'color: {{VALUE}};',
				],
			]
		);
		$this->add_group_control(
			\Elementor\Group_Control_Typography::get_type(),
			[
				'name' => 'item_title_typography',
				'global' => [
					'default' => Global_Typography::TYPOGRAPHY_PRIMARY,
				],
				'selector' => '{{WRAPPER}} .item .title',
			]
		);
		$this->add_responsive_control(
			'text_padding',
			[
					'label'      => esc_html__( 'Отступы', 'elementor-screpter' ),
					'type'       => \Elementor\Controls_Manager::DIMENSIONS,
					'size_units' => [ 'px', '%', 'em', 'rem' ],
					'selectors'  => [
						'{{WRAPPER}} .item .title' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
					],
			]
		);
		$this->end_controls_section();

		$this->start_controls_section(
			'Additionall_style',
			[
				'label' => esc_html__( 'Дополнительные настройки', 'elementor-screpter' ),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);
		$this->add_responsive_control(
			'overflow',
			[
				'label' => esc_html__( 'Overflow', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'' => esc_html__( 'Default', 'elementor' ),
					'hidden' => esc_html__( 'Hidden', 'elementor' ),
					'auto' => esc_html__( 'Auto', 'elementor' ),
					'visible' => esc_html__( 'Показывать', 'elementor-screpter' ),
				],
				'selectors' => [
					'{{WRAPPER}} ' => '--overflow: {{VALUE}}',
				],
			]
		);$this->add_responsive_control(
			'container_padding',
			[
					'label'      => esc_html__( 'Внутренние Отступы', 'elementor-screpter' ),
					'type'       => \Elementor\Controls_Manager::DIMENSIONS,
					'size_units' => [ 'px', '%', 'em', 'rem' ],
					'selectors'  => [
						'{{WRAPPER}} .post-list-wrapper' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
					],
			]
		);
    }
	 protected function get_available_posts() {
		$posts = get_posts( [ 'numberposts' => -1 ] );
		$post_options = [];
		foreach ( $posts as $post ) {
			$post_options[ $post->ID ] = $post->post_title;
		}
		return $post_options;
	}


    protected function render() {
        $settings = $this->get_settings_for_display();
		  $lazyload = 'yes' === $settings['lazyload'];
        $query_args = [
			'posts_per_page' => $settings['posts_number'],
			'orderby'        => $settings['sort_order'],
			'order'          => 'DESC', // Можно сделать настраиваемым
			'post__not_in'   => [ get_the_ID() ], // Исключаем текущий пост
			'post_type'      => 'post',
			'post_status'    => 'publish',
		];

		// Если выбрана сортировка по умолчанию
		if ( $settings['sort_order'] === 'default' ) {
			$query_args['orderby'] = 'menu_order';
			$query_args['order'] = 'ASC';
		}

		// Если выбраны конкретные посты
		if ( ! empty( $settings['manual_posts'] ) ) {
			$query_args['post__in'] = $settings['manual_posts'];
			$query_args['orderby'] = 'post__in'; // Сохраняем пользовательский порядок
		}

		$query = new WP_Query( $query_args );

      if ( $query->have_posts() ) {
			$slider_options = [
				'autoplay' => $settings['autoplay'] === 'yes',
            'speed' => $settings['speed'],
            'loop' => $settings['infinite'] === 'yes',
            // Добавьте другие параметры слайдера здесь...
        ];
		  $slider_options_json = wp_json_encode( $slider_options );
			echo '<div class="screpter-article-cards" data-slider-options="' . esc_attr( wp_json_encode( $slider_options_json ) ) . '">';
			?>
			<div class="blog__header">
					<div class="title__wrapper">
						<?php
						$title = wp_kses_post( $settings['title_text'] );
						$title_html = sprintf( '<%1$s %2$s>%3$s</%1$s>', \Elementor\Utils::validate_html_tag( $settings['title_size'] ), 'class="title"', $title );
						echo $title_html;
						?>
					</div>					
					<div class="btn__group btn__group_slider">
						<div class="btn btn__slider btn__prev">
							<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
								<circle cx="30" cy="30" r="29.2772" stroke="#000" stroke-width="1.44565" />
								<path fill-rule="evenodd" clip-rule="evenodd" d="M32.7076 25.2929C33.0981 25.6834 33.0981 26.3166 32.7076 26.7071L29.4147 30L32.7076 33.2929C33.0981 33.6834 33.0981 34.3166 32.7076 34.7071C32.3171 35.0976 31.6839 35.0976 31.2934 34.7071L27.2934 30.7071C26.9029 30.3166 26.9029 29.6834 27.2934 29.2929L31.2934 25.2929C31.6839 24.9024 32.3171 24.9024 32.7076 25.2929Z" fill="#000" />
							</svg>
						</div>
						<div class="btn btn__slider btn__next">
							<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
								<circle cx="30" cy="30" r="29.2772" stroke="#000" stroke-width="1.44565" />
								<path fill-rule="evenodd" clip-rule="evenodd" d="M27.2924 25.2929C26.9019 25.6834 26.9019 26.3166 27.2924 26.7071L30.5853 30L27.2924 33.2929C26.9019 33.6834 26.9019 34.3166 27.2924 34.7071C27.6829 35.0976 28.3161 35.0976 28.7066 34.7071L32.7066 30.7071C33.0971 30.3166 33.0971 29.6834 32.7066 29.2929L28.7066 25.2929C28.3161 24.9024 27.6829 24.9024 27.2924 25.2929Z" fill="#000" />
							</svg>
						</div>
					</div>
				</div>
			<?php
            echo '<div class=post-list-wrapper><div class="post-list swiper-wrapper">';

            while ( $query->have_posts() ) {
                $query->the_post();
                ?>
                <div class="swiper-slide">
                    <div class="item">
                        <a href="<?php the_permalink(); ?>" class="item__link">
                            <div class="item__hover">
                                <div class="hover__text"><span><?php echo esc_html( $settings['hover_text'] ); ?></span>
                                    <?php \Elementor\Icons_Manager::render_icon( $settings['hover_icon'], [ 'aria-hidden' => 'true' ] ); ?>
                                </div>
                            </div>
                            <div class="item__img">
                              <?php
											if($lazyload) {
												$attr = array (
													'loading'=>'lazy'													
												);
											}
										  the_post_thumbnail( 'medium', $attr ); ?>										  
										  
                            </div>
                        </a>
                        <h4 class="title"><?php the_title(); ?></h4>
                    </div>
                </div>
                <?php
            }

            echo '</div></div></div>';
        }

        wp_reset_postdata();
    }
}
?>