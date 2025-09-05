<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JobController;
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\AnalysisController;

// 🔹 Jobs
Route::get('/jobs', [JobController::class, 'index']);
Route::get('/jobs/{job}', [JobController::class, 'show']);
Route::post('/jobs', [JobController::class, 'store']);

// 🔹 Candidates
Route::get('/jobs/{job}/candidates', [CandidateController::class, 'list']);
Route::get('/jobs/{job}/candidates/{candidate}', [CandidateController::class, 'show']);
Route::post('/jobs/{job}/candidates', [CandidateController::class, 'store']);
Route::post('/jobs/{job}/candidates/many', [CandidateController::class, 'storeMany']);

// 🔹 Analyses
Route::get('/analyses', [AnalysisController::class, 'index']);
Route::post('/analyses', [AnalysisController::class, 'store']);              
Route::get('/analyses/{analysis}', [AnalysisController::class, 'show']);    
Route::put('/analyses/{analysis}', [AnalysisController::class, 'update']);  
Route::delete('/analyses/{analysis}', [AnalysisController::class, 'destroy']); 

// Health check
Route::get('/ping', fn() => response()->json(['pong' => true]));
