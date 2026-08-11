# Giáo Trình Java Toàn Diện — Từ Cơ Bản Đến Nâng Cao

## Phần Mở Đầu

### Giới Thiệu Về Giáo Trình

Giáo trình này được thiết kế để dạy Java từ con số không cho đến mức độ có thể xây dựng các ứng dụng production-ready. Với sự phân tầng rõ ràng, từ Java Core cơ bản đến các kỹ thuật nâng cao, bạn sẽ có một lộ trình học tập khoa học và hiệu quả.

### Mục Tiêu Giáo Trình

Sau khi hoàn thành giáo trình này, bạn sẽ:

- Hiểu rõ cú pháp Java và các khái niệm lập trình hướng đối tượng
- Nắm vững Java Collections, Generics, Lambda, Stream API
- Xây dựng REST API với Spring Boot
- Thiết kế database với JPA/Hibernate
- Triển khai authentication & authorization với Spring Security
- Sử dụng caching, messaging queue, Docker, Kubernetes
- Viết unit test và integration test
- Áp dụng design patterns và best practices production-ready
- Kiến trúc microservices và cloud-native applications

### Đối Tượng Độc Giả

- Sinh viên ngành CNTT / muốn chuyển sang Java
- Lập trình viên mới bắt đầu hoặc từ ngôn ngữ khác
- Những ai muốn nâng cao kỹ năng từ Java cơ bản đến advanced
- Người chuẩn bị cho các cuộc phỏng vấn technical

### Cách Sử Dụng Giáo Trình

1. **Đọc tuần tự từ Phần I đến Phần VI** — mỗi phần xây dựng trên kiến thức của phần trước
2. **Hoàn thành bài tập thực hành** trong từng chương
3. **Làm dự án mini** ở cuối mỗi phần để ứng dụng kiến thức
4. **Ôn tập bằng các bài test tự đánh giá**
5. **Tùy chọn**: Bỏ qua các phần/chương nếu bạn đã có kiến thức

### Cấu Trúc Chương Chuẩn

Mỗi chương trong giáo trình có cấu trúc sau:

```
Chương N: Tiêu đề Chương
├── Mục tiêu học tập
├── Kiến thức nền tảng
├── Nội dung chính (Bài 1, Bài 2, ...)
├── Ví dụ mã code
├── Bài tập thực hành
├── Câu hỏi tự đánh giá
└── Tài liệu tham khảo
```

---

## Phần I: Nền Tảng Java (4-5 Tuần)

**Mục tiêu**: Nắm vững cú pháp Java, khái niệm lập trình cơ bản, OOP, Collections, Exception Handling.

### Chương 1: Giới Thiệu Java & Môi Trường Phát Triển

#### Mục tiêu học tập
- Hiểu lịch sử và tại sao Java quan trọng
- Cài đặt JDK và IDE (IntelliJ IDEA / Visual Studio Code)
- Chạy chương trình Java đầu tiên
- Hiểu về JVM, Bytecode, Compiler

#### Bài học con
1. **Lịch sử Java & Tính Năng Chính**
   - Tại sao Java: WORA (Write Once, Run Anywhere)
   - Các phiên bản Java: Java 8, 11, 17, 21 (LTS)
   - Roadmap phát triển Java

2. **Môi Trường & Công Cụ Phát Triển**
   - Cài đặt JDK (Java Development Kit)
   - JRE vs JDK
   - IDE: IntelliJ IDEA, Eclipse, Visual Studio Code + Extension
   - Command line: javac, java, jshell

3. **Chương Trình Java Đầu Tiên**
   - Cấu trúc cơ bản của file `.java`
   - Phương thức `main()` — điểm vào chương trình
   - Package và import

4. **Cách Java Chạy**
   - Compile: `javac HelloWorld.java` → `HelloWorld.class` (Bytecode)
   - Execute: `java HelloWorld` → JVM chạy bytecode
   - JVM architecture: Class Loader, Execution Engine, Garbage Collector

#### Ví dụ mã code
```java
// HelloWorld.java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

#### Bài tập thực hành
1. Cài đặt JDK và IDE, chạy HelloWorld program
2. Tạo 3 file Java khác nhau, chạy từ command line
3. Khám phá các option của JVM: `java -version`, `java -help`

#### Dự án mini Phần I (sẽ hoàn thành sau Chương 5)
**Ứng dụng Quản Lý Sinh Viên (Console-based)**
- Nhập/Xuất thông tin sinh viên
- Tính điểm trung bình
- Sắp xếp sinh viên theo điểm
- Lưu/Đọc từ file

---

### Chương 2: Cú Pháp Java Cơ Bản

#### Mục tiêu học tập
- Các kiểu dữ liệu (primitive types)
- Khai báo biến, constant
- Toán tử (arithmetic, logical, comparison)
- Cấu trúc điều khiển (if/else, switch, loop)
- Method definition

#### Bài học con
1. **Kiểu Dữ Liệu Primitive**
   - Numeric: `byte`, `short`, `int`, `long`, `float`, `double`
   - Boolean: `boolean`
   - Character: `char`
   - Phạm vi và chứa năng của từng kiểu

2. **Biến & Constant**
   - Khai báo và khởi tạo biến
   - Naming convention: camelCase
   - `final` constant
   - Variable scope: local, method parameter, instance, class (static)

3. **Toán Tử**
   - Arithmetic: `+`, `-`, `*`, `/`, `%`
   - Assignment: `=`, `+=`, `-=`, etc.
   - Logical: `&&`, `||`, `!`
   - Comparison: `==`, `!=`, `<`, `>`, `<=`, `>=`
   - Ternary: `condition ? value1 : value2`

4. **Cấu Trúc Điều Khiển**
   - `if` / `else if` / `else`
   - `switch` statement
   - `for` loop (traditional, enhanced)
   - `while` / `do-while` loop
   - `break` / `continue` statement

5. **String & StringBuilder**
   - String immutability
   - String concatenation
   - Common methods: `length()`, `charAt()`, `substring()`, `toUpperCase()`, etc.
   - `StringBuilder` cho string mutable

6. **Method Definition**
   - Syntax: modifier, return type, method name, parameters, body
   - Return statement
   - Method overloading

#### Ví dụ mã code
```java
public class Calculator {
    // Constant
    private static final double PI = 3.14159;
    
    // Method
    public static int add(int a, int b) {
        return a + b;
    }
    
    // Overloading
    public static double add(double a, double b) {
        return a + b;
    }
    
    public static void main(String[] args) {
        int x = 10;
        int y = 20;
        
        // if-else
        if (x > y) {
            System.out.println("x lớn hơn y");
        } else {
            System.out.println("y lớn hơn x");
        }
        
        // loop
        for (int i = 0; i < 5; i++) {
            System.out.println(i);
        }
        
        // String
        String name = "Java";
        System.out.println("Hello, " + name);
    }
}
```

#### Bài tập thực hành
1. Viết chương trình tính diện tích, chu vi hình chữ nhật
2. Viết chương trình kiểm tra số nguyên tố
3. Viết chương trình in bảng cửu chương
4. Viết chương trình đảo chuỗi
5. Viết chương trình tìm số lớn nhất trong mảng

---

### Chương 3: Object-Oriented Programming (OOP) Cơ Bản

#### Mục tiêu học tập
- Hiểu class, object, attributes, methods
- Encapsulation với private/public
- Getters & Setters
- Inheritance & Polymorphism
- Abstract class & Interface

#### Bài học con
1. **Class & Object**
   - Định nghĩa class
   - Tạo instance (object)
   - Constructor — khởi tạo object
   - `this` keyword

2. **Encapsulation**
   - Access modifiers: `private`, `public`, `protected`, package-private
   - Getter (accessor) methods
   - Setter (mutator) methods
   - Validation trong setter

3. **Static Members**
   - `static` variable — chia sẻ giữa tất cả instance
   - `static` method — không cần instance để gọi
   - `static` block — khởi tạo khi class load

4. **Inheritance (Kế Thừa)**
   - Superclass & Subclass
   - `extends` keyword
   - `super()` — gọi parent constructor
   - Method overriding
   - `@Override` annotation

5. **Polymorphism (Đa Hình)**
   - Compile-time: method overloading
   - Runtime: method overriding
   - Upcasting & Downcasting
   - instanceof operator

6. **Abstract Class**
   - `abstract` keyword
   - Abstract method (không có implementation)
   - Không thể instantiate abstract class
   - Subclass phải implement abstract method

7. **Interface**
   - `interface` — hợp đồng (contract)
   - Implement interface
   - Multiple implementation
   - Default methods (Java 8+)
   - Static interface method

#### Ví dụ mã code
```java
// Superclass
public abstract class Animal {
    private String name;
    
    public Animal(String name) {
        this.name = name;
    }
    
    public String getName() {
        return name;
    }
    
    public abstract void sound();  // Abstract method
}

// Subclass
public class Dog extends Animal {
    private String breed;
    
    public Dog(String name, String breed) {
        super(name);  // Call parent constructor
        this.breed = breed;
    }
    
    @Override
    public void sound() {
        System.out.println("Woof!");
    }
    
    public String getBreed() {
        return breed;
    }
}

// Interface
public interface Drawable {
    void draw();
}

// Implement interface
public class Circle implements Drawable {
    @Override
    public void draw() {
        System.out.println("Drawing circle");
    }
}

// Usage
public class Main {
    public static void main(String[] args) {
        Animal dog = new Dog("Buddy", "Golden");
        dog.sound();  // Polymorphism: runtime binding
        
        System.out.println(dog.getName());
    }
}
```

#### Bài tập thực hành
1. Thiết kế class `Person` với encapsulation, tạo 2 subclass `Student`, `Teacher`
2. Viết `interface Shape` với method `getArea()`, implement bằng `Circle`, `Rectangle`
3. Tạo class hierarchy cho các loại xe: `Vehicle` → `Car`, `Motorcycle`
4. Viết chương trình nhân viên với `Employee` superclass, `Manager`, `Developer` subclass

---

### Chương 4: Java Collections Framework

#### Mục tiêu học tập
- Hiểu các cấu trúc dữ liệu: List, Set, Map, Queue
- Chọn collection phù hợp cho bài toán
- Iterate qua collection
- Sorting & Searching

#### Bài học con
1. **Collection Hierarchy**
   - Collection interface
   - List, Set, Map — các interface chính

2. **List (Danh Sách)**
   - `ArrayList` — dynamic array
   - `LinkedList` — doubly-linked list
   - `Vector` — legacy, synchronized (ít dùng)
   - Common methods: `add()`, `remove()`, `get()`, `size()`, `contains()`

3. **Set (Tập Hợp)**
   - `HashSet` — unordered, O(1) lookup
   - `TreeSet` — sorted, O(log n) lookup
   - `LinkedHashSet` — insertion order maintained
   - Properties: unique elements, no index

4. **Map (Từ Điển)**
   - `HashMap` — unordered key-value
   - `TreeMap` — sorted by key
   - `LinkedHashMap` — insertion order
   - Common methods: `put()`, `get()`, `remove()`, `keySet()`, `values()`, `entrySet()`

5. **Queue (Hàng Đợi)**
   - FIFO (First In First Out)
   - `Queue` interface, `PriorityQueue`, `Deque`
   - Methods: `offer()`, `poll()`, `peek()`

6. **Iteration**
   - `for-each` loop (enhanced for)
   - `Iterator` interface
   - `ListIterator`
   - Fail-fast behavior

7. **Comparator & Comparable**
   - `Comparable` interface — tự định nghĩa thứ tự
   - `Comparator` interface — tách biệt logic so sánh
   - `Collections.sort()`
   - Custom sorting

#### Ví dụ mã code
```java
import java.util.*;

public class CollectionsExample {
    public static void main(String[] args) {
        // List
        List<String> fruits = new ArrayList<>();
        fruits.add("Apple");
        fruits.add("Banana");
        fruits.add("Cherry");
        
        for (String fruit : fruits) {
            System.out.println(fruit);
        }
        
        // Set
        Set<Integer> uniqueNumbers = new HashSet<>();
        uniqueNumbers.add(10);
        uniqueNumbers.add(20);
        uniqueNumbers.add(10);  // Duplicate, ignored
        System.out.println(uniqueNumbers);  // [10, 20]
        
        // Map
        Map<String, Integer> ageMap = new HashMap<>();
        ageMap.put("Alice", 25);
        ageMap.put("Bob", 30);
        
        for (Map.Entry<String, Integer> entry : ageMap.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
        
        // Sorting
        List<Integer> numbers = Arrays.asList(3, 1, 4, 1, 5, 9);
        Collections.sort(numbers);
        System.out.println(numbers);
    }
}
```

#### Bài tập thực hành
1. Viết chương trình quản lý danh sách sinh viên, thêm/xóa/tìm kiếm
2. Tạo `Set<String>` từ danh sách từ, loại bỏ duplicate
3. Viết chương trình tìm từ xuất hiện nhiều nhất trong 1 file text (dùng `Map`)
4. Sắp xếp danh sách nhân viên theo lương (custom `Comparator`)

---

### Chương 5: Exception Handling & Debugging

#### Mục tiêu học tập
- Hiểu Exception hierarchy
- Try-catch-finally block
- Custom exceptions
- Exception best practices
- Debugging techniques

#### Bài học con
1. **Exception Hierarchy**
   - `Throwable` → `Exception` (checked) & `Error`
   - Checked exception vs Unchecked (Runtime) exception
   - Common exceptions: `NullPointerException`, `IndexOutOfBoundsException`, `IOException`, `SQLException`

2. **Try-Catch-Finally**
   - Cú pháp basic
   - Multiple catch blocks
   - Finally block — luôn chạy
   - Finally vs Return

3. **Try-with-resources**
   - Auto-close resources (AutoCloseable)
   - Thay thế try-finally khi làm việc với file, stream

4. **Throw & Throws**
   - `throw` — ném exception
   - `throws` — khai báo method có thể ném exception
   - Method signature

5. **Custom Exception**
   - Extend `Exception` (checked) hoặc `RuntimeException` (unchecked)
   - Tạo meaningful exception classes
   - Exception message

6. **Exception Best Practices**
   - Specific exception catching
   - Don't swallow exception
   - Log exception
   - Fail-fast principle

7. **Debugging**
   - Using IDE debugger: breakpoint, step over, step into
   - Watch variables
   - Conditional breakpoints
   - Stack trace analysis

#### Ví dụ mã code
```java
public class ExceptionExample {
    
    // Custom exception
    public static class InsufficientFundsException extends Exception {
        public InsufficientFundsException(String message) {
            super(message);
        }
    }
    
    // Method throws checked exception
    public static void withdraw(double balance, double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException("Insufficient funds: " + balance);
        }
        System.out.println("Withdrawal successful: " + amount);
    }
    
    public static void main(String[] args) {
        try {
            withdraw(100, 150);
        } catch (InsufficientFundsException e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
        } finally {
            System.out.println("Transaction completed");
        }
        
        // Try-with-resources
        try (Scanner scanner = new Scanner(System.in)) {
            System.out.println("Enter something:");
            String input = scanner.nextLine();
            System.out.println("You entered: " + input);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}
```

#### Bài tập thực hành
1. Viết chương trình chia số có xử lý `ArithmeticException`
2. Tạo custom exception `InvalidAgeException`, sử dụng trong class `Person`
3. Viết chương trình đọc file, xử lý `FileNotFoundException`, `IOException`
4. Debug chương trình có bug bằng IDE debugger

---

### Dự Án Mini Phần I: Ứng Dụng Quản Lý Sinh Viên (Console-based)

**Yêu cầu:**
- Tạo class `Student` với các attribute: `id`, `name`, `age`, `gpa`
- Tạo class `StudentManager` để quản lý danh sách sinh viên
- Chức năng:
  - Thêm sinh viên
  - Xóa sinh viên theo ID
  - Tìm sinh viên theo tên
  - Hiển thị danh sách sinh viên
  - Tính điểm trung bình của lớp
  - Sắp xếp sinh viên theo GPA (cao → thấp)
  - Lưu/tải danh sách sinh viên từ file (optional: CSV hoặc JSON)
- Menu tương tác (console)

**Đánh giá:**
- Code structure rõ ràng (encapsulation, proper naming)
- Xử lý exception hợp lý
- Có bài tập thực hành

---

## Phần II: Java Core Nâng Cao (3-4 Tuần)

**Mục tiêu**: Mastery các tính năng advanced của Java như Generics, Lambda, Stream API, Concurrency.

### Chương 6: Generics & Type Erasure

#### Mục tiêu học tập
- Hiểu generics & type parameters
- Bounded type parameters
- Wildcard types
- Generic methods & classes
- Type erasure

#### Bài học con
1. **Generic Classes & Interfaces**
   - Generic type parameter `<T>`
   - Multiple type parameters `<K, V>`
   - Creating instances

2. **Bounded Type Parameters**
   - `<T extends Comparable<T>>`
   - Upper bound
   - Lower bound (wildcard `super`)

3. **Generic Methods**
   - Syntax & usage
   - Return generic type

4. **Wildcards**
   - `<?>` — unknown type
   - `<? extends Type>` — upper bound wildcard
   - `<? super Type>` — lower bound wildcard
   - PECS principle: Producer Extends, Consumer Super

5. **Type Erasure**
   - Generics được erase tại compile time
   - Implication: `List<String>` == `List<Integer>` at runtime
   - Cannot create `new T()` directly
   - Type safety at compile time only

#### Ví dụ mã code
```java
// Generic class
public class Box<T> {
    private T content;
    
    public void put(T item) {
        this.content = item;
    }
    
    public T get() {
        return content;
    }
}

// Bounded type parameter
public class ComparableBox<T extends Comparable<T>> {
    private T item;
    
    public boolean isGreater(T other) {
        return item.compareTo(other) > 0;
    }
}

// Generic method
public class Utility {
    public static <T> void printArray(T[] array) {
        for (T item : array) {
            System.out.println(item);
        }
    }
    
    public static <T extends Comparable<T>> T max(T a, T b) {
        return a.compareTo(b) > 0 ? a : b;
    }
}

// Usage with wildcards
public class WildcardExample {
    public static void printNumbers(List<? extends Number> numbers) {
        for (Number num : numbers) {
            System.out.println(num);
        }
    }
}
```

#### Bài tập thực hành
1. Tạo generic class `Stack<T>` với methods `push()`, `pop()`, `peek()`
2. Viết generic method `findMax()` cho array
3. Làm việc với wildcard type

---

### Chương 7: Lambda Expressions & Functional Programming

#### Mục tiêu học tập
- Cú pháp Lambda
- Functional interfaces
- Method references
- Functional programming concepts

#### Bài học con
1. **Lambda Expression Syntax**
   - Cú pháp: `(parameters) -> { body }`
   - Single expression vs block body
   - Type inference

2. **Functional Interfaces**
   - Interface với 1 abstract method duy nhất
   - `@FunctionalInterface` annotation
   - Common built-in: `Supplier<T>`, `Consumer<T>`, `Function<T, R>`, `Predicate<T>`

3. **Method References**
   - Static method: `ClassName::staticMethod`
   - Instance method: `object::instanceMethod`
   - Constructor reference: `ClassName::new`
   - Array constructor: `int[]::new`

4. **Functional Programming Concepts**
   - Higher-order functions
   - Immutability
   - Function composition

#### Ví dụ mã code
```java
import java.util.function.*;

public class LambdaExample {
    public static void main(String[] args) {
        // Lambda with Predicate
        Predicate<Integer> isPositive = n -> n > 0;
        System.out.println(isPositive.test(5));  // true
        
        // Lambda with Function
        Function<String, Integer> stringLength = s -> s.length();
        System.out.println(stringLength.apply("Hello"));  // 5
        
        // Lambda with Consumer
        Consumer<String> printWithPrefix = s -> System.out.println(">> " + s);
        printWithPrefix.accept("Hello");
        
        // Method reference
        List<String> words = Arrays.asList("Java", "Lambda", "Stream");
        words.forEach(System.out::println);
        
        // Constructor reference
        Function<String, StringBuilder> sbBuilder = StringBuilder::new;
        StringBuilder sb = sbBuilder.apply("Hello");
    }
}
```

#### Bài tập thực hành
1. Sử dụng lambda để lọc số lẻ từ danh sách
2. Viết custom functional interface cho phép cộng 2 số
3. Dùng method reference để sort danh sách

---

### Chương 8: Stream API

#### Mục tiêu học tập
- Stream operations: filter, map, reduce
- Terminal vs Intermediate operations
- Parallel streams
- Performance considerations

#### Bài học con
1. **Stream Basics**
   - Stream — sequence of elements
   - Pipelines: source → intermediate → terminal
   - Lazy evaluation

2. **Intermediate Operations**
   - `filter(Predicate)` — lọc
   - `map(Function)` — transform
   - `flatMap()` — flatten
   - `distinct()` — loại duplicate
   - `sorted()` — sắp xếp
   - `limit()`, `skip()` — paging

3. **Terminal Operations**
   - `forEach()` — iterate
   - `collect()` — collect to collection
   - `reduce()` — combine to single value
   - `count()`, `min()`, `max()` — aggregation
   - `anyMatch()`, `allMatch()`, `noneMatch()` — boolean query
   - `findFirst()`, `findAny()`

4. **Collectors**
   - `Collectors.toList()`, `toSet()`, `toMap()`
   - `Collectors.groupingBy()` — group by key
   - `Collectors.partitioningBy()` — partition by boolean
   - `Collectors.joining()` — string concatenation

5. **Parallel Streams**
   - `parallelStream()` — multi-threaded processing
   - Trade-off: overhead vs processing time
   - Not suitable for sequential/order-dependent operations

#### Ví dụ mã code
```java
import java.util.*;
import java.util.stream.*;

public class StreamExample {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        
        // Filter + Map + Collect
        List<Integer> result = numbers.stream()
            .filter(n -> n % 2 == 0)  // intermediate
            .map(n -> n * n)  // intermediate
            .collect(Collectors.toList());  // terminal
        System.out.println(result);  // [4, 16, 36, 64, 100]
        
        // Reduce
        int sum = numbers.stream()
            .reduce(0, (a, b) -> a + b);  // terminal
        System.out.println(sum);  // 55
        
        // GroupingBy
        Map<Integer, List<String>> byLength = Arrays.asList("Java", "Python", "Go", "Rust")
            .stream()
            .collect(Collectors.groupingBy(String::length));
        System.out.println(byLength);
        
        // Parallel Stream
        long count = numbers.parallelStream()
            .filter(n -> n > 5)
            .count();
    }
}
```

#### Bài tập thực hành
1. Lọc danh sách số chẵn, bình phương chúng, tính tổng
2. Nhóm sinh viên theo GPA range
3. Tạo Map từ danh sách đối tượng bằng `toMap()`

---

### Chương 9: I/O & File Handling

#### Mục tiêu học tập
- Byte stream vs Character stream
- File I/O operations
- Serialization & Deserialization
- NIO (New I/O)

#### Bài học con
1. **Stream Classes**
   - `InputStream` / `OutputStream` — byte stream
   - `Reader` / `Writer` — character stream
   - Decorator pattern: `BufferedReader`, `BufferedWriter`

2. **File Operations**
   - `FileInputStream`, `FileOutputStream`
   - `FileReader`, `FileWriter`
   - Reading line by line: `BufferedReader.readLine()`

3. **Java NIO (New I/O)**
   - `Files` utility class — modern approach
   - `Path`, `Paths`
   - `Files.read()`, `Files.write()`, `Files.readAllLines()`
   - Directory walking: `Files.walk()`

4. **Serialization**
   - `Serializable` interface
   - `ObjectInputStream`, `ObjectOutputStream`
   - `serialVersionUID`
   - Transient fields

5. **Best Practices**
   - Always close streams (use try-with-resources)
   - Handle exceptions
   - Use buffering for efficiency

#### Ví dụ mã code
```java
import java.io.*;
import java.nio.file.*;
import java.util.*;

public class FileIOExample {
    public static void main(String[] args) throws IOException {
        // Modern approach: NIO Files
        String filePath = "data.txt";
        
        // Write
        Files.write(Paths.get(filePath), 
            "Hello World!\nLine 2".getBytes());
        
        // Read all lines
        List<String> lines = Files.readAllLines(Paths.get(filePath));
        lines.forEach(System.out::println);
        
        // Append
        Files.write(Paths.get(filePath), 
            "\nLine 3".getBytes(), 
            StandardOpenOption.APPEND);
        
        // Traditional approach: BufferedReader
        try (BufferedReader reader = new BufferedReader(
                new FileReader(filePath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        }
    }
}

// Serialization
public class User implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private String name;
    private int age;
    transient private String password;  // Not serialized
    
    // Constructor, getters, setters
}

public class SerializationExample {
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        User user = new User("John", 30);
        
        // Serialize
        try (ObjectOutputStream oos = new ObjectOutputStream(
                new FileOutputStream("user.dat"))) {
            oos.writeObject(user);
        }
        
        // Deserialize
        try (ObjectInputStream ois = new ObjectInputStream(
                new FileInputStream("user.dat"))) {
            User loaded = (User) ois.readObject();
            System.out.println(loaded.getName());
        }
    }
}
```

#### Bài tập thực hành
1. Viết chương trình đọc file CSV, lưu dữ liệu vào collection
2. Tạo chương trình backup file
3. Thực hiện serialization/deserialization của object

---

### Chương 10: Concurrency & Multithreading

#### Mục tiêu học tập
- Thread lifecycle
- Synchronization & Race condition
- Thread pool & Executor framework
- Concurrent collections

#### Bài học con
1. **Thread Basics**
   - Implement `Runnable` (preferred)
   - Extend `Thread` class (not recommended)
   - `Thread.start()` vs `run()`
   - Thread lifecycle: NEW → RUNNABLE → RUNNING → TERMINATED

2. **Synchronization**
   - Shared state & race condition
   - `synchronized` keyword
   - Lock — monitor
   - Volatile keyword

3. **Thread Communication**
   - `wait()`, `notify()`, `notifyAll()`
   - Producer-Consumer pattern

4. **Executor Framework**
   - `ExecutorService` — manage thread pool
   - `Executors` factory
   - `Callable<T>` — return result
   - `Future<T>` — get result later

5. **Concurrent Collections**
   - `ConcurrentHashMap`, `Collections.synchronizedMap()`
   - `CopyOnWriteArrayList`
   - Thread-safe vs synchronized

6. **High-level Synchronization**
   - `ReentrantLock`
   - `CountDownLatch`, `CyclicBarrier`, `Semaphore`
   - `BlockingQueue`

#### Ví dụ mã code
```java
import java.util.concurrent.*;

// Runnable implementation
public class MyTask implements Runnable {
    private String name;
    
    public MyTask(String name) {
        this.name = name;
    }
    
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(name + ": " + i);
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
}

// Synchronized method
public class Counter {
    private int count = 0;
    
    public synchronized void increment() {
        count++;
    }
    
    public synchronized int getCount() {
        return count;
    }
}

// Executor example
public class ExecutorExample {
    public static void main(String[] args) {
        ExecutorService executor = Executors.newFixedThreadPool(2);
        
        for (int i = 0; i < 5; i++) {
            executor.execute(new MyTask("Task-" + i));
        }
        
        executor.shutdown();
        
        try {
            if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
        }
    }
}

// Callable with Future
public class CallableExample {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(1);
        
        Callable<Integer> task = () -> {
            Thread.sleep(2000);
            return 42;
        };
        
        Future<Integer> future = executor.submit(task);
        
        // Wait for result
        int result = future.get();
        System.out.println("Result: " + result);
        
        executor.shutdown();
    }
}
```

#### Bài tập thực hành
1. Tạo chương trình multi-thread đơn giản
2. Giải quyết race condition bằng synchronized
3. Viết Producer-Consumer pattern
4. Sử dụng ExecutorService cho task pool

---

### Dự Án Mini Phần II: Ứng Dụng Xử Lý Batch File (Multi-threaded)

**Yêu cầu:**
- Đọc danh sách file từ 1 thư mục
- Xử lý mỗi file (ví dụ: đếm từ, format JSON, etc.) trong separate thread
- Sử dụng thread pool (FixedThreadPool)
- Aggregate kết quả từ tất cả file
- Báo cáo tiến độ xử lý
- Xử lý exception gracefully

---

## Phần III: Lập Trình Web với Java (3-4 Tuần)

**Mục tiêu**: Hiểu HTTP, servlet, web framework, database integration.

### Chương 11: HTTP & Web Concepts

#### Mục tiêu học tập
- HTTP protocol basics
- Request/Response model
- Stateless nature, cookies, sessions
- URL structure

#### Bài học con
1. **HTTP Method**
   - GET — retrieve resource
   - POST — create resource
   - PUT — update resource
   - DELETE — delete resource
   - PATCH — partial update

2. **HTTP Status Code**
   - 1xx: Information
   - 2xx: Success (200, 201, 204)
   - 3xx: Redirection (301, 302, 304)
   - 4xx: Client error (400, 401, 403, 404)
   - 5xx: Server error (500, 502, 503)

3. **Headers & Body**
   - Common headers: Content-Type, Authorization, Accept
   - Request/Response body

4. **Sessions & Cookies**
   - Stateless HTTP
   - Cookies — client-side storage
   - Sessions — server-side storage
   - Session ID in cookie

---

### Chương 12: Servlet & Introduction to Spring

#### Mục tiêu học tập
- Servlet lifecycle
- HttpServlet
- Request/Response handling
- Servlet mapping
- Introduction to Spring Web MVC

#### Bài học con
1. **Servlet Basics**
   - Implement `HttpServlet`
   - Override `doGet()`, `doPost()`, etc.
   - Servlet lifecycle: init → service → destroy

2. **Request & Response**
   - `HttpServletRequest` — get parameters, headers
   - `HttpServletResponse` — set status, headers, write response

3. **Servlet Mapping**
   - URL patterns
   - Web.xml configuration (legacy)

4. **Introduction to Spring Framework**
   - Dependency Injection
   - IoC Container
   - Spring Web MVC

#### Ví dụ mã code
```java
import javax.servlet.*;
import javax.servlet.http.*;

public class HelloServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, 
                        HttpServletResponse response) 
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        
        String name = request.getParameter("name");
        
        PrintWriter out = response.getWriter();
        out.println("<h1>Hello, " + (name != null ? name : "World") + "</h1>");
    }
    
    @Override
    protected void doPost(HttpServletRequest request, 
                         HttpServletResponse response) 
            throws ServletException, IOException {
        // Process form data
        String username = request.getParameter("username");
        String password = request.getParameter("password");
        
        // Validate and process
    }
}
```

---

### Chương 13: Spring Web MVC

#### Mục tiêu học tập
- Spring MVC architecture: Model, View, Controller
- DispatcherServlet
- Controllers & RequestMapping
- View resolution
- Form binding & validation

#### Bài học con
1. **MVC Architecture**
   - Model — data
   - View — presentation
   - Controller — logic

2. **DispatcherServlet**
   - Front controller pattern
   - Request flow

3. **Controller**
   - `@Controller` annotation
   - `@RequestMapping` untuk route
   - Handler method
   - Return types: ModelAndView, String (view name), Model

4. **Request Parameter Binding**
   - `@RequestParam` — query/form parameter
   - `@PathVariable` — URL variable
   - `@RequestBody` — JSON body
   - `@RequestHeader` — HTTP header

5. **Model & View**
   - `Model` — add attributes
   - View resolution
   - Returning redirect

#### Ví dụ mã code
```java
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.ui.Model;

@Controller
@RequestMapping("/users")
public class UserController {
    
    @GetMapping
    public String listUsers(Model model) {
        // Add users to model
        model.addAttribute("users", userService.findAll());
        return "users/list";  // View name: users/list.html
    }
    
    @GetMapping("/{id}")
    public String getUser(@PathVariable Long id, Model model) {
        model.addAttribute("user", userService.findById(id));
        return "users/detail";
    }
    
    @PostMapping
    public String createUser(@RequestParam String name, 
                           @RequestParam String email) {
        userService.create(name, email);
        return "redirect:/users";
    }
}
```

---

### Chương 14: Spring Data JPA & Database

#### Mục tiêu học tập
- Relational database concepts
- ORM (Object-Relational Mapping)
- JPA & Hibernate
- Entity lifecycle
- Query optimization

#### Bài học con
1. **Database Basics**
   - Tables, columns, relationships
   - Primary key, foreign key
   - CRUD operations

2. **JPA (Java Persistence API)**
   - Specification for ORM
   - `EntityManager`, `EntityManagerFactory`
   - Hibernate — most popular implementation

3. **Entity Classes**
   - `@Entity` — map to table
   - `@Id` — primary key
   - `@Column` — map to column
   - `@Relationship` — map relationships (OneToMany, ManyToOne, etc.)

4. **Spring Data JPA**
   - `JpaRepository` interface
   - CRUD methods built-in
   - Pagination & Sorting
   - Custom query methods with query derivation

5. **Relationships**
   - OneToMany, ManyToOne
   - ManyToMany
   - Cascade operations
   - Lazy vs Eager loading

6. **Query Optimization**
   - N+1 query problem
   - Eager loading
   - Query projection
   - Fetch joins

#### Ví dụ mã code
```java
import javax.persistence.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

// Entity
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    // Getters & Setters
}

// Repository
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    
    List<User> findByNameContaining(String name);
    
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findUserByEmail(@Param("email") String email);
}

// Service
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
```

---

### Dự Án Mini Phần III: Web Application — Quản Lý Blog (Servlet + Spring MVC)

**Yêu cầu:**
- Model: `Post` entity (title, content, author, createdAt)
- Database: MySQL/PostgreSQL
- Features:
  - List all posts
  - View post detail
  - Create new post (form)
  - Update post
  - Delete post
- Use Spring MVC + Spring Data JPA
- HTML views (basic template)

---

## Phần IV: Spring Boot Framework (4-5 Tuần)

**Mục tiêu**: Build production-ready REST API với Spring Boot.

### Chương 15: Spring Boot Basics

#### Mục tiêu học tập
- Spring Boot philosophy & benefits
- Auto-configuration
- Embedded server
- Application properties
- Starter dependencies

#### Bài học con
1. **Spring Boot vs Spring Framework**
   - Opinionated defaults
   - Convention over configuration
   - Simplified setup

2. **Starter Dependencies**
   - `spring-boot-starter-web`
   - `spring-boot-starter-data-jpa`
   - `spring-boot-starter-security`
   - `spring-boot-starter-test`

3. **Application Configuration**
   - `application.properties` vs `application.yml`
   - Profiles: dev, staging, prod
   - Environment variables
   - ConfigurationProperties

4. **Embedded Server**
   - Tomcat, Netty, Undertow
   - Port configuration
   - Auto-restart development tools

#### Ví dụ mã code
```yaml
# application.yml
spring:
  application:
    name: my-app
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: secret
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
  server:
    port: 8080
```

---

### Chương 16: REST API Design with Spring Boot

#### Mục tiêu học tập
- REST principles (Representational State Transfer)
- Resource-oriented design
- Proper HTTP semantics
- Response format (JSON)

#### Bài học con
1. **REST Principles**
   - Client-Server
   - Stateless
   - Cacheable
   - Uniform Interface
   - Layered System

2. **Resource-Oriented Design**
   - URL structure: `/api/resources` (plural)
   - HTTP methods map to CRUD
   - Path variables for IDs

3. **HTTP Status Codes**
   - 200 OK — GET, PUT
   - 201 Created — POST (with Location header)
   - 204 No Content — DELETE
   - 400 Bad Request — validation error
   - 401 Unauthorized — auth required
   - 403 Forbidden — no permission
   - 404 Not Found
   - 409 Conflict — resource state conflict
   - 500 Internal Server Error

4. **Response Format**
   - JSON standard
   - Consistent structure
   - Include metadata (timestamp, status)

#### Ví dụ mã code
```java
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    
    @GetMapping
    public ResponseEntity<List<ProductDto>> getAll() {
        return ResponseEntity.ok(productService.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.findById(id));
    }
    
    @PostMapping
    public ResponseEntity<ProductDto> create(@Valid @RequestBody CreateProductRequest request) {
        ProductDto created = productService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

### Chương 17: Request Validation & Exception Handling

#### Mục tiêu học tập
- Input validation with Bean Validation
- Exception handling with @RestControllerAdvice
- Error response format
- HTTP status mapping

#### Bài học con
1. **Bean Validation**
   - Annotations: @NotNull, @NotBlank, @Size, @Min, @Max, @Email, @Pattern
   - @Valid on @RequestBody
   - @Validated on controller class

2. **Custom Validators**
   - Creating custom annotation
   - Implementing ConstraintValidator

3. **Exception Handling**
   - @RestControllerAdvice
   - @ExceptionHandler
   - Handling multiple exception types
   - Logging

4. **Error Response**
   - Consistent error format
   - Error codes
   - Field-level validation errors

#### Ví dụ mã code
```java
// DTO with validation
public record CreateProductRequest(
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 200)
    String name,
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    BigDecimal price,
    
    @Email(message = "Invalid email")
    String vendorEmail
) {}

// Controller
@RestController
@RequestMapping("/api/products")
@Validated
public class ProductController {
    @PostMapping
    public ResponseEntity<ProductDto> create(
            @Valid @RequestBody CreateProductRequest request) {
        // Validation automatically triggered
    }
}

// Global exception handler
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage(), LocalDateTime.now()));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors()
            .stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse("VALIDATION_ERROR", errors, LocalDateTime.now()));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("INTERNAL_ERROR", "Internal server error", LocalDateTime.now()));
    }
}

public record ErrorResponse(
    String code,
    String message,
    LocalDateTime timestamp
) {}
```

---

### Chương 18: Spring Security & Authentication

#### Mục tiêu học tập
- Authentication vs Authorization
- JWT (JSON Web Token)
- Spring Security configuration
- Secured endpoints

#### Bài học con
1. **Authentication Basics**
   - User credentials
   - Password encoding (BCrypt)
   - Session vs Token-based

2. **JWT (JSON Web Token)**
   - Structure: Header.Payload.Signature
   - Claims
   - Expiration
   - Refresh token

3. **Spring Security Configuration**
   - SecurityFilterChain
   - CORS configuration
   - CSRF protection
   - Authorization rules

4. **JWT Filter**
   - OncePerRequestFilter
   - Extract token from header
   - Validate & decode
   - Store in SecurityContext

#### Ví dụ mã code
```java
// JWT Token Provider
@Component
@Slf4j
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private long jwtExpirationMs;
    
    public String generateToken(String username) {
        return Jwts.builder()
            .setSubject(username)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
    
    public String getUsernameFromToken(String token) {
        return Jwts.parser()
            .setSigningKey(jwtSecret)
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            log.error("JWT validation error: {}", e.getMessage());
        }
        return false;
    }
}

// JWT Filter
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {
    
    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String token = extractTokenFromRequest(request);
            
            if (token != null && tokenProvider.validateToken(token)) {
                String username = tokenProvider.getUsernameFromToken(token);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}

// Security Configuration
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthFilter jwtAuthFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

// Auth Controller
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        String token = authService.authenticate(request.username(), request.password());
        return ResponseEntity.ok(new LoginResponse(token));
    }
}
```

---

### Chương 19: Caching with Redis

#### Mục tiêu học tập
- Cache patterns
- Redis basics
- Spring Cache abstraction
- Cache invalidation strategies

#### Bài học con
1. **Caching Concepts**
   - Cache-aside pattern
   - Write-through pattern
   - Write-behind pattern

2. **Redis**
   - In-memory data store
   - Key-value structure
   - TTL (Time To Live)
   - Data types: String, List, Set, Hash, Sorted Set

3. **Spring Cache**
   - `@EnableCaching`
   - `@Cacheable` — cache result
   - `@CacheEvict` — remove from cache
   - `@CachePut` — update cache
   - Cache names & keys

#### Ví dụ mã code
```yaml
# application.yml
spring:
  data:
    redis:
      host: localhost
      port: 6379
  cache:
    type: redis
    redis:
      time-to-live: 3600000  # 1 hour
```

```java
@Configuration
@EnableCaching
public class CacheConfig {}

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    
    @Cacheable(value = "products", key = "#id")
    public ProductDto getById(Long id) {
        return productRepository.findById(id)
            .map(this::convertToDto)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }
    
    @CacheEvict(value = "products", key = "#id")
    public void update(Long id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow();
        product.setName(request.name());
        product.setPrice(request.price());
        productRepository.save(product);
    }
    
    @CacheEvict(value = "products", key = "#id")
    public void delete(Long id) {
        productRepository.deleteById(id);
    }
}
```

---

### Chương 20: Testing (Unit & Integration)

#### Mục tiêu học tập
- Unit testing with JUnit & Mockito
- Integration testing with @SpringBootTest
- Test coverage
- Mocking & Stubbing

#### Bài học con
1. **Unit Testing**
   - JUnit 5 (Jupiter)
   - Test class naming: `*Test`
   - Setup/Teardown: `@BeforeEach`, `@AfterEach`
   - Assertions: `assertEquals()`, `assertTrue()`, etc.

2. **Mocking**
   - Mockito framework
   - `@Mock` — create mock
   - `@InjectMocks` — inject mocks
   - `when().thenReturn()` — stub
   - `verify()` — verify invocation

3. **Integration Testing**
   - `@SpringBootTest` — full application context
   - `@AutoConfigureMockMvc` — MockMvc bean
   - `MockMvc` — test HTTP layer
   - `@DataJpaTest` — test data layer

4. **Test Best Practices**
   - AAA pattern: Arrange, Act, Assert
   - One assertion per test (usually)
   - Descriptive test names
   - Test isolation

#### Ví dụ mã code
```java
// Unit Test
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    
    @Mock
    private ProductRepository productRepository;
    
    @InjectMocks
    private ProductServiceImpl productService;
    
    @Test
    void getById_WhenExists_ReturnsDto() {
        // Arrange
        Long productId = 1L;
        Product product = new Product(productId, "Phone", new BigDecimal("999"));
        when(productRepository.findById(productId))
            .thenReturn(Optional.of(product));
        
        // Act
        ProductDto result = productService.getById(productId);
        
        // Assert
        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Phone");
        assertThat(result.price()).isEqualTo(new BigDecimal("999"));
        
        // Verify
        verify(productRepository).findById(productId);
    }
    
    @Test
    void getById_WhenNotExists_ThrowsException() {
        // Arrange
        Long productId = 999L;
        when(productRepository.findById(productId))
            .thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> productService.getById(productId));
    }
}

// Integration Test
@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ProductRepository productRepository;
    
    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
    }
    
    @Test
    void getProduct_Returns200() throws Exception {
        // Arrange
        Product product = new Product(null, "Laptop", new BigDecimal("1000"));
        Product saved = productRepository.save(product);
        
        // Act & Assert
        mockMvc.perform(get("/api/products/" + saved.getId())
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Laptop"))
            .andExpect(jsonPath("$.price").value(1000));
    }
    
    @Test
    void createProduct_Returns201() throws Exception {
        // Arrange
        CreateProductRequest request = new CreateProductRequest(
            "Mouse", new BigDecimal("20"), null);
        
        // Act & Assert
        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(header().exists("Location"));
    }
}
```

---

### Dự Án Mini Phần IV: REST API — E-commerce Catalog

**Yêu cầu:**
- Entities: `Product`, `Category`, `Inventory`
- API Endpoints:
  - CRUD Product
  - List with pagination & filtering
  - Search by name/category
  - Get inventory status
- Authentication: JWT (login endpoint)
- Validation & Error handling
- Caching with Redis
- Unit tests & Integration tests
- Docker compose (app + MySQL + Redis)

---

## Phần V: Intermediate & Production Concepts (5-6 Tuần)

**Mục tiêu**: Advanced patterns, testing, deployment, monitoring.

### Chương 21: Database Design & Optimization

#### Mục tiêu học tập
- Schema design best practices
- Relationships & normalization
- Indexing & query optimization
- Database migration with Flyway

#### Bài học con
1. **Relational Design**
   - Normalization levels (1NF-3NF)
   - Entity relationships (1:1, 1:N, N:N)
   - Foreign key constraints

2. **Indexing**
   - Index types: B-tree, Hash
   - Single vs Composite index
   - When to index

3. **Query Optimization**
   - Execution plan analysis
   - Avoiding full table scan
   - Using EXPLAIN

4. **Flyway Migrations**
   - Version-based migrations
   - SQL scripts
   - Versioning strategy
   - Never modifying executed migration

#### Ví dụ mã code
```sql
-- V1__create_users_table.sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- V2__create_orders_table.sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);
```

---

### Chương 22: Docker & Containerization

#### Mục tiêu học tập
- Docker concepts & containers
- Docker images
- Multi-stage build
- Docker Compose

#### Bài học con
1. **Docker Basics**
   - Images vs Containers
   - Dockerfile
   - Layers & caching

2. **Dockerfile**
   - FROM, RUN, COPY, WORKDIR, ENTRYPOINT, CMD
   - Multi-stage build
   - Optimization

3. **Docker Compose**
   - Service orchestration
   - Volume mounting
   - Environment variables
   - Network

#### Ví dụ mã code
```dockerfile
# Dockerfile (multi-stage)
# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN ./mvnw package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://db:3306/mydb
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: secret
      SPRING_DATA_REDIS_HOST: redis
    depends_on:
      - db
      - redis
    networks:
      - backend

  db:
    image: mysql:8.0-alpine
    environment:
      MYSQL_DATABASE: mydb
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_ROOT_HOST: '%'
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - backend
    ports:
      - "3306:3306"

  redis:
    image: redis:7-alpine
    networks:
      - backend
    ports:
      - "6379:6379"

volumes:
  db_data:

networks:
  backend:
    driver: bridge
```

---

### Chương 23: CI/CD with GitHub Actions

#### Mục tiêu học tập
- Continuous Integration basics
- GitHub Actions workflows
- Automated testing & building
- Code quality checks

#### Bài học con
1. **CI/CD Concepts**
   - Automation
   - Fast feedback
   - Deployment pipeline

2. **GitHub Actions**
   - Workflows
   - Jobs & Steps
   - Events (push, pull_request, schedule)

3. **Workflow Examples**
   - Run tests
   - Build artifact
   - Code quality (SonarQube)
   - Docker build & push

#### Ví dụ mã code
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_DATABASE: testdb
          MYSQL_ROOT_PASSWORD: password
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
        ports:
          - 3306:3306
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      
      - name: Cache Maven packages
        uses: actions/cache@v3
        with:
          path: ~/.m2/repository
          key: ${{ runner.os }}-maven-${{ hashFiles('**/pom.xml') }}
          restore-keys: |
            ${{ runner.os }}-maven-
      
      - name: Build with Maven
        run: ./mvnw verify
      
      - name: Publish Test Results
        uses: EnricoMi/publish-unit-test-result-action@v2
        if: always()
        with:
          files: '**/target/surefire-reports/*.xml'
```

---

### Chương 24: Microservices Architecture

#### Mục tiêu học tập
- Microservices principles
- Service communication (Feign, RestTemplate)
- API Gateway
- Resilience patterns

#### Bài học con
1. **Microservices Patterns**
   - Service registry & discovery (Eureka)
   - API Gateway (Spring Cloud Gateway)
   - Service-to-service communication (Feign)
   - Circuit breaker (Resilience4j)

2. **Distributed Tracing**
   - Request correlation
   - Sleuth & Zipkin

3. **Configuration Management**
   - Spring Cloud Config Server

#### Ví dụ mã code
```java
// Feign Client
@FeignClient(name = "order-service", url = "http://order-service:8081")
public interface OrderServiceClient {
    @GetMapping("/api/orders/user/{userId}")
    List<OrderDto> getOrdersByUser(@PathVariable Long userId);
}

// Using Feign with Circuit Breaker
@Service
@RequiredArgsConstructor
public class UserService {
    private final OrderServiceClient orderServiceClient;
    
    public UserDetailDto getUserDetail(Long userId) {
        UserDetail detail = new UserDetail();
        detail.setUser(getUser(userId));
        
        try {
            detail.setOrders(orderServiceClient.getOrdersByUser(userId));
        } catch (Exception e) {
            log.warn("Failed to fetch orders: {}", e.getMessage());
            detail.setOrders(Collections.emptyList());  // Fallback
        }
        
        return detail;
    }
}
```

---

### Chương 25: Message Queue & Event-Driven Architecture

#### Mục tiêu học tập
- Message queue patterns
- Kafka vs RabbitMQ
- Event publishing & consuming
- Distributed transactions (Saga pattern)

#### Bài học con
1. **Message Queue Concepts**
   - Pub-Sub pattern
   - Point-to-point
   - Message delivery guarantees

2. **Kafka**
   - Topics & Partitions
   - Producers & Consumers
   - Consumer groups

3. **Spring Integration**
   - `KafkaTemplate` — send messages
   - `@KafkaListener` — consume messages
   - Configuration

#### Ví dụ mã code
```java
// Kafka Configuration
@Configuration
public class KafkaConfig {
    @Bean
    public ProducerFactory<String, OrderCreatedEvent> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        return new DefaultProducerFactory<>(configProps);
    }
    
    @Bean
    public KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}

// Producer
@Service
@RequiredArgsConstructor
public class OrderEventPublisher {
    private final KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;
    
    public void publishOrderCreated(Long orderId, Long userId, BigDecimal amount) {
        OrderCreatedEvent event = new OrderCreatedEvent(
            orderId, userId, amount, LocalDateTime.now());
        kafkaTemplate.send("order.created", String.valueOf(orderId), event);
    }
}

// Consumer
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventConsumer {
    private final NotificationService notificationService;
    
    @KafkaListener(topics = "order.created", groupId = "notification-service")
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Received order created event: {}", event.orderId());
        notificationService.sendOrderConfirmation(event.userId(), event.orderId());
    }
}
```

---

### Chương 26: Monitoring & Observability

#### Mục tiêu học tập
- Health checks
- Metrics collection
- Logging aggregation
- Distributed tracing

#### Bài học con
1. **Spring Boot Actuator**
   - Health endpoint
   - Metrics endpoint
   - Custom metrics

2. **Micrometer**
   - Metrics abstraction
   - Counters, Gauges, Timers
   - Integration with Prometheus, Grafana

3. **Logging**
   - Structured logging (ELK stack)
   - Log levels

#### Ví dụ mã code
```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
  endpoint:
    health:
      show-details: always
  metrics:
    export:
      prometheus:
        enabled: true
```

```java
@Component
@RequiredArgsConstructor
public class CustomMetrics {
    private final MeterRegistry meterRegistry;
    
    public void recordOrderProcessing(long durationMs) {
        Timer.builder("order.processing.time")
            .description("Time taken to process an order")
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(meterRegistry)
            .record(durationMs, TimeUnit.MILLISECONDS);
    }
}
```

---

### Dự Án Mini Phần V: Multi-Service E-commerce Platform

**Yêu cầu:**
- Services: User Service, Order Service, Inventory Service, Notification Service
- API Gateway routing
- Event-driven: Order events published to Kafka
- Notification Service consumes and sends email
- Database per service
- Docker Compose orchestration
- CI/CD pipeline
- Monitoring with Actuator & Prometheus

---

## Phần VI: Advanced Topics & Best Practices (3-4 Tuần)

**Mục tiêu**: Design patterns, performance tuning, cloud-native applications.

### Chương 27: Design Patterns & Best Practices

#### Mục tiêu học tập
- Common design patterns
- Anti-patterns
- Architectural patterns

#### Bài học con
1. **Creational Patterns**
   - Singleton
   - Factory
   - Builder

2. **Structural Patterns**
   - Adapter
   - Decorator
   - Proxy

3. **Behavioral Patterns**
   - Observer
   - Strategy
   - Template Method

4. **Architectural Patterns**
   - Layered Architecture
   - Hexagonal (Ports & Adapters)
   - Clean Architecture

#### Ví dụ mã code
```java
// Builder Pattern
public record CreateOrderRequest(
    Long userId,
    List<OrderItem> items,
    ShippingAddress shippingAddress,
    PaymentMethod paymentMethod
) {
    public static class Builder {
        private Long userId;
        private List<OrderItem> items;
        private ShippingAddress shippingAddress;
        private PaymentMethod paymentMethod;
        
        public Builder userId(Long userId) {
            this.userId = userId;
            return this;
        }
        
        // ... other setters
        
        public CreateOrderRequest build() {
            return new CreateOrderRequest(userId, items, shippingAddress, paymentMethod);
        }
    }
}

// Strategy Pattern
public interface PricingStrategy {
    BigDecimal calculatePrice(BigDecimal basePrice, List<OrderItem> items);
}

public class RegularPricing implements PricingStrategy {
    @Override
    public BigDecimal calculatePrice(BigDecimal basePrice, List<OrderItem> items) {
        return basePrice;
    }
}

public class MemberPricing implements PricingStrategy {
    @Override
    public BigDecimal calculatePrice(BigDecimal basePrice, List<OrderItem> items) {
        return basePrice.multiply(new BigDecimal("0.9"));  // 10% discount
    }
}

// Decorator Pattern
public interface NotificationService {
    void send(String message);
}

public class EmailNotificationService implements NotificationService {
    @Override
    public void send(String message) {
        System.out.println("Sending email: " + message);
    }
}

public abstract class NotificationDecorator implements NotificationService {
    protected NotificationService wrapped;
    
    public NotificationDecorator(NotificationService wrapped) {
        this.wrapped = wrapped;
    }
}

public class SmsNotificationDecorator extends NotificationDecorator {
    public SmsNotificationDecorator(NotificationService wrapped) {
        super(wrapped);
    }
    
    @Override
    public void send(String message) {
        wrapped.send(message);
        System.out.println("Sending SMS: " + message);
    }
}
```

---

### Chương 28: Performance Tuning & Optimization

#### Mục tiêu học tập
- Identifying bottlenecks
- JVM tuning
- Database optimization
- Caching strategies

#### Bài học con
1. **Profiling**
   - JVM profilers (JProfiler, YourKit)
   - Identifying hot spots
   - Memory leaks

2. **JVM Tuning**
   - Heap size configuration
   - Garbage collection tuning
   - Thread tuning

3. **Application-level Optimization**
   - Lazy loading
   - Batch processing
   - Query optimization
   - Connection pooling

#### Ví dụ mã code
```yaml
# Dockerfile with JVM tuning
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

---

### Chương 29: Kubernetes & Cloud Deployment

#### Mục tiêu học tập
- Kubernetes concepts
- Deployment manifests
- Service discovery
- Scaling & load balancing

#### Bài học con
1. **Kubernetes Basics**
   - Pods, Deployments, Services
   - ConfigMaps, Secrets
   - Ingress

2. **Deployment Strategy**
   - Rolling updates
   - Canary deployments
   - Blue-green deployments

#### Ví dụ mã code
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spring-app
  labels:
    app: spring-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: spring-app
  template:
    metadata:
      labels:
        app: spring-app
    spec:
      containers:
        - name: app
          image: myapp:1.0.0
          ports:
            - containerPort: 8080
          env:
            - name: SPRING_DATASOURCE_URL
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: db.url
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: password
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: spring-app-service
spec:
  selector:
    app: spring-app
  type: LoadBalancer
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  db.url: "jdbc:mysql://mysql-service:3306/mydb"

---
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  password: c2VjcmV0  # base64 encoded "secret"
```

---

### Chương 30: Advanced Spring Boot Features

#### Mục tiêu học tập
- Custom auto-configuration
- Actuator extensions
- Reactive programming (WebFlux)

#### Bài học con
1. **Custom Auto-configuration**
   - `@AutoConfiguration`
   - Conditional beans
   - Property-based configuration

2. **Reactive Programming**
   - Mono & Flux
   - Non-blocking I/O
   - WebFlux vs WebMvc

---

### Chương 31: Continued Learning & Career Path

#### Hướng dẫn tiếp tục học
- Advanced topics: AI/ML integration, Blockchain, GraphQL
- Community & contribution
- Cert preparations: Oracle Certified Associate

---

## Phần Kết Thúc

### Tổng Kết Lộ Trình Học

Bạn đã hoàn thành một hành trình toàn diện từ Java cơ bản đến production-ready applications. Các kiến thức chính:

- **Phần I**: Java Core — Nền tảng vững chắc
- **Phần II**: Advanced Java — Mastery các tính năng
- **Phần III**: Web Fundamentals — HTTP & Web concepts
- **Phần IV**: Spring Boot — Framework phổ biến nhất
- **Phần V**: Production-Ready — Patterns & best practices
- **Phần VI**: Advanced — Cloud-native & optimization

### Con Đường Tiếp Theo

**1. Chuyên Môn Hóa:**
   - Backend: Microservices, Kubernetes, Cloud (AWS/GCP/Azure)
   - Frontend: Spring + React/Vue/Angular
   - DevOps: CI/CD, Infrastructure as Code, Terraform

**2. Mở Rộng Kiến Thức:**
   - Machine Learning with Java (TensorFlow, Deeplearning4j)
   - Mobile Backend (Android/iOS)
   - Cloud Services: AWS Lambda, Google Cloud Functions

**3. Chuẩn Bị Phỏng Vấn:**
   - LeetCode/HackerRank: Algorithm & Data Structures
   - System Design: Twitter clone, Netflix, Uber
   - Behavioral: STAR method, team collaboration

### Tài Liệu Tham Khảo Chính

**Sách:**
- "Effective Java" by Joshua Bloch (3rd Edition)
- "Spring in Action" by Craig Walls
- "Clean Code" by Robert C. Martin

**Online Resources:**
- Official Java Documentation: https://docs.oracle.com/javase/
- Spring Framework Docs: https://spring.io/projects/spring-framework
- Baeldung Java Tutorials: https://www.baeldung.com
- Stack Overflow: https://stackoverflow.com/questions/tagged/java

**Courses & Platforms:**
- Udemy: Complete Java courses
- Pluralsight: Java paths
- LinkedIn Learning: Spring Boot series
- YouTube: Tech channel (TechGurukulul, Telusko, Amigoscode)

**Community:**
- r/java (Reddit)
- JavaRanch forums
- Local Java User Groups (JUGs)

### Best Practices Checklist

- [ ] Luôn viết test khi phát triển (TDD mindset)
- [ ] Áp dụng design patterns khi cần, tránh over-engineering
- [ ] Đọc code của người khác, học từ open-source projects
- [ ] Tham gia code review, nhận feedback
- [ ] Giữ cập nhật với Java releases (LTS versions)
- [ ] Contribute to open-source projects
- [ ] Viết documentation rõ ràng
- [ ] Luôn prioritize code readability over cleverness

---

## Thông Tin Bổ Sung

**Thời gian ước tính:**
- Phần I-II: 7-8 tuần (nếu mới bắt đầu)
- Phần III-IV: 7-8 tuần
- Phần V-VI: 8-10 tuần
- **Tổng**: 6-7 tháng với học tập đều đặn (20-30 giờ/tuần)

**Yêu cầu tiên quyết:**
- Máy tính với ít nhất 8GB RAM
- IDE (IntelliJ IDEA Community hoặc VS Code)
- Docker (tùy chọn cho các chương sau)
- Cơ bản kiến thức lập trình (không nhất thiết phải Java)

**Cách tối ưu hóa học tập:**
1. Code while learning — đừng chỉ đọc
2. Làm tất cả bài tập, không bỏ qua
3. Xây dựng dự án mini từng phần
4. Debug code khi có lỗi, không copy-paste
5. Ôn tập định kỳ, không quên kiến thức cũ
6. Tham gia cộng đồng, hỏi câu hỏi

---

**Created**: 2026-08-11  
**Version**: 1.0  
**Author**: Senior Java Instructor  
**Sáng tạo bởi**: An experienced Java educator with 15+ years in industry
