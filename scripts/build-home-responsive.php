<?php
// Run explicitly with WP-CLI eval-file. Creates derivatives, never replaces originals.
$base = get_template_directory() . '/agm-homepage/';
$files = ['assets/client-design-hq.png','assets/client-build-hq.png','assets/client-furniture-hq.png','assets/client-home-hq.png','assets/mirror-aged-orientation-v3.png','assets/mirror-clear-hq.png','assets/mirror-silver-realism-v2.png','assets/mirror-tinted-orientation-v3.png','glass-dichroic-approved-v1.png','glass-matte-approved-v1.png'];
$manifest = [];
foreach ($files as $file) {
    $sizes = [];
    foreach ([480,800] as $width) {
        $out = preg_replace('/\.png$/', '-w' . $width . '.webp', $file);
        if (!file_exists($base . $out)) {
            $editor = wp_get_image_editor($base . $file);
            if (is_wp_error($editor)) throw new Exception($editor->get_error_message());
            $editor->set_quality(85);
            $result = $editor->resize($width, null, false);
            if (is_wp_error($result)) throw new Exception($result->get_error_message());
            $result = $editor->save($base . $out, 'image/webp');
            if (is_wp_error($result)) throw new Exception($result->get_error_message());
        }
        $dimensions = getimagesize($base . $out);
        if (!$dimensions || $dimensions[0] !== $width) throw new Exception('Invalid derivative');
        $sizes[] = ['path'=>$out,'width'=>$width,'bytes'=>filesize($base . $out)];
    }
    $manifest[$file] = $sizes;
}
echo json_encode($manifest, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
