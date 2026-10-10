<div align="center">

# 💸 SettleUp

### Split smarter. Settle simpler.

**Shared expenses shouldn't lead to complicated calculations.**

Track group expenses, understand everyone's balance, and generate a simpler repayment plan — all in one place.

<br/>

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_SetttleUp-16a34a?style=for-the-badge)](https://settle-up-henna-seven.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Source_Code-181717?style=for-the-badge&logo=github)](https://github.com/Anubhutisharma-07/SettleUp)

<br/>

**Built with Java · Spring Boot · Spring JDBC · PostgreSQL · React**

</div>

---

## ✨ The problem

Imagine a weekend trip with friends.

One person books the stay. Another pays for dinner. Someone else covers the cab. By the end, everyone is asking the same question:

> **Who owes whom, and how can we settle everything with fewer payments?**

That is the problem **SettleUp** is designed to solve.

Instead of just recording expenses, SettleUp calculates each member's net balance and suggests a simplified way to settle up.

## 🚀 What can SettleUp do?

| Feature | What it means |
|---|---|
| 👥 **Group expense tracking** | Keep shared expenses organized by group. |
| 🧾 **Expense splitting** | Record who paid and how an expense is split. |
| ⚖️ **Balance calculation** | Understand who should pay and who should receive money. |
| 🔄 **Settlement suggestions** | Use a greedy algorithm to simplify the set of suggested repayments. |
| 🔐 **Authentication** | Protect accounts and API access using Spring Security and JWT. |
| 🖥️ **Web interface** | Manage expenses through a React frontend. |

> Feature availability may depend on the current deployment configuration.

## 🧠 The interesting part: settlement logic

A group can have many individual expenses, but those expenses can often be consolidated into a smaller set of repayments.

SettleUp calculates each member's **net balance**:

- **Positive balance** → the member should receive money.
- **Negative balance** → the member owes money.
- **Zero balance** → the member is settled.

The settlement logic then matches members who owe money with members who should receive money, producing a practical repayment plan.

### A simple example

Suppose a group has these net balances:

| Member | Net balance |
|---|---:|
| A | +₹600 |
| B | +₹200 |
| C | −₹500 |
| D | −₹300 |

One possible settlement plan is:

1. C pays A ₹500.
2. D pays A ₹100.
3. D pays B ₹200.

The result is a clear set of repayments that settles every net balance.

**Algorithm note:** SettleUp uses a greedy approach. It can reduce the number of repayments, but it does **not** guarantee the globally minimum number of transactions for every possible balance configuration. The plan is a calculated suggestion, not proof that a real payment has happened.

## 🛠️ Built with

<div align="center">

| Backend | Data & security | Frontend & delivery |
|---|---|---|
| ![Java](https://img.shields.io/badge/Java_21-ED8B00?style=flat&logo=openjdk&logoColor=white) | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white) | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) |
| ![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat&logo=springboot&logoColor=white) | ![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=flat&logo=springsecurity&logoColor=white) | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) |
| ![Spring JDBC](https://img.shields.io/badge/Spring_JDBC-6DB33F?style=flat&logo=spring&logoColor=white) | ![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white) | ![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=flat&logo=jenkins&logoColor=white) |
| ![Maven](https://img.shields.io/badge/Maven-C71A36?style=flat&logo=apachemaven&logoColor=white) | | |

</div>

**Why Spring JDBC?** This project uses explicit SQL and Spring JDBC for database access rather than Spring Data JPA/Hibernate. That keeps the data-access layer visible and makes query behaviour easier to reason about.

## 🏗️ How it fits together

```text
┌──────────────────────────┐
│      React Frontend      │
└────────────┬─────────────┘
             │ HTTP / REST
             ▼
┌──────────────────────────┐
│     Spring Boot API      │
│                          │
│  Controllers             │
│  Services / business     │
│  JDBC data access        │
│  Spring Security + JWT   │
└────────────┬─────────────┘
             │ SQL
             ▼
┌──────────────────────────┐
│       PostgreSQL         │
└──────────────────────────┘
```

The application separates the frontend, API layer, business logic, data access, and persistence responsibilities.

## 🧑‍💻 Run it locally

Want to explore the code or run SettleUp on your machine? Follow these steps.

### Prerequisites

- Java 21
- Maven, or the Maven Wrapper if included
- Node.js and npm
- PostgreSQL, or Docker with Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/Anubhutisharma-07/SettleUp.git
cd SettleUp
```

### 2. Configure the environment

Create a local, git-ignored `.env` file or use the configuration method expected by your checkout.

You'll need values for:

- PostgreSQL connection URL
- Database username and password
- JWT signing secret
- Frontend API base URL, if configured separately

Check the backend configuration and `docker-compose.yml` for the **exact environment variable names**. Apply any schema or SQL initialization scripts included in the repository.

> 🔒 Never commit `.env`, database credentials, JWT secrets, or other private configuration.

### 3. Start the backend

The backend directory in the repository is `settleup`:

```bash
cd settleup
mvn spring-boot:run
```

If the repository includes a Maven Wrapper, you can use it instead of a globally installed Maven version.

### 4. Start the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm start
```

Follow the terminal output for the local frontend URL. Ensure the frontend's API configuration points to your running backend.

### 🐳 Run with Docker Compose

From the repository root, after configuring the required environment variables:

```bash
docker compose up --build
```

Run in the background:

```bash
docker compose up --build -d
```

Stop the services:

```bash
docker compose down
```

Check `docker-compose.yml` for the exact ports, services, volumes, and configuration used by your checkout.

## 🧪 Testing

Run the backend tests from the backend directory:

```bash
mvn test
```

Important areas to test include:

- Authentication and authorization
- Expense creation and split validation
- Net balance calculations
- Settlement suggestions for positive, negative, and zero balances
- Empty groups and already-settled balances
- Access control for group-specific operations

If a Postman collection is included in the repository, use it to explore the API endpoints.

## ⚙️ CI and deployment

The repository includes Docker Compose configuration and a Jenkins pipeline definition. Refer to the root `Jenkinsfile` and `docker-compose.yml` for the current build and deployment workflow.

Keep CI credentials in Jenkins credentials or an appropriate secret manager; do not hard-code them in source files.

## 🗺️ What's next?

Potential improvements include:

- More automated tests for settlement edge cases
- Better observability and production error reporting
- More robust deployment and CI checks
- Clearer payment confirmation and activity history
- Further accessibility and responsive-design refinements

## 🤝 Feedback and contributions

Found something to improve? Have an idea for making shared expenses easier?

Feedback, bug reports, and focused contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your change and add or update tests.
4. Run relevant tests.
5. Open a pull request explaining the change.

Please avoid committing secrets, generated build files, or unrelated changes.

## 👩‍💻 About the developer

**Anubhuti Sharma**  
Java · Spring Boot · Backend Development

- [GitHub](https://github.com/Anubhutisharma-07)
- [LinkedIn](https://www.linkedin.com/in/anubhuti-sharma-93571931a/)

---

<div align="center">

### 💚 Give SettleUp a try

If you explore the app, I'd love to hear what you think.

**[Open the live application →](https://settle-up-henna-seven.vercel.app/)**

*Split smarter. Settle simpler.*

</div>
