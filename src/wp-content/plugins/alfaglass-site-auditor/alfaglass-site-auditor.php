<?php
/**
 * Plugin Name: AlfaGlass Site Auditor
 * Description: Read-only inventory exporter for WordPress site, theme, plugins, SEO content, and database structure.
 * Version: 0.2.0
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
    private const CONTENT_TYPES = ['page', 'post', 'product', 'materials', 'uslugi'];

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
                Read-only audit export v0.2.0 for production/dev comparison. The report masks sensitive option values and does not
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
                <li>Selected editorial content only; no requests, employees, reviews or private posts.</li>
                <li>Content/Elementor, SEO options, redirect configuration and theme code fingerprints.</li>
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
                $response = rest_ensure_response(self::build_report());
                $response->header('Cache-Control', 'private, no-store, max-age=0');
                return $response;
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
            if ($json === false || file_put_contents((string) $assoc_args['path'], $json, LOCK_EX) === false) {
                WP_CLI::error('Could not write audit.');
            }
            chmod((string) $assoc_args['path'], 0600);
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
            'schema_version' => 2,
            'plugin_version' => '0.2.0',
            'generated_at_utc' => gmdate('c'),
            'privacy_note' => 'Private audit: selected editorial records only; option values and rule targets are hashes. No requests, users, employees, reviews, logs, credentials or raw content. Keep exports outside the web root and public Git.',
            'site' => self::site_info(),
            'environment' => self::environment_info(),
            'theme' => self::theme_info(),
            'theme_files' => self::theme_file_inventory(),
            'redirects' => self::redirect_inventory(),
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
                'rules_count' => count((array) get_option('rewrite_rules', [])),
                'rules_sha256' => self::fingerprint(get_option('rewrite_rules', [])),
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
            'uploads_url' => self::safe_url(wp_upload_dir(null, false)['baseurl'] ?? ''),
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
            'post_type' => array_values(array_intersect(self::CONTENT_TYPES, array_keys($post_types))),
            'post_status' => ['publish', 'draft', 'pending', 'future'],
            'posts_per_page' => self::MAX_CONTENT_ITEMS,
            'orderby' => 'ID',
            'order' => 'ASC',
            'no_found_rows' => false,
            'ignore_sticky_posts' => true,
        ]);

        foreach ($query->posts as $post) {
            if (!in_array($post->post_type, self::CONTENT_TYPES, true) || $post->post_status === 'private') {
                continue;
            }
            $items[] = self::content_item($post);
        }

        return [
            'post_type_counts' => $counts,
            'items_limit' => self::MAX_CONTENT_ITEMS,
            'total_matching' => (int) $query->found_posts,
            'complete' => (int) $query->found_posts <= self::MAX_CONTENT_ITEMS,
            'included_types' => self::CONTENT_TYPES,
            'excluded' => 'Requests, users, reviews, employees, private posts, attachments and form definitions are not exported.',
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
            'path' => $post->post_type === 'page' ? '/' . trim(get_page_uri($post), '/') . '/' : (wp_parse_url(get_permalink($post), PHP_URL_PATH) ?: ''),
            'title' => get_the_title($post),
            'url' => self::safe_url(get_permalink($post)),
            'parent' => $post->post_parent,
            'menu_order' => $post->menu_order,
            'date' => $post->post_date_gmt,
            'modified' => $post->post_modified_gmt,
            'template' => get_page_template_slug($post),
            'content_sha256' => self::fingerprint((string) $post->post_content),
            'excerpt_sha256' => self::fingerprint((string) $post->post_excerpt),
            'elementor_sha256' => self::fingerprint(get_post_meta($post->ID, '_elementor_data', true)),
            'material_group' => get_post_meta($post->ID, '_agm_material_group', true),
            'navigation_section' => get_post_meta($post->ID, '_agm_navigation_section', true),
            'import_marker' => get_post_meta($post->ID, '_agm_production_import', true),
            'word_count' => self::unicode_word_count($content),
            'excerpt_length' => function_exists('mb_strlen') ? mb_strlen(wp_strip_all_tags((string) $post->post_excerpt)) : strlen(wp_strip_all_tags((string) $post->post_excerpt)),
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
            'important_options_sha256' => self::option_fingerprints([
                'wpseo', 'wpseo_titles', 'wpseo_social', 'rank-math-options-general', 'rank-math-options-titles',
                'aioseo_options', 'permalink_structure', 'redirection_options', 'wpseo-premium-redirects-base', 'wpseo-premium-redirects-regex', 'blog_public', 'show_on_front', 'page_on_front', 'page_for_posts',
            ]),
        ];
    }

    private static function seo_meta_for_post(int $post_id): array
    {
        $keys = [
            '_yoast_wpseo_title',
            '_yoast_wpseo_metadesc',
            '_yoast_wpseo_focuskw',
            '_yoast_wpseo_canonical',
            '_yoast_wpseo_meta-robots-noindex',
            '_yoast_wpseo_meta-robots-nofollow',
            '_yoast_wpseo_opengraph-title',
            '_yoast_wpseo_opengraph-description',
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

        return $out;
    }

    private static function taxonomy_inventory(): array
    {
        $out = [];

        foreach (get_taxonomies([], 'objects') as $name => $tax) {
            if (!$tax->public || !array_intersect(self::CONTENT_TYPES, (array) $tax->object_type)) {
                continue;
            }
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
                        'url' => self::safe_url($item->url),
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
            'option_count' => (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->options}"),
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

    private static function option_fingerprints(array $option_names): array
    {
        $out = [];
        foreach ($option_names as $name) {
            $value = get_option($name, null);
            if ($value !== null) {
                $out[$name] = self::fingerprint($value);
            }
        }
        return $out;
    }

    private static function fingerprint($value): string
    {
        if (is_array($value)) {
            if (array_keys($value) !== range(0, count($value) - 1)) {
                ksort($value);
            }
            foreach ($value as &$item) {
                $item = self::fingerprint($item);
            }
            unset($item);
            $value = wp_json_encode($value);
        } elseif (is_object($value)) {
            return self::fingerprint(get_object_vars($value));
        } else {
            $value = (string) $value;
        }
        // Ignore the known site's origin, but preserve paths and third-party URLs.
        $value = str_replace(rtrim(home_url('/'), '/'), '{{SITE}}', $value);
        return hash('sha256', $value);
    }

    private static function safe_url(string $url): string
    {
        $parts = wp_parse_url($url);
        if (!$parts || !empty($parts['user']) || !empty($parts['pass'])) {
            return '[redacted-url]';
        }
        // Keep paths for matching; omit query strings and fragments.
        return (isset($parts['scheme']) ? $parts['scheme'] . '://' : '')
            . ($parts['host'] ?? '')
            . (isset($parts['port']) ? ':' . $parts['port'] : '')
            . ($parts['path'] ?? '');
    }

    private static function redirect_inventory(): array
    {
        global $wpdb;
        $table = $wpdb->prefix . 'redirection_items';
        $exists = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $wpdb->esc_like($table)));
        if ($exists !== $table) {
            return ['provider' => 'Redirection', 'present' => false];
        }
        // Never query access logs, IPs or user agents. Hash only rule configuration.
        $rows = $wpdb->get_results("SELECT id,url,action_code,action_type,action_data,status,regex,group_id FROM `{$table}` ORDER BY id", ARRAY_A);
        $rules = [];
        foreach ((array) $rows as $row) {
            $id = (int) $row['id'];
            unset($row['id']);
            $rules[] = ['id' => $id, 'sha256' => self::fingerprint($row)];
        }
        return ['provider' => 'Redirection', 'present' => true, 'count' => count($rules), 'rules' => $rules, 'sha256' => self::fingerprint(array_column($rules, 'sha256'))];
    }

    private static function theme_file_inventory(): array
    {
        $out = [];
        foreach (wp_get_themes() as $slug => $theme) {
            $files = [];
            foreach (['php', 'css', 'js', 'html'] as $extension) {
                foreach ($theme->get_files($extension, 2, false) as $relative => $absolute) {
                    if (is_link($absolute) || !is_file($absolute) || filesize($absolute) > 2097152) {
                        continue;
                    }
                    $files[$relative] = hash_file('sha256', $absolute);
                }
            }
            ksort($files);
            $out[$slug] = ['files' => $files, 'complete' => false, 'scope' => 'Code only, depth 2, files up to 2 MiB; no media or file contents.'];
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
            'url' => self::safe_url(get_permalink($post)),
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
