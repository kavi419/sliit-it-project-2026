# Function 3 Viva Evidence

Member: SS 2 / Shehan

## Scope Covered
Resource & Facility Management for Smart Campus Hub.

## Endpoint Summary
| Method | Endpoint | Purpose | Access |
| --- | --- | --- | --- |
| GET | /api/resources | Search/Filter (Paginated & Sorted) | Public |
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
| backend/src/test/java/com/smartcampus/service/ResourceServiceTest.java | trim handling, invalid time windows, delete missing resource, status updates, search mapping (paginated) | Passed |
| backend/src/test/java/com/smartcampus/controller/ResourceControllerTest.java | admin and non-admin access checks, status update flow, pagination support | Passed |
| backend/src/test/java/com/smartcampus/controller/BookingControllerTest.java | active resource booking, inactive resource rejection, invalid time window rejection | Passed |
| backend/src/test/java/com/smartcampus/backend/ResourceUserJourneyIntegrationTest.java | **User Journey**: Admin Create -> User Search -> User Book -> Verify List | Passed |

## Member Contribution Note
I implemented the resource CRUD backend, resource status workflow, search/filter support, admin resource management UI, dashboard resource binding, booking resource picker integration, and the related unit tests.

## Viva Talking Points
1. **Security**: Admin-only restrictions protect CRUD operations via custom `ensureAdmin` logic.
2. **Hardening**: Implemented Spring Data `Pageable` for efficient searching and sorting of resources.
3. **Data Integrity**: Resource status (Active/Maintenance) directly controls booking availability.
4. **Integration**: The dashboard dynamically binds to both Resource and Booking APIs for a seamless user experience.
5. **Testing**: Comprehensive coverage including a **User Journey Integration Test** simulating a complete end-to-end lifecycle.