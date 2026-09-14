# StayNRide Backend (Django REST API)

Backend for the StayNRide homestay booking & bike rental site — Rewalsar, Mandi, HP.
Runs separately from the frontend (`h_r_fe`) and exposes a JSON REST API.

## Run it

```powershell
cd "d:\book hotels and rentals bike website\h_r_be"
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

Server starts at **http://127.0.0.1:8010** (default port changed from Django's usual
8000 because that port is already used by another project on this machine — see
`core/management/commands/runserver.py`).

Admin panel: http://127.0.0.1:8010/admin/
- username: `admin`
- password: `admin12345`
(created via `createsuperuser`; change this in production)

## Data model

- **Profile** — extra per-user data (phone), auto-created on signup
- **Homestay** — Verma Homestay & Rohit Homestay, Rewalsar
- **Bike** — 7 bikes/scooters, each with `price_per_day`, `security_deposit`,
  `quantity` (fleet size), and `is_package_bike` (Himalayan & Xpulse carry a flat
  ₹5999 security deposit instead of the usual ₹2000)
- **Booking** — one row per booking (homestay or bike), owned by a user,
  snapshots the item name/price at booking time, has a `status`
  (`Confirmed`/`Cancelled`)

## API endpoints

All under `/api/`:

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup/` | – | `{name, email, password, phone?}` → `{token, user}` |
| POST | `/auth/login/` | – | `{email, password}` → `{token, user}` |
| GET | `/auth/me/` | token | current user + profile |
| GET | `/homestays/` | – | list (supports `?q=` and `?sort=price_low\|price_high\|rating`) |
| GET | `/homestays/<id>/` | – | detail |
| GET | `/bikes/` | – | list (supports `?q=` and `?type=`) |
| GET | `/bikes/<id>/` | – | detail |
| GET | `/bookings/` | token | current user's bookings |
| POST | `/bookings/` | token | create a booking — see below |
| GET | `/bookings/<id>/` | token | one booking |
| POST | `/bookings/<id>/cancel/` | token | cancel a booking |

**Create a booking** — `POST /api/bookings/`:

Homestay:
```json
{"item_type": "homestay", "homestay": 1, "checkin": "2026-09-10", "checkout": "2026-09-13", "guests_or_days": 2}
```

Bike:
```json
{"item_type": "bike", "bike": 4, "checkin": "2026-09-10", "checkout": "2026-09-15"}
```

Server computes `rental_charge`, `security_deposit` and `total_price` itself —
never trust a client-supplied price.

**Auth header** for protected routes:
```
Authorization: Token <token from signup/login response>
```

CORS is open (`CORS_ALLOW_ALL_ORIGINS = True`) so the frontend (any port) can call
this API directly during development.
