# LuxeAI — AI-Powered E-Commerce Platform

A full-stack e-commerce platform with an intelligent recommendation engine that personalizes the shopping experience in real time. Built with the MERN stack, Python/FastAPI, and collaborative filtering.

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
├── ai-service/               # Python FastAPI recommendation engine (planned)
├── docker-compose.yml        # Orchestrates all services (planned)
├── .env.example              # Environment variable template
└── README.md
```

## Getting Started

**Prerequisites**
- Node.js v18+
- Python 3.10+
- MongoDB (local or Atlas)
- Docker (recommended)

**Option A — Run with Docker (Recommended)**

```bash
git clone https://github.com/YOUR_USERNAME/luxeai.git
cd luxeai
cp .env.example .env
docker-compose up --build
```

| Service     | URL                   |
|-------------|-----------------------|
| Frontend    | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| AI Service  | http://localhost:8000 |

**Option B — Run Services Manually**

Backend:
```bash
cd server
npm install
npm run dev
```

AI Service:
```bash
cd ai-service
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:
```bash
cd client
npm install
npm run dev
```

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
| AI Service | Python, FastAPI, scikit-learn, pandas |
| Auth       | JWT, bcrypt                           |
| DevOps     | Docker, Docker Compose                |
| Deployment | Render / Railway (planned)            |

## License

This project is licensed under the [MIT License](LICENSE).

Built by [Celcio](https://github.com/YOUR_USERNAME)
