# CHƯƠNG 5 — EXCEPTION HANDLING: DEEP DIVE

> **Dành cho ai?** Người đã học xong Chương 1 (OOP), Chương 2 (Collections), Chương 3 (Generics & Lambda) và Chương 4 (Streams). Bạn đã từng thấy màn hình đỏ lòm `Exception in thread "main" java.lang.NullPointerException`, đã từng bọc code trong `try { ... } catch (Exception e) { e.printStackTrace(); }` cho "nó hết đỏ", và đã từng ngồi 3 tiếng dò một lỗi production mà log chỉ ghi vỏn vẹn một dòng `null`.
>
> **Cam kết của chương này:** Sau khi đọc xong, bạn sẽ ngừng coi exception là "thứ phiền phức compiler bắt phải viết". Bạn sẽ thấy exception là **cơ chế truyền tin về thất bại** — một kênh liên lạc song song với giá trị trả về, được thiết kế để **không thể bị bỏ qua trong im lặng**. Bạn sẽ đọc được mọi stack trace nhiều tầng `Caused by:`, biết chính xác `finally` chạy lúc nào và khi nào **không** chạy, hiểu vì sao `try-with-resources` không chỉ ngắn hơn mà còn **đúng hơn** try-finally, thiết kế được cây exception cho domain của mình, và dựng được tầng xử lý lỗi tập trung trong Spring Boot trả về JSON nhất quán mà **không rò rỉ một dòng stack trace nào ra ngoài Internet**.
>
> **Kim chỉ nam xuyên suốt chương:** *Fail fast, fail loud* — thất bại sớm nhất có thể, và ồn ào nhất có thể. Một chương trình **crash to** ở dòng gây lỗi tốt hơn gấp trăm lần một chương trình **âm thầm ghi sai dữ liệu** suốt 6 tháng.

---

## 🎯 Mục Tiêu Học

Sau chương này bạn sẽ:

1. Giải thích được **vì sao Java chọn exception thay vì error code** — và 4 nỗi đau cụ thể mà error code gây ra
2. Vẽ lại được **cây phân cấp `Throwable`** từ trí nhớ: `Throwable → Error / Exception → RuntimeException`, kèm ví dụ ở từng nhánh
3. Phân biệt dứt khoát **checked vs unchecked**, hiểu **luật handle-or-declare** của compiler, và có **cây quyết định** để chọn loại khi tự thiết kế exception
4. Nắm chắc **luồng thực thi try / catch / finally** trong mọi kịch bản — kể cả các ca hiểm: `return` trong `finally`, exception trong `finally`, `System.exit()` trong `try`
5. Hiểu **thứ tự bắt của nhiều khối `catch`** (con trước cha — nếu không sẽ **lỗi biên dịch**) và **multi-catch** `catch (A | B e)`
6. Dùng thành thạo **try-with-resources**: `AutoCloseable`, nhiều tài nguyên, thứ tự đóng **LIFO**, và **suppressed exceptions**
7. Biết khi nào dùng **`throws`** (đẩy lên trên) và khi nào **`catch`** tại chỗ — có tiêu chí rõ ràng, không cảm tính
8. Thiết kế được **custom exception** cho domain: 4 constructor chuẩn, field nghiệp vụ, cây kế thừa, và cân nhắc hiệu năng (`fillInStackTrace`)
9. Thành thạo **exception chaining**: `new MyException(msg, cause)`, `getCause()`, `initCause()`, đọc `Caused by:` và tìm **root cause**
10. Thuộc lòng **15 lỗi kinh điển** và **anti-pattern** — đặc biệt là *nuốt exception*, *catch `Exception`*, *dùng exception làm control flow*
11. Dựng được **tầng xử lý lỗi tập trung trong Spring Boot**: `@RestControllerAdvice`, `ErrorResponse` DTO, `ProblemDetail` (RFC 7807), mapping HTTP status, và **bảo mật thông tin lỗi**
12. Hiểu các chủ đề nâng cao: **`getSuppressed()`**, **`StackWalker`** (Java 9+), **sealed exception hierarchy** (Java 17+), **helpful NPE** (Java 14+), exception trong **lambda/stream**, và **retry với exponential backoff**
13. Viết được **unit test cho cả đường thành công lẫn đường thất bại** bằng `assertThrows` / AssertJ

**Thời gian đọc kỹ:** 5–7 giờ. **Thời gian làm bài tập:** 8–12 giờ.

---

## 📚 Mục Lục

| Phần | Nội dung |
|------|----------|
| [Phần 0](#phần-0--tại-sao-cần-exception-handling) | Tại sao cần Exception Handling? |
| [Phần 1](#phần-1--cây-phân-cấp-throwable) | Cây phân cấp `Throwable` |
| [Phần 2](#phần-2--checked-vs-unchecked-exceptions) | Checked vs Unchecked Exceptions |
| [Phần 3](#phần-3--try--catch--finally) | try / catch / finally |
| [Phần 4](#phần-4--try-with-resources) | try-with-resources |
| [Phần 5](#phần-5--từ-khoá-throw-và-throws) | Từ khoá `throw` và `throws` |
| [Phần 6](#phần-6--custom-exceptions) | Custom Exceptions |
| [Phần 7](#phần-7--exception-chaining--root-cause) | Exception Chaining & Root Cause |
| [Phần 8](#phần-8--quản-lý-tài-nguyên-chuyên-sâu) | Quản lý tài nguyên chuyên sâu |
| [Phần 9](#phần-9--15-lỗi-exception-kinh-điển) | 15 lỗi Exception kinh điển |
| [Phần 10](#phần-10--best-practices--anti-patterns) | Best Practices & Anti-patterns |
| [Phần 11](#phần-11--exception-handling-trong-spring-boot) | Exception Handling trong Spring Boot |
| [Phần 12](#phần-12--chủ-đề-nâng-cao) | Chủ đề nâng cao |
| [Phần 13](#phần-13--kiểm-thử-đường-thất-bại) | Kiểm thử đường thất bại |
| [Phần 14](#phần-14--bài-tập-thực-hành) | Bài tập thực hành (6 bài) |
| [Phần 15](#phần-15--tóm-tắt--chương-tiếp-theo) | Tóm tắt & chương tiếp theo |
| [Phụ lục A](#📎-phụ-lục-a--bảng-tra-nhanh-exception-jdk) | Bảng tra nhanh Exception JDK |
| [Phụ lục B](#📎-phụ-lục-b--checklist-review-code) | Checklist review code |
| [Phụ lục C](#📎-phụ-lục-c--thuật-ngữ-việt--anh) | Thuật ngữ Việt–Anh |

---

## 📦 Bộ Mã Nguồn Dùng Chung Cả Chương

Cả chương dùng chung một domain nhỏ: **hệ thống đặt hàng**. Hãy copy vào IDE để chạy thử song song khi đọc.

```java
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** Khách hàng */
public record KhachHang(Long id, String email, BigDecimal soDu) {}

/** Sản phẩm — dùng BigDecimal cho tiền, KHÔNG dùng double */
public record SanPham(Long id, String ten, BigDecimal gia, int tonKho) {}

/** Một dòng hàng trong đơn */
public record DongHang(SanPham sanPham, int soLuong) {
    public BigDecimal thanhTien() {
        return sanPham.gia().multiply(BigDecimal.valueOf(soLuong));
    }
}

/** Đơn hàng */
public record DonHang(
        Long id,
        Long khachHangId,
        List<DongHang> cacDong,
        Instant thoiDiemTao
) {
    public BigDecimal tongTien() {
        return cacDong.stream()
                .map(DongHang::thanhTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
```

Ba "cửa ải" mà một đơn hàng phải vượt qua — cũng là ba nơi có thể **thất bại**, và ta sẽ dùng đi dùng lại xuyên suốt chương:

```
1. Tìm khách hàng   → có thể KHÔNG TỒN TẠI      (lỗi nghiệp vụ)
2. Kiểm tra tồn kho → có thể KHÔNG ĐỦ HÀNG       (lỗi nghiệp vụ)
3. Trừ tiền         → có thể KHÔNG ĐỦ SỐ DƯ,     (lỗi nghiệp vụ)
                      hoặc CỔNG THANH TOÁN CHẾT  (lỗi hạ tầng)
```

---

## Phần 0 — Tại Sao Cần Exception Handling?

### 0.1 Một buổi chiều thứ Sáu có thật

Bạn viết hàm chuyển tiền. Không có exception, bạn làm theo cách của ngôn ngữ C: **trả về mã lỗi**.

```java
// ❌ Phong cách "error code" — kiểu C, KHÔNG nên dùng trong Java
public class ViDien {

    public static final int OK              = 0;
    public static final int KHONG_TIM_THAY  = -1;
    public static final int KHONG_DU_TIEN   = -2;
    public static final int LOI_HE_THONG    = -3;

    /** Trả về mã lỗi thay vì ném exception */
    public int chuyenTien(Long tuId, Long denId, BigDecimal soTien) {
        KhachHang nguoiGui = timKhachHang(tuId);
        if (nguoiGui == null) return KHONG_TIM_THAY;

        KhachHang nguoiNhan = timKhachHang(denId);
        if (nguoiNhan == null) return KHONG_TIM_THAY;

        if (nguoiGui.soDu().compareTo(soTien) < 0) return KHONG_DU_TIEN;

        int ketQua = truTien(tuId, soTien);
        if (ketQua != OK) return ketQua;

        return congTien(denId, soTien);   // giả sử cũng trả mã lỗi
    }
}
```

Nhìn qua có vẻ ổn. Rồi một lập trình viên khác gọi hàm này:

```java
// ❌ Thảm hoạ: quên kiểm tra mã lỗi
viDien.chuyenTien(1L, 2L, new BigDecimal("1000000"));
System.out.println("Chuyển tiền thành công!");   // In ra kể cả khi... thất bại
```

Compiler **im lặng hoàn toàn**. Không cảnh báo, không lỗi. Chương trình chạy mượt. Khách hàng nhận email "Chuyển tiền thành công". Tiền thì không đi đâu cả. Ba tuần sau kế toán mới phát hiện.

> ⚠️ Đây chính là **nỗi đau số 1**: giá trị trả về **có thể bị bỏ qua trong im lặng**. Trong Java, `viDien.chuyenTien(...)` đứng một mình là một câu lệnh hợp lệ.

### 0.2 Bốn nỗi đau của mô hình "mã lỗi"

| # | Nỗi đau | Mô tả | Hậu quả thực tế |
|---|---------|-------|-----------------|
| 1 | **Dễ quên kiểm tra** | Không ai bắt buộc bạn đọc giá trị trả về | Lỗi bị nuốt, dữ liệu sai âm thầm |
| 2 | **Chiếm mất kênh trả về** | Hàm phải trả `int` mã lỗi thay vì trả kết quả thật | Phải dùng biến out, con trỏ, hoặc bọc thêm lớp |
| 3 | **Trộn lẫn logic chính và logic lỗi** | Cứ 1 dòng nghiệp vụ lại 2 dòng `if (rc != OK) return rc;` | Đọc code như đi trong mê cung |
| 4 | **Mất thông tin ngữ cảnh** | `-2` là "không đủ tiền" — nhưng thiếu bao nhiêu? tài khoản nào? lúc nào? | Debug production gần như bất khả thi |

Hãy nhìn kỹ nỗi đau số 3 — nó phá hoại khả năng đọc code kinh khủng nhất:

```java
// ❌ Tỉ lệ "logic thật" trên tổng số dòng: khoảng 30%
int rc;
rc = buoc1(); if (rc != OK) return rc;
rc = buoc2(); if (rc != OK) return rc;
rc = buoc3(); if (rc != OK) return rc;
rc = buoc4(); if (rc != OK) return rc;
return OK;
```

```java
// ✅ Với exception: logic chính sạch bong, xử lý lỗi gom một chỗ
buoc1();
buoc2();
buoc3();
buoc4();
// Nếu bất kỳ bước nào hỏng → exception tự động bay lên trên, các bước sau KHÔNG chạy
```

### 0.3 Exception ra đời để làm gì?

**Định nghĩa cốt lõi:**

> **Exception** là một **đối tượng** mô tả một **sự kiện bất thường** làm gián đoạn luồng thực thi bình thường của chương trình. Khi được ném ra (`throw`), nó **bẻ gãy luồng điều khiển** và **đi ngược lên stack** cho tới khi gặp một khối `catch` phù hợp — hoặc làm chết thread nếu không ai bắt.

Exception giải quyết đúng 4 nỗi đau trên:

| Nỗi đau | Cách exception giải quyết |
|---------|---------------------------|
| Dễ quên kiểm tra | **Không thể bỏ qua** — không bắt thì chương trình dừng, log đỏ rực |
| Chiếm kênh trả về | Exception đi **kênh riêng**, `return` vẫn dành cho kết quả thật |
| Trộn lẫn logic | Logic chính tuyến tính, khối `catch` gom lỗi về một chỗ |
| Mất ngữ cảnh | Exception là **object**: mang message, cause, stack trace, field nghiệp vụ |

Viết lại `chuyenTien` bằng exception:

```java
// ✅ Phong cách Java: ném exception mang đầy đủ ngữ cảnh
public void chuyenTien(Long tuId, Long denId, BigDecimal soTien) {
    KhachHang nguoiGui  = timKhachHang(tuId)
            .orElseThrow(() -> new KhachHangKhongTonTaiException(tuId));
    KhachHang nguoiNhan = timKhachHang(denId)
            .orElseThrow(() -> new KhachHangKhongTonTaiException(denId));

    if (nguoiGui.soDu().compareTo(soTien) < 0) {
        // Mang theo ĐẦY ĐỦ ngữ cảnh: ai, cần bao nhiêu, có bao nhiêu
        throw new SoDuKhongDuException(tuId, soTien, nguoiGui.soDu());
    }

    truTien(tuId, soTien);
    congTien(denId, soTien);
}
```

**Giải thích từng điểm:**

- Kiểu trả về là `void` — vì hàm này **không có kết quả**, chỉ có tác dụng phụ. Kênh `return` không còn bị mã lỗi chiếm dụng.
- `orElseThrow(...)` — ép người gọi đối mặt với trường hợp "không tìm thấy" ngay tại chỗ, không cho `null` lọt xuống dưới.
- `SoDuKhongDuException(tuId, soTien, nguoiGui.soDu())` — exception mang **3 mẩu dữ liệu nghiệp vụ**. Khi đọc log, bạn biết ngay khách 1042 muốn chuyển 1.000.000 nhưng chỉ có 250.000.
- Nếu `truTien` hỏng, `congTien` **chắc chắn không chạy** — luồng bị bẻ gãy tức thì. Với mã lỗi, nếu quên `if`, `congTien` vẫn chạy và bạn vừa **in tiền ra từ hư không**.

### 0.4 Triết lý "Fail fast, fail loud"

Có hai trường phái đối lập khi gặp tình huống bất thường:

```
┌──────────────────────────────────────────────────────────────┐
│  FAIL SILENTLY (thất bại thầm lặng)  — ❌ CỰC KỲ NGUY HIỂM   │
│                                                              │
│  "Có lỗi à? Trả null / trả 0 / trả list rỗng cho xong,       │
│   chương trình vẫn chạy tiếp, khách hàng không thấy gì."     │
│                                                              │
│  → Lỗi lan xa khỏi nguyên nhân gốc.                          │
│  → Phát hiện sau 6 tháng, với 2 triệu bản ghi đã sai.        │
│  → Không có stack trace. Không biết bắt đầu từ đâu.          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  FAIL FAST, FAIL LOUD (thất bại sớm và ồn ào)  — ✅ ĐÚNG     │
│                                                              │
│  "Điều kiện không thoả? Ném exception NGAY tại dòng phát      │
│   hiện, mang theo mọi thông tin cần để chẩn đoán."           │
│                                                              │
│  → Stack trace chỉ thẳng vào dòng gây lỗi.                    │
│  → Phát hiện ngay lúc dev/test, không kịp lên production.     │
│  → Dữ liệu chưa kịp hỏng.                                     │
└──────────────────────────────────────────────────────────────┘
```

Ví dụ đối chiếu trực tiếp:

```java
// ❌ FAIL SILENTLY — quả bom hẹn giờ
public BigDecimal tinhGiamGia(DonHang donHang, String maGiamGia) {
    MaGiamGia ma = timMa(maGiamGia);
    if (ma == null) {
        return BigDecimal.ZERO;   // ⚠️ Mã sai → âm thầm giảm 0đ
    }
    return donHang.tongTien().multiply(ma.tyLe());
}
```

Điều gì xảy ra? Khách nhập mã `"SALE50"` nhưng backend đọc nhầm thành `"SALE5O"` (chữ O thay số 0). Hệ thống **không báo lỗi**, chỉ lặng lẽ giảm 0đ. Khách gọi tổng đài. Bộ phận CSKH không tái hiện được. Không có log nào cả.

```java
// ✅ FAIL FAST — sai là biết ngay
public BigDecimal tinhGiamGia(DonHang donHang, String maGiamGia) {
    MaGiamGia ma = timMa(maGiamGia)
            .orElseThrow(() -> new MaGiamGiaKhongHopLeException(maGiamGia));
    if (ma.daHetHan()) {
        throw new MaGiamGiaHetHanException(maGiamGia, ma.ngayHetHan());
    }
    return donHang.tongTien().multiply(ma.tyLe());
}
```

Bây giờ hệ thống trả về HTTP 400 với thông điệp `"Mã giảm giá không hợp lệ: SALE5O"`. Khách nhìn thấy, tự sửa. Log có bản ghi. Vấn đề được giải quyết trong 5 giây thay vì 5 ngày.

> 💡 **Nguyên tắc vàng:** Khoảng cách giữa **nơi lỗi phát sinh** và **nơi lỗi bị phát hiện** tỉ lệ thuận với chi phí sửa lỗi. Exception là công cụ ép hai điểm đó **trùng nhau**.

### 0.5 Exception propagation — hành trình ngược lên stack

Đây là cơ chế cốt lõi. Hãy hình dung **call stack** (ngăn xếp lời gọi) như một chồng đĩa:

```java
public class MoPhongPropagation {

    public static void main(String[] args) {          // tầng 1
        System.out.println("A. main bắt đầu");
        try {
            tangGoiThuNhat();
            System.out.println("B. dòng này KHÔNG in ra");
        } catch (IllegalStateException e) {
            System.out.println("C. main bắt được: " + e.getMessage());
        }
        System.out.println("D. main kết thúc bình thường");
    }

    static void tangGoiThuNhat() {                    // tầng 2
        System.out.println("E. tầng 1 bắt đầu");
        tangGoiThuHai();
        System.out.println("F. dòng này KHÔNG in ra");
    }

    static void tangGoiThuHai() {                     // tầng 3
        System.out.println("G. tầng 2 bắt đầu");
        tangGoiThuBa();
        System.out.println("H. dòng này KHÔNG in ra");
    }

    static void tangGoiThuBa() {                      // tầng 4 — nơi nổ
        System.out.println("I. tầng 3 chuẩn bị ném");
        throw new IllegalStateException("Nổ ở tầng sâu nhất");
    }
}
```

**Output:**

```
A. main bắt đầu
E. tầng 1 bắt đầu
G. tầng 2 bắt đầu
I. tầng 3 chuẩn bị ném
C. main bắt được: Nổ ở tầng sâu nhất
D. main kết thúc bình thường
```

**Sơ đồ hành trình:**

```
     ĐI XUỐNG (gọi hàm)                 ĐI LÊN (exception lan truyền)
     ─────────────────                  ────────────────────────────

  main()                                 main()  ← 🎯 catch bắt được, DỪNG tại đây
    │                                       ▲
    │ gọi                                   │ không có catch phù hợp → tiếp tục lên
    ▼                                       │
  tangGoiThuNhat()                       tangGoiThuNhat()
    │                                       ▲
    │ gọi                                   │ không có catch → lên tiếp
    ▼                                       │
  tangGoiThuHai()                        tangGoiThuHai()
    │                                       ▲
    │ gọi                                   │ không có catch → lên tiếp
    ▼                                       │
  tangGoiThuBa()  ─── throw ──────────►  tangGoiThuBa()  💥 điểm phát nổ
```

**Ba quy luật rút ra:**

1. **Mọi dòng lệnh sau `throw`, trong mọi tầng đang chờ, đều bị bỏ qua.** Đó là lý do B, F, H không in ra. Java gọi đây là **abrupt completion** (kết thúc đột ngột).
2. **Exception đi lên từng tầng một**, tại mỗi tầng JVM tìm khối `catch` khớp kiểu. Không khớp thì tầng đó bị **pop khỏi stack** và exception tiếp tục đi lên.
3. **Nếu lên tới `main` mà vẫn không ai bắt**, JVM gọi `Thread.UncaughtExceptionHandler` mặc định: in stack trace ra `System.err` rồi kết thúc thread với exit code khác 0.

Thử bỏ khối `try-catch` trong `main` xem điều gì xảy ra:

```
A. main bắt đầu
E. tầng 1 bắt đầu
G. tầng 2 bắt đầu
I. tầng 3 chuẩn bị ném
Exception in thread "main" java.lang.IllegalStateException: Nổ ở tầng sâu nhất
	at MoPhongPropagation.tangGoiThuBa(MoPhongPropagation.java:26)
	at MoPhongPropagation.tangGoiThuHai(MoPhongPropagation.java:21)
	at MoPhongPropagation.tangGoiThuNhat(MoPhongPropagation.java:16)
	at MoPhongPropagation.main(MoPhongPropagation.java:6)
```

Hãy đọc kỹ stack trace này — nó là **bản đồ ngược** của hành trình:

- **Dòng trên cùng** = nơi exception **được ném ra** (sâu nhất).
- **Dòng dưới cùng** = nơi bắt đầu (`main`).
- Đọc **từ trên xuống** để biết "nổ ở đâu"; đọc **từ dưới lên** để biết "làm sao đi tới đó".

> 🧠 **Ghi nhớ:** Stack trace không phải rác. Nó là **bằng chứng hiện trường** đắt giá nhất bạn có. Chương này sẽ dạy bạn cách **không bao giờ làm mất nó**.

---

## Phần 1 — Cây Phân Cấp Throwable

### 1.1 Sơ đồ cây đầy đủ

Trong Java, **chỉ những đối tượng kế thừa từ `java.lang.Throwable` mới được `throw`**. Đây là toàn cảnh:

```
                        java.lang.Object
                               │
                        java.lang.Throwable          ← Gốc của MỌI thứ ném được
                        (implements Serializable)
                               │
              ┌────────────────┴────────────────┐
              │                                 │
      java.lang.Error                   java.lang.Exception
   ❌ KHÔNG bắt — hệ thống chết        ✅ CHECKED — phải catch hoặc declare
              │                                 │
    ┌─────────┼──────────┐         ┌────────────┼──────────────────┐
    │         │          │         │            │                  │
StackOverflow │      LinkageError  │      IOException      java.lang.RuntimeException
  Error       │      (NoClassDef-  │      ├ FileNotFound-  ⚠️ UNCHECKED — không bắt buộc
              │       FoundError)  │      │   Exception              │
        OutOfMemory                │      ├ EOFException     ┌──────┼─────────────┐
          Error                    │      └ SocketException  │      │             │
              │                    │                  NullPointer  Illegal    IndexOutOf
        InternalError        SQLException             Exception   Argument-    Bounds-
        UnknownError         ClassNotFoundException        │      Exception    Exception
        AssertionError       InterruptedException          │          │            │
                             CloneNotSupportedException    │    NumberFormat-  ArrayIndex-
                                                           │     Exception    OutOfBounds
                                                    ArithmeticException       StringIndex-
                                                    ClassCastException        OutOfBounds
                                                    IllegalStateException
                                                    UnsupportedOperationException
                                                    ConcurrentModificationException
```

**Ba nhánh, ba thái độ hoàn toàn khác nhau:**

| Nhánh | Ý nghĩa | Thái độ của bạn |
|-------|---------|-----------------|
| `Error` | Hệ thống/JVM hỏng nặng, ngoài tầm kiểm soát của ứng dụng | **Không bắt.** Để chương trình chết. |
| `Exception` (không phải `RuntimeException`) | **Checked** — sự cố ngoại cảnh có thể lường trước và **có thể phục hồi** | Bắt buộc `catch` hoặc `throws`. Xử lý có kế hoạch. |
| `RuntimeException` | **Unchecked** — thường là **lỗi lập trình** hoặc vi phạm hợp đồng | Không bắt buộc. Nên **sửa code**, không nên bắt. |

### 1.2 `Throwable` — bên trong có gì?

`Throwable` không phải một cái vỏ rỗng. Nó là một object mang **4 mẩu thông tin**:

```java
public class Throwable implements Serializable {
    private String            detailMessage;   // ① thông điệp mô tả
    private Throwable         cause;           // ② nguyên nhân gốc (chuỗi nguyên nhân)
    private StackTraceElement[] stackTrace;    // ③ ảnh chụp call stack lúc tạo
    private List<Throwable>   suppressedExceptions; // ④ exception bị "át" (try-with-resources)
    // ...
}
```

**Bốn constructor chuẩn — hãy thuộc lòng, vì custom exception của bạn cũng nên có đủ 4 cái:**

```java
Throwable()                                  // không message, không cause
Throwable(String message)                    // chỉ message
Throwable(String message, Throwable cause)   // ⭐ dùng nhiều nhất — có chaining
Throwable(Throwable cause)                   // chỉ cause; message = cause.toString()
```

**Các phương thức quan trọng:**

| Phương thức | Trả về | Dùng để làm gì |
|-------------|--------|----------------|
| `getMessage()` | `String` | Lấy thông điệp mô tả. **Có thể `null`!** |
| `getLocalizedMessage()` | `String` | Bản đa ngôn ngữ; mặc định gọi `getMessage()` |
| `getCause()` | `Throwable` | Lấy exception nguyên nhân. **Có thể `null`** nếu không chaining |
| `initCause(Throwable)` | `Throwable` | Gán cause **sau** khi tạo. Chỉ gọi được **một lần** |
| `getStackTrace()` | `StackTraceElement[]` | Mảng các khung stack, phần tử `[0]` là nơi ném |
| `setStackTrace(...)` | `void` | Ghi đè stack trace (hiếm dùng, chỉ cho framework) |
| `printStackTrace()` | `void` | In ra `System.err`. ⚠️ **Không dùng trong production** |
| `fillInStackTrace()` | `Throwable` | Chụp lại stack trace. Override để **tắt** cho exception nhẹ |
| `addSuppressed(Throwable)` | `void` | Thêm exception bị át |
| `getSuppressed()` | `Throwable[]` | Lấy danh sách exception bị át |
| `toString()` | `String` | `"tên.đầy.đủ.Class: message"` |

Ví dụ khám phá thực tế:

```java
public class KhamPhaThrowable {
    public static void main(String[] args) {
        Throwable goc = new IllegalArgumentException("Số lượng phải > 0");
        Throwable boc = new RuntimeException("Không tạo được đơn hàng", goc);

        System.out.println("1. getMessage()  : " + boc.getMessage());
        System.out.println("2. toString()    : " + boc);
        System.out.println("3. getCause()    : " + boc.getCause());
        System.out.println("4. cause.message : " + boc.getCause().getMessage());
        System.out.println("5. Số khung stack: " + boc.getStackTrace().length);
        System.out.println("6. Khung [0]     : " + boc.getStackTrace()[0]);
        System.out.println("7. Suppressed    : " + boc.getSuppressed().length);
    }
}
```

**Output (số dòng có thể khác tuỳ máy):**

```
1. getMessage()  : Không tạo được đơn hàng
2. toString()    : java.lang.RuntimeException: Không tạo được đơn hàng
3. getCause()    : java.lang.IllegalArgumentException: Số lượng phải > 0
4. cause.message : Số lượng phải > 0
5. Số khung stack: 1
6. Khung [0]     : KhamPhaThrowable.main(KhamPhaThrowable.java:4)
7. Suppressed    : 0
```

### 1.3 `Error` — vùng cấm

`Error` biểu thị **sự cố nghiêm trọng mà ứng dụng bình thường không nên và không thể xử lý**.

| Error | Nguyên nhân | Bạn nên làm gì |
|-------|-------------|----------------|
| `StackOverflowError` | Đệ quy vô hạn / stack quá sâu | Sửa thuật toán đệ quy |
| `OutOfMemoryError` | Hết heap / metaspace / native memory | Tăng `-Xmx`, sửa memory leak |
| `NoClassDefFoundError` | Class có lúc biên dịch nhưng thiếu lúc chạy | Sửa classpath / dependency |
| `ExceptionInInitializerError` | Static initializer ném exception | Sửa khối `static { }` |
| `AssertionError` | `assert` thất bại (khi bật `-ea`) | Sửa giả định sai trong code |
| `LinkageError` | Xung đột phiên bản class | Dọn dependency trùng lặp |

```java
// Minh hoạ StackOverflowError — đệ quy không có điều kiện dừng
public class GayStackOverflow {
    static int demSau = 0;

    static void deQuyVoTan() {
        demSau++;
        deQuyVoTan();   // 💥 không bao giờ dừng
    }

    public static void main(String[] args) {
        try {
            deQuyVoTan();
        } catch (StackOverflowError e) {
            // ⚠️ Bắt được về mặt kỹ thuật, nhưng ĐÂY LÀ VÍ DỤ MINH HOẠ, không phải best practice
            System.out.println("Đã đệ quy được " + demSau + " tầng trước khi tràn stack");
        }
    }
}
```

**Output (khoảng, tuỳ JVM và kích thước stack):**

```
Đã đệ quy được 21847 tầng trước khi tràn stack
```

> ⚠️ **Vì sao không nên bắt `Error`?** Vì sau khi bắt, **JVM đã ở trạng thái không đáng tin cậy**. Bắt `OutOfMemoryError` rồi "chạy tiếp" nghĩa là bạn chạy tiếp trong một tiến trình sắp chết — mọi thao tác cấp phát bộ nhớ tiếp theo đều có thể nổ lại, ở những nơi ngẫu nhiên, khiến việc chẩn đoán trở nên bất khả thi. Đúng đắn nhất là **để nó chết**, để orchestrator (Kubernetes, systemd) khởi động lại tiến trình sạch sẽ.
>
> **Ngoại lệ hợp lệ duy nhất:** framework/server ở tầng ngoài cùng bắt `Throwable` để **ghi log rồi shutdown có trật tự** — bắt để *báo cáo và chết đẹp*, không phải để *chạy tiếp*.

### 1.4 `Exception` và `RuntimeException`

```
Exception                          ← CHECKED (compiler kiểm tra)
   │
   ├── IOException                 ← checked
   ├── SQLException                ← checked
   ├── InterruptedException        ← checked
   ├── ClassNotFoundException      ← checked
   │
   └── RuntimeException            ← UNCHECKED (compiler bỏ qua)
          ├── NullPointerException
          ├── IllegalArgumentException
          ├── IllegalStateException
          ├── IndexOutOfBoundsException
          ├── ArithmeticException
          ├── ClassCastException
          └── ... (và toàn bộ con cháu)
```

**Quy tắc nhận diện chỉ trong một câu:**

> Một `Throwable` là **unchecked** khi và chỉ khi nó là `RuntimeException`, `Error`, hoặc con cháu của một trong hai. **Mọi thứ còn lại là checked.**

**Flowchart quyết định:**

```
                 Có một đối tượng Throwable X
                             │
                             ▼
              ┌─────────────────────────────┐
              │ X có kế thừa từ Error ?     │
              └──────────────┬──────────────┘
                    YES      │      NO
              ┌──────────────┘──────────────┐
              ▼                             ▼
        ┌───────────┐          ┌─────────────────────────────┐
        │ UNCHECKED │          │ X kế thừa RuntimeException ?│
        │ (hệ thống)│          └──────────────┬──────────────┘
        └───────────┘                YES      │      NO
                              ┌───────────────┘───────────────┐
                              ▼                               ▼
                        ┌───────────┐                   ┌───────────┐
                        │ UNCHECKED │                   │  CHECKED  │
                        │(lỗi lập   │                   │ (compiler │
                        │  trình)   │                   │  ép xử lý)│
                        └───────────┘                   └───────────┘
```

Kiểm chứng bằng code:

```java
public class KiemTraCheckedHayKhong {

    /** Trả về true nếu throwable thuộc loại unchecked */
    static boolean laUnchecked(Class<? extends Throwable> loai) {
        return RuntimeException.class.isAssignableFrom(loai)
                || Error.class.isAssignableFrom(loai);
    }

    public static void main(String[] args) {
        List<Class<? extends Throwable>> danhSach = List.of(
                java.io.IOException.class,
                java.io.FileNotFoundException.class,
                java.sql.SQLException.class,
                InterruptedException.class,
                NullPointerException.class,
                IllegalArgumentException.class,
                ArithmeticException.class,
                StackOverflowError.class,
                OutOfMemoryError.class,
                Exception.class,
                Throwable.class
        );

        danhSach.forEach(loai ->
                System.out.printf("%-40s → %s%n",
                        loai.getSimpleName(),
                        laUnchecked(loai) ? "UNCHECKED" : "CHECKED"));
    }
}
```

**Output:**

```
IOException                              → CHECKED
FileNotFoundException                    → CHECKED
SQLException                             → CHECKED
InterruptedException                     → CHECKED
NullPointerException                     → UNCHECKED
IllegalArgumentException                 → UNCHECKED
ArithmeticException                      → UNCHECKED
StackOverflowError                       → UNCHECKED
OutOfMemoryError                         → UNCHECKED
Exception                                → CHECKED
Throwable                                → CHECKED
```

> 🤔 **Bất ngờ ở dòng cuối:** `Throwable` bản thân nó là **checked**! Nếu bạn viết `throw new Throwable("test")`, compiler sẽ bắt bạn khai báo `throws Throwable`. Chỉ hai nhánh con `RuntimeException` và `Error` mới được miễn.

### 1.5 Bảng các exception JDK gặp nhiều nhất

**Nhóm unchecked — hầu hết là LỖI LẬP TRÌNH (bạn phải sửa code, không phải catch):**

| Exception | Khi nào xảy ra | Ví dụ gây lỗi |
|-----------|----------------|---------------|
| `NullPointerException` | Truy cập thành viên trên tham chiếu `null` | `String s = null; s.length();` |
| `IllegalArgumentException` | Tham số không hợp lệ | `List.of(1,2).subList(1, 99)` |
| `IllegalStateException` | Object đang ở trạng thái sai để gọi thao tác đó | Gọi `iterator.remove()` trước `next()` |
| `IndexOutOfBoundsException` | Chỉ số ngoài phạm vi | `list.get(10)` khi size = 3 |
| `ArrayIndexOutOfBoundsException` | Chỉ số mảng sai | `arr[5]` với `arr` dài 3 |
| `StringIndexOutOfBoundsException` | Chỉ số chuỗi sai | `"abc".charAt(10)` |
| `ArithmeticException` | Toán học không hợp lệ | `10 / 0` (chỉ với **số nguyên**) |
| `ClassCastException` | Ép kiểu sai | `Object o = "x"; Integer i = (Integer) o;` |
| `NumberFormatException` | Chuỗi không parse được thành số | `Integer.parseInt("abc")` |
| `UnsupportedOperationException` | Thao tác không được hỗ trợ | `List.of(1,2).add(3)` |
| `ConcurrentModificationException` | Sửa collection khi đang duyệt | `for (X x : list) list.remove(x);` |
| `NoSuchElementException` | Lấy phần tử từ nguồn rỗng | `Optional.empty().get()` |
| `DateTimeException` | Giá trị ngày/giờ không hợp lệ | `LocalDate.of(2024, 13, 1)` |

**Nhóm checked — SỰ CỐ NGOẠI CẢNH (bạn phải có kế hoạch xử lý):**

| Exception | Khi nào xảy ra | Phục hồi thế nào |
|-----------|----------------|------------------|
| `IOException` | Lỗi vào/ra chung | Thử lại, dùng nguồn dự phòng |
| `FileNotFoundException` | File không tồn tại / không đọc được | Hỏi lại đường dẫn, tạo file mới |
| `EOFException` | Hết dữ liệu giữa chừng | Báo file hỏng |
| `SocketTimeoutException` | Kết nối mạng quá hạn | Retry với backoff |
| `UnknownHostException` | Không phân giải được tên miền | Kiểm tra DNS/config |
| `SQLException` | Lỗi cơ sở dữ liệu | Rollback, retry, báo lỗi |
| `InterruptedException` | Thread bị yêu cầu dừng | Khôi phục cờ interrupt, thoát sạch |
| `ClassNotFoundException` | Không tìm thấy class khi nạp động | Báo cấu hình sai |
| `CloneNotSupportedException` | `clone()` trên class không `Cloneable` | Sửa thiết kế |

> 💡 **Mẹo phân biệt nhanh khi debug:** Thấy `NullPointerException` hay `IllegalArgumentException` trong log production → **code của bạn có bug**, đi sửa code. Thấy `SocketTimeoutException` hay `SQLException` → **thế giới bên ngoài đang có vấn đề**, cần cơ chế phục hồi (retry, circuit breaker, fallback).

### 1.6 `StackTraceElement[]` — mổ xẻ stack trace

Mỗi phần tử trong `getStackTrace()` là một **khung** (frame) mô tả một lời gọi hàm:

```java
public class DocStackTrace {

    public static void main(String[] args) {
        try {
            tang1();
        } catch (RuntimeException e) {
            StackTraceElement[] cacKhung = e.getStackTrace();

            System.out.println("Tổng số khung: " + cacKhung.length);
            System.out.println("──────────────────────────────────────");

            for (int i = 0; i < cacKhung.length; i++) {
                StackTraceElement khung = cacKhung[i];
                System.out.printf("[%d] class=%-16s method=%-8s file=%-20s line=%d%n",
                        i,
                        khung.getClassName(),
                        khung.getMethodName(),
                        khung.getFileName(),
                        khung.getLineNumber());
            }
        }
    }

    static void tang1() { tang2(); }
    static void tang2() { tang3(); }
    static void tang3() { throw new RuntimeException("Nổ ở tang3"); }
}
```

**Output:**

```
Tổng số khung: 4
──────────────────────────────────────
[0] class=DocStackTrace  method=tang3    file=DocStackTrace.java   line=27
[1] class=DocStackTrace  method=tang2    file=DocStackTrace.java   line=26
[2] class=DocStackTrace  method=tang1    file=DocStackTrace.java   line=25
[3] class=DocStackTrace  method=main     file=DocStackTrace.java   line=5
```

**Cách đọc một stack trace thật trong production:**

```
java.lang.NullPointerException: Cannot invoke "String.trim()" because "email" is null
	at com.shop.service.KhachHangService.dangKy(KhachHangService.java:47)     ← ① NƠI NỔ
	at com.shop.controller.KhachHangController.taoMoi(KhachHangController.java:31)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(...)  ← ② KHUNG FRAMEWORK
	at org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(...)
	... 47 more                                                               ← ③ ĐÃ RÚT GỌN
Caused by: java.lang.IllegalArgumentException: Email rỗng                     ← ④ NGUYÊN NHÂN GỐC
	at com.shop.validator.EmailValidator.kiemTra(EmailValidator.java:19)
	... 52 more
```

| Dấu hiệu | Ý nghĩa | Hành động |
|----------|---------|-----------|
| ① Dòng đầu sau message | Nơi exception được **tạo ra** | **Bắt đầu debug từ đây** |
| ② `org.springframework...`, `java.base/...` | Khung của framework/JDK | Thường bỏ qua, tìm dòng có package **của bạn** |
| ③ `... 47 more` | JDK rút gọn phần trùng lặp giữa hai stack trace | Bình thường, không phải lỗi |
| ④ `Caused by:` | Exception nguyên nhân bên dưới | **Đây thường mới là thủ phạm thật** |

> 🔑 **Kỹ năng sống còn:** Khi thấy stack trace dài 200 dòng, hãy `Ctrl+F` tìm **tên package của dự án bạn** (ví dụ `com.shop`). Dòng đầu tiên khớp chính là nơi bạn cần mở IDE. Và luôn cuộn **xuống dưới cùng** để đọc `Caused by:` sâu nhất — đó mới là nguyên nhân gốc.

### 1.7 Vì sao chỉ `Throwable` mới ném được?

```java
// ❌ LỖI BIÊN DỊCH: incompatible types: String cannot be converted to Throwable
throw "Có lỗi rồi!";

// ❌ LỖI BIÊN DỊCH
throw new Object();

// ✅ Hợp lệ — mọi thứ ném được phải là con cháu của Throwable
throw new RuntimeException("Có lỗi rồi!");
```

Lý do thiết kế: JVM cần đảm bảo mọi thứ được ném đều **có sẵn stack trace, message và cause** để hệ thống chẩn đoán hoạt động thống nhất. Nếu cho ném `String`, bạn sẽ mất toàn bộ thông tin hiện trường — quay lại đúng nỗi đau số 4 của mô hình mã lỗi.

---
## Phần 2 — Checked vs Unchecked Exceptions

Đây là chủ đề gây tranh cãi nhiều nhất trong Java, và cũng là nơi người mới hay mắc lỗi thiết kế nghiêm trọng nhất. Ta sẽ đi từ **luật của compiler** → **ví dụ** → **cây quyết định** → **tranh luận cộng đồng**.

### 2.1 Luật "handle-or-declare" của compiler

> **Luật:** Nếu một đoạn code **có thể** ném ra một **checked exception**, thì method chứa nó phải làm **một trong hai** việc:
> 1. **Handle** — bắt nó bằng `try-catch`, hoặc
> 2. **Declare** — khai báo `throws` trên chữ ký method để đẩy trách nhiệm lên người gọi.
>
> Không làm gì cả → **lỗi biên dịch**. Compiler không cho bạn qua.

```java
import java.io.FileReader;
import java.io.IOException;

public class LuatHandleOrDeclare {

    // ❌ KHÔNG BIÊN DỊCH ĐƯỢC
    // error: unreported exception IOException; must be caught or declared to be thrown
    void cachSai() {
        FileReader reader = new FileReader("config.txt");
    }

    // ✅ Cách 1 — HANDLE: bắt tại chỗ
    void cachDung1() {
        try {
            FileReader reader = new FileReader("config.txt");
            // ... dùng reader
        } catch (IOException e) {
            System.err.println("Không đọc được file: " + e.getMessage());
        }
    }

    // ✅ Cách 2 — DECLARE: đẩy lên người gọi
    void cachDung2() throws IOException {
        FileReader reader = new FileReader("config.txt");
    }
}
```

Ngược lại, với **unchecked exception**, compiler **hoàn toàn im lặng**:

```java
public class KhongAiEpBan {

    // ✅ Biên dịch OK, dù chắc chắn sẽ nổ khi chạy
    int chiaSo(int a, int b) {
        return a / b;   // ArithmeticException nếu b == 0 — compiler KHÔNG cảnh báo
    }

    // ✅ Biên dịch OK
    int doDaiChuoi(String s) {
        return s.length();   // NullPointerException nếu s == null — compiler KHÔNG cảnh báo
    }

    // ✅ Được phép khai báo throws cho unchecked (chỉ mang tính tài liệu)
    void rutTien(BigDecimal soTien) throws IllegalArgumentException {
        if (soTien.signum() <= 0) {
            throw new IllegalArgumentException("Số tiền phải dương, nhận được: " + soTien);
        }
    }
}
```

### 2.2 Checked Exception — sự cố ngoại cảnh

**Triết lý gốc:** Checked exception mô tả những tình huống **nằm ngoài tầm kiểm soát của chương trình** nhưng **có thể dự đoán trước** và **có phương án phục hồi hợp lý**.

```java
import java.io.*;
import java.nio.file.*;

public class ViDuChecked {

    /**
     * Đọc cấu hình từ file. Nếu file không tồn tại → dùng cấu hình mặc định.
     * Đây là ví dụ ĐẸP của checked exception: có phương án phục hồi rõ ràng.
     */
    public CauHinh docCauHinh(Path duongDan) {
        try {
            String noiDung = Files.readString(duongDan);
            return CauHinh.parse(noiDung);
        } catch (NoSuchFileException e) {
            // Phục hồi: file chưa có → dùng mặc định. Đây là tình huống BÌNH THƯỜNG.
            log.info("Không tìm thấy {} — dùng cấu hình mặc định", duongDan);
            return CauHinh.macDinh();
        } catch (IOException e) {
            // Không phục hồi được: đĩa hỏng, không có quyền... → leo thang
            throw new KhongDocDuocCauHinhException("Lỗi đọc " + duongDan, e);
        }
    }
}
```

**Ưu điểm của checked:**

| Ưu điểm | Giải thích |
|---------|------------|
| **Hiển hiện** | Nhìn chữ ký `throws IOException` là biết method này có thể hỏng vì I/O |
| **Không thể quên** | Compiler chặn ngay lúc build, không lọt ra production |
| **Tài liệu tự động** | `throws` là một phần API contract, IDE gợi ý ngay |

**Nhược điểm:**

| Nhược điểm | Giải thích |
|------------|------------|
| **Dài dòng** | Mỗi tầng phải khai báo lại hoặc bọc lại |
| **Rò rỉ chi tiết cài đặt** | Interface `KhoLuuTru` mà `throws SQLException` là ép mọi cài đặt phải dùng SQL |
| **Không tương thích lambda** | Functional interface của JDK **không** khai báo `throws` — xem mục 12.4 |
| **Khuyến khích nuốt lỗi** | Người lười viết `catch (IOException e) {}` cho compiler im |

### 2.3 Unchecked Exception — lỗi lập trình

**Triết lý gốc:** Unchecked exception (nhánh `RuntimeException`) mô tả những **lỗi lập trình** — vi phạm hợp đồng, giả định sai. Cách "xử lý" đúng không phải là `catch`, mà là **sửa code**.

```java
public class ViDuUnchecked {

    /**
     * Kiểm tra tham số đầu vào — vi phạm là LỖI CỦA NGƯỜI GỌI.
     * Dùng unchecked vì người gọi lẽ ra không bao giờ nên truyền giá trị sai.
     */
    public void datHang(Long khachHangId, int soLuong) {
        // Fail fast: kiểm tra ngay đầu method
        if (khachHangId == null) {
            throw new IllegalArgumentException("khachHangId không được null");
        }
        if (soLuong <= 0) {
            throw new IllegalArgumentException(
                    "soLuong phải > 0, nhận được: " + soLuong);
        }
        if (soLuong > 100) {
            throw new IllegalArgumentException(
                    "soLuong tối đa 100/đơn, nhận được: " + soLuong);
        }
        // ... logic thật bắt đầu ở đây, và mọi giả định đều đã được đảm bảo
    }
}
```

Người gọi **không cần** `try-catch`. Nếu họ truyền `soLuong = -5`, chương trình nổ trong lúc test — và đó là điều **tốt**, vì bug được phát hiện trước khi lên production.

**Ưu điểm của unchecked:**

| Ưu điểm | Giải thích |
|---------|------------|
| **Code sạch** | Không rác `try-catch` ở mọi tầng trung gian |
| **Hợp với lambda/stream** | Không phá vỡ functional interface |
| **Đúng bản chất** | Lỗi lập trình thì phải sửa code, không phải "xử lý" |

**Nhược điểm:**

| Nhược điểm | Giải thích |
|------------|------------|
| **Dễ bỏ sót** | Không có gì nhắc bạn rằng method này có thể nổ |
| **Phải đọc JavaDoc/source** | Muốn biết method ném gì thì phải đọc tài liệu |
| **Lỗi lộ ra lúc chạy** | Không có lưới an toàn compile-time |

### 2.4 Cây quyết định — chọn checked hay unchecked?

Khi **tự thiết kế** exception cho ứng dụng của mình, hãy chạy qua cây này:

```
              Bạn cần báo hiệu một thất bại
                          │
                          ▼
   ┌───────────────────────────────────────────────────┐
   │ ① Đây có phải LỖI LẬP TRÌNH không?                │
   │    (null không hợp lệ, tham số sai, sai trạng thái)│
   └────────────────────┬──────────────────────────────┘
              YES       │       NO
      ┌─────────────────┘─────────────────┐
      ▼                                   ▼
┌──────────────────┐    ┌────────────────────────────────────────┐
│ UNCHECKED        │    │ ② Người gọi có thể LÀM GÌ ĐÓ HỮU ÍCH   │
│ IllegalArgument- │    │    để phục hồi không?                  │
│ Exception        │    │    (retry, fallback, hỏi lại user)     │
│ IllegalState-    │    └────────────────┬───────────────────────┘
│ Exception        │           YES       │       NO
│ NullPointer-     │    ┌────────────────┘────────────────┐
│ Exception        │    ▼                                 ▼
└──────────────────┘  ┌────────────────────┐   ┌──────────────────────┐
                      │ ③ Việc phục hồi có │   │ UNCHECKED            │
                      │  BẮT BUỘC không?   │   │ (không phục hồi được │
                      │  Bỏ qua = mất dữ   │   │  → để bay lên tầng   │
                      │  liệu / mất tiền?  │   │  ngoài cùng, log,    │
                      └─────────┬──────────┘   │  trả 500)            │
                        YES     │      NO      └──────────────────────┘
                  ┌─────────────┘─────────────┐
                  ▼                           ▼
          ┌───────────────┐        ┌────────────────────────┐
          │  CHECKED      │        │ UNCHECKED              │
          │  extends      │        │ extends RuntimeException│
          │  Exception    │        │ (đa số lỗi nghiệp vụ   │
          │  (hiếm dùng!) │        │  trong web app)        │
          └───────────────┘        └────────────────────────┘
```

**Áp dụng vào domain đặt hàng:**

| Tình huống | Loại | Vì sao |
|------------|------|--------|
| `khachHangId == null` | **Unchecked** `IllegalArgumentException` | Lỗi lập trình — controller lẽ ra đã validate |
| Không tìm thấy khách hàng | **Unchecked** `KhachHangKhongTonTaiException` | Tầng trên chỉ cần map sang HTTP 404, không "phục hồi" |
| Không đủ tồn kho | **Unchecked** `KhongDuTonKhoException` | Tầng trên map sang HTTP 409, không phục hồi tự động |
| Cổng thanh toán timeout | **Checked** `CongThanhToanException` | **Có** phương án phục hồi bắt buộc: retry, hoặc chuyển cổng dự phòng |
| Ghi file log kiểm toán thất bại | **Checked** `IOException` | Bắt buộc phải xử lý — mất log kiểm toán là vi phạm quy định |

> 💡 **Quy tắc ngón tay cái cho web app hiện đại (Spring Boot):** **Mặc định dùng unchecked.** Chỉ dùng checked khi bạn thực sự muốn **ép** người gọi viết code phục hồi, và bạn chắc chắn rằng "bỏ qua lỗi này" là không thể chấp nhận được. Trong thực tế, tỉ lệ điển hình là **95% unchecked / 5% checked**.

### 2.5 Bảng so sánh tổng hợp

| Tiêu chí | Checked Exception | Unchecked Exception |
|----------|-------------------|---------------------|
| Class cha | `Exception` (không qua `RuntimeException`) | `RuntimeException` |
| Compiler kiểm tra | ✅ Có — handle or declare | ❌ Không |
| Bắt buộc `try-catch`/`throws` | ✅ Có | ❌ Không |
| Ý nghĩa | Sự cố **ngoại cảnh**, dự đoán được | **Lỗi lập trình** / vi phạm hợp đồng |
| Có thể phục hồi | Thường có | Thường không |
| Ví dụ JDK | `IOException`, `SQLException` | `NullPointerException`, `IllegalArgumentException` |
| Dùng trong lambda | ❌ Rắc rối, phải bọc | ✅ Tự nhiên |
| Ảnh hưởng API contract | Rất mạnh — thay đổi = phá vỡ tương thích | Nhẹ |
| Spring Framework dùng | Rất ít | ✅ Chủ đạo (`DataAccessException` là unchecked) |
| Tỉ lệ khuyến nghị (web app) | ~5% | ~95% |

### 2.6 "Checked exception hell" và cách thoát ra

**Vấn đề:** Bạn có 5 tầng. Tầng dưới cùng ném `SQLException`. Nếu cứ khai báo `throws` lên, cả 5 tầng đều dính:

```java
// ❌ CHECKED EXCEPTION HELL — SQLException rò rỉ khắp mọi tầng
public interface KhachHangRepository {
    KhachHang timTheoId(Long id) throws SQLException;   // ⚠️ ép mọi cài đặt phải là SQL
}

public class KhachHangService {
    public KhachHang lay(Long id) throws SQLException { // ⚠️ service không nên biết SQL là gì
        return repository.timTheoId(id);
    }
}

public class KhachHangController {
    public ResponseEntity<?> lay(Long id) throws SQLException { // ⚠️ HTTP layer biết SQL?!
        return ResponseEntity.ok(service.lay(id));
    }
}
```

Ba vấn đề nghiêm trọng:
1. **Rò rỉ chi tiết cài đặt** — mai bạn đổi sang MongoDB, chữ ký `throws SQLException` trở nên vô nghĩa nhưng **không xoá được** vì sẽ phá vỡ mọi code đang gọi.
2. **Vi phạm nguyên tắc trừu tượng** — controller HTTP không có lý do gì để biết về SQL.
3. **Không ai thực sự xử lý** — mỗi tầng chỉ đá quả bóng lên trên.

**Giải pháp: bọc thành unchecked ở đúng ranh giới trừu tượng.**

```java
// ✅ Bọc checked → unchecked NGAY tại tầng repository (ranh giới hạ tầng)
@Repository
public class JdbcKhachHangRepository implements KhachHangRepository {

    @Override
    public Optional<KhachHang> timTheoId(Long id) {   // 🎉 Chữ ký SẠCH, không throws
        String sql = "SELECT id, email, so_du FROM khach_hang WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(anXa(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            // ⭐ Bọc lại: giữ NGUYÊN cause để không mất root cause
            throw new TruyCapDuLieuException("Lỗi truy vấn khách hàng id=" + id, e);
        }
    }
}

/** Exception hạ tầng — unchecked, không rò rỉ chi tiết SQL ra API */
public class TruyCapDuLieuException extends RuntimeException {
    public TruyCapDuLieuException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

Giờ `Service` và `Controller` có chữ ký sạch sẽ. Nếu đổi sang MongoDB, chỉ tầng repository thay đổi.

> 🌱 **Đây chính xác là điều Spring làm.** Spring bắt `SQLException` (checked), phân loại chi tiết và ném lại dưới dạng cây `DataAccessException` — **tất cả đều unchecked**. Nhờ đó bạn viết `@Repository` mà không bao giờ phải `throws SQLException`.

```
org.springframework.dao.DataAccessException  (extends RuntimeException — UNCHECKED)
   ├── DataIntegrityViolationException      ← vi phạm khoá ngoại / unique
   │      └── DuplicateKeyException         ← trùng khoá chính
   ├── EmptyResultDataAccessException       ← query mong đợi 1 dòng nhưng được 0
   ├── IncorrectResultSizeDataAccessException
   ├── OptimisticLockingFailureException    ← @Version conflict
   ├── QueryTimeoutException
   └── CannotAcquireLockException
```

### 2.7 `InterruptedException` — ca đặc biệt phải biết

`InterruptedException` là checked, và là exception **bị xử lý sai nhiều nhất** trong Java:

```java
// ❌ SAI NGHIÊM TRỌNG: nuốt cờ interrupt
try {
    Thread.sleep(1000);
} catch (InterruptedException e) {
    // Không làm gì → thread không bao giờ biết nó bị yêu cầu dừng
    // → thread pool không shutdown được → ứng dụng treo khi tắt
}

// ✅ ĐÚNG cách 1: khôi phục cờ interrupt rồi thoát
try {
    Thread.sleep(1000);
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();   // ⭐ BẮT BUỘC: khôi phục cờ
    log.warn("Bị ngắt khi đang chờ, dừng xử lý");
    return;                               // thoát sạch sẽ
}

// ✅ ĐÚNG cách 2: đẩy lên trên
void congViecDaiHoi() throws InterruptedException {
    Thread.sleep(1000);
}
```

**Vì sao phải `Thread.currentThread().interrupt()`?** Vì khi `InterruptedException` được ném, JVM **tự động xoá** cờ interrupt của thread. Nếu bạn không khôi phục, các tầng trên (ví dụ `ExecutorService.shutdownNow()`) sẽ không biết thread này đã được yêu cầu dừng, và ứng dụng có thể treo vô hạn lúc shutdown.

---

## Phần 3 — try / catch / finally

### 3.1 Cú pháp đầy đủ

```java
try {
    // Khối được BẢO VỆ — code có thể ném exception
} catch (LoaiException1 e) {
    // Xử lý LoaiException1
} catch (LoaiException2 | LoaiException3 e) {   // multi-catch (Java 7+)
    // Xử lý LoaiException2 HOẶC LoaiException3
} finally {
    // LUÔN chạy — dù có exception hay không
}
```

**Quy tắc cú pháp:**

| Quy tắc | Chi tiết |
|---------|----------|
| `try` phải đi kèm ít nhất 1 khối | Cần **ít nhất một** `catch` HOẶC một `finally` (hoặc là try-with-resources) |
| Số khối `catch` | 0 hoặc nhiều |
| Số khối `finally` | 0 hoặc 1, và luôn ở **cuối cùng** |
| Phạm vi biến | Biến khai báo trong `try` **không** nhìn thấy được trong `catch`/`finally` |
| Biến exception | `e` chỉ tồn tại trong khối `catch` tương ứng, và **effectively final** trong multi-catch |

```java
// ❌ LỖI BIÊN DỊCH: try không có catch cũng không có finally
try {
    lamGiDo();
}

// ❌ LỖI BIÊN DỊCH: biến khai báo trong try không thấy được ở catch
try {
    int x = 10;
} catch (Exception e) {
    System.out.println(x);   // error: cannot find symbol
}

// ✅ ĐÚNG: khai báo biến TRƯỚC try nếu cần dùng ở catch/finally
int x = 0;
try {
    x = 10;
} catch (Exception e) {
    System.out.println(x);   // OK
}
```

### 3.2 Luồng thực thi — ba kịch bản

```java
public class BaKichBan {

    static String chay(int lua) {
        System.out.println("── Lựa chọn " + lua + " ──");
        try {
            System.out.println("  1. Vào try");
            if (lua == 1) throw new IllegalArgumentException("lỗi A");
            if (lua == 2) throw new IllegalStateException("lỗi B");
            System.out.println("  2. Cuối try (chỉ chạy khi KHÔNG có exception)");
        } catch (IllegalArgumentException e) {
            System.out.println("  3. Vào catch IllegalArgument: " + e.getMessage());
        } finally {
            System.out.println("  4. finally — LUÔN chạy");
        }
        System.out.println("  5. Sau khối try-catch-finally");
        return "xong";
    }

    public static void main(String[] args) {
        chay(0);   // không có exception
        chay(1);   // exception ĐƯỢC bắt
        try {
            chay(2);   // exception KHÔNG được bắt tại chỗ
        } catch (IllegalStateException e) {
            System.out.println("  6. main bắt được: " + e.getMessage());
        }
    }
}
```

**Output:**

```
── Lựa chọn 0 ──
  1. Vào try
  2. Cuối try (chỉ chạy khi KHÔNG có exception)
  4. finally — LUÔN chạy
  5. Sau khối try-catch-finally
── Lựa chọn 1 ──
  1. Vào try
  3. Vào catch IllegalArgument: lỗi A
  4. finally — LUÔN chạy
  5. Sau khối try-catch-finally
── Lựa chọn 2 ──
  1. Vào try
  4. finally — LUÔN chạy
  6. main bắt được: lỗi B
```

**Sơ đồ ba luồng:**

```
KỊCH BẢN A — Không có exception
──────────────────────────────────────────────────────────
  try (chạy hết)  →  finally  →  code sau khối  →  tiếp tục
  (catch bị BỎ QUA hoàn toàn)


KỊCH BẢN B — Có exception và ĐƯỢC bắt
──────────────────────────────────────────────────────────
  try (dừng giữa chừng tại dòng ném)
        ↓
  catch KHỚP kiểu (chạy)
        ↓
  finally
        ↓
  code sau khối  →  tiếp tục BÌNH THƯỜNG
  ⭐ Exception đã được "tiêu hoá", không lan lên trên nữa


KỊCH BẢN C — Có exception nhưng KHÔNG khớp catch nào
──────────────────────────────────────────────────────────
  try (dừng giữa chừng)
        ↓
  (không catch nào khớp — bỏ qua tất cả)
        ↓
  finally  ⭐ VẪN CHẠY!
        ↓
  code sau khối ❌ KHÔNG chạy
        ↓
  exception LAN LÊN tầng gọi
```

> 🔑 **Điểm mấu chốt của kịch bản C:** `finally` chạy **ngay cả khi** exception không được bắt. Đây chính là lý do `finally` tồn tại — nó đảm bảo việc dọn dẹp (đóng file, mở khoá, trả connection) xảy ra **trên mọi con đường thoát khỏi khối**.

### 3.3 Nhiều khối `catch` — thứ tự CỰC KỲ quan trọng

Java chọn khối `catch` theo nguyên tắc **"khớp đầu tiên từ trên xuống"** (first match wins), giống `if-else if`.

```java
import java.io.*;

public class ThuTuCatch {

    // ✅ ĐÚNG: từ CỤ THỂ (con) → TỔNG QUÁT (cha)
    void dungThuTu(String duongDan) {
        try {
            docFile(duongDan);
        } catch (FileNotFoundException e) {      // ① con của IOException
            System.out.println("File không tồn tại: " + duongDan);
        } catch (EOFException e) {               // ② cũng là con của IOException
            System.out.println("File bị cắt cụt giữa chừng");
        } catch (IOException e) {                // ③ cha — hứng phần còn lại
            System.out.println("Lỗi I/O khác: " + e.getMessage());
        }
    }

    // ❌ LỖI BIÊN DỊCH: exception FileNotFoundException has already been caught
    void saiThuTu(String duongDan) {
        try {
            docFile(duongDan);
        } catch (IOException e) {                // cha đứng TRƯỚC → hứng hết
            System.out.println("Lỗi I/O");
        } catch (FileNotFoundException e) {      // ❌ KHÔNG BAO GIỜ tới được đây
            System.out.println("File không tồn tại");
        }
    }
}
```

**Vì sao compiler báo lỗi?** Vì `FileNotFoundException extends IOException`. Khối `catch (IOException e)` đứng trước sẽ bắt **mọi** `IOException`, bao gồm cả `FileNotFoundException`. Khối sau trở thành **code chết** (unreachable), và Java coi code chết là **lỗi biên dịch**, không phải warning.

**Sơ đồ quá trình chọn catch:**

```
   Exception được ném: FileNotFoundException("config.txt")
                    │
                    ▼
   ┌────────────────────────────────────────────────┐
   │ catch (FileNotFoundException e)                │
   │ Hỏi: FileNotFoundException instanceof          │
   │      FileNotFoundException ?  → ✅ CÓ          │
   └────────────────┬───────────────────────────────┘
                    │ KHỚP → chạy khối này, DỪNG TÌM KIẾM
                    ▼
   ┌────────────────────────────────────────────────┐
   │ catch (EOFException e)     ← KHÔNG bao giờ xét │
   │ catch (IOException e)      ← KHÔNG bao giờ xét │
   └────────────────────────────────────────────────┘
```

> 💡 **Mẹo nhớ:** Sắp `catch` giống như sắp cái rây — **lỗ nhỏ nhất (cụ thể nhất) ở trên**, lỗ to nhất (tổng quát nhất) ở dưới. Nếu để cái rây lỗ to lên trên, mọi thứ rơi qua đó hết, các rây dưới vô dụng.

### 3.4 Multi-catch (Java 7+)

Khi nhiều loại exception cần **cùng một cách xử lý**, gộp lại bằng dấu `|`:

```java
// ❌ TRƯỚC JAVA 7: lặp code
try {
    xuLy();
} catch (IOException e) {
    log.error("Xử lý thất bại", e);
    thongBaoAdmin(e);
    throw new XuLyThatBaiException("Không hoàn tất", e);
} catch (SQLException e) {
    log.error("Xử lý thất bại", e);         // ⚠️ lặp y hệt
    thongBaoAdmin(e);                        // ⚠️ lặp
    throw new XuLyThatBaiException("Không hoàn tất", e);   // ⚠️ lặp
}

// ✅ JAVA 7+: multi-catch — DRY
try {
    xuLy();
} catch (IOException | SQLException e) {
    log.error("Xử lý thất bại", e);
    thongBaoAdmin(e);
    throw new XuLyThatBaiException("Không hoàn tất", e);
}
```

**Ba quy tắc quan trọng của multi-catch:**

**① Không được liệt kê hai kiểu có quan hệ cha–con:**

```java
// ❌ LỖI BIÊN DỊCH: Alternatives in a multi-catch statement cannot be related by subclassing
catch (IOException | FileNotFoundException e) { }
//     ^^^^^^^^^^^   ^^^^^^^^^^^^^^^^^^^^^^ là con của IOException → thừa
```

**② Biến `e` là *implicitly final* — không gán lại được:**

```java
// ❌ LỖI BIÊN DỊCH: multi-catch parameter e may not be assigned
catch (IOException | SQLException e) {
    e = new IOException("khác");   // không được phép
}
```

**③ Kiểu tĩnh của `e` là *tổ tiên chung gần nhất* (LUB — least upper bound):**

```java
try {
    lamGiDo();
} catch (IOException | SQLException e) {
    // Kiểu tĩnh của e ở đây là Exception (tổ tiên chung của IOException & SQLException)
    e.getMessage();     // ✅ OK — Exception có method này
    // e.getSQLState(); // ❌ LỖI: Exception không có getSQLState()

    // Muốn dùng method riêng → phải kiểm tra và ép kiểu
    if (e instanceof SQLException sqlEx) {   // pattern matching (Java 16+)
        log.error("SQL state: {}", sqlEx.getSQLState());
    }
}
```

### 3.5 `finally` — luôn chạy, trừ 4 trường hợp

`finally` là **lời hứa** của JVM: khối này sẽ chạy trên **mọi** đường thoát khỏi `try`, kể cả `return`, `break`, `continue`, hay exception.

```java
public class ChungMinhFinally {

    static String coReturn() {
        try {
            System.out.println("  try: chuẩn bị return");
            return "giá trị từ try";
        } finally {
            System.out.println("  finally: chạy TRƯỚC khi return thật sự hoàn tất");
        }
    }

    static void coBreak() {
        for (int i = 0; i < 3; i++) {
            try {
                System.out.println("  vòng lặp i=" + i);
                if (i == 1) break;
            } finally {
                System.out.println("  finally i=" + i);
            }
        }
    }

    public static void main(String[] args) {
        System.out.println("A) return trong try:");
        System.out.println("  → kết quả: " + coReturn());
        System.out.println("B) break trong try:");
        coBreak();
    }
}
```

**Output:**

```
A) return trong try:
  try: chuẩn bị return
  finally: chạy TRƯỚC khi return thật sự hoàn tất
  → kết quả: giá trị từ try
B) break trong try:
  vòng lặp i=0
  finally i=0
  vòng lặp i=1
  finally i=1
```

**Bốn trường hợp `finally` KHÔNG chạy:**

| # | Trường hợp | Giải thích |
|---|------------|------------|
| 1 | `System.exit(n)` trong `try` | JVM tắt ngay lập tức, không unwind stack |
| 2 | `Runtime.getRuntime().halt(n)` | Còn quyết liệt hơn `exit` — bỏ qua cả shutdown hook |
| 3 | JVM crash / bị `kill -9` | Tiến trình chết, không có gì chạy được |
| 4 | Thread bị treo vô hạn trong `try` | Deadlock, vòng lặp vô tận → không bao giờ tới `finally` |

```java
public class FinallyKhongChay {
    public static void main(String[] args) {
        try {
            System.out.println("Trong try");
            System.exit(0);                    // 💥 JVM tắt tại đây
            System.out.println("Không in ra");
        } finally {
            System.out.println("❌ finally KHÔNG BAO GIỜ in ra");
        }
    }
}
```

**Output:**

```
Trong try
```

### 3.6 `return` trong `try` vs `return` trong `finally` — bẫy kinh điển

Đây là câu hỏi phỏng vấn kinh điển. Hãy đọc kỹ 4 thí nghiệm sau.

**Thí nghiệm 1 — `finally` sửa biến local sau khi `try` đã `return`:**

```java
static int thiNghiem1() {
    int x = 1;
    try {
        return x;        // ⭐ Giá trị 1 được COPY vào ô nhớ trả về NGAY TẠI ĐÂY
    } finally {
        x = 99;          // Sửa biến x, nhưng ô nhớ trả về đã giữ giá trị 1
    }
}
// Kết quả: 1  (KHÔNG phải 99!)
```

**Giải thích cơ chế:** Khi gặp `return x`, JVM **đánh giá biểu thức `x` và lưu kết quả vào một ô tạm** (trên stack toán hạng), **rồi mới** chạy `finally`. Việc `finally` sửa biến `x` không ảnh hưởng đến bản sao đã lưu.

**Thí nghiệm 2 — `finally` có `return` riêng (GHI ĐÈ):**

```java
static int thiNghiem2() {
    int x = 1;
    try {
        return x;        // giá trị 1 được ghi vào ô tạm
    } finally {
        return 99;       // ⚠️ Ô tạm bị GHI ĐÈ → hàm trả về 99
    }
}
// Kết quả: 99
```

**Thí nghiệm 3 — `finally` có `return` NUỐT LUÔN exception (nguy hiểm nhất):**

```java
static int thiNghiem3() {
    try {
        throw new RuntimeException("💥 Lỗi cực kỳ nghiêm trọng");
    } finally {
        return -1;       // ⚠️⚠️⚠️ Exception BIẾN MẤT HOÀN TOÀN
    }
}
// Kết quả: -1, KHÔNG có exception nào được ném ra. Lỗi bị nuốt trong im lặng.
```

**Thí nghiệm 4 — object thì sao? (`finally` sửa được nội dung):**

```java
static List<String> thiNghiem4() {
    List<String> ds = new ArrayList<>();
    ds.add("A");
    try {
        return ds;              // COPY tham chiếu (địa chỉ) vào ô tạm
    } finally {
        ds.add("B");            // ⭐ Sửa NỘI DUNG object — tham chiếu không đổi
        ds = new ArrayList<>(); // Gán lại biến → KHÔNG ảnh hưởng ô tạm
        ds.add("C");
    }
}
// Kết quả: [A, B]
```

**Bảng tổng kết:**

| Thí nghiệm | Trong `try` | Trong `finally` | Kết quả | Vì sao |
|------------|-------------|------------------|---------|--------|
| 1 | `return x` (x=1) | `x = 99` | **1** | Giá trị nguyên thuỷ đã được copy |
| 2 | `return x` (x=1) | `return 99` | **99** | `return` trong finally ghi đè ô tạm |
| 3 | `throw` | `return -1` | **-1**, exception mất | `return` trong finally huỷ luôn exception |
| 4 | `return ds` | `ds.add("B")` | **[A, B]** | Tham chiếu được copy, nội dung vẫn sửa được |

> ⛔ **QUY TẮC TUYỆT ĐỐI:** **KHÔNG BAO GIỜ** viết `return`, `break`, `continue`, hay `throw` bên trong khối `finally`. Nó âm thầm huỷ exception và làm luồng điều khiển trở nên không thể suy luận. Mọi công cụ phân tích tĩnh (SonarQube rule `java:S1143`, SpotBugs `FI_...`) đều đánh dấu đây là **lỗi nghiêm trọng**.

### 3.7 Exception ném từ `finally` — nuốt mất exception gốc

```java
public class FinallyNuotException {

    // ❌ SAI: exception trong finally che mất exception gốc
    static void cachSai() throws Exception {
        try {
            throw new IllegalStateException("🔥 LỖI GỐC — nguyên nhân thật");
        } finally {
            throw new RuntimeException("💨 Lỗi khi dọn dẹp");
            // ⚠️ Exception gốc BIẾN MẤT. Bạn chỉ thấy "Lỗi khi dọn dẹp".
        }
    }

    // ✅ ĐÚNG: bảo vệ khối finally, dùng addSuppressed để giữ cả hai
    static void cachDung() {
        IllegalStateException loiGoc = null;
        try {
            throw new IllegalStateException("🔥 LỖI GỐC");
        } catch (IllegalStateException e) {
            loiGoc = e;
            throw e;
        } finally {
            try {
                donDep();   // có thể ném exception
            } catch (RuntimeException loiDonDep) {
                if (loiGoc != null) {
                    loiGoc.addSuppressed(loiDonDep);   // ⭐ Giữ CẢ HAI
                } else {
                    throw loiDonDep;
                }
            }
        }
    }
}
```

Nhìn đoạn "cách đúng" bạn sẽ thấy nó **rất dài dòng và dễ sai**. Đó chính xác là lý do **try-with-resources** ra đời — nó làm toàn bộ việc này **tự động**. Chúng ta sang Phần 4.

### 3.8 Bảng tra cứu luồng thực thi

| Tình huống trong `try` | `catch` khớp? | Thứ tự thực thi | Kết quả cuối cùng |
|------------------------|---------------|------------------|-------------------|
| Chạy bình thường | — | try → finally → sau khối | Bình thường |
| Ném exception | ✅ Có | try(dở) → catch → finally → sau khối | Bình thường (đã xử lý) |
| Ném exception | ❌ Không | try(dở) → finally | Exception lan lên trên |
| `return` trong try | — | try(tới return) → finally → return | Trả giá trị của try |
| `return` trong try + `return` trong finally | — | try(tới return) → finally(return) | Trả giá trị của **finally** |
| Ném exception + `return` trong finally | ❌ Không | try(dở) → finally(return) | Trả giá trị, **exception mất** |
| Ném exception + ném trong finally | ❌ Không | try(dở) → finally(ném) | Exception của **finally** thắng |
| `System.exit()` trong try | — | try(tới exit) | JVM tắt, finally **không** chạy |

---
## Phần 4 — try-with-resources

### 4.1 Vấn đề: đóng tài nguyên bằng `finally` khó hơn bạn tưởng

Hãy thử viết đoạn code "đọc file rồi đóng file" một cách **hoàn toàn đúng** bằng try-finally. Ta sẽ đi qua 4 phiên bản, mỗi phiên bản sửa một lỗi của phiên bản trước.

**Phiên bản 1 — Ngây thơ (rò rỉ tài nguyên):**

```java
// ❌ Nếu đọc lỗi giữa chừng → close() KHÔNG BAO GIỜ được gọi → rò rỉ file handle
BufferedReader reader = new BufferedReader(new FileReader("data.txt"));
String dong = reader.readLine();   // 💥 nếu ném IOException ở đây...
reader.close();                    // ...dòng này không chạy
```

**Phiên bản 2 — Thêm `finally` (vẫn NPE):**

```java
// ❌ Nếu new FileReader ném exception, reader vẫn null → NPE trong finally
BufferedReader reader = null;
try {
    reader = new BufferedReader(new FileReader("khong-ton-tai.txt"));
    return reader.readLine();
} finally {
    reader.close();   // 💥 NullPointerException, che mất FileNotFoundException gốc!
}
```

**Phiên bản 3 — Thêm null check (vẫn nuốt exception gốc):**

```java
// ⚠️ Đã tốt hơn, nhưng close() vẫn có thể ném và NUỐT MẤT exception gốc
BufferedReader reader = null;
try {
    reader = new BufferedReader(new FileReader("data.txt"));
    return reader.readLine();       // 🔥 giả sử ném IOException("Đĩa hỏng")
} finally {
    if (reader != null) {
        reader.close();             // 💨 nếu cũng ném IOException("Không flush được")
    }                               // → exception "Đĩa hỏng" BIẾN MẤT
}
```

**Phiên bản 4 — Hoàn toàn đúng bằng try-finally (kinh hoàng):**

```java
// 😱 Đây là code ĐÚNG HOÀN TOÀN với try-finally. 17 dòng cho một việc đọc 1 dòng file.
BufferedReader reader = null;
IOException loiChinh = null;
try {
    reader = new BufferedReader(new FileReader("data.txt"));
    return reader.readLine();
} catch (IOException e) {
    loiChinh = e;
    throw e;
} finally {
    if (reader != null) {
        if (loiChinh != null) {
            try {
                reader.close();
            } catch (IOException loiDong) {
                loiChinh.addSuppressed(loiDong);   // giữ cả hai
            }
        } else {
            reader.close();
        }
    }
}
```

**Cùng việc đó với try-with-resources:**

```java
// ✅ 3 dòng. Đúng hoàn toàn. Bao gồm cả xử lý suppressed exception.
try (BufferedReader reader = new BufferedReader(new FileReader("data.txt"))) {
    return reader.readLine();
}
```

> 🎯 **Bài học:** try-with-resources không chỉ **ngắn hơn** — nó **đúng hơn**. Nghiên cứu của Oracle khi giới thiệu tính năng này (JSR 334) chỉ ra rằng **phần lớn** code try-finally quản lý tài nguyên trong các thư viện lớn (kể cả trong chính JDK) đều có ít nhất một trong các lỗi trên.

### 4.2 `AutoCloseable` và `Closeable`

Để dùng được trong try-with-resources, class phải implement `AutoCloseable`:

```java
public interface AutoCloseable {
    void close() throws Exception;      // ⭐ Java 7 — ném Exception (rộng)
}

public interface Closeable extends AutoCloseable {
    void close() throws IOException;    // Java 5 — thu hẹp về IOException
}
```

| Tiêu chí | `AutoCloseable` | `Closeable` |
|----------|-----------------|-------------|
| Package | `java.lang` | `java.io` |
| Xuất hiện từ | Java 7 | Java 5 |
| `close()` ném | `Exception` | `IOException` |
| Gọi `close()` 2 lần | **Không** đảm bảo an toàn | **Bắt buộc** idempotent (lần 2 không làm gì) |
| Dùng cho | Mọi loại tài nguyên | Riêng tài nguyên I/O |

**Các tài nguyên phổ biến implement `AutoCloseable`:**

```java
// I/O
InputStream, OutputStream, Reader, Writer
FileInputStream, BufferedReader, FileWriter, PrintWriter
RandomAccessFile, FileChannel

// Mạng
Socket, ServerSocket, DatagramSocket, HttpClient (Java 21+)

// JDBC
Connection, Statement, PreparedStatement, ResultSet

// Streams (Java 8+)
Stream, IntStream, LongStream, DoubleStream   // ⚠️ chỉ cần close khi nguồn là file

// Concurrency (Java 19+)
ExecutorService, StructuredTaskScope

// Khác
ZipFile, JarFile, Scanner, Formatter, DirectoryStream, Lock (không — Lock KHÔNG AutoCloseable)
```

### 4.3 Cú pháp và thứ tự đóng LIFO

```java
// Một tài nguyên
try (BufferedReader r = Files.newBufferedReader(Path.of("in.txt"))) {
    System.out.println(r.readLine());
}

// Nhiều tài nguyên — ngăn cách bằng dấu chấm phẩy
try (BufferedReader r = Files.newBufferedReader(Path.of("in.txt"));
     BufferedWriter w = Files.newBufferedWriter(Path.of("out.txt"))) {
    String dong;
    while ((dong = r.readLine()) != null) {
        w.write(dong.toUpperCase());
        w.newLine();
    }
}
// ⭐ w.close() được gọi TRƯỚC r.close() — thứ tự NGƯỢC với khai báo (LIFO)

// Kết hợp với catch và finally
try (var conn = dataSource.getConnection()) {
    // ...
} catch (SQLException e) {
    log.error("Lỗi DB", e);
} finally {
    log.info("Đã xong");   // finally chạy SAU khi tài nguyên đã đóng
}
```

**Chứng minh thứ tự LIFO bằng thực nghiệm:**

```java
public class ThuTuDong {

    record TaiNguyen(String ten) implements AutoCloseable {
        TaiNguyen {
            System.out.println("  MỞ  " + ten);
        }
        @Override public void close() {
            System.out.println("  ĐÓNG " + ten);
        }
    }

    public static void main(String[] args) {
        System.out.println("Bắt đầu:");
        try (TaiNguyen a = new TaiNguyen("A");
             TaiNguyen b = new TaiNguyen("B");
             TaiNguyen c = new TaiNguyen("C")) {
            System.out.println("  --- thân try ---");
        }
        System.out.println("Kết thúc.");
    }
}
```

**Output:**

```
Bắt đầu:
  MỞ  A
  MỞ  B
  MỞ  C
  --- thân try ---
  ĐÓNG C
  ĐÓNG B
  ĐÓNG A
Kết thúc.
```

> 🔑 **Vì sao LIFO quan trọng?** Vì tài nguyên sau **thường phụ thuộc** vào tài nguyên trước. Ví dụ JDBC: `Connection` → `PreparedStatement` → `ResultSet`. Nếu đóng `Connection` trước, `ResultSet` trở thành mồ côi và `close()` của nó sẽ ném lỗi. LIFO đảm bảo con luôn được đóng trước cha.

```java
// Ví dụ JDBC — LIFO là bắt buộc về mặt logic
try (Connection conn = dataSource.getConnection();
     PreparedStatement ps = conn.prepareStatement("SELECT * FROM don_hang WHERE id = ?")) {

    ps.setLong(1, donHangId);

    try (ResultSet rs = ps.executeQuery()) {     // ResultSet lồng bên trong
        return rs.next() ? anXa(rs) : null;
    }   // rs.close()
}   // ps.close() rồi mới conn.close() — ĐÚNG thứ tự phụ thuộc
```

### 4.4 Suppressed Exceptions — tính năng "sát thủ"

Đây là điều try-with-resources làm mà try-finally **không tự làm được**.

**Kịch bản:** Thân `try` ném exception A. Trong lúc đóng, `close()` ném exception B. **Bạn muốn thấy cái nào?**

- Với **try-finally**: bạn thấy **B**, và **A biến mất vĩnh viễn**. Nhưng A mới là nguyên nhân thật!
- Với **try-with-resources**: bạn thấy **A** (exception chính), còn **B được gắn vào A** dưới dạng **suppressed** — không mất gì cả.

```java
public class ChungMinhSuppressed {

    static class TaiNguyenXau implements AutoCloseable {
        @Override
        public void close() {
            throw new IllegalStateException("💨 Lỗi KHI ĐÓNG tài nguyên");
        }
    }

    public static void main(String[] args) {
        try {
            try (TaiNguyenXau tn = new TaiNguyenXau()) {
                throw new RuntimeException("🔥 Lỗi CHÍNH trong thân try");
            }
        } catch (Exception e) {
            System.out.println("Exception chính  : " + e.getMessage());
            for (Throwable bi : e.getSuppressed()) {
                System.out.println("  ↳ Bị át       : " + bi.getMessage());
            }
        }
    }
}
```

**Output:**

```
Exception chính  : 🔥 Lỗi CHÍNH trong thân try
  ↳ Bị át       : 💨 Lỗi KHI ĐÓNG tài nguyên
```

**Khi in stack trace đầy đủ, bạn sẽ thấy:**

```
java.lang.RuntimeException: 🔥 Lỗi CHÍNH trong thân try
	at ChungMinhSuppressed.main(ChungMinhSuppressed.java:14)
	Suppressed: java.lang.IllegalStateException: 💨 Lỗi KHI ĐÓNG tài nguyên
		at ChungMinhSuppressed$TaiNguyenXau.close(ChungMinhSuppressed.java:8)
		at ChungMinhSuppressed.main(ChungMinhSuppressed.java:13)
```

**Quy tắc quyết định "ai là chính, ai bị át":**

```
┌────────────────────────────────────────────────────────────────┐
│  Thân try ném?     close() ném?     Kết quả                    │
├────────────────────────────────────────────────────────────────┤
│  Không             Không            Không có exception          │
│  Không             CÓ (B)           B được ném ra (là chính)    │
│  CÓ (A)            Không            A được ném ra               │
│  CÓ (A)            CÓ (B)           ⭐ A ném ra,                │
│                                        B → A.getSuppressed()    │
└────────────────────────────────────────────────────────────────┘
Nguyên tắc: exception của THÂN TRY luôn ưu tiên — vì nó gần với
nguyên nhân nghiệp vụ hơn exception lúc dọn dẹp.
```

> ⚠️ **Cảnh báo thực chiến:** Nếu bạn dùng logger mà chỉ log `e.getMessage()`, bạn sẽ **không bao giờ nhìn thấy** suppressed exception. Hãy luôn log cả object exception: `log.error("Thất bại", e)` — SLF4J/Logback sẽ in đầy đủ cả `Caused by:` và `Suppressed:`.

### 4.5 Java 9 — dùng biến có sẵn (effectively final)

Trước Java 9, bạn **bắt buộc** phải khai báo biến ngay trong ngoặc `try(...)`:

```java
// Java 7/8 — phải khai báo biến mới, kể cả khi đã có sẵn
BufferedReader coSan = taoReader();
try (BufferedReader tam = coSan) {    // 😖 biến "tam" thừa thãi
    return tam.readLine();
}

// ✅ Java 9+ — dùng thẳng biến đã có, miễn là effectively final
BufferedReader coSan = taoReader();
try (coSan) {
    return coSan.readLine();
}
```

**Điều kiện:** biến phải là `final` hoặc **effectively final** (khai báo xong không gán lại).

```java
// ❌ LỖI BIÊN DỊCH: local variables referenced from a resource must be final
BufferedReader r = taoReader();
r = taoReaderKhac();        // gán lại → không còn effectively final
try (r) { }                 // error
```

### 4.6 Compiler thực sự sinh ra gì? (de-sugaring)

try-with-resources là **đường cú pháp** (syntactic sugar). Compiler biến đổi:

```java
// BẠN VIẾT:
try (Resource r = new Resource()) {
    r.dung();
}
```

```java
// COMPILER SINH RA (đơn giản hoá):
Resource r = new Resource();
Throwable loiChinh = null;
try {
    r.dung();
} catch (Throwable t) {
    loiChinh = t;
    throw t;
} finally {
    if (r != null) {
        if (loiChinh != null) {
            try {
                r.close();
            } catch (Throwable loiDong) {
                loiChinh.addSuppressed(loiDong);   // ⭐ đây là phép màu
            }
        } else {
            r.close();
        }
    }
}
```

Hiểu được đoạn này, bạn hiểu **tất cả** hành vi của try-with-resources: vì sao có suppressed, vì sao null-safe, vì sao đóng theo LIFO (compiler sinh các khối lồng nhau cho nhiều tài nguyên).

### 4.7 Bảng so sánh try-finally vs try-with-resources

| Tiêu chí | try-finally | try-with-resources |
|----------|-------------|--------------------|
| Số dòng cho 1 tài nguyên | ~10–17 dòng (làm đúng) | **3 dòng** |
| Số dòng cho 2 tài nguyên | ~25–30 dòng (lồng nhau) | **4 dòng** |
| Tự động null-safe | ❌ Phải tự kiểm tra | ✅ Có |
| Thứ tự đóng LIFO | ❌ Tự lo, dễ sai | ✅ Tự động |
| Giữ exception gốc khi `close()` lỗi | ❌ Mất, trừ khi viết tay `addSuppressed` | ✅ Tự động |
| Đóng cả khi có `return`/`break` | ✅ Có | ✅ Có |
| Khả năng quên đóng | Cao | **Bằng 0** |
| Đọc dễ | Trung bình | Rất dễ |
| Yêu cầu | Bất kỳ object | Phải implement `AutoCloseable` |

> ✅ **Quy tắc:** **Bất kỳ thứ gì implement `AutoCloseable` đều PHẢI dùng try-with-resources.** Không có ngoại lệ trong code mới. Nếu class của bên thứ ba không implement `AutoCloseable`, hãy bọc nó bằng một adapter nhỏ.

### 4.8 Tự viết tài nguyên của riêng bạn

```java
/**
 * Đo thời gian thực thi một khối code — dùng try-with-resources làm "block scope timer".
 * Đây là mẹo dùng AutoCloseable cho việc KHÔNG PHẢI I/O.
 */
public final class DongHo implements AutoCloseable {

    private static final Logger log = LoggerFactory.getLogger(DongHo.class);

    private final String tenViec;
    private final long batDau;

    public DongHo(String tenViec) {
        this.tenViec = tenViec;
        this.batDau = System.nanoTime();
        log.debug("▶ Bắt đầu: {}", tenViec);
    }

    @Override
    public void close() {
        long mili = (System.nanoTime() - batDau) / 1_000_000;
        log.info("■ {} hoàn tất trong {} ms", tenViec, mili);
    }
}

// Cách dùng — close() tự chạy kể cả khi có exception
try (DongHo dh = new DongHo("Xử lý đơn hàng #1042")) {
    kiemTraTonKho(donHang);
    thanhToan(donHang);
    guiEmail(donHang);
}
// Log: ■ Xử lý đơn hàng #1042 hoàn tất trong 348 ms
```

Một ví dụ khác cực kỳ hữu ích — tự động mở khoá:

```java
/** Bọc ReentrantLock thành AutoCloseable để dùng try-with-resources */
public final class KhoaTuDong implements AutoCloseable {

    private final Lock khoa;

    private KhoaTuDong(Lock khoa) {
        this.khoa = khoa;
        khoa.lock();
    }

    public static KhoaTuDong khoaLai(Lock khoa) {
        return new KhoaTuDong(khoa);
    }

    @Override
    public void close() {
        khoa.unlock();   // ⭐ Luôn mở khoá, kể cả khi thân try ném exception
    }
}

// Trước: dễ quên unlock, hoặc unlock sai chỗ
lock.lock();
try {
    capNhatSoDu();
} finally {
    lock.unlock();
}

// Sau: gọn hơn, không thể quên
try (var k = KhoaTuDong.khoaLai(lock)) {
    capNhatSoDu();
}
```

---

## Phần 5 — Từ Khoá throw và throws

Hai từ khoá này chỉ khác nhau một chữ `s` nhưng vai trò hoàn toàn khác nhau. Đây là một trong những nhầm lẫn phổ biến nhất của người mới.

### 5.1 Phân biệt trong 30 giây

| | `throw` | `throws` |
|--|---------|----------|
| Là gì | **Câu lệnh** — hành động ném | **Mệnh đề** trong chữ ký method — lời khai báo |
| Vị trí | Bên trong thân method | Sau danh sách tham số của method |
| Đi kèm | Một **đối tượng** `Throwable` | Một hoặc nhiều **tên class** exception |
| Số lượng | Một object mỗi lần | Nhiều class, ngăn cách bằng dấu phẩy |
| Ý nghĩa | "Tôi **đang** ném lỗi này ngay bây giờ" | "Tôi **có thể** ném các lỗi này, hãy chuẩn bị" |
| Ví dụ | `throw new IOException("hỏng");` | `void doc() throws IOException, SQLException` |

```java
public class ThrowVsThrows {

    // "throws" — LỜI KHAI BÁO trên chữ ký
    void taiFile(String url) throws IOException, InterruptedException {
        //                  ^^^^^^ khai báo: method này có thể ném 2 loại này

        if (url == null) {
            throw new IllegalArgumentException("url không được null");
            // ^^^^^ hành động NÉM ngay lập tức
        }

        // ... code có thể ném IOException / InterruptedException
    }
}
```

### 5.2 `throw` — ném exception

```java
// Cú pháp: throw <biểu thức trả về Throwable>;

throw new IllegalArgumentException("Số lượng phải > 0");        // tạo mới rồi ném
throw daBatDuoc;                                                 // ném lại object đã có
throw taoException(maLoi);                                       // ném kết quả của method

// ❌ Ném null → luôn thành NullPointerException
Throwable t = null;
throw t;    // ném NPE, không phải null
```

**Sau `throw`, code không thể tiếp tục — compiler biết điều đó:**

```java
void viDu() {
    throw new RuntimeException("dừng");
    System.out.println("x");   // ❌ LỖI BIÊN DỊCH: unreachable statement
}

// Nhờ vậy, method trả về giá trị không cần return sau throw
int layGiaTri(boolean hopLe) {
    if (hopLe) {
        return 42;
    }
    throw new IllegalStateException("không hợp lệ");
    // ✅ Không cần "return -1" ở đây — compiler biết luồng đã kết thúc
}
```

### 5.3 `throws` — khai báo

```java
// Một exception
void doc() throws IOException { }

// Nhiều exception
void xuLy() throws IOException, SQLException, InterruptedException { }

// Khai báo class cha để bao hàm nhiều con (⚠️ quá rộng — xem mục 9)
void mongLung() throws Exception { }

// Khai báo unchecked (hợp lệ, thuần tuý mang tính TÀI LIỆU)
void kiemTra(int n) throws IllegalArgumentException { }
```

**Ba điều cần biết:**

**① Khai báo `throws` cho unchecked không có tác dụng bắt buộc:**

```java
void a() throws IllegalArgumentException { throw new IllegalArgumentException("x"); }

void b() {
    a();   // ✅ KHÔNG cần try-catch — vì IllegalArgumentException là unchecked
}
```

Nó chỉ giúp IDE và JavaDoc hiển thị thông tin. Nhiều team coi đây là **cách tự tài liệu hoá tốt**, nhưng nên ưu tiên `@throws` trong JavaDoc hơn.

**② Khai báo `throws` mà không bao giờ ném — hợp lệ nhưng gây hiểu nhầm:**

```java
// ⚠️ Hợp lệ, nhưng ép mọi người gọi phải try-catch một cách vô nghĩa
void changBaoGioLoi() throws IOException {
    System.out.println("Tôi không bao giờ ném IOException");
}
```

**③ Không thể `catch` một checked exception mà khối `try` không thể ném:**

```java
// ❌ LỖI BIÊN DỊCH: exception IOException is never thrown in body of corresponding try
try {
    System.out.println("an toàn");
} catch (IOException e) { }

// ✅ Nhưng catch Exception thì LUÔN hợp lệ (vì RuntimeException có thể xảy ra bất cứ đâu)
try {
    System.out.println("an toàn");
} catch (Exception e) { }
```

### 5.4 `catch` tại chỗ hay `throws` lên trên? — tiêu chí quyết định

```
                Method của bạn gặp một exception
                              │
                              ▼
        ┌──────────────────────────────────────────────┐
        │ Bạn có ĐỦ THÔNG TIN để quyết định phải làm gì │
        │ với lỗi này ngay tại đây không?               │
        └───────────────────┬──────────────────────────┘
                 YES        │        NO
        ┌───────────────────┘────────────────────┐
        ▼                                        ▼
┌────────────────────────┐        ┌──────────────────────────────┐
│ CATCH tại chỗ          │        │ Bạn có cần THÊM NGỮ CẢNH     │
│                        │        │ vào exception không?          │
│ Ví dụ:                 │        └───────────────┬──────────────┘
│ • Có giá trị mặc định  │              YES       │       NO
│ • Retry được           │        ┌───────────────┘───────────┐
│ • Có nguồn dự phòng    │        ▼                           ▼
│ • Đây là tầng ngoài    │  ┌──────────────────┐   ┌────────────────────┐
│   cùng (controller)    │  │ CATCH rồi        │   │ THROWS — để nguyên │
└────────────────────────┘  │ THROW exception  │   │ cho tầng trên xử lý│
                            │ mới, GIỮ cause   │   └────────────────────┘
                            └──────────────────┘
```

**Ví dụ minh hoạ cả ba lựa chọn:**

```java
public class BaLuaChon {

    // ① CATCH tại chỗ — vì có phương án dự phòng rõ ràng
    public TyGia layTyGia(String maTien) {
        try {
            return apiNganHang.layTyGia(maTien);      // gọi API ngoài
        } catch (IOException e) {
            log.warn("Không gọi được API tỷ giá cho {}, dùng cache", maTien, e);
            return cache.layTyGiaGanNhat(maTien);     // ⭐ có fallback → xử lý tại chỗ
        }
    }

    // ② CATCH + WRAP — thêm ngữ cảnh nghiệp vụ, giữ nguyên cause
    public DonHang taoDonHang(YeuCauDatHang yeuCau) {
        try {
            return kho.luu(dungDonHang(yeuCau));
        } catch (TruyCapDuLieuException e) {
            // Thêm ngữ cảnh: KHÁCH NÀO, ĐƠN GÌ — thông tin mà tầng dưới không có
            throw new TaoDonHangThatBaiException(
                    "Không tạo được đơn cho khách " + yeuCau.khachHangId(), e);
        }
    }

    // ③ THROWS — không có gì để làm, đẩy lên trên
    public String docNoiDung(Path duongDan) throws IOException {
        return Files.readString(duongDan);
        // ⭐ Không catch: method này không biết phải làm gì khi file lỗi.
        //    Người gọi mới biết (dùng mặc định? báo user? thử file khác?)
    }
}
```

> ⛔ **Anti-pattern kinh điển:** `catch` rồi `throw` **y nguyên** exception đó mà không làm gì thêm.
> ```java
> // ❌ Vô nghĩa — chỉ thêm rác
> try {
>     lamGiDo();
> } catch (IOException e) {
>     throw e;      // Không thêm gì cả → sao không dùng throws?
> }
> ```
> Nếu bạn không thêm log, không thêm ngữ cảnh, không bọc lại — hãy dùng `throws` và xoá khối try-catch.

### 5.5 Ràng buộc khi override method

Đây là chủ đề hay bị hỏi trong phỏng vấn và cũng hay gây lỗi biên dịch bí ẩn.

> **Luật:** Method override **KHÔNG được** khai báo checked exception **rộng hơn** hoặc **mới** so với method của lớp cha/interface. (Unchecked thì thoải mái.)

```java
class Cha {
    void lam() throws IOException { }
}

class Con1 extends Cha {
    @Override
    void lam() throws IOException { }             // ✅ giống hệt — OK
}

class Con2 extends Cha {
    @Override
    void lam() throws FileNotFoundException { }   // ✅ HẸP HƠN (con của IOException) — OK
}

class Con3 extends Cha {
    @Override
    void lam() { }                                // ✅ KHÔNG ném gì — OK, hẹp nhất
}

class Con4 extends Cha {
    @Override
    void lam() throws Exception { }               // ❌ LỖI: rộng hơn IOException
}

class Con5 extends Cha {
    @Override
    void lam() throws SQLException { }            // ❌ LỖI: exception MỚI, không phải con
}

class Con6 extends Cha {
    @Override
    void lam() throws IllegalStateException { }   // ✅ OK — unchecked luôn được phép
}
```

**Vì sao có luật này?** Vì **nguyên lý thay thế Liskov**: code viết cho `Cha` phải chạy được với bất kỳ `Con` nào.

```java
Cha doiTuong = new Con5();          // giả sử Con5 hợp lệ
try {
    doiTuong.lam();
} catch (IOException e) { }
// 💥 Nếu Con5 ném SQLException, khối catch này không bắt được
//    → chương trình nổ ở chỗ compiler đã "hứa" là an toàn.
// Luật override tồn tại để điều đó KHÔNG BAO GIỜ xảy ra.
```

**Ứng dụng quan trọng — `AutoCloseable` khuyến khích thu hẹp:**

```java
public interface AutoCloseable {
    void close() throws Exception;
}

// ✅ Cài đặt tốt: thu hẹp về không ném gì → người dùng không phải catch
public class TaiNguyenSach implements AutoCloseable {
    @Override
    public void close() {              // ⭐ Không throws — người dùng thoải mái
        // dọn dẹp, đảm bảo không ném
    }
}

// ⚠️ Cài đặt kém: giữ nguyên throws Exception
public class TaiNguyenPhien implements AutoCloseable {
    @Override
    public void close() throws Exception {
        // → mọi try-with-resources dùng class này đều phải catch Exception 😖
    }
}
```

### 5.6 Precise rethrow (Java 7+)

Trước Java 7, compiler suy luận kiểu exception khá "ngốc":

```java
// Java 6 — compiler chỉ nhìn kiểu khai báo của biến e là Exception
// → bắt buộc phải khai báo "throws Exception"
void cu() throws Exception {
    try {
        neuA();   // throws IOException
        neuB();   // throws SQLException
    } catch (Exception e) {
        log.error("lỗi", e);
        throw e;   // Java 6: compiler nghĩ đây có thể là BẤT KỲ Exception nào
    }
}

// ✅ Java 7+ — precise rethrow: compiler PHÂN TÍCH thân try
void moi() throws IOException, SQLException {   // ⭐ chính xác hơn nhiều!
    try {
        neuA();   // throws IOException
        neuB();   // throws SQLException
    } catch (Exception e) {
        log.error("lỗi", e);
        throw e;   // Java 7+: compiler biết e CHỈ có thể là IOException hoặc SQLException
    }
}
```

**Điều kiện để precise rethrow hoạt động:** biến `e` phải là **final** hoặc **effectively final** (không gán lại trong khối catch).

---

## Phần 6 — Custom Exceptions

### 6.1 Khi nào cần tự tạo exception?

Không phải lúc nào cũng cần. Hãy dùng exception có sẵn của JDK khi phù hợp:

| Tình huống | Dùng exception có sẵn | Tạo custom |
|------------|----------------------|------------|
| Tham số `null` không hợp lệ | ✅ `NullPointerException` / `IllegalArgumentException` | ❌ Thừa |
| Tham số ngoài phạm vi | ✅ `IllegalArgumentException` | ❌ Thừa |
| Object sai trạng thái | ✅ `IllegalStateException` | ❌ Thừa |
| Thao tác chưa hỗ trợ | ✅ `UnsupportedOperationException` | ❌ Thừa |
| **Không tìm thấy khách hàng** | ❌ Quá chung chung | ✅ `KhachHangKhongTonTaiException` |
| **Số dư không đủ** | ❌ Mất thông tin nghiệp vụ | ✅ `SoDuKhongDuException` |
| **Đơn hàng đã bị huỷ** | ❌ | ✅ `DonHangDaHuyException` |
| **Vi phạm quy tắc kinh doanh** | ❌ | ✅ `ViPhamQuyTacException` |

> 🎯 **Tiêu chí:** Tạo custom exception khi bạn cần **(a)** phân biệt loại lỗi để xử lý khác nhau (ví dụ map sang HTTP status khác nhau), hoặc **(b)** mang theo **dữ liệu nghiệp vụ** mà `String message` không diễn tả nổi.

### 6.2 Bốn constructor chuẩn

Mọi custom exception nên có đủ 4 constructor mirror từ `Throwable`:

```java
/**
 * Ném khi không tìm thấy tài nguyên theo định danh.
 * <p>Unchecked vì người gọi thường không thể "phục hồi" — chỉ báo lỗi lên trên.</p>
 */
public class KhongTimThayTaiNguyenException extends RuntimeException {

    /** ① Không tham số — hiếm dùng, nhưng nên có cho đầy đủ */
    public KhongTimThayTaiNguyenException() {
        super();
    }

    /** ② Chỉ message — dùng nhiều nhất khi không có cause */
    public KhongTimThayTaiNguyenException(String message) {
        super(message);
    }

    /** ③ ⭐ Message + cause — QUAN TRỌNG NHẤT, dùng khi bọc exception khác */
    public KhongTimThayTaiNguyenException(String message, Throwable cause) {
        super(message, cause);
    }

    /** ④ Chỉ cause — message tự lấy từ cause.toString() */
    public KhongTimThayTaiNguyenException(Throwable cause) {
        super(cause);
    }
}
```

> ⚠️ **Lỗi số 1 khi tạo custom exception:** Chỉ viết constructor `(String message)` mà quên `(String message, Throwable cause)`. Hậu quả: khi bọc exception, bạn **buộc** phải vứt bỏ cause → **mất root cause vĩnh viễn** → debug production trở thành ác mộng. Đây là lỗi tôi thấy nhiều nhất trong code review.

### 6.3 Thêm dữ liệu nghiệp vụ — sức mạnh thật của custom exception

Đây mới là lý do chính đáng nhất để tạo custom exception:

```java
import java.math.BigDecimal;

/**
 * Ném khi tài khoản không đủ số dư để thực hiện giao dịch.
 *
 * <p>Mang theo dữ liệu nghiệp vụ để tầng trên có thể:
 * <ul>
 *   <li>Hiển thị cho người dùng "bạn còn thiếu X đồng"</li>
 *   <li>Ghi log kiểm toán với đầy đủ số liệu</li>
 *   <li>Kích hoạt luồng nạp tiền tự động</li>
 * </ul>
 */
public class SoDuKhongDuException extends RuntimeException {

    // ⭐ Các field PHẢI là final — exception là object BẤT BIẾN
    private final Long taiKhoanId;
    private final BigDecimal soTienCan;
    private final BigDecimal soDuHienTai;

    public SoDuKhongDuException(Long taiKhoanId,
                                BigDecimal soTienCan,
                                BigDecimal soDuHienTai) {
        // Message tự sinh — luôn nhất quán, luôn đầy đủ
        super(String.format(
                "Tài khoản %d không đủ số dư: cần %s, hiện có %s, thiếu %s",
                taiKhoanId, soTienCan, soDuHienTai,
                soTienCan.subtract(soDuHienTai)));
        this.taiKhoanId  = taiKhoanId;
        this.soTienCan   = soTienCan;
        this.soDuHienTai = soDuHienTai;
    }

    public Long getTaiKhoanId()          { return taiKhoanId; }
    public BigDecimal getSoTienCan()     { return soTienCan; }
    public BigDecimal getSoDuHienTai()   { return soDuHienTai; }

    /** Tiện ích nghiệp vụ — tính ngay số tiền còn thiếu */
    public BigDecimal getSoTienThieu() {
        return soTienCan.subtract(soDuHienTai);
    }
}
```

**Tầng trên khai thác dữ liệu này:**

```java
@ExceptionHandler(SoDuKhongDuException.class)
public ResponseEntity<ErrorResponse> xuLy(SoDuKhongDuException ex) {
    // ⭐ Không phải parse chuỗi! Lấy trực tiếp dữ liệu có kiểu.
    var chiTiet = Map.of(
            "soTienCan",   ex.getSoTienCan(),
            "soDuHienTai", ex.getSoDuHienTai(),
            "soTienThieu", ex.getSoTienThieu()
    );
    return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
            .body(new ErrorResponse("SO_DU_KHONG_DU", ex.getMessage(), chiTiet));
}
```

So sánh với cách làm tệ:

```java
// ❌ Dữ liệu bị "chôn" trong chuỗi — tầng trên phải parse regex 😱
throw new RuntimeException("Không đủ tiền: cần 1000000, có 250000");
```

### 6.4 Thiết kế cây exception cho ứng dụng

Đừng tạo 30 exception phẳng lì. Hãy dựng **cây** để có thể bắt theo nhóm:

```
RuntimeException
   │
   └── ShopException                          ← ⭐ GỐC của mọi lỗi ứng dụng
          │      (có mã lỗi + HTTP status)
          │
          ├── LoiNghiepVuException             ← lỗi do người dùng / quy tắc kinh doanh
          │      ├── KhongTimThayException          → HTTP 404
          │      │      ├── KhachHangKhongTonTaiException
          │      │      ├── SanPhamKhongTonTaiException
          │      │      └── DonHangKhongTonTaiException
          │      ├── ViPhamRangBuocException         → HTTP 409
          │      │      ├── KhongDuTonKhoException
          │      │      ├── SoDuKhongDuException
          │      │      └── EmailDaTonTaiException
          │      └── DuLieuKhongHopLeException       → HTTP 400
          │
          └── LoiHaTangException                ← lỗi kỹ thuật, không phải lỗi user
                 ├── TruyCapDuLieuException          → HTTP 500
                 ├── DichVuNgoaiException            → HTTP 502
                 └── TimeoutException                → HTTP 504
```

**Cài đặt lớp gốc:**

```java
/**
 * Lớp gốc của mọi exception nghiệp vụ trong ứng dụng.
 * Mang theo mã lỗi ổn định để client xử lý bằng code (không phụ thuộc message tiếng Việt).
 */
public abstract class ShopException extends RuntimeException {

    private final String maLoi;

    protected ShopException(String maLoi, String message) {
        super(message);
        this.maLoi = maLoi;
    }

    protected ShopException(String maLoi, String message, Throwable cause) {
        super(message, cause);
        this.maLoi = maLoi;
    }

    public String getMaLoi() {
        return maLoi;
    }

    /** Mỗi nhánh tự quyết định HTTP status tương ứng */
    public abstract HttpStatus getHttpStatus();
}

/** Nhánh 404 */
public abstract class KhongTimThayException extends ShopException {
    protected KhongTimThayException(String maLoi, String message) {
        super(maLoi, message);
    }
    @Override public HttpStatus getHttpStatus() { return HttpStatus.NOT_FOUND; }
}

/** Lá cụ thể */
public class KhachHangKhongTonTaiException extends KhongTimThayException {
    private final Long khachHangId;

    public KhachHangKhongTonTaiException(Long khachHangId) {
        super("KHACH_HANG_KHONG_TON_TAI", "Không tìm thấy khách hàng id=" + khachHangId);
        this.khachHangId = khachHangId;
    }

    public Long getKhachHangId() { return khachHangId; }
}
```

**Lợi ích khổng lồ khi có cây:** chỉ cần **một** handler bắt cả nhóm:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ⭐ MỘT handler cho TẤT CẢ exception nghiệp vụ — nhờ có cây kế thừa
    @ExceptionHandler(ShopException.class)
    public ResponseEntity<ErrorResponse> xuLyLoiUngDung(ShopException ex) {
        return ResponseEntity.status(ex.getHttpStatus())
                .body(new ErrorResponse(ex.getMaLoi(), ex.getMessage()));
    }
}
```

Nếu không có cây, bạn phải viết 15 handler gần như giống hệt nhau.

### 6.5 Checked hay unchecked cho custom exception?

Áp dụng cây quyết định ở mục 2.4. Trong thực tế với Spring Boot:

```java
// ✅ 95% trường hợp — unchecked
public class KhongDuTonKhoException extends RuntimeException { }

// ⚠️ 5% trường hợp — checked, khi BẮT BUỘC người gọi phải có kế hoạch
public class GhiSoKiemToanThatBaiException extends Exception { }
//     (mất log kiểm toán = vi phạm quy định pháp lý → PHẢI xử lý, không được bỏ qua)
```

### 6.6 Chi tiết kỹ thuật cần biết

**① `serialVersionUID`** — `Throwable` implement `Serializable`, nên IDE sẽ cảnh báo:

```java
public class MyException extends RuntimeException {
    private static final long serialVersionUID = 1L;   // dập tắt cảnh báo, ổn định khi serialize
    // ...
}
```

**② Field trong exception phải `Serializable`:**

```java
// ❌ Nguy hiểm: nếu exception bị serialize (RMI, session), sẽ nổ NotSerializableException
public class LoiXuLyException extends RuntimeException {
    private final Connection connection;   // ❌ Connection KHÔNG Serializable
}

// ✅ Chỉ giữ dữ liệu đơn giản, serializable
public class LoiXuLyException extends RuntimeException {
    private final Long donHangId;      // ✅ Long serializable
    private final String maGiaoDich;   // ✅ String serializable
}
```

**③ Exception "nhẹ" — tắt stack trace khi cần hiệu năng:**

Việc tạo stack trace là phần **đắt nhất** khi tạo exception (`fillInStackTrace()` là native method, phải duyệt toàn bộ call stack). Nếu bạn dùng exception cho **luồng điều khiển được biết trước** ở nơi cực nóng (không khuyến khích, nhưng đôi khi cần — ví dụ parser), có thể tắt:

```java
/**
 * Exception siêu nhẹ — KHÔNG chụp stack trace.
 * ⚠️ Chỉ dùng khi: (a) đo đạc chứng minh stack trace là nút thắt hiệu năng,
 *                  (b) exception này KHÔNG cần debug (vị trí luôn hiển nhiên).
 */
public class KetThucSomException extends RuntimeException {

    public static final KetThucSomException INSTANCE = new KetThucSomException();

    private KetThucSomException() {
        // message, cause, enableSuppression, writableStackTrace
        super(null, null, false, false);   // ⭐ hai false cuối = tắt suppression + stack trace
    }
}
```

**Đo đạc thực tế (JMH, máy tham chiếu):**

| Thao tác | Thời gian xấp xỉ |
|----------|------------------|
| Tạo exception **có** stack trace (stack sâu 10) | ~2.000 ns |
| Tạo exception **có** stack trace (stack sâu 100) | ~15.000 ns |
| Tạo exception **không** stack trace | ~15 ns |
| Ném + bắt exception (không tính tạo) | ~10 ns |

> 💡 **Kết luận quan trọng:** Chi phí không nằm ở `throw`/`catch` mà nằm ở việc **chụp stack trace**. Và trong 99,9% ứng dụng nghiệp vụ, chi phí này **hoàn toàn không đáng kể** so với một truy vấn database (~1.000.000 ns). **Đừng tối ưu sớm.** Chỉ tắt stack trace khi có số đo chứng minh.

---
## Phần 7 — Exception Chaining & Root Cause

### 7.1 Vấn đề: mất dấu vết nguyên nhân gốc

```java
// ❌ THẢM HOẠ: bọc mà VỨT BỎ cause
public KhachHang timKhachHang(Long id) {
    try {
        return jdbcTemplate.queryForObject(SQL, MAPPER, id);
    } catch (SQLException e) {
        throw new TruyCapDuLieuException("Lỗi truy vấn khách hàng");   // ⚠️ e bị VỨT
    }
}
```

Log production của bạn:

```
com.shop.exception.TruyCapDuLieuException: Lỗi truy vấn khách hàng
	at com.shop.repository.KhachHangRepository.timKhachHang(KhachHangRepository.java:34)
	at com.shop.service.KhachHangService.lay(KhachHangService.java:22)
	... 45 more
```

Bạn biết được gì? **Gần như không gì cả.** Lỗi kết nối? Timeout? Cú pháp SQL sai? Deadlock? Bảng không tồn tại? Bạn phải mở IDE, đọc code, đoán mò, thử tái hiện.

```java
// ✅ ĐÚNG: giữ nguyên cause
public KhachHang timKhachHang(Long id) {
    try {
        return jdbcTemplate.queryForObject(SQL, MAPPER, id);
    } catch (SQLException e) {
        throw new TruyCapDuLieuException("Lỗi truy vấn khách hàng id=" + id, e);
        //                                                                  ^ CHÌA KHOÁ
    }
}
```

Log production bây giờ:

```
com.shop.exception.TruyCapDuLieuException: Lỗi truy vấn khách hàng id=1042
	at com.shop.repository.KhachHangRepository.timKhachHang(KhachHangRepository.java:34)
	at com.shop.service.KhachHangService.lay(KhachHangService.java:22)
	... 45 more
Caused by: java.sql.SQLException: Connection is not available, request timed out after 30000ms
	at com.zaxxer.hikari.pool.HikariPool.createTimeoutException(HikariPool.java:696)
	at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:197)
	... 52 more
```

**Chẩn đoán trong 3 giây:** connection pool cạn kiệt. Đi tìm chỗ rò rỉ connection hoặc tăng `maximum-pool-size`. Xong.

> 💎 **Cause là thứ đắt giá nhất trong exception handling.** Một dấu phẩy và một chữ `e` — đó là toàn bộ chi phí để biến 3 giờ debug thành 3 giây.

### 7.2 Chuỗi nguyên nhân nhiều tầng

Exception có thể lồng nhau nhiều tầng, mỗi tầng thêm một lớp ngữ cảnh:

```java
public class ChuoiNguyenNhan {

    public static void main(String[] args) {
        try {
            tangController();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Tầng 4 — sâu nhất, nguyên nhân gốc thật sự
    static void tangDriver() {
        throw new java.net.SocketTimeoutException("Read timed out sau 30000ms");
    }

    // Tầng 3 — bọc lần 1: thêm ngữ cảnh JDBC
    static void tangJdbc() {
        try {
            tangDriver();
        } catch (Exception e) {
            throw new RuntimeException("Không thực thi được câu lệnh SQL", e);
        }
    }

    // Tầng 2 — bọc lần 2: thêm ngữ cảnh repository
    static void tangRepository() {
        try {
            tangJdbc();
        } catch (Exception e) {
            throw new IllegalStateException("Không đọc được bảng don_hang", e);
        }
    }

    // Tầng 1 — bọc lần 3: thêm ngữ cảnh nghiệp vụ
    static void tangController() {
        try {
            tangRepository();
        } catch (Exception e) {
            throw new RuntimeException("Không tải được đơn hàng #1042", e);
        }
    }
}
```

**Output của `printStackTrace()`:**

```
java.lang.RuntimeException: Không tải được đơn hàng #1042            ← ① Ngữ cảnh cao nhất
	at ChuoiNguyenNhan.tangController(ChuoiNguyenNhan.java:34)
	at ChuoiNguyenNhan.main(ChuoiNguyenNhan.java:5)
Caused by: java.lang.IllegalStateException: Không đọc được bảng don_hang   ← ②
	at ChuoiNguyenNhan.tangRepository(ChuoiNguyenNhan.java:26)
	at ChuoiNguyenNhan.tangController(ChuoiNguyenNhan.java:32)
	... 1 more
Caused by: java.lang.RuntimeException: Không thực thi được câu lệnh SQL     ← ③
	at ChuoiNguyenNhan.tangJdbc(ChuoiNguyenNhan.java:18)
	at ChuoiNguyenNhan.tangRepository(ChuoiNguyenNhan.java:24)
	... 2 more
Caused by: java.net.SocketTimeoutException: Read timed out sau 30000ms      ← ④ ⭐ ROOT CAUSE
	at ChuoiNguyenNhan.tangDriver(ChuoiNguyenNhan.java:12)
	at ChuoiNguyenNhan.tangJdbc(ChuoiNguyenNhan.java:16)
	... 3 more
```

**Cách đọc:**

```
┌─────────────────────────────────────────────────────────────┐
│  ĐỌC TỪ TRÊN XUỐNG   → hiểu NGỮ CẢNH (chuyện gì đang làm)   │
│  ĐỌC TỪ DƯỚI LÊN     → tìm NGUYÊN NHÂN (vì sao hỏng)        │
│                                                             │
│  ⭐ "Caused by:" CUỐI CÙNG chính là ROOT CAUSE —            │
│     nơi bạn cần bắt đầu sửa.                                │
└─────────────────────────────────────────────────────────────┘
```

Trong ví dụ trên: nguyên nhân gốc là **socket timeout**, ngữ cảnh là **đang tải đơn hàng #1042**. Hành động: kiểm tra độ trễ mạng tới database, xem lại `connect-timeout`, hoặc kiểm tra truy vấn chậm.

### 7.3 `getCause()` và `initCause()`

```java
public class LamViecVoiCause {

    public static void main(String[] args) {
        // Cách 1 — ⭐ QUA CONSTRUCTOR (khuyến nghị mạnh)
        Throwable goc = new IllegalArgumentException("giá trị âm");
        Throwable boc = new IllegalStateException("không tính được tổng", goc);
        System.out.println("Cause: " + boc.getCause());

        // Cách 2 — qua initCause() (dùng khi constructor không nhận cause)
        Throwable boc2 = new IllegalStateException("không tính được tổng");
        boc2.initCause(goc);
        System.out.println("Cause: " + boc2.getCause());

        // ⚠️ initCause chỉ gọi được MỘT LẦN
        try {
            boc2.initCause(new RuntimeException("khác"));
        } catch (IllegalStateException e) {
            System.out.println("Lỗi: " + e.getMessage());
        }

        // ⚠️ Không gọi initCause được nếu đã set qua constructor
        try {
            boc.initCause(new RuntimeException("khác"));
        } catch (IllegalStateException e) {
            System.out.println("Lỗi: " + e.getMessage());
        }
    }
}
```

**Output:**

```
Cause: java.lang.IllegalArgumentException: giá trị âm
Cause: java.lang.IllegalArgumentException: giá trị âm
Lỗi: Can't overwrite cause with java.lang.RuntimeException: khác
Lỗi: Can't overwrite cause with java.lang.RuntimeException: khác
```

> 💡 **Khi nào cần `initCause()`?** Khi bạn dùng một exception của thư viện bên thứ ba **không có** constructor nhận cause. Ví dụ điển hình: một số exception cũ trong JDK như `NumberFormatException` (chỉ có constructor `String`).
> ```java
> NumberFormatException e = new NumberFormatException("không parse được");
> e.initCause(nguyenNhanGoc);
> throw e;
> ```

### 7.4 Tìm root cause bằng code

Đôi khi bạn cần **lập trình** để lấy nguyên nhân gốc (ví dụ: quyết định HTTP status dựa trên root cause):

```java
public final class ExceptionUtils {

    private ExceptionUtils() {}

    /**
     * Duyệt chuỗi cause tới tận cùng để lấy nguyên nhân gốc.
     * ⚠️ Có chống vòng lặp vô hạn (chuỗi cause có thể bị tạo thành vòng do lỗi lập trình).
     */
    public static Throwable timRootCause(Throwable t) {
        if (t == null) return null;

        Throwable cham  = t;     // con rùa — nhảy 1 bước
        Throwable nhanh = t;     // con thỏ — nhảy 2 bước (thuật toán Floyd phát hiện vòng)

        while (nhanh.getCause() != null) {
            cham  = cham.getCause();
            nhanh = nhanh.getCause();
            if (nhanh.getCause() == null) break;
            nhanh = nhanh.getCause();
            if (cham == nhanh) {
                throw new IllegalArgumentException("Chuỗi cause bị lặp vòng");
            }
        }
        return cham.getCause() == null ? cham : nhanh;
    }

    /** Lấy toàn bộ chuỗi cause dưới dạng danh sách, từ ngoài vào trong */
    public static List<Throwable> lietKeChuoi(Throwable t) {
        List<Throwable> chuoi = new ArrayList<>();
        Set<Throwable> daThay = Collections.newSetFromMap(new IdentityHashMap<>());
        while (t != null && daThay.add(t)) {   // add() trả false nếu đã có → chống vòng lặp
            chuoi.add(t);
            t = t.getCause();
        }
        return chuoi;
    }

    /** Kiểm tra chuỗi cause có chứa một loại exception nào đó không */
    public static boolean chuaLoai(Throwable t, Class<? extends Throwable> loai) {
        return lietKeChuoi(t).stream().anyMatch(loai::isInstance);
    }
}
```

**Cách dùng thực tế trong Spring Boot:**

```java
@ExceptionHandler(DataIntegrityViolationException.class)
public ResponseEntity<ErrorResponse> xuLyToanVenDuLieu(DataIntegrityViolationException ex) {
    Throwable goc = ExceptionUtils.timRootCause(ex);

    // Phân biệt trùng khoá vs vi phạm khoá ngoại — thông tin chỉ có ở root cause
    String thongDiep = goc.getMessage() != null && goc.getMessage().contains("uk_email")
            ? "Email đã được sử dụng"
            : "Dữ liệu vi phạm ràng buộc";

    log.warn("Vi phạm toàn vẹn dữ liệu, root cause: {}", goc.toString());
    return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ErrorResponse("VI_PHAM_RANG_BUOC", thongDiep));
}
```

> 🌱 Spring có sẵn tiện ích này: `org.springframework.core.NestedExceptionUtils.getMostSpecificCause(ex)`. Apache Commons Lang cũng có `ExceptionUtils.getRootCause(ex)`. Dùng thư viện thay vì tự viết khi có thể.

### 7.5 Khi nào WRAP, khi nào RETHROW nguyên bản?

```
                      Bạn bắt được một exception
                                 │
                                 ▼
        ┌────────────────────────────────────────────────────┐
        │ Exception này có ĐÚNG mức trừu tượng của tầng bạn? │
        │ (ví dụ: SQLException ở tầng service = SAI mức)      │
        └────────────────────┬───────────────────────────────┘
                  NO         │        YES
        ┌────────────────────┘─────────────────────┐
        ▼                                          ▼
┌───────────────────────────┐      ┌───────────────────────────────────┐
│ WRAP — bọc lại            │      │ Bạn có thêm được NGỮ CẢNH hữu ích?│
│ throw new XException(     │      └──────────────┬────────────────────┘
│     "ngữ cảnh mới", e)    │            YES      │      NO
│                           │      ┌──────────────┘──────────────┐
│ Ví dụ:                    │      ▼                             ▼
│ SQLException              │  ┌──────────────────┐   ┌────────────────────┐
│   → TruyCapDuLieuException│  │ WRAP để thêm     │   │ RETHROW nguyên bản │
│ IOException               │  │ ngữ cảnh         │   │ (hoặc dùng throws, │
│   → CauHinhLoiException   │  │ ("đơn hàng #X")  │   │  bỏ hẳn try-catch) │
└───────────────────────────┘  └──────────────────┘   └────────────────────┘
```

**Ví dụ đối chiếu:**

```java
// ① WRAP — đúng: SQLException không thuộc từ vựng của tầng nghiệp vụ
try {
    return jdbc.query(...);
} catch (SQLException e) {
    throw new TruyCapDuLieuException("Không đọc được đơn hàng " + id, e);
}

// ② RETHROW — đúng: exception đã đúng mức, chỉ cần log rồi để bay tiếp
try {
    thanhToan(donHang);
} catch (SoDuKhongDuException e) {
    log.warn("Khách {} không đủ số dư cho đơn {}", khachId, donHangId);
    throw e;   // ⭐ ném lại NGUYÊN BẢN — giữ đúng kiểu để handler tầng trên nhận diện
}

// ③ ❌ SAI — bọc không cần thiết, làm mất kiểu cụ thể
try {
    thanhToan(donHang);
} catch (SoDuKhongDuException e) {
    throw new RuntimeException(e);   // ⚠️ Handler tầng trên không còn bắt được đúng loại!
}
```

### 7.6 `printStackTrace()` vs Logger

```java
// ❌ KHÔNG BAO GIỜ dùng trong production
catch (Exception e) {
    e.printStackTrace();
}
```

**Bốn lý do:**

| # | Vấn đề | Hậu quả |
|---|--------|---------|
| 1 | Ghi thẳng ra `System.err` | Không đi qua hệ thống log → không vào file, không vào ELK/Splunk |
| 2 | Không có timestamp, thread name, logger name | Không tương quan được với các log khác |
| 3 | Không tôn trọng log level | Không tắt được ở production, không lọc được |
| 4 | Không đồng bộ với luồng log khác | Output bị xen kẽ lộn xộn khi nhiều thread |

```java
// ✅ ĐÚNG — dùng SLF4J, truyền exception làm THAM SỐ CUỐI (không dùng {})
private static final Logger log = LoggerFactory.getLogger(DonHangService.class);

catch (TruyCapDuLieuException e) {
    log.error("Không tạo được đơn hàng cho khách {}", khachHangId, e);
    //                                                            ^ tham số cuối = exception
    //        → Logback in đầy đủ stack trace + Caused by + Suppressed
    throw e;
}
```

**Sai lầm phổ biến khi log exception:**

```java
// ❌ Chỉ log message → MẤT toàn bộ stack trace và cause
log.error("Lỗi: " + e.getMessage());

// ❌ Nối chuỗi (chậm, và vẫn mất stack trace)
log.error("Lỗi khi xử lý đơn " + donHangId + ": " + e.getMessage());

// ❌ Đặt exception vào placeholder → in ra toString(), mất stack trace
log.error("Lỗi khi xử lý đơn {}: {}", donHangId, e);

// ✅ ĐÚNG: placeholder cho dữ liệu, exception là tham số CUỐI, KHÔNG có {} cho nó
log.error("Lỗi khi xử lý đơn {}", donHangId, e);
```

> 🔎 **Ghi nhớ cú pháp SLF4J:** Số lượng `{}` phải bằng số tham số dữ liệu. Exception là tham số **thừa ra ở cuối**, và SLF4J tự nhận biết để in stack trace.

---

## Phần 8 — Quản Lý Tài Nguyên Chuyên Sâu

### 8.1 Hợp đồng của `close()`

Khi tự viết class `AutoCloseable`, hãy tuân thủ:

| Yêu cầu | Giải thích |
|---------|------------|
| **Idempotent** | Gọi `close()` nhiều lần phải an toàn (lần 2+ không làm gì) |
| **Không ném khi có thể tránh** | Thu hẹp `throws` càng nhiều càng tốt, lý tưởng là không ném |
| **Giải phóng mọi thứ** | Ngay cả khi một phần thất bại, phần còn lại vẫn phải được giải phóng |
| **Không blocking lâu** | `close()` bị gọi trong `finally`, kéo dài sẽ làm treo đường thoát lỗi |

```java
/**
 * Cài đặt close() đúng chuẩn: idempotent, không ném, giải phóng đầy đủ.
 */
public class KetNoiTuyChinh implements AutoCloseable {

    private static final Logger log = LoggerFactory.getLogger(KetNoiTuyChinh.class);

    private final Socket socket;
    private final BufferedReader reader;
    private volatile boolean daDong = false;   // volatile — an toàn đa luồng

    @Override
    public void close() {
        if (daDong) return;        // ⭐ ① Idempotent
        daDong = true;

        // ⭐ ② Mỗi tài nguyên con được đóng trong try riêng
        //     → một cái hỏng KHÔNG ngăn cái kia được đóng
        try {
            if (reader != null) reader.close();
        } catch (IOException e) {
            log.warn("Không đóng được reader", e);   // ⭐ ③ Log, không ném
        }

        try {
            if (socket != null) socket.close();
        } catch (IOException e) {
            log.warn("Không đóng được socket", e);
        }
    }
}
```

### 8.2 `getSuppressed()` — khai thác trong thực tế

```java
public class KhaiThacSuppressed {

    static class TaiNguyen implements AutoCloseable {
        private final String ten;
        TaiNguyen(String ten) { this.ten = ten; }
        @Override public void close() {
            throw new IllegalStateException("Không đóng được " + ten);
        }
    }

    public static void main(String[] args) {
        try {
            try (TaiNguyen a = new TaiNguyen("A");
                 TaiNguyen b = new TaiNguyen("B");
                 TaiNguyen c = new TaiNguyen("C")) {
                throw new RuntimeException("Lỗi nghiệp vụ chính");
            }
        } catch (Exception e) {
            System.out.println("Chính: " + e.getMessage());
            System.out.println("Số exception bị át: " + e.getSuppressed().length);
            for (Throwable bi : e.getSuppressed()) {
                System.out.println("  ↳ " + bi.getMessage());
            }
        }
    }
}
```

**Output:**

```
Chính: Lỗi nghiệp vụ chính
Số exception bị át: 3
  ↳ Không đóng được C
  ↳ Không đóng được B
  ↳ Không đóng được A
```

Chú ý thứ tự **C, B, A** — đúng theo thứ tự đóng LIFO.

**Ghi log đầy đủ cả chuỗi suppressed:**

```java
public static void ghiLogDayDu(Throwable t, Logger log) {
    log.error("Exception chính: {}", t.toString(), t);

    for (Throwable bi : t.getSuppressed()) {
        log.error("  Bị át: {}", bi.toString(), bi);
    }

    Throwable cause = t.getCause();
    int tang = 1;
    while (cause != null) {
        log.error("  Cause tầng {}: {}", tang++, cause.toString());
        cause = cause.getCause();
    }
}
```

### 8.3 Bẫy: `Stream` cũng là `AutoCloseable`

```java
// ❌ RÒ RỈ FILE HANDLE — Files.lines() mở file và KHÔNG tự đóng
long soDong = Files.lines(Path.of("big.log")).count();
// File descriptor vẫn mở! Chạy trong vòng lặp → "Too many open files"

// ✅ ĐÚNG — luôn dùng try-with-resources cho Stream có nguồn là I/O
try (Stream<String> dong = Files.lines(Path.of("big.log"))) {
    long soDong = dong.count();
}
```

**Bảng: Stream nào cần `close()`?**

| Nguồn stream | Cần close? | Vì sao |
|--------------|-----------|--------|
| `list.stream()` | ❌ Không | Không giữ tài nguyên hệ thống |
| `Arrays.stream(arr)` | ❌ Không | Như trên |
| `Stream.of(...)` | ❌ Không | Như trên |
| `Files.lines(path)` | ✅ **CÓ** | Mở file handle |
| `Files.list(dir)` | ✅ **CÓ** | Mở directory stream |
| `Files.walk(dir)` | ✅ **CÓ** | Mở nhiều directory stream |
| `Files.find(...)` | ✅ **CÓ** | Như trên |
| `BufferedReader.lines()` | ⚠️ Reader cần close | Stream không đóng reader |
| `new Scanner(...).tokens()` | ✅ Scanner cần close | |

### 8.4 Nhiều tài nguyên phụ thuộc lẫn nhau

```java
// ✅ Mẫu chuẩn cho JDBC — mọi thứ trong try-with-resources, đúng thứ tự phụ thuộc
public List<DonHang> timTheoKhach(Long khachHangId) {
    String sql = """
            SELECT id, khach_hang_id, tong_tien, thoi_diem_tao
            FROM don_hang
            WHERE khach_hang_id = ?
            ORDER BY thoi_diem_tao DESC
            """;

    try (Connection conn = dataSource.getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setLong(1, khachHangId);

        try (ResultSet rs = ps.executeQuery()) {   // ⭐ ResultSet lồng bên trong
            List<DonHang> ketQua = new ArrayList<>();
            while (rs.next()) {
                ketQua.add(anXa(rs));
            }
            return ketQua;
        }
    } catch (SQLException e) {
        throw new TruyCapDuLieuException(
                "Không truy vấn được đơn hàng của khách " + khachHangId, e);
    }
}
```

**Vì sao `ResultSet` phải trong `try` lồng chứ không cùng dòng với `PreparedStatement`?**

Vì `ps.executeQuery()` phải chạy **sau khi** `ps.setLong(1, ...)` được gọi. Nếu viết cả ba trên cùng một khối `try(...)`, bạn không có chỗ để `setLong` trước khi `executeQuery`.

### 8.5 `finalize()` đã chết — dùng `Cleaner` nếu thật sự cần

```java
// ❌ finalize() bị DEPRECATED FOR REMOVAL từ Java 9, gỡ bỏ ở Java 18+
@Override
protected void finalize() throws Throwable {   // ĐỪNG DÙNG
    close();
}
```

**Vì sao `finalize()` là ý tưởng tồi?**

| Vấn đề | Hậu quả |
|--------|---------|
| Không đảm bảo được gọi | GC có thể không bao giờ chạy trước khi JVM tắt |
| Không đảm bảo thời điểm | Tài nguyên có thể bị giữ hàng giờ |
| Chạy trên thread riêng | Exception bị nuốt trong im lặng |
| Làm chậm GC nghiêm trọng | Object có finalizer phải qua 2 chu kỳ GC |
| Có thể "hồi sinh" object | Nguồn gốc của bug cực khó hiểu |

**Nếu bạn viết thư viện bọc tài nguyên native và muốn có "lưới an toàn":**

```java
public class TaiNguyenNative implements AutoCloseable {

    private static final Cleaner CLEANER = Cleaner.create();

    /** State phải là static class KHÔNG tham chiếu tới object bọc ngoài */
    private static class TrangThai implements Runnable {
        private final long conTro;   // handle native
        TrangThai(long conTro) { this.conTro = conTro; }
        @Override public void run() {
            giaiPhongNative(conTro);   // chạy khi object bị GC — LƯỚI AN TOÀN
        }
    }

    private final TrangThai trangThai;
    private final Cleaner.Cleanable cleanable;

    public TaiNguyenNative(long conTro) {
        this.trangThai = new TrangThai(conTro);
        this.cleanable = CLEANER.register(this, trangThai);
    }

    @Override
    public void close() {
        cleanable.clean();   // ⭐ Đường đi CHÍNH — gọi tường minh, xác định thời điểm
    }
}
```

> ⚠️ **`Cleaner` chỉ là lưới an toàn, KHÔNG phải cơ chế chính.** Luôn dùng try-with-resources. `Cleaner` chỉ để giảm thiệt hại khi ai đó quên.

---

## Phần 9 — 15 Lỗi Exception Kinh Điển

Mỗi lỗi gồm: **code sai** → **vì sao sai** → **code đúng**.

### Lỗi 1 — Nuốt exception (empty catch block)

```java
// ❌ SAI — tội ác số 1 trong exception handling
try {
    guiEmailXacNhan(donHang);
} catch (Exception e) {
    // im lặng
}
```

**Vì sao sai:** Email không gửi được, không ai biết. Khách không nhận được xác nhận, gọi tổng đài, không có log, không tái hiện được. Bạn vừa tạo ra một **bug tàng hình**.

```java
// ✅ ĐÚNG — nếu lỗi này thực sự không nghiêm trọng, PHẢI log lại
try {
    guiEmailXacNhan(donHang);
} catch (EmailException e) {
    // Email lỗi không nên làm hỏng đơn hàng đã tạo thành công
    log.error("Không gửi được email xác nhận cho đơn {}", donHang.id(), e);
    hangDoiGuiLai.them(donHang.id());   // ⭐ có phương án bù đắp
}
```

> 💡 **Nếu bạn buộc phải bỏ qua exception, hãy giải thích bằng comment và đặt tên biến rõ ràng:**
> ```java
> catch (NumberFormatException boQuaDuocVinhKhongPhaiSo) {
>     // Chuỗi không phải số → coi như 0, đây là hành vi mong muốn theo spec mục 3.2
> }
> ```

### Lỗi 2 — `catch (Exception e)` hoặc `catch (Throwable t)` quá rộng

```java
// ❌ SAI — bắt tất tần tật
try {
    var donHang = taoDonHang(yeuCau);
    thanhToan(donHang);
    guiEmail(donHang);
} catch (Exception e) {
    return ResponseEntity.badRequest().body("Có lỗi xảy ra");
}
```

**Vì sao sai:**
- Bắt luôn cả `NullPointerException` do **bug của bạn** → biến bug thành "lỗi người dùng" HTTP 400.
- Bắt luôn `IllegalArgumentException` từ thư viện bên thứ ba → che giấu cấu hình sai.
- Mọi lỗi đều thành cùng một thông điệp → không debug được.

```java
// ✅ ĐÚNG — bắt CỤ THỂ, xử lý khác nhau, để lỗi lập trình bay lên
try {
    var donHang = taoDonHang(yeuCau);
    thanhToan(donHang);
    guiEmail(donHang);
    return ResponseEntity.ok(donHang);
} catch (KhongDuTonKhoException e) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ErrorResponse("KHONG_DU_TON_KHO", e.getMessage()));
} catch (SoDuKhongDuException e) {
    return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
            .body(new ErrorResponse("SO_DU_KHONG_DU", e.getMessage()));
}
// NullPointerException? → bay lên @RestControllerAdvice → 500 + log đầy đủ. ĐÚNG.
```

**Ngoại lệ hợp lệ duy nhất** cho `catch (Exception e)`: **tầng ngoài cùng** (`@RestControllerAdvice`, vòng lặp worker, `main`) — nơi bạn *phải* ngăn exception làm chết tiến trình.

### Lỗi 3 — Ném `Exception` chung chung từ code của mình

```java
// ❌ SAI — người gọi không thể phân biệt loại lỗi để xử lý khác nhau
public void datHang(YeuCau yc) throws Exception {
    if (khongDuHang(yc)) throw new Exception("Không đủ hàng");
    if (khongDuTien(yc)) throw new Exception("Không đủ tiền");
}

// Người gọi bất lực:
try {
    datHang(yc);
} catch (Exception e) {
    // Làm sao biết là lỗi gì? So sánh chuỗi message?! 😱
    if (e.getMessage().contains("hàng")) { /* ... */ }
}
```

```java
// ✅ ĐÚNG — mỗi loại lỗi một class riêng
public void datHang(YeuCau yc) {
    if (khongDuHang(yc)) throw new KhongDuTonKhoException(yc.sanPhamId(), yc.soLuong());
    if (khongDuTien(yc)) throw new SoDuKhongDuException(yc.khachId(), yc.tongTien(), soDu);
}
```

### Lỗi 4 — `return` trong `finally`

```java
// ❌ SAI — nuốt mất exception
int xuLy() {
    try {
        return tinhToan();          // ném ArithmeticException
    } finally {
        return -1;                  // ⚠️ Exception biến mất, hàm trả -1
    }
}
```

```java
// ✅ ĐÚNG — finally chỉ dọn dẹp, không điều khiển luồng
int xuLy() {
    try {
        return tinhToan();
    } catch (ArithmeticException e) {
        log.warn("Lỗi tính toán, dùng giá trị mặc định", e);
        return -1;                  // xử lý ở catch, không phải finally
    } finally {
        donDep();                   // finally CHỈ dọn dẹp
    }
}
```

### Lỗi 5 — Đóng tài nguyên bằng `finally` thay vì try-with-resources

```java
// ❌ SAI — dài, dễ sai, mất suppressed exception
FileInputStream fis = null;
try {
    fis = new FileInputStream("data.bin");
    xuLy(fis);
} catch (IOException e) {
    log.error("Lỗi", e);
} finally {
    if (fis != null) {
        try { fis.close(); } catch (IOException ignored) {}   // ⚠️ nuốt exception
    }
}
```

```java
// ✅ ĐÚNG
try (FileInputStream fis = new FileInputStream("data.bin")) {
    xuLy(fis);
} catch (IOException e) {
    log.error("Không xử lý được data.bin", e);
}
```

### Lỗi 6 — Bọc exception mà vứt cause

```java
// ❌ SAI — mất root cause
catch (SQLException e) {
    throw new TruyCapDuLieuException("Lỗi database");
}

// ❌ CŨNG SAI — nhét message vào chuỗi, vẫn mất stack trace của cause
catch (SQLException e) {
    throw new TruyCapDuLieuException("Lỗi database: " + e.getMessage());
}

// ✅ ĐÚNG
catch (SQLException e) {
    throw new TruyCapDuLieuException("Lỗi truy vấn đơn hàng " + donHangId, e);
}
```

### Lỗi 7 — Catch `NullPointerException` để kiểm tra null

```java
// ❌ SAI KINH KHỦNG
try {
    return khachHang.diaChi().thanhPho().ten();
} catch (NullPointerException e) {
    return "Không rõ";
}
```

**Vì sao sai:**
1. Bạn không biết `null` ở đâu — `khachHang`? `diaChi()`? `thanhPho()`?
2. Nếu `ten()` bên trong có bug NPE thật, bạn **che giấu bug** đó.
3. Cực chậm (tạo stack trace) so với một phép `if`.
4. Dùng exception cho control flow — sai triết lý.

```java
// ✅ ĐÚNG — dùng Optional (khuyến nghị)
return Optional.ofNullable(khachHang)
        .map(KhachHang::diaChi)
        .map(DiaChi::thanhPho)
        .map(ThanhPho::ten)
        .orElse("Không rõ");

// ✅ HOẶC — kiểm tra tường minh
if (khachHang == null || khachHang.diaChi() == null
        || khachHang.diaChi().thanhPho() == null) {
    return "Không rõ";
}
return khachHang.diaChi().thanhPho().ten();
```

### Lỗi 8 — Dùng exception làm control flow

```java
// ❌ SAI — dùng exception thay cho vòng lặp có điều kiện
try {
    int i = 0;
    while (true) {
        System.out.println(mang[i++]);
    }
} catch (ArrayIndexOutOfBoundsException e) {
    // "Kết thúc mảng" — 😱
}
```

```java
// ✅ ĐÚNG
for (int i = 0; i < mang.length; i++) {
    System.out.println(mang[i]);
}
```

**Một biến thể tinh vi hơn — hay gặp trong code thật:**

```java
// ❌ SAI — dùng exception cho tình huống BÌNH THƯỜNG (không tìm thấy là chuyện thường)
public KhachHang tim(String email) {
    var kq = repo.findByEmail(email);
    if (kq == null) throw new KhachHangKhongTonTaiException(email);
    return kq;
}
// Rồi ở chỗ đăng ký:
try {
    tim(email);
    throw new EmailDaTonTaiException(email);
} catch (KhachHangKhongTonTaiException e) {
    // "Chưa tồn tại → cho đăng ký" — dùng exception làm if!
    dangKy(email);
}

// ✅ ĐÚNG — dùng Optional cho tình huống "có thể không có"
public Optional<KhachHang> tim(String email) {
    return repo.findByEmail(email);
}

if (tim(email).isPresent()) {
    throw new EmailDaTonTaiException(email);
}
dangKy(email);
```

> 🎯 **Ranh giới:** Exception dành cho tình huống **bất thường (exceptional)**. "Không tìm thấy khi kiểm tra tồn tại" là **bình thường** → dùng `Optional`/`boolean`. "Không tìm thấy khi client yêu cầu `GET /khach-hang/999`" là **bất thường** → ném exception → 404.

### Lỗi 9 — Log rồi lại ném (log-and-throw)

```java
// ❌ SAI — cùng một lỗi bị log 3 lần ở 3 tầng → log rác, khó đọc
// Tầng repository
catch (SQLException e) {
    log.error("Lỗi DB", e);
    throw new TruyCapDuLieuException("Lỗi DB", e);
}
// Tầng service
catch (TruyCapDuLieuException e) {
    log.error("Lỗi service", e);      // ⚠️ log lần 2
    throw e;
}
// Tầng controller
catch (Exception e) {
    log.error("Lỗi controller", e);   // ⚠️ log lần 3
    throw e;
}
```

**Quy tắc:** **Log MỘT LẦN, tại nơi exception được XỬ LÝ THẬT SỰ** (thường là `@RestControllerAdvice`).

```java
// ✅ ĐÚNG — tầng dưới chỉ bọc và thêm ngữ cảnh, KHÔNG log
catch (SQLException e) {
    throw new TruyCapDuLieuException("Lỗi truy vấn khách " + id, e);   // không log
}

// ✅ Tầng ngoài cùng log MỘT LẦN, đầy đủ
@ExceptionHandler(Exception.class)
public ResponseEntity<ErrorResponse> xuLy(Exception ex, HttpServletRequest req) {
    log.error("Lỗi không mong đợi tại {} {}", req.getMethod(), req.getRequestURI(), ex);
    return ResponseEntity.internalServerError()
            .body(new ErrorResponse("INTERNAL_ERROR", "Đã có lỗi xảy ra"));
}
```

**Ngoại lệ:** log ở tầng giữa **là hợp lý** khi bạn ghi thêm thông tin mà tầng trên không có (ví dụ tham số truy vấn nhạy cảm không được đưa lên trên) — nhưng hãy dùng `log.debug`/`log.warn`, không `log.error`.

### Lỗi 10 — `catch` rồi `throw new RuntimeException(e)` không có message

```java
// ❌ SAI — thêm một tầng vô nghĩa, message rỗng
catch (IOException e) {
    throw new RuntimeException(e);
}
```

Log ra: `java.lang.RuntimeException: java.io.IOException: ...` — tầng ngoài không mang thông tin gì.

```java
// ✅ ĐÚNG — hoặc thêm ngữ cảnh, hoặc đừng bọc
catch (IOException e) {
    throw new DocCauHinhThatBaiException(
            "Không đọc được file cấu hình " + duongDan, e);
}
```

### Lỗi 11 — Exception trong vòng lặp làm dừng cả lô

```java
// ❌ SAI — 1 bản ghi lỗi làm hỏng cả 10.000 bản ghi
public void xuLyHangLoat(List<BanGhi> danhSach) {
    for (BanGhi bg : danhSach) {
        xuLy(bg);   // bản ghi thứ 3 nổ → 9.997 bản ghi còn lại không được xử lý
    }
}
```

```java
// ✅ ĐÚNG — cô lập lỗi từng bản ghi, tổng kết cuối cùng
public KetQuaXuLy xuLyHangLoat(List<BanGhi> danhSach) {
    List<Long> thanhCong = new ArrayList<>();
    Map<Long, String> thatBai = new LinkedHashMap<>();

    for (BanGhi bg : danhSach) {
        try {
            xuLy(bg);
            thanhCong.add(bg.id());
        } catch (LoiNghiepVuException e) {
            // Lỗi nghiệp vụ của 1 bản ghi → ghi nhận, đi tiếp
            log.warn("Bỏ qua bản ghi {}: {}", bg.id(), e.getMessage());
            thatBai.put(bg.id(), e.getMessage());
        }
        // ⚠️ KHÔNG bắt Exception chung — lỗi hạ tầng (DB chết) PHẢI dừng cả lô
    }

    log.info("Xử lý xong: {} thành công, {} thất bại", thanhCong.size(), thatBai.size());
    return new KetQuaXuLy(thanhCong, thatBai);
}
```

### Lỗi 12 — Không đặt HTTP status đúng trong REST

```java
// ❌ SAI — trả 200 OK kèm thông báo lỗi trong body
@GetMapping("/{id}")
public ResponseEntity<?> lay(@PathVariable Long id) {
    try {
        return ResponseEntity.ok(service.lay(id));
    } catch (KhachHangKhongTonTaiException e) {
        return ResponseEntity.ok(Map.of("error", "Không tìm thấy"));   // ⚠️ 200!
    }
}
```

**Vì sao sai:** Client (browser, mobile app, monitoring) dựa vào **status code** để biết thành công/thất bại. Trả 200 cho lỗi khiến:
- Retry logic không kích hoạt
- Dashboard giám sát báo "0% lỗi" trong khi thực tế 40% request thất bại
- Cache CDN cache luôn cả response lỗi

```java
// ✅ ĐÚNG — để exception bay lên @RestControllerAdvice, map đúng status
@GetMapping("/{id}")
public ResponseEntity<KhachHangDto> lay(@PathVariable Long id) {
    return ResponseEntity.ok(service.lay(id));   // ném exception → advice xử lý → 404
}
```

### Lỗi 13 — Lộ thông tin nội bộ ra client (lỗ hổng bảo mật)

```java
// ❌ CỰC KỲ NGUY HIỂM — rò rỉ thông tin cho kẻ tấn công
@ExceptionHandler(Exception.class)
public ResponseEntity<String> xuLy(Exception ex) {
    return ResponseEntity.internalServerError()
            .body(ExceptionUtils.getStackTrace(ex));   // 💀
}
```

Response thực tế mà kẻ tấn công nhận được:

```
org.postgresql.util.PSQLException: ERROR: relation "khach_hang" does not exist
  Position: 15
	at org.postgresql.core.v3.QueryExecutorImpl.receiveErrorResponse(QueryExecutorImpl.java:2725)
	at com.shop.repository.KhachHangRepository.timTheoId(KhachHangRepository.java:34)
	at com.shop.service.KhachHangService.lay(KhachHangService.java:22)
```

**Kẻ tấn công vừa biết được:** bạn dùng PostgreSQL, tên bảng là `khach_hang`, cấu trúc package `com.shop.*`, phiên bản driver, và có thể đoán ra cả framework. Đây là bước đầu tiên trong mọi cuộc tấn công.

```java
// ✅ ĐÚNG — chi tiết vào LOG, thông điệp chung chung ra CLIENT
@ExceptionHandler(Exception.class)
public ResponseEntity<ErrorResponse> xuLy(Exception ex, HttpServletRequest req) {
    // Mã truy vết để nối log ↔ khiếu nại của khách hàng
    String maTruyVet = UUID.randomUUID().toString();

    // ⭐ Chi tiết đầy đủ → LOG (chỉ dev/ops xem được)
    log.error("[{}] Lỗi không mong đợi tại {} {}",
            maTruyVet, req.getMethod(), req.getRequestURI(), ex);

    // ⭐ Ra client: KHÔNG có tên class, KHÔNG có stack trace, KHÔNG có SQL
    return ResponseEntity.internalServerError()
            .body(new ErrorResponse(
                    "INTERNAL_ERROR",
                    "Đã có lỗi xảy ra. Vui lòng liên hệ hỗ trợ với mã: " + maTruyVet));
}
```

### Lỗi 14 — Bắt exception mà không thể xảy ra (hoặc bắt sai lớp)

```java
// ❌ LỖI BIÊN DỊCH nếu try không thể ném IOException
try {
    int x = 1 + 1;
} catch (IOException e) { }   // error: exception IOException is never thrown

// ❌ Bắt lớp cha khi chỉ cần lớp con → vô tình bắt luôn thứ khác
try {
    Integer.parseInt(chuoi);
} catch (RuntimeException e) {    // ⚠️ Bắt cả NPE nếu chuoi null!
    return 0;
}

// ✅ ĐÚNG — bắt đúng lớp cần
try {
    return Integer.parseInt(chuoi);
} catch (NumberFormatException e) {
    return 0;   // chuỗi không phải số → mặc định 0
}
// Nếu chuoi == null → NPE bay lên → đúng, vì đó là bug của người gọi
```

### Lỗi 15 — Quên khôi phục cờ interrupt

```java
// ❌ SAI — thread pool không shutdown được
catch (InterruptedException e) {
    log.warn("Bị ngắt");
}

// ✅ ĐÚNG
catch (InterruptedException e) {
    Thread.currentThread().interrupt();   // khôi phục cờ
    log.warn("Bị ngắt khi đang chờ, dừng xử lý");
    return;
}
```

**Bảng tổng hợp 15 lỗi:**

| # | Lỗi | Mức độ | Dấu hiệu nhận biết trong code review |
|---|-----|--------|--------------------------------------|
| 1 | Nuốt exception | 🔴 Nghiêm trọng | `catch (...) { }` rỗng |
| 2 | `catch (Exception)` quá rộng | 🔴 Nghiêm trọng | `catch (Exception` ở tầng service |
| 3 | Ném `Exception` chung chung | 🟠 Cao | `throw new Exception(` |
| 4 | `return` trong `finally` | 🔴 Nghiêm trọng | `finally { return` |
| 5 | Đóng tài nguyên bằng `finally` | 🟠 Cao | `.close()` trong `finally` |
| 6 | Bọc mà vứt cause | 🔴 Nghiêm trọng | `new XException(msg)` trong `catch` |
| 7 | Catch NPE để check null | 🔴 Nghiêm trọng | `catch (NullPointerException` |
| 8 | Exception làm control flow | 🟠 Cao | `catch` trong vòng lặp thay cho `if` |
| 9 | Log-and-throw nhiều tầng | 🟡 Trung bình | `log.error` + `throw` cùng khối |
| 10 | `new RuntimeException(e)` trống | 🟡 Trung bình | Không có message |
| 11 | 1 lỗi làm hỏng cả lô | 🟠 Cao | Vòng lặp không có try bên trong |
| 12 | Sai HTTP status | 🟠 Cao | `ResponseEntity.ok` trong `catch` |
| 13 | Lộ stack trace ra client | 🔴 Nghiêm trọng (bảo mật) | `getStackTrace()` trong response |
| 14 | Bắt sai lớp exception | 🟡 Trung bình | `catch (RuntimeException` |
| 15 | Quên khôi phục interrupt | 🟠 Cao | `catch (InterruptedException` không có `interrupt()` |

---

## Phần 10 — Best Practices & Anti-patterns

### 10.1 Mười quy tắc vàng

**① Bắt CỤ THỂ, không bắt chung chung**

```java
// ❌ catch (Exception e)
// ✅ catch (KhongDuTonKhoException e)
```
*Lý do:* Mỗi loại lỗi cần cách xử lý khác nhau. Bắt chung = xử lý sai + che giấu bug.

**② Ném SỚM, bắt MUỘN (throw early, catch late)**

```java
// ✅ Ném ngay đầu method — fail fast
public void datHang(Long khachId, int soLuong) {
    Objects.requireNonNull(khachId, "khachId không được null");
    if (soLuong <= 0) throw new IllegalArgumentException("soLuong phải > 0: " + soLuong);
    // ... logic bên dưới có thể yên tâm mọi giả định đều đúng
}
```
*Lý do:* Ném sớm → stack trace chỉ thẳng vào nguyên nhân. Bắt muộn (ở tầng ngoài) → chỉ một nơi xử lý, nhất quán.

**③ LUÔN giữ cause khi bọc**

```java
throw new MyException("ngữ cảnh mới", e);   // ⭐ dấu phẩy + e
```

**④ Log với ĐẦY ĐỦ ngữ cảnh**

```java
// ❌ log.error("Lỗi", e);
// ✅ Có định danh nghiệp vụ để tìm kiếm trong log
log.error("Không xử lý được đơn hàng id={} của khách id={} (trace={})",
        donHangId, khachHangId, maTruyVet, e);
```
*Lý do:* Khi có 10 triệu dòng log/ngày, bạn cần grep được đúng dòng liên quan tới khiếu nại cụ thể.

**⑤ Dùng try-with-resources cho MỌI `AutoCloseable`**

**⑥ Custom exception cho lỗi NGHIỆP VỤ, JDK exception cho lỗi LẬP TRÌNH**

**⑦ Không dùng exception cho luồng bình thường — dùng `Optional`**

```java
// ✅ "Có thể không tìm thấy" là bình thường
Optional<KhachHang> tim(String email);

// ✅ "Client yêu cầu id không tồn tại" là bất thường
KhachHang layBatBuoc(Long id);   // ném KhachHangKhongTonTaiException
```

**⑧ Tài liệu hoá bằng JavaDoc `@throws`**

```java
/**
 * Đặt hàng cho khách.
 *
 * @param khachHangId định danh khách hàng, không được {@code null}
 * @param cacDong danh sách dòng hàng, không được rỗng
 * @return đơn hàng đã tạo với id được sinh
 * @throws IllegalArgumentException nếu {@code khachHangId} là {@code null}
 *                                  hoặc {@code cacDong} rỗng
 * @throws KhachHangKhongTonTaiException nếu không tồn tại khách hàng với id đó
 * @throws KhongDuTonKhoException nếu bất kỳ sản phẩm nào không đủ tồn kho
 * @throws SoDuKhongDuException nếu số dư không đủ thanh toán
 */
public DonHang datHang(Long khachHangId, List<DongHang> cacDong) { ... }
```
*Lý do:* Với unchecked exception, JavaDoc là **cách duy nhất** để người gọi biết method có thể ném gì.

**⑨ Kiểm thử CẢ đường thất bại**

```java
@Test
void datHang_khiKhongDuTonKho_neKhongDuTonKhoException() { ... }
```

**⑩ Tránh "checked exception hell" — bọc thành unchecked ở ranh giới hạ tầng**

### 10.2 Bảng anti-pattern

| Anti-pattern | Vì sao tệ | Thay bằng |
|--------------|-----------|-----------|
| `catch (Exception e) {}` | Nuốt lỗi, bug tàng hình | Bắt cụ thể + log + xử lý |
| `e.printStackTrace()` | Không vào hệ thống log | `log.error("...", e)` |
| `throw new Exception(...)` | Không phân loại được | Custom exception cụ thể |
| `catch (NPE e)` để check null | Che giấu bug, chậm | `Optional` hoặc `if != null` |
| `finally { return ... }` | Nuốt exception | Xử lý ở `catch` |
| `throws Exception` trên API | Ép người gọi bắt mọi thứ | Khai báo chính xác từng loại |
| Bọc mà vứt cause | Mất root cause | `new X(msg, cause)` |
| Log ở mọi tầng | Log rác, khó đọc | Log một lần ở tầng xử lý |
| Trả stack trace cho client | Lỗ hổng bảo mật | Mã truy vết + thông điệp chung |
| `catch` để "cho code chạy tiếp" | Dữ liệu hỏng âm thầm | Fail fast |
| Exception cho control flow | Chậm, khó đọc | `if` / `Optional` |
| Exception message tiếng Anh lẫn Việt lộn xộn | Không nhất quán | Chuẩn hoá: mã lỗi (Anh) + message (Việt) |

### 10.3 Quy ước message exception tốt

```java
// ❌ Vô dụng
throw new IllegalArgumentException("Lỗi");
throw new IllegalArgumentException("Invalid input");
throw new IllegalStateException("Không được");

// ✅ Trả lời được 3 câu hỏi: CÁI GÌ sai, GIÁ TRỊ NÀO, MONG ĐỢI GÌ
throw new IllegalArgumentException(
        "soLuong phải nằm trong khoảng [1, 100], nhận được: " + soLuong);

throw new IllegalStateException(
        "Không thể huỷ đơn hàng " + id + " ở trạng thái " + trangThai
                + "; chỉ huỷ được khi trạng thái là MOI hoặc DANG_XU_LY");

throw new KhongDuTonKhoException(
        String.format("Sản phẩm '%s' (id=%d) chỉ còn %d, yêu cầu %d",
                sp.ten(), sp.id(), sp.tonKho(), soLuongYeuCau));
```

**Checklist một message tốt:**

- [ ] Nêu rõ **cái gì** không hợp lệ (tên tham số/trường)
- [ ] In ra **giá trị thực tế** nhận được
- [ ] Nêu **kỳ vọng** (khoảng hợp lệ, trạng thái hợp lệ)
- [ ] Có **định danh nghiệp vụ** (id đơn hàng, id khách) để tra cứu
- [ ] **KHÔNG** chứa thông tin nhạy cảm (mật khẩu, số thẻ, token)

> 🔐 **Cảnh báo bảo mật:** Đừng bao giờ đưa mật khẩu, token, số thẻ tín dụng vào exception message. Message thường bị log, và log thường được gửi tới hệ thống bên ngoài.
> ```java
> // ❌ THẢM HOẠ
> throw new AuthException("Sai mật khẩu: " + matKhau);
> // ✅ ĐÚNG
> throw new AuthException("Sai thông tin đăng nhập cho tài khoản: " + username);
> ```

---
## Phần 11 — Exception Handling Trong Spring Boot

Đây là phần **áp dụng thực chiến**. Mọi thứ ở các phần trước hội tụ về đây.

### 11.1 Mặc định của Spring Boot — và vì sao không đủ dùng

Khi không cấu hình gì, Spring Boot trả về response lỗi mặc định:

```json
{
  "timestamp": "2026-08-12T09:14:22.104+00:00",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/don-hang/1042"
}
```

**Ba vấn đề:**

| Vấn đề | Hậu quả |
|--------|---------|
| Không có **mã lỗi ổn định** | Client phải parse chuỗi `error` bằng tiếng Anh để phân biệt lỗi |
| Không có **thông điệp thân thiện** | Frontend không biết hiện gì cho người dùng |
| Mọi exception nghiệp vụ đều thành **500** | "Không tìm thấy khách hàng" trả 500 thay vì 404 |

Tệ hơn, nếu bạn bật `server.error.include-stacktrace=always` (một số hướng dẫn trên mạng khuyên vậy để "dễ debug"), bạn vừa mở toang cửa cho kẻ tấn công. **Đừng bao giờ bật ở production.**

```yaml
# application-prod.yml — cấu hình AN TOÀN cho production
server:
  error:
    include-stacktrace: never       # ⭐ BẮT BUỘC ở production
    include-message: never          # không lộ message nội bộ
    include-binding-errors: never
    include-exception: false
    whitelabel:
      enabled: false
```

### 11.2 `@ExceptionHandler` ở cấp controller

Xử lý lỗi **cục bộ** cho một controller:

```java
@RestController
@RequestMapping("/api/don-hang")
@RequiredArgsConstructor
@Validated
public class DonHangController {

    private final DonHangService donHangService;

    @PostMapping
    public ResponseEntity<DonHangDto> tao(@Valid @RequestBody TaoDonHangRequest request) {
        DonHangDto daTao = donHangService.tao(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(daTao.id()).toUri();
        return ResponseEntity.created(location).body(daTao);
    }

    /**
     * Handler CỤC BỘ — chỉ áp dụng cho các endpoint trong chính controller này.
     * Ưu tiên cao hơn handler global trong @RestControllerAdvice.
     */
    @ExceptionHandler(KhongDuTonKhoException.class)
    public ResponseEntity<ErrorResponse> xuLyKhongDuTonKho(KhongDuTonKhoException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse("KHONG_DU_TON_KHO", ex.getMessage()));
    }
}
```

**Khi nào dùng handler cục bộ?** Khi cách xử lý **khác biệt** so với phần còn lại của ứng dụng. Đa số trường hợp bạn nên dùng global (mục 11.3) để đảm bảo **nhất quán**.

**Thứ tự ưu tiên khi có nhiều handler:**

```
① @ExceptionHandler trong CHÍNH controller đó       ← ưu tiên cao nhất
② @ExceptionHandler trong @RestControllerAdvice     ← theo @Order
③ Xử lý mặc định của Spring Boot (BasicErrorController)
```

Trong mỗi cấp, Spring chọn handler khớp với **kiểu cụ thể nhất** (giống quy tắc catch).

### 11.3 `@RestControllerAdvice` — xử lý tập trung

Đây là **cách làm chuẩn** cho ứng dụng thật:

```java
package com.shop.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import jakarta.servlet.http.HttpServletRequest;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Bộ xử lý exception tập trung cho toàn bộ REST API.
 *
 * <p>Nguyên tắc thiết kế:
 * <ul>
 *   <li>Lỗi NGHIỆP VỤ (4xx): log ở mức WARN, trả message rõ ràng cho client</li>
 *   <li>Lỗi HỆ THỐNG (5xx): log ở mức ERROR kèm stack trace, trả message CHUNG CHUNG</li>
 *   <li>KHÔNG bao giờ để chi tiết nội bộ (tên class, SQL, stack trace) lọt ra client</li>
 * </ul>
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ─────────────────────────────────────────────────────────────
    // NHÓM 1 — Lỗi nghiệp vụ (4xx): người dùng sai, không phải hệ thống sai
    // ─────────────────────────────────────────────────────────────

    /** 404 — Không tìm thấy tài nguyên */
    @ExceptionHandler(KhongTimThayException.class)
    public ResponseEntity<ErrorResponse> xuLyKhongTimThay(
            KhongTimThayException ex, HttpServletRequest req) {

        log.warn("404 tại {} {}: {}", req.getMethod(), req.getRequestURI(), ex.getMessage());
        return dungResponse(HttpStatus.NOT_FOUND, ex.getMaLoi(), ex.getMessage(), req, null);
    }

    /** 409 — Vi phạm ràng buộc nghiệp vụ (hết hàng, trùng email, ...) */
    @ExceptionHandler(ViPhamRangBuocException.class)
    public ResponseEntity<ErrorResponse> xuLyViPhamRangBuoc(
            ViPhamRangBuocException ex, HttpServletRequest req) {

        log.warn("409 tại {} {}: {}", req.getMethod(), req.getRequestURI(), ex.getMessage());
        return dungResponse(HttpStatus.CONFLICT, ex.getMaLoi(), ex.getMessage(), req, null);
    }

    /** 400 — Dữ liệu đầu vào không hợp lệ theo quy tắc nghiệp vụ */
    @ExceptionHandler(DuLieuKhongHopLeException.class)
    public ResponseEntity<ErrorResponse> xuLyDuLieuKhongHopLe(
            DuLieuKhongHopLeException ex, HttpServletRequest req) {

        log.warn("400 tại {} {}: {}", req.getMethod(), req.getRequestURI(), ex.getMessage());
        return dungResponse(HttpStatus.BAD_REQUEST, ex.getMaLoi(), ex.getMessage(), req, null);
    }

    // ─────────────────────────────────────────────────────────────
    // NHÓM 2 — Lỗi validation của Bean Validation
    // ─────────────────────────────────────────────────────────────

    /** 400 — @Valid trên @RequestBody thất bại */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> xuLyValidation(
            MethodArgumentNotValidException ex, HttpServletRequest req) {

        // Gom lỗi theo TÊN TRƯỜNG để frontend hiển thị đúng chỗ
        Map<String, String> loiTheoTruong = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> Optional.ofNullable(fe.getDefaultMessage()).orElse("không hợp lệ"),
                        (a, b) -> a + "; " + b,        // gộp nếu 1 trường có nhiều lỗi
                        LinkedHashMap::new));

        log.warn("400 validation tại {} {}: {}",
                req.getMethod(), req.getRequestURI(), loiTheoTruong);

        return dungResponse(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR",
                "Dữ liệu gửi lên không hợp lệ", req, loiTheoTruong);
    }

    /** 400 — @Validated trên tham số method (path variable, request param) */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> xuLyConstraint(
            ConstraintViolationException ex, HttpServletRequest req) {

        Map<String, String> chiTiet = ex.getConstraintViolations().stream()
                .collect(Collectors.toMap(
                        v -> v.getPropertyPath().toString(),
                        ConstraintViolation::getMessage,
                        (a, b) -> a + "; " + b,
                        LinkedHashMap::new));

        return dungResponse(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR",
                "Tham số không hợp lệ", req, chiTiet);
    }

    /** 400 — JSON sai cú pháp hoặc sai kiểu dữ liệu */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> xuLyJsonHong(
            HttpMessageNotReadableException ex, HttpServletRequest req) {

        // ⚠️ KHÔNG trả ex.getMessage() — nó chứa tên class Java nội bộ!
        log.warn("400 JSON hỏng tại {} {}: {}",
                req.getMethod(), req.getRequestURI(), ex.getMessage());

        return dungResponse(HttpStatus.BAD_REQUEST, "MALFORMED_JSON",
                "Nội dung request không đọc được (JSON sai định dạng)", req, null);
    }

    /** 400 — Sai kiểu path variable, ví dụ /api/don-hang/abc khi mong đợi Long */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> xuLySaiKieu(
            MethodArgumentTypeMismatchException ex, HttpServletRequest req) {

        String thongDiep = String.format("Tham số '%s' phải có kiểu %s",
                ex.getName(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "hợp lệ");

        return dungResponse(HttpStatus.BAD_REQUEST, "TYPE_MISMATCH", thongDiep, req, null);
    }

    // ─────────────────────────────────────────────────────────────
    // NHÓM 3 — Lỗi HTTP protocol
    // ─────────────────────────────────────────────────────────────

    /** 405 — Sai HTTP method */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> xuLySaiMethod(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {

        return dungResponse(HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED",
                "Phương thức " + ex.getMethod() + " không được hỗ trợ cho đường dẫn này",
                req, null);
    }

    /** 404 — Đường dẫn không tồn tại (cần bật spring.mvc.throw-exception-if-no-handler-found) */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErrorResponse> xuLyKhongCoRoute(
            NoHandlerFoundException ex, HttpServletRequest req) {

        return dungResponse(HttpStatus.NOT_FOUND, "ENDPOINT_NOT_FOUND",
                "Không tìm thấy endpoint", req, null);
    }

    // ─────────────────────────────────────────────────────────────
    // NHÓM 4 — Lỗi dữ liệu / hạ tầng (5xx)
    // ─────────────────────────────────────────────────────────────

    /** 409 — Vi phạm ràng buộc ở tầng database (unique, foreign key) */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> xuLyToanVenDuLieu(
            DataIntegrityViolationException ex, HttpServletRequest req) {

        Throwable goc = NestedExceptionUtils.getMostSpecificCause(ex);
        log.error("409 vi phạm toàn vẹn dữ liệu tại {} {}",
                req.getMethod(), req.getRequestURI(), ex);

        // ⚠️ KHÔNG trả goc.getMessage() ra client — nó chứa tên bảng/cột!
        return dungResponse(HttpStatus.CONFLICT, "DATA_INTEGRITY_VIOLATION",
                "Dữ liệu vi phạm ràng buộc, có thể đã tồn tại bản ghi tương tự",
                req, null);
    }

    /** 502 — Dịch vụ bên ngoài lỗi */
    @ExceptionHandler(DichVuNgoaiException.class)
    public ResponseEntity<ErrorResponse> xuLyDichVuNgoai(
            DichVuNgoaiException ex, HttpServletRequest req) {

        log.error("502 dịch vụ ngoài '{}' lỗi tại {} {}",
                ex.getTenDichVu(), req.getMethod(), req.getRequestURI(), ex);

        return dungResponse(HttpStatus.BAD_GATEWAY, "EXTERNAL_SERVICE_ERROR",
                "Dịch vụ đối tác tạm thời không khả dụng, vui lòng thử lại sau",
                req, null);
    }

    // ─────────────────────────────────────────────────────────────
    // NHÓM 5 — LƯỚI AN TOÀN CUỐI CÙNG
    // ─────────────────────────────────────────────────────────────

    /**
     * 500 — Mọi thứ chưa được xử lý ở trên.
     * ⚠️ Đây là NƠI DUY NHẤT trong ứng dụng được phép catch Exception.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> xuLyTatCa(Exception ex, HttpServletRequest req) {

        String maTruyVet = UUID.randomUUID().toString();

        // ⭐ Chi tiết ĐẦY ĐỦ vào log (chỉ dev/ops đọc được)
        log.error("[{}] 500 lỗi không mong đợi tại {} {}",
                maTruyVet, req.getMethod(), req.getRequestURI(), ex);

        // ⭐ Ra client: KHÔNG có tên class, KHÔNG có stack trace, KHÔNG có SQL
        return dungResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "Đã có lỗi xảy ra. Vui lòng liên hệ hỗ trợ với mã: " + maTruyVet,
                req, null);
    }

    // ─────────────────────────────────────────────────────────────
    // Hàm dựng response chung — đảm bảo MỌI lỗi có CÙNG định dạng
    // ─────────────────────────────────────────────────────────────
    private ResponseEntity<ErrorResponse> dungResponse(
            HttpStatus status, String maLoi, String thongDiep,
            HttpServletRequest req, Map<String, String> chiTiet) {

        return ResponseEntity.status(status).body(new ErrorResponse(
                maLoi,
                thongDiep,
                status.value(),
                req.getRequestURI(),
                Instant.now(),
                chiTiet
        ));
    }
}
```

### 11.4 `ErrorResponse` DTO — định dạng lỗi nhất quán

```java
package com.shop.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.Map;

/**
 * Định dạng lỗi thống nhất cho toàn bộ API.
 * Dùng record — immutable, gọn, tự sinh equals/hashCode.
 *
 * @param maLoi     mã lỗi ỔN ĐỊNH (client dùng code này để rẽ nhánh, KHÔNG dùng message)
 * @param thongDiep thông điệp thân thiện, có thể hiển thị trực tiếp cho người dùng
 * @param status    HTTP status code (tiện cho client không đọc header)
 * @param duongDan  endpoint gây lỗi
 * @param thoiDiem  thời điểm xảy ra lỗi (UTC)
 * @param chiTiet   lỗi chi tiết theo từng trường, chỉ có với lỗi validation
 */
@JsonInclude(JsonInclude.Include.NON_NULL)   // ⭐ ẩn field null khỏi JSON
public record ErrorResponse(
        String maLoi,
        String thongDiep,
        int status,
        String duongDan,
        Instant thoiDiem,
        Map<String, String> chiTiet
) {
    /** Constructor gọn cho trường hợp không có chi tiết */
    public ErrorResponse(String maLoi, String thongDiep) {
        this(maLoi, thongDiep, 0, null, Instant.now(), null);
    }
}
```

**JSON trả về cho lỗi 404:**

```json
{
  "maLoi": "KHACH_HANG_KHONG_TON_TAI",
  "thongDiep": "Không tìm thấy khách hàng id=9999",
  "status": 404,
  "duongDan": "/api/khach-hang/9999",
  "thoiDiem": "2026-08-12T09:14:22.104Z"
}
```

**JSON trả về cho lỗi validation:**

```json
{
  "maLoi": "VALIDATION_ERROR",
  "thongDiep": "Dữ liệu gửi lên không hợp lệ",
  "status": 400,
  "duongDan": "/api/don-hang",
  "thoiDiem": "2026-08-12T09:15:03.221Z",
  "chiTiet": {
    "khachHangId": "không được để trống",
    "cacDong": "phải có ít nhất 1 dòng hàng",
    "cacDong[0].soLuong": "phải lớn hơn 0"
  }
}
```

> 🔑 **Vì sao cần `maLoi` riêng biệt?** Vì `thongDiep` là **tiếng Việt cho con người** — nó có thể thay đổi, có thể được dịch. `maLoi` là **hợp đồng máy–máy** — nó ổn định vĩnh viễn. Frontend viết `if (err.maLoi === 'SO_DU_KHONG_DU') hienThiNutNapTien()`, không bao giờ viết `if (err.thongDiep.includes('số dư'))`.

### 11.5 `ProblemDetail` (RFC 7807) — chuẩn công nghiệp

Spring Framework 6 / Spring Boot 3 hỗ trợ sẵn chuẩn **RFC 7807 Problem Details for HTTP APIs**:

```java
@RestControllerAdvice
public class ProblemDetailHandler {

    @ExceptionHandler(KhachHangKhongTonTaiException.class)
    public ProblemDetail xuLy(KhachHangKhongTonTaiException ex) {

        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND, ex.getMessage());

        pd.setTitle("Không tìm thấy khách hàng");
        pd.setType(URI.create("https://api.shop.vn/loi/khach-hang-khong-ton-tai"));
        pd.setProperty("maLoi", "KHACH_HANG_KHONG_TON_TAI");
        pd.setProperty("khachHangId", ex.getKhachHangId());
        pd.setProperty("thoiDiem", Instant.now());

        return pd;
    }
}
```

**JSON trả về (Content-Type: `application/problem+json`):**

```json
{
  "type": "https://api.shop.vn/loi/khach-hang-khong-ton-tai",
  "title": "Không tìm thấy khách hàng",
  "status": 404,
  "detail": "Không tìm thấy khách hàng id=9999",
  "instance": "/api/khach-hang/9999",
  "maLoi": "KHACH_HANG_KHONG_TON_TAI",
  "khachHangId": 9999,
  "thoiDiem": "2026-08-12T09:14:22.104Z"
}
```

**Bật cho các exception có sẵn của Spring:**

```yaml
spring:
  mvc:
    problemdetails:
      enabled: true     # Spring tự trả ProblemDetail cho lỗi MVC chuẩn
```

| Tiêu chí | `ErrorResponse` tự viết | `ProblemDetail` (RFC 7807) |
|----------|------------------------|----------------------------|
| Chuẩn hoá | Nội bộ team | Chuẩn IETF quốc tế |
| Công cụ hỗ trợ | Không | Nhiều client/gateway hiểu sẵn |
| Tuỳ biến | Hoàn toàn | Qua `setProperty` |
| Content-Type | `application/json` | `application/problem+json` |
| Nên dùng khi | API nội bộ, team nhỏ | API công khai, đa đối tác |

### 11.6 Bảng ánh xạ HTTP status

| HTTP | Tên | Dùng khi | Exception ví dụ |
|------|-----|----------|-----------------|
| **400** | Bad Request | Dữ liệu đầu vào sai cú pháp/ràng buộc | `MethodArgumentNotValidException`, `DuLieuKhongHopLeException` |
| **401** | Unauthorized | Chưa đăng nhập / token sai, hết hạn | `AuthenticationException`, `JwtException` |
| **403** | Forbidden | Đã đăng nhập nhưng **không có quyền** | `AccessDeniedException` |
| **404** | Not Found | Tài nguyên không tồn tại | `KhongTimThayException` |
| **405** | Method Not Allowed | Sai HTTP method | `HttpRequestMethodNotSupportedException` |
| **406** | Not Acceptable | Không hỗ trợ `Accept` header | `HttpMediaTypeNotAcceptableException` |
| **409** | Conflict | Xung đột trạng thái: trùng dữ liệu, hết hàng, optimistic lock | `EmailDaTonTaiException`, `OptimisticLockingFailureException` |
| **410** | Gone | Tài nguyên từng có, đã bị xoá vĩnh viễn | `TaiNguyenDaXoaException` |
| **415** | Unsupported Media Type | Sai `Content-Type` | `HttpMediaTypeNotSupportedException` |
| **422** | Unprocessable Entity | Cú pháp đúng nhưng **vi phạm quy tắc nghiệp vụ** | `ViPhamQuyTacKinhDoanhException` |
| **429** | Too Many Requests | Vượt giới hạn tần suất | `RateLimitException` |
| **500** | Internal Server Error | Lỗi không mong đợi — **bug của bạn** | `NullPointerException`, `Exception` |
| **502** | Bad Gateway | Dịch vụ phụ thuộc trả lỗi | `DichVuNgoaiException` |
| **503** | Service Unavailable | Đang bảo trì / quá tải | `ServiceUnavailableException` |
| **504** | Gateway Timeout | Dịch vụ phụ thuộc timeout | `SocketTimeoutException` |

> 💡 **Ba lằn ranh hay nhầm:**
> - **401 vs 403**: 401 = "tôi không biết bạn là ai"; 403 = "tôi biết bạn là ai, và bạn không được phép".
> - **400 vs 422**: 400 = JSON hỏng, thiếu trường, sai kiểu; 422 = JSON hợp lệ nhưng "ngày kết thúc trước ngày bắt đầu".
> - **404 vs 403**: Với tài nguyên nhạy cảm, trả **404** thay vì 403 để không tiết lộ rằng tài nguyên đó tồn tại.

### 11.7 `@ResponseStatus` — cách nhanh cho dự án nhỏ

```java
/** Cách "một dòng" — Spring tự map sang 404 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class KhachHangKhongTonTaiException extends RuntimeException {
    public KhachHangKhongTonTaiException(Long id) {
        super("Không tìm thấy khách hàng id=" + id);
    }
}
```

| Tiêu chí | `@ResponseStatus` | `@RestControllerAdvice` |
|----------|-------------------|-------------------------|
| Độ dài code | 1 dòng | Nhiều dòng |
| Kiểm soát body | ❌ Dùng format mặc định của Spring | ✅ Hoàn toàn |
| Ghi log | ❌ Không tự log | ✅ Log có ngữ cảnh |
| Gắn HTTP với domain | ⚠️ Domain class "biết" về HTTP — vi phạm phân tách tầng | ✅ HTTP chỉ ở tầng web |
| Nên dùng | Prototype, dự án nhỏ | **Dự án thật** |

> ⚠️ **Vấn đề kiến trúc của `@ResponseStatus`:** Nó buộc exception nghiệp vụ (thuộc tầng domain) phải import `org.springframework.http.HttpStatus`. Nếu sau này bạn dùng lại domain layer cho một ứng dụng CLI hoặc message consumer, HTTP status trở nên vô nghĩa. Với Clean Architecture, hãy để việc ánh xạ HTTP **hoàn toàn** ở tầng web (`@RestControllerAdvice`).

### 11.8 Exception và `@Transactional` — cái bẫy chết người

> 🚨 **ĐÂY LÀ MỘT TRONG NHỮNG CẠM BẪY GÂY MẤT DỮ LIỆU NHIỀU NHẤT TRONG SPRING.**

**Quy tắc rollback mặc định của Spring:**

| Loại exception | Rollback mặc định? |
|----------------|--------------------|
| `RuntimeException` và con cháu | ✅ **CÓ** |
| `Error` và con cháu | ✅ **CÓ** |
| Checked `Exception` (ví dụ `IOException`) | ❌ **KHÔNG!** |

```java
// ❌ BẪY: checked exception KHÔNG rollback → dữ liệu bị commit một nửa!
@Service
@Transactional
public class DonHangService {

    public void datHang(YeuCau yc) throws IOException {
        donHangRepository.save(donHang);        // ① ghi đơn hàng
        tonKhoRepository.tru(yc.sanPhamId());   // ② trừ tồn kho

        ghiFileKiemToan(donHang);               // ③ ném IOException
        // 💥 Transaction VẪN COMMIT! Đơn hàng đã lưu, tồn kho đã trừ,
        //    nhưng file kiểm toán không có → dữ liệu không nhất quán.
    }
}
```

**Ba cách sửa:**

```java
// ✅ Cách 1 — khai báo rollbackFor (tường minh nhất)
@Transactional(rollbackFor = Exception.class)
public void datHang(YeuCau yc) throws IOException { ... }

// ✅ Cách 2 — bọc checked thành unchecked (khuyến nghị)
@Transactional
public void datHang(YeuCau yc) {
    try {
        ghiFileKiemToan(donHang);
    } catch (IOException e) {
        throw new GhiKiemToanThatBaiException("Không ghi được sổ kiểm toán", e);
        //     ^ RuntimeException → Spring TỰ rollback
    }
}

// ✅ Cách 3 — đặt mặc định cho cả class
@Transactional(rollbackFor = Exception.class)
@Service
public class DonHangService { ... }
```

**Cạm bẫy thứ hai — `catch` bên trong `@Transactional` nuốt mất rollback:**

```java
// ❌ BẪY: bắt exception → Spring KHÔNG biết có lỗi → COMMIT dữ liệu hỏng
@Transactional
public void datHang(YeuCau yc) {
    donHangRepository.save(donHang);
    try {
        tonKhoRepository.tru(yc.sanPhamId());
    } catch (KhongDuTonKhoException e) {
        log.warn("Không đủ tồn kho");   // ⚠️ Nuốt exception
    }
    // → Transaction COMMIT: đơn hàng được tạo dù KHÔNG trừ được tồn kho!
}

// ✅ ĐÚNG: để exception bay lên để Spring rollback
@Transactional
public void datHang(YeuCau yc) {
    donHangRepository.save(donHang);
    tonKhoRepository.tru(yc.sanPhamId());   // ném → rollback toàn bộ
}

// ✅ Nếu THẬT SỰ cần xử lý mà vẫn rollback: đánh dấu rollback thủ công
@Transactional
public void datHang(YeuCau yc) {
    try {
        tonKhoRepository.tru(yc.sanPhamId());
    } catch (KhongDuTonKhoException e) {
        TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
        throw new DatHangThatBaiException("Không đủ tồn kho", e);
    }
}
```

**Cạm bẫy thứ ba — gọi method `@Transactional` từ chính class đó (self-invocation):**

```java
@Service
public class DonHangService {

    public void xuLyLo(List<YeuCau> danhSach) {
        for (YeuCau yc : danhSach) {
            try {
                datHang(yc);   // ❌ Gọi nội bộ → KHÔNG qua proxy → @Transactional VÔ HIỆU
            } catch (Exception e) {
                log.warn("Bỏ qua {}", yc.id(), e);
            }
        }
    }

    @Transactional
    public void datHang(YeuCau yc) { ... }   // ⚠️ Không có transaction khi gọi nội bộ!
}
```

**Sửa:** Tách `datHang` sang một bean khác, hoặc tiêm chính mình qua `@Lazy`, hoặc dùng `TransactionTemplate`.

### 11.9 Logging có ngữ cảnh — Correlation ID

Trong hệ thống thật, một request đi qua nhiều service. Bạn cần **nối các dòng log** lại với nhau:

```java
/** Filter gán ID truy vết cho mỗi request và đưa vào MDC của logger */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter extends OncePerRequestFilter {

    private static final String HEADER = "X-Correlation-Id";
    private static final String MDC_KEY = "correlationId";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String id = Optional.ofNullable(request.getHeader(HEADER))
                .filter(s -> !s.isBlank())
                .orElseGet(() -> UUID.randomUUID().toString());
        try {
            MDC.put(MDC_KEY, id);              // ⭐ đưa vào Mapped Diagnostic Context
            response.setHeader(HEADER, id);    // trả lại cho client
            chain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY);               // ⭐ BẮT BUỘC dọn — thread được tái sử dụng!
        }
    }
}
```

```xml
<!-- logback-spring.xml — in correlationId trong mọi dòng log -->
<pattern>%d{ISO8601} [%thread] %-5level [%X{correlationId}] %logger{36} - %msg%n</pattern>
```

Kết quả:

```
2026-08-12 09:14:21 [http-nio-8080-exec-3] INFO  [a3f9-...] c.s.c.DonHangController - Nhận yêu cầu đặt hàng
2026-08-12 09:14:22 [http-nio-8080-exec-3] WARN  [a3f9-...] c.s.e.GlobalExceptionHandler - 409 tại POST /api/don-hang: Sản phẩm 'iPhone' chỉ còn 2, yêu cầu 5
```

Chỉ cần `grep a3f9` là thấy toàn bộ hành trình của request đó.

> ⚠️ **`MDC.remove()` trong `finally` là BẮT BUỘC.** Tomcat tái sử dụng thread. Nếu không dọn, request tiếp theo sẽ mang correlation ID của request trước — và bạn sẽ debug nhầm hoàn toàn.

### 11.10 Kiến trúc phân tầng cho exception

```
┌──────────────────────────────────────────────────────────────────────┐
│  TẦNG WEB (@RestController)                                          │
│  • KHÔNG try-catch (trừ trường hợp rất đặc biệt)                     │
│  • Để exception bay lên @RestControllerAdvice                        │
│  • @RestControllerAdvice: MAP exception → HTTP status + ErrorResponse│
│  • LOG một lần duy nhất tại đây                                      │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ ném lên
┌───────────────────────────────┴──────────────────────────────────────┐
│  TẦNG SERVICE (@Service)                                             │
│  • NÉM exception nghiệp vụ: KhongDuTonKhoException, ...              │
│  • KHÔNG log (trừ WARN cho tình huống đặc biệt)                      │
│  • KHÔNG biết gì về HTTP                                             │
│  • Bọc exception hạ tầng thành exception nghiệp vụ nếu cần ngữ cảnh  │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ ném lên
┌───────────────────────────────┴──────────────────────────────────────┐
│  TẦNG REPOSITORY (@Repository)                                       │
│  • Trả Optional cho "không tìm thấy" (KHÔNG ném)                     │
│  • Bọc SQLException → TruyCapDuLieuException (unchecked)             │
│  • Spring Data JPA đã tự làm việc này qua DataAccessException        │
└──────────────────────────────────────────────────────────────────────┘
```

**Code hoàn chỉnh theo kiến trúc này:**

```java
// ── TẦNG REPOSITORY ──────────────────────────────────────────────
public interface DonHangRepository extends JpaRepository<DonHang, Long> {
    Optional<DonHang> findByMaVanDon(String maVanDon);   // ⭐ Optional, không ném
}

// ── TẦNG SERVICE ─────────────────────────────────────────────────
@Service
@RequiredArgsConstructor
@Transactional
public class DonHangServiceImpl implements DonHangService {

    private final DonHangRepository donHangRepository;
    private final SanPhamRepository sanPhamRepository;

    @Override
    @Transactional(readOnly = true)
    public DonHangDto layTheoId(Long id) {
        return donHangRepository.findById(id)
                .map(this::sangDto)
                .orElseThrow(() -> new DonHangKhongTonTaiException(id));  // ⭐ ném nghiệp vụ
    }

    @Override
    public DonHangDto tao(TaoDonHangRequest request) {
        // Fail fast: kiểm tra tồn kho TRƯỚC khi ghi bất kỳ thứ gì
        for (var dong : request.cacDong()) {
            SanPham sp = sanPhamRepository.findById(dong.sanPhamId())
                    .orElseThrow(() -> new SanPhamKhongTonTaiException(dong.sanPhamId()));

            if (sp.getTonKho() < dong.soLuong()) {
                throw new KhongDuTonKhoException(
                        sp.getId(), sp.getTen(), sp.getTonKho(), dong.soLuong());
            }
        }
        // ... tạo đơn, trừ tồn kho — mọi thứ trong CÙNG một transaction
        DonHang daLuu = donHangRepository.save(dungDonHang(request));
        return sangDto(daLuu);
    }
}

// ── TẦNG WEB ─────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/don-hang")
@RequiredArgsConstructor
@Validated
public class DonHangController {

    private final DonHangService donHangService;

    @GetMapping("/{id}")
    public ResponseEntity<DonHangDto> layTheoId(@PathVariable Long id) {
        return ResponseEntity.ok(donHangService.layTheoId(id));
        // ⭐ KHÔNG try-catch. Exception bay lên advice. Controller SẠCH.
    }

    @PostMapping
    public ResponseEntity<DonHangDto> tao(@Valid @RequestBody TaoDonHangRequest request) {
        DonHangDto daTao = donHangService.tao(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(daTao.id()).toUri();
        return ResponseEntity.created(location).body(daTao);
    }
}
```

---

## Phần 12 — Chủ Đề Nâng Cao

### 12.1 `StackWalker` (Java 9+) — duyệt stack hiệu quả

`Throwable.getStackTrace()` phải **chụp toàn bộ** stack rồi mới cho bạn xem. Với stack sâu, việc này rất tốn kém. `StackWalker` cho phép duyệt **lười** và **dừng sớm**:

```java
public class ViDuStackWalker {

    /** Lấy tên method đang gọi mình — cách CŨ (tốn kém) */
    static String cachCu() {
        return new Throwable().getStackTrace()[1].getMethodName();
        // ⚠️ Chụp TOÀN BỘ stack chỉ để lấy 1 phần tử
    }

    /** Cách MỚI — chỉ duyệt đúng số khung cần thiết */
    static String cachMoi() {
        return StackWalker.getInstance()
                .walk(luong -> luong
                        .skip(1)                 // bỏ chính method này
                        .findFirst()             // ⭐ dừng NGAY sau khung đầu tiên
                        .map(StackWalker.StackFrame::getMethodName)
                        .orElse("không rõ"));
    }

    /** Lấy class gọi trực tiếp — cần quyền RETAIN_CLASS_REFERENCE */
    static Class<?> classGoi() {
        return StackWalker.getInstance(StackWalker.Option.RETAIN_CLASS_REFERENCE)
                .walk(luong -> luong.skip(1).findFirst()
                        .map(StackWalker.StackFrame::getDeclaringClass)
                        .orElse(null));
    }

    /** Lọc bỏ khung framework, chỉ giữ code của mình — cực hữu ích khi log */
    static List<String> chiCodeCuaToi() {
        return StackWalker.getInstance()
                .walk(luong -> luong
                        .filter(f -> f.getClassName().startsWith("com.shop"))
                        .limit(5)
                        .map(f -> f.getClassName() + "." + f.getMethodName()
                                + ":" + f.getLineNumber())
                        .toList());
    }
}
```

| Tiêu chí | `Throwable.getStackTrace()` | `StackWalker` |
|----------|----------------------------|---------------|
| Chụp toàn bộ stack | ✅ Luôn luôn | ❌ Lười, dừng khi đủ |
| Hiệu năng (stack sâu) | Chậm | **Nhanh hơn nhiều** |
| Lấy được `Class` object | ❌ Chỉ có tên chuỗi | ✅ Có, với `RETAIN_CLASS_REFERENCE` |
| Lọc/skip khung | Thủ công sau khi chụp | ✅ Ngay trong stream |
| Từ phiên bản | Mọi phiên bản | Java 9+ |

### 12.2 Helpful NullPointerException (Java 14+)

Từ Java 14 (bật mặc định từ Java 15), NPE mô tả **chính xác** biến nào null:

```java
// Java 8 — vô dụng
Exception in thread "main" java.lang.NullPointerException
	at com.shop.Service.xuLy(Service.java:42)
// → Trên dòng 42 có 4 biến. Cái nào null?! 😩

// Java 15+ — cực kỳ hữu ích
Exception in thread "main" java.lang.NullPointerException:
Cannot invoke "com.shop.ThanhPho.getTen()" because the return value of
"com.shop.DiaChi.getThanhPho()" is null
	at com.shop.Service.xuLy(Service.java:42)
// → Biết ngay: getThanhPho() trả về null 🎉
```

```bash
# Bật/tắt tường minh (Java 14 cần bật thủ công)
java -XX:+ShowCodeDetailsInExceptionMessages MyApp
```

> ⚠️ **Lưu ý bảo mật:** Helpful NPE có thể lộ **tên biến và cấu trúc class** ra ngoài nếu message lọt vào response. Đây là thêm một lý do để **không bao giờ** trả `ex.getMessage()` của lỗi 500 ra client.

### 12.3 Sealed exception hierarchy (Java 17+)

Kết hợp `sealed` + pattern matching cho `switch` (Java 21) để có **kiểm tra đầy đủ tại compile time**:

```java
/** Đóng kín hệ thống lỗi thanh toán — không ai ngoài 3 lớp này được kế thừa */
public sealed abstract class LoiThanhToanException extends RuntimeException
        permits SoDuKhongDuException, TheHetHanException, CongThanhToanLoiException {

    protected LoiThanhToanException(String message) {
        super(message);
    }
}

public final class SoDuKhongDuException extends LoiThanhToanException {
    private final BigDecimal soTienThieu;
    // ...
    public BigDecimal getSoTienThieu() { return soTienThieu; }
}

public final class TheHetHanException extends LoiThanhToanException {
    private final YearMonth ngayHetHan;
    // ...
    public YearMonth getNgayHetHan() { return ngayHetHan; }
}

public final class CongThanhToanLoiException extends LoiThanhToanException {
    private final int maHttp;
    // ...
    public int getMaHttp() { return maHttp; }
}
```

```java
// Java 21 — switch trên kiểu, compiler KIỂM TRA ĐẦY ĐỦ (exhaustive)
ResponseEntity<ErrorResponse> xuLy(LoiThanhToanException ex) {
    return switch (ex) {
        case SoDuKhongDuException e -> ResponseEntity
                .status(HttpStatus.PAYMENT_REQUIRED)
                .body(new ErrorResponse("SO_DU_KHONG_DU",
                        "Còn thiếu " + e.getSoTienThieu() + "đ"));

        case TheHetHanException e -> ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("THE_HET_HAN",
                        "Thẻ hết hạn " + e.getNgayHetHan()));

        case CongThanhToanLoiException e -> ResponseEntity
                .status(HttpStatus.BAD_GATEWAY)
                .body(new ErrorResponse("CONG_THANH_TOAN_LOI",
                        "Cổng thanh toán lỗi"));
        // ⭐ KHÔNG cần "default" — compiler biết đã liệt kê hết.
        //    Thêm exception mới vào permits mà quên xử lý → LỖI BIÊN DỊCH. Tuyệt vời!
    };
}
```

### 12.4 Exception trong Lambda và Stream — nỗi đau kinh điển

**Vấn đề:** Functional interface của JDK **không khai báo** checked exception.

```java
@FunctionalInterface
public interface Function<T, R> {
    R apply(T t);      // ⚠️ KHÔNG có "throws"
}
```

```java
// ❌ LỖI BIÊN DỊCH: unhandled exception IOException
List<String> noiDung = duongDans.stream()
        .map(p -> Files.readString(p))   // Files.readString throws IOException
        .toList();
```

**Giải pháp 1 — try-catch bên trong lambda (xấu nhưng đơn giản):**

```java
List<String> noiDung = duongDans.stream()
        .map(p -> {
            try {
                return Files.readString(p);
            } catch (IOException e) {
                throw new UncheckedIOException(e);   // ⭐ JDK có sẵn class này!
            }
        })
        .toList();
```

**Giải pháp 2 — hàm bọc dùng lại được (khuyến nghị):**

```java
/** Functional interface CHO PHÉP ném checked exception */
@FunctionalInterface
public interface HamCoTheNem<T, R> {
    R apply(T t) throws Exception;
}

public final class LambdaUtils {

    private LambdaUtils() {}

    /** Biến một hàm có thể ném checked thành Function thường (bọc thành unchecked) */
    public static <T, R> Function<T, R> khongKiemTra(HamCoTheNem<T, R> ham) {
        return t -> {
            try {
                return ham.apply(t);
            } catch (RuntimeException e) {
                throw e;                                    // giữ nguyên unchecked
            } catch (IOException e) {
                throw new UncheckedIOException(e);          // IO có class chuyên dụng
            } catch (Exception e) {
                throw new RuntimeException(e);              // còn lại bọc chung
            }
        };
    }
}

// Cách dùng — sạch sẽ trở lại
import static com.shop.util.LambdaUtils.khongKiemTra;

List<String> noiDung = duongDans.stream()
        .map(khongKiemTra(Files::readString))    // 🎉
        .toList();
```

**Giải pháp 3 — tách phần thất bại và phần thành công (kiểu `Either`):**

```java
/** Kết quả có thể thành công hoặc thất bại — không dùng exception cho luồng dữ liệu */
public sealed interface KetQua<T> {
    record ThanhCong<T>(T giaTri) implements KetQua<T> {}
    record ThatBai<T>(Exception loi) implements KetQua<T> {}

    static <T> KetQua<T> thu(Callable<T> viec) {
        try {
            return new ThanhCong<>(viec.call());
        } catch (Exception e) {
            return new ThatBai<>(e);
        }
    }
}

// Xử lý cả lô, phân loại thành công/thất bại — KHÔNG dừng giữa chừng
Map<Boolean, List<KetQua<String>>> phanLoai = duongDans.stream()
        .map(p -> KetQua.thu(() -> Files.readString(p)))
        .collect(Collectors.partitioningBy(kq -> kq instanceof KetQua.ThanhCong));

List<KetQua<String>> thanhCong = phanLoai.get(true);
List<KetQua<String>> thatBai   = phanLoai.get(false);
log.info("Đọc được {} file, thất bại {} file", thanhCong.size(), thatBai.size());
```

### 12.5 Exception trong `CompletableFuture`

```java
public class ExceptionBatDongBo {

    public CompletableFuture<DonHangDto> xuLyBatDongBo(Long id) {
        return CompletableFuture
                .supplyAsync(() -> donHangRepository.findById(id)
                        .orElseThrow(() -> new DonHangKhongTonTaiException(id)))

                // ⭐ exceptionally: bắt lỗi, trả giá trị thay thế
                .exceptionally(ex -> {
                    // ⚠️ ex ở đây là CompletionException BỌC exception thật!
                    Throwable that = ex instanceof CompletionException ? ex.getCause() : ex;
                    log.error("Lỗi khi tải đơn {}", id, that);
                    return DonHangDto.rong();
                })

                // ⭐ handle: nhận CẢ kết quả lẫn lỗi
                .handle((kq, ex) -> ex == null ? kq : DonHangDto.rong())

                // ⭐ whenComplete: chỉ quan sát, KHÔNG đổi kết quả
                .whenComplete((kq, ex) -> {
                    if (ex != null) log.warn("Hoàn tất với lỗi", ex);
                })

                .thenApply(this::lamGiau);
    }
}
```

> ⚠️ **Bẫy `CompletionException`:** Exception bạn ném trong `supplyAsync` sẽ bị **bọc** trong `CompletionException` khi tới `exceptionally`. Luôn `getCause()` để lấy exception thật, nếu không `instanceof` của bạn sẽ không bao giờ khớp.

### 12.6 Retry với exponential backoff

```java
/**
 * Thực thi một tác vụ với cơ chế thử lại theo cấp số nhân + jitter.
 *
 * <p>Chỉ retry những exception ĐƯỢC PHÉP retry (transient). KHÔNG BAO GIỜ retry
 * lỗi nghiệp vụ như "số dư không đủ" — thử lại 5 lần cũng vẫn không đủ.</p>
 */
public final class CoCheThuLai {

    private static final Logger log = LoggerFactory.getLogger(CoCheThuLai.class);
    private static final Random NGAU_NHIEN = new Random();

    public static <T> T thucThi(Callable<T> viec,
                                int soLanToiDa,
                                Duration doTreBanDau,
                                Predicate<Exception> coNenThuLai) {
        Exception loiCuoi = null;

        for (int lan = 1; lan <= soLanToiDa; lan++) {
            try {
                return viec.call();                       // ✅ thành công → trả ngay

            } catch (Exception e) {
                loiCuoi = e;

                // ⭐ Không phải lỗi tạm thời → ném ngay, KHÔNG phí thời gian retry
                if (!coNenThuLai.test(e)) {
                    log.debug("Lỗi không thể retry, ném ngay: {}", e.toString());
                    throw e instanceof RuntimeException re
                            ? re
                            : new RuntimeException("Thất bại không thể retry", e);
                }

                if (lan == soLanToiDa) break;             // hết lượt

                // ⭐ Exponential backoff: 100ms → 200ms → 400ms → 800ms ...
                long treMs = doTreBanDau.toMillis() * (1L << (lan - 1));
                // ⭐ Jitter ±20% — tránh "thundering herd" khi hàng nghìn client cùng retry
                long jitter = (long) (treMs * 0.2 * (NGAU_NHIEN.nextDouble() * 2 - 1));
                long choMs = Math.max(0, treMs + jitter);

                log.warn("Lần {}/{} thất bại ({}), thử lại sau {}ms",
                        lan, soLanToiDa, e.toString(), choMs);

                try {
                    Thread.sleep(choMs);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();    // ⭐ khôi phục cờ
                    throw new IllegalStateException("Bị ngắt khi đang chờ retry", ie);
                }
            }
        }

        throw new RuntimeException(
                "Thất bại sau " + soLanToiDa + " lần thử", loiCuoi);
    }
}
```

**Cách dùng:**

```java
// Chỉ retry lỗi mạng/timeout — KHÔNG retry lỗi nghiệp vụ
Predicate<Exception> coTheRetry = e ->
        e instanceof SocketTimeoutException
                || e instanceof ConnectException
                || (e instanceof HttpServerErrorException he && he.getStatusCode().is5xxServerError());

KetQuaThanhToan kq = CoCheThuLai.thucThi(
        () -> congThanhToan.tinhPhi(donHang),
        4,                          // tối đa 4 lần
        Duration.ofMillis(200),     // 200ms → 400ms → 800ms
        coTheRetry
);
```

**Bảng phân loại: lỗi nào NÊN retry?**

| Loại lỗi | Retry? | Lý do |
|----------|--------|-------|
| `SocketTimeoutException` | ✅ Có | Mạng chập chờn, lần sau có thể được |
| `ConnectException` | ✅ Có | Service đang khởi động lại |
| HTTP 503 / 502 / 504 | ✅ Có | Lỗi tạm thời phía server |
| HTTP 429 (rate limit) | ✅ Có, backoff dài | Chờ hết cửa sổ giới hạn |
| `OptimisticLockingFailureException` | ✅ Có | Xung đột đồng thời, lần sau có thể qua |
| HTTP 400 / 404 / 422 | ❌ **Không** | Request sai — thử lại vẫn sai |
| HTTP 401 / 403 | ❌ **Không** | Thiếu quyền — thử lại vô nghĩa |
| `SoDuKhongDuException` | ❌ **Không** | Lỗi nghiệp vụ, không tự khỏi |
| `IllegalArgumentException` | ❌ **Không** | Bug của bạn |

> 🌱 **Trong Spring Boot thực tế:** dùng `spring-retry` với `@Retryable`, hoặc **Resilience4j** — không cần tự viết. Nhưng hiểu cơ chế bên trong giúp bạn cấu hình đúng.
> ```java
> @Retryable(
>     retryFor = { SocketTimeoutException.class, ConnectException.class },
>     noRetryFor = { SoDuKhongDuException.class },
>     maxAttempts = 4,
>     backoff = @Backoff(delay = 200, multiplier = 2, random = true))
> public KetQuaThanhToan tinhPhi(DonHang donHang) { ... }
>
> @Recover
> public KetQuaThanhToan phuongAnDuPhong(SocketTimeoutException e, DonHang donHang) {
>     log.error("Hết lượt retry cho đơn {}", donHang.id(), e);
>     throw new DichVuNgoaiException("cong-thanh-toan", "Không kết nối được", e);
> }
> ```

### 12.7 Exception và Virtual Threads (Java 21+)

```java
// Virtual threads — exception hoạt động y hệt platform thread
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<String>> ketQua = executor.invokeAll(cacViec);

    for (Future<String> f : ketQua) {
        try {
            System.out.println(f.get());
        } catch (ExecutionException e) {
            // ⭐ Exception thật nằm trong getCause()
            log.error("Tác vụ thất bại", e.getCause());
        }
    }
}   // ⭐ ExecutorService là AutoCloseable từ Java 19 → tự shutdown + chờ hoàn tất
```

**Structured Concurrency (preview) — lỗi lan truyền có cấu trúc:**

```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Subtask<KhachHang> khach = scope.fork(() -> layKhachHang(id));
    Subtask<List<DonHang>> donHang = scope.fork(() -> layDonHang(id));

    scope.join();
    scope.throwIfFailed(e -> new TaiDuLieuThatBaiException("Không tải được hồ sơ", e));
    //    ⭐ Nếu BẤT KỲ subtask nào lỗi → các task còn lại bị huỷ tự động

    return new HoSo(khach.get(), donHang.get());
}
```

---
## Phần 13 — Kiểm Thử Đường Thất Bại

Một sự thật đau lòng: **80% bug production nằm ở đường xử lý lỗi** — chính là phần **ít được test nhất**. Lý do đơn giản: đường thành công dễ test, đường thất bại thì phải "dựng" ra tình huống lỗi.

### 13.1 JUnit 5 — `assertThrows`

```java
import static org.junit.jupiter.api.Assertions.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DonHangServiceTest {

    @Mock  DonHangRepository donHangRepository;
    @Mock  SanPhamRepository sanPhamRepository;
    @InjectMocks DonHangServiceImpl donHangService;

    // ── ĐƯỜNG THÀNH CÔNG ──────────────────────────────────────────
    @Test
    void layTheoId_khiTonTai_traVeDto() {
        // given
        var donHang = new DonHang(1L, 10L, List.of(), Instant.now());
        when(donHangRepository.findById(1L)).thenReturn(Optional.of(donHang));

        // when
        var kq = donHangService.layTheoId(1L);

        // then
        assertThat(kq.id()).isEqualTo(1L);
    }

    // ── ĐƯỜNG THẤT BẠI: kiểm tra ĐÚNG LOẠI exception ─────────────
    @Test
    void layTheoId_khiKhongTonTai_neDonHangKhongTonTaiException() {
        // given
        when(donHangRepository.findById(999L)).thenReturn(Optional.empty());

        // when + then
        assertThrows(DonHangKhongTonTaiException.class,
                () -> donHangService.layTheoId(999L));
    }

    // ── Kiểm tra cả MESSAGE ───────────────────────────────────────
    @Test
    void layTheoId_khiKhongTonTai_messageChuaId() {
        when(donHangRepository.findById(999L)).thenReturn(Optional.empty());

        var ex = assertThrows(DonHangKhongTonTaiException.class,
                () -> donHangService.layTheoId(999L));

        assertThat(ex.getMessage()).contains("999");
    }

    // ── Kiểm tra DỮ LIỆU NGHIỆP VỤ trong exception ────────────────
    @Test
    void tao_khiKhongDuTonKho_exceptionMangDuLieuChinhXac() {
        // given: sản phẩm chỉ còn 2, khách đặt 5
        var sanPham = new SanPham(7L, "iPhone", new BigDecimal("25000000"), 2);
        when(sanPhamRepository.findById(7L)).thenReturn(Optional.of(sanPham));
        var yeuCau = new TaoDonHangRequest(10L, List.of(new DongHangRequest(7L, 5)));

        // when + then — dùng AssertJ để kiểm tra sâu vào exception
        assertThatThrownBy(() -> donHangService.tao(yeuCau))
                .isInstanceOf(KhongDuTonKhoException.class)
                .hasMessageContaining("iPhone")
                .hasMessageContaining("2")
                .hasMessageContaining("5")
                .extracting("sanPhamId", "tonKhoHienCo", "soLuongYeuCau")
                .containsExactly(7L, 2, 5);
    }

    // ── Kiểm tra CHUỖI CAUSE ──────────────────────────────────────
    @Test
    void tao_khiDbLoi_bocThanhTruyCapDuLieuException_giuNguyenCause() {
        var loiGoc = new DataAccessResourceFailureException("Mất kết nối");
        when(donHangRepository.save(any())).thenThrow(loiGoc);

        assertThatThrownBy(() -> donHangService.tao(yeuCauHopLe()))
                .isInstanceOf(TruyCapDuLieuException.class)
                .hasMessageContaining("Không tạo được đơn hàng")
                .hasCause(loiGoc)                                    // ⭐ cause trực tiếp
                .hasRootCauseInstanceOf(DataAccessResourceFailureException.class);
    }

    // ── Kiểm tra KHÔNG ném exception ──────────────────────────────
    @Test
    void tao_khiDuTonKho_khongNemException() {
        assertThatCode(() -> donHangService.tao(yeuCauHopLe()))
                .doesNotThrowAnyException();
    }

    // ── Kiểm tra tác dụng phụ KHÔNG xảy ra khi lỗi ────────────────
    @Test
    void tao_khiKhongDuTonKho_khongLuuDonHang() {
        var sanPham = new SanPham(7L, "iPhone", new BigDecimal("25000000"), 0);
        when(sanPhamRepository.findById(7L)).thenReturn(Optional.of(sanPham));

        assertThrows(KhongDuTonKhoException.class,
                () -> donHangService.tao(new TaoDonHangRequest(10L,
                        List.of(new DongHangRequest(7L, 1)))));

        // ⭐ QUAN TRỌNG: xác nhận KHÔNG có tác dụng phụ nào xảy ra
        verify(donHangRepository, never()).save(any());
    }
}
```

### 13.2 Bảng API kiểm thử exception

| Nhu cầu | JUnit 5 | AssertJ |
|---------|---------|---------|
| Ném đúng loại | `assertThrows(X.class, () -> ...)` | `assertThatThrownBy(...).isInstanceOf(X.class)` |
| Ném đúng loại **chính xác** (không nhận con) | — | `.isExactlyInstanceOf(X.class)` |
| Kiểm tra message | `ex.getMessage()` rồi assert | `.hasMessage("...")` / `.hasMessageContaining("...")` |
| Message khớp regex | — | `.hasMessageMatching(".*id=\\d+.*")` |
| Kiểm tra cause | `ex.getCause()` | `.hasCause(x)` / `.hasCauseInstanceOf(X.class)` |
| Kiểm tra root cause | Tự duyệt | `.hasRootCauseInstanceOf(X.class)` |
| Kiểm tra field custom | `ex.getXxx()` | `.extracting("field").isEqualTo(...)` |
| Không ném gì | `assertDoesNotThrow(() -> ...)` | `assertThatCode(...).doesNotThrowAnyException()` |
| Kiểm tra suppressed | `ex.getSuppressed()` | `.hasSuppressedException(x)` |

### 13.3 Integration test cho `@RestControllerAdvice`

```java
@SpringBootTest
@AutoConfigureMockMvc
class DonHangControllerIntegrationTest {

    @Autowired MockMvc mockMvc;
    @MockBean DonHangService donHangService;

    @Test
    void layTheoId_khiKhongTonTai_tra404VaDungDinhDang() throws Exception {
        when(donHangService.layTheoId(999L))
                .thenThrow(new DonHangKhongTonTaiException(999L));

        mockMvc.perform(get("/api/don-hang/999"))
                .andExpect(status().isNotFound())                          // ⭐ ĐÚNG status
                .andExpect(jsonPath("$.maLoi").value("DON_HANG_KHONG_TON_TAI"))
                .andExpect(jsonPath("$.thongDiep").value(containsString("999")))
                .andExpect(jsonPath("$.duongDan").value("/api/don-hang/999"))
                .andExpect(jsonPath("$.thoiDiem").exists());
    }

    @Test
    void tao_khiThieuTruongBatBuoc_tra400VaChiTietTungTruong() throws Exception {
        String jsonThieu = """
                { "cacDong": [] }
                """;

        mockMvc.perform(post("/api/don-hang")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonThieu))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.maLoi").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.chiTiet.khachHangId").exists())
                .andExpect(jsonPath("$.chiTiet.cacDong").exists());
    }

    @Test
    void khiLoiNoiBo_tra500_KHONG_lo_stackTrace() throws Exception {
        when(donHangService.layTheoId(1L))
                .thenThrow(new NullPointerException("biến nội bộ null"));

        mockMvc.perform(get("/api/don-hang/1"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.maLoi").value("INTERNAL_ERROR"))
                // ⭐ KIỂM TRA BẢO MẬT: không được lộ chi tiết nội bộ
                .andExpect(jsonPath("$.thongDiep")
                        .value(not(containsString("NullPointerException"))))
                .andExpect(jsonPath("$.thongDiep")
                        .value(not(containsString("biến nội bộ null"))))
                .andExpect(jsonPath("$.stackTrace").doesNotExist());
    }
}
```

> 🎯 **Test cuối cùng là quan trọng nhất** và hầu như không ai viết: **kiểm chứng rằng thông tin nội bộ KHÔNG rò rỉ**. Hãy đưa nó vào bộ test chuẩn của mọi dự án.

### 13.4 Test transaction rollback

```java
@SpringBootTest
@Transactional   // ⚠️ Chú ý: annotation này khiến test tự rollback — cẩn thận khi test rollback!
class DonHangServiceTransactionTest {

    @Autowired DonHangService donHangService;
    @Autowired DonHangRepository donHangRepository;
    @Autowired TransactionTemplate transactionTemplate;

    @Test
    void tao_khiTruTonKhoLoi_rollbackToanBo() {
        long soDonTruoc = donHangRepository.count();

        // Chạy trong transaction RIÊNG để quan sát rollback thật
        assertThrows(KhongDuTonKhoException.class, () ->
                transactionTemplate.execute(status -> {
                    donHangService.tao(yeuCauVuotTonKho());
                    return null;
                }));

        // ⭐ Xác nhận KHÔNG có đơn hàng nào bị ghi lại
        assertThat(donHangRepository.count()).isEqualTo(soDonTruoc);
    }
}
```

---

## Phần 14 — Bài Tập Thực Hành

### Bài 1 (Dễ) — Chia số an toàn

**Đề bài:** Viết class `MayTinh` với method `chia(int a, int b)`:
- Trả về kết quả phép chia nếu hợp lệ
- Nếu `b == 0`, xử lý sao cho chương trình **không crash** mà báo lỗi rõ ràng
- Viết thêm `chiaAnToan(int a, int b, int macDinh)` trả về `macDinh` khi chia cho 0
- So sánh: `10 / 0` (int) và `10.0 / 0` (double) khác nhau thế nào?

**Gợi ý:**
- `ArithmeticException` chỉ xảy ra với **số nguyên**. Với `double`, `10.0/0` cho `Infinity`, `0.0/0.0` cho `NaN` — **không** ném exception.
- Cân nhắc: nên `catch (ArithmeticException)` hay kiểm tra `if (b == 0)` trước? (Gợi ý: **kiểm tra trước** — fail fast, và không dùng exception cho control flow.)

**Khung code:**

```java
public class MayTinh {

    /** Ném ArithmeticException với message rõ ràng khi chia cho 0 */
    public int chia(int a, int b) {
        // TODO
    }

    /** Trả về macDinh thay vì ném exception */
    public int chiaAnToan(int a, int b, int macDinh) {
        // TODO
    }

    /** So sánh hành vi số nguyên vs số thực */
    public static void main(String[] args) {
        System.out.println(10.0 / 0);      // ?
        System.out.println(0.0 / 0.0);     // ?
        System.out.println(Double.isNaN(0.0 / 0.0));   // ?
        // System.out.println(10 / 0);     // ?
    }
}
```

**Tiêu chí hoàn thành:**
- [ ] Message exception nêu rõ giá trị của `a` và `b`
- [ ] `chiaAnToan` **không** dùng try-catch (dùng `if`)
- [ ] Giải thích được vì sao `double` không ném exception

---

### Bài 2 (Dễ) — Custom Exception `TuoiKhongHopLeException`

**Đề bài:** Xây dựng hệ thống đăng ký người dùng với validation tuổi:
1. Tạo `TuoiKhongHopLeException` (unchecked) mang theo **giá trị tuổi bị từ chối** và **khoảng hợp lệ**
2. Đủ **4 constructor chuẩn** (hoặc ít nhất có `(String, Throwable)`)
3. Method `dangKy(String hoTen, int tuoi)`: ném exception nếu `tuoi < 0`, `tuoi > 150`, hoặc `tuoi < 18`
4. Ba trường hợp trên nên là **cùng một exception** hay **ba exception khác nhau**? Giải thích.

**Gợi ý:**
- `tuoi < 0` hoặc `tuoi > 150` là **dữ liệu vô lý** → có thể là `IllegalArgumentException`
- `tuoi < 18` là **quy tắc nghiệp vụ** → nên là exception nghiệp vụ riêng (`ChuaDuTuoiException`), vì tầng trên cần map sang HTTP status khác
- Field trong exception phải `final` và có getter

**Khung code:**

```java
public class TuoiKhongHopLeException extends RuntimeException {
    private final int tuoiNhanDuoc;
    private final int tuoiToiThieu;
    private final int tuoiToiDa;

    // TODO: constructor + getter
}

public class DangKyService {
    public NguoiDung dangKy(String hoTen, int tuoi) {
        // TODO: validate, fail fast
    }
}
```

**Tiêu chí hoàn thành:**
- [ ] Exception mang đủ dữ liệu để tầng trên dựng message mà không cần parse chuỗi
- [ ] Có unit test cho **cả 3** trường hợp lỗi + 1 trường hợp hợp lệ
- [ ] JavaDoc `@throws` đầy đủ

---

### Bài 3 (Trung bình) — Đọc file cấu hình với try-with-resources

**Đề bài:** Viết `DocCauHinh` đọc file `.properties` theo yêu cầu:
1. Dùng **try-with-resources** (không được dùng try-finally)
2. File không tồn tại → trả về cấu hình mặc định, log ở mức INFO
3. File tồn tại nhưng lỗi đọc → ném `CauHinhException` **giữ nguyên cause**
4. Thiếu khoá bắt buộc (`app.name`, `app.port`) → ném `CauHinhThieuKhoaException` liệt kê **tất cả** khoá thiếu (không phải chỉ khoá đầu tiên)
5. Viết class `TaiNguyenGia implements AutoCloseable` ném exception trong `close()` để **chứng minh** suppressed exception

**Gợi ý:**
- `Files.newInputStream(path)` ném `NoSuchFileException` (là con của `IOException`)
- Gom **tất cả** khoá thiếu vào một list rồi mới ném — đừng ném ngay khoá đầu tiên (trải nghiệm người dùng tệ)
- Để thấy suppressed: ném exception trong thân `try` **và** trong `close()`

**Khung code:**

```java
public class DocCauHinh {

    private static final Set<String> KHOA_BAT_BUOC = Set.of("app.name", "app.port");

    public Properties doc(Path duongDan) {
        // TODO: try-with-resources
        // TODO: NoSuchFileException → mặc định
        // TODO: IOException khác → CauHinhException(msg, e)
        // TODO: kiểm tra khoá bắt buộc, gom hết rồi ném
    }

    private Properties macDinh() {
        var p = new Properties();
        p.setProperty("app.name", "ung-dung-mac-dinh");
        p.setProperty("app.port", "8080");
        return p;
    }
}
```

**Tiêu chí hoàn thành:**
- [ ] Không có `finally` nào trong code
- [ ] Message của `CauHinhThieuKhoaException` liệt kê đủ mọi khoá thiếu
- [ ] Test chứng minh `getSuppressed().length == 1` trong tình huống dựng sẵn
- [ ] Test chứng minh `getCause()` không null khi lỗi I/O

---

### Bài 4 (Trung bình) — `@RestControllerAdvice` hoàn chỉnh

**Đề bài:** Xây REST API quản lý sản phẩm với xử lý lỗi chuẩn production:

| Endpoint | Tình huống lỗi | Status mong đợi |
|----------|----------------|-----------------|
| `GET /api/san-pham/{id}` | id không tồn tại | 404 |
| `GET /api/san-pham/{id}` | id không phải số (`/abc`) | 400 |
| `POST /api/san-pham` | thiếu trường bắt buộc | 400 + chi tiết từng trường |
| `POST /api/san-pham` | tên sản phẩm đã tồn tại | 409 |
| `POST /api/san-pham` | giá âm | 400 |
| `DELETE /api/san-pham/{id}` | sản phẩm đang có trong đơn hàng | 409 |
| Bất kỳ | lỗi không lường trước | 500 + mã truy vết, **không lộ chi tiết** |

**Yêu cầu:**
1. `ErrorResponse` record với: `maLoi`, `thongDiep`, `status`, `duongDan`, `thoiDiem`, `chiTiet` (nullable)
2. Cây exception có lớp gốc `SanPhamException`
3. Log: 4xx ở mức WARN, 5xx ở mức ERROR kèm stack trace
4. Viết `MockMvc` test cho **mọi** dòng trong bảng trên

**Gợi ý:**
- Dùng `@JsonInclude(NON_NULL)` để `chiTiet` không xuất hiện khi null
- `MethodArgumentTypeMismatchException` cho trường hợp `/abc`
- Nhớ test kiểm chứng **không rò rỉ** tên class trong response 500

---

### Bài 5 (Khó) — Exception chaining nhiều tầng + root cause

**Đề bài:** Mô phỏng một luồng thật với 4 tầng, mỗi tầng bọc thêm ngữ cảnh:

```
① Tầng Config    : đọc file connection string → IOException
② Tầng Connection: dùng config để kết nối DB  → SQLException
③ Tầng Repository: truy vấn                    → TruyCapDuLieuException
④ Tầng Service   : logic nghiệp vụ             → TaiHoSoThatBaiException
```

**Yêu cầu:**
1. Mỗi tầng bọc exception của tầng dưới, **giữ nguyên cause**, thêm ngữ cảnh riêng
2. Viết `ExceptionUtils.timRootCause(Throwable)` có **chống vòng lặp vô hạn**
3. Viết `ExceptionUtils.inChuoi(Throwable)` in ra dạng cây:
   ```
   TaiHoSoThatBaiException: Không tải được hồ sơ khách 1042
     └─ TruyCapDuLieuException: Lỗi truy vấn bảng khach_hang
          └─ SQLException: Connection refused
               └─ IOException: Không đọc được /etc/app/db.conf
   ```
4. Viết handler quyết định HTTP status **dựa trên root cause**:
   - root cause là `IOException` → 500 (lỗi cấu hình)
   - root cause là `SocketTimeoutException` → 504
   - root cause là `SQLException` → 503

**Gợi ý:**
- Chống vòng lặp bằng `IdentityHashMap`-based set hoặc thuật toán Floyd (rùa và thỏ)
- Test tình huống vòng lặp: `a.initCause(b); b.initCause(a);` — kiểm tra không treo

---

### Bài 6 (Khó) — Retry với exponential backoff + circuit breaker mini

**Đề bài:** Xây `CoCheChiuLoi` (fault tolerance) cho lời gọi dịch vụ ngoài:

**Phần A — Retry:**
1. `thucThi(Callable<T>, CauHinhRetry)` với backoff cấp số nhân + jitter ±20%
2. Chỉ retry exception thoả `Predicate<Exception>`
3. Có `maxDelay` để không chờ quá lâu (ví dụ trần 10 giây)
4. `InterruptedException` phải khôi phục cờ và **thoát ngay**
5. Hết lượt → ném exception cuối cùng, các exception của lần trước thêm vào `addSuppressed`

**Phần B — Circuit Breaker mini:**
1. Ba trạng thái: `DONG` (bình thường) → `MO` (chặn hết) → `BAN_MO` (thử một request)
2. Chuyển `DONG → MO` khi tỉ lệ lỗi vượt ngưỡng trong cửa sổ N request gần nhất
3. Sau `resetTimeout`, chuyển `MO → BAN_MO`
4. Ở `BAN_MO`: 1 request thành công → `DONG`; thất bại → quay lại `MO`
5. Ở trạng thái `MO`, ném `MachHoException` **ngay** mà không gọi dịch vụ

**Sơ đồ trạng thái:**

```
                    lỗi vượt ngưỡng
        ┌──────┐ ──────────────────► ┌──────┐
        │ DÓNG │                     │  MỞ  │
        │(cho  │ ◄────────────────── │(chặn │
        │ qua) │   thành công        │ hết) │
        └──────┘         ▲           └──────┘
                         │               │ sau resetTimeout
                         │               ▼
                         │          ┌─────────┐
                         └───────── │ BÁN MỞ  │
                                    │(thử 1   │ ──┐ thất bại
                                    │ request)│ ◄─┘ → quay lại MỞ
                                    └─────────┘
```

**Yêu cầu test:**
- [ ] Retry đúng số lần với đúng khoảng chờ (dùng `Clock` giả để test nhanh)
- [ ] Không retry lỗi nghiệp vụ
- [ ] Circuit mở sau đúng ngưỡng lỗi
- [ ] Ở trạng thái mở, dịch vụ **không** bị gọi (`verify(service, never())`)
- [ ] Chuyển đúng sang bán mở sau timeout

**Gợi ý:**
- Dùng `AtomicReference<TrangThai>` cho an toàn đa luồng
- Cửa sổ trượt: `ArrayDeque<Boolean>` giới hạn kích thước, hoặc bit ring buffer
- Tiêm `Clock` thay vì gọi `System.currentTimeMillis()` trực tiếp → test được không cần `sleep`

---

## Phần 15 — Tóm Tắt & Chương Tiếp Theo

### 15.1 Mười lăm điều cốt lõi

1. **Exception tồn tại để lỗi KHÔNG THỂ bị bỏ qua trong im lặng.** Đó là khác biệt căn bản so với mã lỗi kiểu C.
2. **`Throwable` là gốc.** `Error` = đừng bắt; `Exception` = checked; `RuntimeException` = unchecked.
3. **Checked = ngoại cảnh + phục hồi được. Unchecked = lỗi lập trình.** Trong web app hiện đại, tỉ lệ ~95% unchecked.
4. **Luật handle-or-declare** chỉ áp dụng cho checked. Compiler hoàn toàn im lặng với unchecked.
5. **Thứ tự `catch` phải từ con đến cha** — ngược lại là lỗi biên dịch.
6. **`finally` luôn chạy**, trừ `System.exit()`, `halt()`, JVM crash, hoặc thread treo.
7. **KHÔNG BAO GIỜ `return`/`throw` trong `finally`** — nó nuốt exception trong im lặng.
8. **try-with-resources cho MỌI `AutoCloseable`.** Ngắn hơn, và quan trọng hơn: **đúng hơn** (LIFO + suppressed).
9. **Luôn giữ cause khi bọc exception**: `new MyException(msg, cause)`. Một chữ `e` cứu 3 giờ debug.
10. **Custom exception mang dữ liệu nghiệp vụ có kiểu**, đừng chôn dữ liệu vào chuỗi message.
11. **Dựng cây exception** để bắt theo nhóm và map HTTP status tập trung.
12. **Log MỘT LẦN** ở nơi xử lý thật sự, với đầy đủ ngữ cảnh và exception là tham số cuối của SLF4J.
13. **KHÔNG BAO GIỜ trả stack trace ra client.** Chi tiết vào log, mã truy vết ra client.
14. **`@Transactional` KHÔNG rollback với checked exception** — dùng `rollbackFor` hoặc bọc thành unchecked.
15. **Test đường thất bại** cũng nghiêm túc như đường thành công — đó là nơi 80% bug production ẩn náu.

### 15.2 Cây quyết định tổng hợp

```
                     Bạn gặp một tình huống bất thường
                                    │
        ┌───────────────────────────┴───────────────────────────┐
        ▼                                                       ▼
  "Không có kết quả" là BÌNH THƯỜNG?              Đây là THẤT BẠI thật sự
        │                                                       │
        ▼                                                       ▼
  Dùng Optional<T>                              Lỗi lập trình?  ──YES──► IllegalArgument /
  hoặc trả list rỗng                                  │                   IllegalState /
  (KHÔNG dùng exception)                              │                   NullPointer
                                                     NO
                                                      │
                                                      ▼
                                       Lỗi nghiệp vụ hay hạ tầng?
                                          │                 │
                                    nghiệp vụ           hạ tầng
                                          │                 │
                                          ▼                 ▼
                                Custom unchecked      Bọc thành unchecked
                                extends ShopException  tại tầng repository
                                          │                 │
                                          └────────┬────────┘
                                                   ▼
                                    Bay lên @RestControllerAdvice
                                                   │
                                          ┌────────┴────────┐
                                          ▼                 ▼
                                    4xx: WARN,        5xx: ERROR + stack,
                                    message rõ         message chung chung
                                                       + mã truy vết
```

### 15.3 Checklist trước khi merge code

- [ ] Không có khối `catch` nào rỗng (hoặc nếu có, đã comment giải thích rõ)
- [ ] Không có `catch (Exception e)` ngoài `@RestControllerAdvice`
- [ ] Không có `e.printStackTrace()`
- [ ] Không có `return`/`throw` trong `finally`
- [ ] Mọi `AutoCloseable` đều trong try-with-resources
- [ ] Mọi chỗ bọc exception đều truyền `cause`
- [ ] Message exception nêu rõ **giá trị thực tế** và **kỳ vọng**
- [ ] Message exception không chứa mật khẩu/token/số thẻ
- [ ] Log dùng SLF4J, exception là tham số cuối, không dùng `{}` cho exception
- [ ] Mỗi exception có đúng HTTP status trong advice
- [ ] Response 500 không lộ tên class / SQL / stack trace
- [ ] `@Transactional` có `rollbackFor` nếu method khai báo checked exception
- [ ] JavaDoc `@throws` đầy đủ cho mọi exception có thể ném
- [ ] Có test cho từng nhánh exception
- [ ] `catch (InterruptedException)` có `Thread.currentThread().interrupt()`

### 15.4 Chương tiếp theo

**Chương 6 — File I/O & Serialization** sẽ dùng lại **rất nhiều** kiến thức của chương này:

- `IOException` và cả họ hàng của nó — checked exception điển hình nhất
- try-with-resources trở thành **công cụ làm việc hằng ngày** khi thao tác `InputStream`, `Reader`, `Channel`
- `Files.lines()`, `Files.walk()` và bẫy rò rỉ file descriptor
- `NoSuchFileException`, `AccessDeniedException`, `DirectoryNotEmptyException` — phân biệt và xử lý
- Serialization và `InvalidClassException`, `NotSerializableException` — vì sao field của exception phải serializable
- Ghi file an toàn: viết ra file tạm rồi đổi tên nguyên tử, để lỗi giữa chừng không làm hỏng dữ liệu

Hãy chắc chắn bạn đã làm xong **ít nhất bài 1, 2, 3** trước khi sang chương sau — vì mọi ví dụ ở đó đều giả định bạn viết try-with-resources một cách tự nhiên.

---

## 📎 Phụ Lục A — Bảng Tra Nhanh Exception JDK

### A.1 Unchecked (`RuntimeException`)

| Exception | Package | Nguyên nhân thường gặp | Cách phòng tránh |
|-----------|---------|------------------------|------------------|
| `NullPointerException` | `java.lang` | Gọi method trên `null` | `Optional`, `Objects.requireNonNull`, `@NonNull` |
| `IllegalArgumentException` | `java.lang` | Tham số không hợp lệ | Validate ở đầu method |
| `IllegalStateException` | `java.lang` | Sai trạng thái để gọi | Kiểm tra trạng thái trước |
| `IndexOutOfBoundsException` | `java.lang` | Chỉ số ngoài phạm vi | Kiểm tra `size()`/`length` |
| `ArrayIndexOutOfBoundsException` | `java.lang` | Chỉ số mảng sai | Vòng lặp dùng `< length` |
| `StringIndexOutOfBoundsException` | `java.lang` | `charAt`/`substring` sai | Kiểm tra `length()` |
| `ArithmeticException` | `java.lang` | Chia số nguyên cho 0 | Kiểm tra mẫu số |
| `ClassCastException` | `java.lang` | Ép kiểu sai | `instanceof` + pattern matching |
| `NumberFormatException` | `java.lang` | `parseInt("abc")` | Validate hoặc bắt riêng |
| `UnsupportedOperationException` | `java.lang` | Sửa collection bất biến | Dùng `new ArrayList<>(list)` |
| `NegativeArraySizeException` | `java.lang` | `new int[-1]` | Kiểm tra kích thước |
| `ArrayStoreException` | `java.lang` | Ghi sai kiểu vào mảng | Dùng generic collection |
| `ConcurrentModificationException` | `java.util` | Sửa khi đang duyệt | `Iterator.remove()`, `removeIf()` |
| `NoSuchElementException` | `java.util` | `Optional.get()` rỗng | `orElse`, `orElseThrow` |
| `InputMismatchException` | `java.util` | `Scanner` sai kiểu | `hasNextInt()` trước |
| `EmptyStackException` | `java.util` | `Stack.pop()` rỗng | Kiểm tra `isEmpty()` |
| `DateTimeException` | `java.time` | Ngày tháng không hợp lệ | Validate trước khi tạo |
| `UncheckedIOException` | `java.io` | Bọc `IOException` trong lambda | — |
| `DataAccessException` | `org.springframework.dao` | Lỗi DB (Spring bọc lại) | Bắt loại con cụ thể |

### A.2 Checked

| Exception | Package | Nguyên nhân | Cách xử lý điển hình |
|-----------|---------|-------------|----------------------|
| `IOException` | `java.io` | Lỗi vào/ra chung | Retry / fallback / bọc |
| `FileNotFoundException` | `java.io` | File không tồn tại/không mở được | Dùng mặc định / báo user |
| `NoSuchFileException` | `java.nio.file` | Bản NIO của trên | Như trên |
| `AccessDeniedException` | `java.nio.file` | Không có quyền | Báo lỗi cấu hình |
| `EOFException` | `java.io` | Hết dữ liệu bất ngờ | Báo file hỏng |
| `UnsupportedEncodingException` | `java.io` | Charset không hỗ trợ | Dùng `StandardCharsets` |
| `SocketTimeoutException` | `java.net` | Quá hạn mạng | Retry với backoff |
| `ConnectException` | `java.net` | Không kết nối được | Retry / circuit breaker |
| `UnknownHostException` | `java.net` | DNS không phân giải | Kiểm tra cấu hình |
| `MalformedURLException` | `java.net` | URL sai định dạng | Validate URL |
| `SQLException` | `java.sql` | Lỗi database | Bọc thành unchecked |
| `InterruptedException` | `java.lang` | Thread bị ngắt | Khôi phục cờ + thoát |
| `ClassNotFoundException` | `java.lang` | Nạp class động thất bại | Báo lỗi classpath |
| `CloneNotSupportedException` | `java.lang` | `clone()` sai | Sửa thiết kế |
| `ParseException` | `java.text` | Parse ngày/số thất bại | Validate đầu vào |
| `TimeoutException` | `java.util.concurrent` | `Future.get(timeout)` hết hạn | Huỷ tác vụ / fallback |
| `ExecutionException` | `java.util.concurrent` | Tác vụ async lỗi | `getCause()` lấy lỗi thật |

### A.3 Error (không bắt)

| Error | Nguyên nhân | Cách xử lý |
|-------|-------------|------------|
| `StackOverflowError` | Đệ quy vô hạn | Sửa thuật toán |
| `OutOfMemoryError` | Hết bộ nhớ | Tăng heap / sửa leak |
| `NoClassDefFoundError` | Thiếu class lúc runtime | Sửa classpath |
| `ExceptionInInitializerError` | Static block lỗi | Sửa khối static |
| `AssertionError` | `assert` sai (khi bật `-ea`) | Sửa giả định |
| `LinkageError` | Xung đột phiên bản | Dọn dependency |
| `UnsatisfiedLinkError` | Thiếu thư viện native | Cài đặt native lib |

---

## 📎 Phụ Lục B — Checklist Review Code

### B.1 Tìm bằng regex trong IDE / CI

| Mẫu tìm kiếm | Vấn đề | Mức độ |
|--------------|--------|--------|
| `catch\s*\([^)]+\)\s*\{\s*\}` | Catch block rỗng | 🔴 |
| `printStackTrace` | Không dùng logger | 🔴 |
| `catch\s*\(\s*Exception` | Bắt quá rộng | 🟠 |
| `catch\s*\(\s*Throwable` | Bắt quá rộng | 🔴 |
| `catch\s*\(\s*NullPointerException` | Dùng exception check null | 🔴 |
| `finally\s*\{[^}]*return` | Return trong finally | 🔴 |
| `throw new Exception\(` | Exception quá chung | 🟠 |
| `throws Exception` | Khai báo quá rộng | 🟠 |
| `\.close\(\)` trong `finally` | Nên dùng try-with-resources | 🟠 |
| `getStackTrace` trong controller | Rò rỉ bảo mật | 🔴 |
| `System\.out\.print` | Không dùng logger | 🟠 |

### B.2 Cấu hình công cụ phân tích tĩnh

**SonarQube — các rule quan trọng:**

| Rule | Nội dung |
|------|----------|
| `java:S1166` | Exception không được nuốt — phải log hoặc rethrow |
| `java:S2221` | Không catch `Exception` |
| `java:S1181` | Không catch `Throwable` hoặc `Error` |
| `java:S1143` | Không `return`/`break`/`throw` trong `finally` |
| `java:S2093` | Dùng try-with-resources |
| `java:S00112` | Không ném `RuntimeException`/`Exception` chung chung |
| `java:S1148` | Không dùng `printStackTrace` |
| `java:S2142` | Không nuốt `InterruptedException` |
| `java:S1163` | Không ném exception trong `finally` |
| `java:S1696` | Không catch `NullPointerException` |

**Cấu hình Maven cho SpotBugs:**

```xml
<plugin>
    <groupId>com.github.spotbugs</groupId>
    <artifactId>spotbugs-maven-plugin</artifactId>
    <configuration>
        <effort>Max</effort>
        <threshold>Low</threshold>
        <failOnError>true</failOnError>
    </configuration>
    <executions>
        <execution>
            <goals><goal>check</goal></goals>
        </execution>
    </executions>
</plugin>
```

### B.3 Câu hỏi khi review pull request

1. Exception này có mang **đủ ngữ cảnh** để debug từ log không?
2. Nếu bọc — **cause có được giữ** không?
3. Đây là **lỗi lập trình** hay **lỗi ngoại cảnh**? Chọn checked/unchecked đã đúng chưa?
4. HTTP status **có phản ánh đúng** bản chất lỗi không?
5. Response ra client có **rò rỉ** tên class, SQL, đường dẫn file không?
6. Có tài nguyên nào **không nằm trong** try-with-resources không?
7. Đường thất bại này **có test** chưa?
8. Nếu method này nằm trong `@Transactional`, exception có gây **rollback đúng** không?
9. Có log **trùng lặp** ở nhiều tầng không?
10. Message có chứa **thông tin nhạy cảm** không?

---

## 📎 Phụ Lục C — Thuật Ngữ Việt–Anh

| Tiếng Việt | Tiếng Anh | Ghi chú |
|------------|-----------|---------|
| Ngoại lệ | Exception | Sự kiện bất thường làm gián đoạn luồng |
| Lỗi hệ thống | Error | Nhánh `Throwable` không nên bắt |
| Ném | Throw | Câu lệnh `throw` |
| Khai báo ném | Throws declaration | Mệnh đề `throws` trên chữ ký |
| Bắt | Catch | Khối `catch` |
| Lan truyền | Propagation | Exception đi ngược lên stack |
| Ngăn xếp lời gọi | Call stack | Chồng các khung method |
| Vết ngăn xếp | Stack trace | Ảnh chụp call stack |
| Khung ngăn xếp | Stack frame | Một `StackTraceElement` |
| Kiểm tra lúc biên dịch | Checked exception | Compiler ép xử lý |
| Không kiểm tra | Unchecked exception | Nhánh `RuntimeException`/`Error` |
| Xử lý hoặc khai báo | Handle-or-declare | Luật của compiler |
| Nguyên nhân | Cause | `getCause()` |
| Nguyên nhân gốc | Root cause | Mắt xích cuối của chuỗi cause |
| Chuỗi ngoại lệ | Exception chaining | Bọc exception giữ cause |
| Bọc | Wrap | Tạo exception mới ôm cause |
| Ném lại | Rethrow | Ném lại exception đã bắt |
| Ném lại chính xác | Precise rethrow | Java 7+, compiler suy luận kiểu hẹp |
| Nuốt ngoại lệ | Swallow exception | Anti-pattern nghiêm trọng |
| Bị át | Suppressed | Exception phụ trong try-with-resources |
| Tự động đóng | AutoCloseable | Interface cho try-with-resources |
| Thất bại sớm | Fail fast | Ném ngay khi phát hiện |
| Thất bại thầm lặng | Fail silently | Anti-pattern nguy hiểm |
| Kết thúc đột ngột | Abrupt completion | Thoát khối do exception/return/break |
| Vào sau ra trước | LIFO | Thứ tự đóng tài nguyên |
| Bất biến | Immutable | Field `final`, không đổi sau khi tạo |
| Có thể phục hồi | Recoverable | Có phương án xử lý thay thế |
| Lỗi tạm thời | Transient error | Có thể retry |
| Thử lại | Retry | Gọi lại sau khi thất bại |
| Lùi theo cấp số nhân | Exponential backoff | Thời gian chờ nhân đôi mỗi lần |
| Nhiễu ngẫu nhiên | Jitter | Cộng thêm độ trễ ngẫu nhiên |
| Bầy đàn dồn dập | Thundering herd | Nhiều client cùng retry một lúc |
| Cầu dao ngắt mạch | Circuit breaker | Chặn gọi khi dịch vụ đang hỏng |
| Phương án dự phòng | Fallback | Giá trị/luồng thay thế khi lỗi |
| Mã truy vết | Correlation ID / Trace ID | Nối các dòng log của cùng request |
| Ngữ cảnh chẩn đoán | MDC (Mapped Diagnostic Context) | Kho key-value theo thread cho logger |
| Hoàn tác giao dịch | Rollback | Huỷ mọi thay đổi trong transaction |
| Tài nguyên | Resource | File, connection, socket... |
| Rò rỉ tài nguyên | Resource leak | Quên đóng → cạn file descriptor |
| Luồng điều khiển | Control flow | Thứ tự thực thi lệnh |
| Đường thành công | Happy path | Luồng không có lỗi |
| Đường thất bại | Failure path / Sad path | Luồng có lỗi |
| Lưới an toàn | Safety net | Handler cuối cùng bắt mọi thứ |
| Đóng kín | Sealed | Java 17+, giới hạn lớp kế thừa |
| Đầy đủ trường hợp | Exhaustive | `switch` phủ hết mọi nhánh |
