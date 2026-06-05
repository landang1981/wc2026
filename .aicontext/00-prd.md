# TÀI LIỆU YÊU CẦU SẢN PHẨM (PRD) & KIẾN TRÚC GIẢI PHÁP
**Dự án:** Ứng Dụng Cá Cược Nội Bộ World Cup 2026
**Tác giả:** Senior Business Analyst & Solution Architect

---

## 1. Tổng Quan Dự Án & Mục Tiêu (Project Overview)
[cite_start]Dự án nhằm mục đích xây dựng một sân cược dự đoán tỉ số bóng đá dành riêng cho một nhóm bạn nội bộ trong khuôn khổ giải đấu World Cup 2026[cite: 2]. [cite_start]Thay vì sử dụng cách tính điểm thưởng thông thường, hệ thống áp dụng cơ chế tính điểm phạt (penalty points) dựa trên các lựa chọn sai[cite: 2, 5]. 

[cite_start]Mục tiêu cốt lõi là đảm bảo tính minh bạch tuyệt đối khi Admin không được phép thay đổi điểm số này [cite: 8][cite_start], tối ưu hóa trải nghiệm thị giác theo phong cách nhà cái chuyên nghiệp chứ không phải một bảng tính đơn thuần [cite: 11][cite_start], và tự động hóa quy trình vận hành dữ liệu trận đấu[cite: 15].

---

## 2. Kiến Trúc Công Nghệ Đề Xuất (Tech Stack)

[cite_start]Hệ thống được thiết kế dựa trên kiến trúc Serverless hiện đại, tối ưu cho việc triển khai nhanh chóng và cập nhật theo thời gian thực[cite: 19].

| Lớp (Layer) | Công Nghệ Triển Khai | Mục Đích / Lý Do Lựa Chọn |
| :--- | :--- | :--- |
| **Frontend** | [cite_start]Next.js 14 (App Router) [cite: 20] | [cite_start]Tối ưu hóa hiệu năng, giao diện phản hồi nhanh, quản lý routing hiệu quả[cite: 20]. |
| **Styling** | [cite_start]Tailwind CSS [cite: 20] | [cite_start]Hỗ trợ xây dựng giao diện nhanh chóng, tùy biến linh hoạt theo phong cách tối[cite: 20]. |
| **Backend & Database** | [cite_start]Supabase (PostgreSQL) [cite: 21] | Lưu trữ dữ liệu quan hệ; [cite_start]Tích hợp sẵn tính năng Realtime để đồng bộ bảng xếp hạng[cite: 21]. |
| **Xác Thực (Auth)** | [cite_start]Supabase Auth [cite: 21] | [cite_start]Quản lý phiên đăng nhập bảo mật và phân quyền hệ thống[cite: 21]. |
| **Bảo Mật Dữ Liệu** | [cite_start]PostgreSQL Row Level Security (RLS) [cite: 14] | [cite_start]Phân quyền bảo vệ dữ liệu, cho phép xem lịch sử nhưng chặn sửa đổi trái phép[cite: 14]. |
| **Dữ Liệu Đối Tác** | [cite_start]The Odds API / BetAPI [cite: 22] | [cite_start]Tự động hóa đồng bộ lịch thi đấu và thông tin từ nhà cái Bet365[cite: 15, 22]. |
| **Triển Khai (Deployment)** | [cite_start]Vercel [cite: 18, 23] | [cite_start]Nền tảng Cloud tối ưu cho Next.js, hỗ trợ deploy nhanh gọn với 1-click[cite: 18, 23]. |
| **Công Cụ AI Hỗ Trợ** | [cite_start]Stitch, Cursor, Windsurf [cite: 24] | [cite_start]Tăng tốc thiết kế UI Scaffolding và phát triển logic/backend toàn diện[cite: 24]. |

---

## 3. Phân Quyền Hệ Thống & Luồng Người Dùng (Roles & IAM)

[cite_start]Hệ thống thiết lập nghiêm ngặt 3 vai trò (Roles) nhằm bảo vệ tính toàn vẹn của cuộc chơi[cite: 12]:

* [cite_start]**Quản Trị Viên (Admin):** Có quyền quản lý người chơi, tạo tài khoản và thiết lập mật khẩu ban đầu[cite: 12, 13]. [cite_start]Admin hoàn toàn không được phép can thiệp chỉnh sửa điểm số phạt[cite: 8].
* [cite_start]**Người Vận Hành (Superuser):** Có quyền thiết lập các trận đấu bao gồm việc tạo trận đấu và nhập tỉ số chính thức sau khi kết thúc[cite: 12].
* [cite_start]**Người Chơi (User):** Là thành viên tham gia đặt cược với 3 tùy chọn Thắng / Hòa / Thua[cite: 12]. [cite_start]Người chơi có quyền xem lịch sử cược của người khác nhưng không thể sửa đổi[cite: 14].

                 ┌──────────────────┐
                 │    Superuser     │ ──► Thiết lập trận đấu & Nhập tỉ số
                 └──────────────────┘
                          │
┌──────────────────┐          ▼          ┌──────────────────┐
│      Admin       │ ──────────────────► │       User       │ ──► Đặt cược (Thắng/Hòa/Thua)
└──────────────────┘                     └──────────────────┘
Tạo tài khoản & Pass                      (Xem lịch sử cược của nhau qua RLS công khai)


---

## 4. Yêu Cầu Chức Năng Chi Tiết (Functional Requirements)

### Phân Hệ 1: Quản Lý Đăng Nhập & Bảo Mật (Identity & Access)
* **Khởi tạo tài khoản:** Admin thực hiện tạo user và set mật khẩu ban đầu cho thành viên[cite: 13].
* **Bắt buộc đổi mật khẩu:** Người chơi (User) buộc phải thay đổi mật khẩu mặc định ngay trong lần đầu tiên đăng nhập hệ thống thành công[cite: 13].
* **Minh bạch lịch sử (RLS):** Hệ thống cho phép mọi user có quyền xem history chọn cửa của các user khác để đảm bảo tính công bằng, nhưng cơ chế RLS chặn đứng mọi hành vi chỉnh sửa[cite: 14].

### Phân Hệ 2: Quản Lý Trận Đấu (Match Management)
* **Vòng Bảng:** Hệ thống hỗ trợ tính năng đồng bộ hóa (sync) toàn bộ dữ liệu lịch thi đấu trực tiếp từ Bet365[cite: 15].
* **Vòng Playoff (Knockout):** Khi bước vào các vòng loại trực tiếp, hệ thống cho phép Superuser chủ động tạo thủ công các trận đấu theo từng vòng cụ thể: 1/16, tứ kết, bán kết, chung kết[cite: 16].

### Phân Hệ 3: Động Cơ Cá Cược & Tính Điểm (Betting Engine)
* **Lựa chọn cược:** Đối với mỗi trận đấu trong giải, người chơi tiến hành chọn một trong ba trạng thái kết quả: Thắng / Hòa / Thua[cite: 4].
* **Thời gian tính kết quả:** Luật chơi áp dụng cho tất cả các trận (kể cả vòng đấu playoff) và chỉ tính kết quả trong phạm vi 90 phút thi đấu chính thức[cite: 6].
* **Bảo vệ trận đấu:** Toàn bộ tính năng đặt cược hoặc thay đổi lựa chọn phải tự động khóa (disable) hoàn toàn trước khi trận đấu chính thức bắt đầu[cite: 17].
* **Quy tắc phạt điểm:**
    * Dự đoán đúng kết quả: Người chơi không bị phạt (ghi nhận 0 điểm phạt)[cite: 5].
    * Dự đoán sai kết quả: Người chơi bị phạt hệ thống tự động cộng 50 điểm phạt[cite: 5].

### Phân Hệ 4: Bảng Xếp Hạng (Leaderboard)
* **Hiển thị trực quan:** Cung cấp giao diện bảng điều khiển (leader board) công khai giúp theo dõi thời gian thực điểm bị phạt của tất cả các thành viên tham gia[cite: 7].

---

## 5. Định Hướng Giao Diện & Trải Nghiệm (UI/UX Direction)

Giao diện ứng dụng hướng đến sự cao cấp, mang lại cảm xúc của một sàn cá cược thể thao thực thụ, tránh xa tư duy thiết kế dạng bảng tính Excel[cite: 11].

* **Chủ đề thiết kế (Aesthetic):** Không gian sân vận động đêm đầy cuồng nhiệt (Dark football stadium night) với tông màu chủ đạo là xanh hải quân đậm và đen[cite: 10].
* **Điểm nhấn thị giác (Accent Color):** Sử dụng màu xanh neon mã màu `#00FF87` cho các thành phần hành động, nút bấm hoạt động và các trạng thái được lựa chọn[cite: 10].
* **Bảng xếp hạng:** Sử dụng sắc Vàng kim (Gold) làm tông màu chủ đạo cho Leaderboard để tôn vinh thứ hạng[cite: 10].
* **Phông chữ (Typography):** Sử dụng các phông chữ Display dạng Bold chữ lớn mạnh mẽ như **Bebas Neue** hoặc **Monument Extended**[cite: 11].

---

## 6. Phân Tích Lỗ Hổng Kỹ Thuật & Logic Mơ Hồ (Hidden Technical Gaps)

Dưới đây là 5 lỗ hổng lớn về mặt logic vận hành và hạ tầng kỹ thuật cần được giải quyết triệt để trước khi tiến hành viết mã:

### Lỗ hổng 1: Sai lệch cấu trúc số lượng vòng đấu World Cup 2026
* **Vấn đề:** Tài liệu yêu cầu Superuser tạo các trận đấu Playoff theo vòng "1/16, tứ kết, bán kết, chung kết"[cite: 16]. Tuy nhiên, World Cup 2026 mở rộng quy mô lên 48 đội, nghĩa là vòng knockout đầu tiên sẽ là Vòng 32 đội (Round of 32 - tương đương thuật ngữ 1/16), sau đó mới tới Vòng 16 đội (Round of 16 - hay vòng 1/8), rồi mới đến Tứ kết. Nếu hệ thống chỉ thiết lập cứng 4 vòng đấu như mô tả, giải đấu sẽ bị thiếu hụt toàn bộ một vòng đấu loại lớn.
* **Giải pháp kiến trúc:** Cơ sở dữ liệu danh mục vòng đấu bắt buộc phải được thiết kế linh hoạt để hỗ thể hiện đầy đủ 5 vòng đấu loại trực tiếp: Vòng 32 đội, Vòng 16 đội, Tứ kết, Bán kết, và Chung kết.

### Lỗ hổng 2: Gian lận thời gian hệ thống (Timezone Drift) khi khóa cược
* **Vấn đề:** Yêu cầu đặt cược phải disable trước khi trận đấu bắt đầu[cite: 17]. Nếu ứng dụng kiểm tra thời gian dựa trên đồng hồ thiết bị của người dùng (Client-side clock), người chơi có thể điều chỉnh lùi giờ trên điện thoại hoặc máy tính cá nhân để lách luật đặt cược sau khi trận đấu đã diễn ra và có bàn thắng.
* **Giải pháp kiến trúc:** Mọi thao tác kiểm tra điều kiện đóng cược phải được đối chiếu duy nhất với thời gian thực tế từ máy chủ cơ sở dữ liệu Supabase (`NOW()`), hoàn toàn loại bỏ việc tin cậy vào thời gian phía Client.

### Lỗ hổng 3: Cơ chế sửa lỗi nhập liệu (Human Error Correction)
* **Vấn đề:** Tài liệu quy định nghiêm ngặt "Admin không được phép thay đổi điểm số" [cite: 8], và giao nhiệm vụ cho Superuser nhập tỉ số thủ công[cite: 12]. Trong trường hợp Superuser gõ nhầm kết quả (ví dụ: kết quả là 0-1 nhưng nhập nhầm thành 1-0) và nhấn lưu, hệ thống sẽ ngay lập tức phạt điểm hàng loạt người chơi. Vì Admin không có quyền can thiệp, dữ liệu sẽ bị sai lệch vĩnh viễn mà không có lối thoát.
* **Giải pháp kiến trúc:** Áp dụng quy trình duyệt kết quả hai bước thông qua trạng thái trận đấu: `LIVE` -> `PENDING_SETTLEMENT` -> `SETTLED`. Khi Superuser nhập điểm, trận đấu sẽ nằm ở trạng thái kiểm tra (Pending) trong vòng 15 phút cho phép sửa đổi sai sót. Sau thời gian này, hệ thống mới chính thức khóa cứng dòng dữ liệu và chuyển sang trạng thái Settled vĩnh viễn.

### Lỗ hổng 4: Kịch bản đồng hạng trên Bảng xếp hạng (Tie-breaking Logic)
* **Vấn đề:** Do hệ thống chỉ áp dụng một mức phạt cố định là cộng 50 điểm khi chọn sai [cite: 5], tỷ lệ nhiều người chơi trong nhóm có cùng một mức điểm phạt giống nhau trên Leaderboard là rất cao[cite: 7]. Hiện tại tài liệu chưa định nghĩa quy tắc phân định thứ hạng khi xảy ra trường hợp đồng điểm.
* **Giải pháp kiến trúc:** Bổ sung thuật toán sắp xếp đa tầng (Multi-tier sorting) cho bảng xếp hạng: Tiêu chí 1 là tổng điểm phạt thấp nhất[cite: 7]; nếu bằng nhau, Tiêu chí 2 sẽ ưu tiên người chơi có chuỗi đoán đúng liên tiếp dài nhất; nếu vẫn bằng nhau, Tiêu chí 3 sẽ ưu tiên người có thời gian xác nhận dự đoán sớm hơn.

### Lỗ hổng 5: Xử lý trận đấu bị hoãn, hủy hoặc thay đổi lịch trình
* **Vấn đề:** Trong bóng đá, có những trường hợp bất khả kháng khiến trận đấu bị hoãn do thời tiết, bị hủy bỏ do sự cố an ninh, hoặc ban tổ chức thay đổi giờ đá. Tài liệu hiện tại mới chỉ xử lý kịch bản lý tưởng là trận đấu diễn ra trọn vẹn trong 90 phút[cite: 6].
* **Giải pháp kiến trúc:** Bổ sung trường trạng thái vận hành trận đấu bao gồm các nhãn: `NORMAL`, `POSTPONED`, `ABANDONED`. Nếu một trận đấu bị hoãn quá 48 tiếng, hệ thống tự động gắn nhãn vô hiệu (`VOID`), hoàn trả trạng thái cược tự do và không áp dụng điểm phạt cho bất kỳ ai đối với trận đấu đó.