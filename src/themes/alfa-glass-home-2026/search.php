<?php get_header();
$args = [
    's' => get_search_query(),
    'post_type' => 'glossary',
    'post_status' => 'publish'
];
$posts = get_posts($args);
?>

<main class="search-page">
    <div class="container">
        <?php if (!empty($posts)) { ?>
            <h2 class="main-title">Результат поиска: <?=get_search_query();?></h2>
            <div class="search-content">
                <?php foreach($posts as $item) { ?>
                    <a href="<?=get_the_permalink($item->ID)?>" class="search-item">
                        <?=$item->post_title?>
                        <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.46122 10.7042L13.0645 5.35175L7.46122 -2.44925e-07L6.40297 1.02096L10.1837 4.63175L0.000967777 4.63175L0.000967714 6.07175L10.1837 6.07175L6.40297 9.68327L7.46122 10.7042Z" fill="white" />
                        </svg>
                    </a>
                <?php } ?>
            </div>
        <?php } else { ?>
            <h2 class="main-title">Результатов не найдено</h2>
        <?php } ?>
    </div>
</main>

<?php get_footer()?>