---
title: Welcome
description: AcaRed documentation and API reference.
order: 1
---

# Welcome to AcaRed Documentation

AcaRed is a comprehensive healthcare management system built with Laravel.

## Documentation Sections

- **API v1** — Versioned Sanctum JSON API for Android/mobile clients.

## API v1

The v1 API provides team-scoped, token-authenticated endpoints for:

- **Patients** — Patient records and form options
- **Appointments** — Reception scheduling, slots, transfer, cancel
- **Consultations** — Consultation lifecycle and clinical records
- **Nursing** — Nursing flow, vitals, completion, clinical records
- **Admissions / Wards** — Ward CRUD, admission lifecycle, ward rounds
- **Laboratories** — Lab requests, results, cancellation
- **Prescriptions** — Pharmacy prescriptions, dispense, refund
- **Billings** — Billing, history/options, payments
- **Supporting** — Teams, categories, users

All v1 endpoints (except `POST /api/v1/auth/login`) require `Authorization: Bearer <token>`. Team-scoped endpoints also require `X-Team-Slug` or `X-Team-ID`.

> [!TIP]
> Start at the [API v1 Overview](api-v1) or browse the [Endpoint Index](api-v1/endpoints-index).
