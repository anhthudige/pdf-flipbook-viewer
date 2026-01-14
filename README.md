# Hướng Dẫn Chạy PDF Flipbook Viewer

Vì lý do bảo mật của trình duyệt (CORS policy), bạn không thể chạy trực tiếp file `index.html` bằng cách click đúp vào nó để load file PDF cục bộ.

## Cách chạy đúng (Khuyên dùng)

### 1. Sử dụng "Live Server" trên VS Code (Dễ nhất)
Nếu bạn đang dùng Visual Studio Code:
1.  Cài đặt Extension **Live Server** (của Ritwick Dey).
2.  Mở thư mục dự án này trong VS Code.
3.  Click chuột phải vào file `index.html` và chọn **"Open with Live Server"**.
4.  Trình duyệt sẽ tự động bật lên và catalogue sẽ chạy mượt mà.

### 2. Chạy thủ công (Nếu không dùng Live Server)
Nếu bạn mở trực tiếp file `index.html`:
1.  Màn hình sẽ báo lỗi "Không thể tự động tải PDF".
2.  Bạn cần bấm vào nút **"Chọn file PDF"** trên màn hình.
3.  Chọn file `CATALOGUE-BOLETTE.pdf` trong thư mục.
4.  Catalogue sẽ hiển thị.

## Lưu ý
- File PDF cần hiển thị là `CATALOGUE-BOLETTE.pdf`.
- Đảm bảo file này nằm cùng thư mục với `index.html` và `main.js`.
