<?php
/**** Меняем название класса, return и метки "Change" на название блока ****/
class Blogs {
    public $block_name = 'blogs'; /* Change */ 

	public function __construct() {
		add_action('acf/init', array($this, '_register'));
	}

	public function _register() {
		acf_register_block_type(
			array(
				'name'              => $this->block_name,
				'title'             => 'Блок: Статьи', /* Change */
				'render_callback'   => array($this, '_render'),
				'category'          => 'theme-blocks',
				'mode'              => 'edit',
				'align'             => 'wide',
				'enqueue_assets'    => array($this, '_enqueue_assets'),
			)
		);
	}

	public function _enqueue_assets() {
        $path = get_theme_file_uri().'/blocks/'.$this->block_name;
        wp_enqueue_style($this->block_name .'-css', $path.'/block.css');
		wp_enqueue_script($this->block_name .'-js', $path.'/block.js');
		return;
	}

	public function _render($block) {
		$id = $block['id'];
		include 'render.php';
	}
}
return new Blogs();
?>