# TẦNG 1: JAVA FUNDAMENTALS (9 Chương) - Full Content

---

## Chương 1: OOP Cơ Bản

### 1.1 Class và Object
...
[Full content của Chương 1 sẽ được insert từ tier1-complete.md]
...

---

## Chương 2: Collections Framework

### 2.1 Array vs Collections

#### Lý Thuyết

**Array:**
- Fixed size, khai báo từ lúc tạo
- Lưu primitive types hoặc objects
- Không có built-in methods (find, sort, etc.)

**Collections Framework:**
- Dynamic size, tự động resize
- Generic types cho type safety
- Rich API (add, remove, sort, search, etc.)
- Phân loại: **List**, **Set**, **Map**, **Queue**

#### Khi nào dùng cái nào?

| Trường hợp | Array | List | Set | Map | Queue |
|-----------|-------|------|-----|-----|-------|
| Thứ tự quan trọng | ✅ | ✅ | ❌ | N/A | ✅ |
| Duplicates cho phép | ✅ | ✅ | ❌ | N/A | ✅ |
| Tìm kiếm nhanh | ❌ | ❌ | ✅ | ✅ | ❌ |
| Key-value pairs | ❌ | ❌ | ❌ | ✅ | ❌ |
| FIFO/LIFO | ❌ | ❌ | ❌ | ❌ | ✅ |

---

### 2.2 List Interface

#### Lý Thuyết

**List** = Ordered collection, cho phép duplicates, indexed access.

**Implementations:**
- **ArrayList**: Backed by array, fast random access O(1), slow insertion/deletion in middle
- **LinkedList**: Backed by linked nodes, fast insertion/deletion O(1), slow random access O(n)
- **Vector**: Synchronized ArrayList (legacy, tránh dùng)

#### Code Examples

```java
// ===== ARRAYLIST =====
List<String> fruits = new ArrayList<>();

// Add elements
fruits.add("Apple");
fruits.add("Banana");
fruits.add("Orange");
fruits.add(1, "Mango");  // Insert at index 1

// Access elements
System.out.println(fruits.get(0));  // Apple
System.out.println(fruits.size());  // 4

// Remove
fruits.remove("Banana");  // Remove by value
fruits.remove(0);         // Remove by index

// Iterate
for (String fruit : fruits) {
    System.out.println(fruit);
}

// Stream operations
fruits.stream()
    .filter(f -> f.startsWith("A"))
    .forEach(System.out::println);

// ===== LINKEDLIST =====
LinkedList<Integer> numbers = new LinkedList<>();
numbers.add(10);
numbers.add(20);
numbers.add(30);

numbers.addFirst(5);    // O(1) - fast!
numbers.addLast(40);    // O(1)
numbers.removeFirst();  // O(1)
numbers.removeLast();   // O(1)

// ===== COMPARING IMPLEMENTATIONS =====
public class ListPerformance {
    public static void main(String[] args) {
        List<Integer> arrayList = new ArrayList<>();
        List<Integer> linkedList = new LinkedList<>();
        
        long start = System.nanoTime();
        // ArrayLis: add 100k elements
        for (int i = 0; i < 100_000; i++) {
            arrayList.add(i);  // O(1) amortized
        }
        System.out.println("ArrayList add: " + (System.nanoTime() - start) + "ns");
        
        start = System.nanoTime();
        // LinkedList: add 100k elements
        for (int i = 0; i < 100_000; i++) {
            linkedList.add(i);  // O(1)
        }
        System.out.println("LinkedList add: " + (System.nanoTime() - start) + "ns");
        
        start = System.nanoTime();
        // ArrayList: random access 100k times
        for (int i = 0; i < 100_000; i++) {
            arrayList.get(i);  // O(1)
        }
        System.out.println("ArrayList get: " + (System.nanoTime() - start) + "ns");
        
        start = System.nanoTime();
        // LinkedList: random access 100k times
        for (int i = 0; i < 100_000; i++) {
            linkedList.get(i);  // O(n) - SLOW!
        }
        System.out.println("LinkedList get: " + (System.nanoTime() - start) + "ns");
    }
}
```

#### Best Practices

✅ **DO:**
- Dùng **ArrayList** khi need random access nhiều
- Dùng **LinkedList** khi thường xuyên add/remove ở đầu/cuối
- Use `List<T>` (interface) khi khai báo, không `ArrayList<T>`
- Kiểm tra `isEmpty()` trước khi truy cập

❌ **DON'T:**
- Không modify list khi iterating (ConcurrentModificationException)
- Không dùng Vector (deprecated)
- Không assume List là synchronized (thêm manual sync nếu cần)

---

### 2.3 Set Interface

#### Lý Thuyết

**Set** = Collection không có duplicates, NO guaranteed order.

**Implementations:**
- **HashSet**: Unordered, O(1) average add/remove/contains
- **TreeSet**: Sorted order, O(log n) operations, implements NavigableSet
- **LinkedHashSet**: Insertion-order, O(1) operations

#### Code Examples

```java
// ===== HASHSET =====
Set<String> countries = new HashSet<>();
countries.add("Vietnam");
countries.add("Thailand");
countries.add("Japan");
countries.add("Vietnam");  // Duplicate - ignored!

System.out.println(countries.size());  // 3 (not 4)
System.out.println(countries.contains("Japan"));  // true

// Iterate (order không guaranteed)
for (String country : countries) {
    System.out.println(country);
}

// ===== TREESET - SORTED =====
Set<Integer> scores = new TreeSet<>();
scores.add(85);
scores.add(90);
scores.add(75);
scores.add(95);

// Auto sorted ascending
for (int score : scores) {
    System.out.println(score);  // 75, 85, 90, 95
}

// NavigableSet methods
SortedSet<Integer> subset = scores.subSet(80, 95);  // 85, 90
System.out.println(scores.first());   // 75
System.out.println(scores.last());    // 95

// ===== CUSTOM OBJECTS IN SET =====
public class Product {
    private Long id;
    private String name;
    
    public Product(Long id, String name) {
        this.id = id;
        this.name = name;
    }
    
    // ⚠️ MUST override equals() và hashCode()
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Product)) return false;
        Product other = (Product) obj;
        return id.equals(other.id);
    }
    
    @Override
    public int hashCode() {
        return id.hashCode();
    }
}

Set<Product> products = new HashSet<>();
products.add(new Product(1L, "Laptop"));
products.add(new Product(2L, "Phone"));
products.add(new Product(1L, "Laptop"));  // Same id - ignored due to equals()

System.out.println(products.size());  // 2
```

#### Best Practices

✅ **DO:**
- Override **equals()** và **hashCode()** cho custom objects trong HashSet
- Dùng **HashSet** khi cần O(1) lookup
- Dùng **TreeSet** khi cần sorted order
- Use `Set<T>` interface khi khai báo

❌ **DON'T:**
- Không modify object properties sau khi add vào HashSet
- Không quên override hashCode() nếu override equals()
- Không assume iteration order (dùng TreeSet nếu cần)

---

### 2.4 Map Interface

#### Lý Thuyết

**Map** = Collection of key-value pairs. Keys MUST be unique, values có thể duplicate.

**Implementations:**
- **HashMap**: Unordered, O(1) operations, allows null key
- **TreeMap**: Sorted by key, O(log n) operations
- **LinkedHashMap**: Insertion-order
- **Hashtable**: Synchronized HashMap (legacy, tránh dùng)
- **ConcurrentHashMap**: Thread-safe, better than Hashtable

#### Code Examples

```java
// ===== HASHMAP =====
Map<String, Integer> ages = new HashMap<>();

// Put key-value pairs
ages.put("Alice", 25);
ages.put("Bob", 30);
ages.put("Charlie", 35);

// Get value by key
System.out.println(ages.get("Alice"));  // 25
System.out.println(ages.getOrDefault("David", 0));  // 0 (not found)

// Check containment
System.out.println(ages.containsKey("Bob"));     // true
System.out.println(ages.containsValue(30));      // true

// Remove
ages.remove("Charlie");

// Iterate over entries
for (Map.Entry<String, Integer> entry : ages.entrySet()) {
    System.out.println(entry.getKey() + " -> " + entry.getValue());
}

// ===== TREEMAP - SORTED BY KEY =====
Map<String, Integer> sortedAges = new TreeMap<>(ages);
for (Map.Entry<String, Integer> entry : sortedAges.entrySet()) {
    System.out.println(entry.getKey() + " -> " + entry.getValue());
    // Alice -> 25
    // Bob -> 30
    // (sorted alphabetically by key)
}

// ===== COMMON PATTERNS =====
// Count occurrences
Map<String, Integer> wordCount = new HashMap<>();
String text = "apple banana apple cherry banana apple";

for (String word : text.split(" ")) {
    wordCount.put(word, wordCount.getOrDefault(word, 0) + 1);
}
// Result: {apple: 3, banana: 2, cherry: 1}

// Compute if present/absent
wordCount.computeIfAbsent("date", key -> 0);
wordCount.computeIfPresent("apple", (key, val) -> val + 1);

// Merge
Map<String, Integer> map1 = new HashMap<>();
map1.put("a", 1);
map1.put("b", 2);

Map<String, Integer> map2 = new HashMap<>();
map2.put("b", 3);
map2.put("c", 4);

map1.forEach((key, val) -> map2.merge(key, val, Integer::sum));
// map2 result: {a: 1, b: 5, c: 4}
```

#### Best Practices

✅ **DO:**
- Use `Map<K, V>` interface, không implement concrete class
- Always check `containsKey()` trước khi access
- Use `getOrDefault()` để tránh null checks
- Dùng `entrySet()` khi iterate (efficient than `keySet()` + `get()`)

❌ **DON'T:**
- Không modify map khi iterating (ConcurrentModificationException)
- Không dùng mutable objects làm keys
- Không quên override hashCode() & equals() cho custom key objects

---

### 2.5 Queue Interface

#### Lý Thuyết

**Queue** = FIFO (First-In-First-Out) collection.

**Key methods:**
- `add(E)` / `offer(E)`: Enqueue
- `remove()` / `poll()`: Dequeue (remove head)
- `element()` / `peek()`: View head (not remove)

| Method | Exception | Return Special |
|--------|-----------|-----------------|
| add() | throws | - |
| offer() | - | false |
| remove() | throws | - |
| poll() | - | null |
| element() | throws | - |
| peek() | - | null |

**Implementations:**
- **LinkedList**: General-purpose queue
- **PriorityQueue**: Elements ordered by priority, not insertion order
- **Deque** (Double Ended Queue): Add/remove từ cả 2 ends

#### Code Examples

```java
// ===== QUEUE - FIFO =====
Queue<String> tasks = new LinkedList<>();

// Enqueue
tasks.offer("Task 1");
tasks.offer("Task 2");
tasks.offer("Task 3");

// Dequeue (process in order)
while (!tasks.isEmpty()) {
    String task = tasks.poll();
    System.out.println("Processing: " + task);
}
// Output:
// Processing: Task 1
// Processing: Task 2
// Processing: Task 3

// ===== PRIORITYQUEUE =====
PriorityQueue<Integer> priorities = new PriorityQueue<>();
priorities.offer(3);
priorities.offer(1);
priorities.offer(2);

// Poll in priority order (min-heap by default)
while (!priorities.isEmpty()) {
    System.out.println(priorities.poll());  // 1, 2, 3
}

// Custom comparator (max-heap)
PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b.compareTo(a));
maxHeap.offer(3);
maxHeap.offer(1);
maxHeap.offer(2);

while (!maxHeap.isEmpty()) {
    System.out.println(maxHeap.poll());  // 3, 2, 1
}

// ===== DEQUE - DOUBLE ENDED QUEUE =====
Deque<String> deque = new LinkedList<>();

deque.addFirst("First");   // Add to head
deque.addLast("Last");     // Add to tail
deque.add("Middle");       // Add to tail (default)

System.out.println(deque.getFirst());  // First
System.out.println(deque.getLast());   // Last

deque.removeFirst();
deque.removeLast();

// Deque as Stack
Deque<Integer> stack = new LinkedList<>();
stack.push(1);
stack.push(2);
stack.push(3);

while (!stack.isEmpty()) {
    System.out.println(stack.pop());  // 3, 2, 1 (LIFO)
}
```

#### Best Practices

✅ **DO:**
- Dùng `offer()` / `poll()` / `peek()` (return null) thay vì add/remove/element (throw exception)
- Use `Queue<T>` interface, không `LinkedList<T>` directly
- Dùng `PriorityQueue` cho task scheduling
- Dùng `Deque` khi cần stack-like behavior

❌ **DON'T:**
- Không poll từ empty queue mà không check `isEmpty()`
- Không quên PriorityQueue là min-heap by default

---

### 2.6 Collections Utility Class

#### Code Examples

```java
// ===== SORTING =====
List<Integer> numbers = Arrays.asList(5, 2, 8, 1, 9);
Collections.sort(numbers);  // 1, 2, 5, 8, 9

Collections.sort(numbers, Collections.reverseOrder());  // 9, 8, 5, 2, 1

// Custom comparator
List<String> words = Arrays.asList("Zebra", "Apple", "Banana");
Collections.sort(words, String.CASE_INSENSITIVE_ORDER);

// ===== SEARCHING =====
int index = Collections.binarySearch(numbers, 5);  // Returns index

// ===== IMMUTABLE COLLECTIONS =====
List<String> immutableList = Collections.unmodifiableList(new ArrayList<>(...));
// Throws UnsupportedOperationException if try to modify

// ===== SYNCHRONIZED COLLECTIONS =====
List<String> syncList = Collections.synchronizedList(new ArrayList<>());
Set<String> syncSet = Collections.synchronizedSet(new HashSet<>());
Map<String, Integer> syncMap = Collections.synchronizedMap(new HashMap<>());
```

#### Exercises

**Exercise 2.1: List Operations**
Viết program:
- Tạo ArrayList of strings
- Add, remove, search elements
- Sort, reverse order
- Iterate và display

**Exercise 2.2: Student Grade System**
- Tạo Map<String, Double> (name -> grade)
- Add 5 students
- Find highest/lowest grade
- Calculate average
- Sort by grade descending

**Exercise 2.3: Word Frequency Counter**
- Input: long text/paragraph
- Count word frequency using Map
- Display top 5 most common words
- Use TreeMap để sort

**Exercise 2.4: Task Manager (Queue)**
- Tạo PriorityQueue<Task> (task name, priority)
- Add tasks with different priorities
- Process in priority order

---

## Chương 3: Generics & Lambda

### 3.1 Generics

#### Lý Thuyết

**Generics** = Type parameters cho classes & methods. Tránh ClassCastException, tăng type safety.

```java
// ❌ Before generics - UNSAFE
List list = new ArrayList();
list.add("Hello");
list.add(123);
list.add(new Object());

// Must cast & check type
for (Object obj : list) {
    if (obj instanceof String) {
        String str = (String) obj;
    }
}

// ✅ After generics - TYPE SAFE
List<String> list = new ArrayList<>();
list.add("Hello");
list.add(123);  // COMPILE ERROR - caught at compile time!
```

#### Code Examples

```java
// ===== GENERIC CLASS =====
public class Box<T> {
    private T value;
    
    public void set(T value) {
        this.value = value;
    }
    
    public T get() {
        return value;
    }
}

// Usage
Box<String> stringBox = new Box<>();
stringBox.set("Hello");
String value = stringBox.get();  // No casting needed!

Box<Integer> intBox = new Box<>();
intBox.set(42);
Integer num = intBox.get();

// ===== GENERIC METHOD =====
public class Utils {
    public static <T> void printArray(T[] array) {
        for (T item : array) {
            System.out.println(item);
        }
    }
    
    public static <T extends Comparable<T>> T max(T a, T b) {
        return a.compareTo(b) > 0 ? a : b;
    }
}

Utils.printArray(new String[]{"A", "B", "C"});
Utils.printArray(new Integer[]{1, 2, 3});

Integer maxNum = Utils.max(10, 20);  // 20
String maxStr = Utils.max("Apple", "Zebra");  // Zebra

// ===== BOUNDED TYPE PARAMETERS =====
// <T extends Number> - T must be Number or subclass
public <T extends Number> double sumArray(T[] array) {
    double sum = 0;
    for (T item : array) {
        sum += item.doubleValue();
    }
    return sum;
}

sumArray(new Integer[]{1, 2, 3});
sumArray(new Double[]{1.5, 2.5, 3.5});

// ===== WILDCARD =====
// <?> - any type
public void printList(List<?> list) {
    for (Object item : list) {
        System.out.println(item);
    }
}

// <? extends Number> - any Number subclass
public double sumNumbers(List<? extends Number> numbers) {
    double sum = 0;
    for (Number n : numbers) {
        sum += n.doubleValue();
    }
    return sum;
}

// <? super Integer> - Integer or superclass
public void addIntegers(List<? super Integer> list) {
    list.add(1);
    list.add(2);
    list.add(3);
}
```

#### Best Practices

✅ **DO:**
- Always use generics khi dùng collections
- Use bounded types để limit what's allowed
- Use wildcards cho flexibility

❌ **DON'T:**
- Không ignore raw type warnings
- Không cast khi using generics properly

---

### 3.2 Lambda Expressions

#### Lý Thuyết

**Lambda** = Anonymous function, compact syntax cho functional interfaces.

Syntax: `(parameters) -> expression` hoặc `(parameters) -> { statements }`

#### Code Examples

```java
// ===== FUNCTIONAL INTERFACE =====
@FunctionalInterface
public interface Calculator {
    int calculate(int a, int b);
}

// Lambda implementation
Calculator add = (a, b) -> a + b;
Calculator subtract = (a, b) -> a - b;
Calculator multiply = (a, b) -> a * b;

System.out.println(add.calculate(5, 3));        // 8
System.out.println(subtract.calculate(5, 3));   // 2
System.out.println(multiply.calculate(5, 3));   // 15

// ===== BUILT-IN FUNCTIONAL INTERFACES =====
// Predicate<T> - test(T) returns boolean
Predicate<Integer> isPositive = n -> n > 0;
Predicate<String> isEmpty = s -> s.isEmpty();

// Function<T, R> - apply(T) returns R
Function<Integer, Integer> square = n -> n * n;
Function<String, Integer> length = s -> s.length();

// Consumer<T> - accept(T) returns void
Consumer<String> print = s -> System.out.println(s);
Consumer<Integer> increment = n -> System.out.println(n + 1);

// Supplier<T> - get() returns T
Supplier<Double> random = () -> Math.random();
Supplier<LocalDateTime> now = () -> LocalDateTime.now();

// ===== COMPARATOR WITH LAMBDA =====
List<String> fruits = Arrays.asList("banana", "apple", "cherry");

// Old way
fruits.sort(new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return a.compareTo(b);
    }
});

// Lambda way
fruits.sort((a, b) -> a.compareTo(b));

// Or using method reference
fruits.sort(String::compareTo);

// ===== METHOD REFERENCES =====
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");

// Lambda: x -> System.out.println(x)
// Method reference: System.out::println
names.forEach(System.out::println);

// Lambda: s -> Integer.parseInt(s)
// Method reference: Integer::parseInt
List<String> numbers = Arrays.asList("1", "2", "3");
List<Integer> ints = numbers.stream()
    .map(Integer::parseInt)
    .collect(Collectors.toList());

// Type Method Reference
List<String> list = ...;
String[] array = list.toArray(String[]::new);
```

#### Best Practices

✅ **DO:**
- Use lambdas để simplify functional interface implementations
- Use method references khi lambda chỉ call một method
- Keep lambdas short & readable

❌ **DON'T:**
- Không viết complex logic bên trong lambda (extract to method)
- Không abuse lambdas để làm code unreadable

---

### 3.3 Functional Programming Patterns

#### Code Examples

```java
// ===== FILTER-MAP-REDUCE PATTERN =====
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6);

// Filter - lấy even numbers
List<Integer> evens = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());  // [2, 4, 6]

// Map - transform each element
List<Integer> squared = numbers.stream()
    .map(n -> n * n)
    .collect(Collectors.toList());  // [1, 4, 9, 16, 25, 36]

// Reduce - aggregate to single value
int sum = numbers.stream()
    .reduce(0, Integer::sum);  // 21

Optional<Integer> max = numbers.stream()
    .reduce(Integer::max);  // Optional(6)

// ===== CHAINING OPERATIONS =====
List<String> words = Arrays.asList("hello", "world", "java", "stream");

String result = words.stream()
    .filter(w -> w.length() > 4)          // "hello", "world"
    .map(String::toUpperCase)              // "HELLO", "WORLD"
    .sorted()                              // "HELLO", "WORLD"
    .collect(Collectors.joining(", "));    // "HELLO, WORLD"

// ===== COMPOSITION =====
Function<Integer, Integer> addTwo = x -> x + 2;
Function<Integer, Integer> multiplyByThree = x -> x * 3;

Function<Integer, Integer> composed = addTwo.andThen(multiplyByThree);
System.out.println(composed.apply(5));  // (5 + 2) * 3 = 21

Function<Integer, Integer> composedReverse = addTwo.compose(multiplyByThree);
System.out.println(composedReverse.apply(5));  // (5 * 3) + 2 = 17
```

#### Exercises

**Exercise 3.1: Generic Stack**
Implement generic `Stack<T>` class:
- Methods: push(), pop(), peek(), isEmpty()
- Type safe - no casting

**Exercise 3.2: Filter & Transform**
- List of student names
- Filter students with name length > 4
- Convert to uppercase
- Display result

**Exercise 3.3: Comparator with Lambda**
- List of products (name, price)
- Sort by price ascending
- Sort by price descending
- Sort by name length

---

## Chương 4: Streams API

### 4.1 Stream Fundamentals

#### Lý Thuyết

**Stream** = Functional-style operations on collections. NOT modifying source, BUT creating new result.

**Key characteristics:**
- **Lazy evaluation**: Operations not executed until terminal operation
- **Functional**: No side effects (pure functions)
- **Parallel capable**: Can process in parallel

**Types of operations:**
- **Intermediate**: `filter()`, `map()`, `flatMap()`, `sorted()` → returns Stream
- **Terminal**: `collect()`, `forEach()`, `reduce()`, `count()` → returns result

```
Source → [filter] → [map] → [sorted] → collect ← Terminal
```

#### Code Examples

```java
// ===== CREATING STREAMS =====
List<String> fruits = Arrays.asList("Apple", "Banana", "Cherry");
Stream<String> stream1 = fruits.stream();

Stream<String> stream2 = Stream.of("A", "B", "C");

Stream<Integer> stream3 = Stream.generate(() -> new Random().nextInt(100))
    .limit(10);

Stream<Integer> stream4 = Stream.iterate(0, n -> n + 2)  // 0, 2, 4, 6, ...
    .limit(5);

// ===== INTERMEDIATE OPERATIONS =====
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// filter - keep elements matching predicate
numbers.stream()
    .filter(n -> n % 2 == 0)  // Keep even
    .forEach(System.out::println);  // 2, 4, 6, 8, 10

// map - transform each element
numbers.stream()
    .map(n -> n * 2)
    .forEach(System.out::println);  // 2, 4, 6, 8, 10, 12, 14, 16, 18, 20

// flatMap - flatten nested collections
List<List<Integer>> matrix = Arrays.asList(
    Arrays.asList(1, 2, 3),
    Arrays.asList(4, 5, 6),
    Arrays.asList(7, 8, 9)
);

matrix.stream()
    .flatMap(List::stream)
    .forEach(System.out::println);  // 1, 2, 3, 4, 5, 6, 7, 8, 9

// distinct - remove duplicates
Arrays.asList(1, 2, 2, 3, 3, 3).stream()
    .distinct()
    .forEach(System.out::println);  // 1, 2, 3

// limit & skip
numbers.stream()
    .skip(2)     // Skip first 2
    .limit(3)    // Take next 3
    .forEach(System.out::println);  // 3, 4, 5

// sorted
numbers.stream()
    .sorted()
    .forEach(System.out::println);

numbers.stream()
    .sorted(Collections.reverseOrder())
    .forEach(System.out::println);

// ===== TERMINAL OPERATIONS =====
// forEach
numbers.stream()
    .filter(n -> n > 5)
    .forEach(n -> System.out.println("Number: " + n));

// collect - gather into collection
List<Integer> evens = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());

Set<Integer> evenSet = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toSet());

String result = numbers.stream()
    .map(String::valueOf)
    .collect(Collectors.joining(", "));  // "1, 2, 3, 4, 5, ..."

// reduce - aggregate to single value
int sum = numbers.stream()
    .reduce(0, Integer::sum);

Optional<Integer> product = numbers.stream()
    .reduce((a, b) -> a * b);

// count
long count = numbers.stream()
    .filter(n -> n % 2 == 0)
    .count();  // 5

// findFirst & findAny
Optional<Integer> first = numbers.stream()
    .filter(n -> n > 5)
    .findFirst();  // 6

Optional<Integer> any = numbers.stream()
    .filter(n -> n % 2 == 0)
    .findAny();  // 2 (or any even number)

// allMatch, anyMatch, noneMatch
boolean allPositive = numbers.stream()
    .allMatch(n -> n > 0);  // true

boolean hasEven = numbers.stream()
    .anyMatch(n -> n % 2 == 0);  // true

boolean noNegative = numbers.stream()
    .noneMatch(n -> n < 0);  // true

// ===== PARALLEL STREAMS =====
long start = System.currentTimeMillis();

// Sequential
IntStream.range(1, 10_000_000)
    .map(n -> n * 2)
    .sum();

// Parallel (faster for large datasets)
IntStream.range(1, 10_000_000)
    .parallel()
    .map(n -> n * 2)
    .sum();
```

#### Best Practices

✅ **DO:**
- Use streams cho transformations
- Chain operations khi logical
- Use parallel streams cho large datasets
- Keep lambdas trong streams đơn giản

❌ **DON'T:**
- Không modify source collection khi streaming
- Không abuse parallel streams (overhead cost)
- Không viết complex logic bên trong stream chain

---

## Chương 5: Exception Handling

### 5.1 Try-Catch-Finally

#### Lý Thuyết

**Exception** = Unexpected event disrupt normal flow.

**Hierarchy:**
```
Throwable
├── Error (JVM errors - don't catch)
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── ...
└── Exception
    ├── Checked (MUST handle or declare)
    │   ├── IOException
    │   ├── SQLException
    │   └── ...
    └── Unchecked (Optional to handle)
        ├── NullPointerException
        ├── ArrayIndexOutOfBoundsException
        ├── IllegalArgumentException
        └── ...
```

#### Code Examples

```java
// ===== TRY-CATCH =====
try {
    int result = 10 / 0;  // Throws ArithmeticException
} catch (ArithmeticException e) {
    System.out.println("Cannot divide by zero");
    e.printStackTrace();
}

// ===== MULTIPLE CATCHES =====
try {
    String text = null;
    int length = text.length();  // Throws NullPointerException
} catch (NullPointerException e) {
    System.out.println("String is null");
} catch (Exception e) {
    System.out.println("Other error: " + e.getMessage());
}

// ===== CATCH MULTIPLE EXCEPTIONS (Java 7+) =====
try {
    // code
} catch (IOException | SQLException e) {
    System.out.println("IO or SQL error");
}

// ===== TRY-FINALLY =====
FileReader reader = null;
try {
    reader = new FileReader("file.txt");
    // read file
} catch (IOException e) {
    System.out.println("Error reading file");
} finally {
    // ALWAYS executes, even if exception or return
    if (reader != null) {
        try {
            reader.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

// ===== TRY-WITH-RESOURCES (Java 7+) =====
// AutoCloseable resources automatically closed
try (FileReader reader = new FileReader("file.txt")) {
    int ch;
    while ((ch = reader.read()) != -1) {
        System.out.print((char) ch);
    }
} catch (IOException e) {
    System.out.println("Error reading file");
}
// reader.close() automatically called!

// ===== CUSTOM EXCEPTIONS =====
public class InsufficientFundsException extends Exception {
    private double amount;
    
    public InsufficientFundsException(double amount) {
        super("Insufficient funds. Need: $" + amount);
        this.amount = amount;
    }
    
    public double getAmount() {
        return amount;
    }
}

public class BankAccount {
    private double balance;
    
    public void withdraw(double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException(amount - balance);
        }
        balance -= amount;
    }
}

// Usage
BankAccount account = new BankAccount();
try {
    account.withdraw(1000);
} catch (InsufficientFundsException e) {
    System.out.println("Error: " + e.getMessage());
    System.out.println("Need additional: $" + e.getAmount());
}

// ===== EXCEPTION CHAINING =====
try {
    // Some code
} catch (SQLException e) {
    throw new RuntimeException("Database error: " + e.getMessage(), e);
    // Preserves original exception for debugging
}
```

#### Best Practices

✅ **DO:**
- Catch specific exceptions, not generic `Exception`
- Use try-with-resources cho AutoCloseable resources
- Log exceptions properly
- Provide meaningful error messages
- Chain exceptions để preserve stack trace

❌ **DON'T:**
- Không catch & ignore silently (swallowing exceptions)
- Không throw generic `Exception`
- Không catch `Throwable` (includes Errors)
- Không leave resources open (use finally or try-with-resources)

---

## Chương 6: File I/O & Serialization

### 6.1 File Operations

#### Code Examples

```java
// ===== READING FILES =====
// Line by line
try (BufferedReader reader = new BufferedReader(new FileReader("input.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    e.printStackTrace();
}

// Entire file at once (Java 11+)
String content = Files.readString(Path.of("input.txt"));

// ===== WRITING FILES =====
try (BufferedWriter writer = new BufferedWriter(new FileWriter("output.txt"))) {
    writer.write("Hello, World!");
    writer.newLine();
    writer.write("Line 2");
} catch (IOException e) {
    e.printStackTrace();
}

// Using Files API
Files.write(Path.of("output.txt"), "Content here".getBytes());

// ===== WORKING WITH PATHS =====
Path path = Paths.get("folder", "subfolder", "file.txt");
Path absolute = path.toAbsolutePath();
Path parent = path.getParent();
String filename = path.getFileName().toString();

// Check file properties
boolean exists = Files.exists(path);
boolean isFile = Files.isRegularFile(path);
boolean isDir = Files.isDirectory(path);
boolean readable = Files.isReadable(path);

// ===== COPYING & MOVING FILES =====
Path source = Paths.get("original.txt");
Path destination = Paths.get("copy.txt");

Files.copy(source, destination, StandardCopyOption.REPLACE_EXISTING);
Files.move(source, destination, StandardCopyOption.REPLACE_EXISTING);

// ===== LISTING DIRECTORY =====
try (Stream<Path> stream = Files.list(Paths.get("."))) {
    stream.filter(Files::isRegularFile)
        .forEach(System.out::println);
}

// ===== CREATING DIRECTORIES =====
Files.createDirectory(Paths.get("newFolder"));
Files.createDirectories(Paths.get("a/b/c"));  // Creates parent dirs too
```

### 6.2 Serialization

#### Code Examples

```java
// ===== SERIALIZABLE CLASS =====
public class Person implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private String name;
    private int age;
    private transient String password;  // NOT serialized
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    // getters, setters...
}

// ===== SERIALIZE TO FILE =====
Person person = new Person("Alice", 25);

try (ObjectOutputStream oos = new ObjectOutputStream(
        new FileOutputStream("person.dat"))) {
    oos.writeObject(person);
    System.out.println("Person serialized");
} catch (IOException e) {
    e.printStackTrace();
}

// ===== DESERIALIZE FROM FILE =====
try (ObjectInputStream ois = new ObjectInputStream(
        new FileInputStream("person.dat"))) {
    Person loaded = (Person) ois.readObject();
    System.out.println("Name: " + loaded.getName());
    System.out.println("Age: " + loaded.getAge());
} catch (IOException | ClassNotFoundException e) {
    e.printStackTrace();
}

// ===== JSON SERIALIZATION (using Jackson) =====
// Dependency: com.fasterxml.jackson.core:jackson-databind

ObjectMapper mapper = new ObjectMapper();

// Object to JSON string
String json = mapper.writeValueAsString(person);
// {"name":"Alice","age":25}

// JSON string to Object
Person deserialized = mapper.readValue(json, Person.class);

// JSON to File
mapper.writeValue(new File("person.json"), person);

// File to Object
Person fromFile = mapper.readValue(new File("person.json"), Person.class);
```

#### Exercises

**Exercise 6.1: File Reader**
- Read text file line by line
- Count total lines, words, characters
- Display statistics

**Exercise 6.2: File Copy**
- Copy file from source to destination
- Show progress (bytes copied)
- Handle errors gracefully

**Exercise 6.3: CSV to Object**
- Read CSV file (name,age,email)
- Create Person objects
- Serialize to binary file

---

## Chương 7: Concurrency & Multithreading

### 7.1 Threads Basics

#### Lý Thuyết

**Thread** = Independent flow of execution within a process.

**2 ways to create threads:**
1. Extend `Thread` class
2. Implement `Runnable` interface (preferred)

#### Code Examples

```java
// ===== METHOD 1: EXTEND THREAD =====
public class MyThread extends Thread {
    private String name;
    
    public MyThread(String name) {
        this.name = name;
    }
    
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(name + " - " + i);
            try {
                Thread.sleep(1000);  // Sleep 1 second
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

// Usage
MyThread t1 = new MyThread("Thread-1");
MyThread t2 = new MyThread("Thread-2");
t1.start();  // Calls run() in new thread
t2.start();

// ===== METHOD 2: IMPLEMENT RUNNABLE (preferred) =====
public class MyRunnable implements Runnable {
    private String name;
    
    public MyRunnable(String name) {
        this.name = name;
    }
    
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(name + " - " + i);
        }
    }
}

// Usage
Thread t1 = new Thread(new MyRunnable("Thread-1"));
Thread t2 = new Thread(new MyRunnable("Thread-2"));
t1.start();
t2.start();

// With lambda
new Thread(() -> {
    System.out.println("Running in thread");
}).start();

// ===== THREAD LIFECYCLE =====
Thread thread = new Thread(() -> {
    try {
        System.out.println("Started");
        Thread.sleep(2000);
        System.out.println("Finished");
    } catch (InterruptedException e) {
        System.out.println("Interrupted");
    }
});

thread.start();         // Transitions to RUNNABLE
Thread.sleep(100);
boolean alive = thread.isAlive();  // true while running
thread.join();          // Wait for thread to finish
System.out.println("Main thread continues after join");
```

### 7.2 Synchronization

#### Lý Thuyết

**Problem**: Multiple threads accessing same resource → race condition.

**Solution**: Synchronization using `synchronized` keyword or locks.

#### Code Examples

```java
// ===== PROBLEM: RACE CONDITION =====
public class Counter {
    private int count = 0;
    
    public void increment() {
        count++;  // NOT atomic: read, increment, write
    }
    
    public int getCount() {
        return count;
    }
}

// With 2 threads incrementing 1000 times each
// Expected: 2000, but might get < 2000 due to race condition

// ===== SOLUTION 1: SYNCHRONIZED METHOD =====
public class SyncCounter {
    private int count = 0;
    
    public synchronized void increment() {
        count++;  // Only one thread at a time
    }
    
    public synchronized int getCount() {
        return count;
    }
}

// ===== SOLUTION 2: SYNCHRONIZED BLOCK =====
public class BlockCounter {
    private int count = 0;
    private Object lock = new Object();
    
    public void increment() {
        synchronized (lock) {
            count++;
        }
    }
}

// ===== SOLUTION 3: ATOMIC CLASSES (best for primitives) =====
import java.util.concurrent.atomic.AtomicInteger;

public class AtomicCounter {
    private AtomicInteger count = new AtomicInteger(0);
    
    public void increment() {
        count.incrementAndGet();  // Thread-safe
    }
    
    public int getCount() {
        return count.get();
    }
}

// ===== PRODUCER-CONSUMER PATTERN =====
public class Buffer {
    private Queue<Integer> queue = new LinkedList<>();
    private final int capacity = 10;
    
    public synchronized void produce(int value) throws InterruptedException {
        while (queue.size() == capacity) {
            wait();  // Wait for space
        }
        queue.offer(value);
        notifyAll();  // Wake up consumers
    }
    
    public synchronized int consume() throws InterruptedException {
        while (queue.isEmpty()) {
            wait();  // Wait for data
        }
        int value = queue.poll();
        notifyAll();  // Wake up producers
        return value;
    }
}
```

### 7.3 ExecutorService & Thread Pools

#### Code Examples

```java
// ===== THREAD POOL =====
ExecutorService executor = Executors.newFixedThreadPool(3);  // 3 threads

for (int i = 0; i < 10; i++) {
    final int taskNum = i;
    executor.execute(() -> {
        System.out.println("Task " + taskNum + " executing");
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    });
}

executor.shutdown();          // No new tasks
executor.awaitTermination(5, TimeUnit.SECONDS);  // Wait for completion

// ===== CALLABLE & FUTURE =====
ExecutorService executor = Executors.newFixedThreadPool(2);

Callable<Integer> task = () -> {
    Thread.sleep(2000);
    return 42;  // Return result
};

Future<Integer> future = executor.submit(task);

try {
    int result = future.get();  // Blocks until result ready
    System.out.println("Result: " + result);
} catch (InterruptedException | ExecutionException e) {
    e.printStackTrace();
}

executor.shutdown();

// ===== COMPLETABLEFUTURE =====
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    try {
        Thread.sleep(2000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    return "Hello";
}).thenApply(s -> s + " World")
  .thenApply(String::toUpperCase);

System.out.println(future.get());  // HELLO WORLD
```

#### Exercises

**Exercise 7.1: Thread Counter**
- Create thread-safe counter
- 5 threads increment 1000 times
- Verify final count = 5000

**Exercise 7.2: Producer-Consumer**
- Producer generates numbers
- Consumer processes them
- Use queue for communication

---

## Chương 8: Maven

### 8.1 Maven Basics

#### Lý Thuyết

**Maven** = Build automation & dependency management tool.

**Key features:**
- Dependency management (automatic download & manage)
- Build lifecycle (compile, test, package, deploy)
- Project structure standardization

#### Project Structure

```
my-app/
├── pom.xml (project configuration)
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/App.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       ├── java/
│       │   └── com/example/AppTest.java
│       └── resources/
├── target/
│   ├── classes/
│   └── my-app-1.0-SNAPSHOT.jar
└── .gitignore
```

#### Code Examples

```xml
<!-- pom.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    
    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0-SNAPSHOT</version>
    
    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    
    <dependencies>
        <!-- JUnit for testing -->
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13.2</version>
            <scope>test</scope>
        </dependency>
        
        <!-- SLF4J + Logback for logging -->
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
            <version>2.0.0</version>
        </dependency>
        <dependency>
            <groupId>ch.qos.logback</groupId>
            <artifactId>logback-classic</artifactId>
            <version>1.4.0</version>
        </dependency>
        
        <!-- Jackson for JSON -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.15.0</version>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.10.1</version>
                <configuration>
                    <source>11</source>
                    <target>11</target>
                </configuration>
            </plugin>
            
            <!-- Create executable JAR -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-assembly-plugin</artifactId>
                <version>3.4.2</version>
                <configuration>
                    <archive>
                        <manifest>
                            <mainClass>com.example.App</mainClass>
                        </manifest>
                    </archive>
                    <descriptorRefs>
                        <descriptorRef>jar-with-dependencies</descriptorRef>
                    </descriptorRefs>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

#### Maven Commands

```bash
# Compile source code
mvn compile

# Run tests
mvn test

# Package into JAR
mvn package

# Clean build directory
mvn clean

# Install to local repository
mvn install

# Deploy to remote repository
mvn deploy

# Full lifecycle: clean → compile → test → package
mvn clean package

# Skip tests during build
mvn clean package -DskipTests

# Run specific test
mvn test -Dtest=AppTest
```

#### Exercises

**Exercise 8.1: Create Maven Project**
- Initialize Maven project
- Add JUnit dependency
- Write & run unit tests
- Package as executable JAR

---

## Chương 9: Java 8+ Features

### 9.1 New in Java 8

#### Code Examples

```java
// ===== DEFAULT METHODS IN INTERFACES =====
interface Animal {
    void makeSound();
    
    // Default method - can be overridden
    default void move() {
        System.out.println("Moving");
    }
}

class Dog implements Animal {
    @Override
    public void makeSound() {
        System.out.println("Woof!");
    }
    
    @Override
    public void move() {
        System.out.println("Dog runs");
    }
}

// ===== STATIC METHODS IN INTERFACES =====
interface MathUtils {
    static int add(int a, int b) {
        return a + b;
    }
}

// Call directly
int result = MathUtils.add(5, 3);  // 8

// ===== OPTIONAL =====
// Avoid null checks & NullPointerException

Optional<String> name = Optional.of("Alice");
name.ifPresent(System.out::println);  // Alice

Optional<String> empty = Optional.empty();
String value = empty.orElse("Default");  // Default
String value2 = empty.orElseThrow(() -> new RuntimeException("Not found"));

Optional<Integer> num = Optional.of(42);
Optional<Integer> doubled = num.map(n -> n * 2);  // Optional(84)

// ===== DATE AND TIME API =====
LocalDate today = LocalDate.now();
LocalDate tomorrow = today.plusDays(1);

LocalDateTime now = LocalDateTime.now();
LocalDateTime future = now.plusHours(2).plusMinutes(30);

Duration duration = Duration.between(LocalDateTime.now(), future);
System.out.println(duration.getSeconds());

Period period = Period.between(today, today.plusMonths(1));
System.out.println(period.getDays());

// Format
LocalDate date = LocalDate.of(2024, 1, 15);
String formatted = date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));  // 15/01/2024
```

### 9.2 New in Java 9+

#### Code Examples

```java
// ===== PRIVATE INTERFACE METHODS (Java 9+) =====
interface Logger {
    default void log(String msg) {
        logInternal(msg);  // Call private method
    }
    
    private void logInternal(String msg) {
        System.out.println("[LOG] " + msg);
    }
}

// ===== VAR KEYWORD (Java 10+) =====
var name = "Alice";  // Type inferred as String
var age = 25;        // Type inferred as int
var numbers = List.of(1, 2, 3);  // Type inferred as List<Integer>

// Can only use in local variables, not fields/parameters
var list = new ArrayList<String>();

// ===== RECORD (Java 14+) =====
// Immutable data carrier, auto-generates equals/hashCode/toString

public record Person(String name, int age) {
    // Auto-generated:
    // - Constructor
    // - Getters (name(), age())
    // - equals(), hashCode(), toString()
}

Person p = new Person("Bob", 30);
System.out.println(p.name());   // Bob
System.out.println(p.age());    // 30

// With validation
public record Person(String name, int age) {
    public Person {  // Compact constructor
        if (age < 0) {
            throw new IllegalArgumentException("Age must be positive");
        }
    }
}

// ===== SEALED CLASSES (Java 15+) =====
// Restrict which classes can extend

public sealed class Shape permits Circle, Rectangle, Triangle {
}

public final class Circle extends Shape {
}

public final class Rectangle extends Shape {
}

public final class Triangle extends Shape {
}

// ===== TEXT BLOCKS (Java 13+) =====
String json = """
    {
        "name": "Alice",
        "age": 25
    }
    """;

// ===== PATTERN MATCHING (Java 16+) =====
Object obj = "Hello";

// Traditional way
if (obj instanceof String) {
    String str = (String) obj;
    System.out.println(str.length());
}

// Pattern matching
if (obj instanceof String str) {
    System.out.println(str.length());  // No explicit cast!
}

// With switch (Java 17+)
String value = switch (obj) {
    case String s -> "String: " + s;
    case Integer i -> "Integer: " + i;
    case null -> "Null";
    default -> "Unknown";
};
```

#### Summary Features Timeline

| Version | Key Features |
|---------|--------------|
| 8 | Lambdas, Streams, Optional, Default methods |
| 9 | Modules, Private interface methods |
| 10 | var keyword, Local-Variable Type Inference |
| 11 | String methods (isBlank, strip), HttpClient |
| 12 | Switch expressions (preview) |
| 13 | Text blocks (preview) |
| 14 | Records (preview), Pattern matching (preview) |
| 15 | Sealed classes (preview), Text blocks (final) |
| 16 | Records (final), Pattern matching (final) |
| 17 | Switch expressions (final), Pattern matching (final) |
| 18 | Simple web server (preview) |
| 19 | Virtual threads (preview), Pattern matching (final) |
| 20 | Virtual threads (preview), Scoped values (preview) |
| 21 | Virtual threads (final), Record patterns, Pattern matching (final) |

#### Exercises

**Exercise 9.1: Modernize Legacy Code**
- Take old Java code (with null checks, verbose)
- Refactor using Optional, var keyword, Records

**Exercise 9.2: Use Records**
- Define record for Student (id, name, gpa)
- Create list of students
- Filter by GPA > 3.5 using streams

---

## Summary Tầng 1

**Chương 1: OOP** - Classes, Encapsulation, Inheritance, Polymorphism, Abstraction
**Chương 2: Collections** - List, Set, Map, Queue
**Chương 3: Generics & Lambda** - Type safety, Functional programming basics
**Chương 4: Streams API** - Functional transformations on collections
**Chương 5: Exception Handling** - Try-catch, Custom exceptions, Resource management
**Chương 6: File I/O & Serialization** - Reading/writing files, Object serialization
**Chương 7: Concurrency** - Threads, Synchronization, Thread pools
**Chương 8: Maven** - Dependency management, Build automation
**Chương 9: Java 8+ Features** - Modern Java syntax and libraries

✅ **Ready for Tier 2: Spring Boot Foundation**
