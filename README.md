# LuxeAI — AI-Powered E-Commerce Platform
 
A full-stack e-commerce platform with an intelligent recommendation engine that personalizes the shopping experience in real time. Built with MERN stack, Python/FastAPI, and collaborative filtering.
 
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Stack](https://img.shields.io/badge/stack-MERN%20%2B%20Python-green)
 
## Overview
 
LuxeAI is a production-grade e-commerce platform inspired by fashion-forward retail brands. Users can browse a rich product catalog, filter by category, size, and price, manage a cart, and complete checkout — while an AI-powered recommendation engine learns from their browsing, searches, and purchases to surface personalized product suggestions in real time.
 
The platform is built as a microservices architecture. The AI recommendation system runs as a fully independent Python/FastAPI service that communicates with the main Node.js backend over HTTP.
 
## Features
 
**Shopping Experience**
- User registration and authentication (JWT-based)
- Product catalog with search, filtering, and sorting
- Product detail pages with images, sizing, and descriptions
- Shopping cart with real-time updates
- Checkout flow with order management
**AI Recommendation Engine**
- "You Might Also Like" — product recommendations based on purchase history
- Search-based suggestions — recommendations influenced by what users search for
- Collaborative filtering — surfaces what similar users bought or browsed
- Trending products — surfaces popular items across all users
**Technical**
- Microservices architecture — AI service is fully decoupled
- RESTful API design across all services
- Containerized with Docker and Docker Compose
- MongoDB for product, user, and order data
- Python ML model with scikit-learn and pandas
## Architecture
 
```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│                  React / Next.js (Vite)                 │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP
┌───────────────────────▼─────────────────────────────────┐
│                   Main Backend                          │
│               Node.js / Express                         │
│         Auth · Products · Cart · Orders                 │
└───────────┬──────────────────────────┬──────────────────┘
            │ MongoDB                  │ HTTP (internal)
┌───────────▼──────────┐  ┌───────────▼──────────────────┐
│       MongoDB        │  │        AI Service             │
│  Users · Products    │  │     Python / FastAPI          │
│  Orders · Sessions   │  │  Recommendation Engine        │
└──────────────────────┘  └──────────────────────────────┘
```
 
## Project Structure
 
```
luxeai/
├── client/                   # React/Next.js frontend (in progress)
│
├── server/                   # Node.js/Express main backend
│   ├── app.js                # Express entry point
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── controllers/          # Route handlers
│   ├── models/               # Mongoose schemas + custom HttpError
│   ├── routes/               # API route definitions
│   ├── middlewares/          # JWT auth + role guards
│   ├── schemas/              # Zod validation schemas
│   └── package.json
│
├── ai-service/               # Python FastAPI recommendation engine
├── docker-compose.yml        # Orchestrates backend, frontend, AI service and MongoDB
├── .env.example              # Optional compose-level variables (DOCKER_MONGODB_URI)
└── README.md
```
 
## Getting Started

**Prerequisites**
- [Docker](https://docs.docker.com/get-docker/) with Docker Compose (for Option A)
- Node.js v22+ (for Option B)
- [uv](https://docs.astral.sh/uv/) and Python 3.12+ (for Option B, AI service)

### 1. Create your env files

The real `.env` files are git-ignored, so each machine creates its own from the templates:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Then fill in the values you need in `server/.env` (`JWT_SECRET`, Stripe keys, ...). The defaults already point to a local MongoDB and the local services.

### 2. Database

By default the project uses a **local MongoDB** that runs in Docker (no Atlas account needed). It starts empty, so load the sample data (users, products and orders) once:

```bash
# With the whole stack running (Option A)
docker compose exec backend npm run seed

# Or without Docker for the backend (Option B)
docker compose up -d mongo
cd server && npm install && npm run seed
```

Sample logins: `admin@luxeai.com` or `alice@example.com`, password `Password123!`.
`npm run seed` wipes users, products, carts and orders first, and refuses to run against a `mongodb+srv` (Atlas) URI unless you pass `--force`.

To browse the data, open [MongoDB Compass](https://www.mongodb.com/products/tools/compass) and connect to `mongodb://localhost:27017` (database `luxeai`).

**Using your own database (e.g. Atlas) instead**
- Docker: create a `.env` in the project root with `DOCKER_MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/your_db` (see `.env.example`).
- Manual: set `MONGODB_URI` in `server/.env`.
- URL-encode special characters in the password (`@` -> `%40`). After changing a `.env`, recreate the container: `docker compose up -d --force-recreate backend`.

### Option A — Run with Docker (recommended)

```bash
docker compose up -d --build
```

| Service     | URL                   |
|-------------|-----------------------|
| Frontend    | http://localhost:5173 |
| Backend API | http://localhost:5001 |
| AI Service  | http://localhost:8000 |
| MongoDB     | localhost:27017       |

Inside Docker the backend reaches the AI service at `http://microservice:8000` and MongoDB at `mongo:27017`; compose sets both, so the `localhost` values in `server/.env` are only used for manual runs.

### Option B — Run services manually

Keep MongoDB in Docker (`docker compose up -d mongo`) or point `MONGODB_URI` to your own, then in three terminals:

```bash
# Backend (http://localhost:5001)
cd server && npm install && npm run dev

# Frontend (http://localhost:5173)
cd client && npm install && npm run dev

# AI service (http://localhost:8000)
cd ai-service && uv sync && uv run fastapi dev
```

### Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| `bad auth : authentication failed` | Wrong or outdated DB password in `.env`; update it and recreate the backend container. |
| Browser shows `ERR_CONNECTION_REFUSED` on `/api/products` | `VITE_API_URL` in `client/.env` doesn't match the backend (`http://localhost:5001`). Recreate the frontend container. |
| Compass shows an empty `localhost:27017` | The seed hasn't been run, or the backend is using another database (`DOCKER_MONGODB_URI` is set). |

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
 
**Admin — `/api/admin` (requires JWT + admin role)**
 
| Method | Endpoint     | Description     |
|--------|--------------|-----------------|
| GET    | `/stats`     | Dashboard stats |
| GET    | `/users`     | List all users  |
| PATCH  | `/users/:id` | Update a user   |
| DELETE | `/users/:id` | Delete a user   |
 
**AI Service — `localhost:8000` (planned)**
 
| Method | Endpoint                  | Description                              |
|--------|---------------------------|------------------------------------------|
| GET    | `/recommend/user/:userId` | Personalized recommendations for a user |
| GET    | `/recommend/product/:id`  | Similar products (item-based)            |
| POST   | `/recommend/search`       | Recommendations based on search query    |
| GET    | `/recommend/trending`     | Globally trending products               |
 
## How the Recommendation Engine Works
 
The AI service combines a few different techniques to generate useful recommendations:
 
1. **Collaborative Filtering** — identifies users with similar purchase and browsing patterns, then recommends what they bought
2. **Item-Based Similarity** — uses product metadata (category, tags, price range) to find related items
3. **Implicit Feedback** — treats searches, views, and cart additions as behavioral signals, not just completed purchases
4. **Trending Fallback** — for new users with no history, surfaces globally popular items
User interactions are sent from the Node.js backend to the AI service and logged as training data, allowing the model to improve over time.
 
## Roadmap
 
- [x] Project scaffolding and architecture design
- [x] User authentication (register/login/JWT)
- [x] Product catalog (CRUD, admin-protected writes)
- [x] Shopping cart with ownership validation and auth protection
- [x] Admin panel (dashboard stats, user management)
- [x] Zod request validation across all routes
- [ ] Order history and checkout flow
- [ ] Test suite (Jest + Supertest for backend, Vitest + RTL for frontend)
- [ ] Frontend (React/Next.js)
- [ ] Python recommendation service (item-based)
- [ ] Collaborative filtering model
- [ ] "You Might Also Like" UI component
- [ ] Docker Compose full orchestration
- [ ] Deployment (Render / Railway / AWS)
## Tech Stack
 
| Layer      | Technology                            |
|------------|---------------------------------------|
| Frontend   | React, Next.js, Tailwind CSS          |
| Backend    | Node.js, Express.js                   |
| Database   | MongoDB, Mongoose                     |
| Validation | Zod                                   |
| AI Service | Python, FastAPI, scikit-learn, pandas |
| Auth       | JWT, bcrypt                           |
| Testing    | Jest, Supertest, Vitest, React Testing Library |
| DevOps     | Docker, Docker Compose                |
| Deployment | Render / Railway (planned)            |
