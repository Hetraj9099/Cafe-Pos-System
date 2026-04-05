# 🍽️ Smart Cafe Management System

A full-stack restaurant management platform handling **Manager, POS, Kitchen, and Customer interfaces** with real-time workflow and full cloud deployment.

---

## 🚀 Live Deployment

### 🌐 Access Links

- **Customer Panel:** https://pos-customer.onrender.com 
- **Kitchen Panel:** https://cafe-pos-system-5b0g.onrender.com
- **POS Panel:** https://cafe-pos-system-flc5.onrender.com
- **Manager Panel:** https://pos-manager-zish.onrender.com
- **QR Self Ordering:** https://pos-customer.onrender.com/?qr=table-6e3221fa5260  

---

> ⚠️ **Cold Start Warning:**  
Render free tier servers go to sleep after inactivity.  
First request may take **30–60 seconds** to respond.

---

## 👥 Team Members

- Hetraj Chauhan
- Paritosh Patel 
- Vicky Goplani
- Raj Sinha

---

## 🔑 Demo Credentials

### Manager Panel
- Email: admin123@gmail.com  
- Password: Admin@123  

### POS Panel
- Email: cashier12345@.com  
- Password: Cashier@123

---

## 🧠 Features

### 📊 Manager Dashboard
- Analytics (orders, revenue)
- Menu CRUD operations
- Role/user management
- Reports and overview

### 🧾 POS System
- Fast order creation
- Cart system
- Live sync with kitchen
- PDF bill generation

### 👨‍🍳 Kitchen Panel
- Live order queue
- Status updates
- Real-time workflow

### 🧑‍💻 Customer Interface
- Browse menu
- Place orders
- Email bill delivery

### 📧 Email System
- Brevo SMTP integration
- Automated PDF billing

---

## 🗄️ Tech Stack

- **Frontend:** React.js  
- **Backend:** Node.js + Express  
- **Database:** PostgreSQL (Neon)  
- **Deployment:** Render  
- **Email:** Brevo  

---


---

## 💻 Running Locally (All Panels)

> Each frontend (Manager, POS, Kitchen, Customer) runs separately.

---

### 1. Clone Repository

git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

---
---
cd backend
npm install
---
---
PORT=5000
DATABASE_URL=your_neon_db_url

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_user
SMTP_PASS=your_brevo_key

JWT_SECRET=your_secret
---
---
npm run dev
---
access individual file directory 
npm run build
npm run dev
---
