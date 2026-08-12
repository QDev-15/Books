# CHƯƠNG 4 — STREAMS API: DEEP DIVE

> **Dành cho ai?** Người đã học xong Chương 2 (Collections) và Chương 3 (Generics & Lambda). Bạn đã biết `List`, `Map`, `Set`; bạn đã viết được `x -> x * 2` và `String::length`. Bạn đã từng copy một dòng `list.stream().filter(...).map(...).collect(Collectors.toList())` và nó **chạy được** — nhưng bạn không thật sự biết chuyện gì xảy ra bên trong, vì sao `filter` "không chạy" cho tới khi có `collect`, và vì sao thêm `.parallel()` đôi khi làm chương trình **chậm đi 10 lần**.
>
> **Cam kết của chương này:** Sau khi đọc xong, bạn sẽ ngừng coi Streams là "vòng `for` viết cho ngầu". Bạn sẽ hiểu Streams là một **mô hình tính toán lười (lazy) theo kiểu pipeline**, đọc được mọi chữ ký khó nhằn trong `java.util.stream` (kể cả `<R, A> R collect(Collector<? super T, A, R> collector)`), tự viết được `Collector` riêng, biết chính xác **khi nào `parallel()` giúp và khi nào nó phá hoại**, và viết code xử lý dữ liệu theo phong cách **khai báo (declarative)** — nói *cái gì cần*, không phải *làm thế nào*.

---

## 🎯 Mục Tiêu Học

Sau chương này bạn sẽ:

1. Phân biệt được **imperative (mệnh lệnh)** và **declarative (khai báo)** — và hiểu vì sao declarative thắng về khả năng đọc, khả năng bảo trì, khả năng tối ưu
2. Vẽ được **giải phẫu một stream pipeline**: `nguồn → 0..n toán tử trung gian → 1 toán tử kết thúc`
3. Giải thích được **lazy evaluation** ở mức **từng phần tử** — chứng minh bằng `peek()` rằng dữ liệu chảy **theo chiều dọc** chứ không phải theo chiều ngang
4. Nắm chắc **toàn bộ toán tử trung gian**: `map`, `filter`, `flatMap`, `mapMulti`, `distinct`, `sorted`, `limit`, `skip`, `peek`, `takeWhile`, `dropWhile`, `boxed`, `mapToXxx`
5. Nắm chắc **toàn bộ toán tử kết thúc**: `forEach`, `count`, `findFirst`, `findAny`, `reduce` (3 dạng), `collect`, `min`, `max`, `anyMatch`, `allMatch`, `noneMatch`, `toArray`, `toList`
6. Thành thạo **`Collectors`** — từ `toList()` tới `groupingBy` lồng nhiều tầng, `partitioningBy`, `joining`, `teeing`, `collectingAndThen`, `mapping`, `filtering`, `flatMapping`
7. Tự **viết Collector riêng** bằng `Collector.of(...)` và hiểu 4 hàm cấu thành (`supplier`, `accumulator`, `combiner`, `finisher`) cùng `Characteristics`
8. Phân biệt **stateless / stateful / short-circuiting** và biết vì sao thứ tự toán tử ảnh hưởng hiệu năng tới **hàng chục lần**
9. Hiểu **primitive streams** (`IntStream`, `LongStream`, `DoubleStream`) và cái giá của **boxing**
10. Hiểu **parallel streams** ở mức Fork/Join + `Spliterator` — và thuộc lòng **checklist 6 câu hỏi** trước khi gõ `.parallel()`
11. Tạo được **stream vô hạn** (`Stream.iterate`, `Stream.generate`) và **nguồn stream tuỳ chỉnh** bằng `Spliterator`
12. Tránh được **16 lỗi Streams kinh điển**
13. Áp dụng đúng trong **Spring Boot**: chuyển `List<Entity>` → `List<Dto>`, `Optional` từ `findFirst`, và biết **khi nào nên để database làm việc thay vì Stream**

**Thời gian đọc kỹ:** 5–7 giờ. **Thời gian làm bài tập:** 8–12 giờ.

---

## 📚 Mục Lục

| Phần | Nội dung |
|------|----------|
| [Phần 0](#phần-0--tại-sao-cần-streams) | Tại sao cần Streams? Imperative vs Declarative |
| [Phần 1](#phần-1--giải-phẫu-một-stream-pipeline) | Giải phẫu một Stream pipeline |
| [Phần 2](#phần-2--lazy-evaluation--trái-tim-của-streams) | Lazy evaluation — trái tim của Streams |
| [Phần 3](#phần-3--tạo-stream--mọi-nguồn-dữ-liệu) | Tạo Stream — mọi nguồn dữ liệu |
| [Phần 4](#phần-4--intermediate-operations--toán-tử-trung-gian) | Intermediate Operations (toán tử trung gian) |
| [Phần 5](#phần-5--terminal-operations--toán-tử-kết-thúc) | Terminal Operations (toán tử kết thúc) |
| [Phần 6](#phần-6--collectors--bộ-công-cụ-quyền-lực) | Collectors — bộ công cụ quyền lực |
| [Phần 7](#phần-7--viết-collector-của-riêng-bạn) | Viết Collector của riêng bạn |
| [Phần 8](#phần-8--primitive-streams--intstream--longstream--doublestream) | Primitive Streams |
| [Phần 9](#phần-9--stateless-vs-stateful--chi-phí-thật-sự) | Stateless vs Stateful & chi phí thật sự |
| [Phần 10](#phần-10--parallel-streams--sức-mạnh-và-cạm-bẫy) | Parallel Streams — sức mạnh và cạm bẫy |
| [Phần 11](#phần-11--infinite-streams--spliterator-tuỳ-chỉnh) | Infinite Streams & Spliterator tuỳ chỉnh |
| [Phần 12](#phần-12--bảng-phân-loại-toàn-bộ-operations) | Bảng phân loại toàn bộ operations (70+) |
| [Phần 13](#phần-13--cây-quyết-định--dùng-toán-tử-nào) | Cây quyết định — dùng toán tử nào? |
| [Phần 14](#phần-14--bảng-so-sánh-hiệu-năng) | Bảng so sánh hiệu năng |
| [Phần 15](#phần-15--16-lỗi-streams-kinh-điển) | 16 lỗi Streams kinh điển |
| [Phần 16](#phần-16--best-practices--anti-patterns) | Best Practices & Anti-patterns |
| [Phần 17](#phần-17--streams-trong-spring-boot) | Streams trong Spring Boot |
| [Phần 18](#phần-18--bài-tập-thực-hành) | Bài tập thực hành (6 bài) |
| [Phần 19](#phần-19--tóm-tắt--chương-tiếp-theo) | Tóm tắt & chương tiếp theo |
| [Phụ lục A](#📎-phụ-lục-a--bảng-tra-nhanh-collectors) | Bảng tra nhanh Collectors |
| [Phụ lục B](#📎-phụ-lục-b--bảng-tra-nhanh-operations) | Bảng tra nhanh Operations |
| [Phụ lục C](#📎-phụ-lục-c--thuật-ngữ-việt--anh) | Thuật ngữ Việt–Anh |

---

## 📦 Bộ Dữ Liệu Dùng Chung Cả Chương

Để không phải giới thiệu lại model ở mỗi ví dụ, cả chương dùng chung hai bộ dữ liệu sau. Hãy **copy vào IDE** và chạy thử cùng lúc khi đọc.

```java
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

/** Bộ 1 — Trường học: dùng cho các ví dụ lọc / nhóm / thống kê */
public record SinhVien(
        String hoTen,
        int tuoi,
        String lop,          // "12A1", "12A2", "12B1"
        double diemTrungBinh,
        List<String> monHoc  // ví dụ ["Toán", "Lý", "Hoá"]
) {}

/** Bộ 2 — Thương mại điện tử: dùng cho các ví dụ flatMap / aggregate */
public record SanPham(
        Long id,
        String ten,
        String danhMuc,      // "Điện tử", "Sách", "Thời trang"
        BigDecimal gia,
        int tonKho
) {}

public record ChiTietDonHang(SanPham sanPham, int soLuong) {
    /** Thành tiền của một dòng hàng = giá × số lượng */
    public BigDecimal thanhTien() {
        return sanPham.gia().multiply(BigDecimal.valueOf(soLuong));
    }
}

public record DonHang(
        Long id,
        String khachHang,
        LocalDate ngayDat,
        TrangThai trangThai,
        List<ChiTietDonHang> chiTiet   // ⭐ Cấu trúc LỒNG — nơi flatMap toả sáng
) {}

public enum TrangThai { MOI, DANG_GIAO, HOAN_THANH, HUY }
```

```java
/** Dữ liệu mẫu — dùng lại xuyên suốt chương */
public final class DuLieuMau {

    public static List<SinhVien> sinhVien() {
        return List.of(
            new SinhVien("Nguyễn An",   17, "12A1", 8.5, List.of("Toán", "Lý", "Hoá")),
            new SinhVien("Trần Bình",   18, "12A1", 7.2, List.of("Toán", "Văn")),
            new SinhVien("Lê Chi",      19, "12A2", 9.1, List.of("Toán", "Anh", "Tin")),
            new SinhVien("Phạm Dũng",   18, "12A2", 6.4, List.of("Văn", "Sử")),
            new SinhVien("Hoàng Em",    20, "12B1", 8.8, List.of("Toán", "Lý", "Tin")),
            new SinhVien("Vũ Phong",    17, "12B1", 5.9, List.of("Địa", "Sử")),
            new SinhVien("Đỗ Giang",    21, "12A1", 9.6, List.of("Toán", "Hoá", "Sinh"))
        );
    }

    public static List<DonHang> donHang() {
        var laptop = new SanPham(1L, "Laptop Dell",  "Điện tử",  new BigDecimal("25000000"), 12);
        var chuot  = new SanPham(2L, "Chuột Logi",   "Điện tử",  new BigDecimal("450000"),  200);
        var sach   = new SanPham(3L, "Clean Code",   "Sách",     new BigDecimal("320000"),   45);
        var aoThun = new SanPham(4L, "Áo thun",      "Thời trang", new BigDecimal("180000"), 500);

        return List.of(
            new DonHang(101L, "An",   LocalDate.of(2026, 1, 5),  TrangThai.HOAN_THANH,
                List.of(new ChiTietDonHang(laptop, 1), new ChiTietDonHang(chuot, 2))),
            new DonHang(102L, "Bình", LocalDate.of(2026, 1, 9),  TrangThai.MOI,
                List.of(new ChiTietDonHang(sach, 3))),
            new DonHang(103L, "An",   LocalDate.of(2026, 2, 1),  TrangThai.HOAN_THANH,
                List.of(new ChiTietDonHang(aoThun, 5), new ChiTietDonHang(sach, 1))),
            new DonHang(104L, "Chi",  LocalDate.of(2026, 2, 14), TrangThai.HUY,
                List.of(new ChiTietDonHang(chuot, 10)))
        );
    }

    private DuLieuMau() {}   // Lớp tiện ích — không cho khởi tạo
}
```

> 💡 **Vì sao dùng `record`?** Như đã học ở Chương 3: `record` là **immutable** (bất biến), tự sinh `equals`/`hashCode`/`toString`. Stream hoạt động **tốt nhất** với dữ liệu bất biến — đây không phải trùng hợp, đó là **triết lý functional programming**. Ta sẽ quay lại điểm này rất nhiều lần.

---

## Phần 0 — Tại Sao Cần Streams?

### 0.1 Một buổi sáng thứ Hai bình thường

Sếp giao việc: *"Lấy cho anh danh sách **họ tên** của các sinh viên **từ 18 tuổi trở lên**, có **điểm trung bình ≥ 7.0**, **sắp xếp theo điểm giảm dần**, chỉ lấy **3 người đầu**."*

Đây là yêu cầu nghiệp vụ. Hãy dịch nó sang Java theo cách bạn đã học ở Chương 2.

#### Cách cũ — Imperative (mệnh lệnh)

```java
public List<String> topSinhVien(List<SinhVien> danhSach) {
    // Bước 1: tạo hộp chứa kết quả trung gian
    List<SinhVien> loc = new ArrayList<>();

    // Bước 2: duyệt thủ công từng phần tử
    for (SinhVien sv : danhSach) {
        // Bước 3: kiểm tra điều kiện
        if (sv.tuoi() >= 18 && sv.diemTrungBinh() >= 7.0) {
            loc.add(sv);   // Bước 4: nhét vào hộp
        }
    }

    // Bước 5: sắp xếp hộp
    loc.sort((a, b) -> Double.compare(b.diemTrungBinh(), a.diemTrungBinh()));

    // Bước 6: tạo hộp thứ hai để chứa tên
    List<String> ketQua = new ArrayList<>();

    // Bước 7: duyệt lần nữa, cắt lấy 3 phần tử
    for (int i = 0; i < loc.size() && i < 3; i++) {
        ketQua.add(loc.get(i).hoTen());
    }

    return ketQua;
}
```

**Đếm thử xem code này chứa gì:**

| Thứ | Số lượng | Bản chất |
|-----|----------|----------|
| Biến tạm (`loc`, `ketQua`, `i`, `sv`) | 4 | **Chỉ tồn tại vì cơ chế**, không phải vì nghiệp vụ |
| Vòng lặp | 2 | Cơ chế duyệt |
| Kiểm tra biên (`i < loc.size() && i < 3`) | 1 | Nguồn gốc của `IndexOutOfBoundsException` |
| Câu nghiệp vụ thật sự | 4 | lọc tuổi, lọc điểm, sắp xếp, lấy 3 |

👉 **Tỉ lệ tín hiệu/nhiễu quá thấp.** 4 ý nghiệp vụ bị chôn vùi giữa 7 dòng cơ chế. Người đọc code phải **mô phỏng chương trình trong đầu** — "à, `loc` bắt đầu rỗng, rồi thêm dần, rồi được sort, rồi..." — mới hiểu được ý định.

Đó là bản chất của **imperative programming**: bạn mô tả **LÀM THẾ NÀO** (HOW).

#### Cách mới — Declarative (khai báo)

```java
import static java.util.Comparator.comparingDouble;

public List<String> topSinhVien(List<SinhVien> danhSach) {
    return danhSach.stream()                                        // nguồn
        .filter(sv -> sv.tuoi() >= 18)                              // lọc tuổi
        .filter(sv -> sv.diemTrungBinh() >= 7.0)                    // lọc điểm
        .sorted(comparingDouble(SinhVien::diemTrungBinh).reversed())// sắp xếp giảm dần
        .limit(3)                                                   // lấy 3
        .map(SinhVien::hoTen)                                       // chuyển thành tên
        .toList();                                                  // gom kết quả
}
```

**Đếm lại:**

| Thứ | Số lượng |
|-----|----------|
| Biến tạm | **0** |
| Vòng lặp | **0** |
| Kiểm tra biên | **0** |
| Câu nghiệp vụ | **6** — và mỗi dòng đúng bằng **một** ý nghiệp vụ |

👉 Đọc từ trên xuống, mỗi dòng là **một câu tiếng Việt**: *"Lấy danh sách, lọc tuổi ≥ 18, lọc điểm ≥ 7, sắp giảm dần theo điểm, lấy 3, đổi thành tên, gom lại."*

Đó là **declarative programming**: bạn mô tả **CÁI GÌ** (WHAT), còn **LÀM THẾ NÀO** để thư viện lo.

### 0.2 Bảng đối chiếu Imperative ⟷ Declarative

| Tiêu chí | Imperative (`for` loop) | Declarative (Stream) |
|----------|-------------------------|----------------------|
| Bạn viết gì | **Cách** duyệt, cách gom | **Ý định** cần đạt |
| Ai điều khiển vòng lặp | **Bạn** (external iteration) | **Thư viện** (internal iteration) |
| Biến tạm | Nhiều | Không |
| Trạng thái thay đổi (mutation) | Có — `list.add(...)` | Không (nếu không lạm dụng) |
| Đọc hiểu | Phải mô phỏng trong đầu | Đọc như câu văn |
| Sửa yêu cầu ("lấy 5 thay vì 3") | Sửa điều kiện biên, dễ sai | Sửa `limit(3)` → `limit(5)` |
| Song song hoá | Viết tay `ExecutorService`, dễ race condition | Đổi `.stream()` → `.parallelStream()` |
| Tối ưu tự động | Không — bạn viết sao chạy vậy | **Có** — thư viện được phép hợp nhất, bỏ bước, dừng sớm |
| Debug từng bước | Dễ (đặt breakpoint bất kỳ) | Khó hơn (cần `peek`) |
| Hiệu năng thô (dữ liệu nhỏ) | Nhanh hơn một chút | Chậm hơn một chút (chi phí khởi tạo) |

> ⚠️ **Đừng hiểu nhầm:** Streams **không phải luôn nhanh hơn** vòng lặp. Với `List<Integer>` 10 phần tử, vòng `for` thắng. Lợi ích chính của Streams là **khả năng diễn đạt (expressiveness)** và **khả năng tối ưu của thư viện** — hiệu năng chỉ là hệ quả trong một số trường hợp. Ta sẽ đo đạc cụ thể ở [Phần 14](#phần-14--bảng-so-sánh-hiệu-năng).

### 0.3 Khái niệm cốt lõi: External vs Internal Iteration

Đây là **điểm khác biệt kỹ thuật quan trọng nhất**, không phải cú pháp.

```java
// EXTERNAL ITERATION — bạn cầm lái
for (SinhVien sv : danhSach) {   // Bạn quyết định: duyệt tuần tự, từ đầu đến cuối, 1 luồng
    System.out.println(sv.hoTen());
}
```

Bên dưới, `for-each` được compiler dịch thành:

```java
Iterator<SinhVien> it = danhSach.iterator();
while (it.hasNext()) {           // Bạn hỏi: "còn phần tử không?"
    SinhVien sv = it.next();     // Bạn lấy: "đưa tôi phần tử tiếp theo"
    System.out.println(sv.hoTen());
}
```

Bạn **kéo** (pull) từng phần tử ra. Vì bạn kiểm soát vòng lặp, **thư viện không được phép** thay đổi cách duyệt.

```java
// INTERNAL ITERATION — thư viện cầm lái
danhSach.stream().forEach(sv -> System.out.println(sv.hoTen()));
```

Bạn **đưa hành vi vào trong** (push behaviour in). Thư viện tự quyết định:
- Duyệt tuần tự hay song song?
- Duyệt theo thứ tự hay không cần thứ tự?
- Có cần duyệt hết không, hay dừng sớm được?
- Có gộp nhiều bước vào một lần duyệt được không?

👉 **Chính vì trao quyền điều khiển cho thư viện, Streams mới làm được lazy evaluation, short-circuiting và parallel.** Vòng `for` vĩnh viễn không làm được — vì bạn đã "khoá cứng" cách duyệt vào code.

Ẩn dụ:
> **External iteration** = bạn vào siêu thị, tự đẩy xe, tự đi từng kệ, tự lấy hàng.
> **Internal iteration** = bạn đưa danh sách mua hàng cho nhân viên. Họ có thể chia cho 5 người cùng đi (parallel), có thể bỏ qua kệ không cần (lazy), có thể dừng khi đã đủ hàng (short-circuit). Bạn chỉ quan tâm **kết quả**.

### 0.4 Năm ví dụ Before/After — độ khó tăng dần

#### Ví dụ 1 (dễ) — Đếm có điều kiện

```java
// ❌ BEFORE — imperative
long dem = 0;
for (SinhVien sv : danhSach) {
    if (sv.tuoi() >= 18) {
        dem++;
    }
}
```

```java
// ✅ AFTER — declarative
long dem = danhSach.stream()
    .filter(sv -> sv.tuoi() >= 18)
    .count();
```

**Điểm học:** biến đếm `dem` là **trạng thái thay đổi (mutable state)**. Mỗi biến mutable là một cơ hội để bug chui vào (quên khởi tạo, tăng nhầm chỗ, tăng 2 lần). Stream loại bỏ nó hoàn toàn.

#### Ví dụ 2 (dễ) — Lọc + biến đổi + gom

```java
// ❌ BEFORE
List<String> ten = new ArrayList<>();
for (SinhVien sv : danhSach) {
    if (sv.lop().equals("12A1")) {
        ten.add(sv.hoTen().toUpperCase());
    }
}
Collections.sort(ten);
```

```java
// ✅ AFTER
List<String> ten = danhSach.stream()
    .filter(sv -> sv.lop().equals("12A1"))
    .map(sv -> sv.hoTen().toUpperCase())
    .sorted()
    .toList();
```

**Điểm học:** ba nhiệm vụ **lọc**, **biến đổi**, **sắp xếp** vốn độc lập về mặt khái niệm. Ở bản imperative chúng bị **trộn lẫn** vào một vòng lặp (lọc và biến đổi) cộng một lời gọi rời rạc (sắp xếp). Ở bản stream mỗi nhiệm vụ là **một dòng riêng** — đúng nguyên tắc **Single Responsibility** ở cấp độ dòng code.

#### Ví dụ 3 (trung bình) — Vòng lặp lồng nhau → `flatMap`

Yêu cầu: *"Liệt kê tên tất cả sản phẩm đã từng được đặt (không trùng lặp)."*

```java
// ❌ BEFORE — 2 vòng lặp lồng nhau, có Set để khử trùng
Set<String> tenSanPham = new HashSet<>();
for (DonHang dh : donHang) {
    for (ChiTietDonHang ct : dh.chiTiet()) {   // ⚠️ lồng cấp 2
        tenSanPham.add(ct.sanPham().ten());
    }
}
List<String> ketQua = new ArrayList<>(tenSanPham);
Collections.sort(ketQua);
```

```java
// ✅ AFTER — flatMap "san phẳng" cấu trúc lồng
List<String> ketQua = donHang.stream()
    .flatMap(dh -> dh.chiTiet().stream())   // List<DonHang> → Stream<ChiTietDonHang>
    .map(ct -> ct.sanPham().ten())
    .distinct()
    .sorted()
    .toList();
```

**Điểm học:** đây là lúc Streams bắt đầu **thắng đậm**. Vòng lặp lồng nhau là kẻ thù số một của khả năng đọc: mỗi tầng lồng thêm làm độ phức tạp nhận thức tăng gấp đôi. `flatMap` biến "lồng nhau" thành "nối tiếp nhau" — pipeline vẫn **phẳng** dù dữ liệu **lồng**.

#### Ví dụ 4 (trung bình) — Gom nhóm

Yêu cầu: *"Đếm số sinh viên theo từng lớp."*

```java
// ❌ BEFORE — mẫu code "kiểm tra rồi khởi tạo" kinh điển
Map<String, Integer> demTheoLop = new HashMap<>();
for (SinhVien sv : danhSach) {
    String lop = sv.lop();
    if (!demTheoLop.containsKey(lop)) {   // ⚠️ 2 lần tra cứu map
        demTheoLop.put(lop, 0);
    }
    demTheoLop.put(lop, demTheoLop.get(lop) + 1);   // ⚠️ thêm 2 lần nữa
}
```

```java
// ✅ AFTER
Map<String, Long> demTheoLop = danhSach.stream()
    .collect(Collectors.groupingBy(SinhVien::lop, Collectors.counting()));
```

**Điểm học:** bản imperative tra cứu `HashMap` **4 lần** cho mỗi phần tử và có 1 lỗi tiềm ẩn nếu `lop` là `null`. Bản stream diễn đạt trực tiếp ý định: *"nhóm theo lớp, mỗi nhóm thì đếm"*. Đây là sức mạnh của **Collectors** — chủ đề của [Phần 6](#phần-6--collectors--bộ-công-cụ-quyền-lực).

#### Ví dụ 5 (khó) — Nghiệp vụ thật: doanh thu theo danh mục

Yêu cầu: *"Với các đơn đã hoàn thành, tính tổng doanh thu theo từng danh mục sản phẩm, sắp xếp giảm dần."*

```java
// ❌ BEFORE — 45 dòng, 3 vòng lặp, 3 biến tạm, dễ sai
Map<String, BigDecimal> doanhThu = new HashMap<>();
for (DonHang dh : donHang) {
    if (dh.trangThai() != TrangThai.HOAN_THANH) {
        continue;
    }
    for (ChiTietDonHang ct : dh.chiTiet()) {
        String dm = ct.sanPham().danhMuc();
        BigDecimal tien = ct.sanPham().gia().multiply(BigDecimal.valueOf(ct.soLuong()));
        BigDecimal hienTai = doanhThu.get(dm);
        if (hienTai == null) {
            doanhThu.put(dm, tien);
        } else {
            doanhThu.put(dm, hienTai.add(tien));
        }
    }
}
// Sắp xếp giảm dần theo doanh thu — phải chuyển sang List rồi sort
List<Map.Entry<String, BigDecimal>> ds = new ArrayList<>(doanhThu.entrySet());
ds.sort((a, b) -> b.getValue().compareTo(a.getValue()));
LinkedHashMap<String, BigDecimal> ketQua = new LinkedHashMap<>();
for (Map.Entry<String, BigDecimal> e : ds) {
    ketQua.put(e.getKey(), e.getValue());
}
```

```java
// ✅ AFTER — 10 dòng, ý định rõ ràng
import static java.util.stream.Collectors.*;
import static java.util.Map.Entry.comparingByValue;

Map<String, BigDecimal> ketQua = donHang.stream()
    .filter(dh -> dh.trangThai() == TrangThai.HOAN_THANH)
    .flatMap(dh -> dh.chiTiet().stream())
    .collect(groupingBy(
        ct -> ct.sanPham().danhMuc(),                              // khoá nhóm
        reducing(BigDecimal.ZERO, ChiTietDonHang::thanhTien, BigDecimal::add)  // gộp trong nhóm
    ))
    .entrySet().stream()
    .sorted(comparingByValue(Comparator.<BigDecimal>reverseOrder()))
    .collect(toMap(Map.Entry::getKey, Map.Entry::getValue,
                   (a, b) -> a, LinkedHashMap::new));              // giữ thứ tự
```

**Điểm học:** ở quy mô nghiệp vụ thật, khoảng cách không còn là "gọn hơn chút" mà là **45 dòng vs 10 dòng**, và quan trọng hơn: bản stream **không có chỗ nào để giấu bug**. Không có `null` check thủ công, không có biến tạm bị gán nhầm, không có vòng lặp bị `break` sai chỗ.

> 🎯 **Chốt Phần 0:** Streams không phải "for loop viết kiểu mới". Streams là **chuyển đổi mô hình tư duy** — từ *ra lệnh cho máy làm từng bước* sang *mô tả phép biến đổi dữ liệu*. Khi bạn tư duy được theo kiểu "dữ liệu chảy qua các trạm biến đổi", bạn đã nắm được cốt lõi của functional programming — và đây cũng chính là nền tảng cho **Reactive Programming** (WebFlux) ở Tầng 10.

---
## Phần 1 — Giải Phẫu Một Stream Pipeline

### 1.1 Định nghĩa chính xác: Stream KHÔNG phải là gì

Trước khi nói Stream **là gì**, hãy dọn sạch những hiểu nhầm phổ biến nhất:

| Hiểu nhầm | Sự thật |
|-----------|---------|
| ❌ "Stream là một collection mới" | Stream **không lưu trữ phần tử nào cả**. Nó là *ống dẫn*, không phải *thùng chứa*. |
| ❌ "Stream sửa collection gốc" | Stream **không bao giờ** sửa nguồn. Mọi thao tác đều tạo giá trị mới. |
| ❌ "Stream dùng được nhiều lần" | Stream chỉ dùng **một lần**. Dùng lại → `IllegalStateException`. |
| ❌ "Stream luôn nhanh hơn for" | Sai. Có chi phí khởi tạo pipeline; dữ liệu nhỏ thì `for` nhanh hơn. |
| ❌ "Stream liên quan tới I/O như `InputStream`" | **Hoàn toàn không liên quan**. Trùng tên thôi. `java.util.stream.Stream` ≠ `java.io.InputStream`. |
| ❌ "`.parallel()` luôn nhanh hơn" | Sai nghiêm trọng. Xem [Phần 10](#phần-10--parallel-streams--sức-mạnh-và-cạm-bẫy). |

**Định nghĩa chuẩn (theo Javadoc):**

> A sequence of elements supporting sequential and parallel aggregate operations.
> *(Một dãy phần tử hỗ trợ các thao tác tổng hợp tuần tự và song song.)*

Diễn giải theo cách dễ nhớ:

> **Stream = một "băng chuyền" các phần tử + một tập chỉ dẫn biến đổi, chỉ khởi động khi có người yêu cầu kết quả.**

### 1.2 Ba phần của mọi pipeline

Mọi stream pipeline — không có ngoại lệ — gồm đúng 3 phần:

```text
┌─────────────┐   ┌───────────────────────────────────┐   ┌──────────────┐
│   NGUỒN     │──▶│  0..n TOÁN TỬ TRUNG GIAN (lười)   │──▶│ 1 TOÁN TỬ    │
│  (Source)   │   │  map / filter / sorted / limit... │   │ KẾT THÚC     │
│             │   │  → mỗi cái trả về Stream mới      │   │ (Terminal)   │
└─────────────┘   └───────────────────────────────────┘   └──────────────┘
     ▲                          ▲                                ▲
 collection,              KHÔNG chạy gì cả                   ⚡ KÍCH HOẠT
 array, file,             chỉ "ghi nhớ" ý định              toàn bộ pipeline
 generator                                                   trả về giá trị
                                                             (KHÔNG phải Stream)
```

Đọc lại đoạn code ở Phần 0 với con mắt mới:

```java
danhSach.stream()                    // ① NGUỒN     → trả Stream<SinhVien>
    .filter(sv -> sv.tuoi() >= 18)   // ② TRUNG GIAN → trả Stream<SinhVien>
    .sorted(...)                     // ③ TRUNG GIAN → trả Stream<SinhVien>
    .limit(3)                        // ④ TRUNG GIAN → trả Stream<SinhVien>
    .map(SinhVien::hoTen)            // ⑤ TRUNG GIAN → trả Stream<String>  ⚠️ đổi kiểu!
    .toList();                       // ⑥ KẾT THÚC   → trả List<String>    ⚠️ KHÔNG phải Stream
```

**Quy tắc nhận biết bằng mắt — 100% chính xác:**

> 🔑 Nếu method **trả về `Stream`** (hoặc `IntStream`/`LongStream`/`DoubleStream`) → đó là **toán tử trung gian**, nó **LƯỜI**.
> 🔑 Nếu method trả về **bất cứ thứ gì khác** (`List`, `long`, `Optional`, `boolean`, `void`, `int[]`...) → đó là **toán tử kết thúc**, nó **CHĂM**.

Bạn không cần học thuộc danh sách 70 toán tử. Bạn chỉ cần nhìn **kiểu trả về**.

### 1.3 Cây thừa kế: `BaseStream` và họ hàng

```text
                   AutoCloseable
                        │
                 BaseStream<T, S>          ← interface gốc, có close(), iterator(), spliterator()
                        │
        ┌───────────────┼───────────────┬──────────────┐
        │               │               │              │
    Stream<T>       IntStream      LongStream     DoubleStream
   (object)         (int)            (long)         (double)
        │
        └── map, filter, flatMap, collect, ...
```

**Vì sao cần 3 stream nguyên thuỷ riêng?** Vì `Stream<Integer>` phải **đóng hộp (box)** mỗi số thành object `Integer` — tốn bộ nhớ và thời gian. `IntStream` làm việc trực tiếp trên `int`. Chi tiết ở [Phần 8](#phần-8--primitive-streams--intstream--longstream--doublestream).

```java
// Cùng một phép tính, hai thế giới khác nhau
Stream<Integer> boxed = List.of(1, 2, 3).stream();        // mỗi phần tử là 1 object trên heap
IntStream       thuan = IntStream.of(1, 2, 3);            // mảng int thuần, 0 object

int tong1 = boxed.mapToInt(Integer::intValue).sum();      // phải unbox
int tong2 = thuan.sum();                                  // ⭐ sum() chỉ có trên IntStream!
```

> ⚠️ `Stream<T>` **không có** method `sum()`, `average()`, `max()` không tham số. Muốn dùng phải chuyển sang stream nguyên thuỷ bằng `mapToInt` / `mapToLong` / `mapToDouble`.

### 1.4 Ba đặc tính bất biến của Stream

#### Đặc tính 1 — Không lưu trữ (No storage)

```java
List<SinhVien> nguon = new ArrayList<>(DuLieuMau.sinhVien());
Stream<SinhVien> s = nguon.stream();

// Stream s KHÔNG chứa bản sao dữ liệu.
// Nó chỉ giữ một tham chiếu tới nguồn + cách duyệt (Spliterator).
// Bộ nhớ mà s chiếm là HẰNG SỐ, dù nguồn có 10 hay 10 triệu phần tử.
```

Hệ quả quan trọng: bạn có thể stream một **file 100GB** mà chỉ tốn vài KB RAM.

```java
// Đọc file khổng lồ mà không nạp hết vào RAM
try (Stream<String> dong = Files.lines(Path.of("log-100GB.txt"))) {
    long soLoi = dong.filter(d -> d.contains("ERROR")).count();
    System.out.println("Số dòng lỗi: " + soLoi);
}
// ⚠️ Files.lines() mở tài nguyên hệ thống → BẮT BUỘC dùng try-with-resources
```

#### Đặc tính 2 — Không sửa nguồn (Non-interfering)

```java
List<String> ten = List.of("An", "Bình", "Chi");

List<String> hoa = ten.stream()
    .map(String::toUpperCase)
    .toList();

System.out.println(ten);   // [An, Bình, Chi]      ← nguồn NGUYÊN VẸN
System.out.println(hoa);   // [AN, BÌNH, CHI]      ← danh sách MỚI
```

So sánh với cách imperative làm hỏng dữ liệu gốc:

```java
List<String> ten = new ArrayList<>(List.of("An", "Bình", "Chi"));
for (int i = 0; i < ten.size(); i++) {
    ten.set(i, ten.get(i).toUpperCase());   // ☠️ PHÁ HUỶ dữ liệu gốc
}
// Ai đó khác đang giữ tham chiếu tới `ten` sẽ bị bất ngờ → nguồn gốc của bug khó tìm nhất
```

#### Đặc tính 3 — Dùng một lần (Single-use / Consumable)

```java
Stream<SinhVien> s = DuLieuMau.sinhVien().stream();

long a = s.count();   // ✅ OK — terminal operation đầu tiên
long b = s.count();   // 💥 IllegalStateException: stream has already been operated upon or closed
```

**Vì sao?** Vì stream không lưu dữ liệu — sau khi terminal op chạy xong, "băng chuyền" đã chảy hết, không thể tua lại. Đây là **thiết kế cố ý**: nếu cho phép tua lại, JDK sẽ phải cache dữ liệu → mất đi ưu điểm bộ nhớ hằng số.

**Cách làm đúng:** tạo stream mới từ nguồn, hoặc dùng `Supplier<Stream<T>>`:

```java
// ✅ Cách 1 — gọi .stream() lại
List<SinhVien> ds = DuLieuMau.sinhVien();
long a = ds.stream().count();
long b = ds.stream().filter(sv -> sv.tuoi() > 18).count();

// ✅ Cách 2 — nhà máy sinh stream (khi nguồn khó lấy lại)
Supplier<Stream<SinhVien>> nhaMay = () -> DuLieuMau.sinhVien().stream();
long a2 = nhaMay.get().count();
long b2 = nhaMay.get().filter(sv -> sv.tuoi() > 18).count();
```

> 💡 `Supplier<T>` chính là functional interface bạn đã học ở Chương 3 — "hàm không nhận gì, trả về T". Ở đây nó đóng vai trò **nhà máy sản xuất stream mới mỗi lần gọi**.

### 1.5 Bên trong: pipeline được biểu diễn thế nào?

Khi bạn viết `.filter(...).map(...)`, JDK **không** tạo ra dữ liệu trung gian. Nó xây một **danh sách liên kết ngược của các "stage"**:

```text
   head (source stage)
     │  depth = 0
     ▼
  StatelessOp (filter)     ← previousStage = head
     │  depth = 1
     ▼
  StatelessOp (map)        ← previousStage = filter
     │  depth = 2
     ▼
  [terminal: collect]      ← khi gọi, nó "đi ngược lên" tới head rồi kéo dữ liệu xuống
```

Các class thật trong JDK (bạn có thể mở source ra xem):

| Class | Vai trò |
|-------|---------|
| `java.util.stream.AbstractPipeline` | Lớp cha, giữ `sourceStage`, `previousStage`, `depth`, `sourceSpliterator` |
| `ReferencePipeline` | Cài đặt `Stream<T>` |
| `IntPipeline` / `LongPipeline` / `DoublePipeline` | Cài đặt stream nguyên thuỷ |
| `Sink<T>` | ⭐ Interface "phễu" — mỗi toán tử được biến thành một `Sink` với 3 method: `begin(size)`, `accept(t)`, `end()` |
| `Spliterator<T>` | ⭐ Nguồn cấp phần tử, biết cách **tự chia đôi** (`trySplit()`) để chạy song song |

Khi terminal op chạy, JDK **xâu chuỗi các `Sink` lại thành một hàm gộp duy nhất** rồi đẩy từng phần tử qua. Đây là lý do vì sao pipeline 5 toán tử vẫn chỉ duyệt nguồn **một lần**.

```java
// Mô phỏng cực đơn giản cơ chế Sink để bạn hình dung
interface Sink<T> {
    default void begin(long size) {}
    void accept(T t);
    default void end() {}
}

// filter(p) tạo ra Sink này, bọc quanh sink kế tiếp
static <T> Sink<T> filterSink(Predicate<T> p, Sink<T> next) {
    return t -> { if (p.test(t)) next.accept(t); };   // chỉ đẩy xuống nếu thoả
}

// map(f) tạo ra Sink này
static <T, R> Sink<T> mapSink(Function<T, R> f, Sink<R> next) {
    return t -> next.accept(f.apply(t));              // biến đổi rồi đẩy xuống
}
```

👉 Nhìn vào đây bạn thấy ngay: **`filter` và `map` chỉ là các hàm bọc nhau**. Khi chạy, một phần tử đi từ nguồn xuyên qua toàn bộ chuỗi bọc đó trong **một lần gọi hàm lồng nhau** — không có `List` trung gian nào được tạo.

---

## Phần 2 — Lazy Evaluation — Trái Tim Của Streams

Đây là phần **quan trọng nhất chương**. Nếu bạn chỉ nhớ được một điều từ chương này, hãy nhớ phần này.

### 2.1 Thí nghiệm 1: Toán tử trung gian KHÔNG chạy gì cả

```java
public class ThiNghiemLuoi1 {
    public static void main(String[] args) {
        List<String> ten = List.of("An", "Bình", "Chi");

        System.out.println("--- Bắt đầu xây pipeline ---");

        Stream<String> pipeline = ten.stream()
            .filter(s -> {
                System.out.println("  filter kiểm tra: " + s);
                return s.length() > 2;
            })
            .map(s -> {
                System.out.println("  map biến đổi: " + s);
                return s.toUpperCase();
            });

        System.out.println("--- Đã xây xong pipeline ---");
        System.out.println("(chưa gọi terminal op)");
    }
}
```

**Output thực tế:**

```text
--- Bắt đầu xây pipeline ---
--- Đã xây xong pipeline ---
(chưa gọi terminal op)
```

😮 **Không một dòng `filter kiểm tra` hay `map biến đổi` nào được in!**

Đây là bằng chứng không thể chối cãi: **`filter` và `map` chưa hề chạy**. Chúng chỉ *ghi nhớ* rằng "sau này khi có ai đó cần dữ liệu, hãy áp dụng hàm này".

Bây giờ thêm terminal op:

```java
        // ... code như trên, nhưng thêm dòng cuối:
        List<String> ketQua = pipeline.toList();   // ⚡ KÍCH HOẠT
        System.out.println("Kết quả: " + ketQua);
```

**Output:**

```text
--- Bắt đầu xây pipeline ---
--- Đã xây xong pipeline ---
  filter kiểm tra: An
  filter kiểm tra: Bình
  map biến đổi: Bình
  filter kiểm tra: Chi
  map biến đổi: Chi
Kết quả: [BÌNH, CHI]
```

### 2.2 Phát hiện chấn động: dữ liệu chảy theo CHIỀU DỌC

Hãy nhìn kỹ output trên. Nếu stream hoạt động như bạn tưởng — *"filter hết rồi mới map hết"* — output sẽ là:

```text
  filter kiểm tra: An
  filter kiểm tra: Bình
  filter kiểm tra: Chi     ← filter xong TẤT CẢ
  map biến đổi: Bình
  map biến đổi: Chi        ← rồi mới map
```

Nhưng thực tế là:

```text
  filter kiểm tra: An      ← An rớt, không đi tiếp
  filter kiểm tra: Bình
  map biến đổi: Bình       ← Bình đi HẾT pipeline ngay
  filter kiểm tra: Chi
  map biến đổi: Chi        ← rồi mới đến Chi
```

👉 **Mỗi phần tử đi HẾT toàn bộ pipeline trước khi phần tử tiếp theo bắt đầu.**

Người ta gọi đây là **vertical processing** (xử lý theo chiều dọc) hay **element-at-a-time / loop fusion**.

```text
CÁCH BẠN TƯỞNG (horizontal — sai):        THỰC TẾ (vertical — đúng):

nguồn:  An   Bình  Chi                    An ─┬─ filter? ✗ → loại
         │    │     │                         └─ (dừng)
      ┌──▼────▼─────▼──┐
      │     filter     │  ← duyệt hết      Bình ┬─ filter? ✓
      └──┬──────┬──────┘                       ├─ map → "BÌNH"
         │      │                              └─ vào kết quả
      ┌──▼──────▼──┐
      │     map    │     ← duyệt lại       Chi ─┬─ filter? ✓
      └──┬──────┬──┘                            ├─ map → "CHI"
         │      │                               └─ vào kết quả
      BÌNH    CHI
      (2 lần duyệt, 1 List tạm)            (1 lần duyệt, 0 List tạm)
```

**Ba lợi ích khổng lồ của xử lý theo chiều dọc:**

1. **Không tạo collection trung gian** → tiết kiệm bộ nhớ. Pipeline 10 toán tử vẫn 0 byte trung gian.
2. **Chỉ duyệt nguồn 1 lần** → tốt cho cache CPU, tốt cho nguồn không tua lại được (file, network).
3. **Cho phép dừng sớm (short-circuit)** → mục tiếp theo.

### 2.3 Thí nghiệm 2: Short-circuiting — sức mạnh của lười

Đây là ví dụ mà đề bài yêu cầu minh hoạ: `filter(x > 5) → map(x * 2) → limit(3) → forEach`.

```java
public class ThiNghiemLuoi2 {
    public static void main(String[] args) {
        List<Integer> so = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);

        so.stream()
            .peek(x -> System.out.println("① nguồn phát ra: " + x))
            .filter(x -> {
                System.out.println("   ② filter(" + x + " > 5)");
                return x > 5;
            })
            .map(x -> {
                System.out.println("      ③ map(" + x + " * 2)");
                return x * 2;
            })
            .limit(3)   // ⭐ CHỈ CẦN 3 KẾT QUẢ
            .forEach(x -> System.out.println("         ④ nhận: " + x));
    }
}
```

**Output thực tế:**

```text
① nguồn phát ra: 1
   ② filter(1 > 5)
① nguồn phát ra: 2
   ② filter(2 > 5)
① nguồn phát ra: 3
   ② filter(3 > 5)
① nguồn phát ra: 4
   ② filter(4 > 5)
① nguồn phát ra: 5
   ② filter(5 > 5)
① nguồn phát ra: 6
   ② filter(6 > 5)
      ③ map(6 * 2)
         ④ nhận: 12
① nguồn phát ra: 7
   ② filter(7 > 5)
      ③ map(7 * 2)
         ④ nhận: 14
① nguồn phát ra: 8
   ② filter(8 > 5)
      ③ map(8 * 2)
         ④ nhận: 16
```

**Phân tích số liệu — hãy ngẫm kỹ bảng này:**

| Chỉ số | Nếu duyệt hết (imperative) | Thực tế (stream lazy) | Tiết kiệm |
|--------|---------------------------|----------------------|-----------|
| Phần tử nguồn được lấy | 15 | **8** | 47% |
| Lần gọi `filter` | 15 | **8** | 47% |
| Lần gọi `map` | 10 | **3** | **70%** |
| Object trung gian tạo ra | 2 List (15 + 10 phần tử) | **0** | 100% |

👉 Các phần tử **9, 10, 11, 12, 13, 14, 15 KHÔNG BAO GIỜ được chạm tới.** Nguồn dừng phát ngay khi `limit(3)` báo "tôi đủ rồi".

**Sơ đồ luồng dữ liệu:**

```text
        nguồn        filter(>5)      map(*2)       limit(3)      forEach
         1  ────────▶  ✗ loại
         2  ────────▶  ✗ loại
         3  ────────▶  ✗ loại
         4  ────────▶  ✗ loại
         5  ────────▶  ✗ loại
         6  ────────▶  ✓ ──────────▶ 12 ────────▶ [1/3] ──────▶ in 12
         7  ────────▶  ✓ ──────────▶ 14 ────────▶ [2/3] ──────▶ in 14
         8  ────────▶  ✓ ──────────▶ 16 ────────▶ [3/3] ──────▶ in 16
                                                     ║
         9  ╳  ◀═══════ TÍN HIỆU DỪNG ═══════════════╝
        10  ╳          (cancellationRequested = true)
        ...
        15  ╳          → không bao giờ được đọc
```

**Cơ chế kỹ thuật:** interface `Sink` có method `boolean cancellationRequested()`. `limit` trả `true` khi đã đủ số lượng; vòng lặp ở nguồn kiểm tra cờ này sau mỗi phần tử và **thoát ngay**.

### 2.4 Trường hợp cực đoan: stream vô hạn

Nếu chưa tin lazy evaluation là "thật", hãy xem ví dụ này — code chạy trong 1 mili giây dù nguồn là **vô hạn**:

```java
// Sinh dãy số tự nhiên VÔ HẠN: 0, 1, 2, 3, ...
List<Integer> ketQua = Stream.iterate(0, n -> n + 1)   // ♾️ vô hạn
    .filter(n -> n % 7 == 0)                            // chia hết cho 7
    .map(n -> n * n)                                    // bình phương
    .limit(5)                                           // ⭐ chỉ lấy 5
    .toList();

System.out.println(ketQua);   // [0, 49, 196, 441, 784]
// Chạy tức thì. Nếu KHÔNG lười, chương trình sẽ treo mãi mãi.
```

Với vòng lặp `for` truyền thống, bạn **không thể** viết "dãy vô hạn" rồi lọc — bạn buộc phải biết trước điểm dừng. Lazy evaluation cho phép **tách bạch việc mô tả dữ liệu và việc quyết định lấy bao nhiêu**.

> ⚠️ Nhưng nếu quên `limit`, chương trình sẽ **treo vĩnh viễn** hoặc `OutOfMemoryError`. Xem lỗi #10 ở [Phần 15](#phần-15--16-lỗi-streams-kinh-điển).

### 2.5 Thí nghiệm 3: Thứ tự toán tử ảnh hưởng số lần gọi

Cùng một kết quả, hai cách viết, chi phí khác nhau **rõ rệt**:

```java
List<SinhVien> ds = DuLieuMau.sinhVien();   // 7 phần tử

// ❌ CHẬM — map trước, filter sau
long dem1 = ds.stream()
    .map(sv -> { System.out.println("map " + sv.hoTen()); return sv.hoTen().toUpperCase(); })
    .filter(ten -> ten.length() > 8)
    .count();
// → map chạy 7 lần

// ✅ NHANH — filter trước, map sau
long dem2 = ds.stream()
    .filter(sv -> sv.hoTen().length() > 8)
    .map(sv -> { System.out.println("map " + sv.hoTen()); return sv.hoTen().toUpperCase(); })
    .count();
// → map chỉ chạy trên các phần tử SỐNG SÓT
```

> 🎓 **Nguyên tắc vàng #1: LỌC SỚM NHẤT CÓ THỂ.**
> Đặt `filter` càng gần nguồn càng tốt, để các toán tử đắt tiền phía sau (`map` gọi API, `sorted`, `flatMap`) xử lý ít phần tử nhất.

Trường hợp cực đoan hơn — `sorted` và `limit`:

```java
// ❌ Sắp xếp 1 triệu phần tử rồi mới lọc còn 100
danhSachLon.stream().sorted(comparator).filter(dieuKien).limit(10).toList();

// ✅ Lọc còn 100 rồi mới sắp xếp
danhSachLon.stream().filter(dieuKien).sorted(comparator).limit(10).toList();
//                                     ▲ chi phí O(n log n) trên n nhỏ hơn RẤT nhiều
```

### 2.6 Thí nghiệm 4: JDK còn tự tối ưu giúp bạn

Đôi khi JDK "nhìn thấy" toán tử của bạn là vô nghĩa và **bỏ qua luôn**:

```java
List<String> ten = List.of("An", "Bình", "Chi");

long dem = ten.stream()
    .map(s -> {
        System.out.println("map được gọi cho: " + s);   // ⚠️ Có in ra không?
        return s.toUpperCase();
    })
    .count();

System.out.println("Số lượng: " + dem);
```

**Output (Java 9+):**

```text
Số lượng: 3
```

😲 **`map` không hề được gọi!** Vì:
- `count()` chỉ cần biết **số lượng**;
- `map` là ánh xạ 1-1 → **không đổi số lượng**;
- nguồn `List.of(...)` biết chính xác kích thước (`SIZED`);
- → JDK trả thẳng `3` mà **không duyệt phần tử nào**.

**Đây vừa là ưu điểm vừa là cạm bẫy:**

```java
// 💣 BUG THẬT trong production
List<Order> orders = ...;
long n = orders.stream()
    .map(o -> { auditService.log(o); return o; })  // ☠️ side effect trong map
    .count();
// → audit log KHÔNG BAO GIỜ được ghi!
```

> 🎓 **Nguyên tắc vàng #2: KHÔNG BAO GIỜ đặt side effect trong toán tử trung gian.**
> Vì stream lười, bạn **không kiểm soát được** toán tử có chạy không, chạy bao nhiêu lần, chạy trên thread nào.

Nếu thêm `filter` (có thể đổi số lượng), JDK không tối ưu được nữa:

```java
long dem = ten.stream()
    .filter(s -> true)    // ⚠️ JDK không biết filter loại bao nhiêu
    .map(s -> { System.out.println("map: " + s); return s; })
    .count();
// Output: map: An / map: Bình / map: Chi / 3   ← lúc này map CÓ chạy
```

### 2.7 Bảng tổng kết: điều gì kích hoạt điều gì

| Tình huống | Pipeline có chạy? | Lý do |
|-----------|-------------------|-------|
| Chỉ có toán tử trung gian | ❌ Không | Không có terminal op |
| Có terminal op `collect` | ✅ Toàn bộ nguồn | Cần mọi phần tử |
| Có `findFirst()` | ✅ Đến khi tìm thấy | Short-circuit |
| Có `anyMatch()` | ✅ Đến phần tử đầu thoả | Short-circuit |
| Có `allMatch()` | ✅ Đến phần tử đầu **không** thoả | Short-circuit |
| Có `limit(n)` | ✅ Đến khi đủ n | Short-circuit |
| `count()` + chỉ toán tử không đổi số lượng | ⚠️ **Không duyệt** | JDK tối ưu bằng `SIZED` |
| Có `sorted()` | ✅ **Toàn bộ**, luôn luôn | Phải thấy hết mới sắp được |
| Có `distinct()` | ✅ Toàn bộ (trừ khi có `limit` sau) | Phải nhớ đã thấy gì |

> 🎯 **Chốt Phần 2:** *Lười không phải là lười biếng — lười là thông minh.* Bằng cách trì hoãn tính toán tới phút cuối, Streams có được ba thứ mà vòng lặp thủ công không bao giờ có: **hợp nhất vòng lặp (loop fusion)**, **dừng sớm (short-circuiting)** và **cơ hội tối ưu tự động**.

---
## Phần 3 — Tạo Stream — Mọi Nguồn Dữ Liệu

Trước khi biến đổi, phải có nguồn. Java cho bạn **hơn 15 cách** tạo stream. Dưới đây là danh sách đầy đủ, phân theo tình huống.

### 3.1 Từ Collection — cách phổ biến nhất (99% trường hợp)

```java
List<SinhVien> ds = DuLieuMau.sinhVien();

Stream<SinhVien> s1 = ds.stream();           // tuần tự
Stream<SinhVien> s2 = ds.parallelStream();   // song song (cẩn thận! xem Phần 10)

Set<String> tap = Set.of("a", "b", "c");
Stream<String> s3 = tap.stream();

// ⚠️ Map KHÔNG có .stream() — phải đi qua entrySet/keySet/values
Map<String, Integer> map = Map.of("a", 1, "b", 2);
Stream<Map.Entry<String, Integer>> s4 = map.entrySet().stream();   // ⭐ hay dùng nhất
Stream<String>  s5 = map.keySet().stream();
Stream<Integer> s6 = map.values().stream();
```

> 💡 `stream()` là **default method** trên `java.util.Collection` (Java 8 thêm vào). Đây chính là lý do JDK 8 có thể thêm Streams mà **không phá vỡ** hàng triệu dòng code cũ — bài học về `default method` bạn đã học ở Chương 1.

### 3.2 Từ mảng

```java
String[] mang = {"An", "Bình", "Chi"};

Stream<String> s1 = Arrays.stream(mang);            // ⭐ chuẩn nhất
Stream<String> s2 = Stream.of(mang);                // varargs — cũng chạy được với mảng object
Stream<String> s3 = Arrays.stream(mang, 1, 3);      // chỉ lấy index [1, 3) → "Bình", "Chi"

// ⚠️ CẠM BẪY với mảng nguyên thuỷ
int[] soNguyen = {1, 2, 3};
IntStream ok    = Arrays.stream(soNguyen);          // ✅ IntStream — đúng ý
Stream<int[]> sai = Stream.of(soNguyen);            // ☠️ Stream chứa ĐÚNG 1 phần tử là cả mảng!

System.out.println(Stream.of(soNguyen).count());    // 1  😱
System.out.println(Arrays.stream(soNguyen).count());// 3  ✅
```

**Giải thích cạm bẫy:** `Stream.of(T... values)` là generic. Với `int[]`, `T` không thể là `int` (generic không nhận primitive), nên compiler suy ra `T = int[]` → varargs nhận **một** đối số. Với `String[]`, `T = String` nên varargs "trải" ra 3 phần tử. Đây là hệ quả trực tiếp của **type erasure** (Chương 3).

### 3.3 Từ giá trị rời rạc

```java
Stream<String> s1 = Stream.of("An", "Bình", "Chi");
Stream<String> s2 = Stream.of("chỉ một");
Stream<String> rong = Stream.empty();                   // stream rỗng, KHÔNG null

// Java 9+ — stream 0 hoặc 1 phần tử, null-safe
String coTheNull = timTen();
Stream<String> s3 = Stream.ofNullable(coTheNull);       // null → stream rỗng ⭐

// ❌ Trước Java 9 phải viết
Stream<String> s4 = coTheNull == null ? Stream.empty() : Stream.of(coTheNull);
```

### 3.4 Stream nguyên thuỷ và dãy số

```java
IntStream a = IntStream.of(1, 2, 3);
IntStream b = IntStream.range(0, 5);          // 0,1,2,3,4      — cận phải MỞ
IntStream c = IntStream.rangeClosed(1, 5);    // 1,2,3,4,5      — cận phải ĐÓNG
LongStream d = LongStream.rangeClosed(1, 1_000_000L);
DoubleStream e = DoubleStream.of(1.5, 2.5);

// ⭐ Thay thế vòng for cổ điển
for (int i = 0; i < 5; i++) System.out.println(i);   // cũ
IntStream.range(0, 5).forEach(System.out::println);  // mới

// Lấy phần tử theo chỉ số — khi cần cả index lẫn giá trị
List<String> ten = List.of("An", "Bình", "Chi");
IntStream.range(0, ten.size())
    .mapToObj(i -> (i + 1) + ". " + ten.get(i))
    .forEach(System.out::println);
// 1. An / 2. Bình / 3. Chi
```

> 💡 **Mẹo nhớ:** `range` = *khoảng* (như toán học `[0, 5)`), `rangeClosed` = *khoảng đóng* `[1, 5]`.

### 3.5 Stream vô hạn — `iterate` và `generate`

```java
// ① iterate — mỗi phần tử sinh ra từ phần tử trước (có trạng thái)
Stream.iterate(1, n -> n * 2)              // 1, 2, 4, 8, 16, ...
      .limit(10)
      .forEach(System.out::println);

// ② iterate 3 tham số (Java 9+) — CÓ điều kiện dừng, giống hệt vòng for ⭐
Stream.iterate(1, n -> n < 100, n -> n * 2)   // seed, hasNext, next
      .forEach(System.out::println);          // 1,2,4,8,16,32,64 — tự dừng!

// ③ generate — mỗi phần tử độc lập (không phụ thuộc phần tử trước)
Stream.generate(Math::random).limit(5).forEach(System.out::println);
Stream.generate(() -> "xin chào").limit(3).forEach(System.out::println);
```

**Bảng phân biệt:**

| | `Stream.iterate` | `Stream.generate` |
|---|------------------|-------------------|
| Tham số | `seed` + `UnaryOperator<T>` | `Supplier<T>` |
| Phần tử phụ thuộc phần tử trước? | ✅ Có | ❌ Không |
| Có thứ tự (ORDERED)? | ✅ Có | ❌ Không |
| Song song hoá tốt? | ❌ Rất tệ (bản chất tuần tự) | ⚠️ Được, nếu Supplier thread-safe |
| Dùng cho | Dãy số, dãy Fibonacci, ngày tháng liên tiếp | Số ngẫu nhiên, hằng số, đọc từ hàng đợi |

```java
// Ứng dụng thực tế: sinh 7 ngày tiếp theo
LocalDate homNay = LocalDate.now();
Stream.iterate(homNay, d -> d.plusDays(1))
      .limit(7)
      .forEach(System.out::println);

// Dãy Fibonacci bằng iterate với mảng 2 phần tử làm "trạng thái"
Stream.iterate(new long[]{0, 1}, f -> new long[]{f[1], f[0] + f[1]})
      .limit(10)
      .map(f -> f[0])
      .forEach(n -> System.out.print(n + " "));   // 0 1 1 2 3 5 8 13 21 34
```

### 3.6 Từ chuỗi ký tự

```java
String cau = "Java Streams rất mạnh mẽ";

// Tách từ
Stream<String> tu = Arrays.stream(cau.split("\\s+"));
Stream<String> tu2 = Pattern.compile("\\s+").splitAsStream(cau);   // ⭐ lười hơn, không tạo mảng

// Tách ký tự → IntStream các code point
cau.chars()                                  // IntStream (mã Unicode!)
   .mapToObj(c -> (char) c)                  // đổi về Character
   .filter(Character::isLetter)
   .forEach(System.out::print);

// Java 11+ — tách theo dòng
String vanBan = "dòng 1\ndòng 2\ndòng 3";
vanBan.lines().forEach(System.out::println);   // ⭐ tốt hơn split("\n")
```

> ⚠️ `"abc".chars()` trả về `IntStream` chứ **không phải** `Stream<Character>`. In trực tiếp sẽ ra số: `97 98 99`. Phải `mapToObj(c -> (char) c)`.

### 3.7 Từ file và I/O

```java
Path duongDan = Path.of("data/nhat-ky.log");

// ⭐ BẮT BUỘC try-with-resources — stream này giữ file handle
try (Stream<String> dong = Files.lines(duongDan)) {
    dong.filter(d -> d.contains("ERROR"))
        .limit(100)
        .forEach(System.out::println);
}   // file được đóng tự động

// Duyệt cây thư mục
try (Stream<Path> tep = Files.walk(Path.of("src"), 3)) {   // sâu tối đa 3 cấp
    tep.filter(p -> p.toString().endsWith(".java"))
       .forEach(System.out::println);
}

// Liệt kê thư mục (chỉ 1 cấp)
try (Stream<Path> tep = Files.list(Path.of("."))) { ... }

// Tìm theo điều kiện
try (Stream<Path> tep = Files.find(root, 5, (p, attr) -> attr.size() > 1_000_000)) { ... }
```

> 🔥 **Quy tắc sống còn:** Stream từ `Files.*` **PHẢI** đặt trong `try-with-resources`. Quên → rò rỉ file descriptor → sau vài nghìn lần sẽ `Too many open files`. Stream từ Collection thì **không cần**.

### 3.8 Các nguồn khác (ít gặp nhưng đáng biết)

```java
// Từ Optional (Java 9+) — 0 hoặc 1 phần tử
Optional<SinhVien> tim = timSinhVien("An");
Stream<SinhVien> s = tim.stream();   // ⭐ dùng để "làm phẳng" list các Optional

// Nối 2 stream
Stream<String> nối = Stream.concat(Stream.of("a", "b"), Stream.of("c"));

// Từ Iterator / Iterable bất kỳ
Iterable<String> it = ...;
Stream<String> s2 = StreamSupport.stream(it.spliterator(), false);   // false = tuần tự

// Từ Random
new Random().ints(5, 1, 101).forEach(System.out::println);  // 5 số ngẫu nhiên trong [1,100]

// Từ Scanner / BufferedReader
try (BufferedReader br = new BufferedReader(new FileReader("f.txt"))) {
    br.lines().forEach(System.out::println);
}

// Từ regex
Pattern.compile("[a-z]+").matcher("ab12cd").results()   // Java 9+
       .map(MatchResult::group).forEach(System.out::println);   // ab, cd

// Builder — khi số phần tử chưa biết trước
Stream<String> sb = Stream.<String>builder().add("a").add("b").add("c").build();

// Từ Map (JDK 16+ có Stream.toList, nhưng Map vẫn qua entrySet)
map.entrySet().stream().map(e -> e.getKey() + "=" + e.getValue()).toList();
```

### 3.9 Bảng tra nhanh nguồn stream

| Nguồn | Cú pháp | Ghi chú |
|-------|---------|---------|
| Collection | `coll.stream()` | Phổ biến nhất |
| Collection song song | `coll.parallelStream()` | ⚠️ đọc Phần 10 trước |
| Mảng object | `Arrays.stream(arr)` | |
| Mảng nguyên thuỷ | `Arrays.stream(intArr)` | Trả `IntStream` |
| Giá trị rời rạc | `Stream.of(a, b, c)` | |
| Rỗng | `Stream.empty()` | Không bao giờ trả `null` |
| Có thể null | `Stream.ofNullable(x)` | Java 9+ |
| Dãy số | `IntStream.range(0, n)` | Cận phải mở |
| Dãy số đóng | `IntStream.rangeClosed(1, n)` | Cận phải đóng |
| Vô hạn có quy luật | `Stream.iterate(seed, f)` | Cần `limit` |
| Vô hạn có điều kiện dừng | `Stream.iterate(seed, p, f)` | Java 9+, **tự dừng** |
| Vô hạn độc lập | `Stream.generate(sup)` | Cần `limit` |
| Ký tự chuỗi | `str.chars()` | Trả `IntStream` |
| Dòng chuỗi | `str.lines()` | Java 11+ |
| Dòng file | `Files.lines(path)` | ⚠️ try-with-resources |
| Cây thư mục | `Files.walk(path)` | ⚠️ try-with-resources |
| Optional | `opt.stream()` | Java 9+ |
| Nối | `Stream.concat(a, b)` | |
| Iterable | `StreamSupport.stream(sp, false)` | Nâng cao |
| Regex | `matcher.results()` | Java 9+ |

---

## Phần 4 — Intermediate Operations (Toán Tử Trung Gian)

Nhắc lại: **toán tử trung gian luôn trả về `Stream`, và luôn LƯỜI.**

### 4.1 `map` — biến đổi từng phần tử

**Chữ ký:**

```java
<R> Stream<R> map(Function<? super T, ? extends R> mapper);
```

Đọc chữ ký này bằng kiến thức Chương 3:
- `<R>` — type parameter **mới**, vì kiểu ra khác kiểu vào;
- `? super T` — theo **PECS**, `Function` là *consumer* của `T` → dùng `super`;
- `? extends R` — `Function` là *producer* của `R` → dùng `extends`;
- Trả `Stream<R>` → **toán tử trung gian**.

**Ẩn dụ:** `map` là **máy ép trái cây**. Vào 5 quả cam → ra 5 ly nước cam. **Số lượng KHÔNG đổi**, chỉ đổi *hình dạng*.

```text
  Stream<SinhVien>              map(SinhVien::hoTen)          Stream<String>
  [ 👤An, 👤Bình, 👤Chi ]  ──────────────────────────▶  [ "An", "Bình", "Chi" ]
       3 phần tử                                              3 phần tử  (LUÔN BẰNG NHAU)
```

```java
List<SinhVien> ds = DuLieuMau.sinhVien();

// Trích một trường
List<String> ten = ds.stream().map(SinhVien::hoTen).toList();

// Đổi kiểu hoàn toàn
List<Integer> doDaiTen = ds.stream().map(sv -> sv.hoTen().length()).toList();

// Chuyển Entity → DTO (mẫu dùng cực nhiều trong Spring Boot ⭐)
record SinhVienDto(String ten, String lop) {}
List<SinhVienDto> dto = ds.stream()
    .map(sv -> new SinhVienDto(sv.hoTen(), sv.lop()))
    .toList();

// map lồng nhau (chaining)
List<String> ma = ds.stream()
    .map(SinhVien::hoTen)          // Stream<String>
    .map(String::toUpperCase)      // Stream<String>
    .map(s -> s.substring(0, 1))   // Stream<String>
    .toList();
```

**Biến thể sang stream nguyên thuỷ:**

```java
IntStream    tuoi  = ds.stream().mapToInt(SinhVien::tuoi);
DoubleStream diem  = ds.stream().mapToDouble(SinhVien::diemTrungBinh);
LongStream   ids   = ds.stream().mapToLong(sv -> sv.hoTen().length());

// và chiều ngược lại
Stream<Integer> boxed = IntStream.range(0, 5).boxed();
Stream<String>  chuoi = IntStream.range(0, 5).mapToObj(i -> "số " + i);
```

**Lỗi hay gặp với `map`:**

```java
// ❌ SAI — dùng map để in (map phải TRẢ VỀ giá trị)
ds.stream().map(sv -> System.out.println(sv.hoTen()));   // không compile + không chạy
// ✅ ĐÚNG
ds.stream().forEach(sv -> System.out.println(sv.hoTen()));

// ❌ SAI — dùng map để lọc
ds.stream().map(sv -> sv.tuoi() > 18 ? sv : null).filter(Objects::nonNull);   // xấu
// ✅ ĐÚNG
ds.stream().filter(sv -> sv.tuoi() > 18);
```

### 4.2 `filter` — giữ lại phần tử thoả điều kiện

**Chữ ký:**

```java
Stream<T> filter(Predicate<? super T> predicate);
```

**Ẩn dụ:** `filter` là **cái rây**. Cái gì lọt qua thì đi tiếp, cái gì không thì bị loại. Kiểu **KHÔNG đổi**, số lượng **giảm hoặc giữ nguyên**.

```text
  Stream<Integer>            filter(n -> n % 2 == 0)        Stream<Integer>
  [ 1, 2, 3, 4, 5, 6 ]  ────────────────────────────▶  [ 2, 4, 6 ]
      6 phần tử                                             3 phần tử (≤ ban đầu)
```

```java
// Điều kiện đơn
ds.stream().filter(sv -> sv.tuoi() >= 18).toList();

// Nhiều điều kiện — 2 cách, chọn cách nào?
ds.stream().filter(sv -> sv.tuoi() >= 18 && sv.diemTrungBinh() >= 7.0);  // 1 filter
ds.stream().filter(sv -> sv.tuoi() >= 18).filter(sv -> sv.diemTrungBinh() >= 7.0); // 2 filter
```

| | 1 `filter` gộp | Nhiều `filter` |
|---|---------------|----------------|
| Hiệu năng | Nhanh hơn **rất ít** (1 lời gọi ảo/phần tử) | Chậm hơn không đáng kể |
| Đọc hiểu | Kém hơn khi điều kiện dài | ✅ Rõ ràng, mỗi dòng 1 ý |
| Tái sử dụng | Khó | ✅ Tách thành `Predicate` đặt tên được |
| **Khuyến nghị** | Khi điều kiện ngắn, liên quan chặt | ⭐ **Mặc định dùng cách này** |

```java
// ⭐ Best practice — đặt tên cho Predicate (kiến thức Chương 3)
Predicate<SinhVien> daTruongThanh = sv -> sv.tuoi() >= 18;
Predicate<SinhVien> hocGioi       = sv -> sv.diemTrungBinh() >= 8.0;

// Ghép bằng composition
List<SinhVien> ketQua = ds.stream()
    .filter(daTruongThanh.and(hocGioi))
    .toList();

List<SinhVien> khac = ds.stream()
    .filter(daTruongThanh.and(hocGioi.negate()))   // trưởng thành nhưng KHÔNG giỏi
    .toList();
```

**Cạm bẫy null:**

```java
// ❌ NullPointerException nếu có phần tử null
ds.stream().filter(sv -> sv.lop().equals("12A1"));

// ✅ An toàn hơn — hằng số đứng trước
ds.stream().filter(sv -> "12A1".equals(sv.lop()));

// ✅ Hoặc loại null trước
ds.stream().filter(Objects::nonNull).filter(sv -> "12A1".equals(sv.lop()));
```

### 4.3 `flatMap` — san phẳng cấu trúc lồng nhau ⭐

Đây là toán tử **khó nhất** với người mới, và cũng là toán tử **giá trị nhất**.

**Chữ ký:**

```java
<R> Stream<R> flatMap(Function<? super T, ? extends Stream<? extends R>> mapper);
//                                          ▲▲▲▲▲▲ hàm phải trả về STREAM
```

**Điểm mấu chốt:** hàm bạn truyền vào `flatMap` phải trả về **một `Stream`**, không phải một giá trị. Sau đó `flatMap` **nối** (concatenate) tất cả stream con đó thành **một stream phẳng duy nhất**.

**Ẩn dụ:** Bạn có 3 **hộp bút**. `map` cho bạn 3 hộp. `flatMap` **mở hết các hộp và đổ chung ra bàn** — bạn được một đống bút, không còn hộp.

```text
map (SAI khi muốn phẳng):
  [ 📦[a,b], 📦[c], 📦[d,e] ]  ──map(box -> box.stream())──▶  [ Stream, Stream, Stream ]
                                                                Stream<Stream<T>>  😵

flatMap (ĐÚNG):
  [ 📦[a,b], 📦[c], 📦[d,e] ]  ──flatMap(box -> box.stream())──▶  [ a, b, c, d, e ]
                                                                    Stream<T>  ✅
```

**Ví dụ 1 — trực quan nhất:**

```java
List<List<Integer>> lồng = List.of(
    List.of(1, 2, 3),
    List.of(4, 5),
    List.of(6)
);

// ❌ map → Stream<Stream<Integer>>, không dùng được
Stream<Stream<Integer>> sai = lồng.stream().map(List::stream);

// ✅ flatMap → Stream<Integer>
List<Integer> phang = lồng.stream()
    .flatMap(List::stream)
    .toList();
System.out.println(phang);   // [1, 2, 3, 4, 5, 6]
```

**Ví dụ 2 — nghiệp vụ thật (dữ liệu chung của chương):**

```java
List<DonHang> dh = DuLieuMau.donHang();

// "Tất cả dòng hàng của tất cả đơn"
List<ChiTietDonHang> tatCaDong = dh.stream()
    .flatMap(d -> d.chiTiet().stream())
    .toList();

// "Tổng doanh thu toàn hệ thống"
BigDecimal tong = dh.stream()
    .flatMap(d -> d.chiTiet().stream())
    .map(ChiTietDonHang::thanhTien)
    .reduce(BigDecimal.ZERO, BigDecimal::add);

// "Danh sách môn học không trùng của toàn trường"
List<String> monHoc = DuLieuMau.sinhVien().stream()
    .flatMap(sv -> sv.monHoc().stream())
    .distinct()
    .sorted()
    .toList();
// [Anh, Hoá, Lý, Sinh, Sử, Tin, Toán, Văn, Địa]
```

**Ví dụ 3 — tách chuỗi:**

```java
List<String> cau = List.of("Java rất mạnh", "Stream rất hay");

// ❌ map cho ra Stream<String[]>
Stream<String[]> sai = cau.stream().map(c -> c.split(" "));

// ✅ flatMap
List<String> tu = cau.stream()
    .flatMap(c -> Arrays.stream(c.split(" ")))
    .toList();   // [Java, rất, mạnh, Stream, rất, hay]
```

**Ví dụ 4 — làm phẳng `Optional` (Java 9+):**

```java
List<String> tenCanTim = List.of("An", "KhôngTồnTại", "Chi");

// ❌ Cách cũ — xấu
List<SinhVien> cu = tenCanTim.stream()
    .map(this::timTheoTen)              // Stream<Optional<SinhVien>>
    .filter(Optional::isPresent)
    .map(Optional::get)                 // ⚠️ Optional::get là code smell
    .toList();

// ✅ Cách mới — Optional::stream
List<SinhVien> moi = tenCanTim.stream()
    .map(this::timTheoTen)              // Stream<Optional<SinhVien>>
    .flatMap(Optional::stream)          // ⭐ rỗng biến mất, có giá trị thì phẳng ra
    .toList();
```

**Ví dụ 5 — tích Descartes (Cartesian product):**

```java
List<String> mau  = List.of("Đỏ", "Xanh");
List<String> size = List.of("S", "M", "L");

List<String> bienThe = mau.stream()
    .flatMap(m -> size.stream().map(s -> m + "-" + s))   // ⭐ flatMap lồng map
    .toList();
// [Đỏ-S, Đỏ-M, Đỏ-L, Xanh-S, Xanh-M, Xanh-L]
```

**Ví dụ 6 — cấu trúc lồng 3 tầng:**

```java
// Công ty → Phòng ban → Nhân viên → Kỹ năng
List<String> tatCaKyNang = congTy.stream()
    .flatMap(c -> c.phongBan().stream())      // tầng 1
    .flatMap(p -> p.nhanVien().stream())      // tầng 2
    .flatMap(n -> n.kyNang().stream())        // tầng 3
    .distinct()
    .sorted()
    .toList();

// So sánh với imperative: 3 vòng for lồng nhau + 1 Set + 1 List → ~12 dòng
```

**Bảng so sánh `map` vs `flatMap`:**

| | `map` | `flatMap` |
|---|-------|-----------|
| Hàm trả về | giá trị `R` | `Stream<R>` |
| Số phần tử ra | **luôn bằng** số vào | 0..n mỗi phần tử vào (có thể nhiều hơn hoặc ít hơn) |
| Kết quả | `Stream<R>` | `Stream<R>` (đã phẳng) |
| Dùng khi | 1-1: đổi hình dạng | 1-n: mở cấu trúc lồng |
| Ẩn dụ | Ép trái cây | Mở hộp đổ chung |
| Sai lầm điển hình | Dùng khi cần flatMap → `Stream<Stream<T>>` | Quên `.stream()` bên trong |

> 🎓 **Mẹo nhận biết:** Nếu bạn thấy mình viết `Stream<List<X>>` hoặc `Stream<Stream<X>>` hoặc `List<List<X>>` — **99% là bạn cần `flatMap`**.

**Biến thể nguyên thuỷ và `mapMulti` (Java 16+):**

```java
// flatMapToInt / flatMapToLong / flatMapToDouble
int tongDoDai = List.of("abc", "de").stream()
    .flatMapToInt(String::chars)
    .map(c -> 1).sum();   // 5

// mapMulti — thay thế flatMap khi số phần tử con ÍT, tránh tạo Stream trung gian
List<Integer> nhanDoi = List.of(1, 2, 3).stream()
    .<Integer>mapMulti((n, consumer) -> {
        consumer.accept(n);
        consumer.accept(n * 10);
    })
    .toList();   // [1, 10, 2, 20, 3, 30]
// ⚡ Nhanh hơn flatMap vì không phải tạo Stream con cho mỗi phần tử
```

---
### 4.4 `distinct` — khử trùng lặp

**Chữ ký:** `Stream<T> distinct();`

`distinct()` dựa vào **`equals()` và `hashCode()`** — đây là điểm chết người.

```java
List<Integer> so = List.of(1, 2, 2, 3, 3, 3, 4);
System.out.println(so.stream().distinct().toList());   // [1, 2, 3, 4] ✅
```

```java
// ☠️ Class thường KHÔNG override equals/hashCode → distinct vô dụng
class Sach {
    String tieuDe;
    Sach(String t) { this.tieuDe = t; }
}

List<Sach> ds = List.of(new Sach("Java"), new Sach("Java"));
System.out.println(ds.stream().distinct().count());   // 2 😱 — vì so sánh theo địa chỉ

// ✅ record TỰ SINH equals/hashCode → distinct hoạt động đúng
record SachRecord(String tieuDe) {}
List<SachRecord> ds2 = List.of(new SachRecord("Java"), new SachRecord("Java"));
System.out.println(ds2.stream().distinct().count());   // 1 ✅
```

**Khử trùng theo *một trường* (không có sẵn trong JDK):**

```java
// ❌ Không có distinctBy() trong Java!

// ✅ Cách 1 — toMap giữ phần tử đầu tiên (ĐƠN GIẢN NHẤT)
Collection<SinhVien> theoLop = ds.stream()
    .collect(Collectors.toMap(SinhVien::lop, sv -> sv, (cũ, mới) -> cũ))
    .values();

// ✅ Cách 2 — TreeSet với comparator
List<SinhVien> duyNhat = ds.stream()
    .collect(Collectors.collectingAndThen(
        Collectors.toCollection(() -> new TreeSet<>(Comparator.comparing(SinhVien::lop))),
        ArrayList::new));

// ✅ Cách 3 — helper Predicate có trạng thái (⚠️ KHÔNG dùng với parallel!)
public static <T> Predicate<T> phanBietTheo(Function<? super T, ?> khoa) {
    Set<Object> daThay = ConcurrentHashMap.newKeySet();
    return t -> daThay.add(khoa.apply(t));   // add trả false nếu đã có
}
List<SinhVien> kq = ds.stream().filter(phanBietTheo(SinhVien::lop)).toList();
```

> ⚠️ **`distinct()` là toán tử CÓ TRẠNG THÁI (stateful)**: nó phải nhớ tất cả phần tử đã thấy trong một `HashSet` nội bộ → tốn `O(n)` bộ nhớ. Với stream có thứ tự chạy song song, chi phí còn cao hơn nữa.

### 4.5 `sorted` — sắp xếp

**Chữ ký:**

```java
Stream<T> sorted();                          // dùng thứ tự tự nhiên (T phải Comparable)
Stream<T> sorted(Comparator<? super T> c);   // dùng comparator tuỳ ý
```

```java
// Thứ tự tự nhiên
List.of(3, 1, 2).stream().sorted().toList();                 // [1, 2, 3]
List.of("c", "a", "b").stream().sorted().toList();           // [a, b, c]

// ☠️ Nếu T không Comparable → ClassCastException LÚC CHẠY (không phải lúc biên dịch!)
ds.stream().sorted().toList();   // 💥 SinhVien không implement Comparable

// ✅ Comparator — API composition (Chương 3)
import static java.util.Comparator.*;

ds.stream().sorted(comparing(SinhVien::hoTen)).toList();                    // theo tên
ds.stream().sorted(comparingInt(SinhVien::tuoi)).toList();                  // theo tuổi (không boxing ⭐)
ds.stream().sorted(comparingDouble(SinhVien::diemTrungBinh).reversed());    // điểm giảm dần

// Sắp xếp nhiều tiêu chí ⭐
ds.stream()
  .sorted(comparing(SinhVien::lop)                          // ưu tiên 1: lớp tăng dần
      .thenComparing(comparingDouble(SinhVien::diemTrungBinh).reversed())  // ưu tiên 2: điểm giảm
      .thenComparing(SinhVien::hoTen))                      // ưu tiên 3: tên
  .forEach(System.out::println);

// Xử lý null
ds.stream().sorted(comparing(SinhVien::lop, nullsFirst(naturalOrder()))).toList();
```

**Chi phí thật của `sorted()` — phải hiểu rõ:**

```text
sorted() KHÔNG THỂ lười theo nghĩa thông thường:

  nguồn ──▶ filter ──▶ [ sorted: NUỐT TOÀN BỘ vào buffer ] ──▶ map ──▶ ...
                          ▲                              ▲
                       rào chắn                     chỉ phát ra SAU KHI
                    (barrier)                        đã nhận hết
```

- Phải **giữ toàn bộ phần tử trong bộ nhớ** → `O(n)` RAM;
- Phải **duyệt hết nguồn** trước khi phát ra phần tử đầu tiên;
- Thuật toán: `TimSort` (ổn định) cho object, `Dual-Pivot QuickSort` cho primitive → `O(n log n)`;
- ⚠️ **Không bao giờ `sorted()` một stream vô hạn** → treo máy.

**Tối ưu quan trọng — `sorted().limit(n)`:**

```java
// JDK NHẬN RA mẫu này và tối ưu (SortedOps + SliceOps)
ds.stream().sorted(comparator).limit(10).toList();
// Vẫn phải nạp hết vào buffer, nhưng chỉ "phát" 10 phần tử ra
```

Nếu `n` rất nhỏ so với tổng số, dùng **priority queue thủ công** vẫn nhanh hơn:

```java
// Lấy top 10 từ 10 triệu phần tử — O(n log 10) thay vì O(n log n)
PriorityQueue<SinhVien> pq = new PriorityQueue<>(comparingDouble(SinhVien::diemTrungBinh));
for (SinhVien sv : rấtNhiều) {
    pq.offer(sv);
    if (pq.size() > 10) pq.poll();
}
```

### 4.6 `limit` và `skip` — cắt lát (phân trang)

```java
Stream<T> limit(long maxSize);   // giữ n phần tử ĐẦU  — SHORT-CIRCUIT ⚡
Stream<T> skip(long n);          // BỎ n phần tử đầu   — stateful
```

```java
List<Integer> so = IntStream.rangeClosed(1, 10).boxed().toList();

so.stream().limit(3).toList();          // [1, 2, 3]
so.stream().skip(7).toList();           // [8, 9, 10]
so.stream().skip(3).limit(3).toList();  // [4, 5, 6]  ⭐ PHÂN TRANG
```

**Mẫu phân trang chuẩn:**

```java
public static <T> List<T> trang(List<T> ds, int soTrang, int kichThuoc) {
    return ds.stream()
        .skip((long) soTrang * kichThuoc)   // ⚠️ ép long tránh tràn int
        .limit(kichThuoc)
        .toList();
}
trang(ds, 0, 3);   // trang 1: phần tử 0,1,2
trang(ds, 1, 3);   // trang 2: phần tử 3,4,5
```

> 🔥 **Cảnh báo Spring Boot:** **KHÔNG** dùng `skip/limit` để phân trang dữ liệu từ database! `repository.findAll().stream().skip(1000).limit(20)` sẽ **nạp toàn bộ bảng vào RAM**. Phải dùng `Pageable`:
> ```java
> Page<Product> page = repository.findAll(PageRequest.of(pageNo, size));
> // → SQL: SELECT ... LIMIT 20 OFFSET 1000  — database làm việc, không phải JVM
> ```
> Xem chi tiết ở [Phần 17](#phần-17--streams-trong-spring-boot).

**`limit` trên stream có thứ tự vs không thứ tự:**

```java
// Với stream tuần tự: limit rất rẻ
// Với stream SONG SONG có thứ tự: limit ĐẮT — phải chờ biết phần tử nào "đứng trước"
danhSachLon.parallelStream().limit(10)              // chậm bất ngờ
danhSachLon.parallelStream().unordered().limit(10)  // nhanh hơn nhiều (nếu không cần thứ tự)
```

### 4.7 `takeWhile` / `dropWhile` (Java 9+) — cắt theo điều kiện

```java
Stream<T> takeWhile(Predicate<? super T> p);   // lấy TỪ ĐẦU tới khi p sai lần đầu → DỪNG
Stream<T> dropWhile(Predicate<? super T> p);   // BỎ từ đầu tới khi p sai lần đầu → lấy phần còn lại
```

```java
List<Integer> so = List.of(2, 4, 6, 7, 8, 10);

so.stream().takeWhile(n -> n % 2 == 0).toList();   // [2, 4, 6]      ⚡ dừng ở 7
so.stream().dropWhile(n -> n % 2 == 0).toList();   // [7, 8, 10]     giữ cả 8,10
so.stream().filter(n -> n % 2 == 0).toList();      // [2, 4, 6, 8, 10] ← KHÁC HẲN!
```

**Phân biệt `takeWhile` vs `filter` — cực kỳ quan trọng:**

| | `filter` | `takeWhile` |
|---|---------|-------------|
| Duyệt | **Toàn bộ** nguồn | Dừng ngay khi gặp phần tử sai |
| Kết quả | Mọi phần tử thoả, ở bất kỳ vị trí | Chỉ **tiền tố** liên tục thoả |
| Short-circuit | ❌ Không | ✅ Có |
| Dùng với dữ liệu đã sắp xếp | Lãng phí | ⭐ Rất hiệu quả |

```java
// Ứng dụng: dữ liệu đã sắp xếp theo ngày → lấy log 7 ngày gần nhất
logDaSapXepGiamDan.stream()
    .takeWhile(log -> log.ngay().isAfter(LocalDate.now().minusDays(7)))
    .toList();
// ⚡ Dừng ngay khi gặp log cũ hơn → không đọc 10 triệu dòng còn lại

// Ứng dụng: stream vô hạn
Stream.iterate(1, n -> n * 2)
    .takeWhile(n -> n < 1000)
    .forEach(System.out::println);   // 1,2,4,...,512 — tự dừng, không cần limit
```

### 4.8 `peek` — cửa sổ quan sát (DEBUG ONLY)

**Chữ ký:** `Stream<T> peek(Consumer<? super T> action);`

`peek` cho bạn "nhìn trộm" từng phần tử đi qua mà không thay đổi stream.

```java
List<String> kq = ds.stream()
    .peek(sv -> log.debug("① vào: {}", sv))
    .filter(sv -> sv.tuoi() >= 18)
    .peek(sv -> log.debug("② qua filter: {}", sv))
    .map(SinhVien::hoTen)
    .peek(ten -> log.debug("③ sau map: {}", ten))
    .toList();
```

> ⚠️ **`peek` CHỈ dùng để debug.** Javadoc ghi rõ: *"This method exists mainly to support debugging"*.

**Ba lý do không dùng `peek` cho logic thật:**

```java
// ① JDK có thể BỎ QUA peek hoàn toàn
List.of("a","b","c").stream()
    .peek(System.out::println)    // ⚠️ Không in gì!
    .count();                     // count() tối ưu bỏ qua toàn pipeline

// ② Với parallel, peek chạy trên nhiều thread, thứ tự lộn xộn
list.parallelStream().peek(System.out::println).toList();   // output loạn xạ

// ③ peek KHÔNG thay đổi được stream (Consumer trả void)
ds.stream().peek(sv -> sv.setTen("X"))   // ☠️ mutation ngầm — anti-pattern nặng
```

**Thay thế `peek` bằng gì?**

```java
// ✅ Muốn log kết quả cuối → log sau khi collect
List<String> kq = ds.stream().filter(...).map(...).toList();
log.debug("Kết quả: {}", kq);

// ✅ Muốn debug từng bước → tách pipeline
List<SinhVien> buoc1 = ds.stream().filter(...).toList();
log.debug("Sau filter: {}", buoc1);
List<String> buoc2 = buoc1.stream().map(...).toList();
```

### 4.9 Các toán tử trung gian khác

```java
// mapToObj / boxed — quay về stream object
IntStream.range(0, 3).boxed();                      // Stream<Integer>
IntStream.range(0, 3).mapToObj(i -> "#" + i);       // Stream<String>

// asLongStream / asDoubleStream — nới rộng kiểu
IntStream.of(1, 2).asDoubleStream();                // DoubleStream [1.0, 2.0]

// sequential() / parallel() — đổi chế độ (áp dụng cho TOÀN pipeline!)
list.stream().parallel().filter(...).sequential().map(...);
// ⚠️ Cờ cuối cùng thắng — ở đây toàn bộ chạy TUẦN TỰ

// unordered() — bỏ ràng buộc thứ tự → tăng tốc parallel
set.parallelStream().unordered().distinct();

// onClose(Runnable) — đăng ký hành động khi đóng stream
Files.lines(path).onClose(() -> log.info("đã đóng file"));
```

**`mapMulti` (Java 16+) — thay thế `flatMap` hiệu năng cao:**

```java
// Bài toán: mỗi số n → phát ra n bản sao của chính nó
// flatMap: tạo 1 Stream con cho MỖI phần tử → tốn object
List<Integer> a = List.of(1, 2, 3).stream()
    .flatMap(n -> Collections.nCopies(n, n).stream())
    .toList();   // [1, 2, 2, 3, 3, 3]

// mapMulti: đẩy thẳng vào consumer → 0 Stream trung gian ⚡
List<Integer> b = List.of(1, 2, 3).stream()
    .<Integer>mapMulti((n, c) -> { for (int i = 0; i < n; i++) c.accept(n); })
    .toList();   // [1, 2, 2, 3, 3, 3]
```

> 💡 Dùng `mapMulti` khi: (a) mỗi phần tử sinh ra **rất ít** phần tử con, hoặc (b) bạn muốn tránh boxing. Còn lại cứ dùng `flatMap` cho dễ đọc.

---

## Phần 5 — Terminal Operations (Toán Tử Kết Thúc)

Nhắc lại: **toán tử kết thúc KHÔNG trả về `Stream`, và nó KÍCH HOẠT toàn bộ pipeline.** Mỗi pipeline chỉ được có **đúng một** toán tử kết thúc.

### 5.1 `forEach` và `forEachOrdered`

```java
void forEach(Consumer<? super T> action);
void forEachOrdered(Consumer<? super T> action);
```

```java
ds.stream().forEach(sv -> System.out.println(sv.hoTen()));
ds.stream().map(SinhVien::hoTen).forEach(System.out::println);   // method reference

// ⚠️ Với parallel, forEach KHÔNG đảm bảo thứ tự
IntStream.range(0, 10).parallel().forEach(System.out::print);        // 5768910234 (loạn)
IntStream.range(0, 10).parallel().forEachOrdered(System.out::print); // 0123456789 ✅
```

| | `forEach` | `forEachOrdered` |
|---|-----------|------------------|
| Tuần tự | Theo thứ tự nguồn | Theo thứ tự nguồn |
| Song song | **Không đảm bảo** thứ tự | Đảm bảo thứ tự (**mất phần lớn lợi ích song song**) |
| Tốc độ | Nhanh | Chậm hơn |

> ⚠️ **`forEach` là cửa ngõ để side effect chui vào code functional.** Trước khi viết `forEach`, hãy tự hỏi: *"Tôi có thể dùng `collect` / `reduce` thay được không?"*

```java
// ❌ ANTI-PATTERN — dùng forEach để gom (thực chất là vòng for trá hình)
List<String> ten = new ArrayList<>();
ds.stream().forEach(sv -> ten.add(sv.hoTen()));   // mutation + không thread-safe

// ✅ ĐÚNG
List<String> ten = ds.stream().map(SinhVien::hoTen).toList();
```

`forEach` **hợp lệ** khi mục đích thật sự là side effect: in ra màn hình, gửi email, ghi DB, publish event.

### 5.2 `count` — đếm

```java
long count();
```

```java
long n = ds.stream().filter(sv -> sv.tuoi() >= 18).count();
```

⚠️ Nhớ tối ưu ở [mục 2.6](#2-6-thí-nghiệm-4--jdk-còn-tự-tối-ưu-giúp-bạn): với pipeline chỉ có toán tử không đổi số lượng, `count()` **không duyệt phần tử nào**.

### 5.3 `findFirst` / `findAny` — tìm một phần tử

```java
Optional<T> findFirst();   // phần tử ĐẦU TIÊN theo thứ tự gặp
Optional<T> findAny();     // BẤT KỲ phần tử nào — nhanh hơn khi parallel
```

```java
Optional<SinhVien> gioiNhat = ds.stream()
    .filter(sv -> sv.diemTrungBinh() >= 9.0)
    .findFirst();

// ⭐ Xử lý Optional đúng cách (Chương 3)
String ten = gioiNhat.map(SinhVien::hoTen).orElse("Không có ai");

gioiNhat.ifPresentOrElse(
    sv -> log.info("Tìm thấy: {}", sv.hoTen()),
    () -> log.warn("Không tìm thấy")
);

// Trong Spring Boot — ném exception nếu không thấy
SinhVien sv = gioiNhat.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy"));
```

| | `findFirst` | `findAny` |
|---|-------------|-----------|
| Tuần tự | Phần tử đầu | Thường cũng là phần tử đầu |
| Song song | Phải **đồng bộ** để xác định "đầu tiên" → chậm | Trả về **ngay** khi thread nào đó tìm thấy → nhanh ⚡ |
| Dùng khi | Thứ tự **quan trọng** | Chỉ cần "một cái bất kỳ" |

> ❌ **Không bao giờ** viết `.findFirst().get()`. `get()` ném `NoSuchElementException`. Luôn dùng `orElse`, `orElseGet`, `orElseThrow`, hoặc `ifPresent`.

### 5.4 `anyMatch` / `allMatch` / `noneMatch` — kiểm tra điều kiện

```java
boolean anyMatch(Predicate<? super T> p);   // có ÍT NHẤT MỘT thoả?
boolean allMatch(Predicate<? super T> p);   // TẤT CẢ đều thoả?
boolean noneMatch(Predicate<? super T> p);  // KHÔNG có cái nào thoả?
```

```java
boolean coNguoiGioi = ds.stream().anyMatch(sv -> sv.diemTrungBinh() >= 9.0);   // true
boolean tatCaDauDo  = ds.stream().allMatch(sv -> sv.diemTrungBinh() >= 5.0);   // true
boolean khongAiRot  = ds.stream().noneMatch(sv -> sv.diemTrungBinh() < 4.0);   // true
```

**Cả ba đều SHORT-CIRCUIT:**

| Toán tử | Dừng khi |
|---------|----------|
| `anyMatch` | Gặp phần tử **thoả** đầu tiên → trả `true` |
| `allMatch` | Gặp phần tử **không thoả** đầu tiên → trả `false` |
| `noneMatch` | Gặp phần tử **thoả** đầu tiên → trả `false` |

**⚠️ Bẫy logic với stream RỖNG — phải nhớ:**

```java
Stream<String> rong = Stream.empty();

rong.anyMatch(s -> true);    // false  ← hợp lý
Stream.<String>empty().allMatch(s -> false);   // TRUE  😲 ← "chân lý rỗng" (vacuous truth)
Stream.<String>empty().noneMatch(s -> true);   // true
```

**Vì sao `allMatch` trên stream rỗng lại `true`?** Đây là logic toán học: mệnh đề *"mọi phần tử của tập rỗng đều thoả P"* luôn đúng vì **không có phản ví dụ nào**. Giống như câu *"Tất cả con kỳ lân trong phòng này đều màu hồng"* — đúng, vì không có con nào.

```java
// 💣 BUG THẬT
if (donHang.getChiTiet().stream().allMatch(ct -> ct.soLuong() > 0)) {
    xacNhanDon();   // ☠️ Đơn hàng RỖNG cũng được xác nhận!
}
// ✅ FIX
if (!donHang.getChiTiet().isEmpty()
    && donHang.getChiTiet().stream().allMatch(ct -> ct.soLuong() > 0)) { ... }
```

**Quan hệ tương đương (định luật De Morgan):**

```java
stream.noneMatch(p)  ≡  stream.allMatch(p.negate())
stream.anyMatch(p)   ≡  !stream.noneMatch(p)
stream.allMatch(p)   ≡  stream.noneMatch(p.negate())
```

### 5.5 `min` / `max` — cực trị

```java
Optional<T> min(Comparator<? super T> c);
Optional<T> max(Comparator<? super T> c);
```

```java
Optional<SinhVien> caoTuoiNhat = ds.stream().max(comparingInt(SinhVien::tuoi));
Optional<SinhVien> diemThapNhat = ds.stream().min(comparingDouble(SinhVien::diemTrungBinh));

String ten = caoTuoiNhat.map(SinhVien::hoTen).orElse("(rỗng)");

// Trên stream nguyên thuỷ — KHÔNG cần comparator
OptionalInt maxTuoi = ds.stream().mapToInt(SinhVien::tuoi).max();
int tuoi = maxTuoi.orElse(0);
```

> 💡 `min`/`max` trả `Optional` vì stream có thể **rỗng** — không có "giá trị lớn nhất của tập rỗng". Đây là thiết kế đúng đắn, buộc bạn xử lý trường hợp rỗng thay vì nhận `null`.

### 5.6 `reduce` — thu gọn về một giá trị

`reduce` là toán tử **cơ bản nhất** — mọi toán tử tổng hợp khác (`count`, `sum`, `max`, thậm chí `collect`) đều có thể diễn đạt bằng `reduce`.

**Ba dạng chữ ký:**

```java
// Dạng 1 — không giá trị khởi tạo → trả Optional
Optional<T> reduce(BinaryOperator<T> accumulator);

// Dạng 2 — có identity → trả T (không bao giờ rỗng)
T reduce(T identity, BinaryOperator<T> accumulator);

// Dạng 3 — đổi kiểu + combiner (cho parallel)
<U> U reduce(U identity, BiFunction<U, ? super T, U> accumulator, BinaryOperator<U> combiner);
```

**Cách `reduce` hoạt động — hình dung từng bước:**

```text
Dữ liệu: [1, 2, 3, 4]      Phép: (a, b) -> a + b      identity: 0

  bước 0:  acc = 0                (identity)
  bước 1:  acc = 0 + 1 = 1
  bước 2:  acc = 1 + 2 = 3
  bước 3:  acc = 3 + 3 = 6
  bước 4:  acc = 6 + 4 = 10   ✅
```

```java
// Dạng 1 — Optional
Optional<Integer> tong = Stream.of(1, 2, 3, 4).reduce((a, b) -> a + b);
System.out.println(tong.orElse(0));   // 10

// Dạng 2 — có identity, an toàn hơn
int tong2 = Stream.of(1, 2, 3, 4).reduce(0, Integer::sum);   // 10
int tong3 = Stream.<Integer>of().reduce(0, Integer::sum);    // 0 (không rỗng) ✅

// Ứng dụng BigDecimal (CLAUDE.md: tiền phải dùng BigDecimal)
BigDecimal tongTien = donHang.stream()
    .flatMap(d -> d.chiTiet().stream())
    .map(ChiTietDonHang::thanhTien)
    .reduce(BigDecimal.ZERO, BigDecimal::add);

// Nối chuỗi
String ten = ds.stream().map(SinhVien::hoTen).reduce("", (a, b) -> a.isEmpty() ? b : a + ", " + b);
// ⚠️ Chậm! O(n²) vì tạo chuỗi mới mỗi lần → dùng Collectors.joining() thay thế

// Tìm max bằng reduce
Optional<SinhVien> gioiNhat = ds.stream()
    .reduce((a, b) -> a.diemTrungBinh() >= b.diemTrungBinh() ? a : b);
```

**Dạng 3 — khi kiểu kết quả KHÁC kiểu phần tử:**

```java
// Đếm tổng số ký tự của tất cả tên
int tongKyTu = ds.stream().reduce(
    0,                                      // identity: U = Integer
    (acc, sv) -> acc + sv.hoTen().length(), // accumulator: (U, T) -> U
    Integer::sum                            // combiner: (U, U) -> U — DÙNG KHI PARALLEL
);
```

**⚠️ Ba quy tắc BẮT BUỘC của `reduce` (nếu vi phạm, parallel sẽ cho kết quả SAI):**

| Quy tắc | Nghĩa | Ví dụ đúng | Ví dụ SAI |
|---------|-------|-----------|-----------|
| **Identity hợp lệ** | `f(identity, x)` phải bằng `x` | `0` với `+`, `1` với `*`, `""` với nối chuỗi | `1` với `+` → kết quả sai khi parallel |
| **Kết hợp (associative)** | `(a⊕b)⊕c = a⊕(b⊕c)` | `+`, `*`, `max`, `min`, nối chuỗi | `-`, `/` → **kết quả không xác định** |
| **Không side effect** | Hàm phải thuần khiết | `Integer::sum` | `(a,b) -> { list.add(a); return a+b; }` |

```java
// 💣 Minh hoạ vi phạm tính kết hợp
System.out.println(Stream.of(1, 2, 3, 4).reduce(0, (a, b) -> a - b));           // -10
System.out.println(Stream.of(1, 2, 3, 4).parallel().reduce(0, (a, b) -> a - b)); // 2 😱 SAI!

// 💣 Minh hoạ identity sai
System.out.println(Stream.of(1, 2, 3).reduce(10, Integer::sum));            // 16
System.out.println(Stream.of(1, 2, 3).parallel().reduce(10, Integer::sum)); // 36 😱
// Vì mỗi thread đều cộng thêm 10!
```

**`reduce` vs `collect` — khi nào dùng cái nào?**

| | `reduce` | `collect` |
|---|---------|-----------|
| Bản chất | **Bất biến** — mỗi bước tạo giá trị MỚI | **Có thể thay đổi** — dồn vào một container |
| Phù hợp với | `int`, `long`, `BigDecimal`, `String` ngắn | `List`, `Map`, `StringBuilder` |
| Hiệu năng gom chuỗi/list | ❌ `O(n²)` — tạo object mỗi bước | ✅ `O(n)` |
| Ví dụ | `reduce(0, Integer::sum)` | `collect(toList())` |

```java
// ❌ CỰC CHẬM — reduce với List (tạo ArrayList mới n lần!)
List<String> sai = ds.stream().map(SinhVien::hoTen)
    .reduce(new ArrayList<>(), (l, s) -> { var m = new ArrayList<>(l); m.add(s); return m; },
            (a, b) -> { var m = new ArrayList<>(a); m.addAll(b); return m; });

// ✅ ĐÚNG — collect
List<String> dung = ds.stream().map(SinhVien::hoTen).toList();
```

### 5.7 `toArray` — chuyển về mảng

```java
Object[] toArray();
<A> A[] toArray(IntFunction<A[]> generator);
```

```java
Object[] a = ds.stream().toArray();                       // ⚠️ mất kiểu
SinhVien[] b = ds.stream().toArray(SinhVien[]::new);      // ⭐ giữ kiểu — array constructor ref
String[] c = ds.stream().map(SinhVien::hoTen).toArray(String[]::new);
int[] d = ds.stream().mapToInt(SinhVien::tuoi).toArray(); // primitive — không cần generator
```

> 💡 `SinhVien[]::new` là **array constructor reference** (Chương 3) — tương đương `size -> new SinhVien[size]`.

### 5.8 `collect` và `toList` — gom kết quả

```java
<R, A> R collect(Collector<? super T, A, R> collector);   // dạng Collector
<R> R collect(Supplier<R> supplier, BiConsumer<R, ? super T> accumulator,
              BiConsumer<R, R> combiner);                  // dạng 3 hàm
List<T> toList();                                          // Java 16+ ⭐
```

```java
// Java 16+ — ngắn gọn nhất
List<String> a = ds.stream().map(SinhVien::hoTen).toList();

// Java 8 — vẫn phổ biến
List<String> b = ds.stream().map(SinhVien::hoTen).collect(Collectors.toList());

// Dạng 3 hàm (ít dùng, nhưng hiểu để nắm cơ chế collect)
List<String> c = ds.stream().map(SinhVien::hoTen)
    .collect(ArrayList::new,          // supplier — tạo container
             ArrayList::add,          // accumulator — thêm 1 phần tử
             ArrayList::addAll);      // combiner — gộp 2 container (parallel)
```

**⚠️ `toList()` vs `collect(toList())` — khác biệt QUAN TRỌNG:**

| | `stream.toList()` (16+) | `collect(Collectors.toList())` | `collect(toUnmodifiableList())` (10+) |
|---|------------------------|-------------------------------|--------------------------------------|
| Có sửa được? | ❌ **Bất biến** | ✅ Sửa được (`ArrayList`) | ❌ Bất biến |
| Cho phép `null`? | ✅ Có | ✅ Có | ❌ **NPE** nếu có null |
| Kiểu cụ thể | Không đảm bảo | Không đảm bảo (thực tế `ArrayList`) | Không đảm bảo |
| Ngắn gọn | ⭐⭐⭐ | ⭐ | ⭐⭐ |
| Nên dùng | **Mặc định** | Khi **cần** sửa list sau đó | Khi muốn cấm null |

```java
List<String> a = ds.stream().map(SinhVien::hoTen).toList();
a.add("X");   // 💥 UnsupportedOperationException

List<String> b = ds.stream().map(SinhVien::hoTen).collect(Collectors.toList());
b.add("X");   // ✅ OK

// Cần list sửa được từ toList()?
List<String> c = new ArrayList<>(ds.stream().map(SinhVien::hoTen).toList());
```

> 🎓 **Best practice:** Mặc định dùng `.toList()`. Chỉ dùng `collect(toList())` khi bạn **thật sự cần** một list có thể sửa. Bất biến là mặc định an toàn hơn.

`collect` với `Collectors` là chủ đề lớn → cả [Phần 6](#phần-6--collectors--bộ-công-cụ-quyền-lực) dành cho nó.

### 5.9 `iterator` / `spliterator` — thoát ra khỏi thế giới stream

```java
// Khi cần quay lại vòng lặp thủ công (hiếm)
Iterator<SinhVien> it = ds.stream().filter(...).iterator();
while (it.hasNext()) { ... }
```

---
## Phần 6 — Collectors — Bộ Công Cụ Quyền Lực

Nếu Streams là một ngôn ngữ, thì `Collectors` là **từ điển** của nó. Lớp `java.util.stream.Collectors` có hơn **40 factory method** tĩnh. Bạn không cần nhớ hết — nhưng cần biết chúng **phân thành 6 nhóm** để tra khi cần.

```java
// ⭐ Best practice — static import để code gọn (CLAUDE.md khuyến khích)
import static java.util.stream.Collectors.*;
```

### 6.0 Bản đồ tổng quan 6 nhóm Collector

```text
                        ┌──────────────────┐
                        │   Collectors     │
                        └────────┬─────────┘
        ┌────────────┬───────────┼───────────┬──────────────┬─────────────┐
        ▼            ▼           ▼           ▼              ▼             ▼
   ① GOM VÀO    ② NHÓM/CHIA  ③ CHUỖI    ④ THỐNG KÊ    ⑤ BIẾN ĐỔI    ⑥ NÂNG CAO
   toList        groupingBy   joining     counting      mapping      teeing
   toSet         partitioningBy           summingInt    filtering    collectingAndThen
   toMap                                  averagingInt  flatMapping  reducing
   toCollection                           summarizing   toMap(merge) minBy/maxBy
```

### 6.1 Nhóm ① — Gom vào Collection

```java
// toList — danh sách (có thể trùng, giữ thứ tự)
List<String> a = ds.stream().map(SinhVien::hoTen).collect(toList());

// toSet — tập hợp (khử trùng, KHÔNG đảm bảo thứ tự — thực tế là HashSet)
Set<String> b = ds.stream().map(SinhVien::lop).collect(toSet());   // [12A1, 12A2, 12B1]

// toUnmodifiableList / toUnmodifiableSet (Java 10+) — bất biến, cấm null
List<String> c = ds.stream().map(SinhVien::hoTen).collect(toUnmodifiableList());

// toCollection — ⭐ chỉ định CHÍNH XÁC loại collection
TreeSet<String> d = ds.stream().map(SinhVien::lop)
    .collect(toCollection(TreeSet::new));           // tự sắp xếp
LinkedList<String> e = ds.stream().map(SinhVien::hoTen)
    .collect(toCollection(LinkedList::new));
Set<String> f = ds.stream().map(SinhVien::lop)
    .collect(toCollection(LinkedHashSet::new));     // ⭐ khử trùng + GIỮ thứ tự
```

> 💡 `toCollection` là "cửa thoát hiểm" khi bạn cần đảm bảo cài đặt cụ thể — ví dụ `TreeSet` để tự sắp xếp, `LinkedHashSet` để giữ thứ tự chèn, `ArrayDeque` để dùng như hàng đợi. Kiến thức Chương 2 phát huy ở đây.

### 6.2 Nhóm ① (tiếp) — `toMap`, cạm bẫy lớn nhất

```java
// Chữ ký 1 — key + value  (dsSanPham: List<SanPham>)
Map<Long, String> tenTheoId = dsSanPham.stream()
    .collect(toMap(SanPham::id, SanPham::ten));

// Chữ ký 2 — thêm mergeFunction xử lý KEY TRÙNG ⭐ BẮT BUỘC BIẾT
Map<String, String> theoLop = ds.stream()
    .collect(toMap(SinhVien::lop, SinhVien::hoTen));
// 💥 IllegalStateException: Duplicate key 12A1 (attempted merging values Nguyễn An and Trần Bình)

// ✅ FIX — nói cho Java biết phải làm gì khi trùng
Map<String, String> ok1 = ds.stream()
    .collect(toMap(SinhVien::lop, SinhVien::hoTen, (cũ, mới) -> cũ));          // giữ cái đầu
Map<String, String> ok2 = ds.stream()
    .collect(toMap(SinhVien::lop, SinhVien::hoTen, (cũ, mới) -> mới));         // giữ cái cuối
Map<String, String> ok3 = ds.stream()
    .collect(toMap(SinhVien::lop, SinhVien::hoTen, (cũ, mới) -> cũ + ", " + mới)); // nối

// Chữ ký 3 — thêm mapSupplier chỉ định loại Map
TreeMap<String, String> ok4 = ds.stream()
    .collect(toMap(SinhVien::lop, SinhVien::hoTen, (a, b) -> a, TreeMap::new));  // sắp theo key
LinkedHashMap<String, String> ok5 = ds.stream()
    .collect(toMap(SinhVien::lop, SinhVien::hoTen, (a, b) -> a, LinkedHashMap::new)); // giữ thứ tự
```

**⚠️ Cạm bẫy `null` trong `toMap`:**

> 📌 *Giả định cho các ví dụ về null:* `SinhVien` có thêm một trường tuỳ chọn `String biDanh` **có thể null**.

```java
// toMap KHÔNG cho phép VALUE là null (khác HashMap!)
Map<String, String> m = ds.stream()
    .collect(toMap(SinhVien::hoTen, sv -> sv.biDanh()));   // 💥 NPE nếu biDanh() trả null

// ✅ Cách 1 — lọc trước
ds.stream().filter(sv -> sv.biDanh() != null).collect(toMap(...));
// ✅ Cách 2 — thay null bằng giá trị mặc định
ds.stream().collect(toMap(SinhVien::hoTen, sv -> Objects.requireNonNullElse(sv.biDanh(), "")));
// ✅ Cách 3 — dùng HashMap thủ công qua toMap 4 tham số vẫn NPE → dùng forEach có kiểm soát
```

**Vì sao `toMap` NPE với null value?** Vì bên trong nó dùng `map.merge(k, v, fn)`, và `Map.merge` **ném NPE** nếu value là null (theo hợp đồng của `Map`).

**Mẫu `toMap` thường gặp nhất trong Spring Boot:**

```java
// Chuyển List<Entity> → Map<Id, Dto> để tra cứu nhanh O(1)
Map<Long, ProductDto> theoId = products.stream()
    .collect(toMap(Product::getId, ProductMapper::toDto));

// Nhóm ngược: id → object gốc
Map<Long, Product> index = products.stream()
    .collect(toMap(Product::getId, Function.identity()));   // ⭐ Function.identity() = x -> x
```

### 6.3 Nhóm ② — `groupingBy`: vũ khí mạnh nhất ⭐⭐⭐

`groupingBy` biến một `Stream<T>` thành `Map<K, List<T>>` — hoặc bất cứ thứ gì bạn muốn, nhờ **downstream collector**.

**Ba chữ ký:**

```java
// 1. Chỉ có classifier → Map<K, List<T>>
static <T, K> Collector<T, ?, Map<K, List<T>>> groupingBy(Function<? super T, ? extends K> classifier)

// 2. + downstream → Map<K, D>
static <T, K, A, D> Collector<T, ?, Map<K, D>> groupingBy(classifier, Collector<? super T, A, D> downstream)

// 3. + mapFactory → M extends Map<K, D>
static <T, K, D, A, M extends Map<K, D>> Collector<T, ?, M> groupingBy(classifier, Supplier<M> mapFactory, downstream)
```

#### Use case 1 — Nhóm cơ bản

```java
Map<String, List<SinhVien>> theoLop = ds.stream()
    .collect(groupingBy(SinhVien::lop));

// {12A1=[Nguyễn An, Trần Bình, Đỗ Giang], 12A2=[Lê Chi, Phạm Dũng], 12B1=[Hoàng Em, Vũ Phong]}

theoLop.forEach((lop, sv) -> System.out.println(lop + ": " + sv.size() + " học sinh"));
```

**Sơ đồ:**

```text
Stream<SinhVien>
  An(12A1) ──┐
  Bình(12A1)─┤─▶ khoá "12A1" ──▶ [An, Bình, Giang]
  Giang(12A1)┘
  Chi(12A2) ─┬─▶ khoá "12A2" ──▶ [Chi, Dũng]
  Dũng(12A2)─┘
  Em(12B1)  ─┬─▶ khoá "12B1" ──▶ [Em, Phong]
  Phong(12B1)┘
                      ▼
              Map<String, List<SinhVien>>
```

#### Use case 2 — Nhóm + đếm / thống kê (downstream)

```java
// Đếm số sinh viên mỗi lớp
Map<String, Long> demTheoLop = ds.stream()
    .collect(groupingBy(SinhVien::lop, counting()));
// {12A1=3, 12A2=2, 12B1=2}

// Điểm trung bình mỗi lớp
Map<String, Double> diemTB = ds.stream()
    .collect(groupingBy(SinhVien::lop, averagingDouble(SinhVien::diemTrungBinh)));
// {12A1=8.43, 12A2=7.75, 12B1=7.35}

// Tổng tuổi mỗi lớp
Map<String, Integer> tongTuoi = ds.stream()
    .collect(groupingBy(SinhVien::lop, summingInt(SinhVien::tuoi)));

// Học sinh giỏi nhất mỗi lớp
Map<String, Optional<SinhVien>> gioiNhat = ds.stream()
    .collect(groupingBy(SinhVien::lop, maxBy(comparingDouble(SinhVien::diemTrungBinh))));

// ⭐ Bỏ Optional đi bằng collectingAndThen
Map<String, SinhVien> gioiNhat2 = ds.stream()
    .collect(groupingBy(SinhVien::lop,
        collectingAndThen(maxBy(comparingDouble(SinhVien::diemTrungBinh)), Optional::get)));

// Thống kê đầy đủ (min/max/sum/avg/count trong 1 lần duyệt) ⭐
Map<String, DoubleSummaryStatistics> thongKe = ds.stream()
    .collect(groupingBy(SinhVien::lop, summarizingDouble(SinhVien::diemTrungBinh)));
thongKe.forEach((lop, s) ->
    System.out.printf("%s: n=%d, min=%.1f, max=%.1f, avg=%.2f%n",
        lop, s.getCount(), s.getMin(), s.getMax(), s.getAverage()));
```

#### Use case 3 — Nhóm + biến đổi giá trị (`mapping`)

```java
// Chỉ lấy TÊN, không giữ cả object
Map<String, List<String>> tenTheoLop = ds.stream()
    .collect(groupingBy(SinhVien::lop, mapping(SinhVien::hoTen, toList())));
// {12A1=[Nguyễn An, Trần Bình, Đỗ Giang], ...}

// Nhóm thành Set (khử trùng)
Map<String, Set<Integer>> tuoiTheoLop = ds.stream()
    .collect(groupingBy(SinhVien::lop, mapping(SinhVien::tuoi, toSet())));

// Nhóm rồi nối chuỗi
Map<String, String> chuoiTen = ds.stream()
    .collect(groupingBy(SinhVien::lop, mapping(SinhVien::hoTen, joining(", "))));
// {12A1="Nguyễn An, Trần Bình, Đỗ Giang", ...}

// flatMapping (Java 9+) — nhóm rồi làm phẳng ⭐
Map<String, Set<String>> monTheoLop = ds.stream()
    .collect(groupingBy(SinhVien::lop, flatMapping(sv -> sv.monHoc().stream(), toSet())));
// {12A1=[Toán, Lý, Hoá, Văn, Sinh], ...}

// filtering (Java 9+) — lọc TRONG nhóm ⭐
Map<String, List<SinhVien>> gioiTheoLop = ds.stream()
    .collect(groupingBy(SinhVien::lop, filtering(sv -> sv.diemTrungBinh() >= 8.0, toList())));
// ⚠️ KHÁC filter() trước groupingBy: cách này GIỮ CẢ LỚP RỖNG
```

**So sánh `filtering` vs `filter` — khác biệt tinh tế nhưng quan trọng:**

```java
// Cách A — filter TRƯỚC: lớp không có ai giỏi sẽ BIẾN MẤT khỏi map
Map<String, List<SinhVien>> a = ds.stream()
    .filter(sv -> sv.diemTrungBinh() >= 8.0)
    .collect(groupingBy(SinhVien::lop));
// {12A1=[An, Giang], 12B1=[Em]}          ← không có 12A2!

// Cách B — filtering downstream: lớp rỗng vẫn xuất hiện với list rỗng
Map<String, List<SinhVien>> b = ds.stream()
    .collect(groupingBy(SinhVien::lop, filtering(sv -> sv.diemTrungBinh() >= 8.0, toList())));
// {12A1=[An, Giang], 12A2=[], 12B1=[Em]}  ← CÓ 12A2 rỗng ✅
```

👉 Chọn cách nào tuỳ nghiệp vụ: báo cáo cần hiện **mọi lớp** (kể cả 0 người) → cách B.

#### Use case 4 — Nhóm nhiều tầng (nested grouping) ⭐

```java
// Nhóm theo LỚP, rồi trong mỗi lớp nhóm theo TUỔI
Map<String, Map<Integer, List<SinhVien>>> haiTang = ds.stream()
    .collect(groupingBy(SinhVien::lop,
             groupingBy(SinhVien::tuoi)));
// {12A1={17=[An], 18=[Bình], 21=[Giang]}, ...}

// Ba tầng: lớp → xếp loại → đếm
Map<String, Map<String, Long>> baTang = ds.stream()
    .collect(groupingBy(SinhVien::lop,
             groupingBy(sv -> sv.diemTrungBinh() >= 8.0 ? "Giỏi"
                            : sv.diemTrungBinh() >= 6.5 ? "Khá" : "Trung bình",
             counting())));
// {12A1={Giỏi=2, Khá=1}, 12A2={Giỏi=1, Trung bình=1}, 12B1={Giỏi=1, Trung bình=1}}
```

**In ra đẹp:**

```java
baTang.forEach((lop, xepLoai) -> {
    System.out.println("Lớp " + lop + ":");
    xepLoai.forEach((loai, so) -> System.out.println("   " + loai + ": " + so));
});
```

#### Use case 5 — Nhóm theo KHOÁ GHÉP (composite key)

Khi cần nhóm theo **nhiều trường cùng lúc** mà không muốn map lồng nhau:

```java
// ⭐ Cách 1 — record làm khoá (TỐT NHẤT: có equals/hashCode, đọc rõ nghĩa)
record KhoaLopTuoi(String lop, int tuoi) {}

Map<KhoaLopTuoi, List<SinhVien>> theoKhoaGhep = ds.stream()
    .collect(groupingBy(sv -> new KhoaLopTuoi(sv.lop(), sv.tuoi())));

// ⭐ Cách 2 — List.of làm khoá (nhanh gọn, kém rõ nghĩa)
Map<List<Object>, Long> theoList = ds.stream()
    .collect(groupingBy(sv -> List.of(sv.lop(), sv.tuoi()), counting()));

// ❌ Cách 3 — nối chuỗi (TRÁNH: dễ va chạm khoá, mất kiểu)
Map<String, Long> xau = ds.stream()
    .collect(groupingBy(sv -> sv.lop() + "|" + sv.tuoi(), counting()));
// Nếu dữ liệu chứa ký tự "|" → sai kết quả
```

> ⚠️ **Khoá của `groupingBy` PHẢI bất biến và có `equals`/`hashCode` đúng.** Dùng object mutable làm khoá → sau khi sửa object, bạn **không bao giờ tìm lại được** phần tử trong map. `record` là lựa chọn hoàn hảo.

#### Use case bổ sung — Chọn loại Map và nhóm song song

```java
// Map có thứ tự theo khoá
TreeMap<String, Long> sapXep = ds.stream()
    .collect(groupingBy(SinhVien::lop, TreeMap::new, counting()));

// Map giữ thứ tự xuất hiện
LinkedHashMap<String, List<SinhVien>> thuTu = ds.stream()
    .collect(groupingBy(SinhVien::lop, LinkedHashMap::new, toList()));

// groupingByConcurrent — CHỈ dùng với parallel + không cần thứ tự
ConcurrentMap<String, List<SinhVien>> ss = ds.parallelStream()
    .collect(groupingByConcurrent(SinhVien::lop));
```

### 6.4 Nhóm ② (tiếp) — `partitioningBy`: chia đôi

`partitioningBy` là **trường hợp đặc biệt** của `groupingBy` với khoá kiểu `boolean`.

```java
Map<Boolean, List<SinhVien>> chia = ds.stream()
    .collect(partitioningBy(sv -> sv.tuoi() >= 18));

List<SinhVien> truongThanh = chia.get(true);
List<SinhVien> viThanhNien = chia.get(false);

// Có downstream y hệt groupingBy
Map<Boolean, Long> dem = ds.stream()
    .collect(partitioningBy(sv -> sv.diemTrungBinh() >= 8.0, counting()));
// {false=4, true=3}

Map<Boolean, List<String>> ten = ds.stream()
    .collect(partitioningBy(sv -> sv.tuoi() >= 18, mapping(SinhVien::hoTen, toList())));
```

**`partitioningBy` vs `groupingBy(x -> boolean)` — khác biệt thật:**

| | `partitioningBy` | `groupingBy` với khoá boolean |
|---|-----------------|-------------------------------|
| Kiểu trả về | `Map<Boolean, D>` | `Map<Boolean, D>` |
| Luôn có **cả 2 khoá**? | ✅ **Có** — kể cả khi một bên rỗng | ❌ Chỉ có khoá thực sự xuất hiện |
| Cài đặt bên trong | `Partition` — 2 ô, không hash | `HashMap` — có băm |
| Hiệu năng | ⚡ Nhanh hơn | Chậm hơn |
| `get(false)` khi không có ai | `[]` (list rỗng) | `null` ☠️ |

```java
// 💣 Bằng chứng
var a = List.of(1, 2, 3).stream().collect(partitioningBy(n -> n > 10));
System.out.println(a);            // {false=[1, 2, 3], true=[]}   ✅ an toàn
System.out.println(a.get(true).size());   // 0

var b = List.of(1, 2, 3).stream().collect(groupingBy(n -> n > 10));
System.out.println(b);            // {false=[1, 2, 3]}
System.out.println(b.get(true));  // null → NPE nếu gọi .size() ☠️
```

> 🎓 **Quy tắc:** Điều kiện nhị phân → **luôn dùng `partitioningBy`**, không dùng `groupingBy`.

### 6.5 Nhóm ③ — `joining`: nối chuỗi

```java
String a = ds.stream().map(SinhVien::hoTen).collect(joining());
// "Nguyễn AnTrần BìnhLê Chi..."

String b = ds.stream().map(SinhVien::hoTen).collect(joining(", "));
// "Nguyễn An, Trần Bình, Lê Chi, ..."

String c = ds.stream().map(SinhVien::hoTen).collect(joining(", ", "[", "]"));
// "[Nguyễn An, Trần Bình, Lê Chi, ...]"

// Ứng dụng: sinh câu SQL IN (...)
String sql = "SELECT * FROM sinh_vien WHERE lop IN ("
    + ds.stream().map(SinhVien::lop).distinct().map(l -> "'" + l + "'").collect(joining(", "))
    + ")";
// ⚠️ Chỉ để minh hoạ! Thực tế PHẢI dùng PreparedStatement / JPQL parameter để tránh SQL injection
```

**Vì sao `joining` nhanh hơn `reduce` nối chuỗi?**

```java
// ❌ O(n²) — mỗi bước tạo String MỚI, copy toàn bộ ký tự cũ
String cham = ds.stream().map(SinhVien::hoTen).reduce("", (a, b) -> a + b);

// ✅ O(n) — dùng StringBuilder bên trong, không copy lại
String nhanh = ds.stream().map(SinhVien::hoTen).collect(joining());
```

Với 10.000 chuỗi, chênh lệch có thể lên tới **hàng trăm lần**.

### 6.6 Nhóm ④ — Thống kê

```java
// Đếm
Long n = ds.stream().collect(counting());              // = stream.count()

// Tổng
Integer tongTuoi   = ds.stream().collect(summingInt(SinhVien::tuoi));
Long    tongLong   = ds.stream().collect(summingLong(sv -> sv.tuoi()));
Double  tongDiem   = ds.stream().collect(summingDouble(SinhVien::diemTrungBinh));

// Trung bình — LUÔN trả Double
Double tbTuoi = ds.stream().collect(averagingInt(SinhVien::tuoi));
Double tbDiem = ds.stream().collect(averagingDouble(SinhVien::diemTrungBinh));

// Min/Max — trả Optional
Optional<SinhVien> max = ds.stream().collect(maxBy(comparingDouble(SinhVien::diemTrungBinh)));
Optional<SinhVien> min = ds.stream().collect(minBy(comparingInt(SinhVien::tuoi)));

// ⭐ summarizing — TẤT CẢ trong MỘT lần duyệt
IntSummaryStatistics tk = ds.stream().collect(summarizingInt(SinhVien::tuoi));
System.out.println("count = " + tk.getCount());
System.out.println("sum   = " + tk.getSum());
System.out.println("min   = " + tk.getMin());
System.out.println("max   = " + tk.getMax());
System.out.println("avg   = " + tk.getAverage());
```

> 💡 **Khi nào dùng `Collectors.summingInt` thay vì `mapToInt().sum()`?**
> - Ở **tầng cao nhất** của pipeline → dùng `mapToInt().sum()` (ngắn gọn, không boxing).
> - Làm **downstream** của `groupingBy` → **bắt buộc** dùng `Collectors.summingInt` (vì downstream cần một `Collector`).

```java
// Tầng cao nhất
int a = ds.stream().mapToInt(SinhVien::tuoi).sum();          // ⭐ gọn hơn

// Downstream
Map<String, Integer> b = ds.stream()
    .collect(groupingBy(SinhVien::lop, summingInt(SinhVien::tuoi)));   // bắt buộc
```

### 6.7 Nhóm ⑤ — Biến đổi kết quả

#### `collectingAndThen` — hậu xử lý ⭐

```java
static <T,A,R,RR> Collector<T,A,RR> collectingAndThen(Collector<T,A,R> downstream,
                                                      Function<R,RR> finisher)
```

```java
// Gom thành list rồi khoá lại (bất biến)
List<String> batBien = ds.stream().map(SinhVien::hoTen)
    .collect(collectingAndThen(toList(), Collections::unmodifiableList));

// Bỏ Optional trong downstream của groupingBy (đã gặp ở 6.3)
Map<String, SinhVien> gioiNhat = ds.stream()
    .collect(groupingBy(SinhVien::lop,
        collectingAndThen(maxBy(comparingDouble(SinhVien::diemTrungBinh)), Optional::get)));

// Gom rồi đếm luôn
Integer soLuong = ds.stream().collect(collectingAndThen(toList(), List::size));

// Gom rồi bọc vào DTO
record BaoCao(int tong, List<String> ten) {}
BaoCao bc = ds.stream().map(SinhVien::hoTen)
    .collect(collectingAndThen(toList(), l -> new BaoCao(l.size(), l)));
```

#### `reducing` — `reduce` phiên bản Collector

```java
// 3 dạng, giống reduce
Optional<SinhVien> a = ds.stream().collect(reducing((x, y) -> x.tuoi() > y.tuoi() ? x : y));
Integer b = ds.stream().collect(reducing(0, SinhVien::tuoi, Integer::sum));

// Dùng chủ yếu làm downstream — nơi reduce() không dùng được
Map<String, BigDecimal> doanhThu = donHang.stream()
    .flatMap(d -> d.chiTiet().stream())
    .collect(groupingBy(ct -> ct.sanPham().danhMuc(),
             reducing(BigDecimal.ZERO, ChiTietDonHang::thanhTien, BigDecimal::add)));
```

### 6.8 Nhóm ⑥ — `teeing` (Java 12+): hai collector, một lần duyệt ⭐

```java
static <T,R1,R2,R> Collector<T,?,R> teeing(Collector<T,?,R1> c1,
                                           Collector<T,?,R2> c2,
                                           BiFunction<R1,R2,R> merger)
```

Đây là công cụ giải quyết bài toán: *"Tôi cần **hai** kết quả từ **một** stream, nhưng stream chỉ dùng được một lần."*

```java
// ❌ Cách cũ — duyệt 2 lần
double tong = ds.stream().mapToDouble(SinhVien::diemTrungBinh).sum();
long dem = ds.stream().count();
double tb = tong / dem;

// ✅ teeing — duyệt 1 lần
record ThongKe(double tong, long soLuong, double trungBinh) {}

ThongKe tk = ds.stream().collect(teeing(
    summingDouble(SinhVien::diemTrungBinh),   // collector 1
    counting(),                                // collector 2
    (tong2, dem2) -> new ThongKe(tong2, dem2, dem2 == 0 ? 0 : tong2 / dem2)   // gộp
));

// Ví dụ 2 — min và max cùng lúc
record KhoangDiem(double thap, double cao) {}
KhoangDiem k = ds.stream().collect(teeing(
    minBy(comparingDouble(SinhVien::diemTrungBinh)),
    maxBy(comparingDouble(SinhVien::diemTrungBinh)),
    (min, max) -> new KhoangDiem(
        min.map(SinhVien::diemTrungBinh).orElse(0.0),
        max.map(SinhVien::diemTrungBinh).orElse(0.0))
));

// Ví dụ 3 — chia list và đếm cùng lúc
record KetQua(List<String> ten, long soGioi) {}
KetQua r = ds.stream().collect(teeing(
    mapping(SinhVien::hoTen, toList()),
    filtering(sv -> sv.diemTrungBinh() >= 8.0, counting()),
    KetQua::new
));
```

### 6.9 Kết hợp Collector — ví dụ "trùm cuối"

```java
/**
 * Báo cáo: với mỗi danh mục sản phẩm, tính
 *   - tổng doanh thu
 *   - số đơn hàng liên quan
 *   - tên 3 sản phẩm bán chạy nhất
 * Chỉ tính đơn HOÀN THÀNH. Sắp xếp danh mục theo tên.
 */
record BaoCaoDanhMuc(BigDecimal doanhThu, long soDong, List<String> topSanPham) {}

Map<String, BaoCaoDanhMuc> baoCao = donHang.stream()
    .filter(d -> d.trangThai() == TrangThai.HOAN_THANH)
    .flatMap(d -> d.chiTiet().stream())
    .collect(groupingBy(
        ct -> ct.sanPham().danhMuc(),          // ① khoá nhóm
        TreeMap::new,                           // ② map có thứ tự
        teeing(                                 // ③ ba kết quả song song
            reducing(BigDecimal.ZERO, ChiTietDonHang::thanhTien, BigDecimal::add),
            counting(),
            (tong, dem) -> Map.entry(tong, dem)
        )
    ))
    .entrySet().stream()
    .collect(toMap(
        Map.Entry::getKey,
        e -> new BaoCaoDanhMuc(e.getValue().getKey(), e.getValue().getValue(), List.of()),
        (a, b) -> a,
        TreeMap::new
    ));
```

> ⚠️ **Cảnh báo về khả năng đọc:** Đoạn code trên tuy "đúng" nhưng đã chạm ngưỡng khó đọc. Khi pipeline vượt quá ~7 dòng hoặc lồng quá 2 tầng collector, hãy **tách thành nhiều bước có tên**:

```java
// ✅ Dễ đọc hơn nhiều — tách bước, đặt tên
var dongHang = donHang.stream()
    .filter(d -> d.trangThai() == TrangThai.HOAN_THANH)
    .flatMap(d -> d.chiTiet().stream())
    .toList();

Map<String, BigDecimal> doanhThu = dongHang.stream()
    .collect(groupingBy(ct -> ct.sanPham().danhMuc(),
             reducing(BigDecimal.ZERO, ChiTietDonHang::thanhTien, BigDecimal::add)));

Map<String, Long> soDong = dongHang.stream()
    .collect(groupingBy(ct -> ct.sanPham().danhMuc(), counting()));
```

> 🎓 **Best practice:** Streams giúp code **dễ đọc hơn**. Nếu pipeline của bạn khiến người khác phải đọc 3 lần mới hiểu, bạn đã **đi quá xa** — hãy tách ra.

---
## Phần 7 — Viết Collector Của Riêng Bạn

99% trường hợp `Collectors.*` đã đủ. Nhưng khi cần, hiểu cách `Collector` hoạt động sẽ giúp bạn **đọc được JDK source** và giải quyết các bài toán gom dữ liệu đặc biệt.

### 7.1 Giải phẫu interface `Collector`

```java
public interface Collector<T, A, R> {
    Supplier<A>          supplier();      // ① tạo container rỗng
    BiConsumer<A, T>     accumulator();   // ② nhét 1 phần tử vào container
    BinaryOperator<A>    combiner();      // ③ gộp 2 container (chỉ dùng khi PARALLEL)
    Function<A, R>       finisher();      // ④ biến container thành kết quả cuối
    Set<Characteristics> characteristics(); // ⑤ gợi ý tối ưu cho JDK
}
```

**Ba tham số kiểu — nhớ bằng ẩn dụ nhà máy:**

| Kiểu | Tên | Vai trò | Ví dụ với `toList()` |
|------|-----|---------|---------------------|
| `T` | **T**ype nguồn | Kiểu phần tử đi vào | `String` |
| `A` | **A**ccumulator | Kiểu container trung gian (thường **ẩn**, ký hiệu `?`) | `ArrayList<String>` |
| `R` | **R**esult | Kiểu kết quả cuối | `List<String>` |

**Quy trình chạy — trường hợp TUẦN TỰ:**

```text
  ① supplier()  ──▶  A container = new ArrayList<>()
                          │
  ② accumulator() ──▶  container.add("An")
                       container.add("Bình")       ← lặp cho từng phần tử
                       container.add("Chi")
                          │
  ④ finisher()  ──▶  R result = container   (với toList thì finisher = identity)
                          │
                          ▼
                    ["An","Bình","Chi"]

  ③ combiner() KHÔNG được gọi (chỉ 1 thread)
```

**Quy trình chạy — trường hợp SONG SONG:**

```text
      [A, B, C, D, E, F]  ──── Spliterator chia đôi ────┐
              │                                          │
      ┌───────┴────────┐                        ┌────────┴───────┐
   [A, B, C]        [D, E, F]                thread-1        thread-2
      │                 │
  ① supplier()      ① supplier()      ← MỖI thread có container RIÊNG
  ② accumulate      ② accumulate
      │                 │
   listA=[A,B,C]     listB=[D,E,F]
      └────────┬────────┘
          ③ combiner(listA, listB)   ← GỘP
               │
          [A,B,C,D,E,F]
               │
          ④ finisher()
```

👉 **Đây là lý do `combiner` tồn tại.** Nếu bạn không bao giờ dùng parallel, `combiner` vẫn phải khai báo (để hợp lệ) nhưng sẽ không chạy.

### 7.2 Năm `Characteristics` — gợi ý tối ưu

```java
enum Characteristics {
    CONCURRENT,        // accumulator thread-safe → nhiều thread dùng CHUNG 1 container
    UNORDERED,         // không cần giữ thứ tự → JDK tự do tối ưu
    IDENTITY_FINISH    // finisher là hàm đồng nhất → JDK BỎ QUA bước finisher (nhanh hơn)
}
```

| Characteristic | Nghĩa | Ví dụ collector có |
|----------------|-------|-------------------|
| `IDENTITY_FINISH` | `A` và `R` cùng kiểu, `finisher` = `x -> x` | `toList`, `toSet`, `toMap`, `toCollection` |
| `UNORDERED` | Kết quả không phụ thuộc thứ tự gặp | `toSet`, `groupingBy`, `toMap` |
| `CONCURRENT` | Dùng chung container thread-safe | `toConcurrentMap`, `groupingByConcurrent` |

> ⚠️ Khai báo sai `CONCURRENT` cho một container **không** thread-safe → **race condition, mất dữ liệu ngẫu nhiên**. Nếu không chắc, **đừng khai báo**.

### 7.3 Ví dụ 1 (dễ) — Tự cài `toList` để hiểu cơ chế

```java
import java.util.*;
import java.util.function.*;
import java.util.stream.Collector;

public class MyCollectors {

    /** Bản cài đặt "thủ công" của Collectors.toList() */
    public static <T> Collector<T, ?, List<T>> toMyList() {
        return Collector.of(
            ArrayList::new,                    // ① supplier
            List::add,                         // ② accumulator  (list, phần tử) -> list.add(...)
            (trai, phai) -> {                  // ③ combiner
                trai.addAll(phai);
                return trai;                   // ⚠️ PHẢI trả về container gộp
            },
            Collector.Characteristics.IDENTITY_FINISH   // ⑤ không có finisher
        );
    }
}

// Dùng:
List<String> kq = ds.stream().map(SinhVien::hoTen).collect(MyCollectors.toMyList());
```

**Giải thích từng dòng:**
- `ArrayList::new` — constructor reference, tương đương `() -> new ArrayList<>()`;
- `List::add` — method reference kiểu "instance method của lớp tuỳ ý" (Chương 3): `(list, item) -> list.add(item)`. `add` trả `boolean` nhưng `BiConsumer` cần `void` → Java tự **bỏ giá trị trả về**;
- combiner **phải trả về** container (không được chỉ `addAll` rồi return void);
- vì không truyền `finisher`, `Collector.of` dùng bản `IDENTITY_FINISH` (4 tham số).

### 7.4 Ví dụ 2 (trung bình) — `toUnmodifiableList` với finisher

```java
/** Gom vào list rồi khoá lại — có finisher thật sự */
public static <T> Collector<T, ?, List<T>> toImmutableList() {
    return Collector.of(
        ArrayList::new,                      // ① container LÀM VIỆC được (mutable)
        List::add,                           // ②
        (a, b) -> { a.addAll(b); return a; },// ③
        Collections::unmodifiableList        // ④ finisher: đóng băng kết quả
        // ⚠️ KHÔNG có IDENTITY_FINISH vì finisher làm việc thật
    );
}
```

> 🎓 **Mẫu thiết kế chung:** dùng container **mutable** để gom (nhanh), rồi **finisher** biến nó thành kết quả **immutable** (an toàn). Đây chính xác là cách `Collectors.toUnmodifiableList()` hoạt động.

### 7.5 Ví dụ 3 (trung bình) — Collector đếm tần suất

```java
/** Đếm số lần xuất hiện của mỗi phần tử → Map<T, Integer> */
public static <T> Collector<T, ?, Map<T, Integer>> demTanSuat() {
    return Collector.of(
        HashMap::new,
        (map, phanTu) -> map.merge(phanTu, 1, Integer::sum),   // ⭐ merge gọn hơn if-else
        (m1, m2) -> {
            m2.forEach((k, v) -> m1.merge(k, v, Integer::sum));// gộp 2 map
            return m1;
        },
        Collector.Characteristics.UNORDERED,
        Collector.Characteristics.IDENTITY_FINISH
    );
}

// Dùng:
Map<String, Integer> tanSuat = donHang.stream()
    .flatMap(d -> d.chiTiet().stream())
    .map(ct -> ct.sanPham().danhMuc())
    .collect(demTanSuat());
// {Điện tử=3, Sách=2, Thời trang=1}
```

> 💡 Thực ra `Collectors.groupingBy(x -> x, counting())` làm được điều tương tự. **Bài học:** trước khi viết Collector riêng, **luôn** kiểm tra `Collectors.*` đã có sẵn chưa.

### 7.6 Ví dụ 4 (khó) — Collector tính trung vị (median)

Đây là ví dụ mà `Collectors.*` **thật sự không có**:

```java
/** Tính trung vị — cần nhìn thấy TOÀN BỘ dữ liệu đã sắp xếp */
public static Collector<Double, ?, Optional<Double>> trungVi() {
    return Collector.of(
        ArrayList<Double>::new,
        List::add,
        (a, b) -> { a.addAll(b); return a; },
        ds -> {                                     // ④ finisher — nơi tính toán thật
            if (ds.isEmpty()) return Optional.empty();
            Collections.sort(ds);
            int n = ds.size();
            double kq = (n % 2 == 1)
                ? ds.get(n / 2)                             // lẻ → phần tử giữa
                : (ds.get(n / 2 - 1) + ds.get(n / 2)) / 2.0;// chẵn → trung bình 2 phần tử giữa
            return Optional.of(kq);
        }
    );
}

// Dùng:
Optional<Double> tv = ds.stream().map(SinhVien::diemTrungBinh).collect(trungVi());
System.out.println(tv.orElse(0.0));   // 8.5

// Dùng làm DOWNSTREAM ⭐ — đây mới là giá trị thật sự của custom collector
Map<String, Optional<Double>> tvTheoLop = ds.stream()
    .collect(groupingBy(SinhVien::lop,
             mapping(SinhVien::diemTrungBinh, trungVi())));
```

### 7.7 Ví dụ 5 (khó) — Collector viết bằng class đầy đủ

Khi logic phức tạp, viết class rõ ràng hơn `Collector.of`:

```java
/** Gom stream thành chuỗi CSV có header, escape dấu phẩy */
public class CsvCollector<T> implements Collector<T, StringBuilder, String> {

    private final List<String> header;
    private final Function<T, List<String>> toRow;

    public CsvCollector(List<String> header, Function<T, List<String>> toRow) {
        this.header = List.copyOf(header);
        this.toRow  = Objects.requireNonNull(toRow);
    }

    @Override
    public Supplier<StringBuilder> supplier() {
        return StringBuilder::new;   // ① container: StringBuilder
    }

    @Override
    public BiConsumer<StringBuilder, T> accumulator() {
        return (sb, item) -> {
            String dong = toRow.apply(item).stream()
                .map(CsvCollector::escape)
                .collect(Collectors.joining(","));
            sb.append(dong).append('\n');
        };
    }

    @Override
    public BinaryOperator<StringBuilder> combiner() {
        return (a, b) -> a.append(b);   // ③ nối 2 StringBuilder
    }

    @Override
    public Function<StringBuilder, String> finisher() {
        return sb -> String.join(",", header) + "\n" + sb;   // ④ thêm header
    }

    @Override
    public Set<Characteristics> characteristics() {
        return Set.of();   // ⑤ KHÔNG có đặc tính nào — có finisher, cần thứ tự
    }

    /** Bọc trong nháy kép nếu chứa dấu phẩy hoặc nháy */
    private static String escape(String s) {
        if (s == null) return "";
        return (s.contains(",") || s.contains("\""))
            ? "\"" + s.replace("\"", "\"\"") + "\""
            : s;
    }
}

// Dùng:
String csv = ds.stream().collect(new CsvCollector<SinhVien>(
    List.of("Họ tên", "Tuổi", "Lớp", "Điểm"),
    sv -> List.of(sv.hoTen(), String.valueOf(sv.tuoi()), sv.lop(),
                  String.valueOf(sv.diemTrungBinh()))
));
System.out.println(csv);
```

```text
Họ tên,Tuổi,Lớp,Điểm
Nguyễn An,17,12A1,8.5
Trần Bình,18,12A1,7.2
...
```

### 7.8 Checklist khi viết Collector

| # | Câu hỏi | Nếu bỏ qua |
|---|---------|-----------|
| 1 | `Collectors.*` đã có sẵn chưa? | Viết thừa, khó bảo trì |
| 2 | Kết hợp `collectingAndThen` + collector có sẵn được không? | Viết thừa |
| 3 | `combiner` có **đúng** không? | Parallel cho kết quả sai/mất dữ liệu |
| 4 | `combiner` có **trả về** container không? | Compile lỗi hoặc mất dữ liệu |
| 5 | Container có thread-safe không? Nếu không → **đừng** khai `CONCURRENT` | Race condition |
| 6 | `A` và `R` cùng kiểu? → khai `IDENTITY_FINISH` | Mất một chút hiệu năng |
| 7 | Kết quả có phụ thuộc thứ tự? Nếu không → khai `UNORDERED` | Mất cơ hội tối ưu |
| 8 | Đã test với `.parallel()` chưa? | Bug chỉ xuất hiện trên production |

```java
// ⭐ Test bắt buộc cho mọi custom collector
@Test
void collector_choKetQuaGiongNhau_dùTuanTuHaySongSong() {
    List<Double> lon = IntStream.range(0, 100_000)
        .mapToObj(i -> (double) i).toList();

    var tuanTu  = lon.stream().collect(trungVi());
    var songSong = lon.parallelStream().collect(trungVi());

    assertThat(songSong).isEqualTo(tuanTu);   // nếu FAIL → combiner sai
}
```

---

## Phần 8 — Primitive Streams — `IntStream`, `LongStream`, `DoubleStream`

### 8.1 Vấn đề: cái giá của Boxing

```java
// Stream<Integer> — MỖI phần tử là một object trên heap
List<Integer> so = IntStream.rangeClosed(1, 10_000_000).boxed().toList();
long tong = so.stream().mapToLong(Integer::longValue).sum();
```

Mỗi `Integer` chiếm **16 byte** (header 12 + int 4, làm tròn 8) so với `int` chỉ **4 byte** — gấp **4 lần** bộ nhớ. Chưa kể:
- Mỗi lần đọc giá trị phải **dereference con trỏ** → cache miss;
- GC phải quản lý 10 triệu object;
- Boxing/unboxing tốn CPU.

```java
// ✅ IntStream — làm việc trên int thuần, 0 object
long tong = IntStream.rangeClosed(1, 10_000_000).asLongStream().sum();
```

**Đo thực tế (JMH, 10 triệu phần tử, số liệu tham khảo):**

| Cách | Thời gian | Bộ nhớ cấp phát |
|------|----------|-----------------|
| `Stream<Integer>.reduce(0, Integer::sum)` | ~95 ms | ~160 MB |
| `IntStream.sum()` | ~8 ms | ~0 MB |
| Vòng `for` trên `int[]` | ~6 ms | 0 MB |

> ⚠️ **Ngoại lệ quan trọng:** Java **cache** các `Integer` trong khoảng `[-128, 127]` (`Integer.valueOf`). Với dữ liệu nhỏ và giá trị nhỏ, chênh lệch không rõ rệt.

### 8.2 Các method độc quyền của primitive stream

```java
IntStream is = IntStream.rangeClosed(1, 10);

int    tong = is.sum();                        // ⭐ Stream<T> KHÔNG có
OptionalDouble tb = IntStream.of(1,2,3).average();   // ⭐
OptionalInt max = IntStream.of(1,2,3).max();         // không cần comparator
OptionalInt min = IntStream.of(1,2,3).min();
IntSummaryStatistics tk = IntStream.of(1,2,3).summaryStatistics();   // ⭐ tất cả trong 1

// Chuyển đổi
Stream<Integer> boxed  = IntStream.of(1,2).boxed();
LongStream      rongHon = IntStream.of(1,2).asLongStream();
DoubleStream    thuc   = IntStream.of(1,2).asDoubleStream();
Stream<String>  obj    = IntStream.of(1,2).mapToObj(i -> "#" + i);
```

**Bảng chuyển đổi qua lại — học thuộc bảng này:**

| Từ ↓ / Sang → | `Stream<T>` | `IntStream` | `LongStream` | `DoubleStream` |
|---------------|-------------|-------------|--------------|----------------|
| `Stream<T>` | `map` | `mapToInt` | `mapToLong` | `mapToDouble` |
| `IntStream` | `mapToObj` / `boxed` | `map` | `asLongStream` / `mapToLong` | `asDoubleStream` / `mapToDouble` |
| `LongStream` | `mapToObj` / `boxed` | `mapToInt` | `map` | `asDoubleStream` |
| `DoubleStream` | `mapToObj` / `boxed` | `mapToInt` (cắt phần thập phân!) | `mapToLong` | `map` |

```java
// Ví dụ đầy đủ vòng đời
List<SinhVien> ds = DuLieuMau.sinhVien();

IntSummaryStatistics tk = ds.stream()
    .mapToInt(SinhVien::tuoi)                  // Stream<SinhVien> → IntStream
    .summaryStatistics();

List<String> nhan = ds.stream()
    .mapToInt(SinhVien::tuoi)                  // → IntStream
    .distinct()
    .sorted()
    .mapToObj(t -> t + " tuổi")                // → Stream<String>
    .toList();
```

### 8.3 Cạm bẫy với `average()` và stream rỗng

```java
// average() trả OptionalDouble vì stream có thể rỗng
OptionalDouble tb = ds.stream().mapToInt(SinhVien::tuoi).average();

double a = tb.orElse(0.0);            // ✅ an toàn
double b = tb.getAsDouble();          // ⚠️ NoSuchElementException nếu rỗng

// ❌ Lỗi kinh điển: chia cho count
double sai = ds.stream().mapToInt(SinhVien::tuoi).sum() / ds.size();
// ☠️ Chia số nguyên! 130/7 = 18 chứ không phải 18.57
// ✅ Đúng
double dung = ds.stream().mapToInt(SinhVien::tuoi).average().orElse(0.0);
```

### 8.4 `IntStream` thay thế vòng `for` cổ điển

```java
// Duyệt chỉ số
for (int i = 0; i < n; i++) { ... }
IntStream.range(0, n).forEach(i -> { ... });

// Duyệt ngược
for (int i = n - 1; i >= 0; i--) { ... }
IntStream.iterate(n - 1, i -> i >= 0, i -> i - 1).forEach(i -> { ... });

// Bước nhảy 2
for (int i = 0; i < n; i += 2) { ... }
IntStream.iterate(0, i -> i < n, i -> i + 2).forEach(i -> { ... });

// Ghép index với giá trị ⭐ mẫu rất hay dùng
List<String> ten = List.of("An", "Bình", "Chi");
Map<Integer, String> coIndex = IntStream.range(0, ten.size())
    .boxed()
    .collect(toMap(i -> i, ten::get));
```

> 💡 **Có nên thay mọi vòng `for` bằng `IntStream.range`?** **Không.** Vòng `for` với chỉ số vẫn rõ ràng và nhanh hơn. Chỉ dùng `IntStream.range` khi bạn cần **nối tiếp** vào một pipeline stream khác.

### 8.5 Bảng so sánh 3 primitive stream

| | `IntStream` | `LongStream` | `DoubleStream` |
|---|-------------|--------------|----------------|
| Kiểu phần tử | `int` | `long` | `double` |
| `sum()` trả | `int` (⚠️ **dễ tràn**) | `long` | `double` |
| `average()` trả | `OptionalDouble` | `OptionalDouble` | `OptionalDouble` |
| `range` / `rangeClosed` | ✅ | ✅ | ❌ **không có** |
| Statistics | `IntSummaryStatistics` | `LongSummaryStatistics` | `DoubleSummaryStatistics` |

```java
// 💣 Tràn số với IntStream.sum()
int tràn = IntStream.rangeClosed(1, 100_000).map(i -> i * 1000).sum();
System.out.println(tràn);   // số ÂM! vì vượt Integer.MAX_VALUE

// ✅ Chuyển sang long trước
long ok = IntStream.rangeClosed(1, 100_000).mapToLong(i -> i * 1000L).sum();
```

> 🔥 **Nhắc lại CLAUDE.md:** với **tiền tệ**, tuyệt đối **không** dùng `double`/`DoubleStream`. Dùng `BigDecimal` + `reduce(BigDecimal.ZERO, BigDecimal::add)` hoặc `Collectors.reducing`.

```java
// ❌ SAI với tiền
double tongTien = donHang.stream()
    .flatMap(d -> d.chiTiet().stream())
    .mapToDouble(ct -> ct.thanhTien().doubleValue())
    .sum();   // ☠️ mất độ chính xác: 0.1 + 0.2 = 0.30000000000000004

// ✅ ĐÚNG
BigDecimal tongTien = donHang.stream()
    .flatMap(d -> d.chiTiet().stream())
    .map(ChiTietDonHang::thanhTien)
    .reduce(BigDecimal.ZERO, BigDecimal::add);
```

---

## Phần 9 — Stateless vs Stateful & Chi Phí Thật Sự

### 9.1 Ba loại toán tử theo trạng thái

| Loại | Định nghĩa | Bộ nhớ | Ví dụ |
|------|-----------|--------|-------|
| **Stateless** (không trạng thái) | Xử lý phần tử **độc lập**, không cần nhớ gì | `O(1)` | `map`, `filter`, `flatMap`, `peek`, `mapToInt` |
| **Stateful — bounded** (trạng thái giới hạn) | Cần nhớ một lượng **cố định** | `O(1)` hoặc `O(n)` nhỏ | `limit`, `skip`, `takeWhile`, `dropWhile` |
| **Stateful — unbounded** (trạng thái không giới hạn) | Phải nhớ **toàn bộ** phần tử đã thấy | `O(n)` | `sorted`, `distinct` |

### 9.2 Vì sao `sorted` và `distinct` đắt đỏ

```text
Pipeline có toán tử stateless — dữ liệu chảy liên tục:

  nguồn ─▶ filter ─▶ map ─▶ collect
   [1]      pass    →2      [2]           ← phần tử 1 đi hết, RỒI mới đến 2
   [2]      pass    →4      [2,4]
   ...
  Bộ nhớ: O(1) cho pipeline  ✅


Pipeline có sorted — RÀO CHẮN (barrier):

  nguồn ─▶ filter ─▶ ┃ sorted ┃ ─▶ map ─▶ collect
   [1]      pass       nuốt
   [2]      pass       nuốt              ← KHÔNG có gì đi qua
   [3]      pass       nuốt
   ...      ...        nuốt
   [n]      pass       nuốt
                       ▼
                  SẮP XẾP TẤT CẢ  ─▶ giờ mới phát ra từng cái
  Bộ nhớ: O(n)  ⚠️ + độ trễ: phải chờ hết nguồn
```

**Hệ quả thực tế:**

```java
// ❌ TREO MÁY — sorted trên stream vô hạn
Stream.iterate(1, n -> n + 1).sorted().limit(10).toList();   // ♾️ không bao giờ xong

// ❌ OOM với dữ liệu lớn — sorted phải giữ hết trong RAM
try (Stream<String> dong = Files.lines(Path.of("file-50GB.txt"))) {
    dong.sorted().limit(10).toList();   // 💥 OutOfMemoryError
}

// ✅ Dùng cấu trúc dữ liệu phù hợp thay vì sorted
try (Stream<String> dong = Files.lines(Path.of("file-50GB.txt"))) {
    PriorityQueue<String> top10 = new PriorityQueue<>(Comparator.reverseOrder());
    dong.forEach(d -> { top10.offer(d); if (top10.size() > 10) top10.poll(); });
}
```

### 9.3 Thứ tự toán tử — quy tắc tối ưu

> 🎓 **Quy tắc sắp xếp pipeline (từ trên xuống):**
> 1. `filter` — **sớm nhất có thể** (giảm số phần tử)
> 2. `map` rẻ (trích trường)
> 3. `distinct` (nếu cần)
> 4. `sorted` (nếu cần) — **sau khi đã giảm dữ liệu tối đa**
> 5. `limit` / `skip`
> 6. `map` đắt (gọi API, tính toán nặng)
> 7. Terminal op

```java
// ❌ TỆ NHẤT — map đắt trước, filter sau, sorted trên toàn bộ
sanPham.stream()
    .map(sp -> apiService.layChiTiet(sp))    // 💸 1 triệu lời gọi API
    .sorted(comparing(ChiTiet::gia))          // 💸 sắp xếp 1 triệu phần tử
    .filter(ct -> ct.conHang())               // giảm còn 100
    .limit(10)
    .toList();

// ✅ TỐT NHẤT
sanPham.stream()
    .filter(SanPham::conHang)                 // giảm còn 100 NGAY
    .sorted(comparing(SanPham::gia))          // sắp xếp 100 phần tử
    .limit(10)                                // còn 10
    .map(sp -> apiService.layChiTiet(sp))     // 💸 chỉ 10 lời gọi API ⭐
    .toList();
// Tiết kiệm: 999.990 lời gọi API
```

### 9.4 Bảng chi phí chi tiết từng toán tử

| Toán tử | Loại | Thời gian | Bộ nhớ | Short-circuit | Ghi chú |
|---------|------|----------|--------|---------------|---------|
| `map` | stateless | `O(n)` | `O(1)` | ❌ | Chi phí = chi phí hàm |
| `filter` | stateless | `O(n)` | `O(1)` | ❌ | Rẻ, đặt sớm |
| `flatMap` | stateless | `O(n·m)` | `O(1)` | ⚠️ một phần | Tạo stream con → có overhead |
| `mapMulti` | stateless | `O(n·m)` | `O(1)` | ❌ | Nhanh hơn `flatMap` |
| `peek` | stateless | `O(n)` | `O(1)` | ❌ | Có thể bị bỏ qua |
| `distinct` | **stateful ∞** | `O(n)` | **`O(n)`** | ❌ | Cần `HashSet` nội bộ |
| `sorted` | **stateful ∞** | **`O(n log n)`** | **`O(n)`** | ❌ | Rào chắn hoàn toàn |
| `limit` | stateful bounded | `O(n)` | `O(1)` | ✅ | Rẻ (tuần tự), đắt (parallel + ordered) |
| `skip` | stateful bounded | `O(n)` | `O(1)` | ❌ | Vẫn phải duyệt qua |
| `takeWhile` | stateful bounded | `O(k)` | `O(1)` | ✅ | Rất hiệu quả |
| `dropWhile` | stateful bounded | `O(n)` | `O(1)` | ❌ | |
| `forEach` | terminal | `O(n)` | `O(1)` | ❌ | |
| `count` | terminal | `O(1)` hoặc `O(n)` | `O(1)` | ⚠️ | `O(1)` nếu nguồn `SIZED` và không đổi số lượng |
| `anyMatch`/`allMatch`/`noneMatch` | terminal | `O(k)` | `O(1)` | ✅ | |
| `findFirst`/`findAny` | terminal | `O(k)` | `O(1)` | ✅ | |
| `reduce` | terminal | `O(n)` | `O(1)` | ❌ | |
| `collect(toList)` | terminal | `O(n)` | `O(n)` | ❌ | |
| `collect(groupingBy)` | terminal | `O(n)` | `O(n)` | ❌ | + chi phí băm |
| `min`/`max` | terminal | `O(n)` | `O(1)` | ❌ | |
| `toArray` | terminal | `O(n)` | `O(n)` | ❌ | |

*(`n` = số phần tử nguồn, `m` = số phần tử con trung bình, `k` = vị trí phần tử thoả đầu tiên)*

---
## Phần 10 — Parallel Streams — Sức Mạnh Và Cạm Bẫy

> ⚠️ **Đọc kỹ phần này trước khi gõ `.parallel()` lần đầu tiên trong đời.** Đây là tính năng bị lạm dụng nhiều nhất của Streams API và là nguồn gốc của vô số sự cố production.

### 10.1 Cú pháp — đơn giản đến nguy hiểm

```java
// 3 cách bật song song
List<T> a = list.parallelStream().filter(...).toList();
List<T> b = list.stream().parallel().filter(...).toList();
List<T> c = IntStream.range(0, n).parallel().boxed().toList();

// Tắt song song
list.parallelStream().sequential().toList();

// Kiểm tra
System.out.println(list.parallelStream().isParallel());   // true
```

**Chính vì quá dễ bật mà nó nguy hiểm** — bạn thêm 10 ký tự và code có thể chạy sai, chậm hơn, hoặc treo mà không có cảnh báo nào từ compiler.

### 10.2 Bên trong: Fork/Join Framework

```text
                    danh sách 8.000.000 phần tử
                              │
                    ┌─────────┴──────────┐
              [0..4M]                [4M..8M]          ← trySplit()
           ┌─────┴─────┐          ┌─────┴─────┐
       [0..2M]     [2M..4M]   [4M..6M]    [6M..8M]     ← trySplit() tiếp
          │            │          │            │
         ...          ...        ...          ...      ← chia tới ngưỡng
          ▼            ▼          ▼            ▼
       xử lý        xử lý      xử lý        xử lý      ← các thread ForkJoinPool
          │            │          │            │
          └─────┬──────┘          └─────┬──────┘
             combiner                combiner          ← GỘP kết quả (join)
                └───────────┬────────────┘
                       kết quả cuối
```

**Ba khái niệm phải nắm:**

1. **`ForkJoinPool.commonPool()`** — pool **DÙNG CHUNG** toàn JVM.
   ```java
   int songSong = ForkJoinPool.commonPool().getParallelism();
   System.out.println(songSong);   // = Runtime.getRuntime().availableProcessors() - 1
   // Máy 8 core → 7 worker thread + thread gọi = 8
   ```

2. **`Spliterator`** — "iterator biết tự chia đôi":
   ```java
   public interface Spliterator<T> {
       boolean tryAdvance(Consumer<? super T> action);   // lấy 1 phần tử
       Spliterator<T> trySplit();                        // ⭐ chia đôi, trả nửa đầu
       long estimateSize();                              // ước lượng kích thước
       int characteristics();                            // SIZED, ORDERED, DISTINCT, SORTED...
   }
   ```

3. **Work stealing** — thread rảnh "ăn cắp" việc từ hàng đợi của thread bận → cân bằng tải tự động.

### 10.3 ☠️ Cạm bẫy #1 — Common pool là TÀI NGUYÊN DÙNG CHUNG

```java
// Thread A trong ứng dụng Spring Boot
List<Report> r1 = duLieuLon.parallelStream().map(this::tinhToanNang).toList();

// Cùng lúc, Thread B (một request HTTP khác)
List<Order> r2 = donHang.parallelStream().filter(...).toList();

// ☠️ Cả hai CHIA NHAU cùng 7 thread. Nếu một task chạy 10 giây,
//    mọi parallel stream khác trong JVM đều bị CHẶN.
```

**Tệ hơn nữa — blocking I/O trong parallel stream:**

```java
// 💣💣💣 THẢM HOẠ — KHÔNG BAO GIỜ LÀM ĐIỀU NÀY
List<Response> kq = urls.parallelStream()
    .map(url -> httpClient.send(url))    // ☠️ blocking I/O, mỗi lời gọi 2 giây
    .toList();
// → 7 thread của common pool bị GIỮ suốt thời gian chờ mạng
// → MỌI parallel stream khác trong JVM ĐỨNG HÌNH
// → Trong Spring Boot: @Async, CompletableFuture cũng bị ảnh hưởng
```

**Giải pháp — dùng pool riêng:**

```java
// ✅ Cách 1 — chạy trong ForkJoinPool riêng
ForkJoinPool poolRieng = new ForkJoinPool(4);
try {
    List<Report> kq = poolRieng.submit(() ->
        duLieu.parallelStream().map(this::tinhToanNang).toList()
    ).get();
} finally {
    poolRieng.shutdown();
}

// ✅ Cách 2 (TỐT HƠN cho I/O) — CompletableFuture với executor riêng
ExecutorService io = Executors.newFixedThreadPool(50);   // I/O cần NHIỀU thread
List<CompletableFuture<Response>> futures = urls.stream()
    .map(url -> CompletableFuture.supplyAsync(() -> httpClient.send(url), io))
    .toList();
List<Response> kq = futures.stream().map(CompletableFuture::join).toList();

// ✅ Cách 3 (Java 21+) — Virtual Threads, giải pháp hiện đại nhất cho I/O
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<Response>> f = urls.stream()
        .map(url -> executor.submit(() -> httpClient.send(url)))
        .toList();
}
```

> 🔥 **Quy tắc bất di bất dịch:** `parallelStream` chỉ dành cho tác vụ **CPU-bound thuần tuý**. **Không bao giờ** cho I/O (HTTP, database, file, lock, `sleep`).

### 10.4 ☠️ Cạm bẫy #2 — Dữ liệu nhỏ thì parallel CHẬM HƠN

```java
// Đo thử với 100 phần tử
List<Integer> nho = IntStream.range(0, 100).boxed().toList();

long t1 = System.nanoTime();
int a = nho.stream().mapToInt(Integer::intValue).sum();
long tuanTu = System.nanoTime() - t1;

long t2 = System.nanoTime();
int b = nho.parallelStream().mapToInt(Integer::intValue).sum();
long songSong = System.nanoTime() - t2;

System.out.printf("Tuần tự: %,d ns | Song song: %,d ns%n", tuanTu, songSong);
// Kết quả điển hình: Tuần tự: 45.000 ns | Song song: 890.000 ns   ← CHẬM HƠN 20 LẦN
```

**Chi phí cố định của parallel (phải trả dù dữ liệu ít hay nhiều):**

| Chi phí | Ước lượng |
|---------|-----------|
| Khởi tạo/đánh thức ForkJoinPool | ~10–100 µs (lần đầu) |
| Chia dữ liệu (`trySplit`) | tỉ lệ với số lần chia |
| Đồng bộ hoá & context switching | ~1–10 µs mỗi task |
| Gộp kết quả (`combiner`) | tỉ lệ với số nhánh |
| Cache thrashing (nhiều core cùng ghi) | khó đo, có thể rất lớn |

**Quy tắc ngón tay cái — công thức NQ:**

> **N × Q ≥ 10.000** thì parallel mới đáng cân nhắc
> - **N** = số phần tử
> - **Q** = chi phí xử lý mỗi phần tử (Q = 1 nếu là phép cộng đơn giản)

| Trường hợp | N | Q | N×Q | Kết luận |
|-----------|---|---|-----|----------|
| Cộng 100 số | 100 | 1 | 100 | ❌ Tuần tự |
| Cộng 1 triệu số | 1.000.000 | 1 | 1.000.000 | ✅ Parallel |
| Parse 1.000 JSON | 1.000 | 500 | 500.000 | ✅ Parallel |
| Gọi 100 API | 100 | 1.000.000 | — | ❌ **I/O — dùng CompletableFuture** |
| Đếm 10.000 chuỗi | 10.000 | 1 | 10.000 | ⚠️ Ranh giới — **phải đo** |

### 10.5 ☠️ Cạm bẫy #3 — Nguồn dữ liệu quyết định khả năng chia

Không phải nguồn nào cũng chia tốt:

| Nguồn | Khả năng chia | Lý do |
|-------|--------------|-------|
| `ArrayList` | ⭐⭐⭐ Xuất sắc | Mảng — chia bằng chỉ số, `O(1)` |
| `int[]` / mảng | ⭐⭐⭐ Xuất sắc | Như trên |
| `IntStream.range()` | ⭐⭐⭐ Xuất sắc | Biết chính xác kích thước |
| `HashMap` / `HashSet` | ⭐⭐ Tốt | Chia theo bucket, hơi lệch |
| `TreeMap` / `TreeSet` | ⭐⭐ Khá | Chia theo cây |
| `LinkedList` | ⭐ **Kém** | Phải duyệt tuần tự để tìm điểm giữa |
| `Stream.iterate()` | ❌ **Rất tệ** | Phần tử n phụ thuộc n-1 → **không chia được** |
| `Files.lines()` | ⭐ Kém | Không biết trước độ dài dòng |
| `Stream.generate()` | ❌ Tệ | Vô hạn, không biết kích thước |

```java
// ❌ Vô nghĩa — iterate không chia được, parallel chỉ thêm overhead
Stream.iterate(1, n -> n + 1).limit(1_000_000).parallel().mapToInt(i -> i).sum();

// ✅ Dùng range — chia hoàn hảo
IntStream.rangeClosed(1, 1_000_000).parallel().sum();
```

### 10.6 ☠️ Cạm bẫy #4 — Race condition với shared mutable state

```java
// 💣 SAI HOÀN TOÀN — ArrayList KHÔNG thread-safe
List<Integer> kq = new ArrayList<>();
IntStream.range(0, 100_000).parallel().forEach(kq::add);
System.out.println(kq.size());
// Kết quả: 87.432 (thiếu!) hoặc ArrayIndexOutOfBoundsException hoặc null ở giữa
```

**Vì sao?** `ArrayList.add` gồm 3 bước không nguyên tử: kiểm tra dung lượng → ghi `elementData[size]` → `size++`. Nhiều thread chạy đồng thời sẽ ghi đè lên nhau.

```java
// ⚠️ "Sửa" bằng synchronized — CHẠY ĐÚNG nhưng CHẬM HƠN tuần tự
List<Integer> kq = Collections.synchronizedList(new ArrayList<>());
IntStream.range(0, 100_000).parallel().forEach(kq::add);
// Mọi thread tranh nhau 1 khoá → song song hoá vô nghĩa

// ✅ ĐÚNG — dùng collect, JDK tự lo gộp an toàn
List<Integer> kq = IntStream.range(0, 100_000).parallel().boxed().toList();
```

> 🎓 **Nguyên tắc vàng #3: Trong parallel stream, KHÔNG BAO GIỜ ghi vào biến bên ngoài.** Hãy để `collect` / `reduce` làm việc gom — chúng được thiết kế để gộp an toàn.

**Bảng "làm gì thay vì":**

| ❌ Đừng làm | ✅ Hãy làm |
|------------|-----------|
| `forEach(list::add)` | `.toList()` / `.collect(toList())` |
| `forEach(map::put)` | `.collect(toMap(...))` |
| `forEach(sb::append)` | `.collect(joining())` |
| `forEach(i -> tong += i)` | `.sum()` / `.reduce(...)` |
| `forEach(i -> if(...) dem++)` | `.filter(...).count()` |

### 10.7 ☠️ Cạm bẫy #5 — `reduce` không kết hợp / identity sai

Đã nói ở [mục 5.6](#5-6--reduce--thu-gọn-về-một-giá-trị), nhắc lại vì nó chỉ **hiện hình khi parallel**:

```java
// Phép trừ KHÔNG có tính kết hợp
Stream.of(1,2,3,4).reduce(0, (a,b) -> a-b);            // -10
Stream.of(1,2,3,4).parallel().reduce(0, (a,b) -> a-b); // 2 hoặc -2 hoặc... ☠️ KHÔNG XÁC ĐỊNH

// Identity sai
Stream.of("a","b","c").reduce("X", String::concat);            // "Xabc"
Stream.of("a","b","c").parallel().reduce("X", String::concat); // "XaXbXc" ☠️
```

### 10.8 ☠️ Cạm bẫy #6 — Thứ tự và các toán tử đắt tiền khi parallel

```java
// limit trên parallel ordered stream: rất đắt
// vì phải xác định phần tử nào là "10 cái đầu tiên" → cần đồng bộ giữa các thread
lonList.parallelStream().filter(...).limit(10).toList();   // chậm

// ✅ Nếu không cần thứ tự
lonList.parallelStream().unordered().filter(...).limit(10).toList();

// findFirst vs findAny khi parallel
lonList.parallelStream().filter(p).findFirst();   // chậm — phải chờ xác định "đầu tiên"
lonList.parallelStream().filter(p).findAny();     // nhanh ⚡ — trả ngay cái tìm thấy

// forEach vs forEachOrdered
lonList.parallelStream().forEach(...);        // nhanh, thứ tự loạn
lonList.parallelStream().forEachOrdered(...); // chậm, giữ thứ tự
```

### 10.9 ✅ Khi nào parallel THẬT SỰ đáng dùng

**Checklist 6 câu hỏi — phải trả lời "CÓ" cho cả 6:**

```text
□ 1. Dữ liệu có ≥ ~10.000 phần tử (hoặc N×Q ≥ 10.000)?
□ 2. Xử lý là CPU-bound (không I/O, không lock, không sleep)?
□ 3. Nguồn chia tốt (ArrayList / mảng / IntStream.range)?
□ 4. Các phép toán độc lập, không có shared mutable state?
□ 5. reduce/collect có tính kết hợp và identity đúng?
□ 6. Đã ĐO ĐẠC bằng benchmark và thấy nhanh hơn thật?
```

**Ví dụ đúng chuẩn — trường hợp parallel toả sáng:**

```java
// Tính số nguyên tố trong khoảng 2..10.000.000 — CPU-bound thuần tuý
public static boolean laNguyenTo(int n) {
    if (n < 2) return false;
    for (int i = 2; (long) i * i <= n; i++) if (n % i == 0) return false;
    return true;
}

long batDau = System.currentTimeMillis();
long dem = IntStream.rangeClosed(2, 10_000_000)
    .parallel()                       // ⭐ ĐÚNG chỗ
    .filter(Main::laNguyenTo)
    .count();
System.out.printf("%,d số nguyên tố trong %,d ms%n", dem, System.currentTimeMillis() - batDau);

// Máy 8 core, kết quả điển hình:
//   Tuần tự : 620.000 số nguyên tố trong 8.400 ms
//   Song song: 620.000 số nguyên tố trong 1.350 ms   ⚡ nhanh gấp ~6,2 lần
```

**Vì sao ví dụ này hoàn hảo?**
- ✅ N = 10 triệu (rất lớn);
- ✅ Q rất cao (mỗi phần tử tốn nhiều phép chia);
- ✅ Nguồn `IntStream.rangeClosed` chia hoàn hảo;
- ✅ `laNguyenTo` là **hàm thuần khiết** — không state, không I/O;
- ✅ `count()` có tính kết hợp;
- ✅ Không cần thứ tự.

### 10.10 Cách đo đúng — đừng đoán

```java
/**
 * Benchmark "cây nhà lá vườn" — đủ dùng để so sánh sơ bộ.
 * Nghiêm túc thì dùng JMH (org.openjdk.jmh).
 */
public class DoDac {

    static long doThoiGian(String ten, Runnable r, int soLan) {
        // Làm nóng JIT — CỰC KỲ QUAN TRỌNG, bỏ qua bước này số liệu vô nghĩa
        for (int i = 0; i < 10_000; i++) r.run();

        long batDau = System.nanoTime();
        for (int i = 0; i < soLan; i++) r.run();
        long tong = System.nanoTime() - batDau;

        System.out.printf("%-20s: %,10d ns/lần%n", ten, tong / soLan);
        return tong / soLan;
    }

    public static void main(String[] args) {
        List<Integer> ds = IntStream.range(0, 1_000_000).boxed().toList();

        doThoiGian("vòng for",  () -> { long s = 0; for (int x : ds) s += x; }, 100);
        doThoiGian("stream",    () -> ds.stream().mapToLong(Integer::longValue).sum(), 100);
        doThoiGian("parallel",  () -> ds.parallelStream().mapToLong(Integer::longValue).sum(), 100);
    }
}
```

> ⚠️ **Ba sai lầm khi tự benchmark:** (1) quên warm-up JIT; (2) JIT loại bỏ code "vô dụng" (dead code elimination) — phải dùng kết quả; (3) đo một lần rồi kết luận. **Dùng JMH** nếu cần con số đáng tin.

```xml
<!-- Thêm JMH vào pom.xml khi cần đo nghiêm túc -->
<dependency>
    <groupId>org.openjdk.jmh</groupId>
    <artifactId>jmh-core</artifactId>
    <version>1.37</version>
    <scope>test</scope>
</dependency>
```

### 10.11 Bảng tổng kết Parallel

| Tình huống | Dùng gì |
|-----------|---------|
| Dữ liệu lớn + CPU-bound | ✅ `parallelStream()` |
| Dữ liệu nhỏ (< 1.000) | ❌ `stream()` |
| Gọi HTTP / DB / file | ❌ `CompletableFuture` + executor riêng, hoặc Virtual Threads |
| Trong Spring Boot controller (request ngắn) | ❌ `stream()` — đừng chiếm common pool |
| Batch job xử lý hàng triệu bản ghi | ✅ `parallelStream()` (cân nhắc pool riêng) |
| Cần thứ tự nghiêm ngặt | ⚠️ Cân nhắc — mất phần lớn lợi ích |
| Có shared mutable state | ❌ Sửa thiết kế trước |

---

## Phần 11 — Infinite Streams & Spliterator Tuỳ Chỉnh

### 11.1 Stream vô hạn — ba cách tạo

```java
// ① iterate 2 tham số — vô hạn, BẮT BUỘC có limit/takeWhile
Stream.iterate(1, n -> n * 2).limit(10).forEach(System.out::println);

// ② iterate 3 tham số (Java 9+) — TỰ dừng ⭐ an toàn hơn
Stream.iterate(1, n -> n < 1000, n -> n * 2).forEach(System.out::println);

// ③ generate — vô hạn, phần tử độc lập
Stream.generate(UUID::randomUUID).limit(5).forEach(System.out::println);
```

**Ứng dụng thực tế:**

```java
// Sinh mã đơn hàng
List<String> ma = Stream.generate(() -> "DH-" + UUID.randomUUID().toString().substring(0, 8))
    .limit(10).toList();

// Lịch trình ngày làm việc (bỏ cuối tuần)
List<LocalDate> ngayLamViec = Stream.iterate(LocalDate.now(), d -> d.plusDays(1))
    .filter(d -> d.getDayOfWeek().getValue() <= 5)
    .limit(20)
    .toList();

// Dãy Collatz
Stream.iterate(27L, n -> n != 1, n -> n % 2 == 0 ? n / 2 : 3 * n + 1)
    .forEach(n -> System.out.print(n + " "));

// Số Fibonacci đầu tiên vượt 1 triệu
long fib = Stream.iterate(new long[]{0, 1}, f -> new long[]{f[1], f[0] + f[1]})
    .map(f -> f[0])
    .filter(n -> n > 1_000_000)
    .findFirst().orElseThrow();
```

### 11.2 ⚠️ Bốn quy tắc sống còn với stream vô hạn

```java
// ❌ 1. Quên toán tử giới hạn → treo vĩnh viễn
Stream.iterate(1, n -> n + 1).forEach(System.out::println);   // ♾️

// ❌ 2. sorted() trên stream vô hạn → treo (phải thấy hết mới sắp được)
Stream.iterate(1, n -> n + 1).sorted().limit(10).toList();    // ♾️

// ❌ 3. distinct() trên vô hạn KHÔNG có limit → OOM
Stream.generate(() -> new Random().nextInt(10)).distinct().toList();   // 💥

// ❌ 4. count() trên vô hạn → treo
Stream.iterate(1, n -> n + 1).count();                        // ♾️

// ✅ Toán tử AN TOÀN với stream vô hạn: limit, takeWhile, findFirst, findAny,
//    anyMatch, noneMatch (nếu có phần tử thoả), filter, map, peek
```

| Toán tử | An toàn với vô hạn? | Lý do |
|---------|---------------------|-------|
| `filter`, `map`, `peek`, `flatMap` | ✅ | Lazy, xử lý từng phần tử |
| `limit(n)` | ✅ | Cắt ngắn |
| `takeWhile(p)` | ✅ | Dừng khi p sai |
| `findFirst`, `findAny` | ✅ | Short-circuit |
| `anyMatch` | ✅ (nếu có phần tử thoả) | Short-circuit |
| `allMatch`, `noneMatch` | ⚠️ (chỉ khi tìm được phản ví dụ) | |
| `sorted`, `distinct` | ❌ | Stateful unbounded |
| `count`, `collect`, `reduce`, `forEach`, `max`, `min` | ❌ | Cần duyệt hết |

### 11.3 `Spliterator` — nguồn stream tuỳ chỉnh

`Spliterator` = **Spl**ittable **Iterator**. Đây là "trái tim" của mọi stream.

```java
public interface Spliterator<T> {
    boolean tryAdvance(Consumer<? super T> action);   // xử lý 1 phần tử, trả false nếu hết
    default void forEachRemaining(Consumer<? super T> action) { while (tryAdvance(action)); }
    Spliterator<T> trySplit();          // chia đôi — trả nửa đầu, giữ nửa sau; null nếu không chia được
    long estimateSize();                // ước lượng số phần tử còn lại
    int characteristics();              // cờ đặc tính
}
```

**Tám cờ `characteristics`:**

| Cờ | Nghĩa | Ai dùng |
|----|-------|---------|
| `ORDERED` | Có thứ tự xác định | `limit`, `findFirst`, `forEachOrdered` |
| `DISTINCT` | Mọi phần tử khác nhau | `distinct()` có thể bỏ qua |
| `SORTED` | Đã sắp xếp sẵn | `sorted()` có thể bỏ qua |
| `SIZED` | Biết chính xác kích thước | `count()` tối ưu `O(1)`, chia đều |
| `NONNULL` | Không có phần tử null | |
| `IMMUTABLE` | Nguồn không đổi | Không cần kiểm tra `ConcurrentModification` |
| `CONCURRENT` | Nguồn hỗ trợ sửa đồng thời | |
| `SUBSIZED` | Mọi nhánh con cũng `SIZED` | Chia song song hiệu quả |

```java
// Xem cờ của các nguồn khác nhau
Spliterator<Integer> sp = List.of(1,2,3).spliterator();
System.out.println(sp.hasCharacteristics(Spliterator.ORDERED));   // true
System.out.println(sp.hasCharacteristics(Spliterator.SIZED));     // true
System.out.println(sp.estimateSize());                            // 3
```

### 11.4 Ví dụ — viết `Spliterator` riêng

**Bài toán:** đọc dữ liệu theo **lô (batch)** — chuyển `Stream<T>` thành `Stream<List<T>>` mỗi lô n phần tử. JDK **không có sẵn** chức năng này (rất hay cần khi gọi API theo lô hoặc `saveAll` theo lô trong Spring Data).

```java
import java.util.*;
import java.util.function.Consumer;
import java.util.stream.*;

/** Chia stream thành các lô kích thước cố định */
public class BatchSpliterator<T> implements Spliterator<List<T>> {

    private final Spliterator<T> nguon;
    private final int kichThuocLo;

    private BatchSpliterator(Spliterator<T> nguon, int kichThuocLo) {
        this.nguon = nguon;
        this.kichThuocLo = kichThuocLo;
    }

    /** API công khai — dùng như một toán tử */
    public static <T> Stream<List<T>> chiaLo(Stream<T> stream, int kichThuocLo) {
        if (kichThuocLo <= 0) throw new IllegalArgumentException("Kích thước lô phải > 0");
        return StreamSupport.stream(
            new BatchSpliterator<>(stream.spliterator(), kichThuocLo),
            false);   // false = tuần tự
    }

    @Override
    public boolean tryAdvance(Consumer<? super List<T>> action) {
        List<T> lo = new ArrayList<>(kichThuocLo);
        // Gom đủ kichThuocLo phần tử (hoặc tới khi hết nguồn)
        while (lo.size() < kichThuocLo && nguon.tryAdvance(lo::add)) {
            // thân rỗng — công việc nằm ở điều kiện
        }
        if (lo.isEmpty()) return false;   // hết dữ liệu
        action.accept(lo);
        return true;
    }

    @Override
    public Spliterator<List<T>> trySplit() {
        return null;   // ⚠️ Không hỗ trợ chia — stream này chỉ chạy tuần tự
    }

    @Override
    public long estimateSize() {
        long n = nguon.estimateSize();
        return n == Long.MAX_VALUE ? Long.MAX_VALUE
             : (n + kichThuocLo - 1) / kichThuocLo;   // làm tròn lên
    }

    @Override
    public int characteristics() {
        return nguon.characteristics() & (ORDERED | NONNULL);   // giữ lại cờ phù hợp
    }
}
```

```java
// Dùng:
List<Integer> so = IntStream.rangeClosed(1, 10).boxed().toList();
BatchSpliterator.chiaLo(so.stream(), 3).forEach(System.out::println);
// [1, 2, 3]
// [4, 5, 6]
// [7, 8, 9]
// [10]

// ⭐ Ứng dụng Spring Boot — lưu DB theo lô 500 để tránh giữ transaction quá lâu
BatchSpliterator.chiaLo(hangTrieuBanGhi.stream(), 500)
    .forEach(repository::saveAll);

// ⭐ Gọi API bên ngoài theo lô (nhiều API giới hạn 100 id/lần)
BatchSpliterator.chiaLo(danhSachId.stream(), 100)
    .map(apiClient::layTheoLo)
    .flatMap(List::stream)
    .toList();
```

### 11.5 `Spliterator` có khả năng chia — bản nâng cao

```java
/** Spliterator sinh dãy số, CÓ hỗ trợ chia đôi để chạy song song */
public class RangeSpliterator implements Spliterator.OfInt {

    private int hienTai;
    private final int ket;          // cận phải (mở)
    private static final int NGUONG = 1024;   // dưới ngưỡng này thì không chia nữa

    public RangeSpliterator(int bat, int ket) { this.hienTai = bat; this.ket = ket; }

    @Override
    public boolean tryAdvance(java.util.function.IntConsumer action) {
        if (hienTai >= ket) return false;
        action.accept(hienTai++);
        return true;
    }

    @Override
    public Spliterator.OfInt trySplit() {
        int conLai = ket - hienTai;
        if (conLai < NGUONG) return null;         // quá nhỏ → không đáng chia
        int giua = hienTai + conLai / 2;
        var nuaDau = new RangeSpliterator(hienTai, giua);   // trả NỬA ĐẦU
        this.hienTai = giua;                                // giữ NỬA SAU
        return nuaDau;
    }

    @Override public long estimateSize() { return ket - hienTai; }

    @Override public int characteristics() {
        return ORDERED | SIZED | SUBSIZED | IMMUTABLE | NONNULL | DISTINCT;
    }
}

// Dùng:
IntStream s = StreamSupport.intStream(new RangeSpliterator(0, 1_000_000), true); // true = parallel
System.out.println(s.sum());
```

> 💡 **Khi nào cần viết `Spliterator`?** Rất hiếm — khi bạn có **nguồn dữ liệu tuỳ chỉnh** (kết quả phân trang từ API, con trỏ database, giao thức mạng) và muốn biến nó thành stream. 99% trường hợp cứ dùng `StreamSupport.stream(iterable.spliterator(), false)`.

### 11.6 Chuyển `Iterator` bất kỳ thành Stream

```java
// Cách nhanh nhất khi có Iterable
Iterable<String> it = () -> someIterator;
Stream<String> s = StreamSupport.stream(it.spliterator(), false);

// Từ Iterator (Java 8 style)
Iterator<String> iter = ...;
Stream<String> s2 = StreamSupport.stream(
    Spliterators.spliteratorUnknownSize(iter, Spliterator.ORDERED), false);

// Từ Enumeration (API cũ như JDBC, Servlet)
Enumeration<String> en = request.getParameterNames();
Stream<String> s3 = Collections.list(en).stream();
```

---
## Phần 12 — Bảng Phân Loại Toàn Bộ Operations

Đây là bảng tra cứu đầy đủ. Bạn **không cần học thuộc** — chỉ cần biết nó ở đâu để tra.

### 12.1 Toán tử TRUNG GIAN (Intermediate) — trả về `Stream`

| # | Toán tử | Chữ ký rút gọn | Trạng thái | Short-circuit | Java | Mô tả |
|---|---------|----------------|-----------|---------------|------|-------|
| 1 | `filter` | `(Predicate) → Stream<T>` | stateless | ❌ | 8 | Giữ phần tử thoả |
| 2 | `map` | `(Function) → Stream<R>` | stateless | ❌ | 8 | Biến đổi 1-1 |
| 3 | `mapToInt` | `(ToIntFunction) → IntStream` | stateless | ❌ | 8 | → int |
| 4 | `mapToLong` | `(ToLongFunction) → LongStream` | stateless | ❌ | 8 | → long |
| 5 | `mapToDouble` | `(ToDoubleFunction) → DoubleStream` | stateless | ❌ | 8 | → double |
| 6 | `mapToObj` | `(IntFunction) → Stream<R>` | stateless | ❌ | 8 | primitive → object |
| 7 | `flatMap` | `(Function→Stream) → Stream<R>` | stateless | ⚠️ | 8 | San phẳng 1-n |
| 8 | `flatMapToInt` | `→ IntStream` | stateless | ⚠️ | 8 | |
| 9 | `flatMapToLong` | `→ LongStream` | stateless | ⚠️ | 8 | |
| 10 | `flatMapToDouble` | `→ DoubleStream` | stateless | ⚠️ | 8 | |
| 11 | `mapMulti` | `(BiConsumer) → Stream<R>` | stateless | ❌ | 16 | flatMap hiệu năng cao |
| 12 | `mapMultiToInt` | `→ IntStream` | stateless | ❌ | 16 | |
| 13 | `mapMultiToLong` | `→ LongStream` | stateless | ❌ | 16 | |
| 14 | `mapMultiToDouble` | `→ DoubleStream` | stateless | ❌ | 16 | |
| 15 | `distinct` | `() → Stream<T>` | **stateful ∞** | ❌ | 8 | Khử trùng (equals/hashCode) |
| 16 | `sorted` | `() → Stream<T>` | **stateful ∞** | ❌ | 8 | Sắp thứ tự tự nhiên |
| 17 | `sorted` | `(Comparator) → Stream<T>` | **stateful ∞** | ❌ | 8 | Sắp theo comparator |
| 18 | `peek` | `(Consumer) → Stream<T>` | stateless | ❌ | 8 | Quan sát (debug) |
| 19 | `limit` | `(long) → Stream<T>` | stateful | ✅ | 8 | Lấy n đầu |
| 20 | `skip` | `(long) → Stream<T>` | stateful | ❌ | 8 | Bỏ n đầu |
| 21 | `takeWhile` | `(Predicate) → Stream<T>` | stateful | ✅ | 9 | Lấy tiền tố thoả |
| 22 | `dropWhile` | `(Predicate) → Stream<T>` | stateful | ❌ | 9 | Bỏ tiền tố thoả |
| 23 | `boxed` | `() → Stream<Integer>` | stateless | ❌ | 8 | primitive → wrapper |
| 24 | `asLongStream` | `() → LongStream` | stateless | ❌ | 8 | int → long |
| 25 | `asDoubleStream` | `() → DoubleStream` | stateless | ❌ | 8 | int/long → double |
| 26 | `sequential` | `() → Stream<T>` | — | — | 8 | Chuyển tuần tự |
| 27 | `parallel` | `() → Stream<T>` | — | — | 8 | Chuyển song song |
| 28 | `unordered` | `() → Stream<T>` | — | — | 8 | Bỏ ràng buộc thứ tự |
| 29 | `onClose` | `(Runnable) → Stream<T>` | — | — | 8 | Đăng ký hành động đóng |

### 12.2 Toán tử KẾT THÚC (Terminal) — KHÔNG trả về `Stream`

| # | Toán tử | Trả về | Short-circuit | Java | Mô tả |
|---|---------|--------|---------------|------|-------|
| 30 | `forEach` | `void` | ❌ | 8 | Duyệt, thứ tự không đảm bảo khi parallel |
| 31 | `forEachOrdered` | `void` | ❌ | 8 | Duyệt giữ thứ tự |
| 32 | `toArray` | `Object[]` | ❌ | 8 | |
| 33 | `toArray` | `A[]` | ❌ | 8 | Có generator |
| 34 | `reduce` | `Optional<T>` | ❌ | 8 | Không identity |
| 35 | `reduce` | `T` | ❌ | 8 | Có identity |
| 36 | `reduce` | `U` | ❌ | 8 | Có combiner |
| 37 | `collect` | `R` | ❌ | 8 | Với Collector |
| 38 | `collect` | `R` | ❌ | 8 | Với 3 hàm |
| 39 | `toList` | `List<T>` | ❌ | **16** | ⭐ Bất biến |
| 40 | `min` | `Optional<T>` | ❌ | 8 | |
| 41 | `max` | `Optional<T>` | ❌ | 8 | |
| 42 | `count` | `long` | ⚠️ | 8 | Có thể `O(1)` |
| 43 | `anyMatch` | `boolean` | ✅ | 8 | |
| 44 | `allMatch` | `boolean` | ✅ | 8 | Rỗng → `true` |
| 45 | `noneMatch` | `boolean` | ✅ | 8 | Rỗng → `true` |
| 46 | `findFirst` | `Optional<T>` | ✅ | 8 | |
| 47 | `findAny` | `Optional<T>` | ✅ | 8 | Nhanh hơn khi parallel |
| 48 | `iterator` | `Iterator<T>` | — | 8 | Thoát khỏi stream |
| 49 | `spliterator` | `Spliterator<T>` | — | 8 | |
| 50 | `sum` * | `int/long/double` | ❌ | 8 | Chỉ primitive stream |
| 51 | `average` * | `OptionalDouble` | ❌ | 8 | Chỉ primitive stream |
| 52 | `summaryStatistics` * | `XxxSummaryStatistics` | ❌ | 8 | Chỉ primitive stream |
| 53 | `close` | `void` | — | 8 | Từ `AutoCloseable` |

*\* chỉ có trên `IntStream` / `LongStream` / `DoubleStream`*

### 12.3 Factory tạo Stream (static)

| # | Method | Lớp | Java |
|---|--------|-----|------|
| 54 | `Stream.of(T...)` | `Stream` | 8 |
| 55 | `Stream.empty()` | `Stream` | 8 |
| 56 | `Stream.ofNullable(T)` | `Stream` | 9 |
| 57 | `Stream.iterate(seed, f)` | `Stream` | 8 |
| 58 | `Stream.iterate(seed, p, f)` | `Stream` | 9 |
| 59 | `Stream.generate(Supplier)` | `Stream` | 8 |
| 60 | `Stream.concat(a, b)` | `Stream` | 8 |
| 61 | `Stream.builder()` | `Stream` | 8 |
| 62 | `IntStream.range(a, b)` | `IntStream` | 8 |
| 63 | `IntStream.rangeClosed(a, b)` | `IntStream` | 8 |
| 64 | `Arrays.stream(arr)` | `Arrays` | 8 |
| 65 | `Collection.stream()` | `Collection` | 8 |
| 66 | `Collection.parallelStream()` | `Collection` | 8 |
| 67 | `Files.lines(path)` | `Files` | 8 |
| 68 | `Files.walk(path)` | `Files` | 8 |
| 69 | `Files.list(path)` | `Files` | 8 |
| 70 | `Files.find(...)` | `Files` | 8 |
| 71 | `String.chars()` | `String` | 8 |
| 72 | `String.lines()` | `String` | 11 |
| 73 | `Optional.stream()` | `Optional` | 9 |
| 74 | `Pattern.splitAsStream(s)` | `Pattern` | 8 |
| 75 | `Matcher.results()` | `Matcher` | 9 |
| 76 | `Random.ints/longs/doubles` | `Random` | 8 |
| 77 | `BufferedReader.lines()` | `BufferedReader` | 8 |
| 78 | `StreamSupport.stream(sp, par)` | `StreamSupport` | 8 |

### 12.4 Bản đồ trực quan

```text
╔════════════════════════════════════════════════════════════════════╗
║                      TRẢ VỀ Stream? → TRUNG GIAN (LƯỜI)            ║
╠════════════════════════════════════════════════════════════════════╣
║  STATELESS (nhớ 0 thứ)        │  STATEFUL (phải nhớ)               ║
║  ─────────────────────────    │  ─────────────────────────────     ║
║  map, mapToXxx, mapToObj      │  ⚠️ BOUNDED (nhớ ít):              ║
║  filter                       │     limit ✅sc, skip               ║
║  flatMap, flatMapToXxx        │     takeWhile ✅sc, dropWhile      ║
║  mapMulti                     │                                     ║
║  peek                         │  🔴 UNBOUNDED (nhớ TẤT CẢ):        ║
║  boxed, asLongStream          │     sorted  → O(n) RAM, O(n log n) ║
║                               │     distinct → O(n) RAM            ║
╠════════════════════════════════════════════════════════════════════╣
║                  KHÔNG trả Stream? → KẾT THÚC (CHĂM)               ║
╠════════════════════════════════════════════════════════════════════╣
║  CÓ short-circuit ⚡          │  DUYỆT HẾT                          ║
║  ─────────────────────        │  ─────────────────────             ║
║  findFirst  → Optional        │  forEach       → void              ║
║  findAny    → Optional        │  collect       → R                 ║
║  anyMatch   → boolean         │  toList        → List              ║
║  allMatch   → boolean         │  reduce        → T/Optional        ║
║  noneMatch  → boolean         │  count         → long (⚠️ có thể O(1))║
║                               │  min/max       → Optional          ║
║                               │  sum/average   → số (primitive)    ║
║                               │  toArray       → mảng              ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## Phần 13 — Cây Quyết Định — Dùng Toán Tử Nào?

### 13.1 Cây quyết định chính

```text
BẠN CẦN LÀM GÌ VỚI COLLECTION?
│
├─ 🔄 BIẾN ĐỔI dữ liệu
│   ├─ Mỗi phần tử → một phần tử khác (1-1)? ─────────▶ map()
│   │     └─ Kết quả là số nguyên thuỷ? ─────────────▶ mapToInt/Long/Double()
│   ├─ Mỗi phần tử → NHIỀU phần tử (1-n)? ───────────▶ flatMap()
│   │     └─ Số phần tử con rất ít, cần tốc độ? ─────▶ mapMulti()  (Java 16+)
│   └─ Có cấu trúc lồng List<List<T>>? ──────────────▶ flatMap()
│
├─ 🔍 CHỌN LỌC dữ liệu
│   ├─ Giữ theo điều kiện (mọi vị trí)? ─────────────▶ filter()
│   ├─ Giữ tiền tố liên tục thoả điều kiện? ─────────▶ takeWhile()  (Java 9+)
│   ├─ Bỏ tiền tố liên tục thoả điều kiện? ──────────▶ dropWhile()  (Java 9+)
│   ├─ Bỏ trùng lặp? ────────────────────────────────▶ distinct()
│   │     └─ Trùng theo MỘT TRƯỜNG? ────────────────▶ collect(toMap(k, v, (a,b)->a))
│   ├─ Lấy n phần tử đầu? ───────────────────────────▶ limit(n)
│   ├─ Bỏ n phần tử đầu? ────────────────────────────▶ skip(n)
│   └─ Phân trang? ──────────────────────────────────▶ skip(p*s).limit(s)
│                                                        ⚠️ Với DB → dùng Pageable!
│
├─ 📊 SẮP XẾP
│   ├─ Thứ tự tự nhiên? ─────────────────────────────▶ sorted()
│   ├─ Theo 1 trường? ───────────────────────────────▶ sorted(comparing(X::f))
│   ├─ Nhiều tiêu chí? ──────────────────────────────▶ sorted(comparing(..).thenComparing(..))
│   └─ Chỉ cần top-k với k nhỏ, n rất lớn? ──────────▶ PriorityQueue thủ công
│
├─ 🎯 TÌM MỘT PHẦN TỬ
│   ├─ Đầu tiên thoả? ───────────────────────────────▶ filter().findFirst()
│   ├─ Bất kỳ (nhanh khi parallel)? ─────────────────▶ filter().findAny()
│   ├─ Lớn nhất / nhỏ nhất? ─────────────────────────▶ max(cmp) / min(cmp)
│   └─ (Luôn trả Optional → dùng orElse/orElseThrow)
│
├─ ✅ KIỂM TRA ĐIỀU KIỆN → boolean
│   ├─ Có ít nhất 1 thoả? ───────────────────────────▶ anyMatch(p)
│   ├─ Tất cả đều thoả? ─────────────────────────────▶ allMatch(p)  ⚠️ rỗng → true
│   └─ Không cái nào thoả? ──────────────────────────▶ noneMatch(p) ⚠️ rỗng → true
│
├─ 🔢 THU VỀ MỘT GIÁ TRỊ
│   ├─ Đếm? ─────────────────────────────────────────▶ count()
│   ├─ Tổng số nguyên thuỷ? ─────────────────────────▶ mapToInt(..).sum()
│   ├─ Tổng BigDecimal (tiền)? ──────────────────────▶ reduce(ZERO, BigDecimal::add)
│   ├─ Trung bình? ──────────────────────────────────▶ mapToDouble(..).average()
│   ├─ Nhiều thống kê 1 lần? ────────────────────────▶ summaryStatistics()
│   ├─ Nối chuỗi? ───────────────────────────────────▶ collect(joining(", "))
│   └─ Phép gộp tuỳ ý? ──────────────────────────────▶ reduce(identity, op)
│                                                        ⚠️ op phải KẾT HỢP
│
├─ 📦 GOM VÀO COLLECTION
│   ├─ List bất biến? ───────────────────────────────▶ toList()          (Java 16+)
│   ├─ List sửa được? ───────────────────────────────▶ collect(toList())
│   ├─ Set? ─────────────────────────────────────────▶ collect(toSet())
│   ├─ Set giữ thứ tự? ──────────────────────────────▶ collect(toCollection(LinkedHashSet::new))
│   ├─ Set tự sắp xếp? ──────────────────────────────▶ collect(toCollection(TreeSet::new))
│   ├─ Map? ─────────────────────────────────────────▶ collect(toMap(k, v, merge))
│   │                                                    ⚠️ LUÔN truyền merge!
│   └─ Mảng? ────────────────────────────────────────▶ toArray(T[]::new)
│
├─ 🗂️ NHÓM / CHIA
│   ├─ Điều kiện NHỊ PHÂN (true/false)? ─────────────▶ collect(partitioningBy(p))
│   ├─ Nhóm theo khoá? ──────────────────────────────▶ collect(groupingBy(f))
│   │   ├─ + đếm mỗi nhóm ───────────────────────────▶ groupingBy(f, counting())
│   │   ├─ + tổng mỗi nhóm ──────────────────────────▶ groupingBy(f, summingInt(g))
│   │   ├─ + chỉ lấy 1 trường ───────────────────────▶ groupingBy(f, mapping(g, toList()))
│   │   ├─ + lọc trong nhóm ─────────────────────────▶ groupingBy(f, filtering(p, toList()))
│   │   ├─ + làm phẳng trong nhóm ───────────────────▶ groupingBy(f, flatMapping(g, toSet()))
│   │   └─ + nhóm 2 tầng ────────────────────────────▶ groupingBy(f, groupingBy(g))
│   └─ Nhóm theo NHIỀU trường? ──────────────────────▶ groupingBy(x -> new Khoa(a, b))
│
├─ 🎭 CẦN 2 KẾT QUẢ TỪ 1 STREAM? ─────────────────────▶ collect(teeing(c1, c2, merger))
│
├─ 🔧 HẬU XỬ LÝ KẾT QUẢ GOM? ─────────────────────────▶ collect(collectingAndThen(c, f))
│
├─ 💥 SIDE EFFECT (in, gửi mail, ghi DB)? ────────────▶ forEach(action)
│      ⚠️ Cân nhắc: có thể dùng collect thay không?
│
└─ 🐞 DEBUG pipeline? ────────────────────────────────▶ peek(System.out::println)
       ⚠️ CHỈ debug, không dùng cho logic!
```

### 13.2 Cây quyết định: Stream hay không Stream?

```text
CÓ NÊN DÙNG STREAM Ở ĐÂY KHÔNG?
│
├─ Dữ liệu đến từ DATABASE?
│   ├─ Có thể lọc/sắp/nhóm ở tầng SQL? ──▶ ❌ ĐỪNG dùng Stream
│   │                                        ✅ Dùng @Query / Specification / Pageable
│   └─ Dữ liệu đã lấy về, cần map sang DTO? ▶ ✅ Dùng Stream
│
├─ Cần chỉ số (index) trong vòng lặp? ─────▶ ⚠️ Vòng for rõ hơn
│                                              (hoặc IntStream.range nếu cần nối pipeline)
│
├─ Cần break/continue phức tạp? ───────────▶ ❌ Vòng for
│                                              (Stream chỉ có takeWhile/filter)
│
├─ Cần sửa phần tử tại chỗ (in-place)? ────▶ ❌ Vòng for hoặc list.replaceAll()
│
├─ Cần try/catch cho từng phần tử? ────────▶ ⚠️ Vòng for rõ hơn
│                                              (lambda không throw checked exception)
│
├─ Chỉ 2-3 phần tử, logic đơn giản? ───────▶ ⚠️ Vòng for cũng được, đừng cầu kỳ
│
├─ Chuỗi biến đổi lọc/map/nhóm? ───────────▶ ✅✅ STREAM — đây là sân nhà
│
└─ Dữ liệu lồng nhau nhiều tầng? ──────────▶ ✅✅ STREAM + flatMap
```

---

## Phần 14 — Bảng So Sánh Hiệu Năng

> ⚠️ **Cảnh báo:** mọi con số dưới đây là **tham khảo** (JDK 21, máy 8 core, JMH). Hiệu năng phụ thuộc JDK version, phần cứng, dữ liệu. **Luôn tự đo trên môi trường của bạn.**

### 14.1 Stream vs Loop truyền thống

**Kịch bản: tính tổng `List<Integer>`**

| Kích thước | `for` loop | `stream()` | `parallelStream()` | Kết luận |
|-----------|-----------|-----------|-------------------|----------|
| 10 | 8 ns | 45 ns | 12.000 ns | ✅ for |
| 100 | 60 ns | 180 ns | 15.000 ns | ✅ for |
| 1.000 | 600 ns | 1.100 ns | 22.000 ns | ✅ for (nhưng sát) |
| 10.000 | 6 µs | 8 µs | 35 µs | ⚖️ ngang, chọn theo độ đọc |
| 100.000 | 62 µs | 70 µs | 45 µs | ✅ parallel bắt đầu thắng |
| 1.000.000 | 640 µs | 700 µs | 190 µs | ✅✅ parallel |
| 10.000.000 | 7,2 ms | 7,8 ms | 1,6 ms | ✅✅ parallel |

**Diễn giải:**
- Stream tuần tự chậm hơn `for` khoảng **10–15%** ở dữ liệu lớn — chi phí gọi hàm ảo (megamorphic call site);
- Với dữ liệu **nhỏ**, chi phí **khởi tạo pipeline** (~40–100 ns) chiếm ưu thế;
- Parallel chỉ có lãi từ khoảng **50.000–100.000 phần tử** với phép toán rẻ.

### 14.2 `IntStream` vs `Stream<Integer>` — cái giá của boxing

**Kịch bản: tổng 1 triệu số**

| Cách | Thời gian | Object cấp phát | Ghi chú |
|------|----------|-----------------|---------|
| `int[]` + `for` | 620 µs | 0 | Chuẩn vàng |
| `IntStream.range().sum()` | 680 µs | 0 | ⭐ Gần bằng for |
| `List<Integer>.stream().mapToInt().sum()` | 3.100 µs | 0 (đã có sẵn) | Unboxing |
| `List<Integer>.stream().reduce(0, Integer::sum)` | 8.900 µs | ~1M `Integer` | 💸 Boxing mỗi bước |

👉 **Chênh lệch tới 14 lần** chỉ vì boxing. Bài học: khi làm việc với số, **luôn chuyển sang primitive stream** càng sớm càng tốt.

### 14.3 Chi phí toán tử stateful

**Kịch bản: 1 triệu phần tử**

| Pipeline | Thời gian | Bộ nhớ đỉnh |
|----------|----------|-------------|
| `.filter().count()` | 4 ms | ~0 |
| `.map().filter().count()` | 5 ms | ~0 |
| `.distinct().count()` | 48 ms | +24 MB (HashSet) |
| `.sorted().count()` | 210 ms | +8 MB (mảng buffer) |
| `.sorted(cmp).count()` | 380 ms | +8 MB |
| `.distinct().sorted().count()` | 250 ms | +32 MB |

👉 `sorted` đắt gấp **~50 lần** `filter`. Đây là lý do quy tắc "lọc trước, sắp sau" quan trọng đến vậy.

### 14.4 Lợi ích của lazy evaluation

**Kịch bản: 10 triệu phần tử, tìm 5 phần tử thoả điều kiện (xuất hiện sớm)**

| Cách viết | Phần tử được xử lý | Thời gian |
|-----------|-------------------|----------|
| Imperative: lọc hết rồi cắt 5 | 10.000.000 | 95 ms |
| `filter().limit(5)` | ~40 | **0,004 ms** |
| `filter().findFirst()` | ~8 | **0,001 ms** |

👉 **Tăng tốc ~23.000 lần.** Đây không phải "tối ưu vi mô" — đây là khác biệt về **độ phức tạp thuật toán** (`O(n)` → `O(k)`).

### 14.5 `collect(toList())` vs `reduce` gom list

| Cách | 10.000 phần tử | Độ phức tạp |
|------|---------------|-------------|
| `collect(toList())` | 0,12 ms | `O(n)` |
| `toList()` (Java 16+) | 0,11 ms | `O(n)` |
| `reduce` tạo list mới mỗi bước | 4.800 ms | `O(n²)` 💀 |

### 14.6 `joining` vs `reduce` nối chuỗi

| Cách | 10.000 chuỗi | Độ phức tạp |
|------|-------------|-------------|
| `collect(joining())` | 0,4 ms | `O(n)` |
| `reduce("", String::concat)` | 1.900 ms | `O(n²)` 💀 |

### 14.7 Bảng "cheat sheet" hiệu năng

| Quyết định | Nhanh hơn | Nhanh hơn bao nhiêu |
|-----------|----------|---------------------|
| `filter` trước `map` (thay vì ngược lại) | filter trước | tỉ lệ với tỉ lệ lọc |
| `filter` trước `sorted` | filter trước | có thể **hàng trăm lần** |
| `IntStream` thay `Stream<Integer>` | IntStream | 3–14 lần |
| `collect(joining())` thay `reduce` chuỗi | joining | ~5.000 lần (n=10k) |
| `collect(toList())` thay `reduce` list | collect | ~40.000 lần (n=10k) |
| `findAny` thay `findFirst` (parallel) | findAny | 2–5 lần |
| `unordered()` trước `distinct` (parallel) | unordered | 2–3 lần |
| `partitioningBy` thay `groupingBy` boolean | partitioningBy | ~20% |
| `mapMulti` thay `flatMap` (ít phần tử con) | mapMulti | 1,5–3 lần |
| Vòng `for` thay stream (n < 1.000) | for | 1,5–5 lần |
| `parallelStream` (n > 100.000, CPU-bound) | parallel | 2–7 lần |
| `parallelStream` (n < 1.000) | **tuần tự** | parallel chậm hơn 10–100 lần |

---
## Phần 15 — 16 Lỗi Streams Kinh Điển

### ❌ Lỗi 1 — Quên toán tử kết thúc → pipeline KHÔNG chạy

```java
// 💣 SAI
List<SinhVien> ds = DuLieuMau.sinhVien();
ds.stream()
  .filter(sv -> sv.tuoi() >= 18)
  .map(SinhVien::hoTen);          // ⚠️ Không có terminal op → KHÔNG CHẠY GÌ

System.out.println("Xong");        // in "Xong" nhưng chẳng có gì xảy ra
```

**Nguyên nhân:** toán tử trung gian **lười**. Không có terminal op = không có ai "kéo" dữ liệu.

**Dấu hiệu nhận biết:** IDE cảnh báo *"Result of 'Stream.map()' is ignored"*. Đừng bỏ qua cảnh báo này!

```java
// ✅ ĐÚNG
List<String> ten = ds.stream()
    .filter(sv -> sv.tuoi() >= 18)
    .map(SinhVien::hoTen)
    .toList();                     // ⭐ terminal op
```

---

### ❌ Lỗi 2 — Dùng lại stream đã tiêu thụ

```java
// 💣 SAI
Stream<SinhVien> s = ds.stream().filter(sv -> sv.tuoi() >= 18);
long dem = s.count();
List<SinhVien> list = s.toList();
// 💥 IllegalStateException: stream has already been operated upon or closed
```

**Nguyên nhân:** stream chỉ dùng **một lần**. Sau terminal op, nó bị đánh dấu `linkedOrConsumed = true`.

```java
// ✅ Cách 1 — tạo stream mới
long dem = ds.stream().filter(p).count();
List<SinhVien> list = ds.stream().filter(p).toList();

// ✅ Cách 2 — collect một lần rồi dùng lại kết quả
List<SinhVien> loc = ds.stream().filter(p).toList();
long dem2 = loc.size();

// ✅ Cách 3 — Supplier
Supplier<Stream<SinhVien>> sup = () -> ds.stream().filter(p);
long a = sup.get().count();
List<SinhVien> b = sup.get().toList();

// ✅ Cách 4 — teeing (1 lần duyệt, 2 kết quả)
var kq = ds.stream().filter(p).collect(teeing(counting(), toList(), Map::entry));
```

---

### ❌ Lỗi 3 — Sửa nguồn trong khi đang stream

```java
// 💣 SAI
List<String> ds = new ArrayList<>(List.of("a", "b", "c"));
ds.stream().forEach(s -> {
    if (s.equals("b")) ds.remove(s);    // ☠️ sửa nguồn giữa chừng
});
// 💥 ConcurrentModificationException — hoặc tệ hơn: chạy được nhưng SAI ngầm
```

**Nguyên nhân:** Javadoc yêu cầu hàm truyền vào stream phải **non-interfering** (không can thiệp nguồn). Nếu vi phạm, hành vi là **undefined** — có thể ném exception, có thể im lặng cho kết quả sai.

```java
// ✅ Cách 1 — tạo list mới
List<String> moi = ds.stream().filter(s -> !s.equals("b")).toList();

// ✅ Cách 2 — removeIf (API của Collection, không phải Stream)
ds.removeIf(s -> s.equals("b"));
```

---

### ❌ Lỗi 4 — Side effect trong toán tử trung gian

```java
// 💣 SAI
List<String> log = new ArrayList<>();
List<String> kq = ds.stream()
    .map(sv -> { log.add(sv.hoTen()); return sv.hoTen(); })   // ☠️ ghi vào biến ngoài
    .filter(t -> t.length() > 5)
    .toList();
// Vấn đề: (1) không thread-safe nếu parallel
//         (2) JDK có thể BỎ QUA map (xem lỗi 8)
//         (3) khó test, khó suy luận
```

```java
// ✅ Dùng peek cho debug (chỉ debug!)
ds.stream().peek(sv -> log.debug("xử lý {}", sv)).map(...).toList();

// ✅ Hoặc tách rõ ràng
List<String> ten = ds.stream().map(SinhVien::hoTen).toList();
ten.forEach(t -> log.debug("đã map: {}", t));
```

> 🎓 Hàm trong stream nên là **hàm thuần khiết (pure function)**: cùng input → cùng output, không thay đổi gì bên ngoài.

---

### ❌ Lỗi 5 — Parallel stream với shared mutable state

```java
// 💣 SAI — mất dữ liệu ngẫu nhiên
List<Integer> kq = new ArrayList<>();
IntStream.range(0, 100_000).parallel().forEach(kq::add);
System.out.println(kq.size());   // 87.234 (mỗi lần chạy một khác) hoặc exception
```

```java
// ✅ ĐÚNG
List<Integer> kq = IntStream.range(0, 100_000).parallel().boxed().toList();
```

Xem chi tiết [mục 10.6](#10-6-☠️-cạm-bẫy--4--race-condition-với-shared-mutable-state).

---

### ❌ Lỗi 6 — Parallel với dữ liệu nhỏ → chậm hơn nhiều

```java
// 💣 SAI — 3 phần tử mà bật parallel
List.of("a", "b", "c").parallelStream().map(String::toUpperCase).toList();
// Chi phí khởi tạo ForkJoinPool >> công việc thật
```

```java
// ✅ ĐÚNG
List.of("a", "b", "c").stream().map(String::toUpperCase).toList();
```

**Quy tắc:** dưới ~10.000 phần tử (với phép toán rẻ) → **luôn tuần tự**.

---

### ❌ Lỗi 7 — `collect(toList())` vs `toList()` — nhầm tính bất biến

```java
// 💣 SAI
List<String> ten = ds.stream().map(SinhVien::hoTen).toList();
ten.add("Người mới");     // 💥 UnsupportedOperationException
Collections.sort(ten);    // 💥 UnsupportedOperationException
```

```java
// ✅ Nếu CẦN sửa
List<String> ten = ds.stream().map(SinhVien::hoTen).collect(Collectors.toList());
// hoặc
List<String> ten2 = new ArrayList<>(ds.stream().map(SinhVien::hoTen).toList());
```

> 🎓 Mặc định dùng `.toList()` (bất biến, an toàn). Chỉ dùng `collect(toList())` khi **thật sự** cần sửa.

---

### ❌ Lỗi 8 — Kỳ vọng toán tử trung gian luôn chạy

```java
// 💣 SAI — audit log không bao giờ ghi
long n = orders.stream()
    .map(o -> { auditService.ghiNhan(o); return o; })
    .count();
```

**Nguyên nhân:** `count()` + nguồn `SIZED` + toán tử không đổi số lượng → JDK **bỏ qua toàn bộ pipeline**.

```java
// ✅ ĐÚNG — side effect phải ở terminal op
orders.forEach(auditService::ghiNhan);
long n = orders.size();
```

---

### ❌ Lỗi 9 — `toMap` với khoá trùng → `IllegalStateException`

```java
// 💣 SAI
Map<String, String> m = ds.stream().collect(toMap(SinhVien::lop, SinhVien::hoTen));
// 💥 IllegalStateException: Duplicate key 12A1
```

```java
// ✅ LUÔN truyền mergeFunction
Map<String, String> m = ds.stream()
    .collect(toMap(SinhVien::lop, SinhVien::hoTen, (cũ, mới) -> cũ));

// ✅ Hoặc nếu ý bạn thật sự là NHÓM → dùng groupingBy
Map<String, List<String>> g = ds.stream()
    .collect(groupingBy(SinhVien::lop, mapping(SinhVien::hoTen, toList())));
```

> 🎓 **Quy tắc:** luôn dùng bản `toMap` **3 tham số**, trừ khi bạn **chắc chắn 100%** khoá là duy nhất (ví dụ khoá chính từ DB).

---

### ❌ Lỗi 10 — Stream vô hạn không có toán tử giới hạn

```java
// 💣 Treo vĩnh viễn
Stream.iterate(1, n -> n + 1).forEach(System.out::println);
Stream.generate(Math::random).toList();          // 💥 OutOfMemoryError
Stream.iterate(1, n -> n + 1).sorted().limit(5); // ♾️ sorted cần thấy hết
```

```java
// ✅ Luôn có limit / takeWhile
Stream.iterate(1, n -> n + 1).limit(100).forEach(System.out::println);
Stream.iterate(1, n -> n < 100, n -> n + 1).forEach(System.out::println);  // Java 9+
```

---

### ❌ Lỗi 11 — `NullPointerException` do đánh giá trễ

```java
// 💣 SAI — NPE xảy ra Ở DÒNG collect, không phải dòng map
List<String> ten = ds.stream()
    .map(SinhVien::biDanh)          // biDanh có thể null
    .map(String::toUpperCase)       // 💥 NPE ở đây... nhưng stack trace chỉ vào collect
    .toList();
```

**Vì sao khó debug?** Vì lambda chỉ chạy khi terminal op kích hoạt → stack trace trỏ vào `collect`/`toList`, không trỏ vào dòng `map` gây lỗi.

```java
// ✅ Cách 1 — lọc null
List<String> ten = ds.stream()
    .map(SinhVien::biDanh)
    .filter(Objects::nonNull)
    .map(String::toUpperCase)
    .toList();

// ✅ Cách 2 — giá trị mặc định
.map(sv -> Objects.requireNonNullElse(sv.biDanh(), ""))

// ✅ Cách 3 — Optional
.map(sv -> Optional.ofNullable(sv.biDanh()).map(String::toUpperCase).orElse("N/A"))
```

**Bẫy phụ:** `toMap` NPE khi **value** null; `toUnmodifiableList()` NPE khi có phần tử null; `Collectors.toList()` thì **cho phép** null. Không đồng nhất — phải nhớ.

---

### ❌ Lỗi 12 — Khoá `groupingBy` là object mutable

```java
// 💣 SAI
class Khoa {                          // không phải record, mutable
    String lop;
    Khoa(String lop) { this.lop = lop; }
    // Có equals/hashCode dựa trên lop
}

Map<Khoa, List<SinhVien>> m = ds.stream().collect(groupingBy(sv -> new Khoa(sv.lop())));
Khoa k = m.keySet().iterator().next();
k.lop = "ĐỔI";                        // ☠️ hashCode đổi theo
System.out.println(m.get(k));         // null — phần tử "mất tích" trong map
```

```java
// ✅ Dùng record — bất biến, tự sinh equals/hashCode
record Khoa(String lop, int tuoi) {}
Map<Khoa, List<SinhVien>> m = ds.stream()
    .collect(groupingBy(sv -> new Khoa(sv.lop(), sv.tuoi())));
```

---

### ❌ Lỗi 13 — `sorted()` mà kiểu không `Comparable`

```java
// 💣 SAI — biên dịch được nhưng CHẾT LÚC CHẠY
ds.stream().sorted().toList();
// 💥 ClassCastException: class SinhVien cannot be cast to class java.lang.Comparable
```

**Vì sao compiler không bắt được?** Vì `sorted()` không ràng buộc `T extends Comparable<T>` — do quyết định thiết kế API (nếu ràng buộc thì `Stream<T>` sẽ phải khai báo lại). Đây là hệ quả của **type erasure** (Chương 3).

```java
// ✅ Truyền comparator
ds.stream().sorted(comparing(SinhVien::hoTen)).toList();

// ✅ Hoặc implement Comparable
record SinhVien(...) implements Comparable<SinhVien> {
    @Override public int compareTo(SinhVien o) { return hoTen.compareTo(o.hoTen); }
}
```

---

### ❌ Lỗi 14 — Comparator đắt tiền trong `sorted()`

```java
// 💣 CHẬM — mỗi lần so sánh gọi lại hàm tính toán nặng
ds.stream()
  .sorted((a, b) -> Double.compare(tinhDiemPhucTap(a), tinhDiemPhucTap(b)))
  .toList();
// n log n lần so sánh × 2 lời gọi = 2n log n lần tính!  (n=10.000 → ~265.000 lần)
```

```java
// ✅ Cách 1 — Schwartzian transform (decorate-sort-undecorate)
record CoDiem(SinhVien sv, double diem) {}
List<SinhVien> kq = ds.stream()
    .map(sv -> new CoDiem(sv, tinhDiemPhucTap(sv)))   // tính n lần THÔI
    .sorted(comparingDouble(CoDiem::diem))
    .map(CoDiem::sv)
    .toList();

// ✅ Cách 2 — memoize
Map<SinhVien, Double> cache = new HashMap<>();
Function<SinhVien, Double> diem = sv -> cache.computeIfAbsent(sv, this::tinhDiemPhucTap);
ds.stream().sorted(comparingDouble(diem::apply)).toList();
```

---

### ❌ Lỗi 15 — Sai chữ ký Collector khi làm downstream

```java
// 💣 SAI — reduce() KHÔNG dùng được làm downstream  (dsChiTiet: List<ChiTietDonHang>)
Map<String, BigDecimal> m = dsChiTiet.stream()
    .collect(groupingBy(x -> x.sanPham().danhMuc(), s -> s.reduce(...)));   // ❌ không compile

// 💣 SAI — quên downstream collector trong mapping
.collect(groupingBy(SinhVien::lop, mapping(SinhVien::hoTen)));   // ❌ mapping cần 2 tham số
```

```java
// ✅ ĐÚNG
.collect(groupingBy(SinhVien::lop, mapping(SinhVien::hoTen, toList())));
.collect(groupingBy(x -> x.sanPham().danhMuc(),
         reducing(BigDecimal.ZERO, ChiTietDonHang::thanhTien, BigDecimal::add)));
```

**Quy tắc nhớ:** downstream **phải là một `Collector`**, không phải một lambda hay lời gọi stream. Nếu bạn cần "reduce" ở downstream → dùng `Collectors.reducing`, không phải `Stream.reduce`.

**Bảng đối chiếu terminal op ⟷ collector tương đương:**

| Terminal op (tầng cao nhất) | Collector tương đương (downstream) |
|-----------------------------|-----------------------------------|
| `.count()` | `counting()` |
| `.reduce(id, op)` | `reducing(id, op)` |
| `.min(cmp)` / `.max(cmp)` | `minBy(cmp)` / `maxBy(cmp)` |
| `.mapToInt(f).sum()` | `summingInt(f)` |
| `.mapToInt(f).average()` | `averagingInt(f)` |
| `.map(f).toList()` | `mapping(f, toList())` |
| `.filter(p).toList()` | `filtering(p, toList())` |
| `.flatMap(f).toSet()` | `flatMapping(f, toSet())` |

---

### ❌ Lỗi 16 — Quên đóng stream từ tài nguyên hệ thống

```java
// 💣 SAI — rò rỉ file descriptor
long n = Files.lines(Path.of("data.txt")).filter(d -> d.contains("x")).count();
// File KHÔNG BAO GIỜ được đóng → sau vài nghìn lần: "Too many open files"
```

```java
// ✅ ĐÚNG — try-with-resources
try (Stream<String> dong = Files.lines(Path.of("data.txt"))) {
    long n = dong.filter(d -> d.contains("x")).count();
}
```

| Nguồn | Cần đóng? |
|-------|-----------|
| `Collection.stream()` | ❌ Không |
| `Arrays.stream()` | ❌ Không |
| `Stream.of()` | ❌ Không |
| `Files.lines/walk/list/find` | ✅ **BẮT BUỘC** |
| `BufferedReader.lines()` | ⚠️ Đóng reader là đủ |
| Stream từ JDBC / kết nối mạng | ✅ **BẮT BUỘC** |

---

### 🎁 Lỗi bonus — `Optional.get()` không kiểm tra

```java
// 💣 SAI
SinhVien sv = ds.stream().filter(p).findFirst().get();   // 💥 NoSuchElementException

// ✅ ĐÚNG — chọn 1 trong các cách
ds.stream().filter(p).findFirst().orElse(macDinh);
ds.stream().filter(p).findFirst().orElseGet(() -> taoMacDinh());   // lazy
ds.stream().filter(p).findFirst().orElseThrow(() -> new ResourceNotFoundException("..."));
ds.stream().filter(p).findFirst().ifPresent(x -> xuLy(x));
```

---

## Phần 16 — Best Practices & Anti-patterns

### 16.1 ⭐ Ưu tiên Streams — nhưng ĐỪNG cuồng tín

```java
// ✅ Stream toả sáng: chuỗi biến đổi
List<String> kq = ds.stream()
    .filter(sv -> sv.tuoi() >= 18)
    .sorted(comparing(SinhVien::hoTen))
    .map(SinhVien::hoTen)
    .toList();

// ❌ Stream vô nghĩa: chỉ duyệt và in
ds.stream().forEach(System.out::println);
// ✅ for-each đơn giản hơn
for (SinhVien sv : ds) System.out.println(sv);

// ❌ Stream làm phức tạp: cần index và điều kiện dừng phức tạp
IntStream.range(0, n).filter(i -> ...).findFirst();
// ✅ for rõ ràng hơn
for (int i = 0; i < n; i++) { if (...) { ... break; } }
```

> 🎓 **Tiêu chí quyết định:** *Bản nào người đọc hiểu nhanh hơn?* Streams là công cụ để **tăng khả năng đọc**. Nếu nó làm code khó đọc hơn — đừng dùng.

### 16.2 ⭐ Tránh Stream lồng nhau — dùng `flatMap`

```java
// ❌ ANTI-PATTERN — stream trong stream
List<String> kq = donHang.stream()
    .map(dh -> dh.chiTiet().stream().map(ct -> ct.sanPham().ten()).toList())
    .flatMap(List::stream)      // phải flatMap ở ngoài → thừa 1 List trung gian
    .toList();

// ✅ flatMap trực tiếp
List<String> kq = donHang.stream()
    .flatMap(dh -> dh.chiTiet().stream())
    .map(ct -> ct.sanPham().ten())
    .toList();
```

**Ngoại lệ hợp lệ:** stream lồng bên trong `flatMap` để tạo tích Descartes (đã thấy ở mục 4.3).

### 16.3 ⭐ Dùng method reference khi có thể

```java
// ❌ Lambda dài dòng
.map(sv -> sv.hoTen())
.filter(s -> s != null)
.map(s -> s.toUpperCase())
.forEach(s -> System.out.println(s))

// ✅ Method reference — ngắn, rõ ý định (Chương 3)
.map(SinhVien::hoTen)
.filter(Objects::nonNull)
.map(String::toUpperCase)
.forEach(System.out::println)
```

**Nhưng đừng ép:**

```java
// ⚠️ Method reference khó đọc hơn lambda ở đây
.map(((Function<String, String>) String::trim).andThen(String::toUpperCase))
// ✅ Lambda rõ hơn
.map(s -> s.trim().toUpperCase())
```

### 16.4 ⭐ Static import cho `Collectors` và `Comparator`

```java
// ❌ Rườm rà
.collect(java.util.stream.Collectors.groupingBy(SinhVien::lop,
         java.util.stream.Collectors.counting()))

// ✅ Static import
import static java.util.stream.Collectors.*;
import static java.util.Comparator.*;
import static java.util.function.Function.identity;

.collect(groupingBy(SinhVien::lop, counting()))
.sorted(comparing(SinhVien::hoTen).thenComparing(SinhVien::tuoi))
.collect(toMap(SanPham::id, identity()))
```

### 16.5 ⭐ Dùng `var` để giảm rối kiểu

```java
// ❌ Kiểu dài kinh khủng
Map<String, Map<String, List<SinhVien>>> kq = ds.stream()
    .collect(groupingBy(SinhVien::lop, groupingBy(sv -> xepLoai(sv))));

// ✅ var (Java 10+)
var kq = ds.stream()
    .collect(groupingBy(SinhVien::lop, groupingBy(this::xepLoai)));
```

> ⚠️ **Nhưng:** ở **API công khai** (return type của method public), **luôn khai báo kiểu tường minh**. `var` chỉ dùng cho biến cục bộ.

### 16.6 ⭐ Đặt tên cho Predicate/Function phức tạp

```java
// ❌ Điều kiện dài, khó đọc, khó test
ds.stream()
  .filter(sv -> sv.tuoi() >= 18 && sv.diemTrungBinh() >= 7.0
              && sv.monHoc().contains("Toán") && !sv.lop().startsWith("12B"))
  .toList();

// ✅ Tách và đặt tên — tự tài liệu hoá + test được riêng
Predicate<SinhVien> daTruongThanh   = sv -> sv.tuoi() >= 18;
Predicate<SinhVien> hocLucKha       = sv -> sv.diemTrungBinh() >= 7.0;
Predicate<SinhVien> hocToan         = sv -> sv.monHoc().contains("Toán");
Predicate<SinhVien> khongThuocKhoiB = sv -> !sv.lop().startsWith("12B");

ds.stream()
  .filter(daTruongThanh.and(hocLucKha).and(hocToan).and(khongThuocKhoiB))
  .toList();
```

### 16.7 ⭐ Ưu tiên hàm thuần khiết, tránh side effect

```java
// ❌ Side effect
List<String> kq = new ArrayList<>();
ds.stream().forEach(sv -> { if (sv.tuoi() >= 18) kq.add(sv.hoTen()); });

// ✅ Thuần khiết
List<String> kq = ds.stream()
    .filter(sv -> sv.tuoi() >= 18)
    .map(SinhVien::hoTen)
    .toList();
```

**Lợi ích của hàm thuần khiết:** dễ test (không cần mock), dễ song song hoá, dễ suy luận, dễ cache.

### 16.8 ⭐ Ưu tiên stateless hơn stateful

```java
// ❌ sorted không cần thiết
ds.stream().sorted(comparing(SinhVien::hoTen)).anyMatch(p);   // sắp xếp rồi mới tìm?!

// ✅ Bỏ sorted
ds.stream().anyMatch(p);

// ❌ distinct thừa (nguồn đã là Set)
tapHop.stream().distinct().toList();

// ✅
tapHop.stream().toList();
```

### 16.9 ⭐ Đo, đừng đoán khi dùng parallel

```java
// ❌ "Chắc parallel nhanh hơn"
list.parallelStream()...

// ✅ Có benchmark chứng minh
// Benchmark kết quả (JMH, n=1M): tuần tự 700µs, song song 190µs → dùng parallel
list.parallelStream()...
```

### 16.10 ⭐ Chỉ viết custom Collector khi thực sự cần

**Thứ tự ưu tiên:**
1. `Collectors.*` có sẵn;
2. Kết hợp `collectingAndThen` / `mapping` / `teeing` với collector có sẵn;
3. `Collector.of(...)`;
4. Class implement `Collector` (chỉ khi logic rất phức tạp).

### 16.11 ⭐ Giới hạn độ dài pipeline

```java
// ❌ Pipeline 15 dòng, 3 tầng collector lồng nhau → không ai đọc nổi

// ✅ Tách thành bước có tên
var donHoanThanh = donHang.stream()
    .filter(d -> d.trangThai() == TrangThai.HOAN_THANH)
    .toList();

var dongHang = donHoanThanh.stream()
    .flatMap(d -> d.chiTiet().stream())
    .toList();

var doanhThuTheoDanhMuc = dongHang.stream()
    .collect(groupingBy(ct -> ct.sanPham().danhMuc(),
             reducing(BigDecimal.ZERO, ChiTietDonHang::thanhTien, BigDecimal::add)));
```

> 🎓 **Quy tắc ngón tay cái:** pipeline ≤ **7 dòng**, lồng collector ≤ **2 tầng**. Vượt quá → tách.

### 16.12 ⭐ Xử lý checked exception trong lambda

```java
// ❌ Không compile — lambda không throw checked exception
List<String> noiDung = duongDan.stream()
    .map(p -> Files.readString(p))    // ❌ IOException là checked
    .toList();

// ✅ Cách 1 — bọc trong unchecked
List<String> noiDung = duongDan.stream()
    .map(p -> {
        try { return Files.readString(p); }
        catch (IOException e) { throw new UncheckedIOException(e); }
    })
    .toList();

// ✅ Cách 2 — helper tái sử dụng
@FunctionalInterface
interface HamCoTheNem<T, R> { R apply(T t) throws Exception; }

static <T, R> Function<T, R> boc(HamCoTheNem<T, R> f) {
    return t -> {
        try { return f.apply(t); }
        catch (Exception e) { throw new RuntimeException(e); }
    };
}
List<String> noiDung = duongDan.stream().map(boc(Files::readString)).toList();

// ✅ Cách 3 — bỏ qua phần tử lỗi, trả Optional
static <T, R> Function<T, Optional<R>> anToan(HamCoTheNem<T, R> f) {
    return t -> {
        try { return Optional.ofNullable(f.apply(t)); }
        catch (Exception e) { log.warn("Bỏ qua {}: {}", t, e.getMessage()); return Optional.empty(); }
    };
}
List<String> noiDung = duongDan.stream()
    .map(anToan(Files::readString))
    .flatMap(Optional::stream)
    .toList();
```

### 16.13 Bảng tổng hợp Anti-patterns

| Anti-pattern | Vì sao sai | Thay bằng |
|--------------|-----------|-----------|
| `forEach(list::add)` | Side effect, không thread-safe | `.toList()` |
| `forEach(m::put)` | Như trên | `.collect(toMap(...))` |
| `peek` cho logic nghiệp vụ | Có thể bị bỏ qua | `map` / `forEach` |
| `.parallel()` mặc định | Chậm hơn, có thể sai | `.stream()`, đo trước khi đổi |
| `reduce` để gom list/chuỗi | `O(n²)` | `collect(toList/joining)` |
| `Optional.get()` | Ném exception | `orElse/orElseThrow/ifPresent` |
| Stream lồng stream | Khó đọc, thừa object | `flatMap` |
| `toMap` không có merge | Ném `IllegalStateException` | `toMap(k, v, merge)` |
| `groupingBy` cho boolean | `null` khi 1 nhóm rỗng | `partitioningBy` |
| `sorted()` không cần thiết | `O(n log n)` + `O(n)` RAM | Bỏ đi |
| `.stream().findFirst()` trên DB result | Nạp cả bảng | `repository.findTop1By...` |
| Pipeline > 10 dòng | Không ai đọc nổi | Tách thành bước |
| `.map()` có side effect | Có thể không chạy | Tách ra `forEach` |
| `.collect(toList())` khi không cần sửa | Kém an toàn | `.toList()` |

---
## Phần 17 — Streams Trong Spring Boot

Đây là phần **kết nối Tầng 1 với Tầng 2**. Mọi thứ bạn học ở trên sẽ xuất hiện hàng ngày khi viết Spring Boot.

### 17.1 Mẫu #1 — Entity → DTO (dùng nhiều nhất)

```java
// ===== Domain =====
@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor   // ⚠️ KHÔNG dùng @Data trên @Entity (CLAUDE.md)
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal price;        // ⚠️ Tiền → BigDecimal, KHÔNG double

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
}

// ===== DTO (record — gọn, bất biến) =====
public record ProductDto(Long id, String name, BigDecimal price, String categoryName) {}

// ===== Mapper =====
@Component
public class ProductMapper {
    public ProductDto toDto(Product p) {
        return new ProductDto(
            p.getId(),
            p.getName(),
            p.getPrice(),
            p.getCategory() != null ? p.getCategory().getName() : null
        );
    }
}

// ===== Service =====
@Service
@RequiredArgsConstructor          // constructor injection (CLAUDE.md)
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto> getAll() {
        return productRepository.findAll().stream()
            .map(productMapper::toDto)     // ⭐ method reference
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDto getById(Long id) {
        return productRepository.findById(id)
            .map(productMapper::toDto)     // ⭐ Optional.map, không phải Stream.map
            .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }
}
```

> 💡 Chú ý: `Optional.map` và `Stream.map` **cùng ý tưởng** (áp dụng hàm vào giá trị bên trong container) nhưng khác class. Đây là mẫu **Functor** — một khái niệm functional programming.

### 17.2 Mẫu #2 — `Optional` từ repository và `findFirst`

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    /** Repository trả Optional — không bao giờ null (CLAUDE.md) */
    public UserDto findByEmail(String email) {
        return userRepository.findByEmail(email)
            .map(UserMapper::toDto)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    /** Kết hợp Stream + Optional */
    public Optional<UserDto> findFirstAdmin() {
        return userRepository.findAll().stream()
            .filter(u -> u.getRoles().contains(Role.ADMIN))
            .findFirst()                                   // Optional<User>
            .map(UserMapper::toDto);                       // Optional<UserDto>
    }

    /** Làm phẳng danh sách Optional (Java 9+) */
    public List<UserDto> findAllByIds(List<Long> ids) {
        return ids.stream()
            .map(userRepository::findById)     // Stream<Optional<User>>
            .flatMap(Optional::stream)          // ⭐ bỏ rỗng, làm phẳng
            .map(UserMapper::toDto)
            .toList();
        // ⚠️ Nhưng cách này gọi DB n lần! Xem 17.6 để biết cách đúng
    }
}
```

### 17.3 Mẫu #3 — `groupingBy` cho báo cáo, thống kê

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;

    /** Doanh thu theo danh mục */
    public Map<String, BigDecimal> revenueByCategory(LocalDate from, LocalDate to) {
        return orderRepository.findByOrderDateBetweenAndStatus(from, to, OrderStatus.COMPLETED)
            .stream()
            .flatMap(o -> o.getItems().stream())
            .collect(groupingBy(
                item -> item.getProduct().getCategory().getName(),
                reducing(BigDecimal.ZERO, OrderItem::getSubtotal, BigDecimal::add)
            ));
    }

    /** Số đơn theo trạng thái */
    public Map<OrderStatus, Long> countByStatus() {
        return orderRepository.findAll().stream()
            .collect(groupingBy(Order::getStatus, counting()));
        // ⚠️ Với bảng lớn → dùng @Query GROUP BY (xem 17.6)
    }

    /** Top 5 khách hàng theo tổng chi tiêu */
    public List<CustomerSpendingDto> topCustomers(int limit) {
        return orderRepository.findByStatus(OrderStatus.COMPLETED).stream()
            .collect(groupingBy(Order::getCustomerId,
                     reducing(BigDecimal.ZERO, Order::getTotalAmount, BigDecimal::add)))
            .entrySet().stream()
            .sorted(Map.Entry.<Long, BigDecimal>comparingByValue().reversed())
            .limit(limit)
            .map(e -> new CustomerSpendingDto(e.getKey(), e.getValue()))
            .toList();
    }
}
```

### 17.4 Mẫu #4 — Validation và xử lý lỗi

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /** Gom tất cả lỗi validation thành một chuỗi — Streams toả sáng */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(joining(", "));                  // ⭐ joining

        log.warn("Lỗi validation: {}", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse("VALIDATION_ERROR", errors));
    }

    /** Phiên bản trả về Map<field, message> — API-friendly hơn */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, String>> handleConstraint(ConstraintViolationException ex) {
        Map<String, String> loi = ex.getConstraintViolations().stream()
            .collect(toMap(
                v -> v.getPropertyPath().toString(),
                ConstraintViolation::getMessage,
                (a, b) -> a + "; " + b                // ⭐ LUÔN có merge function
            ));
        return ResponseEntity.badRequest().body(loi);
    }
}
```

### 17.5 Mẫu #5 — Spring Security: chuyển đổi quyền

```java
@Component
public class JwtService {

    /** Entity roles → GrantedAuthority */
    public List<GrantedAuthority> toAuthorities(User user) {
        return user.getRoles().stream()
            .map(role -> "ROLE_" + role.getName())
            .map(SimpleGrantedAuthority::new)          // ⭐ constructor reference
            .collect(Collectors.toUnmodifiableList());
    }

    /** Authority → chuỗi cho JWT claim */
    public String toClaim(Collection<? extends GrantedAuthority> authorities) {
        return authorities.stream()
            .map(GrantedAuthority::getAuthority)
            .collect(joining(","));
    }

    /** Claim chuỗi → Authority */
    public List<SimpleGrantedAuthority> fromClaim(String claim) {
        return Arrays.stream(claim.split(","))
            .filter(s -> !s.isBlank())
            .map(SimpleGrantedAuthority::new)
            .toList();
    }
}
```

### 17.6 🔥 QUAN TRỌNG NHẤT — Khi nào để DATABASE làm việc thay vì Stream

Đây là **sai lầm phổ biến nhất** của developer mới học Streams: dùng Stream cho những việc mà **SQL làm tốt hơn hàng trăm lần**.

#### Ví dụ 1 — Lọc

```java
// ❌ TỆ — nạp TOÀN BỘ bảng vào RAM rồi mới lọc
public List<ProductDto> findByCategory(String category) {
    return productRepository.findAll().stream()               // 💀 SELECT * FROM products
        .filter(p -> p.getCategory().getName().equals(category))
        .map(mapper::toDto)
        .toList();
}
// Bảng 5 triệu dòng → 5 triệu object trong RAM → OutOfMemoryError

// ✅ TỐT — database lọc
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryName(String categoryName);
    // → SELECT * FROM products p JOIN categories c ... WHERE c.name = ?
}

public List<ProductDto> findByCategory(String category) {
    return productRepository.findByCategoryName(category).stream()
        .map(mapper::toDto)      // ⭐ Stream CHỈ để map DTO — đúng vai trò
        .toList();
}
```

#### Ví dụ 2 — Phân trang

```java
// ❌ TỆ
public List<ProductDto> page(int page, int size) {
    return productRepository.findAll().stream()
        .skip((long) page * size)
        .limit(size)
        .map(mapper::toDto)
        .toList();
}

// ✅ TỐT — Pageable
public Page<ProductDto> page(int page, int size) {
    return productRepository.findAll(PageRequest.of(page, size, Sort.by("name")))
        .map(mapper::toDto);      // ⭐ Page.map — không phải Stream.map
    // → SELECT * FROM products ORDER BY name LIMIT 20 OFFSET 40
}
```

#### Ví dụ 3 — Đếm và tổng hợp

```java
// ❌ TỆ
long n = productRepository.findAll().stream().filter(p -> p.getStock() == 0).count();

// ✅ TỐT
long n = productRepository.countByStockEquals(0);       // → SELECT COUNT(*) WHERE stock = 0

// ❌ TỆ — group by trên 5 triệu dòng trong JVM
Map<String, Long> m = productRepository.findAll().stream()
    .collect(groupingBy(p -> p.getCategory().getName(), counting()));

// ✅ TỐT — @Query với GROUP BY
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
        SELECT new com.example.dto.CategoryCountDto(c.name, COUNT(p))
        FROM Product p JOIN p.category c
        GROUP BY c.name
        """)
    List<CategoryCountDto> countByCategory();
}
```

#### Ví dụ 4 — Vấn đề N+1

```java
// ❌ THẢM HOẠ — N+1 query
List<OrderDto> dto = orderRepository.findAll().stream()   // 1 query
    .map(o -> new OrderDto(
        o.getId(),
        o.getCustomer().getName(),      // 💀 +1 query mỗi đơn (LAZY)
        o.getItems().size()             // 💀 +1 query nữa
    ))
    .toList();
// 1.000 đơn → 2.001 câu SQL

// ✅ FIX — JOIN FETCH
@Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.customer JOIN FETCH o.items")
List<Order> findAllWithDetails();

List<OrderDto> dto = orderRepository.findAllWithDetails().stream()   // 1 query duy nhất
    .map(mapper::toDto)
    .toList();

// ✅ Hoặc dùng @EntityGraph
@EntityGraph(attributePaths = {"customer", "items"})
List<Order> findAll();
```

#### Bảng quyết định — DB hay Stream?

| Nhiệm vụ | Ai làm | Lý do |
|---------|--------|-------|
| Lọc theo điều kiện | ✅ **Database** (`WHERE`) | Có index, không nạp RAM |
| Sắp xếp | ✅ **Database** (`ORDER BY`) | Có index |
| Phân trang | ✅ **Database** (`Pageable`) | `LIMIT/OFFSET` |
| Đếm | ✅ **Database** (`COUNT`) | Không nạp dữ liệu |
| Nhóm + tổng hợp trên bảng lớn | ✅ **Database** (`GROUP BY`) | Tối ưu bởi query planner |
| Join dữ liệu | ✅ **Database** (`JOIN FETCH`) | Tránh N+1 |
| **Map Entity → DTO** | ✅ **Stream** | Logic Java thuần |
| **Biến đổi dữ liệu đã lấy về** | ✅ **Stream** | |
| **Nhóm trên tập nhỏ (< vài nghìn)** | ✅ **Stream** | Đơn giản hơn viết query |
| **Logic nghiệp vụ phức tạp** | ✅ **Stream** | SQL không diễn đạt được |
| **Gộp dữ liệu từ NHIỀU nguồn** (DB + API) | ✅ **Stream** | |

> 🎓 **Quy tắc vàng:** *Database lọc và giảm dữ liệu. Stream biến đổi dữ liệu đã giảm.*

### 17.7 `Stream` từ Spring Data JPA (nâng cao)

Spring Data hỗ trợ trả về `Stream<T>` trực tiếp — **đọc từng dòng** thay vì nạp hết:

```java
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE p.stock > 0")
    Stream<Product> streamAllInStock();     // ⭐ trả Stream, không phải List
}

@Service
@RequiredArgsConstructor
public class ExportService {

    private final ProductRepository productRepository;

    /** Xuất 10 triệu bản ghi ra CSV mà KHÔNG nạp hết vào RAM */
    @Transactional(readOnly = true)         // ⚠️ BẮT BUỘC — stream cần transaction mở
    public void exportCsv(Writer writer) {
        try (Stream<Product> stream = productRepository.streamAllInStock()) {  // ⚠️ BẮT BUỘC đóng
            stream.map(p -> p.getId() + "," + p.getName() + "," + p.getPrice())
                  .forEach(dong -> {
                      try { writer.write(dong + "\n"); }
                      catch (IOException e) { throw new UncheckedIOException(e); }
                  });
        }
    }
}
```

**Ba điều kiện bắt buộc khi dùng `Stream` từ repository:**
1. `@Transactional` — transaction phải **mở** suốt quá trình stream;
2. `try-with-resources` — phải đóng để giải phóng cursor/connection;
3. Cân nhắc `entityManager.detach()` hoặc `clear()` định kỳ để tránh persistence context phình to.

### 17.8 Streams trong Testing

```java
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock  ProductRepository productRepository;
    @Mock  ProductMapper productMapper;
    @InjectMocks ProductServiceImpl productService;

    @Test
    void getAll_traVeDanhSachDto() {
        // given — tạo dữ liệu test bằng Stream ⭐
        List<Product> products = IntStream.rangeClosed(1, 5)
            .mapToObj(i -> {
                var p = new Product();
                p.setId((long) i);
                p.setName("SP " + i);
                p.setPrice(new BigDecimal(i * 1000));
                return p;
            })
            .toList();

        when(productRepository.findAll()).thenReturn(products);
        when(productMapper.toDto(any())).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            return new ProductDto(p.getId(), p.getName(), p.getPrice(), null);
        });

        // when
        List<ProductDto> kq = productService.getAll();

        // then — assert bằng Stream ⭐
        assertThat(kq).hasSize(5);
        assertThat(kq).extracting(ProductDto::name)
                      .containsExactly("SP 1", "SP 2", "SP 3", "SP 4", "SP 5");
        assertThat(kq.stream().allMatch(d -> d.price().compareTo(BigDecimal.ZERO) > 0)).isTrue();
    }
}
```

### 17.9 ⚠️ Streams và Transaction — cạm bẫy tinh vi

```java
// 💣 SAI — LazyInitializationException
@Transactional(readOnly = true)
public List<Order> getOrders() {
    return orderRepository.findAll();     // transaction đóng khi method kết thúc
}

// Ở controller — NGOÀI transaction
public List<String> getCustomerNames() {
    return orderService.getOrders().stream()
        .map(o -> o.getCustomer().getName())   // 💥 LazyInitializationException
        .toList();
}
```

**Vì sao?** Stream **lười** — `map` chỉ chạy khi `toList()` được gọi, lúc đó transaction đã đóng và proxy LAZY không nạp được.

```java
// ✅ FIX 1 — hoàn tất mọi biến đổi TRONG service (trong transaction)
@Transactional(readOnly = true)
public List<String> getCustomerNames() {
    return orderRepository.findAll().stream()
        .map(o -> o.getCustomer().getName())
        .toList();                             // ⭐ terminal op ở TRONG transaction
}

// ✅ FIX 2 — JOIN FETCH để không còn LAZY
@Query("SELECT o FROM Order o JOIN FETCH o.customer")
List<Order> findAllWithCustomer();

// ✅ FIX 3 — trả DTO thay vì Entity ra khỏi service (BEST PRACTICE)
@Transactional(readOnly = true)
public List<OrderDto> getOrders() {
    return orderRepository.findAllWithCustomer().stream().map(mapper::toDto).toList();
}
```

> 🎓 **Nguyên tắc:** **KHÔNG BAO GIỜ** trả `@Entity` ra khỏi tầng service. Luôn map sang DTO **bên trong** transaction. Đây cũng là quy tắc trong CLAUDE.md: *"Tách biệt hoàn toàn `@Entity` và Response DTO"*.

### 17.10 ⚠️ Parallel Stream trong Spring Boot — ĐỪNG

```java
// 💣 SAI trong web application
@GetMapping("/products")
public List<ProductDto> getAll() {
    return productRepository.findAll().parallelStream()   // ☠️
        .map(mapper::toDto)
        .toList();
}
```

**Ba lý do:**
1. **Common pool bị chiếm** — mọi request khác đều bị ảnh hưởng;
2. **Tomcat đã song song hoá rồi** — mỗi request có thread riêng; parallel bên trong request là **song song hai lần**, gây tranh chấp CPU;
3. **Mất context** — `SecurityContextHolder`, `RequestContextHolder`, MDC logging đều là `ThreadLocal` → **không truyền sang worker thread** của ForkJoinPool.

```java
// 💣 Minh hoạ mất SecurityContext
list.parallelStream().forEach(item -> {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    // ☠️ null trên các thread con!
});
```

```java
// ✅ ĐÚNG trong web app
@GetMapping("/products")
public ResponseEntity<List<ProductDto>> getAll() {
    List<ProductDto> kq = productRepository.findAll().stream()
        .map(mapper::toDto)
        .toList();
    return ResponseEntity.ok(kq);
}

// ✅ Nếu THẬT SỰ cần song song → @Async với pool riêng
@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean("taskExecutor")
    public Executor taskExecutor() {
        var e = new ThreadPoolTaskExecutor();
        e.setCorePoolSize(4);
        e.setMaxPoolSize(8);
        e.setQueueCapacity(100);
        e.setThreadNamePrefix("async-");
        e.setTaskDecorator(new ContextCopyingDecorator());   // truyền SecurityContext
        e.initialize();
        return e;
    }
}
```

**Nơi parallel stream HỢP LỆ trong Spring Boot:**
- `@Scheduled` batch job chạy ban đêm, xử lý hàng triệu bản ghi CPU-bound;
- Công cụ CLI / migration script;
- **Không phải** trong luồng xử lý HTTP request.

---
## Phần 18 — Bài Tập Thực Hành

> 💡 **Cách làm hiệu quả:** làm **trước**, xem gợi ý **sau**. Mỗi bài đều có "tiêu chí đạt" — hãy tự kiểm tra.

### 🟢 Bài 1 (Dễ) — Lọc, biến đổi, gom

**Yêu cầu:** Với `List<SinhVien>` từ `DuLieuMau`, viết các method sau:

```java
public class BaiTap1 {

    /** Trả về họ tên (viết HOA) của các sinh viên từ 18 tuổi trở lên, sắp xếp A→Z */
    public static List<String> tenSinhVienTruongThanh(List<SinhVien> ds) { }

    /** Trả về danh sách lớp (không trùng), sắp xếp tăng dần */
    public static List<String> danhSachLop(List<SinhVien> ds) { }

    /** Đếm số sinh viên có điểm trung bình >= 8.0 */
    public static long demHocSinhGioi(List<SinhVien> ds) { }

    /** Trả về Optional chứa sinh viên có điểm cao nhất */
    public static Optional<SinhVien> caoDiemNhat(List<SinhVien> ds) { }

    /** Trả về true nếu MỌI sinh viên đều có điểm >= 5.0 */
    public static boolean tatCaDatChuan(List<SinhVien> ds) { }
}
```

**Hướng dẫn:**
1. `filter` → `map` → `sorted` → `toList`;
2. `map` → `distinct` → `sorted` → `toList`;
3. `filter` → `count`;
4. `max(comparingDouble(...))`;
5. `allMatch` — ⚠️ nhớ bẫy stream rỗng.

**Gợi ý:**

```java
public static List<String> tenSinhVienTruongThanh(List<SinhVien> ds) {
    return ds.stream()
        .filter(sv -> sv.tuoi() >= 18)
        .map(SinhVien::hoTen)
        .map(String::toUpperCase)
        .sorted()
        .toList();
}
```

**Tiêu chí đạt:**
- ✅ Không dùng vòng lặp nào;
- ✅ Không có biến tạm;
- ✅ Dùng method reference ở nơi có thể;
- ✅ Method 4 trả `Optional`, **không** trả `null`;
- ✅ Method 5 xử lý đúng khi `ds` rỗng (thảo luận: nên trả gì?).

---

### 🟢 Bài 2 (Dễ) — Nhóm và thống kê

**Yêu cầu:**

```java
public class BaiTap2 {

    /** Đếm số sinh viên mỗi lớp → {12A1=3, 12A2=2, 12B1=2} */
    public static Map<String, Long> demTheoLop(List<SinhVien> ds) { }

    /** Điểm trung bình mỗi lớp */
    public static Map<String, Double> diemTrungBinhTheoLop(List<SinhVien> ds) { }

    /** Danh sách TÊN theo lớp → {12A1=[Nguyễn An, Trần Bình, Đỗ Giang], ...} */
    public static Map<String, List<String>> tenTheoLop(List<SinhVien> ds) { }

    /** Chia thành 2 nhóm: đủ 18 tuổi và chưa đủ */
    public static Map<Boolean, List<SinhVien>> chiaTheoTuoi(List<SinhVien> ds) { }

    /** Sinh viên giỏi nhất MỖI lớp (không bọc Optional) */
    public static Map<String, SinhVien> gioiNhatMoiLop(List<SinhVien> ds) { }

    /** Chuỗi tên nối bằng ", " bao trong dấu ngoặc vuông */
    public static String chuoiTen(List<SinhVien> ds) { }
}
```

**Hướng dẫn:**
1. `groupingBy(SinhVien::lop, counting())`;
2. `groupingBy(..., averagingDouble(...))`;
3. `groupingBy(..., mapping(SinhVien::hoTen, toList()))`;
4. ⚠️ Dùng `partitioningBy`, **không** dùng `groupingBy`;
5. `groupingBy(..., collectingAndThen(maxBy(...), Optional::get))`;
6. `map(...).collect(joining(", ", "[", "]"))`.

**Gợi ý:**

```java
public static Map<String, SinhVien> gioiNhatMoiLop(List<SinhVien> ds) {
    return ds.stream().collect(groupingBy(
        SinhVien::lop,
        collectingAndThen(
            maxBy(comparingDouble(SinhVien::diemTrungBinh)),
            Optional::get)   // an toàn vì nhóm không bao giờ rỗng
    ));
}
```

**Tiêu chí đạt:**
- ✅ Dùng static import `Collectors.*`;
- ✅ Method 4 trả về map **luôn có cả 2 khoá** (test với danh sách toàn người < 18);
- ✅ Method 5 không có `Optional` trong kiểu trả về.

**Mở rộng:** viết method trả `Map<String, DoubleSummaryStatistics>` — thống kê điểm đầy đủ mỗi lớp.

---

### 🟡 Bài 3 (Trung bình) — `flatMap` với dữ liệu lồng nhau

**Yêu cầu:** Dùng `List<DonHang>` từ `DuLieuMau`:

```java
public class BaiTap3 {

    /** Tất cả dòng hàng của tất cả đơn */
    public static List<ChiTietDonHang> tatCaDongHang(List<DonHang> dh) { }

    /** Tổng doanh thu (chỉ đơn HOÀN THÀNH) — dùng BigDecimal */
    public static BigDecimal tongDoanhThu(List<DonHang> dh) { }

    /** Tên các sản phẩm đã bán, không trùng, sắp xếp */
    public static List<String> sanPhamDaBan(List<DonHang> dh) { }

    /** Số lượng bán của mỗi sản phẩm → {Laptop Dell=1, Chuột Logi=12, ...} */
    public static Map<String, Integer> soLuongTheoSanPham(List<DonHang> dh) { }

    /** Doanh thu theo danh mục, chỉ đơn HOÀN THÀNH, map sắp xếp theo tên danh mục */
    public static Map<String, BigDecimal> doanhThuTheoDanhMuc(List<DonHang> dh) { }

    /** Khách hàng chi nhiều nhất (đơn HOÀN THÀNH) */
    public static Optional<String> khachChiNhieuNhat(List<DonHang> dh) { }
}
```

**Hướng dẫn:**
1. `flatMap(d -> d.chiTiet().stream())`;
2. `filter` trạng thái → `flatMap` → `map(ChiTietDonHang::thanhTien)` → `reduce(BigDecimal.ZERO, BigDecimal::add)`;
3. `flatMap` → `map` tên → `distinct` → `sorted`;
4. `groupingBy(..., summingInt(ChiTietDonHang::soLuong))`;
5. `groupingBy(khóa, TreeMap::new, reducing(...))`;
6. `groupingBy(DonHang::khachHang, reducing(...))` → `entrySet().stream()` → `max(comparingByValue())` → `map(Entry::getKey)`.

**Gợi ý:**

```java
public static Map<String, BigDecimal> doanhThuTheoDanhMuc(List<DonHang> dh) {
    return dh.stream()
        .filter(d -> d.trangThai() == TrangThai.HOAN_THANH)
        .flatMap(d -> d.chiTiet().stream())
        .collect(groupingBy(
            ct -> ct.sanPham().danhMuc(),
            TreeMap::new,
            reducing(BigDecimal.ZERO, ChiTietDonHang::thanhTien, BigDecimal::add)));
}
```

**Tiêu chí đạt:**
- ✅ **Không** dùng `double` cho tiền — chỉ `BigDecimal` (CLAUDE.md);
- ✅ Không có vòng lặp lồng nhau;
- ✅ Method 6 trả `Optional`, xử lý được trường hợp danh sách rỗng.

**Mở rộng:** Viết method trả `Map<String, Map<String, BigDecimal>>` — doanh thu theo **khách hàng → danh mục**.

---

### 🟡 Bài 4 (Trung bình) — Viết Collector riêng

**Yêu cầu:** Cài đặt 3 collector sau **mà không dùng** `Collectors.*` tương ứng:

```java
public class MyCollectors {

    /** Tương đương Collectors.toUnmodifiableList() */
    public static <T> Collector<T, ?, List<T>> toImmutableList() { }

    /** Nối chuỗi với delimiter, prefix, suffix — tương đương joining(d,p,s) */
    public static Collector<CharSequence, ?, String> noiChuoi(
            String delimiter, String prefix, String suffix) { }

    /** Chia stream thành N nhóm luân phiên (round-robin) → Map<Integer, List<T>> */
    public static <T> Collector<T, ?, Map<Integer, List<T>>> chiaLuanPhien(int soNhom) { }

    /** Lấy top-k phần tử lớn nhất — hiệu quả hơn sorted().limit(k) */
    public static <T> Collector<T, ?, List<T>> topK(int k, Comparator<? super T> cmp) { }
}
```

**Hướng dẫn:**
1. `Collector.of(ArrayList::new, List::add, combiner, Collections::unmodifiableList)`;
2. Dùng `StringJoiner` làm container — nó đã có sẵn `merge`;
3. Cần đếm thứ tự phần tử → container phải chứa cả bộ đếm (dùng class nhỏ hoặc `AtomicInteger`); ⚠️ **combiner sẽ khó** — hãy suy nghĩ kỹ và cân nhắc **không hỗ trợ parallel**;
4. Container là `PriorityQueue` với comparator **đảo ngược**, giữ tối đa `k` phần tử; finisher sắp xếp lại.

**Gợi ý bài 2 và 4:**

```java
public static Collector<CharSequence, ?, String> noiChuoi(String d, String p, String s) {
    return Collector.of(
        () -> new StringJoiner(d, p, s),      // ① container
        StringJoiner::add,                     // ② thêm
        StringJoiner::merge,                   // ③ gộp — StringJoiner có sẵn!
        StringJoiner::toString                 // ④ finisher
    );
}

public static <T> Collector<T, ?, List<T>> topK(int k, Comparator<? super T> cmp) {
    return Collector.of(
        () -> new PriorityQueue<T>(cmp),       // ① min-heap theo cmp
        (pq, item) -> {                        // ②
            pq.offer(item);
            if (pq.size() > k) pq.poll();      // bỏ phần tử NHỎ nhất → giữ k lớn nhất
        },
        (a, b) -> {                            // ③ gộp 2 heap
            b.forEach(x -> { a.offer(x); if (a.size() > k) a.poll(); });
            return a;
        },
        pq -> pq.stream().sorted(cmp.reversed()).toList()   // ④ sắp giảm dần
    );
}
```

**Tiêu chí đạt:**
- ✅ Mỗi collector đều có **test song song** cho cùng kết quả với tuần tự (trừ `chiaLuanPhien` — giải thích vì sao không thể);
- ✅ Khai báo đúng `Characteristics`;
- ✅ `topK` với `k=10, n=1.000.000` phải nhanh hơn `sorted().limit(10)` — hãy **đo**.

---

### 🔴 Bài 5 (Khó) — Benchmark: loop vs stream vs parallelStream

**Yêu cầu:** Xây dựng bộ benchmark so sánh 3 cách với **4 kịch bản**:

```java
public class BenchmarkStreams {

    // Kịch bản A: tổng 1 phép cộng đơn giản (Q thấp)
    // Kịch bản B: kiểm tra số nguyên tố (Q cao)
    // Kịch bản C: map + filter + collect (hỗn hợp)
    // Kịch bản D: sorted (stateful)

    // Với mỗi kịch bản, đo n = 100 / 10.000 / 1.000.000 / 10.000.000

    public static void main(String[] args) {
        // 1. Warm-up JIT (>= 10.000 vòng)
        // 2. Đo bằng System.nanoTime()
        // 3. Lặp >= 20 lần, lấy TRUNG VỊ (không phải trung bình — tránh outlier GC)
        // 4. In bảng kết quả
    }
}
```

**Hướng dẫn:**
1. **Warm-up là bắt buộc** — JIT cần ~10.000 lần gọi để biên dịch sang mã máy;
2. **Chống dead-code elimination:** luôn *dùng* kết quả (cộng dồn vào một biến `static volatile`);
3. **Lấy trung vị** thay vì trung bình;
4. Gọi `System.gc()` giữa các lần đo (không đảm bảo nhưng giảm nhiễu);
5. In `Runtime.getRuntime().availableProcessors()` để biết ngưỡng song song.

**Gợi ý khung:**

```java
static volatile long blackhole;   // ⭐ chặn JIT xoá code

static long doTrungVi(Supplier<Long> tacVu, int soLan) {
    for (int i = 0; i < 10_000; i++) blackhole += tacVu.get();   // warm-up

    long[] mau = new long[soLan];
    for (int i = 0; i < soLan; i++) {
        long t0 = System.nanoTime();
        blackhole += tacVu.get();
        mau[i] = System.nanoTime() - t0;
    }
    Arrays.sort(mau);
    return mau[soLan / 2];
}
```

**Câu hỏi phải trả lời sau khi đo:**
1. Ở kích thước nào `parallelStream` bắt đầu **thắng** `stream`? Có giống với ngưỡng N×Q≥10.000 không?
2. Vì sao kịch bản B (Q cao) có ngưỡng thấp hơn kịch bản A (Q thấp)?
3. `sorted()` khi parallel có nhanh hơn không? Vì sao ít hơn kỳ vọng?
4. Với `n = 100`, parallel chậm hơn bao nhiêu lần? Chi phí đó đi đâu?

**Tiêu chí đạt:**
- ✅ Có bảng số liệu thật từ máy của bạn;
- ✅ Kết luận có **ngưỡng cụ thể** (con số), không phải "tuỳ trường hợp";
- ✅ (Nâng cao) làm lại bằng **JMH** và so sánh với kết quả thủ công.

---

### 🔴 Bài 6 (Khó) — Hệ thống báo cáo thống kê

**Yêu cầu:** Xây dựng service báo cáo hoàn chỉnh trên `List<SinhVien>` mở rộng (thêm trường `namHoc`, `gioiTinh`):

```java
public record SinhVienMoRong(
    String hoTen, int tuoi, String lop, String namHoc,
    String gioiTinh, double diemTrungBinh, List<String> monHoc, BigDecimal hocPhi) {}

public interface BaoCaoService {

    /** 1. Điểm TB theo (lớp, giới tính) — dùng khoá ghép record */
    Map<KhoaLopGioiTinh, Double> diemTheoLopVaGioiTinh(List<SinhVienMoRong> ds);

    /** 2. Nhóm 3 tầng: năm học → lớp → xếp loại → số lượng */
    Map<String, Map<String, Map<String, Long>>> thongKeBaTang(List<SinhVienMoRong> ds);

    /** 3. Top 3 sinh viên mỗi lớp theo điểm giảm dần */
    Map<String, List<SinhVienMoRong>> top3MoiLop(List<SinhVienMoRong> ds);

    /** 4. Môn học phổ biến nhất mỗi lớp (môn nhiều SV đăng ký nhất) */
    Map<String, String> monPhoBienNhatMoiLop(List<SinhVienMoRong> ds);

    /** 5. Báo cáo tổng hợp: tổng SV, điểm TB, tổng học phí, tỉ lệ giỏi — 1 LẦN DUYỆT */
    BaoCaoTongHop tongHop(List<SinhVienMoRong> ds);

    /** 6. Với mỗi lớp: số SV, điểm cao nhất, thấp nhất, danh sách môn học duy nhất */
    Map<String, ChiTietLop> chiTietTungLop(List<SinhVienMoRong> ds);
}

public record KhoaLopGioiTinh(String lop, String gioiTinh) {}
public record BaoCaoTongHop(long tongSV, double diemTB, BigDecimal tongHocPhi, double tiLeGioi) {}
public record ChiTietLop(long soLuong, double diemCaoNhat, double diemThapNhat, Set<String> monHoc) {}
```

**Hướng dẫn:**
1. `groupingBy(sv -> new KhoaLopGioiTinh(sv.lop(), sv.gioiTinh()), averagingDouble(...))`;
2. `groupingBy(namHoc, groupingBy(lop, groupingBy(xepLoai, counting())))`;
3. `groupingBy(lop, collectingAndThen(toList(), l -> l.stream().sorted(...).limit(3).toList()))`;
4. `groupingBy(lop, flatMapping(sv -> sv.monHoc().stream(), groupingBy(identity(), counting())))` rồi tìm max mỗi nhóm — cần thêm `collectingAndThen`;
5. ⚠️ **Bắt buộc 1 lần duyệt** → dùng `teeing` lồng nhau hoặc custom Collector;
6. Dùng `teeing` 2 tầng, hoặc custom Collector gom vào một record accumulator.

**Gợi ý bài 5 (teeing lồng):**

```java
public BaoCaoTongHop tongHop(List<SinhVienMoRong> ds) {
    return ds.stream().collect(
        teeing(
            teeing(counting(), averagingDouble(SinhVienMoRong::diemTrungBinh), Map::entry),
            teeing(reducing(BigDecimal.ZERO, SinhVienMoRong::hocPhi, BigDecimal::add),
                   filtering(sv -> sv.diemTrungBinh() >= 8.0, counting()),
                   Map::entry),
            (a, b) -> new BaoCaoTongHop(
                a.getKey(),
                a.getValue(),
                b.getKey(),
                a.getKey() == 0 ? 0 : (double) b.getValue() / a.getKey() * 100)
        ));
}
```

**Gợi ý bài 4 (môn phổ biến nhất):**

```java
public Map<String, String> monPhoBienNhatMoiLop(List<SinhVienMoRong> ds) {
    return ds.stream().collect(groupingBy(
        SinhVienMoRong::lop,
        collectingAndThen(
            flatMapping(sv -> sv.monHoc().stream(), groupingBy(identity(), counting())),
            demMon -> demMon.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("(không có)")
        )));
}
```

**Tiêu chí đạt:**
- ✅ Method 5 chỉ duyệt stream **một lần** (chứng minh bằng `peek` đếm);
- ✅ Không dùng `double` cho học phí;
- ✅ Mọi method đều xử lý được danh sách rỗng mà không ném exception;
- ✅ Viết unit test cho từng method bằng AssertJ;
- ✅ (Nâng cao) So sánh: viết lại method 2 bằng vòng lặp thủ công — đếm số dòng và tự đánh giá bản nào dễ bảo trì hơn.

---

## Phần 19 — Tóm Tắt & Chương Tiếp Theo

### 19.1 Mười điều quan trọng nhất — nếu chỉ nhớ được 10 điều

1. **Stream không phải collection.** Nó là *ống dẫn*, không lưu dữ liệu, dùng **một lần**, không sửa nguồn.
2. **Pipeline = nguồn + 0..n toán tử trung gian + 1 toán tử kết thúc.** Nhận biết bằng **kiểu trả về**: trả `Stream` → trung gian (lười); trả thứ khác → kết thúc (chăm).
3. **Lazy evaluation là trái tim.** Không có terminal op = **không chạy gì cả**.
4. **Dữ liệu chảy theo chiều DỌC.** Mỗi phần tử đi hết pipeline rồi mới tới phần tử sau → không có collection trung gian, chỉ duyệt nguồn 1 lần, cho phép dừng sớm.
5. **Lọc sớm, sắp muộn.** `filter` đặt gần nguồn nhất có thể; `sorted`/`distinct` là **rào chắn** tốn `O(n)` RAM.
6. **`flatMap` khi thấy cấu trúc lồng.** Nhìn thấy `List<List<T>>` hoặc `Stream<Stream<T>>` → 99% cần `flatMap`.
7. **`Collectors` là bộ công cụ.** `groupingBy` + downstream (`counting`, `mapping`, `filtering`, `flatMapping`, `teeing`) giải quyết 90% bài toán báo cáo.
8. **Không side effect.** Hàm trong stream phải **thuần khiết**. Không ghi vào biến ngoài, không mutation, không I/O trong toán tử trung gian.
9. **`parallel()` là dao hai lưỡi.** Chỉ dùng khi: dữ liệu lớn + CPU-bound + nguồn chia tốt + không state chung + **đã đo đạc**. Không dùng cho I/O, không dùng trong HTTP request.
10. **Database làm việc của database.** Lọc/sắp/phân trang/đếm → SQL. Stream chỉ để **biến đổi dữ liệu đã lấy về** (chủ yếu Entity → DTO).

### 19.2 Bản đồ kiến thức đã đi qua

```text
                         STREAMS API
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
    TRIẾT LÝ              CƠ CHẾ                 CÔNG CỤ
        │                     │                     │
  declarative           lazy evaluation      intermediate ops
  vs imperative         vertical flow         (map/filter/flatMap...)
  internal iteration    short-circuit         terminal ops
  pure function         loop fusion            (collect/reduce/find...)
  immutability          Sink chaining         Collectors
        │               Spliterator            (groupingBy/teeing...)
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
              HIỆU NĂNG            ỨNG DỤNG THỰC TẾ
                    │                    │
            stateless vs stateful   Entity → DTO
            primitive streams       báo cáo/thống kê
            parallel + Fork/Join    Optional handling
            N×Q ≥ 10.000           DB vs Stream
```

### 19.3 Liên kết với các chương trước

| Kiến thức từ chương trước | Xuất hiện ở đâu trong chương này |
|---------------------------|----------------------------------|
| **Chương 1 — Interface, default method** | `Collection.stream()` là default method → thêm Streams mà không phá code cũ |
| **Chương 1 — Polymorphism** | `Sink` chaining, `Collector` như một chiến lược cắm vào |
| **Chương 2 — `List`, `Set`, `Map`** | Nguồn stream, `Collectors.toCollection(TreeSet::new)` |
| **Chương 2 — `equals`/`hashCode`** | `distinct()`, khoá `groupingBy`/`toMap` |
| **Chương 2 — `Comparator`** | `sorted(comparing(..).thenComparing(..))` |
| **Chương 3 — Generics, PECS** | Đọc chữ ký `map(Function<? super T, ? extends R>)` |
| **Chương 3 — Type erasure** | `sorted()` không ràng buộc `Comparable` → `ClassCastException` lúc chạy |
| **Chương 3 — Lambda, functional interface** | Mọi toán tử đều nhận `Function`/`Predicate`/`Consumer`/`Supplier` |
| **Chương 3 — Method reference** | `SinhVien::hoTen`, `ArrayList::new`, `String[]::new` |
| **Chương 3 — `Optional`** | `findFirst`, `min`, `max`, `reduce`, `Optional::stream` |
| **Chương 3 — Composition** | `Predicate.and/or/negate`, `Comparator.thenComparing` |

### 19.4 Chương tiếp theo học gì?

**Chương 5 — Exception Handling** sẽ trả lời những câu hỏi mà chương này cố tình để ngỏ:

- Vì sao lambda **không throw được checked exception**? Cơ chế nào chặn nó?
- Làm sao xử lý exception trong stream một cách **thanh lịch** (không phải try-catch lồng trong lambda)?
- `UncheckedIOException`, `CompletionException`, `RuntimeException` — dùng cái nào khi bọc?
- Mẫu `Either<Error, Value>` / `Result<T>` — cách functional programming xử lý lỗi mà không dùng exception;
- `@RestControllerAdvice` và chiến lược xử lý lỗi tập trung trong Spring Boot.

**Các chương liên quan xa hơn:**
- **Chương 7 — Concurrency:** đào sâu `ForkJoinPool`, `CompletableFuture`, Virtual Threads — nền tảng thật sự của parallel stream;
- **Chương 9 — Java 8+ Features:** `Optional` nâng cao, `LocalDate` API, `var`, records, sealed classes, pattern matching;
- **Tầng 3 — Spring Data JPA:** `@Query`, `Specification`, `Pageable` — nơi bạn quyết định "DB làm hay Stream làm";
- **Tầng 10 — Reactive Programming (WebFlux):** `Flux`/`Mono` là "Streams + bất đồng bộ + backpressure". Mọi thứ bạn học ở đây (lazy, pipeline, operator, không side effect) đều **áp dụng nguyên vẹn**.

### 19.5 So sánh trước để hình dung Chương WebFlux

| | Java Streams | Reactive Streams (`Flux`/`Mono`) |
|---|-------------|----------------------------------|
| Mô hình | **Pull** — consumer kéo | **Push** — producer đẩy |
| Lười? | ✅ Có | ✅ Có |
| Dùng lại được? | ❌ Một lần | ✅ Nhiều lần (subscribe lại) |
| Bất đồng bộ? | ❌ Không (parallel ≠ async) | ✅ Có |
| Backpressure? | ❌ Không | ✅ Có |
| Xử lý lỗi | Exception thường | `onErrorResume`, `onErrorReturn` |
| Toán tử | `map`, `filter`, `flatMap`... | `map`, `filter`, `flatMap`... **cùng tên!** |
| Dùng cho | Dữ liệu **trong bộ nhớ** | Dữ liệu **theo thời gian** (network, event) |

> 🎯 **Chốt chương:** Bạn vừa học không chỉ một API, mà một **cách tư duy**: mô tả *cái gì cần*, để thư viện lo *làm thế nào*; ưu tiên **bất biến** và **hàm thuần khiết**; để việc tính toán **lười** đến phút cuối. Tư duy này sẽ theo bạn suốt từ Streams → Optional → CompletableFuture → Reactive Streams → và cả những ngôn ngữ khác ngoài Java.

---

## 📎 Phụ Lục A — Bảng Tra Nhanh Collectors

### A.1 Gom vào Collection

| Collector | Trả về | Ghi chú |
|-----------|--------|---------|
| `toList()` | `List<T>` | Thực tế `ArrayList`, sửa được |
| `toSet()` | `Set<T>` | Thực tế `HashSet`, không thứ tự |
| `toUnmodifiableList()` | `List<T>` | Java 10+, bất biến, **cấm null** |
| `toUnmodifiableSet()` | `Set<T>` | Java 10+ |
| `toCollection(sup)` | `C extends Collection` | ⭐ Chỉ định chính xác loại |
| `toMap(k, v)` | `Map<K,V>` | ⚠️ Ném lỗi nếu khoá trùng |
| `toMap(k, v, merge)` | `Map<K,V>` | ⭐ Luôn dùng bản này |
| `toMap(k, v, merge, sup)` | `M extends Map` | Chỉ định loại Map |
| `toUnmodifiableMap(k, v)` | `Map<K,V>` | Java 10+ |
| `toConcurrentMap(...)` | `ConcurrentMap` | Cho parallel |

### A.2 Nhóm & Chia

| Collector | Trả về |
|-----------|--------|
| `groupingBy(f)` | `Map<K, List<T>>` |
| `groupingBy(f, down)` | `Map<K, D>` |
| `groupingBy(f, mapSup, down)` | `M extends Map<K, D>` |
| `groupingByConcurrent(...)` | `ConcurrentMap<K, D>` |
| `partitioningBy(p)` | `Map<Boolean, List<T>>` — ⭐ luôn có 2 khoá |
| `partitioningBy(p, down)` | `Map<Boolean, D>` |

### A.3 Chuỗi

| Collector | Trả về |
|-----------|--------|
| `joining()` | `String` |
| `joining(delim)` | `String` |
| `joining(delim, prefix, suffix)` | `String` |

### A.4 Thống kê

| Collector | Trả về |
|-----------|--------|
| `counting()` | `Long` |
| `summingInt/Long/Double(f)` | `Integer`/`Long`/`Double` |
| `averagingInt/Long/Double(f)` | `Double` |
| `summarizingInt/Long/Double(f)` | `XxxSummaryStatistics` |
| `minBy(cmp)` / `maxBy(cmp)` | `Optional<T>` |
| `reducing(op)` | `Optional<T>` |
| `reducing(id, op)` | `T` |
| `reducing(id, mapper, op)` | `U` |

### A.5 Biến đổi & Kết hợp

| Collector | Java | Công dụng |
|-----------|------|-----------|
| `mapping(f, down)` | 8 | Biến đổi trước khi gom |
| `filtering(p, down)` | 9 | Lọc trước khi gom (giữ nhóm rỗng) |
| `flatMapping(f, down)` | 9 | Làm phẳng trước khi gom |
| `collectingAndThen(down, fin)` | 8 | Hậu xử lý kết quả |
| `teeing(c1, c2, merger)` | 12 | 2 collector, 1 lần duyệt |

---

## 📎 Phụ Lục B — Bảng Tra Nhanh Operations

### B.1 Cú pháp thường dùng — copy & sửa

```java
import static java.util.stream.Collectors.*;
import static java.util.Comparator.*;
import static java.util.function.Function.identity;

// LỌC + MAP + GOM
list.stream().filter(p).map(f).toList();

// LỌC NHIỀU ĐIỀU KIỆN
list.stream().filter(p1.and(p2).and(p3.negate())).toList();

// SẮP XẾP NHIỀU TIÊU CHÍ
list.stream().sorted(comparing(A::x).thenComparing(comparingDouble(A::y).reversed())).toList();

// PHÂN TRANG (chỉ với dữ liệu trong RAM!)
list.stream().skip((long) page * size).limit(size).toList();

// LÀM PHẲNG
list.stream().flatMap(x -> x.con().stream()).distinct().sorted().toList();

// NHÓM + ĐẾM
list.stream().collect(groupingBy(A::khoa, counting()));

// NHÓM + TỔNG
list.stream().collect(groupingBy(A::khoa, summingInt(A::gia)));

// NHÓM + LẤY 1 TRƯỜNG
list.stream().collect(groupingBy(A::khoa, mapping(A::ten, toList())));

// NHÓM + MAX MỖI NHÓM (bỏ Optional)
list.stream().collect(groupingBy(A::khoa,
    collectingAndThen(maxBy(comparing(A::diem)), Optional::get)));

// NHÓM 2 TẦNG
list.stream().collect(groupingBy(A::khoa1, groupingBy(A::khoa2)));

// CHIA ĐÔI
list.stream().collect(partitioningBy(p));

// INDEX HOÁ
list.stream().collect(toMap(A::id, identity()));

// NỐI CHUỖI
list.stream().map(A::ten).collect(joining(", ", "[", "]"));

// TỔNG TIỀN (BigDecimal)
list.stream().map(A::gia).reduce(BigDecimal.ZERO, BigDecimal::add);

// THỐNG KÊ SỐ
list.stream().mapToInt(A::soLuong).summaryStatistics();

// TÌM ĐẦU TIÊN
list.stream().filter(p).findFirst().orElseThrow(() -> new NotFoundException("..."));

// KIỂM TRA
list.stream().anyMatch(p);
!list.isEmpty() && list.stream().allMatch(p);   // ⚠️ nhớ check rỗng

// KHỬ TRÙNG THEO 1 TRƯỜNG
new ArrayList<>(list.stream().collect(toMap(A::khoa, identity(), (a, b) -> a)).values());

// TOP N
list.stream().sorted(comparing(A::diem).reversed()).limit(n).toList();

// TOP N MỖI NHÓM
list.stream().collect(groupingBy(A::khoa, collectingAndThen(toList(),
    l -> l.stream().sorted(comparing(A::diem).reversed()).limit(3).toList())));

// ĐẢO NGƯỢC MAP
map.entrySet().stream().collect(toMap(Map.Entry::getValue, Map.Entry::getKey, (a, b) -> a));

// SẮP MAP THEO GIÁ TRỊ
map.entrySet().stream()
   .sorted(Map.Entry.comparingByValue(reverseOrder()))
   .collect(toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new));

// ĐẾM TẦN SUẤT TỪ
Arrays.stream(text.toLowerCase().split("\\W+"))
      .filter(s -> !s.isBlank())
      .collect(groupingBy(identity(), counting()));

// ENTITY → DTO (Spring Boot)
repository.findAll().stream().map(mapper::toDto).toList();
```

### B.2 Bảng "nếu — thì"

| Nếu bạn thấy... | Thì dùng... |
|-----------------|-------------|
| `List<List<T>>` | `flatMap` |
| `Stream<Optional<T>>` | `flatMap(Optional::stream)` |
| `Map<K, List<T>>` cần | `groupingBy` |
| Điều kiện `true`/`false` | `partitioningBy` |
| `Duplicate key` exception | `toMap` 3 tham số |
| `IllegalStateException: stream already operated` | Tạo stream mới / `Supplier` |
| Kết quả rỗng bất ngờ | Kiểm tra có terminal op chưa |
| `ClassCastException` ở `sorted()` | Truyền `Comparator` |
| Code chậm bất thường | `filter` trước `sorted`/`map` đắt |
| `Stream<Integer>` với phép toán số | `mapToInt` |
| Cần 2 kết quả từ 1 stream | `teeing` |
| Cần bỏ `Optional` sau `maxBy` | `collectingAndThen(..., Optional::get)` |
| `UnsupportedOperationException` khi `add` | Dùng `collect(toList())` thay `toList()` |
| `LazyInitializationException` | Terminal op phải ở trong `@Transactional` |

---

## 📎 Phụ Lục C — Thuật Ngữ Việt–Anh

| Tiếng Việt | English | Ghi chú |
|-----------|---------|---------|
| Luồng dữ liệu | Stream | ⚠️ Không liên quan `InputStream` |
| Đường ống | Pipeline | Chuỗi toán tử |
| Nguồn | Source | Collection, mảng, file... |
| Toán tử trung gian | Intermediate operation | Trả `Stream`, lười |
| Toán tử kết thúc | Terminal operation | Kích hoạt pipeline |
| Tính toán lười | Lazy evaluation | Trì hoãn tới phút cuối |
| Tính toán chăm | Eager evaluation | Tính ngay |
| Dừng sớm | Short-circuiting | `limit`, `findFirst`, `anyMatch` |
| Hợp nhất vòng lặp | Loop fusion | Nhiều toán tử, 1 lần duyệt |
| Xử lý theo chiều dọc | Vertical processing | Từng phần tử đi hết pipeline |
| Duyệt nội bộ | Internal iteration | Thư viện điều khiển |
| Duyệt ngoại bộ | External iteration | Bạn điều khiển (`for`) |
| Khai báo | Declarative | Nói *cái gì* |
| Mệnh lệnh | Imperative | Nói *làm thế nào* |
| Không trạng thái | Stateless | `map`, `filter` |
| Có trạng thái | Stateful | `sorted`, `distinct` |
| Rào chắn | Barrier | `sorted` — phải chờ hết nguồn |
| Bộ gom | Collector | `Collectors.toList()`... |
| Bộ gom cấp dưới | Downstream collector | Tham số 2 của `groupingBy` |
| Bộ tích luỹ | Accumulator | Hàm ② của Collector |
| Bộ kết hợp | Combiner | Hàm ③ — dùng khi parallel |
| Bộ hoàn thiện | Finisher | Hàm ④ |
| Phần tử đơn vị | Identity | Giá trị khởi tạo của `reduce` |
| Tính kết hợp | Associativity | `(a⊕b)⊕c = a⊕(b⊕c)` |
| Thu gọn | Reduce / Fold | Nhiều → một |
| Làm phẳng | Flatten | `flatMap` |
| Nhóm theo | Group by | `groupingBy` |
| Chia đôi | Partition | `partitioningBy` |
| Hàm thuần khiết | Pure function | Không side effect |
| Tác dụng phụ | Side effect | Thay đổi state bên ngoài |
| Không can thiệp | Non-interfering | Không sửa nguồn khi đang stream |
| Bất biến | Immutable | Không đổi sau khi tạo |
| Đóng hộp / Mở hộp | Boxing / Unboxing | `int` ⟷ `Integer` |
| Luồng nguyên thuỷ | Primitive stream | `IntStream`... |
| Song song | Parallel | Nhiều thread |
| Tuần tự | Sequential | Một thread |
| Bộ chia | Spliterator | Iterator + `trySplit()` |
| Đánh cắp công việc | Work stealing | Fork/Join |
| Bể luồng dùng chung | Common pool | `ForkJoinPool.commonPool()` |
| Tranh chấp dữ liệu | Race condition | Nhiều thread ghi cùng lúc |
| Trạng thái dùng chung | Shared mutable state | Nguồn gốc bug parallel |
| Vô hạn | Infinite | `Stream.iterate`, `generate` |
| Chân lý rỗng | Vacuous truth | `allMatch` trên stream rỗng → `true` |
| Phễu | Sink | Cơ chế nội bộ nối toán tử |
| Khoá ghép | Composite key | `record` làm khoá `groupingBy` |
