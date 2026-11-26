---
title: Endpoint Index
description: Index of all API v1 endpoints, grouped by model.
order: 2
---

# Endpoint Index

Endpoints are grouped by model/resource. Each page includes method, path, auth, team headers, params, request/response schemas, and examples.

## Admissions

- [Admissions: Delete record](admissions/delete-admissions-admission-records-type-record.md) - DELETE `/api/v1/admissions/{admission}/records/{type}/{record}`
- [Admissions: Record options](admissions/get-admissions-admission-records-options.md) - GET `/api/v1/admissions/{admission}/records/options`
- [Admissions: List records](admissions/get-admissions-admission-records.md) - GET `/api/v1/admissions/{admission}/records`
- [Admissions: Get](admissions/get-admissions-admission.md) - GET `/api/v1/admissions/{admission}`
- [Admissions: Dashboard counts](admissions/get-admissions-dashboard-counts.md) - GET `/api/v1/admissions/dashboard-counts`
- [Admissions: History](admissions/get-admissions-history.md) - GET `/api/v1/admissions/history`
- [Admissions: Search](admissions/get-admissions-search.md) - GET `/api/v1/admissions/search`
- [Admissions: List](admissions/get-admissions.md) - GET `/api/v1/admissions`
- [Admissions: Cancel](admissions/post-admissions-admission-cancel.md) - POST `/api/v1/admissions/{admission}/cancel`
- [Admissions: Discharge](admissions/post-admissions-admission-discharge.md) - POST `/api/v1/admissions/{admission}/discharge`
- [Admissions: Create record](admissions/post-admissions-admission-records-type.md) - POST `/api/v1/admissions/{admission}/records/{type}`
- [Admissions: Transfer](admissions/post-admissions-admission-transfer.md) - POST `/api/v1/admissions/{admission}/transfer`
- [Admissions: Create](admissions/post-admissions.md) - POST `/api/v1/admissions`
- [Admissions: Update record](admissions/put-admissions-admission-records-type-record.md) - PUT `/api/v1/admissions/{admission}/records/{type}/{record}`

## Appointments

- [Appointments: Get](appointments/get-appointments-appointment.md) - GET `/api/v1/appointments/{appointment}`
- [Appointments: Slots](appointments/get-appointments-slots.md) - GET `/api/v1/appointments/slots`
- [Appointments: List](appointments/get-appointments.md) - GET `/api/v1/appointments`
- [Appointments: Cancel](appointments/post-appointments-appointment-cancel.md) - POST `/api/v1/appointments/{appointment}/cancel`
- [Appointments: Transfer](appointments/post-appointments-appointment-transfer.md) - POST `/api/v1/appointments/{appointment}/transfer`
- [Appointments: Create](appointments/post-appointments.md) - POST `/api/v1/appointments`

## Authentication

- [Authentication: Get](authentication/get-auth-me.md) - GET `/api/v1/auth/me`
- [Authentication: Create](authentication/post-auth-login.md) - POST `/api/v1/auth/login`
- [Authentication: Create (logout)](authentication/post-auth-logout.md) - POST `/api/v1/auth/logout`

## Billings

- [Billings: Get](billings/get-billings-billing.md) - GET `/api/v1/billings/{billing}`
- [Billings: History](billings/get-billings-history.md) - GET `/api/v1/billings/history`
- [Billings: Options](billings/get-billings-options.md) - GET `/api/v1/billings/options`
- [Billings: List](billings/get-billings.md) - GET `/api/v1/billings`
- [Billings: Pay](billings/post-billings-pay.md) - POST `/api/v1/billings/pay`
- [Billings: Create](billings/post-billings.md) - POST `/api/v1/billings`

## Categories

- [Categories: Delete](categories/delete-categories-category.md) - DELETE `/api/v1/categories/{category}`
- [Categories: Get](categories/get-categories-category.md) - GET `/api/v1/categories/{category}`
- [Categories: List](categories/get-categories.md) - GET `/api/v1/categories`
- [Categories: Create](categories/post-categories.md) - POST `/api/v1/categories`
- [Categories: Update](categories/put-categories-category.md) - PUT `/api/v1/categories/{category}`

## Consultations

- [Consultations: Delete record](consultations/delete-consultations-consultation-records-type-record.md) - DELETE `/api/v1/consultations/{consultation}/records/{type}/{record}`
- [Consultations: Record options](consultations/get-consultations-consultation-records-options.md) - GET `/api/v1/consultations/{consultation}/records/options`
- [Consultations: List records](consultations/get-consultations-consultation-records.md) - GET `/api/v1/consultations/{consultation}/records`
- [Consultations: Get](consultations/get-consultations-consultation.md) - GET `/api/v1/consultations/{consultation}`
- [Consultations: List](consultations/get-consultations.md) - GET `/api/v1/consultations`
- [Consultations: End](consultations/post-consultations-consultation-end.md) - POST `/api/v1/consultations/{consultation}/end`
- [Consultations: Create record](consultations/post-consultations-consultation-records-type.md) - POST `/api/v1/consultations/{consultation}/records/{type}`
- [Consultations: Start](consultations/post-consultations-consultation-start.md) - POST `/api/v1/consultations/{consultation}/start`
- [Consultations: Transfer](consultations/post-consultations-consultation-transfer.md) - POST `/api/v1/consultations/{consultation}/transfer`
- [Consultations: Create](consultations/post-consultations.md) - POST `/api/v1/consultations`
- [Consultations: Update record](consultations/put-consultations-consultation-records-type-record.md) - PUT `/api/v1/consultations/{consultation}/records/{type}/{record}`

## Laboratories

- [Laboratories: Get](laboratories/get-laboratories-laboratory.md) - GET `/api/v1/laboratories/{laboratory}`
- [Laboratories: List](laboratories/get-laboratories.md) - GET `/api/v1/laboratories`
- [Laboratories: Cancel](laboratories/post-laboratories-laboratory-cancel.md) - POST `/api/v1/laboratories/{laboratory}/cancel`
- [Laboratories: Store results](laboratories/post-laboratories-laboratory-results.md) - POST `/api/v1/laboratories/{laboratory}/results`
- [Laboratories: Create](laboratories/post-laboratories.md) - POST `/api/v1/laboratories`

## Nursing

- [Nursing: Delete record](nursing/delete-nursing-nursing-records-type-record.md) - DELETE `/api/v1/nursing/{nursing}/records/{type}/{record}`
- [Nursing: Record options](nursing/get-nursing-nursing-records-options.md) - GET `/api/v1/nursing/{nursing}/records/options`
- [Nursing: List records](nursing/get-nursing-nursing-records.md) - GET `/api/v1/nursing/{nursing}/records`
- [Nursing: Get](nursing/get-nursing-nursing.md) - GET `/api/v1/nursing/{nursing}`
- [Nursing: List](nursing/get-nursing.md) - GET `/api/v1/nursing`
- [Nursing: Complete](nursing/post-nursing-nursing-complete.md) - POST `/api/v1/nursing/{nursing}/complete`
- [Nursing: Create record](nursing/post-nursing-nursing-records-type.md) - POST `/api/v1/nursing/{nursing}/records/{type}`
- [Nursing: Start](nursing/post-nursing-nursing-start.md) - POST `/api/v1/nursing/{nursing}/start`
- [Nursing: Transfer](nursing/post-nursing-nursing-transfer.md) - POST `/api/v1/nursing/{nursing}/transfer`
- [Nursing: Store vitals](nursing/post-nursing-nursing-vitals.md) - POST `/api/v1/nursing/{nursing}/vitals`
- [Nursing: Create](nursing/post-nursing.md) - POST `/api/v1/nursing`
- [Nursing: Update record](nursing/put-nursing-nursing-records-type-record.md) - PUT `/api/v1/nursing/{nursing}/records/{type}/{record}`

## Patients

- [Patients: Options](patients/get-patients-form-options.md) - GET `/api/v1/patients/form-options`
- [Patients: Get](patients/get-patients-patient-slug.md) - GET `/api/v1/patients/{patient:slug}`
- [Patients: List](patients/get-patients.md) - GET `/api/v1/patients`
- [Patients: Create](patients/post-patients.md) - POST `/api/v1/patients`
- [Patients: Update](patients/put-patients-patient-slug.md) - PUT `/api/v1/patients/{patient:slug}`

## Prescriptions

- [Prescriptions: Get](prescriptions/get-prescriptions-prescription.md) - GET `/api/v1/prescriptions/{prescription}`
- [Prescriptions: List](prescriptions/get-prescriptions.md) - GET `/api/v1/prescriptions`
- [Prescriptions: Dispense](prescriptions/post-prescriptions-prescription-dispense.md) - POST `/api/v1/prescriptions/{prescription}/dispense`
- [Prescriptions: Refund](prescriptions/post-prescriptions-prescription-refund.md) - POST `/api/v1/prescriptions/{prescription}/refund`
- [Prescriptions: Create](prescriptions/post-prescriptions.md) - POST `/api/v1/prescriptions`

## Teams

- [Teams: Get](teams/get-teams-team-slug.md) - GET `/api/v1/teams/{team:slug}`
- [Teams: List](teams/get-teams.md) - GET `/api/v1/teams`

## Users

- [Users: Get](users/get-users-user.md) - GET `/api/v1/users/{user}`
- [Users: List](users/get-users.md) - GET `/api/v1/users`

## Ward Round

- [Ward Round: Options](ward-round/get-ward-round-options.md) - GET `/api/v1/ward-round/options`
- [Ward Round: Search](ward-round/get-ward-round-patients-search.md) - GET `/api/v1/ward-round/patients/search`

## Wards

- [Wards: Force delete](wards/delete-wards-ward-force.md) - DELETE `/api/v1/wards/{ward}/force`
- [Wards: Delete](wards/delete-wards-ward.md) - DELETE `/api/v1/wards/{ward}`
- [Wards: Get](wards/get-wards-ward.md) - GET `/api/v1/wards/{ward}`
- [Wards: List](wards/get-wards.md) - GET `/api/v1/wards`
- [Wards: Bulk delete](wards/post-wards-bulk-delete.md) - POST `/api/v1/wards/bulk-delete`
- [Wards: Admit](wards/post-wards-ward-admit.md) - POST `/api/v1/wards/{ward}/admit`
- [Wards: Restore](wards/post-wards-ward-restore.md) - POST `/api/v1/wards/{ward}/restore`
- [Wards: Create](wards/post-wards.md) - POST `/api/v1/wards`
- [Wards: Update](wards/put-wards-ward.md) - PUT `/api/v1/wards/{ward}`
