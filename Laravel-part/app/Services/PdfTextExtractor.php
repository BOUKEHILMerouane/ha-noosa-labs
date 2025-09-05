<?php

namespace App\Services;

use Smalot\PdfParser\Parser;

class PdfTextExtractor
{
    protected Parser $parser;

    public function __construct()
    {
        $this->parser = new Parser();
    }

    /**
     * Extract plain text from a PDF file
     *
     * @param string $filePath
     * @return string
     */
    public function extractText(string $filePath): string
    {
        try {
            $pdf = $this->parser->parseFile($filePath);
            return $pdf->getText();
        } catch (\Exception $e) {
            return ''; // fallback if parsing fails
        }
    }
}
