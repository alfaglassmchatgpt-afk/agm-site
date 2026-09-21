<?php
/**
 * Plugin Name: AlfaGlass Site Auditor
 * Description: Read-only inventory exporter for WordPress site, theme, plugins, SEO content, and database structure.
 * Version: 0.1.0
 * Author: Codex
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Text Domain: alfaglass-site-auditor
 */

if (!defined('ABSPATH')) {
    exit;
}

final class AlfaGlass_Site_Auditor
{
    private const NONCE_ACTION = 'alfaglass_site_auditor_export';
    private const MENU_SLUG = 'alfaglass-site-auditor';
    private const MAX_CONTENT_ITEMS = 5000;

    public static function boot(): void
    {
        add_action('admin_menu', [__CLASS__, 'register_admin_page']);
        add_action('admin_post_alfaglass_site_auditor_export', [__CLASS__, 'handle_export']);
        add_action('rest_api_init', [__CLASS__, 'register_rest_routes']);

        if (defined('WP_CLI') && WP_CLI) {
            WP_CLI::add_command('alfaglass audit', [__CLASS__, 'cli_export']);
        }
    }

    public static function register_admin_page(): void
    {
        add_management_page(
            'AlfaGlass Site Auditor',
            'AlfaGlass Site Auditor',
            'manage_options',
            self::MENU_SLUG,
            [__CLASS__, 'render_admin_page']
        );
    }

    public static function render_admin_page(): void
    {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('Insufficient permissions.', 'alfaglass-site-auditor'));
        }

        $export_url = wp_nonce_url(
            admin_url('admin-post.php?action=alfaglass_site_auditor_export'),
            self::NONCE_ACTION
        );
        ?>
        <div class="wrap">
            <h1>AlfaGlass Site Auditor</h1>
            <p>
                Read-only audit export for development planning. The report masks sensitive option values and does not
                export passwords, tokens, user lists, or full post content.
            </p>
            <p>
                <a class="button button-primary" href="<?php echo esc_url($export_url); ?>">Download JSON audit</a>
            </p>
            <h2>What is included</h2>
            <ul style="list-style: disc; margin-left: 20px;">
                <li>WordPress, PHP, server, multisite, permalink, and language information.</li>
                <li>Active theme, parent theme, installed plugins, must-use plugins, and detected REST namespaces.</li>
                <li>Public post types, taxonomies, menus, widgets, sidebars, image sizes, and rewrite rules summary.</li>
                <li>SEO-oriented inventory: URLs, titles, statuses, templates, word counts, Yoast/RankMath/AIOSEO metadata.</li>
                <li>Database table names, row counts, approximate sizes, autoloaded options summary, and option-key inventory.</li>
            </ul>
        </div>
        <?php
    }

    public static function register_rest_routes(): void
    {
        register_rest_route('alfaglass-auditor/v1', '/report', [
            'methods' => 'GET',
            'callback' => function () {
                return rest_ensure_response(self::build_report());
            },
            'permission_callback' => function () {
                return current_user_can('manage_options');
            },
        ]);
    }

    public static function handle_export(): void
    {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('Insufficient permissions.', 'alfaglass-site-auditor'));
        }

        check_admin_referer(self::NONCE_ACTION);
        self::send_json_download(self::build_report());
    }

    public static function cli_export(array $args, array $assoc_args): void
    {
        $report = self::build_report();
        $json = wp_json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        if (!empty($assoc_args['path'])) {
            file_put_contents((string) $assoc_args['path'], $json);
            WP_CLI::success('Audit written to ' . $assoc_args['path']);
            return;
        }

        WP_CLI::line($json);
    }

    private static function send_json_download(array $report): void
    {
        $filename = 'alfaglass-site-audit-' . gmdate('Ymd-His') . '.json';

        nocache_headers();
        header('Content-Type: application/json; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        echo wp_json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    private static function build_report(): array
    {
        global $wp_rewrite;

        return [
            'generated_at_utc' => gmdate('c'),
            'privacy_note' => 'Sensitive option values are masked. User lists, passwords, tokens, and full post content are not exported.',
            'site' => self::site_info(),
            'environment' => self::environment_info(),
            'theme' => self::theme_info(),
            'plugins' => self::plugins_info(),
            'rest_namespaces' => self::rest_namespaces(),
            'content' => self::content_inventory(),
            'taxonomies' => self::taxonomy_inventory(),
            'menus' => self::menu_inventory(),
            'media' => self::media_inventory(),
            'seo' => self::seo_inventory(),
            'database' => self::database_inventory(),
            'rewrite' => [
                'permalink_structure' => get_option('permalink_structure'),
                'use_verbose_page_rules' => (bool) $wp_rewrite->use_verbose_page_rules,
                'rules_count' => is_array($wp_rewrite->wp_rewrite_rules()) ? count($wp_rewrite->wp_rewrite_rules()) : 0,
            ],
        ];
    }

    private static function site_info(): array
    {
        return [
            'name' => get_bloginfo('name'),
            'description' => get_bloginfo('description'),
            'url' => home_url('/'),
            'admin_url_host' => wp_parse_url(admin_url(), PHP_URL_HOST),
            'wp_version' => get_bloginfo('version'),
            'language' => get_bloginfo('language'),
            'charset' => get_bloginfo('charset'),
            'timezone' => wp_timezone_string(),
            'gmt_offset' => get_option('gmt_offset'),
            'show_on_front' => get_option('show_on_front'),
            'page_on_front' => self::post_ref((int) get_option('page_on_front')),
            'page_for_posts' => self::post_ref((int) get_option('page_for_posts')),
            'uploads' => wp_upload_dir(null, false),
            'is_multisite' => is_multisite(),
        ];
    }

    private static function environment_info(): array
    {
        global $wpdb;

        return [
            'php_version' => PHP_VERSION,
            'mysql_version' => $wpdb->db_version(),
            'server_software' => isset($_SERVER['SERVER_SOFTWARE']) ? sanitize_text_field(wp_unslash($_SERVER['SERVER_SOFTWARE'])) : '',
            'wp_memory_limit' => WP_MEMORY_LIMIT,
            'wp_max_memory_limit' => WP_MAX_MEMORY_LIMIT,
            'debug' => [
                'WP_DEBUG' => defined('WP_DEBUG') && WP_DEBUG,
                'SCRIPT_DEBUG' => defined('SCRIPT_DEBUG') && SCRIPT_DEBUG,
                'WP_CACHE' => defined('WP_CACHE') && WP_CACHE,
            ],
        ];
    }

    private static function theme_info(): array
    {
        $theme = wp_get_theme();
        $parent = $theme->parent();

        return [
            'stylesheet' => get_stylesheet(),
            'template' => get_template(),
            'active' => self::theme_to_array($theme),
            'parent' => $parent ? self::theme_to_array($parent) : null,
            'supports' => self::theme_supports(),
            'sidebars' => self::registered_sidebars(),
            'image_sizes' => self::image_sizes(),
        ];
    }

    private static function plugins_info(): array
    {
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $active = (array) get_option('active_plugins', []);
        $all = [];

        foreach (get_plugins() as $file => $data) {
            $all[] = [
                'file' => $file,
                'name' => $data['Name'] ?? '',
                'version' => $data['Version'] ?? '',
                'author' => wp_strip_all_tags($data['Author'] ?? ''),
                'plugin_uri_host' => self::host_from_url($data['PluginURI'] ?? ''),
                'active' => in_array($file, $active, true),
                'license_risk' => self::plugin_license_risk($file, $data),
            ];
        }

        return [
            'active_plugins' => $active,
            'must_use_plugins' => function_exists('get_mu_plugins') ? array_keys(get_mu_plugins()) : [],
            'dropins' => function_exists('get_dropins') ? array_keys(get_dropins()) : [],
            'plugins' => $all,
            'license_option_keys' => self::option_keys_matching([
                'license', 'licence', 'activation', 'elementor', 'yoast', 'rank_math', 'acf', 'wp_rocket',
            ]),
        ];
    }

    private static function rest_namespaces(): array
    {
        $server = rest_get_server();
        return array_values(array_unique(array_map(
            static fn($route) => trim(explode('/', trim($route, '/'))[0] ?? '', '/'),
            array_keys($server->get_routes())
        )));
    }

    private static function content_inventory(): array
    {
        $post_types = get_post_types([], 'objects');
        $counts = [];
        $items = [];

        foreach ($post_types as $name => $object) {
            $count = wp_count_posts($name);
            $counts[$name] = [
                'label' => $object->label,
                'public' => (bool) $object->public,
                'publicly_queryable' => (bool) $object->publicly_queryable,
                'show_in_rest' => (bool) $object->show_in_rest,
                'has_archive' => (bool) $object->has_archive,
                'supports' => get_all_post_type_supports($name),
                'statuses' => $count ? get_object_vars($count) : [],
            ];
        }

        $query = new WP_Query([
            'post_type' => array_keys($post_types),
            'post_status' => ['publish', 'draft', 'pending', 'private', 'future'],
            'posts_per_page' => self::MAX_CONTENT_ITEMS,
            'orderby' => 'ID',
            'order' => 'ASC',
            'no_found_rows' => true,
            'ignore_sticky_posts' => true,
        ]);

        foreach ($query->posts as $post) {
            $items[] = self::content_item($post);
        }

        return [
            'post_type_counts' => $counts,
            'items_limit' => self::MAX_CONTENT_ITEMS,
            'items' => $items,
        ];
    }

    private static function content_item(WP_Post $post): array
    {
        $content = wp_strip_all_tags((string) $post->post_content);

        return [
            'id' => $post->ID,
            'type' => $post->post_type,
            'status' => $post->post_status,
            'slug' => $post->post_name,
            'title' => get_the_title($post),
            'url' => get_permalink($post),
            'parent' => $post->post_parent,
            'menu_order' => $post->menu_order,
            'date' => $post->post_date_gmt,
            'modified' => $post->post_modified_gmt,
            'template' => get_page_template_slug($post),
            'word_count' => self::unicode_word_count($content),
            'excerpt_length' => mb_strlen(wp_strip_all_tags((string) $post->post_excerpt)),
            'featured_image' => (bool) get_post_thumbnail_id($post),
            'seo_meta' => self::seo_meta_for_post($post->ID),
        ];
    }

    private static function seo_inventory(): array
    {
        return [
            'blog_public' => (int) get_option('blog_public'),
            'seo_plugins_detected' => [
                'yoast' => defined('WPSEO_VERSION'),
                'rank_math' => defined('RANK_MATH_VERSION'),
                'aioseo' => defined('AIOSEO_VERSION'),
            ],
            'important_options' => self::masked_options([
                'wpseo', 'wpseo_titles', 'wpseo_social', 'rank-math-options-general', 'rank-math-options-titles',
                'aioseo_options', 'permalink_structure',
            ]),
        ];
    }

    private static function seo_meta_for_post(int $post_id): array
    {
        $keys = [
            '_yoast_wpseo_title',
            '_yoast_wpseo_metadesc',
            '_yoast_wpseo_focuskw',
            'rank_math_title',
            'rank_math_description',
            'rank_math_focus_keyword',
            '_aioseo_title',
            '_aioseo_description',
        ];
        $out = [];

        foreach ($keys as $key) {
            $value = get_post_meta($post_id, $key, true);
            if ($value !== '') {
                $out[$key] = self::mask_if_sensitive($key, $value);
            }
        }

        return (object) $out;
    }

    private static function taxonomy_inventory(): array
    {
        $out = [];

        foreach (get_taxonomies([], 'objects') as $name => $tax) {
            $terms = get_terms([
                'taxonomy' => $name,
                'hide_empty' => false,
                'number' => 1000,
            ]);

            $out[$name] = [
                'label' => $tax->label,
                'public' => (bool) $tax->public,
                'show_in_rest' => (bool) $tax->show_in_rest,
                'hierarchical' => (bool) $tax->hierarchical,
                'object_type' => $tax->object_type,
                'terms' => is_wp_error($terms) ? [] : array_map(static function ($term) {
                    return [
                        'id' => $term->term_id,
                        'name' => $term->name,
                        'slug' => $term->slug,
                        'count' => $term->count,
                        'parent' => $term->parent,
                    ];
                }, $terms),
            ];
        }

        return $out;
    }

    private static function menu_inventory(): array
    {
        $menus = [];

        foreach (wp_get_nav_menus() as $menu) {
            $items = wp_get_nav_menu_items($menu->term_id) ?: [];
            $menus[] = [
                'id' => $menu->term_id,
                'name' => $menu->name,
                'slug' => $menu->slug,
                'count' => count($items),
                'items' => array_map(static function ($item) {
                    return [
                        'id' => $item->ID,
                        'title' => $item->title,
                        'url' => $item->url,
                        'object' => $item->object,
                        'object_id' => (int) $item->object_id,
                        'parent' => (int) $item->menu_item_parent,
                    ];
                }, $items),
            ];
        }

        return [
            'locations' => get_nav_menu_locations(),
            'menus' => $menus,
        ];
    }

    private static function media_inventory(): array
    {
        $counts = wp_count_attachments();
        return [
            'attachment_counts' => $counts ? get_object_vars($counts) : [],
            'image_sizes' => self::image_sizes(),
        ];
    }

    private static function database_inventory(): array
    {
        global $wpdb;

        $tables = $wpdb->get_results('SHOW TABLE STATUS', ARRAY_A);
        $table_info = [];

        foreach ((array) $tables as $table) {
            if (empty($table['Name']) || strpos($table['Name'], $wpdb->prefix) !== 0) {
                continue;
            }

            $table_info[] = [
                'name' => $table['Name'],
                'engine' => $table['Engine'] ?? '',
                'rows' => isset($table['Rows']) ? (int) $table['Rows'] : null,
                'data_length' => isset($table['Data_length']) ? (int) $table['Data_length'] : null,
                'index_length' => isset($table['Index_length']) ? (int) $table['Index_length'] : null,
                'collation' => $table['Collation'] ?? '',
            ];
        }

        return [
            'prefix' => $wpdb->prefix,
            'base_prefix' => $wpdb->base_prefix,
            'tables' => $table_info,
            'autoload_options' => self::autoload_options_summary(),
            'option_keys' => self::option_key_inventory(),
        ];
    }

    private static function autoload_options_summary(): array
    {
        global $wpdb;

        $rows = $wpdb->get_results(
            "SELECT option_name, LENGTH(option_value) AS bytes FROM {$wpdb->options} WHERE autoload IN ('yes', 'on', 'auto-on', 'auto') ORDER BY bytes DESC LIMIT 100",
            ARRAY_A
        );

        return array_map(static function ($row) {
            return [
                'option_name' => $row['option_name'],
                'bytes' => (int) $row['bytes'],
            ];
        }, (array) $rows);
    }

    private static function option_key_inventory(): array
    {
        global $wpdb;

        $rows = $wpdb->get_results(
            "SELECT option_name, autoload, LENGTH(option_value) AS bytes FROM {$wpdb->options} ORDER BY option_name ASC",
            ARRAY_A
        );

        return array_map(static function ($row) {
            return [
                'option_name' => $row['option_name'],
                'autoload' => $row['autoload'],
                'bytes' => (int) $row['bytes'],
                'sensitive_hint' => self::is_sensitive_key($row['option_name']),
            ];
        }, (array) $rows);
    }

    private static function masked_options(array $option_names): array
    {
        $out = [];

        foreach ($option_names as $name) {
            $value = get_option($name, null);
            if ($value !== null) {
                $out[$name] = self::mask_if_sensitive($name, $value);
            }
        }

        return $out;
    }

    private static function option_keys_matching(array $needles): array
    {
        global $wpdb;

        $clauses = [];
        $params = [];

        foreach ($needles as $needle) {
            $clauses[] = 'option_name LIKE %s';
            $params[] = '%' . $wpdb->esc_like($needle) . '%';
        }

        if (!$clauses) {
            return [];
        }

        $sql = "SELECT option_name, LENGTH(option_value) AS bytes FROM {$wpdb->options} WHERE " . implode(' OR ', $clauses) . ' ORDER BY option_name ASC';
        $rows = $wpdb->get_results($wpdb->prepare($sql, $params), ARRAY_A);

        return array_map(static function ($row) {
            return [
                'option_name' => $row['option_name'],
                'bytes' => (int) $row['bytes'],
                'sensitive_hint' => self::is_sensitive_key($row['option_name']),
            ];
        }, (array) $rows);
    }

    private static function mask_if_sensitive(string $key, $value)
    {
        if (self::is_sensitive_key($key)) {
            return '[masked]';
        }

        if (is_scalar($value)) {
            return $value;
        }

        return self::sanitize_nested_value($value);
    }

    private static function sanitize_nested_value($value)
    {
        if (is_array($value)) {
            $out = [];
            foreach ($value as $key => $item) {
                $out[$key] = self::mask_if_sensitive((string) $key, $item);
            }
            return $out;
        }

        if (is_object($value)) {
            return self::sanitize_nested_value(get_object_vars($value));
        }

        return $value;
    }

    private static function is_sensitive_key(string $key): bool
    {
        return (bool) preg_match('/(password|passwd|secret|token|api[_-]?key|private[_-]?key|access[_-]?key|consumer[_-]?key|auth|salt|nonce|smtp|mailgun|sendgrid)/i', $key);
    }

    private static function post_ref(int $post_id): ?array
    {
        if (!$post_id) {
            return null;
        }

        $post = get_post($post_id);
        if (!$post) {
            return null;
        }

        return [
            'id' => $post->ID,
            'type' => $post->post_type,
            'status' => $post->post_status,
            'title' => get_the_title($post),
            'url' => get_permalink($post),
        ];
    }

    private static function theme_to_array(WP_Theme $theme): array
    {
        return [
            'name' => $theme->get('Name'),
            'version' => $theme->get('Version'),
            'author' => wp_strip_all_tags($theme->get('Author')),
            'theme_uri_host' => self::host_from_url($theme->get('ThemeURI')),
            'template' => $theme->get_template(),
            'stylesheet' => $theme->get_stylesheet(),
        ];
    }

    private static function plugin_license_risk(string $file, array $data): string
    {
        $haystack = strtolower($file . ' ' . ($data['Name'] ?? '') . ' ' . ($data['PluginURI'] ?? ''));
        $commercial_markers = ['elementor', 'wp rocket', 'advanced custom fields pro', 'acf pro', 'crocoblock', 'jet', 'rank math pro', 'yoast seo premium'];

        foreach ($commercial_markers as $marker) {
            if (strpos($haystack, $marker) !== false) {
                return 'review-license';
            }
        }

        return 'unknown';
    }

    private static function host_from_url(string $url): string
    {
        $host = wp_parse_url($url, PHP_URL_HOST);
        return $host ?: '';
    }

    private static function registered_sidebars(): array
    {
        global $wp_registered_sidebars;

        return array_map(static function ($sidebar) {
            return [
                'id' => $sidebar['id'] ?? '',
                'name' => $sidebar['name'] ?? '',
                'description' => $sidebar['description'] ?? '',
            ];
        }, (array) $wp_registered_sidebars);
    }

    private static function theme_supports(): array
    {
        global $_wp_theme_features;

        $features = [];
        foreach ((array) $_wp_theme_features as $feature => $settings) {
            $features[$feature] = is_array($settings) ? self::sanitize_nested_value($settings) : (bool) $settings;
        }

        return $features;
    }

    private static function unicode_word_count(string $text): int
    {
        preg_match_all('/[\p{L}\p{N}][\p{L}\p{N}\-]*/u', $text, $matches);
        return count($matches[0] ?? []);
    }

    private static function image_sizes(): array
    {
        global $_wp_additional_image_sizes;

        $sizes = [];
        foreach (get_intermediate_image_sizes() as $size) {
            $sizes[$size] = [
                'width' => (int) get_option("{$size}_size_w", $_wp_additional_image_sizes[$size]['width'] ?? 0),
                'height' => (int) get_option("{$size}_size_h", $_wp_additional_image_sizes[$size]['height'] ?? 0),
                'crop' => (bool) get_option("{$size}_crop", $_wp_additional_image_sizes[$size]['crop'] ?? false),
            ];
        }

        return $sizes;
    }
}

AlfaGlass_Site_Auditor::boot();
