# LuxeAI — AI-Powered E-Commerce Platform

A full-stack e-commerce platform with a recommendation engine that suggests products based on what each user has bought. Built with the MERN stack and a Python/FastAPI recommendation service.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Stack](https://img.shields.io/badge/stack-MERN%20%2B%20Python-green)

## Overview

LuxeAI is an e-commerce platform inspired by fashion-forward retail brands. Users browse the catalog by category, manage a cart and pay with Stripe, while a recommendation engine suggests products similar to the ones they have bought.

The platform is built as a microservices architecture. The recommendation system runs as an independent Python/FastAPI service that the Node.js backend calls over HTTP.

## Features

**Shopping Experience**
- User registration and authentication (JWT-based)
- Product catalog with category filtering and product detail pages
- Shopping cart with stock validation
- Checkout with Stripe and order history

**Recommendations**
- "Recommended for you" — products similar to the user's past purchases
- Previously shown recommendations are kept, and new ones are added as the user buys more

**Admin Panel**
- Dashboard stats, user management, product CRUD and order status management

**Technical**
- Microservices architecture — the recommendation service is fully decoupled
- RESTful API design across all services
- Containerized with Docker and Docker Compose
- MongoDB for product, user, order and recommendation data
- Recommendation model with scikit-learn (TF-IDF + cosine similarity)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│                    React (Vite)                         │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP
┌───────────────────────▼─────────────────────────────────┐
│                   Main Backend                          │
│               Node.js / Express                         │
│      Auth · Products · Cart · Orders · Admin            │
└───────────┬──────────────────────────┬──────────────────┘
            │ MongoDB                  │ HTTP (internal)
┌───────────▼──────────┐  ┌────────────▼─────────────────┐
│       MongoDB        │  │        AI Service            │
│  Users · Products    │  │     Python / FastAPI         │
│  Orders · Carts      │◄─┤  Recommendation Engine       │
└──────────────────────┘  └──────────────────────────────┘
```

## Project Structure

```
luxeai/
├── client/                   # React + Vite frontend
│
├── server/                   # Node.js/Express main backend
│   ├── app.js                # Express app
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/          # Route handlers
│   ├── models/               # Mongoose schemas + custom HttpError
│   ├── routes/               # API route definitions
│   ├── middlewares/          # JWT auth, role guards, response cache
│   ├── schemas/              # Zod validation schemas
│   ├── data/ + seed.js       # Sample data and the seed script
│   └── tests/                # Jest + Supertest
│
├── ai-service/               # Python/FastAPI recommendation service
│   ├── app/                  # API routes, recommender, Mongo repositories
│   └── tests/                # pytest
│
├── docker-compose.yml        # Orchestrates backend, frontend, AI service and MongoDB
├── setup.sh                  # Creates the env files for a fresh clone
├── .env.example              # Optional compose-level variables (DOCKER_MONGODB_URI)
└── README.md
```

## Getting Started

**Prerequisites**
- [Docker](https://docs.docker.com/get-docker/) with Docker Compose (for Option A)
- Node.js v22+ (for Option B)
- [uv](https://docs.astral.sh/uv/) and Python 3.12+ (for Option B, AI service)

### Quick start

```bash
git clone <repo-url> && cd LuxeAI
./setup.sh                                  # creates the three .env files
docker compose up -d --build
docker compose exec backend npm run seed    # loads the sample data
docker compose restart backend              # clears the cached (empty) catalog
```

Then open http://localhost:5173 and log in with one of the [sample users](#sample-users). Steps 1–3 below explain what each command does.

### 1. Create your env files

The real `.env` files are git-ignored, so each machine creates its own from the templates. `./setup.sh` does it for you: it copies the three templates, sets a random `JWT_SECRET`, and never overwrites a `.env` that already exists. To do it by hand (for example on Windows without Git Bash or WSL):

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
cp ai-service/.env.example ai-service/.env
```

All three are required: `docker compose` refuses to start if any of them is missing. The defaults already point to a local MongoDB and the local services; if you copied them by hand, also change `JWT_SECRET` in `server/.env`.

### 2. Database

By default the project uses a **local MongoDB** that runs in Docker (no Atlas account needed). It starts empty, so load the sample data (users, products and orders) once:

```bash
# With the whole stack running (Option A)
docker compose exec backend npm run seed
docker compose restart backend

# Or without Docker for the backend (Option B)
docker compose up -d mongo
cd server && npm ci && npm run seed
```

The seed also tells the AI service to rebuild its index, so recommendations work right away. The backend caches product responses in memory for 5 minutes, so restart it after seeding (Option B: stop and re-run `npm run dev`); otherwise the store can show an empty catalog until the cache expires.

#### What the seed loads

The data is the same on every machine and every run, so everyone who clones the repo gets identical users, products and orders.

- **48 products** in 8 categories (Accessories, Shoes, Clothing, Bags, Fitness, Skincare, Tech, Kitchen), 3 of them out of stock.
- **25 users**: 1 admin and 24 shoppers. Each shopper has a favourite category and most of their orders come from it, so their recommendations are easy to tell apart.
- **38 orders** from the last 90 days in every status (`delivered`, `shipped`, `processing`, `paid`, `pending`, `cancelled`). `pending` and `cancelled` orders don't count as purchases for recommendations.
- **5 carts**, one of them asking for every unit left of a product, to try the stock checks.
- The `saved_recommendations` collection, empty: it fills up the first time each user opens "Recommended for you".

There are more than 20 users and orders, so the admin pages show their pagination.

#### Sample users

| Email                        | Password         | Role  | Buys mostly | Notes                                      |
|------------------------------|------------------|-------|-------------|--------------------------------------------|
| `alisson@gmail.com`          | `Password123@`   | user  | Skincare    | 3 delivered orders                         |
| `carlos@hotmail.com`         | `Fakepassy789!`  | user  | Tech        | 3 delivered orders, items in the cart      |
| `barry@outlook.com`          | `Cotrasenia123!` | admin | —           | Admin panel; no orders                     |
| `emma.wilson@example.com`    | `Shopper123!`    | user  | Fitness     | Cart holds all the stock of one product    |
| `mason.anderson@example.com` | `Shopper123!`    | user  | Kitchen     |                                            |
| `grace.scott@example.com`    | `Shopper123!`    | user  | —           | No orders: empty recommendations           |

All the other `@example.com` users also use `Shopper123!`; the full list is in `server/data/userData.js`.

`npm run seed` wipes users, products, carts, orders and saved recommendations first, and refuses to run against a `mongodb+srv` (Atlas) URI unless you pass `--force`.

**First user is admin.** On a database with no users (for example if you skip the seed), the first account that registers becomes the admin. Every account after it is a regular user.

To browse the data, open [MongoDB Compass](https://www.mongodb.com/products/tools/compass) and connect to `mongodb://localhost:27017` (database `luxeai`).

**Using your own database (e.g. Atlas) instead**
- Docker: create a `.env` in the project root with `DOCKER_MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/your_db` (see `.env.example`). Both the backend and the AI service use it.
- Manual: set `MONGODB_URI` in `server/.env` and `ai-service/.env`.
- URL-encode special characters in the password (`@` -> `%40`). After changing a `.env`, recreate the containers: `docker compose up -d --force-recreate backend microservice`.

### 3. Payments (Stripe, optional)

Checkout needs Stripe **test** keys. Without them everything else works (browsing, cart, the seeded orders and recommendations), but `Continue to Payment` fails with `Failed to create order`.

1. Create a free account at [stripe.com](https://stripe.com) and stay in **test mode**.
2. Copy the keys from *Developers → API keys*:
   - Secret key (`sk_test_...`) → `STRIPE_SECRET_KEY` in `server/.env`
   - Publishable key (`pk_test_...`) → `VITE_STRIPE_PUBLISHABLE_KEY` in `client/.env`
3. Recreate the containers so they read the new values: `docker compose up -d --force-recreate backend frontend`.
4. Pay with the test card `4242 4242 4242 4242`, any future date and any CVC.

The order is marked as paid right after the payment, so the webhook is not required locally. To also test it, install the [Stripe CLI](https://docs.stripe.com/stripe-cli) and run `stripe listen --forward-to localhost:5001/api/webhooks/stripe`, then put the `whsec_...` secret it prints in `STRIPE_WEBHOOK_SECRET`.

### Option A — Run with Docker (recommended)

```bash
docker compose up -d --build
```

| Service     | URL                                                        |
|-------------|------------------------------------------------------------|
| Frontend    | http://localhost:5173                                      |
| Backend API | http://localhost:5001                                      |
| AI Service  | http://localhost:8000 (interactive docs at `/docs`)        |
| MongoDB     | localhost:27017                                            |

The backend and the AI service reload automatically when you edit their code (the source is mounted into the containers).

Inside Docker the backend reaches the AI service at `http://microservice:8000` and MongoDB at `mongo:27017`; compose sets both, so the `localhost` values in the `.env` files are only used for manual runs. The AI service has no authentication, so its port is only published on `127.0.0.1`: you can use it from your machine, but not from other devices on your network.

### Option B — Run services manually

Keep MongoDB in Docker (`docker compose up -d mongo`) or point `MONGODB_URI` to your own, then in three terminals:

```bash
# Backend (http://localhost:5001)
cd server && npm ci && npm run dev

# Frontend (http://localhost:5173)
cd client && npm ci && npm run dev

# AI service (http://localhost:8000)
cd ai-service && uv sync && uv run fastapi dev
```

### Running the tests

```bash
# Backend: Jest + Supertest against an in-memory MongoDB (no setup needed)
cd server && npm test

# AI service: pytest, never touches a database
cd ai-service && uv run pytest
```

Lint and formatting (ESLint + Prettier in `server/`, ruff in `ai-service/`, ESLint in `client/`):

```bash
cd server && npm run lint && npm run format:check   # npm run format fixes it
cd ai-service && uv run ruff check . && uv run ruff format --check .
cd client && npm run lint
```

GitHub Actions runs lint, the formatting check and the tests of `server/` and `ai-service/` on every push to `main` that changes their folder.

### Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| `env file .../ai-service/.env not found` | Run `./setup.sh` (or copy the three `.env.example` files, see step 1). |
| `bad auth : authentication failed` | Wrong or outdated DB password in `.env`; update it and recreate the containers. |
| Browser shows `ERR_CONNECTION_REFUSED` on `/api/products` | `VITE_API_URL` in `client/.env` doesn't match the backend (`http://localhost:5001`). Recreate the frontend container. |
| Compass shows an empty `localhost:27017` | The seed hasn't been run, or the services use another database (`DOCKER_MONGODB_URI` is set). |
| Store shows no products right after seeding | The backend served a cached empty list from before the seed. Restart it: `docker compose restart backend` (or re-run `npm run dev`). |
| `Continue to Payment` fails with `Failed to create order` | Stripe keys missing or invalid, see step 3. The real cause is in `docker compose logs backend`. |
| Recommendations page is empty | The user has no paid orders yet. Log in as a seeded user, or buy something. |
| `docker compose up` fails with `port is already allocated` on 27017 | Another MongoDB is running on your machine (e.g. a Homebrew or Windows service). Stop it, or change the host port of the `mongo` service. |

## API Overview

**Auth — `/api/auth`**

| Method | Endpoint    | Auth | Description           |
|--------|-------------|------|-----------------------|
| POST   | `/register` | —    | Register a new user   |
| POST   | `/login`    | —    | Login and receive JWT |

**Products — `/api/products`**

| Method | Endpoint | Auth  | Description        |
|--------|----------|-------|--------------------|
| GET    | `/`      | —     | Get all products   |
| GET    | `/:id`   | —     | Get single product |
| POST   | `/`      | Admin | Add a new product  |
| PATCH  | `/:id`   | Admin | Update a product   |
| DELETE | `/:id`   | Admin | Delete a product   |

**Cart — `/api/cart` (requires JWT)**

| Method | Endpoint                            | Description               |
|--------|-------------------------------------|---------------------------|
| GET    | `/getCart/:userId`                  | Get user's cart           |
| POST   | `/addToCart`                        | Add item to cart          |
| PATCH  | `/updateCart/:userId`               | Update item quantity      |
| DELETE | `/deleteProduct/:userId/:productId` | Remove item from cart     |
| GET    | `/total/:userId`                    | Get cart total            |
| DELETE | `/clearCart/:userId`                | Clear all items from cart |

**Orders — `/api/orders` (requires JWT)**

| Method | Endpoint       | Description                                             |
|--------|----------------|---------------------------------------------------------|
| POST   | `/`            | Create an order from the cart and a Stripe PaymentIntent (reuses the user's pending order if they check out again) |
| POST   | `/:id/confirm` | Mark the order paid after Stripe confirms the payment    |
| GET    | `/me`          | Current user's orders                                   |
| GET    | `/:id`         | Single order (owner only)                               |

`POST /api/webhooks/stripe` receives Stripe events (signature-verified, no JWT).

**Recommendations — `/api/recommendations` (requires JWT)**

| Method | Endpoint | Description                                  |
|--------|----------|----------------------------------------------|
| GET    | `/`      | Recommendations for the logged-in user (`?limit=`, default 3) |

**Admin — `/api/admin` (requires JWT + admin role)**

| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| GET    | `/stats`              | Dashboard stats     |
| GET    | `/users`              | List users (paginated) |
| PATCH  | `/users/:id`          | Update a user       |
| DELETE | `/users/:id`          | Delete a user       |
| GET    | `/orders`             | List orders (paginated) |
| PATCH  | `/orders/:id/status`  | Update order status |

**AI Service — `localhost:8000` (internal, called by the backend)**

| Method | Endpoint                     | Description                                         |
|--------|------------------------------|-----------------------------------------------------|
| GET    | `/recommendations/{user_id}` | Recommendations for a user (`?limit=`, default 3)   |
| POST   | `/recommendations/sync`      | Rebuild the index from the current catalog          |

## How the Recommendation Engine Works

The AI service uses **content-based filtering**:

1. **Index.** At startup it loads the catalog and turns each product's name, description and category into a TF-IDF vector (scikit-learn). The backend calls `/recommendations/sync` to rebuild it whenever products are created, edited or deleted, when an order changes stock, and after the seed.
2. **User profile.** It reads the user's paid orders (`paid`, `processing`, `shipped`, `delivered`; abandoned `pending` orders don't count) and adds up the vectors of the products bought, weighted by quantity.
3. **Ranking.** Products are ranked by cosine similarity to that profile, skipping what the user already bought and anything out of stock.
4. **Memory.** Recommendations already shown are saved per user (`saved_recommendations` collection) and kept on later visits, with new ones appended, up to 12. A saved product is dropped once the user buys it, it runs out of stock or it is deleted.

## Known Limitations

These are deliberate trade-offs for the current scale (a single instance of each service and a catalog of hundreds of products), documented so they are not mistaken for oversights.

- **State lives in memory, per process.** The product cache, the recommender index and the login rate-limit counter are kept in memory. With more than one backend or AI service instance, invalidating the cache or syncing the index would only reach one of them; scaling out needs a shared cache (e.g. Redis) and a shared or rebuilt-per-instance index.
- **Stock is decremented on payment, not reserved at checkout.** Stock is checked when the order is created and decremented when it is paid, never below zero. If two customers pay for the last unit at the same time, both orders are marked paid. A reservation step (hold stock while the PaymentIntent is open) would close that gap.
- **The recommender index is rebuilt from scratch** on every catalog or stock change. That is instant for this catalog, but grows with its size; a large catalog would need incremental updates.
- **Index syncs are fire-and-forget.** If the AI service is down when a product changes, its index stays stale until the next change or until it restarts (it always rebuilds on startup).
- **Reading recommendations writes to the database.** `GET /recommendations/{user_id}` saves the list it returns, so previously shown recommendations persist. It is idempotent, but it is not a pure read.
- **The AI service has no authentication.** It relies on network isolation: the compose network, and a port published only on `127.0.0.1`. Exposing it needs a shared secret between the backend and the service.
- **Content-based only.** Users without paid orders get no recommendations; collaborative filtering and trending products are on the roadmap.
- **Abandoned checkouts are not expired.** A user's pending order is reused when they check out again, but pending orders are never cleaned up automatically.
- **The JWT is stored in `localStorage`**, which an XSS bug could read. An `httpOnly` cookie would be safer. Authorization never trusts the token's role: admin routes check it in the database.
- **Docker Compose is set up for development** (Vite dev server, nodemon, `fastapi dev`, source mounted into the containers). A production setup would serve the client's static build and run the services without reload.

## Roadmap

- [x] Project scaffolding and architecture design
- [x] User authentication (register/login/JWT)
- [x] Product catalog (CRUD, admin-protected writes)
- [x] Shopping cart with ownership validation and auth protection
- [x] Admin panel (stats, users, products, orders)
- [x] Zod request validation across all routes
- [x] Order history and checkout flow (Stripe)
- [x] Frontend (React + Vite)
- [x] Python recommendation service (content-based)
- [x] "Recommended for you" page
- [x] Docker Compose full orchestration
- [x] Backend and AI service test suites, with CI
- [ ] Frontend tests (Vitest + React Testing Library)
- [ ] Product search and sorting
- [ ] Collaborative filtering (what similar users bought)
- [ ] Trending products for users with no history
- [ ] Deployment (Render / Railway / AWS)

## Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| Frontend   | React, Vite, Tailwind CSS          |
| Backend    | Node.js, Express.js                |
| Database   | MongoDB, Mongoose                  |
| Validation | Zod                                |
| Payments   | Stripe                             |
| AI Service | Python, FastAPI, scikit-learn      |
| Auth       | JWT, bcrypt                        |
| Testing    | Jest, Supertest, pytest            |
| DevOps     | Docker, Docker Compose, GitHub Actions |
| Deployment | Render / Railway (planned)         |

## License

[MIT](LICENSE) © 2026 Mateo Blondet
