<?php

namespace App\Concerns;

use App\Models\Patient;

/**
 * Appends patient hospital number and full name to activity log descriptions.
 *
 * Use this trait instead of calling getActivitylogOptions() manually when a model
 * has a relationship to a Patient, so every activity log entry includes the
 * patient's identifying information.
 */
trait LogsActivityWithPatient
{
    /**
     * Get the patient model related to this record, if any.
     *
     * Checks common relationship names: patient(), billing(), admission(),
     * receivable(), and payment() → patient().
     */
    protected function getActivityPatient(): ?Patient
    {
        // Direct patient relationship
        if (method_exists($this, 'patient')) {
            $patient = $this->patient;
            if ($patient instanceof Patient) {
                return $patient;
            }
        }

        // Via billing relationship
        if (method_exists($this, 'billing')) {
            $billing = $this->billing;
            if ($billing && $billing->patient instanceof Patient) {
                return $billing->patient;
            }
        }

        // Via admission relationship
        if (method_exists($this, 'admission')) {
            $admission = $this->admission;
            if ($admission && $admission->patient instanceof Patient) {
                return $admission->patient;
            }
        }

        // Via receivable polymorphic relationship (Stock)
        if (method_exists($this, 'receivable')) {
            $receivable = $this->receivable;
            if ($receivable instanceof Patient) {
                return $receivable;
            }
        }

        // Via payment relationship (CouponUsage)
        if (method_exists($this, 'payment')) {
            $payment = $this->payment;
            if ($payment && $payment->patient instanceof Patient) {
                return $payment->patient;
            }
        }

        return null;
    }

    /**
     * Build a description prefix with patient info.
     */
    protected function patientDescriptionPrefix(): string
    {
        $patient = $this->getActivityPatient();

        if ($patient) {
            $parts = [];

            if ($patient->slug) {
                $parts[] = "HospitalNo: {$patient->slug}";
            }

            if ($patient->fullName) {
                $parts[] = "Name: {$patient->fullName}";
            }

            if ($patient->team?->name) {
                $parts[] = "Hospital: {$patient->team->name}";
            }

            if (! empty($parts)) {
                return '('.implode(', ', $parts).') ';
            }
        }

        return '';
    }
}
