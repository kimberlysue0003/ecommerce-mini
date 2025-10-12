# 🚀 E-commerce Backend - Java Spring Boot Migration Plan

## 📋 项目概述

**目标**: 将电商后端从 Node.js/Go 迁移到 **Java + Spring Boot**，实现第三种技术栈的完整实现。

**策略**: 创建独立分支 `backend/java-refactor`，保持与 Node.js/Go 完全相同的功能。

---

## 🎯 为什么选择 Java Spring Boot？

### 优势

1. ✅ **企业级成熟度** - Java 在企业应用中占统治地位
2. ✅ **Spring 生态强大** - Spring Boot, Spring Security, Spring Data JPA
3. ✅ **性能优秀** - JVM 优化成熟，接近 Go 的性能
4. ✅ **类型安全** - 强类型语言，编译时检查
5. ✅ **并发支持** - 线程池、虚拟线程（Java 21+）
6. ✅ **ORM 成熟** - JPA/Hibernate 非常成熟
7. ✅ **工具链完善** - Maven/Gradle, IntelliJ IDEA
8. ✅ **人才市场** - Java 开发者数量最多

### 与 Node.js/Go 的对比定位

| 特性 | Node.js | Go | Java Spring Boot |
|------|---------|-----|------------------|
| **开发速度** | 🚀🚀🚀 最快 | 🚀🚀 快 | 🚀 中等 |
| **性能** | ⭐⭐ 中等 | ⭐⭐⭐ 优秀 | ⭐⭐⭐ 优秀 |
| **企业级** | ⭐⭐ 中等 | ⭐⭐ 中等 | ⭐⭐⭐ 非常成熟 |
| **生态系统** | 🌟🌟🌟 丰富 | 🌟🌟 快速增长 | 🌟🌟🌟 非常成熟 |
| **学习曲线** | ⭐ 简单 | ⭐⭐ 中等 | ⭐⭐⭐ 较陡 |

---

## 🏗️ 技术栈选择

### 核心框架

- **Spring Boot 3.2** - 最新稳定版
- **Java 21 (LTS)** - 长期支持版本，支持虚拟线程
- **Maven** - 构建工具（也可用 Gradle）

### 数据库 & ORM

- **PostgreSQL 16** - 与现有保持一致
- **Spring Data JPA** - ORM 抽象层
- **Hibernate** - JPA 实现

### Web 框架

- **Spring Web MVC** - RESTful API
- **Spring Security** - 认证授权
- **Spring Validation** - 数据验证

### 工具库

- **Lombok** - 减少样板代码
- **MapStruct** - 对象映射
- **JJWT** - JWT 处理
- **Stripe Java SDK** - 支付集成

### 测试

- **JUnit 5** - 单元测试
- **Mockito** - Mock 框架
- **Spring Boot Test** - 集成测试
- **TestContainers** - 数据库测试

---

## 📁 项目结构

```
ecommerce-mini/
├── backend-java/                          # Java Spring Boot 后端
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/kimberly/ecommerce/
│   │   │   │   ├── EcommerceApplication.java    # 启动类
│   │   │   │   ├── config/                      # 配置类
│   │   │   │   │   ├── SecurityConfig.java      # Spring Security
│   │   │   │   │   ├── JwtConfig.java           # JWT 配置
│   │   │   │   │   ├── CorsConfig.java          # CORS 配置
│   │   │   │   │   └── DatabaseConfig.java      # 数据源配置
│   │   │   │   ├── controller/                  # REST 控制器
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── ProductController.java
│   │   │   │   │   ├── CartController.java
│   │   │   │   │   ├── OrderController.java
│   │   │   │   │   ├── PaymentController.java
│   │   │   │   │   └── AIController.java
│   │   │   │   ├── service/                     # 业务逻辑
│   │   │   │   │   ├── AuthService.java
│   │   │   │   │   ├── ProductService.java
│   │   │   │   │   ├── CartService.java
│   │   │   │   │   ├── OrderService.java
│   │   │   │   │   ├── PaymentService.java
│   │   │   │   │   └── AIService.java
│   │   │   │   ├── repository/                  # JPA Repository
│   │   │   │   │   ├── UserRepository.java
│   │   │   │   │   ├── ProductRepository.java
│   │   │   │   │   ├── CartItemRepository.java
│   │   │   │   │   ├── OrderRepository.java
│   │   │   │   │   └── OrderItemRepository.java
│   │   │   │   ├── model/                       # JPA 实体
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── Product.java
│   │   │   │   │   ├── CartItem.java
│   │   │   │   │   ├── Order.java
│   │   │   │   │   └── OrderItem.java
│   │   │   │   ├── dto/                         # 数据传输对象
│   │   │   │   │   ├── request/
│   │   │   │   │   │   ├── RegisterRequest.java
│   │   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   │   └── CreateOrderRequest.java
│   │   │   │   │   └── response/
│   │   │   │   │       ├── AuthResponse.java
│   │   │   │   │       ├── ProductResponse.java
│   │   │   │   │       └── ApiResponse.java
│   │   │   │   ├── security/                    # 安全相关
│   │   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   │   └── UserDetailsServiceImpl.java
│   │   │   │   ├── exception/                   # 异常处理
│   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   │   └── BadRequestException.java
│   │   │   │   └── util/                        # 工具类
│   │   │   │       ├── TFIDFUtil.java           # TF-IDF 算法
│   │   │   │       ├── SimilarityUtil.java      # 相似度计算
│   │   │   │       └── IdGenerator.java         # ID 生成器
│   │   │   └── resources/
│   │   │       ├── application.yml              # 应用配置
│   │   │       ├── application-dev.yml          # 开发环境
│   │   │       └── application-prod.yml         # 生产环境
│   │   └── test/
│   │       └── java/com/kimberly/ecommerce/
│   │           ├── service/                     # 服务测试
│   │           ├── controller/                  # 控制器测试
│   │           └── repository/                  # Repository 测试
│   ├── pom.xml                                  # Maven 依赖
│   ├── Dockerfile
│   └── README.md
```

---

## 🔧 Maven 依赖 (pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>

    <groupId>com.kimberly</groupId>
    <artifactId>ecommerce-backend</artifactId>
    <version>1.0.0</version>
    <name>E-commerce Backend</name>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- PostgreSQL -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
        </dependency>

        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.3</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.3</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.3</version>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Stripe -->
        <dependency>
            <groupId>com.stripe</groupId>
            <artifactId>stripe-java</artifactId>
            <version>24.0.0</version>
        </dependency>

        <!-- MapStruct -->
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
            <version>1.5.5.Final</version>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## 📝 核心代码示例

### 1. JPA 实体 (User.java)

```java
package com.kimberly.ecommerce.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(generator = "custom-id")
    @GenericGenerator(name = "custom-id", strategy = "com.kimberly.ecommerce.util.IdGenerator")
    @Column(length = 30)
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String name;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 关系映射
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<CartItem> cartItems;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Order> orders;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### 2. JPA Repository

```java
package com.kimberly.ecommerce.repository;

import com.kimberly.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

### 3. Service 层

```java
package com.kimberly.ecommerce.service;

import com.kimberly.ecommerce.dto.request.RegisterRequest;
import com.kimberly.ecommerce.dto.response.AuthResponse;
import com.kimberly.ecommerce.exception.BadRequestException;
import com.kimberly.ecommerce.model.User;
import com.kimberly.ecommerce.repository.UserRepository;
import com.kimberly.ecommerce.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 检查邮箱是否存在
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        // 创建用户
        User user = User.builder()
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .build();

        user = userRepository.save(user);

        // 生成 JWT
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(toUserResponse(user))
                .build();
    }

    // ... 其他方法
}
```

### 4. REST Controller

```java
package com.kimberly.ecommerce.controller;

import com.kimberly.ecommerce.dto.request.LoginRequest;
import com.kimberly.ecommerce.dto.request.RegisterRequest;
import com.kimberly.ecommerce.dto.response.ApiResponse;
import com.kimberly.ecommerce.dto.response.AuthResponse;
import com.kimberly.ecommerce.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> getCurrentUser() {
        // 从 SecurityContext 获取当前用户
        // ...
    }
}
```

### 5. Spring Security 配置

```java
package com.kimberly.ecommerce.config;

import com.kimberly.ecommerce.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/products/**", "/health").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

---

## 🚀 实施阶段

### Phase 1: 项目初始化 (1-2 天)

**任务**:
- [ ] 创建 Git 分支 `backend/java-refactor`
- [ ] 初始化 Spring Boot 项目（使用 Spring Initializr）
- [ ] 配置 Maven 依赖
- [ ] 配置数据库连接
- [ ] 创建基础项目结构
- [ ] 配置 application.yml
- [ ] 创建 JPA 实体类
- [ ] 验证数据库连接

**产物**: 可运行的 Spring Boot 应用骨架

---

### Phase 2: 认证系统 (2-3 天)

**任务**:
- [ ] User 实体 + Repository
- [ ] JWT 工具类 (JwtTokenProvider)
- [ ] Spring Security 配置
- [ ] AuthService (register, login)
- [ ] AuthController (REST API)
- [ ] 密码加密 (BCrypt)
- [ ] 异常处理

**API 端点**:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

---

### Phase 3: 产品 API (2-3 天)

**任务**:
- [ ] Product 实体 + Repository
- [ ] ProductService (CRUD, 分页, 过滤)
- [ ] ProductController
- [ ] 自定义查询方法 (JPA Specification)
- [ ] 分页排序支持

**API 端点**:
- `GET /api/products` (带过滤、分页、排序)
- `GET /api/products/:id`
- `GET /api/products/slug/:slug`

---

### Phase 4: 购物车 API (2 天)

**任务**:
- [ ] CartItem 实体 + Repository
- [ ] CartService
- [ ] CartController
- [ ] 认证中间件集成

**API 端点**:
- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart/:itemId`
- `DELETE /api/cart/:itemId`

---

### Phase 5: 订单系统 (2-3 天)

**任务**:
- [ ] Order + OrderItem 实体
- [ ] OrderRepository
- [ ] OrderService (事务支持)
- [ ] OrderController
- [ ] 订单状态管理

**API 端点**:
- `POST /api/orders`
- `POST /api/orders/from-cart`
- `GET /api/orders`
- `GET /api/orders/:id`

---

### Phase 6: Stripe 支付 (2 天)

**任务**:
- [ ] 集成 Stripe Java SDK
- [ ] PaymentService
- [ ] PaymentController
- [ ] 支付确认流程

**API 端点**:
- `GET /api/payment/config`
- `POST /api/payment/create-payment-intent`
- `POST /api/payment/confirm`

---

### Phase 7: AI 功能 (3-4 天)

**任务**:
- [ ] TF-IDF 工具类 (Java 实现)
- [ ] NLP 查询解析
- [ ] AIService
- [ ] AIController
- [ ] 相似度计算

**API 端点**:
- `POST /api/ai/search`
- `GET /api/ai/recommend/:productId`
- `GET /api/ai/popular`

---

### Phase 8: 测试 (2-3 天)

**任务**:
- [ ] Service 单元测试 (JUnit + Mockito)
- [ ] Controller 集成测试
- [ ] Repository 测试 (TestContainers)
- [ ] 测试覆盖率报告

---

### Phase 9: 文档 & 优化 (1-2 天)

**任务**:
- [ ] README 文档
- [ ] API 文档 (Swagger/OpenAPI)
- [ ] 性能优化
- [ ] 代码重构

---

## ⏱️ 时间估算

| 阶段 | 预计时间 | 难度 |
|------|---------|------|
| Phase 1: 项目初始化 | 1-2 天 | ⭐ |
| Phase 2: 认证系统 | 2-3 天 | ⭐⭐ |
| Phase 3: 产品 API | 2-3 天 | ⭐⭐ |
| Phase 4: 购物车 | 2 天 | ⭐⭐ |
| Phase 5: 订单系统 | 2-3 天 | ⭐⭐⭐ |
| Phase 6: Stripe 支付 | 2 天 | ⭐⭐ |
| Phase 7: AI 功能 | 3-4 天 | ⭐⭐⭐ |
| Phase 8: 测试 | 2-3 天 | ⭐⭐ |
| Phase 9: 文档 & 优化 | 1-2 天 | ⭐ |
| **总计** | **17-23 天** | |

---

## 🎯 技术要点

### Java vs Node.js vs Go

#### 1. 类型系统

**Java**:
```java
// 强类型，运行时也保留类型信息
public class User {
    private String id;
    private String email;
    // 完整的类型安全
}
```

#### 2. 并发模型

**Java**:
```java
// 线程池 + CompletableFuture
CompletableFuture<User> userFuture = CompletableFuture.supplyAsync(() ->
    userService.findById(id), executor);

// Java 21 虚拟线程
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> processOrder(order));
}
```

#### 3. 依赖注入

**Java (Spring)**:
```java
// 自动依赖注入（基于注解）
@Service
@RequiredArgsConstructor  // Lombok 自动生成构造函数
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    // Spring 自动注入依赖
}
```

#### 4. ORM

**Java (JPA/Hibernate)**:
```java
// 基于注解的实体映射
@Entity
@Table(name = "products")
public class Product {
    @Id
    @Column(length = 30)
    private String id;

    @OneToMany(mappedBy = "product")
    private List<OrderItem> orderItems;
}

// 查询方法
List<Product> products = productRepository
    .findByTitleContainingAndPriceBetween(keyword, minPrice, maxPrice);
```

---

## 🔧 开发工具推荐

1. **IDE**: IntelliJ IDEA Ultimate (最佳 Java IDE)
2. **构建工具**: Maven (或 Gradle)
3. **数据库工具**: DBeaver / DataGrip
4. **API 测试**: Postman / Insomnia
5. **Java 版本管理**: SDKMAN

---

## 📚 学习资源

1. **Spring Boot 官方文档**: https://spring.io/projects/spring-boot
2. **Spring Data JPA**: https://spring.io/projects/spring-data-jpa
3. **Spring Security**: https://spring.io/projects/spring-security
4. **Baeldung 教程**: https://www.baeldung.com/ (最佳 Spring 教程网站)

---

## 🎯 预期成果

完成后你将拥有：

1. ✅ **三种技术栈的完整实现**
   - Node.js + Express + Prisma (生产环境)
   - Go + Gin + GORM (高性能)
   - Java + Spring Boot + JPA (企业级)

2. ✅ **全面的技术对比经验**
   - 三种语言的并发模型
   - 三种 ORM 实现方式
   - 三种类型系统对比

3. ✅ **强大的简历项目**
   - 展示多语言能力
   - 企业级框架经验
   - 完整的电商后端实现

---

## 🚀 开始行动

### 第一步：创建分支

```bash
git checkout -b backend/java-refactor
```

### 第二步：初始化项目

访问 [Spring Initializr](https://start.spring.io/) 或使用以下配置：

```bash
# 使用 Spring Boot CLI
spring init \
  --dependencies=web,data-jpa,postgresql,security,validation,lombok \
  --type=maven-project \
  --java-version=21 \
  --package-name=com.kimberly.ecommerce \
  backend-java
```

### 第三步：按阶段实施

从 Phase 1 开始，逐步完成每个阶段的任务。

---

**准备好了吗？让我们开始 Java 版本的开发！** 🚀

**作者**: Kimberly Su
**日期**: 2025-10-12
**项目**: E-commerce Backend - Java Spring Boot Migration
