<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeminiService
{
    protected string $apiKey;
    protected string $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
    }

    public function analyze(string $jdText, string $resumeText): array
    {
        $prompt = <<<EOT
You are a JSON-only generator.

Compare the following Job Description with a Candidate Resume.

Rules:
- "final_score": a number between 0 and 100
- "score_color": must be a HEX color that smoothly interpolates within these ranges:
    * 95–100% → Prestige Gold (#FFD700)
    * 85–94% → Emerald Green (#34D399 light at 85 → #059669 dark at 94)
    * 70–84% → Aqua Green (#5EEAD4 light at 70 → #0D9488 dark at 84)
    * 55–69% → Sky Blue (#93C5FD light at 55 → #2563EB dark at 69)
    * 40–54% → Cool Gray-Blue (#94A3B8 light at 40 → #475569 dark at 54)
    * Below 40% → Muted Slate (#334155)
- For "strengths" and "weaknesses": return meaningful short bullet points as arrays of strings.
- Return ONLY valid JSON. No explanations, no markdown.

Format:
{
  "final_score": number,
  "score_color": "#HEX",
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...]
}

Job Description:
$jdText

Candidate Resume:
$resumeText
EOT;


        $response = Http::withOptions([
            'verify' => false,
        ])->withHeaders([
                    'Content-Type' => 'application/json',
                ])->post($this->endpoint . '?key=' . $this->apiKey, [
                    'contents' => [
                        [
                            'parts' => [
                                [
                                    'text' => $prompt
                                ]
                            ]
                        ]
                    ]
                ]);


        $data = $response->json();
        $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';

        $text = trim($text);
        $text = preg_replace('/^```(json)?/i', '', $text);
        $text = preg_replace('/```$/', '', $text);
        $text = trim($text);

        $result = json_decode($text, true);

        if (!$result) {
            \Log::error('Gemini raw response: ' . $text);
        }

        return $result;


    }
}
