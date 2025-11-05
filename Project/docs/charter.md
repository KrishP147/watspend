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
- Local or limited-access server setup (no public hosting yet)

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
| Team Member | Main Role / Function                                                          | Testing Responsibility              | Merge Request Reviewer |
| ----------- | ----------------------------------------------------------------------------- | ----------------------------------- | ---------------------- |
| **Shiman**  | Chrome extension, JSON pipeline, data scraping                                | Test backend integration            | Dashboard              |
| **Liron**   | Authentication (Google login), data interpretation, extension publishing, SMS | Test login and notification systems | Extension              |
| **Ava**     | Frontend UI design, progress bar visuals, documentation                       | Test UI elements                    | Backend                |
| **Krish**   | Frontend UI design, use cases, documentation, Git workflow.                   | Test data parsing                   | Frontend               |
| **Elaine**  | Monthly summary generation, dashboard integration, demo video, documentation  | Test report accuracy                | Backend                |


## 9. Milestones and Timeline
| Milestone                      | Description.                                                        |   Due Date.  |
| ------------------------------ | ------------------------------------------------------------------- | ------------ |
| Project Setup & Planning       | Charter, user stories, domain model, GitLab setup, and Figma design | Week 1       |
| Chrome Extension Development   | Build and refine Chrome extension; clean JSON data                  | Week 1–2     |
| Backend & Database Integration | Connect data pipeline (extension → backend → MySQL)                 | Week 1-2     |
| Frontend Dashboard Development | Create web app visuals, connect frontend-backend, add login         | Week 2–3     |
| Reports & Notifications        | Implement PDF monthly summary and SMS alert features                | Week 3       |
| Testing & Demo Preparation     | Conduct PyTest/manual testing, create demo storyboard               | Week 3–4     |
| Finalization & Submission      | Final polish, documentation, record demo video, submit project      | Week 4       |


## 10. Risk Assessment
| Risk                                        | Impact | Likelihood | Mitigation Strategy                                         |
| ------------------------------------------- | ------ | ---------- | ----------------------------------------------------------- |
| Data scraping breaks (WatCard site changes) | High   | Medium     | Keep selectors flexible; use versioned scraping logic       |
| Privacy concerns over personal data         | High   | High       | Keep data local; no cloud sync without explicit consent     |
| Chrome extension API limits                 | Medium | Medium     | Use minimal permissions and test across browsers            |
| Database errors or inconsistent parsing     | Medium | Medium     | Validate JSON before insertion; unit test backend functions |
| Time constraints for frontend polishing     | Medium | Medium     | Focus on core features first, polish visuals later          |


## 11. SE101 Deliverables & Ownership
|  %   | **Deliverable**                   | **Path / Location**                                                         | **Primary Owner(s)**           | **Due Date**      |
| ---- | --------------------------------- | --------------------------------------------------------------------------- | ------------------------------ | ----------------- |
| 5%   | **Project Charter**               | `docs/charter.md`                                                           | Krish, Elaine.                 | Week 1            |
| 10%  | **Product & Sprint Backlogs**     | GitLab Issue Boards                                                         | Krish, Elaine                  | Ongoing           |
| 10%  | **Requirements & Design**         | `docs/user_stories.md` <br> `docs/domain_model.md` <br> `docs/use_cases.md` | Krish                          | Week 2            |
| 15%  | **Source Code & Build**           | `src/`                                                                      | All Developers                 | Week 4            |
| 10%  | **Tests & Results**               | `docs/test_plan.md` <br> `tests/` <br> `docs/test_report.md`                | All Developers                 | Week 4            |
| 5%   | **User Manual**                   | `docs/user_manual.md`                                                       | Elaine, Krish                  | Week 4            |
| 10%  | **Final Video Demo**              | `docs/demo.mp4`                                                             | Elaine, All Participate        | Week 4            |
| 10%  | **Final Sprint Review**           | `docs/review_presentation.pdf`                                              | Ava, Shiman, Liron             | Week 4            |
| 10%  | **Sprint Retrospectives**         | `docs/sprint_retrospectives.md`                                             | All Developers                 | After Each Sprint |
| 10%  | **Weekly Progress & Git Hygiene** | Commits, Issues, Boards                                                     | Krish (Monitor), All Members   | Ongoing           |
| 5%   | **README & Setup Guide**          | `README.md`                                                                 | Krish, Elaine                  | Week 4            |

---

## 12. Approval and Signatures

By signing below, all team members agree to:
- Fulfill their assigned responsibilities
- Attend scheduled meetings or provide 24-hour notice
- Communicate openly and support teammates
- Adhere to quality standards and processes
- Complete assigned work on time
- Maintain a positive, collaborative team environment

| **Team Member** | **Role / Responsibility**                                                                                               | **Signature**     | **Date** |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------- | -------- |
| **Shiman**      | Chrome Extension & Data Pipeline Lead <br> (WatCard scraping, JSON export, backend integration, data interpretation)    | _________________ | _______  |
| **Ava**         | Frontend & UI/UX Lead <br> (Progress bars, goal tracking, testing, documentation support)                               | _________________ | _______  |
| **Krish**       | Backend & Repository Lead <br> (MySQL integration, GitLab workflow, testing, use cases, documentation)                  | _________________ | _______  |
| **Elaine**      | Reporting & Feature Development Lead <br> (PDF summary feature, monthly reports, documentation, demo video)             | _________________ | _______  |
| **Liron**       | Authentication & Deployment Lead <br> (Google login, Chrome extension publishing, SMS integration, data interpretation) | _________________ | _______  |

---

## Appendix A: Project Directory Structure

```
watcard-dashboard/
├── README.md                          # Setup instructions
├── docs/
│   ├── charter.md                     # This file
│   ├── user_stories.md                # User stories (Krish)
│   ├── domain_model.md                # Domain model (Krish)
│   ├── use_cases.md                   # Use cases (Krish)
│   ├── test_plan.md                   # Test plan (Krish, Ava)
│   ├── test_report.md                 # Test results (Krish, Ava)
│   ├── user_manual.md                 # User guide (Elaine, Krish)
│   ├── sprint_retrospectives.md       # Retro notes (Ava)
│   ├── review_presentation.pdf        # Final presentation (Ava, Shiman)
│   └── demo.mp4                       # Demo video (Elaine)
├── src/
│   ├── backend/                       # Flask backend
│   │   ├── app.py                     # Main Flask app
│   │   ├── routes/                    # API endpoints
│   │   ├── models/                    # Database models
│   │   └── utils/                     # Helper functions
│   ├── frontend/                      # Dashboard frontend
│   │   ├── static/                    # CSS, JS, images
│   │   └── templates/                 # HTML templates
│   └── extension/                     # Chrome extension
│       ├── manifest.json
│       ├── popup/
│       ├── content/
│       └── background/
├── tests/                             # PyTest tests
│   ├── test_api.py
│   ├── test_scraper.py
│   └── fixtures/
├── database/
│   ├── schema.sql                     # Database schema
│   └── seed.sql                       # Sample data
└── requirements.txt                   # Python dependencies
```

---

**Document Version**: 1.0 
**Last Updated**: Nov 4
**Status**: Draft

---

*This charter is a living document and may be updated with team consensus.*