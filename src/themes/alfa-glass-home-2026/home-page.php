<?php
/**
* Template name: Home page
 * Template Post Type: page
 */

get_header();
?>
	<main id="primary" class="site-main">
        <div class="container">
            <?=the_content()?>
        </div>
	</main>
<?php

get_footer();
