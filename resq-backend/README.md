<a name="top"></a>
# 🛍️ Enterprise E-Commerce Backend

<div align="center">

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.0-6DB33F?style=for-the-badge&logo=spring-boot)
![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

A production-ready, enterprise-grade RESTful API for e-commerce operations.  
Built with modern Java technologies and industry best practices.

[Features](#-features) • [Architecture](#%EF%B8%8F-architecture) • [Quick Start](#-quick-start) • [API Reference](#-api-reference) • [Documentation](#-documentation)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📦 Product Management
- Paginated product listings
- Search by name (case-insensitive)
- Filter by price range
- Full CRUD operations

</td>
<td width="50%">

### 👤 User Management
- Secure user registration
- BCrypt password hashing
- Email validation
- Profile management

</td>
</tr>
<tr>
<td width="50%">

### 🛒 Order Processing
- Atomic transaction handling
- Automatic total calculation
- Order history by user
- Price snapshot at purchase time

</td>
<td width="50%">

### 🛡️ Security & Quality
- Spring Security integration
- Input validation (Bean Validation)
- Global exception handling
- Unit tested with JUnit 5 & Mockito

</td>
</tr>
</table>

---

## 🏗️ Architecture

This project follows a **Layered Architecture** pattern, ensuring separation of concerns, testability, and maintainability.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                   │
│                  (Postman / Browser / Mobile App)                │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP/JSON
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CONTROLLER LAYER                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│  │ProductController│ │ OrderController │ │ UserController  │    │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│         • REST endpoints  • Request validation  • DTO mapping   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                               │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│  │ ProductService  │ │  OrderService   │ │   UserService   │    │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│      • Business logic  • Transaction management  • Orchestration│
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REPOSITORY LAYER                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│  │ProductRepository│ │ OrderRepository │ │ UserRepository  │    │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│              • Spring Data JPA  • Custom queries                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                         │
│     ┌──────┐    ┌──────────┐    ┌────────┐    ┌─────────────┐   │
│     │users │    │ products │    │ orders │    │ order_items │   │
│     └──────┘    └──────────┘    └────────┘    └─────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Entity Relationship Diagram

```
┌───────────────┐           ┌───────────────┐
│     User      │           │    Product    │
├───────────────┤           ├───────────────┤
│ id (PK)       │           │ id (PK)       │
│ name          │           │ name          │
│ email         │           │ description   │
│ password      │           │ price         │
│ created_at    │           │ image_url     │
└───────┬───────┘           └───────┬───────┘
        │                           │
        │ 1                         │ 1
        │                           │
        ▼ N                         ▼ N
┌───────────────┐           ┌───────────────┐
│     Order     │ 1 ────▶ N │   OrderItem   │
├───────────────┤           ├───────────────┤
│ id (PK)       │           │ id (PK)       │
│ user_id (FK)  │           │ order_id (FK) │
│ order_date    │           │ product_id(FK)│
│ total_amount  │           │ quantity      │
│ status        │           │ price         │
└───────────────┘           └───────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Java 21 (LTS) | Modern language features, virtual threads ready |
| **Framework** | Spring Boot 3.4.0 | Application framework with auto-configuration |
| **Database** | PostgreSQL | Enterprise-grade relational database |
| **ORM** | Spring Data JPA | Simplified data access with Hibernate |
| **Security** | Spring Security | Authentication & password encryption |
| **Validation** | Jakarta Bean Validation | Input validation with annotations |
| **Documentation** | SpringDoc OpenAPI | Auto-generated Swagger UI |
| **Testing** | JUnit 5 + Mockito | Unit and integration testing |
| **Build** | Maven | Dependency management and build automation |

---

## 🚀 Quick Start

### Prerequisites

- Java 21+
- PostgreSQL 14+
- Maven 3.6+ (or use included Maven wrapper)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/e-commerce-backend.git
cd e-commerce-backend

# 2. Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE ecommerce_db;"

# 3. Configure database connection (if needed)
# Edit src/main/resources/application.properties

# 4. Run the application
./mvnw spring-boot:run
```

### Verify Installation

```bash
# Health check
curl http://localhost:8080/actuator/health

# Open Swagger UI
open http://localhost:8080/swagger-ui.html
```

---

## 📖 API Reference

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | Get all products (paginated) |
| `GET` | `/api/products/{id}` | Get product by ID |
| `POST` | `/api/products` | Create new product |
| `PUT` | `/api/products/{id}` | Update product |
| `DELETE` | `/api/products/{id}` | Delete product |
| `GET` | `/api/products/search?keyword=` | Search products by name |
| `GET` | `/api/products/filter?minPrice=&maxPrice=` | Filter by price range |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | Get all users |
| `GET` | `/api/users/{id}` | Get user by ID |
| `POST` | `/api/users` | Register new user |
| `PUT` | `/api/users/{id}` | Update user |
| `DELETE` | `/api/users/{id}` | Delete user |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/orders` | Get all orders |
| `GET` | `/api/orders/user/{userId}` | Get orders by user ID |
| `POST` | `/api/orders` | Create new order |

### Example Request

```bash
# Create a new product
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop",
    "price": 1299.99,
    "imageUrl": "https://example.com/laptop.jpg"
  }'
```

---

## 📚 Documentation

| Resource | URL |
|----------|-----|
| **Swagger UI** | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) |
| **OpenAPI Spec** | [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs) |
| **Actuator Health** | [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health) |

---

## 📁 Project Structure

```
src/main/java/com/example/e_commerce/
├── ECommerceApplication.java       # Application entry point
├── config/
│   └── SecurityConfig.java         # Security configuration
├── controller/
│   ├── ProductController.java      # Product REST endpoints
│   ├── OrderController.java        # Order REST endpoints
│   └── UserController.java         # User REST endpoints
├── service/
│   ├── ProductService.java         # Product business logic
│   ├── OrderService.java           # Order business logic
│   └── UserService.java            # User business logic
├── repository/
│   ├── ProductRepository.java      # Product data access
│   ├── OrderRepository.java        # Order data access
│   └── UserRepository.java         # User data access
├── model/
│   ├── Product.java                # Product entity
│   ├── User.java                   # User entity
│   ├── Order.java                  # Order entity
│   └── OrderItem.java              # OrderItem entity
├── dto/
│   ├── ProductRequest.java         # Product input DTO
│   ├── ProductResponse.java        # Product output DTO
│   ├── OrderRequest.java           # Order input DTO
│   ├── OrderResponse.java          # Order output DTO
│   ├── UserRequest.java            # User input DTO
│   └── UserResponse.java           # User output DTO
└── exception/
    ├── ResourceNotFoundException.java    # Custom 404 exception
    └── GlobalExceptionHandler.java       # Centralized error handling
```

---

## 🧪 Testing

```bash
# Run all tests
./mvnw test

# Run with coverage report
./mvnw test jacoco:report
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**[⬆ Back to Top](#top)**

</div>
