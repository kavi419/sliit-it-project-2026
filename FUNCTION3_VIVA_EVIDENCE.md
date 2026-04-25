# Function 3 Viva Evidence

Member: SS 2 / Shehan

## Scope Covered
Resource & Facility Management for Smart Campus Hub.

## Endpoint Summary
| Method | Endpoint | Purpose | Access |
| --- | --- | --- | --- |
| GET | /api/resources | Search and filter resources | Public |
| GET | /api/resources/{id} | View one resource | Public |
| POST | /api/resources | Create a resource | Admin |
| PUT | /api/resources/{id} | Update a resource | Admin |
| PATCH | /api/resources/{id}/status | Toggle resource status | Admin |
| DELETE | /api/resources/{id} | Delete a resource | Admin |
| POST | /api/bookings | Create a booking for an ACTIVE resource | Authenticated user |
| GET | /api/bookings/my | View current user bookings | Authenticated user |

## Test Evidence
| Test File | What It Covers | Result |
| --- | --- | --- |
| backend/src/test/java/com/smartcampus/service/ResourceServiceTest.java | trim handling, invalid time windows, delete missing resource, status updates, search mapping | Passed |
| backend/src/test/java/com/smartcampus/controller/ResourceControllerTest.java | admin and non-admin access checks, status update flow | Passed |
| backend/src/test/java/com/smartcampus/controller/BookingControllerTest.java | active resource booking, inactive resource rejection, invalid time window rejection | Passed |

## Member Contribution Note
I implemented the resource CRUD backend, resource status workflow, search/filter support, admin resource management UI, dashboard resource binding, booking resource picker integration, and the related unit tests.

## Viva Talking Points
1. Resource status controls whether a resource can be booked.
2. Admin-only restrictions protect CRUD operations from regular users.
3. The frontend uses the Resource API so booking and management stay in sync.
4. Validation returns clean errors for invalid payloads and time windows.
5. Unit tests cover both the happy path and the main failure cases.