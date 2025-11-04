# Project Charter: WatCard Meal Plan Dashboard

## 1. Project Title
**WatCard Meal Plan Dashboard**

## 2. Project Overview
The goal of this project is to develop the **WatCard Plan Dashboard, a web-based visualization tool** that helps University of Waterloo students track and analyze their WatCard spending.

The system will consist of a **Chrome extension** that securely scrapes a user’s WatCard account data upon login and exports it in JSON format. This data will then be sent to the frontend dashboard, where it is visualized and stored in a MySQL database.

The dashboard will present **categorized spending trends, remaining balance visualizations, and monthly summary reports.** Additionally, users can manually log spending, providing a complete overview of their financial activity and helping them monitor their monthly spending goals at the University of Waterloo.

## 3. Project Objectives
- Build a Chrome extension to securely scrape WatCard transaction data after user login.
- Decipher and map scraped data fields (e.g., transaction names, IDs) to their real-world categories for accurate financial tracking.
- Store parsed transaction data and corresponding JSON files in a MySQL database for persistent and structured data management.
- Design and develop a web application dashboard (beyond a simple visualization) with advanced, interactive data analytics and visualization features to display:
    - Total balance and category-wise spending.
    - Separate monthly spending goal charts for each category (e.g., food, coffee, printing).
    - Spending trends and personalized insights (e.g., “You spent 30% less on coffee this month!”).
    - User-added custom transactions and spending categories.
- Enable secure user authentication, potentially via Google login or a custom account system, to ensure data is tied to individual users.
- Integrate SMS notifications or interactions, such as monthly summaries or spending alerts sent directly to the user’s phone.
- Generate automated monthly spending summaries and reports, both within the dashboard and optionally through email or SMS.
- Redesign and improve the Chrome extension UI for better usability and seamless connection with the web dashboard.
- Ensure data privacy and security, preventing any online exposure or unauthorized access to personal financial data.

## 4. Scope
### In Scope
- Chrome extension to retrieve and format WatCard transaction data.
- Backend setup to receive and store JSON transaction data in MySQL.
- Frontend dashboard for:
    - Viewing balance and spending categories.
    - Setting monthly category goals.
    - Displaying progress bars and trends.
    - Generating personalized monthly reports.
- Option to add manual spending
- Hyperlink to actual WatCard website
- Monthly reports display 
- SMS/Different method of notifications (ie. monthly report out)
- Public or multi-user authentication system (may be added later)
- Local or limited-access server setup (no public hosting yet).

### Out of Scope
- Cloud deployment and live web hosting
- Integration with actual WatCard API (scraping-based only for now)
- External payments scrapping/API outside of WatCard

## 5. Stakeholders
| Role               | Name / Group           | Responsibilities                                                 |
| ------------------ | ---------------------- | ---------------------------------------------------------------- |
| Project Sponsor    | SE101 Instruction Team | Approve project charter and deliverables                         |
| Developers         | Team Members           | Implement Chrome extension, backend, and frontend components     |
| Testers            | Team Members           | Validate data scraping, storage, and visualization accuracy      |
| Reviewers          | Team Members           | Review and approve Merge Requests                                |
| Project Maintainer | Assigned Team Lead     | Coordinate component integration and ensure workflow consistency |


## 6. Deliverables
- Chrome extension for WatCard transaction scraping
- JSON-based data pipeline from extension → backend → MySQL
- Flask-based (or similar) web dashboard for visual analytics
- Functional progress bars and category goal tracking
- Automated monthly reports and summaries
- Local data storage with optional user privacy controls
- Documentation (charter.md, setup guide, and user manual)
- GitLab repository with branching workflow and approved merge requests

## 7. Technology Stack
- **Frontend:** HTML, CSS, JavaScript (React or Vanilla JS)
- **Backend:** JavaScript (express)
- **Database:**  MySQL
- **Extension:** Chrome API (JavaScript-based scraper)
- **Visualization:** Chart.js / D3.js
- **Version Control:** Git (GitLab)
- **Testing:** Pytest + Manual UI Testing

## 8. Roles and Responsibilities
| Team Member | Function Responsibility     | Testing Responsibility      | MR Reviewer |
| ----------- | --------------------------- | --------------------------- | ----------- |
| Member A    | Chrome Extension            | Test Backend Integration    | Frontend    |
| Member B    | Backend API (Flask + MySQL) | Test Extension Data Parsing | Dashboard   |
| Member C    | Frontend Visualization      | Test Data Accuracy          | Backend     |
| Member D    | Monthly Report Generation   | Test Goal Progress Bars     | Extension   |
| Member E    | Manual Input Feature        | Test Report Generation      | Dashboard   |
| Member F    | Goal Tracking / Progress UI | Test User Input System      | Backend     |

*(This mapping can be adjusted based on team size.)*

## 9. Milestones and Timeline
| Milestone                              | Description                                              | Due Date |
| -------------------------------------- | -------------------------------------------------------- | -------- |
| Charter Completion                     | Finalize and upload `charter.md`                         | Week 1   |
| Chrome Extension Setup                 | Build scraper and JSON export functionality              | Week 1–2 |
| Backend API + Database                 | Receive and store WatCard data in MySQL                  | Week 1-2 |
| Frontend Dashboard                     | Display balance, progress bars, and category spending    | Week 2-4 |
| Monthly Report & Manual Entry Features | Add spending goals, manual input, and summary generation | Week 2-4 |
| Testing & Review                       | Verify data flow, fix issues, finalize merge requests    | Week 4   |
| Final Submission                       | Deliver fully functional local dashboard                 | Week 4   |

## 10. Risk Assessment
| Risk                                        | Impact | Likelihood | Mitigation Strategy                                         |
| ------------------------------------------- | ------ | ---------- | ----------------------------------------------------------- |
| Data scraping breaks (WatCard site changes) | High   | Medium     | Keep selectors flexible; use versioned scraping logic       |
| Privacy concerns over personal data         | High   | High       | Keep data local; no cloud sync without explicit consent     |
| Chrome extension API limits                 | Medium | Medium     | Use minimal permissions and test across browsers            |
| Database errors or inconsistent parsing     | Medium | Medium     | Validate JSON before insertion; unit test backend functions |
| Time constraints for frontend polishing     | Medium | Medium     | Focus on core features first, polish visuals later          |

## 11. Approval
By approving this charter, all team members agree to:
- Follow the defined branching and review workflow
- Complete assigned functions and tests on time
- Maintain user privacy and responsible data handling
- Collaborate and communicate effectively to meet project milestones

| Name   | Signature | Date       |
| ------ | --------- | ---------- |
| Shiman |           |  |
| Ava    |           |  |
| Krish  |           |  |
| Elaine |           |  |
| Liron  |           |  |

---