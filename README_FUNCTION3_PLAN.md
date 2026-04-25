# Function 3 Execution Plan (Member: SS 2 / Shehan)

## Scope
Resource & Facility Management module for Smart Campus Hub.

## Current Progress
- Estimated completion: **95/100**
- Branch used: `feature/Shehan`
- Latest completed areas:
  - Backend resource CRUD
  - Resource status handling (ACTIVE / MAINTENANCE / OUT_OF_SERVICE)
  - Search/filter support in service layer
  - Admin resources UI page
  - Route + sidebar + dashboard navigation integration
  - Unit tests for resource service and controller
  - Booking form now pulls active resources from the API
  - Booking endpoint now validates ACTIVE resource selection

## What Is Already Done
### Backend
- `GET /api/resources` (search/filter)
- `GET /api/resources/{id}`
- `POST /api/resources` (admin)
- `PUT /api/resources/{id}` (admin)
- `PATCH /api/resources/{id}/status` (admin)
- `DELETE /api/resources/{id}` (admin)

### Frontend
- Admin resource management page with:
  - Add resource
  - Edit resource
  - Delete resource
  - Toggle status
  - Filter/search controls
- Route integration at `/resources`
- Admin-only sidebar link to Resources
- Dashboard "Manage Resources" button routing

### Testing
- `ResourceServiceTest`
- `ResourceControllerTest`
- `BookingControllerTest`
- Backend test run successful (`mvn test`)
- Frontend build successful (`npm run build`)

## Remaining Work (To Reach 96+)
1. Optional final hardening if time allows:
  - pagination or sorting for `/api/resources`
  - one more negative test for an invalid booking payload edge case

## Day-by-Day Plan

## Day 1 - Dashboard API Binding
### Tasks
- Remove hardcoded resources list from dashboard.
- Fetch resources from `/api/resources`.
- Map backend status to UI badges safely.

### Target Commits
- `feat: load dashboard resources from api`
- `fix: map resource status labels for dashboard cards`

### Done Criteria
- Dashboard shows real resources from backend.
- No hardcoded resource cards remain.

## Day 2 - Booking Integration
### Tasks
- Ensure booking form resource selection uses Resource API data.
- Restrict booking options to ACTIVE resources only.

### Status
- Done

### Target Commits
- `feat: connect booking resource picker to api`
- `fix: prevent booking inactive or maintenance resources`

### Done Criteria
- Booking and resource modules are data-consistent.

## Day 3 - Report + Viva Evidence
### Tasks
- Add resource endpoint summary to project docs.
- Add test evidence section (test names + result).
- Add explicit member contribution section for Function 3.

### Target Commits
- `docs: add resource endpoint and test evidence summary`
- `docs: update contribution notes for function 3`

### Done Criteria
- Documentation directly supports viva questions.

## Day 4 - Final Hardening
### Tasks
- Add one extra controller negative test (non-admin create/update).
- Add optional pagination or sorting support for `/api/resources` if time allows.
- Final build and test pass.

### Target Commits
- `test: add non-admin access negative test for resources`
- `chore: final cleanup and pre-viva verification`

### Done Criteria
- Clean branch, green tests, no compile errors.

## Viva Quick Notes (Function 3)
Be ready to explain:
1. Why resource status affects booking decisions.
2. Why admin-only controls are required for resource CRUD.
3. How filters improve usability.
4. Validation and error handling behavior.
5. Which endpoints and UI components you implemented personally.

## Pre-Viva Self Checklist
- [ ] All Function 3 commits are visible in `feature/Shehan`.
- [ ] Backend tests pass.
- [ ] Frontend build passes.
- [ ] Can demo add/edit/delete/toggle in under 3 minutes.
- [ ] Can explain database fields used for resources.
- [ ] Report text matches actual implementation.
