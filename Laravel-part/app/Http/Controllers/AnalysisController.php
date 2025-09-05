<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\Analysis;
use App\Models\Candidate;
use App\Models\CandidateAnalysis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Services\PdfTextExtractor;
use App\Services\GeminiService;

class AnalysisController extends Controller
{
    /**
     * - Save JD (Job + Analysis)
     * - Save Candidates
     * - Run Gemini analysis and store results
     */
    public function store(Request $request, PdfTextExtractor $pdf, GeminiService $gemini)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'jd' => 'required|mimes:pdf|max:2048',
            'candidates' => 'required|array',
            'candidates.*' => 'required|mimes:pdf|max:2048',
        ]);

        $safeTitle = preg_replace('/[^A-Za-z0-9_\-]/', '_', $request->title);

        // Save JD
        $jdFilename = time() . '_' . $request->file('jd')->getClientOriginalName();
        $jdPath = $request->file('jd')->storeAs("jobs/{$safeTitle}/job_description", $jdFilename, 'public');
        $jdText = $pdf->extractText($request->file('jd')->getRealPath());

        $job = Job::create([
            'title' => $request->title,
            'pdf_path' => $jdPath,
            'jd_text' => $jdText,
        ]);

        // Create Analysis record
        $analysis = $job->analysis()->create([
            'status' => 'processing',
            'model_used' => 'gemini-1.5',
        ]);

        $candidates = [];

        // Save candidates + analyze
        foreach ($request->file('candidates') as $file) {
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs("jobs/{$safeTitle}/candidates", $filename, 'public');
            $resumeText = $pdf->extractText($file->getRealPath());
            $candidateName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);

            $candidate = Candidate::create([
                'job_id' => $job->id,
                'name' => $candidateName,
                'pdf_path' => $path,
                'resume_text' => $resumeText,
            ]);

            $analysisData = $gemini->analyze($jdText, $resumeText);

            $candidateAnalysis = CandidateAnalysis::create([
                'candidate_id' => $candidate->id,
                'analysis_id' => $analysis->id,
                'final_score' => $analysisData['final_score'],
                'score_color' => $analysisData['score_color'],
                'strengths' => json_encode($analysisData['strengths']),
                'weaknesses' => json_encode($analysisData['weaknesses']),
            ]);

            $candidates[] = [
                'id' => $candidate->id,
                'name' => $candidate->name,
                'resume_file' => Storage::url($candidate->pdf_path),
                'final_score' => $candidateAnalysis->final_score,
                'score_color' => $candidateAnalysis->score_color,
                'strengths' => json_decode($candidateAnalysis->strengths, true),
                'weaknesses' => json_decode($candidateAnalysis->weaknesses, true),
            ];
        }

        $analysis->update(['status' => 'done']);

        return response()->json([
            'job' => [
                'id' => $job->id,
                'title' => $job->title,
                'file_url' => Storage::url($job->pdf_path),
            ],
            'candidates' => collect($candidates)->sortByDesc('final_score')->values(),
        ], 201);
    }

    /**
     * Get an analysis with its job + candidates
     */
    public function show(Analysis $analysis)
    {
        return Analysis::with([
            'job.candidates',
            'candidateAnalyses.candidate'
        ])->findOrFail($analysis->id);
    }


    /**
     * Get all analyses with their job + candidates
     */
    public function index()
    {
        return Analysis::with('job')
            ->withCount('candidateAnalyses')
            ->orderByRaw('GREATEST(created_at, updated_at) DESC')
            ->get([
                'id',
                'job_id',
                'status',
                'model_used',
                'created_at',
                'updated_at',
            ]);
    }



    /**
     * Update an analysis (rerun or modify title/JD).
     */
    public function update(Request $request, Analysis $analysis, PdfTextExtractor $pdf, GeminiService $gemini)
    {
        \Log::info('Update payload', $request->all());
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'jd' => 'sometimes|mimes:pdf|max:2048',
        ]);

        $job = $analysis->job;

        if ($request->has('title')) {
            $job->update(['title' => $request->title]);
        }

        if ($request->hasFile('jd')) {
            $safeTitle = preg_replace('/[^A-Za-z0-9_\-]/', '_', $job->title);
            $jdFilename = time() . '_' . $request->file('jd')->getClientOriginalName();
            $jdPath = $request->file('jd')->storeAs("jobs/{$safeTitle}/job_description", $jdFilename, 'public');
            $jdText = $pdf->extractText($request->file('jd')->getRealPath());
            $job->update(['pdf_path' => $jdPath, 'jd_text' => $jdText]);

            foreach ($job->candidates as $candidate) {
                $analysisData = $gemini->analyze($jdText, $candidate->resume_text);
                CandidateAnalysis::updateOrCreate(
                    [
                        'candidate_id' => $candidate->id,
                        'analysis_id' => $analysis->id,
                    ],
                    [
                        'final_score' => $analysisData['final_score'],
                        'score_color' => $analysisData['score_color'],
                        'strengths' => json_encode($analysisData['strengths']),
                        'weaknesses' => json_encode($analysisData['weaknesses']),
                    ]
                );
            }
        }

        $analysis->touch();

        return response()->json($analysis->load(['job', 'candidateAnalyses.candidate']));
    }

    /**
     * Delete an analysis (job + candidates cascade).
     */
    public function destroy(Analysis $analysis)
    {
        $analysis->delete();

        return response()->json(['message' => 'Analysis deleted successfully']);
    }
}
