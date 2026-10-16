# Campus Marketplace - Group 11

A modern, student-centric marketplace application built with **React Native (Expo SDK 57)** and **TypeScript** for buying, selling, and trading items within a campus community.

---

## 👥 Group 11 Members

| Student Reg No | Name / Role | Key Contributions |
| :--- | :--- | :--- |
| **2023/CSC/061** | Chamudika Sandharuwan | Role-Based Auth UI, Student Panel, Video Demo Presentation |
| **2023/CSC/074** | Virunaka Dewmin | Type system extensions, "Mark as Sold" feature |
| **2023/CSC/043** | Pabodha Harshani | Admin Dashboard (Listing & Student management) |
| **2023/CSC/077** | Dulakshi Kavindya | Enhanced Search bar with result counter & clear action |
| **2023/CSC/060** | Hiruni Prabashi | Price range filtering component & category filters |

---

## 🚀 Key Features Implemented by Group 11

In addition to the base campus marketplace application, our team designed and implemented the following improvements:

1. **🏷️ "Mark as Sold" Functionality**
   - Item sellers and administrators can mark any listing as `SOLD` directly from the detail modal.
   - Sold items automatically render a distinctive badge, strike-through title, and updated status across the grid.

2. **🎓 Student Portal (`StudentPanelPage`)**
   - Dedicated portal for authenticated students displaying personal profile info, active listings count, quick sell triggers, and session management.

3. **🛡️ Administrator Dashboard (`AdminPanelPage`)**
   - High-privilege administrative panel allowing management to:
     - View all active listings across campus and remove policy-violating items.
     - Add official campus/institutional listings.
     - Register and manage authorized campus students.

4. **🔐 Role-Based Switcher & Auth (`LoginModal`)**
   - Dynamic role switcher enabling seamless toggling between **Student** (with quick-select profiles) and **Administrator** modes for easy demonstration and campus workflows.

5. **🔍 Enhanced Search Bar (`SearchBar`)**
   - Interactive search input with one-click clear button (`✕`) and live match counter (e.g. *"Found 3 results for 'textbook'"*).

6. **💰 Price Range Filtering (`PriceFilter`)**
   - Filter listings by budget criteria: `< $30`, `$30 - $70`, `> $70`, or `All Prices`.

---

## 🛠️ Technology Stack

- **Framework:** React Native with Expo (SDK 57)
- **Language:** TypeScript 5.x / 6.x
- **Platform Support:** Web (React Native for Web), iOS, and Android
- **State & Data Management:** React Hooks (`useState`, `useMemo`, `useEffect`) with demo fallback & Cloud Firestore support
- **Styling:** React Native StyleSheet API with clean responsive design

---

## 💻 How to Run Locally

### Prerequisites
- Node.js `v22.13.0` or higher
- npm `v10.x` or `v11.x`

### Installation & Launch

```bash
# 1. Clone repository
git clone https://github.com/virunaka/campus-marketplace-Group-11.git

# 2. Enter project folder
cd campus-marketplace-Group-11

# 3. Install dependencies
npm install

# 4. Start the application for Web
npm run web
```

- To run on mobile, execute `npx expo start` and scan the QR code using the **Expo Go** app on Android or iOS.
- By default, the application runs in self-contained **Demo Mode** with seed data and full functionality without requiring external Firebase credentials. To connect to Cloud Firestore, copy `.env.example` to `.env` and supply your Firebase keys.

---

## 📹 Video Demonstration

A 5 to 8 minute recorded project demonstration covering the introduction, architecture, live interactive demo, and GitHub collaboration is submitted as part of this assignment.
