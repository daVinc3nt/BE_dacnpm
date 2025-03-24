🌱 Green Farm Project - DACNPM

📝 Giới thiệu

Dự án Green Farm là hệ thống quản lý nông trại thông minh, giúp theo dõi và điều khiển các thiết bị từ xa. Hệ thống bao gồm API Backend xây dựng với NestJS và sử dụng Docker để quản lý môi trường.

🚀 Hướng dẫn cài đặt & chạy dự án

1️⃣ Cài đặt các dependencies

Trước khi chạy dự án, bạn cần cài đặt các dependencies bằng lệnh:

npm install

2️⃣ Chạy dự án

🔹 Chạy bằng Docker

Nếu bạn muốn chạy ứng dụng bằng Docker, sử dụng lệnh sau:

docker-compose up --build -d

🔹 Chạy trực tiếp trên máy (không dùng Docker thì phải tạo db name là cnpm)

npm start

Sau khi chạy thành công, API sẽ được phục vụ tại http://localhost:8000


Hệ thống sẽ tự động build và chạy trong nền. Bạn có thể kiểm tra bằng docker ps

🛠 Công nghệ sử dụng

Backend: NestJS (Node.js)

Database: MSSQL (Chạy với Docker)

Authentication: Google OAuth

DevOps: Docker, Docker Compose

🔗 API Documentation

Hệ thống có tích hợp Swagger để kiểm thử API.Sau khi chạy dự án, truy cập:

🔗 Swagger UI: http://localhost:8000/api

📌 Ghi chú

Đảm bảo bạn đã cài đặt Node.js và Docker trước khi chạy dự án.

Nếu gặp lỗi cổng bị chiếm dụng, hãy thay đổi cổng trong .env.

💌 Chúc bạn code vui vẻ! 🚀

