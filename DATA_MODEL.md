# DATA_MODEL.md — Entity Schema Reference

Relational model (PostgreSQL-style). Adapt types to chosen ORM (Prisma/TypeORM/Sequelize).

---

### Organization
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | string | |
| code | string, unique | used at signup to bind employee to org |
| fuelCostPerLitre | decimal | admin-configurable |
| costPerKm | decimal | admin-configurable |
| createdAt | timestamp | |

### User (Employee / Admin)
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| organizationId | uuid (FK → Organization) | |
| name | string | |
| email | string, unique | |
| phone | string | |
| passwordHash | string | |
| role | enum(EMPLOYEE, ADMIN) | |
| walletBalance | decimal, default 0 | mirror of ledger sum, not source of truth |
| createdAt | timestamp | |

### SavedPlace
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| userId | uuid (FK → User) | |
| label | string | e.g. "Home", "Office" |
| address | string | |
| lat / lng | decimal | |

### Vehicle
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| ownerId | uuid (FK → User) | must be role EMPLOYEE |
| model | string | |
| registrationNumber | string, unique | |
| seatingCapacity | integer | |
| createdAt | timestamp | |

### Ride
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| organizationId | uuid (FK) | denormalized for fast scoped queries |
| driverId | uuid (FK → User) | |
| vehicleId | uuid (FK → Vehicle) | required |
| pickupAddress / pickupLat / pickupLng | | |
| destinationAddress / destinationLat / destinationLng | | |
| routePolyline | text | cached from Directions API |
| date | date | |
| time | time | |
| availableSeats | integer | decremented on booking, guarded ≥ 0 |
| farePerSeat | decimal | |
| recurring | boolean | |
| status | enum(OPEN, FULL, CANCELLED) | |
| createdAt | timestamp | |

### Booking
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| rideId | uuid (FK → Ride) | |
| passengerId | uuid (FK → User) | |
| seatsBooked | integer | |
| status | enum(CONFIRMED, CANCELLED) | |
| createdAt | timestamp | |

### Trip
One Trip per confirmed Ride once it moves into active lifecycle (1:1 with Ride, or created at first booking — pick one and be consistent).

| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| rideId | uuid (FK → Ride) | |
| status | enum(BOOKED, STARTED, IN_PROGRESS, COMPLETED, PAYMENT_PENDING, PAYMENT_COMPLETED) | |
| startedAt | timestamp, nullable | |
| completedAt | timestamp, nullable | |
| distanceKm | decimal, nullable | computed at completion |
| durationMin | integer, nullable | computed at completion |

### TripLocationPing (ephemeral, high-write — consider a separate fast store)
| Field | Type | Notes |
|---|---|---|
| tripId | uuid (FK) | |
| lat / lng | decimal | |
| timestamp | timestamp | |

> Optional: don't persist every ping in Postgres — stream via Socket.IO and only persist a decimated trail (e.g., every 30s) if trip replay is needed for reports.

### Payment
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| tripId | uuid (FK → Trip) | |
| payerId | uuid (FK → User) | |
| amount | decimal | |
| method | enum(CASH, CARD, UPI, WALLET) | |
| status | enum(PENDING, SUCCESS, FAILED) | |
| gatewayReference | string, nullable | Razorpay order/payment id |
| createdAt | timestamp | |

### WalletTransaction
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| userId | uuid (FK → User) | |
| type | enum(RECHARGE, PAYMENT_DEBIT) | |
| amount | decimal | |
| relatedPaymentId | uuid, nullable (FK → Payment) | |
| createdAt | timestamp | |

### ChatMessage
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| tripId | uuid (FK → Trip) | |
| senderId | uuid (FK → User) | |
| content | text | |
| createdAt | timestamp | |

---

## Key Relationships

- `Organization 1—N User`
- `User 1—N Vehicle`
- `User(driver) 1—N Ride`
- `Ride 1—N Booking`
- `Ride 1—1 Trip` (created once first booking confirms, or once route is published — pick one convention and document it in code comments)
- `Trip 1—N ChatMessage`
- `Trip 1—N Payment` (normally 1, but model allows retries)
- `User 1—N WalletTransaction`

## Derived / Reporting Fields (compute, don't store raw)
- Total Trips (per user / per org) — `COUNT(Trip WHERE status = PAYMENT_COMPLETED)`
- Total Distance Travelled — `SUM(Trip.distanceKm)`
- Fuel Consumption — `SUM(distanceKm) / avg vehicle mileage` (needs a mileage field on Vehicle if precise; otherwise estimate via org's `fuelCostPerLitre` config)
- Cost per KM — `SUM(Payment.amount) / SUM(distanceKm)`
- Vehicle-wise Cost Analysis — group Trips by `Ride.vehicleId`
- Fuel Efficiency Trends — time-bucketed (weekly/monthly) aggregation of distance vs. fuel cost
