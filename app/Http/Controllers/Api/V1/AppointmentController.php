<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\TransferAppointmentRequest;
use App\Http\Resources\Api\V1\AppointmentResource;
use App\Models\Appointment;
use App\Service\ConsultationSlotGrid;
use App\Service\ScheduleAppointment;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Appointment::query()->with(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'nurse:id,name']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('date')) {
            $query->whereDate('starts_at', $request->date('date'));
        }
        if ($request->filled('patient')) {
            $query->where('patient_id', $request->string('patient'));
        }

        $appointments = $query->orderByDesc('starts_at')->paginate($request->integer('per_page', 15));

        return AppointmentResource::collection($appointments)->response();
    }

    public function store(StoreAppointmentRequest $request, ScheduleAppointment $scheduler): JsonResponse
    {
        $model = $scheduler->handle($request->validated());
        $appointment = Appointment::query()->with(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'nurse:id,name'])->findOrFail($model->getKey());

        return (new AppointmentResource($appointment))->response()->setStatusCode(201);
    }

    public function show(Appointment $appointment): AppointmentResource
    {
        $appointment->loadMissing(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'nurse:id,name', 'billing:id,status,total']);

        return new AppointmentResource($appointment);
    }

    public function transfer(TransferAppointmentRequest $request, Appointment $appointment): AppointmentResource
    {
        $appointment->update($request->validated());
        $appointment->loadMissing(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'nurse:id,name']);

        return new AppointmentResource($appointment);
    }

    public function cancel(Request $request, Appointment $appointment): AppointmentResource
    {
        if ($appointment->status === 'completed') {
            throw ValidationException::withMessages(['status' => 'Completed appointments cannot be cancelled.']);
        }

        $appointment->update(['status' => 'cancelled']);

        return new AppointmentResource($appointment->fresh(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'nurse:id,name']));
    }

    public function slots(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'doctor_id' => ['nullable', 'integer'],
        ]);

        $date = CarbonImmutable::parse($validated['date']);
        $query = Appointment::query()
            ->whereDate('starts_at', $date)
            ->whereIn('status', ['scheduled', 'started']);

        if (! empty($validated['doctor_id'])) {
            $query->where('doctor_id', $validated['doctor_id']);
        }

        $busy = $query->get(['starts_at', 'ends_at'])->map(fn (Appointment $appointment) => [
            'start' => $appointment->starts_at ?? $appointment->created_at,
            'end' => $appointment->ends_at,
        ])->all();

        $slots = collect(ConsultationSlotGrid::slots($date, $busy))->map(fn (array $slot) => [
            'start' => $slot['start']->toISOString(),
            'label' => $slot['label'],
            'status' => $slot['status'],
        ])->values();

        return response()->json(['data' => $slots]);
    }
}
