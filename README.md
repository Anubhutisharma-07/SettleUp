<div align="center">

# 💸 SettleUp

### Split expenses. Settle up in the fewest payments possible.

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)](https://www.jenkins.io/)

*A full-stack expense-splitting app that doesn't just tell you who owes what — it works out the*
***smallest possible set of payments*** *to settle the whole group.*

</div>

---

## 🤔 Why this exists

Every splitting app tells you "Alice owes Bob ₹500, Bob owes Charlie ₹300, Charlie owes Alice ₹200."

SettleUp looks at that mess and says: **"Alice pays Charlie ₹300. Done."** One transaction instead of three.

That's a greedy graph-optimization algorithm, built from scratch — not pulled from a library — sitting on top of a hand-rolled Spring Boot backend with raw SQL (no ORM), JWT auth, a React frontend, and a full Docker + Jenkins pipeline behind it.

---

## ✨ Features

| | |
|---|---|
| 🔐 **Auth** | JWT-based sessions, BCrypt password hashing |
| 👥 **Groups** | Create groups, invite members, admin-only controls |
| 🧾 **Expenses** | Add expenses, auto-split equally among current members |
| 📊 **Balances** | Live net balance per person, color-coded owed/owes |
| ⚡ **Settlement engine** | The star of the show — minimum-transaction payout plan |
| 🌗 **Dark / light mode** | Because everyone has a preference |

---

## 🧠 The Algorithm (the whole point of this project)

**The problem:** given a group's net balances — some people owed money, some owing it — what's the *smallest* set of payments that zeroes everyone out?

**The approach:**
```
1. Split members into debtors (owe money) and creditors (owed money)
2. Match the current debtor with the current creditor
3. Settle the SMALLER of what's owed vs what's due between them
4. Whoever hits ₹0 first moves to the next person in their list
5. Repeat until both lists are empty
```

Runs in **O(n log n)**, produces at most `n - 1` transactions for `n` people — a real reduction over the naive "everyone pays everyone" approach.

> **Honest caveat:** the true minimum-transaction problem is NP-hard in general. This greedy approach doesn't *guarantee* the mathematical optimum in every edge case — but it gets extremely close, runs fast, and is the same practical tradeoff real apps like Splitwise make.

It's implemented as a **pure function** — `settleBalances(List<UserBalance>)` — with zero database dependency, so it's fully unit-tested in isolation. See [`SettlementServiceTest.java`](./settleup/src/test/java/com/settleup/service/SettlementServiceTest.java) for coverage of edge cases: already-settled groups, multiple debtors/creditors, uneven splits, empty input.

---

## 🏗️ Architecture

```
┌──────────────┐   HTTP + JWT    ┌───────────────────┐   Raw SQL / JDBC   ┌────────────┐
│              │ ──────────────▶ │                    │ ─────────────────▶ │            │
│  React SPA   │                 │  Spring Boot API   │                     │ PostgreSQL │
│              │ ◀────────────── │                    │ ◀───────────────── │            │
└──────────────┘   JSON response └───────────────────┘   ResultSet → POJO  └────────────┘
```

- **No ORM** — every query, including multi-table joins for balance calculation, is hand-written SQL via Spring JDBC. A deliberate choice to show direct SQL fluency.
- **Stateless JWT auth** — token issued on login/signup, validated on every request by a custom `JwtAuthFilter`, no server-side session state.
- **Authorization at the service layer** — e.g. only group admins can add members; only members can add expenses to their own group.

---

## 🗄️ Database Schema

```
users            expense_groups        group_members         expenses            expense_splits
─────            ──────────────        ─────────────         ────────            ──────────────
id               id                    group_id (FK)          id                  id
name             name                  user_id  (FK)          group_id (FK)       expense_id (FK)
email            created_by (FK)       role                   paid_by  (FK)       user_id (FK)
password         created_at            joined_at              amount              amount_owed
created_at                                                    description
                                                                expense_date
```

---

## 📡 API Reference

| Method | Endpoint | What it does |
|---|---|---|
| `POST` | `/api/auth/signup` | Create account → returns JWT |
| `POST` | `/api/auth/login` | Authenticate → returns JWT |
| `GET` | `/api/groups` | List your groups |
| `POST` | `/api/groups` | Create a group |
| `POST` | `/api/groups/{id}/members` | Add a member *(admin only)* |
| `GET` | `/api/groups/{id}/expenses` | List a group's expenses |
| `POST` | `/api/groups/{id}/expenses` | Add an expense (auto equal-split) |
| `GET` | `/api/groups/{id}/balances` | Net balance per member |
| `GET` | `/api/groups/{id}/settlements` | ⭐ The optimized settlement plan |

---

## 🚀 Getting Started

### The fast way — Docker Compose

```bash
docker compose up --build
```

That's it. This spins up a fresh PostgreSQL container, auto-applies the schema, builds the backend, and starts the API on `localhost:8080`. Zero manual setup.

### The manual way

**Backend**
```bash
cd settleup
./mvnw spring-boot:run
```
Needs a local Postgres instance — configure via `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` env vars, or use the defaults in `application.properties`.

**Frontend**
```bash
cd frontend
npm install
npm start
```
Runs on `localhost:3000`.

### Run the tests
```bash
cd settleup
./mvnw test
```

---

## 🔁 CI/CD

A Jenkins declarative pipeline (`Jenkinsfile`) runs on every push: checks out the repo, builds with Maven, runs the full JUnit suite — including the settlement algorithm tests — and packages the app.

---

## 📁 Project Structure

```
settleup/
├── settleup/                 🌱 Spring Boot backend
│   ├── src/main/java/com/settleup/
│   │   ├── controller/         REST endpoints
│   │   ├── service/             Business logic (⭐ SettlementService lives here)
│   │   ├── repository/         Hand-written SQL via Spring JDBC
│   │   ├── entity/               Domain models
│   │   ├── security/             JWT filter & utils
│   │   └── dto/                   Request/response shapes
│   ├── src/test/                 JUnit tests
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                  ⚛️ React app
│   └── src/
│       ├── pages/                 Login, Dashboard, GroupDetail
│       └── components/
├── docker-compose.yml          🐳 Backend + Postgres orchestration
├── Jenkinsfile                  🔁 CI pipeline
└── README.md
```

---

## 🔮 What's Next

- [ ] Input validation + consistent HTTP error responses
- [ ] Custom (non-equal) split amounts
- [ ] Frontend containerized and added to `docker-compose.yml`
- [ ] Broader test coverage beyond the settlement engine

---

<div align="center">

**Built by Anubhuti Sharma** — a portfolio project covering backend engineering (custom SQL, auth, algorithm design), full-stack integration, and DevOps (Docker, CI/CD).

⭐ If this helped you understand debt-settlement algorithms, consider starring the repo!

</div>
