# WatCard Meal Plan Dashboard

A web-based financial dashboard and Chrome extension that helps University of Waterloo students track and analyze WatCard spending. The system scrapes spending data from the WatCard website, stores it in a local database, and visualizes trends, balances, and monthly summaries.

---

## Features

- **Secure Chrome Extension** for WatCard transaction scraping  
- **Interactive dashboard** with categorized spending, goal tracking, and trends  
- **Local MySQL database** for structured storage  
- **Manual expense logging** and customizable categories  
- **Monthly automated summary reports**   

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (JavaScript), HTML/CSS |
| Backend | Express.js (Node.js) |
| Database | MySQL |
| Chrome Extension | JavaScript, Chrome API |
| Visualization | Chart.js / D3.js |
| Version Control | Git (GitLab) |

---

## Prerequisites

Before setup, ensure you have the following installed:

- **Node.js v18+** → https://nodejs.org  
- **MySQL v8+** → https://www.mysql.com  
- **Git (GitLab access configured)**  
- **Chrome browser**

---

## How to Run

```bash
npm install
cd to outer src folder (alongside build, database, docs, **src**, tests, etc)
npm run dev


## 📂 Directory Structure

```bash
watcard-dashboard/
│── extension/         # Chrome scraping extension
│── backend/           # Express.js backend
│── frontend/          # React web UI
│── docs/              # Documentation & deliverables
│── tests/             # Testing
│── README.md
│── package.json

