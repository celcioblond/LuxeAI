# 🛍️ LuxeAI — AI-Powered E-Commerce Platform

> A full-stack e-commerce platform with an intelligent recommendation engine that personalizes the shopping experience in real time — powered by MERN, Python/FastAPI, and collaborative filtering.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Stack](https://img.shields.io/badge/stack-MERN%20%2B%20Python-green)

---

## 📌 Overview

**LuxeAI** is a production-grade e-commerce platform inspired by fashion-forward retail experiences. Users can browse a rich product catalog, filter by category, size, and price, manage a cart, and complete checkout — all while an AI-powered recommendation engine learns from their browsing, searches, and purchases to surface personalized product suggestions in real time.

The platform is built as a **microservices architecture**, with the AI recommendation system running as a fully independent Python/FastAPI service that communicates with the main Node.js backend via REST.

---

## ✨ Features

### 🛒 Shopping Experience
- User registration and authentication (JWT-based)
- Product catalog with search, filtering, and sorting
- Product detail pages with images, sizing, and descriptions
- Shopping cart with real-time updates
- Checkout flow with order management

### 🤖 AI Recommendation Engine
- **"You Might Also Like"** — product recommendations based on purchase history
- **Search-based suggestions** — recommendations influenced by what users search for
- **Collaborative filtering** — surfaces what similar users bought or browsed
- **Trending products** — surfaces popular items across all users

### ⚙️ Technical
- Microservices architecture — AI service is fully decoupled
- RESTful API design across all services
- Containerized with Docker and Docker Compose
- MongoDB for product, user, and order data
- Python ML model with scikit-learn / pandas

---

## 🧱 Architecture

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

---

## 🗂️ Project Structure

```
luxeai/
├── client/                   # React/Next.js frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── context/          # Auth & Cart context
│   │   └── services/         # API call wrappers
│   └── package.json
│
├── server/                   # Node.js/Express main backend
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API routes
│   │   ├── middleware/        # Auth, error handling
│   │   └── services/         # Business logic, AI service calls
│   └── package.json
│
├── ai-service/               # Python FastAPI recommendation engine
│   ├── app/
│   │   ├── main.py           # FastAPI app entry point
│   │   ├── routes/           # Recommendation endpoints
│   │   ├── models/           # ML model logic
│   │   └── data/             # Data processing utilities
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml        # Orchestrates all services
├── .env.example              # Environment variable template
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Python](https://www.python.org/) 3.10+
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Docker](https://www.docker.com/) (recommended)

---

### Option A — Run with Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/luxeai.git
cd luxeai

# 2. Copy environment variables
cp .env.example .env

# 3. Start all services
docker-compose up --build
```

| Service      | URL                    |
|--------------|------------------------|
| Frontend     | http://localhost:3000  |
| Backend API  | http://localhost:5000  |
| AI Service   | http://localhost:8000  |

---

### Option B — Run Services Manually

**Backend (Node.js)**
```bash
cd server
npm install
npm run dev
```

**AI Service (Python)**
```bash
cd ai-service
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend (React)**
```bash
cd client
npm install
npm run dev
```

---

## 🔌 API Overview

### Main Backend — `localhost:5000`

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| POST   | `/api/auth/register`      | Register a new user                |
| POST   | `/api/auth/login`         | Login and receive JWT              |
| GET    | `/api/products`           | Get all products (with filters)    |
| GET    | `/api/products/:id`       | Get single product detail          |
| POST   | `/api/cart`               | Add item to cart                   |
| GET    | `/api/cart`               | Get current user's cart            |
| POST   | `/api/orders`             | Place an order / checkout          |
| GET    | `/api/orders/:userId`     | Get order history                  |

### AI Service — `localhost:8000`

| Method | Endpoint                  | Description                              |
|--------|---------------------------|------------------------------------------|
| GET    | `/recommend/user/:userId` | Personalized recommendations for a user |
| GET    | `/recommend/product/:id`  | Similar products (item-based)            |
| POST   | `/recommend/search`       | Recommendations based on search query    |
| GET    | `/recommend/trending`     | Globally trending products               |

---

## 🧠 How the Recommendation Engine Works

The AI service uses a combination of techniques to generate recommendations:

1. **Collaborative Filtering** — identifies users with similar purchase/browsing patterns and recommends what they bought
2. **Item-Based Similarity** — using product metadata (category, tags, price range) to find similar items
3. **Implicit Feedback** — treats searches, views, and cart additions as behavioral signals, not just purchases
4. **Trending Fallback** — for new users with no history, surfaces globally trending items

User interactions (searches, views, purchases) are sent from the Node backend to the AI service and logged as training data, allowing the model to improve over time.

---

## 🛣️ Roadmap

- [x] Project scaffolding and architecture design
- [ ] User authentication (register/login/JWT)
- [ ] Product catalog with filters and search
- [ ] Shopping cart and checkout flow
- [ ] Order history and user profile
- [ ] Python recommendation service (item-based)
- [ ] Collaborative filtering model
- [ ] "You Might Also Like" UI component
- [ ] Search-influenced recommendations
- [ ] Docker Compose full orchestration
- [ ] Deployment (Render / Railway / AWS)

---

## 🧰 Tech Stack

| Layer          | Technology                              |
|----------------|-----------------------------------------|
| Frontend       | React, Next.js, Tailwind CSS            |
| Backend        | Node.js, Express.js                     |
| Database       | MongoDB, Mongoose                       |
| AI Service     | Python, FastAPI, scikit-learn, pandas   |
| Auth           | JWT, bcrypt                             |
| DevOps         | Docker, Docker Compose                  |
| Deployment     | Render / Railway (planned)              |

---

## 🤝 Contributing

This is a portfolio project and is not open to external contributions at this time. Feel free to fork it and build your own version.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">Built by <a href="https://github.com/YOUR_USERNAME">Celcio</a> · Powered by curiosity and too much coffee ☕</p>
