# 📚 E-Commerce Backend - Complete Interview Guide

> **Built with**: Spring Boot 3.4.0 | Java 21 | PostgreSQL | Spring Security | Swagger

---

## 🏗️ Architecture Overview

This project follows **Layered Architecture** (3-Tier Architecture):

```
┌──────────────────────────────────────────────────────────────┐
│                    CLIENT (Postman/Browser)                   │
│                    Sends HTTP requests (JSON)                 │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                     CONTROLLER LAYER                          │
│   ProductController, OrderController, UserController          │
│   • Receives HTTP requests                                    │
│   • Validates input (@Valid)                                  │
│   • Delegates to Service layer                                │
│   • Returns HTTP response with proper status code             │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                            │
│      ProductService, OrderService, UserService                │
│   • Contains BUSINESS LOGIC                                   │
│   • Transaction management (@Transactional)                   │
│   • Orchestrates repository calls                             │
│   • Converts Entity ↔ DTO                                     │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    REPOSITORY LAYER                           │
│  ProductRepository, OrderRepository, UserRepository           │
│   • Data Access Layer (DAO pattern)                           │
│   • Spring Data JPA auto-generates SQL                        │
│   • Custom query methods (e.g., findByUserId)                 │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                      │
│   Tables: users, products, orders, order_items                │
└──────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
src/main/java/com/example/e_commerce/
├── ECommerceApplication.java    # Main entry point
├── config/
│   └── SecurityConfig.java      # Security & BCrypt configuration
├── controller/
│   ├── ProductController.java   # REST endpoints for products
│   ├── OrderController.java     # REST endpoints for orders
│   └── UserController.java      # REST endpoints for users
├── service/
│   ├── ProductService.java      # Business logic for products
│   ├── OrderService.java        # Business logic for orders
│   └── UserService.java         # Business logic for users
├── repository/
│   ├── ProductRepository.java   # JPA Repository for products
│   ├── OrderRepository.java     # JPA Repository for orders
│   └── UserRepository.java      # JPA Repository for users
├── model/
│   ├── Product.java             # JPA Entity
│   ├── User.java                # JPA Entity
│   ├── Order.java               # JPA Entity
│   └── OrderItem.java           # JPA Entity
├── dto/
│   ├── ProductRequest.java      # Input DTO
│   ├── ProductResponse.java     # Output DTO
│   ├── OrderRequest.java        # Input DTO
│   ├── OrderResponse.java       # Output DTO
│   ├── UserRequest.java         # Input DTO
│   └── UserResponse.java        # Output DTO
└── exception/
    ├── ResourceNotFoundException.java   # Custom exception
    └── GlobalExceptionHandler.java      # @ControllerAdvice
```

---

## 🔄 Complete Request Flow: Creating an Order

### Step 1: HTTP Request Arrives
```json
POST /api/orders
{
  "userId": 1,
  "items": [
    { "productId": 5, "quantity": 2 }
  ]
}
```

### Step 2: Controller Receives Request
```java
// OrderController.java
@PostMapping
public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest orderRequest) {
    return new ResponseEntity<>(orderService.createOrder(orderRequest), HttpStatus.CREATED);
}
```
- `@Valid` triggers Bean Validation on `OrderRequest`
- If invalid, `GlobalExceptionHandler` returns 400 Bad Request

### Step 3: Service Processes Business Logic
```java
// OrderService.java
@Transactional  // ← Ensures atomicity!
public OrderResponse createOrder(OrderRequest orderRequest) {
    // 1. Find the user
    User user = userRepository.findById(orderRequest.getUserId())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    
    // 2. Create order
    Order order = new Order();
    order.setUser(user);
    order.setOrderDate(LocalDateTime.now());
    order.setStatus("PENDING");
    
    // 3. Process each item
    BigDecimal totalAmount = BigDecimal.ZERO;
    for (OrderItemRequest itemRequest : orderRequest.getItems()) {
        Product product = productRepository.findById(itemRequest.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        OrderItem orderItem = new OrderItem();
        orderItem.setProduct(product);
        orderItem.setQuantity(itemRequest.getQuantity());
        orderItem.setPrice(product.getPrice());  // ← SNAPSHOT price at purchase time!
        
        order.addOrderItem(orderItem);  // ← Uses cascade
        totalAmount = totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(quantity)));
    }
    
    order.setTotalAmount(totalAmount);
    
    // 4. Save (cascades to OrderItems)
    Order savedOrder = orderRepository.save(order);
    
    // 5. Convert to DTO and return
    return mapToResponse(savedOrder);
}
```

### Step 4: Repository Saves to Database
Spring Data JPA auto-generates the SQL:
```sql
INSERT INTO orders (user_id, order_date, total_amount, status) VALUES (1, NOW(), 2000.00, 'PENDING');
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (123, 5, 2, 1000.00);
```

### Step 5: Response Returned
```json
HTTP 201 Created
{
  "id": 123,
  "userId": 1,
  "orderDate": "2026-01-03T10:30:00",
  "totalAmount": 2000.00,
  "status": "PENDING",
  "items": [
    { "productId": 5, "productName": "Laptop", "quantity": 2, "price": 1000.00 }
  ]
}
```

---

## 📊 Database Schema (Entity Relationships)

```
┌───────────────┐       ┌───────────────┐
│    users      │       │   products    │
├───────────────┤       ├───────────────┤
│ id (PK)       │       │ id (PK)       │
│ name          │       │ name          │
│ email         │       │ description   │
│ password      │       │ price         │
│ created_at    │       │ image_url     │
└───────┬───────┘       └───────┬───────┘
        │                       │
        │ 1:N                   │ N:1
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│    orders     │       │  order_items  │
├───────────────┤       ├───────────────┤
│ id (PK)       │◄──────│ id (PK)       │
│ user_id (FK)  │  1:N  │ order_id (FK) │
│ order_date    │       │ product_id(FK)│
│ total_amount  │       │ quantity      │
│ status        │       │ price         │
└───────────────┘       └───────────────┘
```

### JPA Relationship Annotations
```java
// Order.java
@ManyToOne
@JoinColumn(name = "user_id")
private User user;  // Many orders belong to one user

@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
private List<OrderItem> orderItems;  // One order has many items
```

---

## 🔑 Key Concepts Explained

### 1. Why DTOs (Data Transfer Objects)?

```
Entity (Order.java)        DTO (OrderResponse.java)
├── id                     ├── id
├── user (entire object)   ├── userId (just the ID!)
├── orderItems             ├── items (simplified)
├── ...internal fields     └── ...only what API needs
```

**Benefits:**
- **Security**: Don't expose password, internal IDs
- **Flexibility**: API contract separate from DB schema
- **Performance**: Transfer only needed data

---

### 2. Why @Transactional?

```java
@Transactional
public OrderResponse createOrder(OrderRequest request) {
    // If ANY of these fail, EVERYTHING rolls back
    User user = userRepository.findById(...);      // Query 1
    Order order = orderRepository.save(...);       // Query 2
    // ... create order items                      // Query 3, 4, ...
}
```

**If Product lookup fails midway, the partially created Order is automatically rolled back!**

---

### 3. Why Constructor Injection?

```java
// ✅ Your code (Good)
private final ProductService productService;

public ProductController(ProductService productService) {
    this.productService = productService;
}

// ❌ Alternative (Bad)
@Autowired
private ProductService productService;
```

**Benefits:**
- `final` makes it immutable
- Explicit dependencies (visible in constructor)
- Easier to test (just pass mock in constructor)
- Spring auto-detects single constructor (no @Autowired needed!)

---

### 4. Pagination (Products)

```java
// ProductController.java
@GetMapping
public ResponseEntity<Page<ProductResponse>> getAllProducts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
    Pageable pageable = PageRequest.of(page, size);
    return ResponseEntity.ok(productService.getAllProducts(pageable));
}
```

**Usage**: `GET /api/products?page=0&size=10`

**Benefits:**
- Prevents returning millions of records
- Client controls page size
- Built-in metadata: total pages, total elements, etc.

---

### 5. Global Exception Handling

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFoundException(ResourceNotFoundException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(...) {
        // Returns field-level validation errors
    }
}
```

**Result**: Clean error responses instead of ugly stack traces!

---

### 6. Password Security (BCrypt)

```java
// SecurityConfig.java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

// UserService.java
user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
```

**Stored in DB**: `$2a$10$N9qo8uLOickgx2ZMRZoMy...` (hashed, not plain text!)

---

## 🧪 Testing

### Unit Test Example
```java
@Test
void createOrder_ShouldCalculateTotalCorrectly() {
    // Arrange - Setup mocks
    when(userRepository.findById(1L)).thenReturn(Optional.of(user));
    when(productRepository.findById(100L)).thenReturn(Optional.of(product));
    when(orderRepository.save(any())).thenAnswer(inv -> {
        Order o = inv.getArgument(0);
        o.setId(123L);
        return o;
    });
    
    // Act - Call the method
    OrderResponse response = orderService.createOrder(request);
    
    // Assert - Verify results
    assertEquals(new BigDecimal("2000.00"), response.getTotalAmount());
}
```

---

## 🎯 Expected Interview Questions

### Q1: "Why use DTOs instead of returning entities directly?"
**Answer**: DTOs decouple internal model from API contract, control what data is exposed (security), and allow API versioning without changing entities.

### Q2: "Explain the Order creation flow"
**Answer**: Controller receives request → validates input → Service looks up User and Products → creates Order with OrderItems, calculates total → saves atomically with @Transactional → returns DTO response.

### Q3: "Why constructor injection over field injection?"
**Answer**: Makes dependencies explicit, enables immutability (final fields), easier to test (no reflection needed), Spring auto-detects single constructor.

### Q4: "How would you scale this for millions of users?"
**Answer**:
- Database indexing on frequently queried columns
- Connection pooling (HikariCP - already included)
- Caching with Redis
- Read replicas for read-heavy operations
- Horizontal scaling with load balancer

### Q5: "What happens if the database fails during order creation?"
**Answer**: The @Transactional annotation ensures the entire operation rolls back - no partial data is saved.

---

## 📱 API Endpoints Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get products (paginated) |
| GET | `/api/products/{id}` | Get product by ID |
| POST | `/api/products` | Create product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |
| GET | `/api/products/search?keyword=` | Search by name |
| GET | `/api/products/filter?minPrice=&maxPrice=` | Filter by price |
| GET | `/api/users` | Get all users |
| GET | `/api/users/{id}` | Get user by ID |
| POST | `/api/users` | Create user |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/user/{userId}` | Get orders by user |
| POST | `/api/orders` | Create order |

---

## 🚀 Running the Application

```bash
# Start PostgreSQL and create database
CREATE DATABASE ecommerce_db;

# Run the application
./mvnw spring-boot:run

# Access Swagger UI
http://localhost:8080/swagger-ui.html
```

---

**Good luck with your Rakuten interview!** 🎉
