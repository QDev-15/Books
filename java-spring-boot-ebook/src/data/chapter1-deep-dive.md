# CHƯƠNG 1: OOP CƠ BẢN - DEEP DIVE

> **Mục tiêu chương này:** Bạn sẽ hiểu OOP không chỉ về cách dùng, mà hiểu TẠI SAO nó được thiết kế như vậy, nó hoạt động thế nào bên trong, và khi nào dùng cách nào.

---

## 1.1 Class và Object - Nền Tảng OOP

### 1.1.1 Khái Niệm Cơ Bản

#### **Vấn đề cần giải quyết:**

Trước khi có lập trình hướng đối tượng, các lập trình viên phải dùng **procedural programming** (lập trình hướng thủ tục):

```java
// ❌ PROCEDURAL STYLE (trước OOP)
public class ProductManager {
    // Dữ liệu tán lạc
    public static long[] ids = new long[1000];
    public static String[] names = new String[1000];
    public static double[] prices = new double[1000];
    public static String[] categories = new String[1000];
    public static int productCount = 0;
    
    // Hàm tách biệt từ dữ liệu
    public static void addProduct(long id, String name, double price, String category) {
        ids[productCount] = id;
        names[productCount] = name;
        prices[productCount] = price;
        categories[productCount] = category;
        productCount++;
    }
    
    public static double getPrice(int index) {
        return prices[index];
    }
    
    public static String getName(int index) {
        return names[index];
    }
}

// Vấn đề:
// 1. Dữ liệu và logic tách rời nhau
// 2. Không có "trách nhiệm" của object
// 3. Khó maintain khi thêm field (phải thêm array mới)
// 4. Không có encapsulation (ai cũng có thể modify ids[0] trực tiếp)
// 5. Logic bị duplicate ở nhiều nơi
```

#### **Giải pháp: OOP - Bundling Data & Behavior**

```java
// ✅ OOP STYLE - Data & Behavior grouped together
public class Product {
    // 1. STATE (Trạng thái) - dữ liệu của object
    private long id;
    private String name;
    private double price;
    private String category;
    
    // 2. BEHAVIOR (Hành vi) - những gì object có thể làm
    public void applyDiscount(double percent) {
        this.price = this.price * (1 - percent / 100);
    }
    
    public boolean isPremium() {
        return this.price >= 1000;
    }
    
    public String getInfo() {
        return String.format("%s ($%.2f) - %s", this.name, this.price, this.category);
    }
}
```

**Lợi ích OOP:**
- ✅ Data & methods ở cùng 1 chỗ (cohesion cao)
- ✅ Encapsulation: Ẩn internal details
- ✅ Reusability: Tạo nhiều Product instances
- ✅ Maintainability: Thêm field/method dễ dàng

---

### 1.1.2 Class vs Object - Sự Khác Biệt Cốt Lõi

#### **Analog từ thực tế:**

```
┌─────────────────────────────────────────┐
│          CLASS = Blueprint               │
├─────────────────────────────────────────┤
│  public class Car {                     │
│      private String color;              │
│      private int speed;                 │
│      public void accelerate() { ... }   │
│  }                                      │
│                                         │
│  "Kế hoạch thiết kế chung"              │
│  Tồn tại trong SOURCE CODE              │
│  Memory: Stored in CLASS AREA           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        OBJECT = Thực thể từ Blueprint   │
├─────────────────────────────────────────┤
│  Car myCar = new Car();                 │
│                                         │
│  Instance 1: color=Red, speed=0         │
│  Instance 2: color=Blue, speed=50       │
│  Instance 3: color=Black, speed=100     │
│                                         │
│  "Chiếc xe cụ thể"                      │
│  Tồn tại tại RUNTIME                    │
│  Memory: Stored in HEAP                 │
└─────────────────────────────────────────┘
```

#### **Chi tiết trong Java Memory:**

```
┌──────────────────────────────────────────────────────┐
│           JAVA RUNTIME MEMORY LAYOUT                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────┐                                │
│  │  Stack Memory   │                                │
│  │  ┌───────────┐  │                                │
│  │  │ myCar ────┼──┼──┐ (reference - 4/8 bytes)     │
│  │  │ color    │  │  │                              │
│  │  │ speed    │  │  │                              │
│  │  └───────────┘  │  │                              │
│  └─────────────────┘  │                              │
│         ▼              │                              │
│  ┌──────────────────────────────┐                    │
│  │     Heap Memory              │                    │
│  │     ┌──────────────────────┐ │                    │
│  │     │  Car@0x7f1a2b3c4d5e │◄┼───(points to here)│
│  │     │  {                   │ │                    │
│  │     │    color="Red"       │ │  (actual data)     │
│  │     │    speed=0           │ │                    │
│  │     │  }                   │ │                    │
│  │     └──────────────────────┘ │                    │
│  └──────────────────────────────┘                    │
│                                                      │
│  Class metadata stored in CLASS AREA                │
│  (shared by all instances)                          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Quan trọng:**
- **Class**: Tồn tại 1 lần trong CLASS AREA
- **Object**: Mỗi lần `new Car()`, tạo 1 instance mới trong HEAP
- **Reference**: Variable `myCar` chỉ chứa địa chỉ (address), không chứa dữ liệu thực

---

### 1.1.3 Constructor - Khởi Tạo Object

#### **Tại sao cần Constructor?**

Constructor đảm bảo object được tạo ở **valid state** (trạng thái hợp lệ).

```java
public class BankAccount {
    private long accountNumber;
    private double balance;
    private String accountHolder;
    
    // ❌ KHÔNG CÓ CONSTRUCTOR - DANGER!
    // Ai tạo object mà không set balance?
    BankAccount acc = new BankAccount();
    // acc.balance = 0 (default)
    // Không biết accountNumber, accountHolder!
    
    // ✅ CÓ CONSTRUCTOR - Enforced initialization
    public BankAccount(long accountNumber, String accountHolder, double initialBalance) {
        // Validation bên trong constructor
        if (accountNumber <= 0) {
            throw new IllegalArgumentException("Account number must be positive");
        }
        if (accountHolder == null || accountHolder.isEmpty()) {
            throw new IllegalArgumentException("Account holder cannot be empty");
        }
        if (initialBalance < 0) {
            throw new IllegalArgumentException("Initial balance cannot be negative");
        }
        
        // Initialization (gán giá trị)
        this.accountNumber = accountNumber;
        this.accountHolder = accountHolder;
        this.balance = initialBalance;
    }
}

// Usage
BankAccount acc = new BankAccount(123456, "John Doe", 1000);
// Object được tạo ở valid state: tất cả fields đều có giá trị hợp lệ
```

#### **Constructor Chaining (Kỹ thuật Advanced)**

```java
public class User {
    private String username;
    private String email;
    private String password;
    private boolean active;
    private LocalDateTime createdAt;
    
    // Constructor 1: Minimal (most specific)
    public User(String username, String email, String password) {
        this(username, email, password, true);
    }
    
    // Constructor 2: Chaining to Constructor 3
    public User(String username, String email, String password, boolean active) {
        this(username, email, password, active, LocalDateTime.now());
    }
    
    // Constructor 3: Full (most general)
    public User(String username, String email, String password, boolean active, LocalDateTime createdAt) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.active = active;
        this.createdAt = createdAt;
    }
}

// Lợi ích:
// - Tránh code duplication
// - Flexible: có thể dùng constructor nào tùy lúc
User u1 = new User("alice", "alice@gmail.com", "pass123");
User u2 = new User("bob", "bob@gmail.com", "pass456", false);
User u3 = new User("charlie", "charlie@gmail.com", "pass789", true, LocalDateTime.of(2024, 1, 1, 0, 0));
```

#### **Default Constructor (Implicit)**

```java
// Nếu bạn không define bất kỳ constructor nào
public class SimpleClass {
    private int value;
    // Java tự động generate:
    // public SimpleClass() {
    //     // empty body
    // }
}

// Nhưng ngay khi bạn define 1 constructor, default constructor mất!
public class SimpleClass {
    private int value;
    
    public SimpleClass(int value) {  // Explicit constructor
        this.value = value;
    }
    // Default constructor NO LONGER EXISTS!
}

// Nên:
SimpleClass obj1 = new SimpleClass();      // ❌ COMPILE ERROR
SimpleClass obj2 = new SimpleClass(42);    // ✅ OK
```

---

### 1.1.4 Instance Variables - Memory & Initialization

#### **Khi nào fields được initialize?**

```java
public class FieldInitialization {
    // ❌ WRONG: Biến local phải initialize thủ công
    public void method() {
        int localVariable;
        System.out.println(localVariable);  // ❌ COMPILE ERROR: variable might not be initialized
    }
    
    // ✅ CORRECT: Instance variables tự động được initialize
    private int intField;           // Default: 0
    private double doubleField;     // Default: 0.0
    private boolean boolField;      // Default: false
    private String stringField;     // Default: null
    private List<?> listField;      // Default: null
    
    public void checkDefaults() {
        System.out.println(intField);      // 0
        System.out.println(doubleField);   // 0.0
        System.out.println(boolField);     // false
        System.out.println(stringField);   // null
        System.out.println(listField);     // null
    }
}
```

**Vì sao?**
- Instance variables lưu trong **HEAP** → JVM ghi 0 vào vùng nhớ
- Local variables lưu trong **STACK** → phải initialize thủ công

#### **Initialization Order (Thứ tự khởi tạo)**

```java
public class InitializationOrder {
    // Bước 1: Field với explicit initialization
    private List<String> items = new ArrayList<>();  // Chạy ĐẦU TIÊN
    
    // Bước 2: Initializer block (non-static)
    {
        System.out.println("Initializer block - Chạy THỨ HAI");
        items.add("default item");
    }
    
    // Bước 3: Constructor
    public InitializationOrder() {
        System.out.println("Constructor - Chạy THỨ BA");
        items.add("constructor item");
    }
}

// Output khi: new InitializationOrder()
// 1. Initializer block - Chạy THỨ HAI
// 2. Constructor - Chạy THỨ BA
```

**Sử dụng khi nào?**
```java
public class ComplexInitialization {
    private Map<String, Integer> cache;
    private Logger logger;
    
    // ✅ Dùng initializer block cho complex initialization
    {
        cache = new HashMap<>();
        cache.put("default", 0);
        cache.put("premium", 1);
        
        logger = LoggerFactory.getLogger(this.getClass());
        logger.info("Cache initialized with defaults");
    }
    
    public ComplexInitialization() {
        // Constructor chỉ làm specific initialization
    }
}
```

---

## 1.2 Encapsulation - Ẩn Giấu & Bảo Vệ

### 1.2.1 Tại Sao Cần Encapsulation?

#### **Vấn đề: Public Fields**

```java
// ❌ BAD: Public fields
public class Account {
    public double balance = 1000;  // Bất kỳ ai cũng có thể modify!
}

// Sử dụng
Account acc = new Account();
acc.balance = -99999;  // Tính toán sai! Tài khoản không thể âm!
acc.balance = 1e308;   // Giá trị quá lớn!

// Ngân hàng mất tiền vì không có validation!
```

#### **Giải pháp: Encapsulation**

```java
// ✅ GOOD: Encapsulation
public class Account {
    private double balance;  // PRIVATE - Không ai có thể access trực tiếp
    
    // Getter: Chỉ cho đọc
    public double getBalance() {
        return balance;
    }
    
    // Setter: Có validation
    public void setBalance(double balance) {
        if (balance < 0) {
            throw new IllegalArgumentException("Balance cannot be negative");
        }
        // Có thể add logging, audit trail, etc.
        System.out.println("Setting balance to: " + balance);
        this.balance = balance;
    }
}

// Sử dụng
Account acc = new Account();
acc.setBalance(-99999);  // ❌ Throws exception - Protected!
acc.setBalance(1000);    // ✅ OK - Validated
System.out.println(acc.getBalance());  // 1000
```

### 1.2.2 Access Modifiers - 4 Levels

```
┌─────────────────────────────────────────────────────────┐
│         Java Access Modifiers Matrix                    │
├──────────┬──────────┬──────────┬──────────┬──────────┤
│ Modifier │ Class    │ Package  │ Subclass │ World   │
├──────────┼──────────┼──────────┼──────────┼──────────┤
│ public   │    ✅    │    ✅    │    ✅    │   ✅    │
│ protected│    ✅    │    ✅    │    ✅    │   ❌    │
│ package  │    ✅    │    ✅    │    ❌    │   ❌    │
│ private  │    ✅    │    ❌    │    ❌    │   ❌    │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

#### **Chi tiết từng level:**

```java
// ===== PRIVATE (Most Restrictive) =====
public class BankAccount {
    private double balance;  // Chỉ accessible trong class này
    
    private void validateBalance() {  // Helper method
        if (balance < 0) {
            throw new IllegalStateException("Invalid balance");
        }
    }
}

// BankAccount acc = new BankAccount();
// acc.balance = 100;  // ❌ COMPILE ERROR
// acc.validateBalance();  // ❌ COMPILE ERROR

// ===== PACKAGE-PRIVATE (Default, No Modifier) =====
public class PaymentProcessor {
    double amount;  // Accessible trong cùng package
}

// File: com/example/payment/PaymentProcessor.java
// File: com/example/payment/PaymentService.java
// public PaymentService {
//     public void process() {
//         PaymentProcessor p = new PaymentProcessor();
//         p.amount = 100;  // ✅ OK - cùng package
//     }
// }

// File: com/other/Main.java
// public class Main {
//     public void test() {
//         PaymentProcessor p = new PaymentProcessor();
//         p.amount = 100;  // ❌ COMPILE ERROR - khác package
//     }
// }

// ===== PROTECTED =====
public class Parent {
    protected String data = "protected";
}

public class Child extends Parent {
    public void test() {
        System.out.println(this.data);  // ✅ OK - từ subclass
    }
}

public class Unrelated {
    public void test() {
        Parent p = new Parent();
        System.out.println(p.data);  // ❌ COMPILE ERROR - không phải subclass
    }
}

// ===== PUBLIC (Least Restrictive) =====
public class PublicClass {
    public String info = "public";  // Accessible từ anywhere
}

// Anywhere:
PublicClass obj = new PublicClass();
System.out.println(obj.info);  // ✅ OK
```

### 1.2.3 Getter & Setter Best Practices

#### **Pattern 1: Simple Property**

```java
public class Person {
    private String name;
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        if (name == null || name.isEmpty()) {
            throw new IllegalArgumentException("Name cannot be null or empty");
        }
        this.name = name;
    }
}
```

#### **Pattern 2: Computed Property (Không có backing field)**

```java
public class Rectangle {
    private double width;
    private double height;
    
    // Getter: Computed on-the-fly (không có field `area`)
    public double getArea() {
        return width * height;
    }
    
    // Getter: Computed on-the-fly
    public double getPerimeter() {
        return 2 * (width + height);
    }
}

// Usage
Rectangle rect = new Rectangle(10, 5);
System.out.println(rect.getArea());       // 50 (computed, not stored)
System.out.println(rect.getPerimeter());  // 30 (computed, not stored)

// Lợi ích: Nếu width/height change, area tự động update
```

#### **Pattern 3: Lazy Initialization (Initialize khi cần)**

```java
public class User {
    private String username;
    private List<Post> posts;  // Có thể lớn, nên lazy init
    
    public User(String username) {
        this.username = username;
        this.posts = null;  // Chưa load
    }
    
    public List<Post> getPosts() {
        if (posts == null) {
            // Load từ database khi lần đầu tiên access
            posts = loadPostsFromDatabase();
        }
        return posts;
    }
    
    private List<Post> loadPostsFromDatabase() {
        // Giả sử gọi database
        return new ArrayList<>();
    }
}

// Usage
User user = new User("alice");
// Lúc này chưa load posts (efficient!)

List<Post> posts = user.getPosts();  // Load lần đầu tiên
List<Post> posts2 = user.getPosts(); // Trả về cached value (efficient!)
```

#### **Pattern 4: Read-Only Property (Chỉ Getter)**

```java
public class Product {
    private long id;  // Set từ constructor, KHÔNG BAO GIỜ CHANGE
    private String name;
    
    public Product(long id, String name) {
        this.id = id;
        this.name = name;
    }
    
    public long getId() {  // Getter
        return id;
    }
    // Không có setId() - id là immutable!
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        if (name == null || name.isEmpty()) {
            throw new IllegalArgumentException("Name cannot be empty");
        }
        this.name = name;
    }
}

// Usage
Product p = new Product(1, "Laptop");
System.out.println(p.getId());  // 1
// p.setId(2);  // ❌ NO METHOD - Compile error!
```

#### **Pattern 5: Defensive Copying (Deep Copy)**

```java
public class Order {
    private List<Item> items;  // Mutable object
    
    public Order(List<Item> items) {
        // ❌ WRONG: Nếu assign trực tiếp
        // this.items = items;  // items có thể bị modify từ ngoài!
        
        // ✅ CORRECT: Deep copy
        this.items = new ArrayList<>(items);
    }
    
    public List<Item> getItems() {
        // ❌ WRONG: Return reference
        // return items;  // Ai có thể modify list từ ngoài!
        
        // ✅ CORRECT: Return unmodifiable copy
        return Collections.unmodifiableList(new ArrayList<>(items));
    }
}

// Usage
List<Item> originalItems = new ArrayList<>();
originalItems.add(new Item("A"));
originalItems.add(new Item("B"));

Order order = new Order(originalItems);

// Modify original list
originalItems.add(new Item("C"));
System.out.println(order.getItems().size());  // Still 2 (protected!)

// Try to modify order items
order.getItems().add(new Item("D"));  // ❌ Throws UnsupportedOperationException
```

---

## 1.3 Kế Thừa (Inheritance) - Code Reuse & Hierarchy

### 1.3.1 Tại Sao Cần Inheritance?

#### **Vấn đề: Code Duplication**

```java
// ❌ BEFORE: Code duplicated
public class Dog {
    private String name;
    private int age;
    
    public void eat() {
        System.out.println(name + " is eating");
    }
    
    public void sleep() {
        System.out.println(name + " is sleeping");
    }
    
    public String getInfo() {
        return name + " (age: " + age + ")";
    }
}

public class Cat {
    private String name;
    private int age;
    
    public void eat() {
        System.out.println(name + " is eating");  // SAME CODE!
    }
    
    public void sleep() {
        System.out.println(name + " is sleeping");  // SAME CODE!
    }
    
    public String getInfo() {
        return name + " (age: " + age + ")";  // SAME CODE!
    }
}

// Vấn đề:
// - 50% code duplicate
// - Nếu fix bug trong eat(), phải fix 2 nơi
// - Thêm field `color`, phải add vào 2 classes
```

#### **Giải pháp: Inheritance**

```java
// ✅ AFTER: Share common code
public class Animal {  // Parent/Superclass
    protected String name;  // protected - con class có thể access
    protected int age;
    
    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public void eat() {
        System.out.println(name + " is eating");
    }
    
    public void sleep() {
        System.out.println(name + " is sleeping");
    }
    
    public String getInfo() {
        return name + " (age: " + age + ")";
    }
}

public class Dog extends Animal {  // Child/Subclass
    private String breed;
    
    public Dog(String name, int age, String breed) {
        super(name, age);  // Gọi parent constructor
        this.breed = breed;
    }
    
    @Override
    public String getInfo() {
        return super.getInfo() + ", breed: " + breed;  // Reuse parent logic
    }
}

public class Cat extends Animal {  // Another child
    private boolean indoor;
    
    public Cat(String name, int age, boolean indoor) {
        super(name, age);
        this.indoor = indoor;
    }
    
    @Override
    public String getInfo() {
        return super.getInfo() + ", indoor: " + indoor;
    }
}
```

### 1.3.2 Keyword `super` - Accessing Parent

#### **`super()` - Parent Constructor**

```java
public class Parent {
    protected String name;
    protected int id;
    
    public Parent(String name, int id) {
        this.name = name;
        this.id = id;
    }
}

public class Child extends Parent {
    private String nickname;
    
    public Child(String name, int id, String nickname) {
        super(name, id);  // ✅ Gọi parent constructor ĐẦU TIÊN
        this.nickname = nickname;
    }
    
    // ❌ Nếu không gọi super(), sẽ gọi super() tự động
    // nhưng nếu parent không có default constructor, COMPILE ERROR!
}
```

**Constructor Chaining Diagram:**

```
┌─────────────────────────────────────┐
│  new Child("Alice", 1, "Ally")      │
└──────────────────┬──────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Child constructor   │
        │  super(name, id)     │────┐
        └──────────────────────┘    │
                                    ▼
                    ┌─────────────────────────┐
                    │ Parent constructor      │
                    │ this.name = name        │
                    │ this.id = id            │
                    └─────────────────────────┘
                    
        (quay lại Child)
        this.nickname = nickname
```

#### **`super.method()` - Calling Parent Method**

```java
public class Parent {
    public void display() {
        System.out.println("Parent display");
    }
}

public class Child extends Parent {
    @Override
    public void display() {
        super.display();  // Gọi parent's version
        System.out.println("Child display");
    }
}

// Usage
Child child = new Child();
child.display();
// Output:
// Parent display
// Child display
```

#### **`super.field` - Accessing Parent Field**

```java
public class Parent {
    protected String description = "Parent";
}

public class Child extends Parent {
    protected String description = "Child";
    
    public void show() {
        System.out.println(description);              // "Child"
        System.out.println(super.description);        // "Parent"
    }
}

// Usage
Child child = new Child();
child.show();
// Output:
// Child
// Parent
```

### 1.3.3 Method Overriding vs Overloading

#### **Overriding (Runtime - Polymorphism)**

```java
public class Parent {
    public void speak() {
        System.out.println("Parent speaks");
    }
}

public class Child extends Parent {
    @Override  // Compiler check: parent có method này không?
    public void speak() {
        System.out.println("Child speaks");
    }
}

// Usage
Parent p = new Child();  // Reference type: Parent, Actual type: Child
p.speak();  // Gọi Child's version (Runtime polymorphism)!
// Output: Child speaks
```

**Kỹ thuật đằng sau (Method Lookup):**

```
┌─────────────────────────────────────┐
│ Parent p = new Child();             │
├─────────────────────────────────────┤
│ p.speak()                           │
│   │                                 │
│   ▼ Runtime: Check actual type      │
│   Actual type: Child                │
│   ▼ Method lookup in Child class    │
│   Found: Child.speak()              │
│   ▼ Call it!                        │
└─────────────────────────────────────┘
```

#### **Overloading (Compile-time - Static)**

```java
public class Calculator {
    // Method 1
    public int add(int a, int b) {
        return a + b;
    }
    
    // Method 2 - OVERLOAD (same name, different parameters)
    public double add(double a, double b) {
        return a + b;
    }
    
    // Method 3 - OVERLOAD
    public int add(int a, int b, int c) {
        return a + b + c;
    }
}

// Usage
Calculator calc = new Calculator();
System.out.println(calc.add(5, 10));              // Gọi Method 1
System.out.println(calc.add(5.5, 10.5));          // Gọi Method 2
System.out.println(calc.add(5, 10, 15));          // Gọi Method 3

// Compiler resolve tại COMPILE TIME (static)
```

**Comparison:**

```
┌───────────────────┬──────────────────┬──────────────────┐
│ Aspect            │ Overloading      │ Overriding       │
├───────────────────┼──────────────────┼──────────────────┤
│ When resolved     │ Compile-time     │ Runtime          │
│ Same name?        │ Yes              │ Yes              │
│ Parameter?        │ Different        │ Same             │
│ Return type?      │ Can be different │ Must be same     │
│ Access level?     │ Can be different │ Same or wider    │
│ Exception?        │ Can be different │ Same or narrower │
│ Called            │ Static dispatch  │ Dynamic dispatch │
└───────────────────┴──────────────────┴──────────────────┘
```

### 1.3.4 Single vs Multiple Inheritance

```java
// ===== JAVA: SINGLE INHERITANCE ONLY =====
public class Animal { }
public class Dog extends Animal { }  // ✅ OK

public class Dog extends Animal, Pet { }  // ❌ COMPILE ERROR
// Java không support multiple inheritance (đặc tính của interface)

// ===== WHY? Diamond Problem =====
//          A
//         / \
//        B   C
//         \ /
//          D
//
// Nếu D extends B, C
// Nếu A.method() được override ở B và C khác cách
// D sẽ gọi version nào? AMBIGUOUS!

// ===== SOLUTION: Use Interface (Multiple Implementation) =====
public interface Animal {
    void eat();
}

public interface Pet {
    void play();
}

public class Dog implements Animal, Pet {  // ✅ OK
    @Override
    public void eat() { }
    
    @Override
    public void play() { }
}
```

### 1.3.5 The `instanceof` Operator

```java
public class Animal { }
public class Dog extends Animal { }
public class Cat extends Animal { }

public class TestInstanceOf {
    public static void main(String[] args) {
        Animal dog = new Dog();
        Animal cat = new Cat();
        Animal animal = new Animal();
        
        // Check runtime type
        System.out.println(dog instanceof Dog);      // true
        System.out.println(dog instanceof Animal);   // true (Dog IS-A Animal)
        System.out.println(dog instanceof Cat);      // false
        
        System.out.println(animal instanceof Dog);   // false (Animal IS NOT a Dog)
        
        // Pattern matching (Java 16+)
        if (dog instanceof Dog d) {  // Automatically cast to Dog
            System.out.println("It's a Dog!");
            d.bark();  // Can call Dog-specific method
        }
    }
}
```

---

## 1.4 Polymorphism - Tính Đa Hình

### 1.4.1 Compile-time Polymorphism: Method Overloading

#### **Parameter Matching Rules**

```java
public class StringUtility {
    // Exact match
    public String repeat(String text, int count) {
        return text.repeat(count);
    }
    
    // Param type: String → can match
    public String repeat(String text) {
        return repeat(text, 2);  // Gọi (String, int) version
    }
    
    // Param type: int → widening to long
    public long add(long a, long b) {
        return a + b;
    }
    
    // Param type: Integer → boxing to Object
    public String toString(Object obj) {
        return obj.toString();
    }
}

// Compiler resolution (static):
repeat("hello", 3);        // Exact match: (String, int)
repeat("hello");           // Match: (String)
add(5, 10);                // Widening: (int, int) → (long, long)
toString(5);               // Boxing: int → Integer → Object
```

**Widening Hierarchy (Automatic type promotion):**

```
byte → short → int → long → float → double
        ↑
       char
```

#### **Ambiguity Example**

```java
// ❌ AMBIGUOUS OVERLOAD
public void process(String s) { }
public void process(Object obj) { }

process(null);  // ❌ Compile error: ambiguous!
// null matches both String and Object

process("hello");  // ✅ OK: exact match to String
```

### 1.4.2 Runtime Polymorphism: Method Overriding

#### **Dynamic Method Dispatch**

```java
public class Animal {
    public void sound() {
        System.out.println("Some generic sound");
    }
}

public class Dog extends Animal {
    @Override
    public void sound() {
        System.out.println("Woof!");
    }
}

public class Cat extends Animal {
    @Override
    public void sound() {
        System.out.println("Meow!");
    }
}

// ===== RUNTIME POLYMORPHISM =====
public class Zoo {
    public static void makeAnimalSound(Animal animal) {
        animal.sound();  // ✅ Call dynamically based on ACTUAL type
    }
}

// Usage
Zoo.makeAnimalSound(new Dog());   // Output: Woof!
Zoo.makeAnimalSound(new Cat());   // Output: Meow!
Zoo.makeAnimalSound(new Animal()); // Output: Some generic sound
```

**How it works at runtime:**

```
JVM Virtual Method Table (VMT) for each class:
┌──────────────┐
│ Animal VMT   │
├──────────────┤
│ sound() ──→ Animal.sound  │
└──────────────┘

┌──────────────┐
│ Dog VMT      │
├──────────────┤
│ sound() ──→ Dog.sound  │
└──────────────┘

Khi gọi animal.sound():
1. Check actual runtime type
2. Lookup VMT của type đó
3. Execute method từ VMT
```

### 1.4.3 Liskov Substitution Principle (LSP)

**Định luật:** Subclass object phải có thể substitute superclass object mà không break program.

```java
// ✅ CORRECT LSP
public class Bird {
    public void fly() {
        System.out.println("Flying...");
    }
}

public class Eagle extends Bird {
    @Override
    public void fly() {
        System.out.println("Flying high!");
    }
}

public class Sparrow extends Bird {
    @Override
    public void fly() {
        System.out.println("Flying fast!");
    }
}

// Usage - Substitution works!
Bird bird = new Eagle();
bird.fly();  // Output: Flying high!

bird = new Sparrow();
bird.fly();  // Output: Flying fast!

// ❌ VIOLATING LSP
public class Penguin extends Bird {
    @Override
    public void fly() {
        throw new UnsupportedOperationException("Penguins cannot fly!");
    }
}

public class BirdKeeper {
    public void letBirdFly(Bird bird) {
        bird.fly();  // Expects all birds can fly!
    }
}

// Problem:
BirdKeeper.letBirdFly(new Penguin());  // ❌ Runtime exception!
// Penguin violates LSP - not all Birds can fly!

// ✅ CORRECT DESIGN
public class NonFlyingBird {
    public void walk() { }
}

public class Penguin extends NonFlyingBird {
    public void walk() {
        System.out.println("Waddling...");
    }
}
```

---

## 1.5 Abstraction - Ẩn Giấu Phức Tạp

### 1.5.1 Abstract Classes vs Interfaces

#### **Abstract Class: Shared Implementation + Contract**

```java
// ❌ WITHOUT Abstract Class (Code duplication)
public class Dog {
    public void eat() {
        System.out.println("Chewing...");
        System.out.println("Swallowing...");
    }
}

public class Cat {
    public void eat() {
        System.out.println("Chewing...");  // DUPLICATE!
        System.out.println("Swallowing...");  // DUPLICATE!
    }
}

// ✅ WITH Abstract Class (Shared implementation)
public abstract class Animal {
    // Concrete method - shared by all subclasses
    public final void eat() {
        chew();
        swallow();
    }
    
    // Abstract methods - subclass MUST implement
    protected abstract void chew();
    protected abstract void swallow();
}

public class Dog extends Animal {
    @Override
    protected void chew() {
        System.out.println("Dog: Chewing meat");
    }
    
    @Override
    protected void swallow() {
        System.out.println("Dog: Swallowing");
    }
}

public class Cat extends Animal {
    @Override
    protected void chew() {
        System.out.println("Cat: Chewing fish");
    }
    
    @Override
    protected void swallow() {
        System.out.println("Cat: Swallowing");
    }
}
```

#### **Interface: Contract Only (No Implementation)**

```java
// Before Java 8
public interface Drawable {
    void draw();  // No implementation
    void erase();
}

// Java 8+ supports default methods
public interface Drawable {
    // Abstract method
    void draw();
    
    // Default method (with implementation)
    default void erase() {
        System.out.println("Erasing...");
    }
    
    // Static method
    static String getVersion() {
        return "v1.0";
    }
}

// Multiple implementation
public class Square implements Drawable {
    @Override
    public void draw() {
        System.out.println("Drawing square");
    }
}
```

#### **Comparison Table**

```
┌──────────────────┬────────────────┬─────────────┐
│ Aspect           │ Abstract Class │ Interface   │
├──────────────────┼────────────────┼─────────────┤
│ Instantiate?     │ NO             │ NO          │
│ Instance vars?   │ YES (any)      │ NO (static) │
│ Method impl?     │ YES (optional) │ YES (Java8+)│
│ Constructor?     │ YES            │ NO          │
│ Multiple impl?   │ NO (single)    │ YES         │
│ extends/implements│ extends       │ implements  │
│ Access modifier? │ Any            │ public only │
│ Use case         │ "IS-A"         │ "CAN-DO"    │
└──────────────────┴────────────────┴─────────────┘
```

### 1.5.2 Template Method Pattern

```java
public abstract class ReportGenerator {
    // Template method (final - cannot override)
    public final String generate(Data data) {
        String header = generateHeader();
        String body = generateBody(data);     // ← Abstract (subclass implement)
        String footer = generateFooter();
        return header + "\n" + body + "\n" + footer;
    }
    
    private String generateHeader() {
        return "===== REPORT =====";
    }
    
    private String generateFooter() {
        return "===== END =====";
    }
    
    // Subclass must implement
    protected abstract String generateBody(Data data);
}

public class PDFReport extends ReportGenerator {
    @Override
    protected String generateBody(Data data) {
        return "PDF formatted body: " + data;
    }
}

public class HTMLReport extends ReportGenerator {
    @Override
    protected String generateBody(Data data) {
        return "<html><body>" + data + "</body></html>";
    }
}

// Usage
ReportGenerator pdf = new PDFReport();
System.out.println(pdf.generate(new Data("Sales")));

ReportGenerator html = new HTMLReport();
System.out.println(html.generate(new Data("Revenue")));
```

**Lợi ích:**
- Control flow ở parent (header → body → footer)
- Subclass chỉ cần implement specific part
- Tránh code duplication của common logic

---

## 1.6 Advanced Topics

### 1.6.1 The `this` Keyword

```java
public class Person {
    private String name;
    private int age;
    
    public Person(String name, int age) {
        this.name = name;  // this.name = instance variable
        this.age = age;     // name = parameter
    }
    
    // Return this để chain method calls
    public Person setName(String name) {
        this.name = name;
        return this;  // ← Return current object
    }
    
    public Person setAge(int age) {
        this.age = age;
        return this;
    }
    
    // Constructor calling another constructor
    public Person() {
        this("Unknown", 0);  // Call Person(String, int)
    }
}

// Method chaining
Person p = new Person()
    .setName("Alice")
    .setAge(25);  // Fluent interface
```

### 1.6.2 Static Members (Class-level, Not Instance-level)

```java
public class Config {
    // Static field - belongs to CLASS, not instance
    public static final int MAX_USERS = 1000;
    public static int currentUsers = 0;
    
    // Static method - can only access static members
    public static void incrementUsers() {
        currentUsers++;  // ✅ OK - static
        // System.out.println(this.name);  // ❌ ERROR - no 'this' in static
    }
    
    // Instance method - can access both
    public void displayConfig() {
        System.out.println("Max: " + MAX_USERS);      // ✅ OK
        System.out.println("Current: " + currentUsers);  // ✅ OK
    }
}

// Usage
Config.incrementUsers();  // Call static method
System.out.println(Config.currentUsers);  // Access static field
```

**Memory:**
```
┌─────────────────┐
│  CLASS AREA     │ (Loaded once when class is loaded)
├─────────────────┤
│ Config class    │
│ MAX_USERS = 1000│ ← Single copy
│ currentUsers = 0│ ← Shared by all instances
└─────────────────┘

┌─────────────────┐
│   HEAP          │ (New for each instance)
├─────────────────┤
│ Config@1        │
│ (instance fields)│ ← Own copy
│ Config@2        │
│ (instance fields)│ ← Own copy
└─────────────────┘
```

### 1.6.3 Final Keyword

```java
// ===== FINAL CLASS: Cannot extend =====
public final class ImmutableUser {
    // Không ai có thể tạo subclass
}

// public class Admin extends ImmutableUser { }  // ❌ ERROR

// ===== FINAL METHOD: Cannot override =====
public class Parent {
    public final void criticalOperation() {
        // Implementation không được change bởi subclass
    }
}

public class Child extends Parent {
    // @Override
    // public void criticalOperation() { }  // ❌ ERROR
}

// ===== FINAL VARIABLE: Cannot change =====
public class Constants {
    public static final double PI = 3.14159;
    private final String name;  // Must initialize in constructor
    
    public Constants(String name) {
        this.name = name;  // ✅ Can assign once
        // this.name = "other";  // ❌ ERROR: cannot reassign
    }
}

// Usage
System.out.println(Constants.PI);  // 3.14159
// Constants.PI = 3.14;  // ❌ ERROR
```

---

## 1.7 Memory & Performance

### 1.7.1 Object Creation Cost

```java
public class MemoryAnalysis {
    public static void main(String[] args) {
        // 1. Object allocation in heap
        long startMem = Runtime.getRuntime().totalMemory();
        
        // Create 1 million objects
        Object[] objects = new Object[1_000_000];
        for (int i = 0; i < objects.length; i++) {
            objects[i] = new Object();  // Each new → heap allocation
        }
        
        long endMem = Runtime.getRuntime().totalMemory();
        System.out.println("Memory used: " + (endMem - startMem) + " bytes");
        
        // 2. Object lifecycle
        Object obj = new Object();
        // obj.hashCode()  → accessible
        obj = null;  // ← Object unreachable
        System.gc();  // Trigger garbage collection
        // obj is now eligible for collection
    }
}
```

### 1.7.2 Null Reference

```java
public class NullPointerDemo {
    public static void main(String[] args) {
        String name = null;
        
        // ❌ NPE
        System.out.println(name.length());  // NullPointerException!
        
        // ✅ Check before use
        if (name != null) {
            System.out.println(name.length());
        }
        
        // ✅ Use Optional (Java 8+)
        Optional<String> optName = Optional.ofNullable(name);
        optName.ifPresent(n -> System.out.println(n.length()));
        
        // ✅ Provide default
        String displayName = name != null ? name : "Unknown";
    }
}
```

---

## 1.8 Comprehensive Exercises

### 1.8.1 Exercise: Bank Account System

**Requirements:**
```
1. Create BankAccount class with:
   - accountNumber (read-only)
   - accountHolder (mutable)
   - balance (read-only access, write via methods)
   - minimumBalance = 100 (constant)

2. Methods:
   - deposit(amount): Add money, validate > 0
   - withdraw(amount): Remove money, check balance > minimumBalance
   - transfer(toAccount, amount): Transfer to another account
   - getBalance(): Return current balance

3. Create SavingsAccount & CheckingAccount subclasses:
   - SavingsAccount: 5% interest on withdraw (if account age > 1 year)
   - CheckingAccount: Monthly fee = $5

4. Encapsulation:
   - Balance cannot be directly modified
   - accountNumber cannot be changed after creation

5. Test:
   - Create 3 accounts
   - Perform various operations
   - Test validation (e.g., withdraw > balance)
   - Test inheritance (polymorphism)
```

**Solution Skeleton:**
```java
public abstract class BankAccount {
    // Fields
    private final long accountNumber;  // read-only
    private String accountHolder;       // mutable
    private double balance;
    protected static final double MINIMUM_BALANCE = 100;
    
    // Constructor
    public BankAccount(long accountNumber, String accountHolder, double initialBalance) {
        // TODO: Validation & initialization
    }
    
    // Deposit
    public void deposit(double amount) {
        // TODO: Validate & add to balance
    }
    
    // Withdraw (abstract - subclass implement)
    public abstract void withdraw(double amount);
    
    // Transfer
    public void transfer(BankAccount toAccount, double amount) {
        // TODO: withdraw from this, deposit to toAccount
    }
    
    // Getters
    public long getAccountNumber() { return accountNumber; }
    public double getBalance() { return balance; }
    public String getAccountHolder() { return accountHolder; }
    
    // Setter
    public void setAccountHolder(String accountHolder) {
        // TODO: Validate & set
    }
}

public class SavingsAccount extends BankAccount {
    private LocalDateTime createdAt = LocalDateTime.now();
    private static final double INTEREST_RATE = 0.05;
    
    public SavingsAccount(long accountNumber, String accountHolder, double initialBalance) {
        super(accountNumber, accountHolder, initialBalance);
    }
    
    @Override
    public void withdraw(double amount) {
        // TODO: If account age > 1 year, add 5% interest
        // Then check balance & withdraw
    }
}

public class CheckingAccount extends BankAccount {
    private static final double MONTHLY_FEE = 5;
    
    public CheckingAccount(long accountNumber, String accountHolder, double initialBalance) {
        super(accountNumber, accountHolder, initialBalance);
    }
    
    @Override
    public void withdraw(double amount) {
        // TODO: Withdraw, then deduct $5 monthly fee
    }
}

// Test
public class BankTest {
    public static void main(String[] args) {
        // TODO: Create accounts, test operations
    }
}
```

### 1.8.2 Exercise: Vehicle Rental System

**Requirements:**
```
1. Abstract Vehicle class:
   - rentalRate (hourly cost)
   - rentalStartTime
   - Methods: startRental(), endRental(), calculateCost()

2. Concrete vehicles:
   - Car: Extra $2 for fuel
   - Motorcycle: 50% discount on rate
   - Truck: $5 base + $3 per hour

3. Encapsulation:
   - Rate cannot be negative
   - Cannot calculate cost before rental ends

4. Polymorphism:
   - Test with List<Vehicle> - each calculates cost differently

5. Test:
   - Rent different vehicles
   - Calculate costs
   - Compare polymorphic behavior
```

### 1.8.3 Exercise: Shape Hierarchy with Area Calculation

**Requirements:**
```
1. Abstract Shape class:
   - Calculatearea() (abstract)
   - getPerimeter() (optional)
   - setColor(), getColor()

2. Shapes: Circle, Rectangle, Triangle, Ellipse

3. Features:
   - Circle: Calculate area using π*r²
   - Rectangle: width × height
   - Triangle: Heron's formula
   - Ellipse: π*a*b

4. Encapsulation:
   - Dimensions must be > 0
   - Color has default = "Black"

5. Test:
   - Create shapes with validation
   - Store in List<Shape>
   - Print areas (polymorphism)
   - Calculate total area
```

---

## Summary Chương 1

**Learned:**
✅ Class = Blueprint, Object = Instance (mỗi instance separate memory)
✅ Encapsulation = ẩn internal state, control via getters/setters
✅ Inheritance = code reuse via extends (single inheritance)
✅ Polymorphism = same interface, different implementations
✅ Abstraction = hide complexity, expose essentials
✅ Advanced: super, final, static, this, instanceof

**Ready for:** Chương 2 - Collections Framework (Tầng 1)
