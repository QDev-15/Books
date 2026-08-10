# Lộ Trình Java Spring Boot — Cơ Bản Đến Nâng Cao

## Tầng 1 — Nền Tảng Java

Trước khi học Spring Boot, cần vững các kiến thức Java core sau:

- **OOP**: Class, Interface, kế thừa, polymorphism, encapsulation
- **Collections**: List, Map, Set, Queue — biết dùng đúng cấu trúc dữ liệu
- **Generics & Lambda**: Functional interfaces, Stream API, method references
- **Build tool**: Maven hoặc Gradle — quản lý dependency, build project

> Thời gian ước tính: 1–2 tuần nếu chưa biết Java

---

## Tầng 2 — Spring Boot Core

### IoC & Dependency Injection
- Container quản lý bean lifecycle
- Annotations: `@Component`, `@Service`, `@Repository`, `@Bean`
- Luôn dùng **constructor injection**, không dùng field injection (`@Autowired` trên field)

```java
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository; // constructor injection
}
```

### REST API với Spring MVC
- `@RestController`, `@RequestMapping`, `@GetMapping`, `@PostMapping`
- Trả về `ResponseEntity` với đúng HTTP status code
- Đặt `URI location` trong header khi tạo resource mới (`201 Created`)

```java
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Validated
public class ProductController {

    private final ProductService productService;

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ProductDto> create(@Valid @RequestBody CreateProductRequest request) {
        ProductDto created = productService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }
}
```

### DTO Pattern
- Dùng Java records cho DTO — gọn, immutable, tự sinh equals/hashCode
- Tách biệt hoàn toàn `@Entity` và Response DTO

```java
public record CreateProductRequest(
    @NotBlank @Size(min = 2, max = 200) String name,
    @NotNull @Positive BigDecimal price
) {}

public record ProductDto(Long id, String name, BigDecimal price) {}
```

### Spring Data JPA
- Dùng `JpaRepository` — có sẵn CRUD + Pagination
- `@Transactional(readOnly = true)` cho query — tăng hiệu năng
- Luôn dùng `Optional`, không return `null`
- **Tránh `@Data` trên `@Entity`** — gây lỗi equals/hashCode với JPA; dùng `@Getter @Setter @NoArgsConstructor`
- Dùng `BigDecimal` cho tiền, không dùng `double`/`float`

```java
@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public ProductDto getById(Long id) {
        return productRepository.findById(id)
            .map(p -> new ProductDto(p.getId(), p.getName(), p.getPrice()))
            .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }
}
```

### Validation
- Annotate DTO với Bean Validation: `@NotBlank`, `@NotNull`, `@Size`, `@Positive`, `@Email`
- Đặt `@Valid` trên `@RequestBody` trong controller
- Thêm `@Validated` trên class controller

### Exception Handling
- Dùng `@RestControllerAdvice` để xử lý lỗi tập trung
- Không để exception lan ra tầng controller thô

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse("VALIDATION_ERROR", errors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("INTERNAL_ERROR", "Internal server error"));
    }
}

public record ErrorResponse(String code, String message) {}
```

### Cấu hình (application.yml)
- Dùng `.yml` thay `.properties` — dễ đọc, hỗ trợ nested config
- Tổ chức theo profiles: `dev`, `staging`, `prod`
- **Không hardcode secret** — dùng biến môi trường `${ENV_VAR}`

> Thời gian ước tính: 2–4 tuần

---

## Tầng 3 — Trung Cấp

### Spring Security 6 + JWT

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

- Tạo `JwtAuthFilter` extends `OncePerRequestFilter`
- Lưu token trong `SecurityContextHolder`
- Xử lý refresh token riêng endpoint

### Caching với Redis

```yaml
# application.yml
spring:
  data:
    redis:
      host: localhost
      port: 6379
  cache:
    type: redis
```

```java
@Configuration
@EnableCaching
public class CacheConfig {}

// Trong service:
@Cacheable(value = "products", key = "#id")
public ProductDto getById(Long id) { ... }

@CacheEvict(value = "products", key = "#id")
public void delete(Long id) { ... }
```

### Testing

```java
// Unit test
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    @Mock ProductRepository productRepository;
    @InjectMocks ProductServiceImpl productService;

    @Test
    void getById_WhenExists_ReturnsDto() {
        // given
        var product = new Product(1L, "Phone", new BigDecimal("999"));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        // when
        var result = productService.getById(1L);

        // then
        assertThat(result.name()).isEqualTo("Phone");
    }
}

// Integration test
@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerIntegrationTest {
    @Autowired MockMvc mockMvc;

    @Test
    void getProduct_Returns200() throws Exception {
        mockMvc.perform(get("/api/products/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").exists());
    }
}
```

### Docker & Docker Compose

```dockerfile
# Dockerfile (multi-stage build)
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/mydb
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: mydb
      POSTGRES_PASSWORD: secret
  redis:
    image: redis:7-alpine
```

### Database Migration với Flyway

```
src/main/resources/db/migration/
├── V1__create_products_table.sql
├── V2__add_category_column.sql
└── V3__create_users_table.sql
```

- File đặt tên theo convention `V{version}__{description}.sql`
- Không sửa file migration đã commit — tạo file mới để alter

### Monitoring
- `spring-boot-actuator`: expose `/actuator/health`, `/actuator/metrics`
- Kết hợp Micrometer + Prometheus + Grafana cho production

### Logging
- Dùng SLF4J + Logback (mặc định của Spring Boot)
- **Không dùng `System.out.println`** — luôn dùng `log.info()`, `log.warn()`, `log.error()`
- Structured logging: `log.info("User {} created order {}", userId, orderId)`

> Thời gian ước tính: 1–2 tháng

---

## Tầng 4 — Nâng Cao & Production

### Microservices với Spring Cloud
- **Service Discovery**: Eureka Server + Client
- **API Gateway**: Spring Cloud Gateway — routing, rate limiting, auth filter
- **Feign Client**: giao tiếp HTTP giữa các service
- **Circuit Breaker**: Resilience4j — tránh cascade failure

```java
@FeignClient(name = "order-service")
public interface OrderServiceClient {
    @GetMapping("/api/orders/{userId}")
    List<OrderDto> getOrdersByUser(@PathVariable Long userId);
}
```

### Message Queue
- **Kafka**: event streaming, high-throughput, event sourcing
- **RabbitMQ**: task queue, simpler setup, dead letter queue

```java
// Kafka Producer
@Service
@RequiredArgsConstructor
public class OrderEventPublisher {
    private final KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;

    public void publish(OrderCreatedEvent event) {
        kafkaTemplate.send("orders.created", event);
    }
}

// Kafka Consumer
@KafkaListener(topics = "orders.created", groupId = "notification-service")
public void handleOrderCreated(OrderCreatedEvent event) {
    notificationService.sendEmail(event.getUserEmail(), ...);
}
```

### Reactive Programming (WebFlux)
- Dùng khi cần xử lý nhiều concurrent request với ít thread
- `Mono<T>` — 0 hoặc 1 item; `Flux<T>` — 0..N items
- **Không block trong reactive pipeline** — không gọi `.block()` trong service

```java
@RestController
@RequestMapping("/api/products")
public class ReactiveProductController {

    @GetMapping
    public Flux<ProductDto> getAll() {
        return productService.findAll();
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<ProductDto>> getById(@PathVariable Long id) {
        return productService.findById(id)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}
```

### Clean Architecture / Hexagonal
```
src/main/java/com/example/
├── domain/              # Business logic thuần, không phụ thuộc framework
│   ├── model/           # Domain entities
│   ├── service/         # Use cases
│   └── port/            # Interfaces (in/out)
├── infrastructure/      # Adapter: JPA, REST client, Kafka
│   ├── persistence/
│   └── messaging/
└── web/                 # Adapter: Controllers, DTOs
```

### CI/CD với GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      - run: ./mvnw verify
      - run: docker build -t myapp:${{ github.sha }} .
```

### Kubernetes Basics

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spring-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: spring-app
  template:
    spec:
      containers:
        - name: spring-app
          image: myapp:latest
          ports:
            - containerPort: 8080
          env:
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: password
```

> Thời gian: liên tục học theo dự án thực tế

---

## Cấu Trúc Project Chuẩn

```
src/main/java/com/example/app/
├── controller/          # @RestController — nhận request, trả response
├── service/             # Interface + Impl — business logic
├── repository/          # Spring Data JPA interfaces
├── domain/              # @Entity classes
├── dto/                 # Request/Response records
├── exception/           # Custom exceptions + GlobalExceptionHandler
├── config/              # Security, Cache, Swagger config
└── Application.java     # Entry point
```

---

## Checklist Production-Ready

- [ ] Input validation với Bean Validation (`@Valid`)
- [ ] HTTP status code đúng (200/201/400/404/500)
- [ ] Xử lý exception tập trung (`@RestControllerAdvice`)
- [ ] Structured logging (SLF4J, không `System.out`)
- [ ] Không hardcode secret — dùng biến môi trường
- [ ] Constructor injection (không field injection)
- [ ] `@Transactional(readOnly = true)` cho query
- [ ] Unit test + Integration test đủ coverage
- [ ] Dockerfile multi-stage build
- [ ] Health check endpoint (`/actuator/health`)

---

## Gợi Ý Project Theo Tầng

| Tầng | Project gợi ý |
|------|---------------|
| Core | REST API quản lý sản phẩm: CRUD + Pagination + Search |
| Trung cấp | E-commerce API: JWT auth + Redis cache + Docker Compose |
| Nâng cao | Hệ thống đặt hàng: 3 microservices + Kafka + Kubernetes |

---

## Gotchas Quan Trọng

- Không dùng `@Data` trên `@Entity` — lỗi Hibernate infinite loop
- Không dùng `double`/`float` cho tiền — mất độ chính xác, dùng `BigDecimal`
- Luôn dùng `Optional` từ repository, không return `null`
- Không gọi `.block()` trong WebFlux reactive pipeline
- Không commit secret vào git — dùng `.env` + biến môi trường
- Flyway migration: không sửa file đã chạy, chỉ tạo file mới