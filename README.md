# 🚀 Full-Stack Virtual Scroll (Infinite Grid)

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](https://mesutyilmazjs.github.io/virtual-scroll/)

A high-performance, Full-Stack implementation of a **Virtualized Infinite Scrolling Grid**, designed to effortlessly render and paginate through massive datasets (e.g., 100,000+ items).

By combining **Backend Cursor Pagination** via PostgreSQL with **Frontend DOM Virtualization** (Windowing), this project completely removes rendering lag, memory leaks, and database bottlenecks. 

👉 **[Experience the Live Demo](https://mesutyilmazjs.github.io/virtual-scroll/)**

---

## 🎯 The Performance Problem

When rendering massive datasets (e.g. 100k items) to the screen, applications typically face two major bottlenecks:

1. **Frontend Crash (DOM Overload):** Appending thousands of `<div>` nodes to the DOM causes immense memory usage, resulting in broken scroll physics, rendering lag, or complete browser freezes.
2. **Backend Lag (Offset Penalty):** Standard database queries utilizing `OFFSET` drop in execution speed exponentially. Asking for `LIMIT 60 OFFSET 50000` forces the database engine to scan 50,000 items sequentially, just to discard them.

## 🛠 My Solution: Full-Stack Synergy

### 1. Frontend: Virtualization Engine (Windowing)
Instead of creating thousands of DOM elements, the `VirtualGrid` javascript class strictly limits the rendered HTML elements precisely to what is visible over the user's current viewport.
- Uses dynamic bounding boxes via `position: absolute`.
- Recycles `DOM Elements`, meaning scrolling through 100,000 items only actively interacts with ~18 live DOM nodes total.
- **Latency Fallback:** An embedded Mock API natively activates if visited through GitHub Pages to simulate exact network delays and cursor parsing.

### 2. Backend: Cursor-Based Pagination
Instead of utilizing `OFFSET`, the Node.js / Express API utilizes **Cursor-based indexing**.
```sql
SELECT id, title, description FROM items WHERE id < $cursor ORDER BY id DESC LIMIT 60;
```
By utilizing a massive `100,000` entry batch seeded to a PostgreSQL Cloud db, fetching the next chunk is completed in `O(1)` time utilizing `B-Tree DESC Indices`, avoiding the massive overhead associated with deep pagination.

---

## 💡 Tech Stack 

**Backend:**
- **Node.js & Express**: Optimized asynchronous REST API handlers.
- **PostgreSQL**: Robust cloud data storage with connection pooling (`pg`).
- **SQL Seeding**: Custom `seed.js` chunk uploader loading 100,000 items rapidly.

**Frontend:**
- **Vanilla JavaScript (ES6)**: Raw, framework-less DOM manipulation, debounced listener loops, dynamic dimension calculations.
- **CSS3 Variables & Glassmorphism**: For a responsive, modern aesthetic.

---

## 🚀 Run It Locally

Since this system natively runs a backend endpoint alongside frontend code, run the following steps to spin it up:

### Backend Initialization
1. Navigate into the backend root:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your PostgreSQL Environment Variable directly:
   ```bash
   export DATABASE_URL="postgresql://user:password@localhost/virtualscroll"
   ```
4. Inject 100,000 test entries into your DB automatically:
   ```bash
   node seed.js
   ```
5. Spin up the Express server (`http://localhost:3000`):
   ```bash
   npm start
   ```

### Frontend
1. Simply open up `index.html` in your browser.
2. The form will default configuration to `http://localhost:3000/items`. Create the grid, and enjoy flawlessly paging through 100,000 rows.
