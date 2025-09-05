<?php
namespace App\Helpers;

class Slugger {
    public static function slugify(string $text): string {
        $text = strtolower(trim($text));
        $text = preg_replace('/[^a-z0-9]+/i', '_', $text); // replace non-alphanumeric with underscores
        $text = preg_replace('/_+/', '_', $text); // collapse multiple underscores
        return trim($text, '_');
    }
}
