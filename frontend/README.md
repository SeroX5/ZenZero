# 📊 Operational Analytics Dashboard (Excel-Powered)

ระบบ Dashboard สำหรับวิเคราะห์ประสิทธิภาพการปฏิบัติงาน (Efficiency Index) โดยประมวลผลข้อมูลจากไฟล์ Excel (`manage.xlsx`) โดยอัตโนมัติ พัฒนาด้วย React และ Node.js

## 🌟 คุณสมบัติหลัก
- **Data Automation**: อ่านค่าจาก Excel โดยตรง (ไม่ต้องกรอกข้อมูลเอง)
- **Efficiency Index**: คำนวณค่าพลังงานต่อหน่วยการไหล ($kWh/m^3$)
- **Interactive Charts**: กราฟแท่งและเส้นสลับมุมมอง รายวัน/รายเดือน ได้
- **Full Metrics**: แสดงข้อมูล ORP, pH, Temp และสถิติของ Turbo Blower (TB1)

## 🏗️ โครงสร้างไฟล์

- `/server` : Backend (Express.js) - ทำหน้าที่อ่านและคำนวณข้อมูลจาก Excel
- `/src` : Frontend (React + Vite) - ทำหน้าที่แสดงผล UI และกราฟ Recharts
- `manage.xlsx` : ไฟล์ข้อมูลหลัก (ต้องวางไว้ในโฟลเดอร์ server)

## 🚀 วิธีการติดตั้งและใช้งานอย่างละเอียด

### 1. การเตรียมตัว
- ตรวจสอบว่าเครื่องมี [Node.js](https://nodejs.org/) (แนะนำเวอร์ชัน 18 ขึ้นไป)
- ตรวจสอบว่ามีไฟล์ `manage.xlsx` อยู่ในโฟลเดอร์ `server`

### 2. ติดตั้ง Dependencies
เปิด Terminal ใน VS Code แล้วพิมพ์:
```bash
# ติดตั้งฝั่ง Backend
cd server
npm install

# ติดตั้งฝั่ง Frontend
cd ..
npm install