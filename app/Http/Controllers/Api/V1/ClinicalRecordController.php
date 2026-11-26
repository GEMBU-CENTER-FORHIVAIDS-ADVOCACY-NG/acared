<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Admission;
use App\Models\Consultation;
use App\Models\Nursing;
use App\Service\ClinicalRecordData;
use App\Service\ClinicalRecordService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClinicalRecordController extends Controller
{
    public function __construct(
        private readonly ClinicalRecordService $records,
        private readonly ClinicalRecordData $recordData,
    ) {}

    public function consultationOptions(Consultation $consultation): JsonResponse
    {
        return response()->json(['data' => $this->recordData->options()]);
    }

    public function consultationIndex(Request $request, Consultation $consultation): JsonResponse
    {
        $type = $request->string('type')->toString();
        $perPage = $request->integer('per_page', 15);
        $page = max(1, $request->integer('page', 1));

        if ($type !== '') {
            $data = $this->recordData->recordsPaginated($consultation->patient_id, $type, $page, $perPage);

            return response()->json(['data' => $data['data'], 'meta' => collect($data)->except('data')->all()]);
        }

        return response()->json(['data' => $this->recordData->records($consultation->patient_id)]);
    }

    public function storeForConsultation(Request $request, Consultation $consultation, string $type): JsonResponse
    {
        $result = $this->records->createRecord($request, $this->records->consultationContext($consultation), $type);

        return response()->json([
            'message' => $result['config']['label'].' recorded.',
            'data' => $this->serializeRecord($result['record']),
        ], 201);
    }

    public function updateForConsultation(Request $request, Consultation $consultation, string $type, int $record): JsonResponse
    {
        $result = $this->records->updateRecord($request, $this->records->consultationContext($consultation), $type, $record);

        return response()->json([
            'message' => $result['config']['label'].' updated.',
            'data' => $this->serializeRecord($result['record']),
        ]);
    }

    public function destroyForConsultation(Request $request, Consultation $consultation, string $type, int $record): JsonResponse
    {
        $config = $this->records->deleteRecord($this->records->consultationContext($consultation), $type, $record);

        return response()->json(['message' => $config['label'].' deleted.']);
    }

    public function admissionOptions(Admission $admission): JsonResponse
    {
        return response()->json(['data' => $this->recordData->options()]);
    }

    public function admissionIndex(Request $request, Admission $admission): JsonResponse
    {
        $type = $request->string('type')->toString();
        $perPage = $request->integer('per_page', 15);
        $page = max(1, $request->integer('page', 1));

        if ($type !== '') {
            $data = $this->recordData->recordsPaginated($admission->patient_id, $type, $page, $perPage);

            return response()->json(['data' => $data['data'], 'meta' => collect($data)->except('data')->all()]);
        }

        return response()->json(['data' => $this->recordData->records($admission->patient_id)]);
    }

    public function storeForAdmission(Request $request, Admission $admission, string $type): JsonResponse
    {
        $result = $this->records->createRecord($request, $this->records->admissionContext($request, $admission), $type);

        return response()->json([
            'message' => $result['config']['label'].' recorded.',
            'data' => $this->serializeRecord($result['record']),
        ], 201);
    }

    public function updateForAdmission(Request $request, Admission $admission, string $type, int $record): JsonResponse
    {
        $result = $this->records->updateRecord($request, $this->records->admissionContext($request, $admission), $type, $record);

        return response()->json([
            'message' => $result['config']['label'].' updated.',
            'data' => $this->serializeRecord($result['record']),
        ]);
    }

    public function destroyForAdmission(Request $request, Admission $admission, string $type, int $record): JsonResponse
    {
        $config = $this->records->deleteRecord($this->records->admissionContext($request, $admission), $type, $record);

        return response()->json(['message' => $config['label'].' deleted.']);
    }

    public function nursingOptions(Nursing $nursing): JsonResponse
    {
        return response()->json(['data' => $this->recordData->options()]);
    }

    public function nursingIndex(Request $request, Nursing $nursing): JsonResponse
    {
        $type = $request->string('type')->toString();
        $perPage = $request->integer('per_page', 15);
        $page = max(1, $request->integer('page', 1));

        if ($type !== '') {
            $data = $this->recordData->recordsPaginated($nursing->patient_id, $type, $page, $perPage);

            return response()->json(['data' => $data['data'], 'meta' => collect($data)->except('data')->all()]);
        }

        return response()->json(['data' => $this->recordData->records($nursing->patient_id)]);
    }

    public function storeForNursing(Request $request, Nursing $nursing, string $type): JsonResponse
    {
        $result = $this->records->createRecord($request, $this->records->nursingContext($request, $nursing), $type);

        return response()->json([
            'message' => $result['config']['label'].' recorded.',
            'data' => $this->serializeRecord($result['record']),
        ], 201);
    }

    public function updateForNursing(Request $request, Nursing $nursing, string $type, int $record): JsonResponse
    {
        $result = $this->records->updateRecord($request, $this->records->nursingContext($request, $nursing), $type, $record);

        return response()->json([
            'message' => $result['config']['label'].' updated.',
            'data' => $this->serializeRecord($result['record']),
        ]);
    }

    public function destroyForNursing(Request $request, Nursing $nursing, string $type, int $record): JsonResponse
    {
        $config = $this->records->deleteRecord($this->records->nursingContext($request, $nursing), $type, $record);

        return response()->json(['message' => $config['label'].' deleted.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeRecord(mixed $record): array
    {
        if (! is_object($record) || ! method_exists($record, 'toArray')) {
            return [];
        }

        $array = $record->toArray();
        $array['recordedAt'] = $record->created_at?->toIso8601String();

        return $array;
    }
}
