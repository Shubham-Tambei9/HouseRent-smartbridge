# House Rent Management System

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application for exploring rental properties, posting listings, and managing bookings with role-based access (user and admin).

## Features

- **User auth**: Register, login, JWT-based sessions
- **Property browse & search**: Filter by location, price, type (apartment, house, studio, villa)
- **Property listing**: Owners submit listings; admin approves or rejects
- **Bookings**: Renters book properties with check-in/check-out and total amount
- **Dashboards**: User dashboard (listings, bookings) and Admin dashboard (pending approvals, bookings, users)
- **CRUD**: Full create, read, update, delete for properties and bookings with validation
- **Security**: bcrypt password hashing, JWT auth, role-based route protection

## Prerequisites

- **Node.js** (v16+)
- **MongoDB** (local or Atlas)
- **Git**

## Environment Setup

### Backend

```bash
cd backend
npm install
```

Create a `.env` file (see `.env.example`):

- `PORT` – server port (default 5000)
- `MONGODB_URI` – MongoDB connection string (e.g. `mongodb://localhost:27017/house_rent_db`)
- `JWT_SECRET` – secret for signing JWTs (use a strong value in production)

### Frontend

```bash
cd frontend
npm install
```

Optional: create `frontend/.env` with:

- `REACT_APP_API_URL=http://localhost:5000` (if API is not on same host/proxy)

## Running the Application

1. **Start MongoDB** (if local):

   ```bash
   mongod
   ```

2. **Start backend**:

   ```bash
   cd backend
   npm run dev
   ```

   Server runs at `http://localhost:5000`.

3. **Start frontend**:

   ```bash
   cd frontend
   npm start
   ```

   App runs at `http://localhost:3000` and proxies API requests to the backend when using default setup.

## Database Design

- **Users**: name, email, password (hashed), role (user | admin), phone
- **Properties**: title, description, type, location, city, price, bedrooms, bathrooms, area, images, amenities, owner (ref User), status (pending | approved | rejected)
- **Bookings**: property (ref), user (ref), checkIn, checkOut, guests, totalAmount, status (pending | confirmed | cancelled | completed)

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST   | /api/auth/register | - | Register |
| POST   | /api/auth/login    | - | Login |
| GET    | /api/auth/me       | ✓ | Current user |
| GET    | /api/properties    | - | List (approved), query: search, type, city, minPrice, maxPrice |
| GET    | /api/properties/my-listings | ✓ | My listings |
| GET    | /api/properties/pending     | Admin | Pending for approval |
| GET    | /api/properties/:id        | - | Property detail |
| POST   | /api/properties    | ✓ | Create property |
| PUT    | /api/properties/:id| ✓ | Update property |
| DELETE | /api/properties/:id| ✓ | Delete property |
| PATCH  | /api/properties/:id/approve | Admin | Approve/reject |
| POST   | /api/bookings      | ✓ | Create booking |
| GET    | /api/bookings/my   | ✓ | My bookings |
| GET    | /api/bookings/admin| Admin | All bookings |
| PATCH  | /api/bookings/:id/status | ✓ | Update booking status |

## Testing & Validation

- Test registration and login; then browse, filter, and book properties.
- As owner: add/edit listings and check status (pending → approved/rejected by admin).
- As admin: open `/admin`, approve or reject pending properties; view users and bookings.
- Check form validation (required fields, email, min password length) and API error responses.
- Verify responsiveness (Bootstrap) on different screen sizes.

## Monitoring & Optimization

- **Logging**: Backend uses `morgan` for HTTP logging.
- **Errors**: Express global error handler returns JSON and logs stack in development.
- **MongoDB**: Indexes on Property (text search, type/city/price/status) and Booking (property, user, dates) for faster queries.
- **Structure**: Controllers handle business logic; routes define validation and auth; models define schema. Scale by adding more route/controller modules.

## Creating an Admin User

By default, new registrations are `user`. To create an admin, either:

1. Register normally, then in MongoDB set the user's `role` to `admin` in the `users` collection, or  
2. Use the register API with a body that includes `role: "admin"` (if you add this to your backend for initial setup only and restrict it in production).

## License

MIT.
