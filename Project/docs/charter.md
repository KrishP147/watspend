# Project Charter: WatCard Meal Plan Dashboard

## 1. Project Title
**WatCard Meal Plan Dashboard**

---

## 2. Project Overview

The **WatCard Meal Plan Dashboard** is a web-based visualization and analytics tool designed to help University of Waterloo students track, analyze, and optimize their WatCard spending patterns.

The system consists of:
1. **Chrome Extension**: Securely scrapes WatCard transaction data when users log into their WatCard account, exporting it in JSON format
2. **Web Dashboard**: A Flask-based backend with interactive frontend that visualizes spending data, stores transactions in a MySQL database, and provides insights through charts and personalized analytics

The dashboard enables students to:
- View categorized spending trends (Café, Residence Halls, Laundry, W Store, Restaurants)
- Set and track monthly spending goals per category
- Generate automated monthly reports and summaries
- Access their spending history and insights anytime

---

## 3. Project Objectives

### Core Objectives
1. **Data Collection**: Build a Chrome extension to securely scrape WatCard transaction data
2. **Data Processing**: Interpret and map scraped transaction fields to meaningful categories
3. **Data Storage**: Store parsed transaction data in a MySQL database with proper schema design
4. **Dashboard Development**: Create a web application with interactive analytics featuring:
   - Category-wise spending visualization
   - Monthly spending goal tracking with progress bars
   - Spending trends and insights
   - Automated monthly report generation (PDF format)
5. **User Authentication**: Implement Google OAuth for secure login
6. **Extension Publishing**: Publish Chrome extension for easy installation
7. **Optional Features**: SMS notifications if time permits

---

## 4. Scope

### In Scope
- Chrome extension for WatCard transaction scraping and JSON export
- Backend API (Flask/Python) to receive and store JSON transaction data
- MySQL database with optimized schema for transaction storage
- Web dashboard featuring:
  - Balance and spending category visualization
  - Monthly category goal setting and tracking with progress bars
  - Automated monthly report generation (PDF or page view)
- Google OAuth authentication
- Transaction categorization for: Café, Residence Halls, Laundry, W Store, Restaurants
- Chrome extension publishing to Chrome Web Store
- Local or limited-access server deployment

### Out of Scope
- Public cloud deployment and live web hosting (initial release)
- Integration with official WatCard API (scraping-based approach only)
- External payment platform scraping/API beyond WatCard
- Mobile native applications (iOS/Android)
- Real-time transaction alerts
- Multi-university support (UWaterloo only)

---

## 5. Stakeholders

| Role               | Name / Group           | Responsibilities                                                 |
| ------------------ | ---------------------- | ---------------------------------------------------------------- |
| Project Sponsor    | SE101 Instruction Team | Approve project charter, review deliverables, provide guidance   |
| Product Owner      | Shiman                 | Define requirements, prioritize backlog, accept completed work   |
| Scrum Master       | Ava                    | Facilitate Scrum ceremonies, remove blockers, track progress     |
| Lead Developer     | Krish                  | Architecture design, technical decisions, code review            |
| Developers         | All team members       | Implement features, write tests, documentation                   |
| QA Lead            | Ava & Krish            | Test planning, execution, quality assurance                      |
| End Users          | UWaterloo Students     | Use dashboard, provide feedback                                  |

---

## 6. Team Roles and Responsibilities

| Team Member | Primary Responsibilities | SE101 Deliverables |
| ----------- | ------------------------ | ------------------ |
| **Shiman** | - Chrome extension development (scraping, JSON pipeline)<br>- Data categorization logic<br>- Extension-to-backend integration | - Extension functionality<br>- Data interpretation |
| **Ava** | - General website development<br>- Progress bars and goal tracking<br>- Testing (PyTest)<br>- Scrum facilitation | - Website features<br>- Testing execution<br>- Sprint management |
| **Krish** | - User stories and use cases<br>- GitLab repository management<br>- Branching workflow and MR reviews<br>- Progress bars and goal tracking<br>- Testing (PyTest)<br>- Documentation | - Requirements docs<br>- Repository setup<br>- Testing<br>- Documentation |
| **Elaine** | - Automated monthly reports (PDF generation)<br>- Progress bars and goal tracking<br>- Documentation (setup guide, user manual)<br>- Demo video production | - Reports feature<br>- Documentation<br>- Demo video |
| **Liron** | - Google OAuth authentication<br>- Chrome extension publishing<br>- SMS notifications (if time permits)<br>- Data categorization logic | - Authentication system<br>- Extension deployment |

### Shared Responsibilities
- **All Members**: 
  - Participate in daily standups and sprint ceremonies
  - Maintain GitLab issues and commit regularly
  - Write tests for their code
  - Review merge requests
  - Contribute to documentation
  - Dashboard development (Flask backend and frontend)

---

## 7. Technology Stack

### Frontend
- **Framework**: HTML/CSS/JavaScript or lightweight framework (Flask templates or React if needed)
- **Styling**: Bootstrap or Tailwind CSS
- **Visualization**: Chart.js or Plotly

### Backend
- **Framework**: Flask (Python)
- **Authentication**: Google OAuth (OAuth 2.0)
- **PDF Generation**: ReportLab or WeasyPrint

### Database
- **Database**: MySQL
- **Python Driver**: mysql-connector-python or PyMySQL

### Chrome Extension
- **Technology**: JavaScript (Chrome Extension API)
- **Manifest**: Manifest V3

### Testing
- **Framework**: PyTest
- **Coverage Goal**: ≥70%

### DevOps
- **Version Control**: Git (GitLab)
- **Deployment**: Local initially

---

## 8. SE101 Deliverables & Ownership

| % | Deliverable | Path | Primary Owner(s) | Due Date |
|---|------------|------|------------------|----------|
| 5% | Project Charter | `docs/charter.md` | All (this document) | Week 1 |
| 10% | Product & Sprint Backlogs | GitLab Issue Boards | Shiman (product), Ava (sprint) | Ongoing |
| 10% | Requirements & Design | `docs/user_stories.md`<br>`docs/domain_model.md`<br>`docs/use_cases.md` | Krish | Week 2 |
| 15% | Source Code & Build | `src/` | All developers | Week 4 |
| 10% | Tests & Results | `docs/test_plan.md`<br>`tests/`<br>`docs/test_report.md` | Krish, Ava | Week 4 |
| 5% | User Manual | `docs/user_manual.md` | Elaine, Krish | Week 4 |
| 10% | Final Video Demo | `docs/demo.mp4` | Elaine (lead), All participate | Week 4 |
| 10% | Final Sprint Review | `docs/review_presentation.pdf` | Ava (lead), Shiman | Week 4 |
| 10% | Sprint Retrospectives | `docs/sprint_retrospectives.md` | Ava | After each sprint |
| 10% | Weekly Progress & Git Hygiene | Commits, issues, boards | Ava (monitor), All execute | Ongoing |
| 5% | README & Setup Guide | `README.md` | Krish, Elaine | Week 4 |

---

## 9. Project Features & Technical Implementation

### Chrome Extension (Shiman)
- Scrape WatCard transaction data from website
- Export data as JSON format
- Send JSON to backend API via HTTP POST
- Handle authentication with dashboard

### Data Interpretation & Categorization (Liron, Shiman)
Map WatCard transactions to categories:
- **Café**: Campus coffee shops, food courts
- **Residence Halls**: Meal plans, dining halls
- **Laundry**: Laundry facilities
- **W Store**: Campus bookstore purchases
- **Restaurants**: SLC and campus restaurants
- **Other**: Uncategorized transactions

### Flask Dashboard (Team)
- Backend API endpoints for transactions, goals, reports
- Frontend visualization with charts and tables
- Session management and data persistence
- MySQL database integration

### Progress Bars & Goal Tracking (Ava, Krish, Elaine)
- Set monthly spending goals per category
- Visual progress bars showing percentage spent
- Alerts when goals are exceeded
- Month-over-month comparison

### Monthly Reports (Elaine)
- Automated report generation at month end
- PDF export or dedicated report page
- Include:
  - Total spending by category
  - Goal achievement summary
  - Spending trends and insights
  - Visual charts

### Google Authentication (Liron)
- Google OAuth 2.0 integration
- Secure user sessions
- Profile information retrieval

### Chrome Extension Publishing (Liron)
- Package extension for Chrome Web Store
- Create store listing with description and screenshots
- Submit for review and publish
- Provide installation instructions

### Optional: SMS Notifications (Liron)
- Twilio integration (if time permits)
- Monthly spending summary alerts
- Goal exceeded notifications

---

## 10. Sprint Timeline

### Sprint Structure
- **Sprint Duration**: 1 week
- **Number of Sprints**: 4 sprints
- **Total Project Duration**: 4 weeks

### Sprint Breakdown

**Sprint 0 (Week 1): Foundation**
- Goal: Project setup and planning
- Deliverables: Charter, user stories, domain model, use cases, GitLab setup
- Key Tasks: Documentation, environment setup, role confirmation

**Sprint 1 (Week 2): Core Backend & Extension**
- Goal: Database, API foundation, basic extension scraping
- Deliverables: MySQL schema, Flask API endpoints, extension scraper prototype
- Key Tasks: Authentication setup, data pipeline, basic CRUD operations

**Sprint 2 (Week 3): Dashboard & Integration**
- Goal: Complete frontend, integrate extension with backend
- Deliverables: Dashboard UI, charts, goal tracking, working data flow
- Key Tasks: Visualization, progress bars, extension-to-API integration

**Sprint 3 (Week 4, Days 1-3): Reports & Polish**
- Goal: Monthly reports, Chrome Web Store publishing, testing
- Deliverables: PDF reports, published extension, comprehensive tests
- Key Tasks: Report generation, publishing, bug fixes

**Sprint 4 (Week 4, Days 4-7): Documentation & Demo**
- Goal: Final deliverables and presentation
- Deliverables: User manual, demo video, presentation, v1.0 release
- Key Tasks: Documentation writing, video recording, final testing

---

## 11. Risk Assessment

| Risk | Impact | Likelihood | Mitigation Strategy | Owner |
|------|--------|-----------|---------------------|-------|
| WatCard website structure changes | High | Medium | Keep selectors flexible, test weekly, document structure | Shiman |
| Chrome extension API limitations | Medium | Low | Use minimal permissions, test across versions | Shiman, Liron |
| Team member unavailability | Medium | Low | Cross-train, clear documentation, daily standups | Ava |
| Integration issues between components | High | Medium | Define clear API contracts early, integration testing | All |
| Insufficient test coverage | Medium | Medium | Write tests alongside code, dedicate testing time | Krish, Ava |
| Chrome Web Store approval delays | Low | Medium | Submit early, follow all guidelines, have backup plan | Liron |
| Time constraints for all features | Medium | High | Prioritize core features, make SMS optional, MVP approach | Ava, Shiman |

---

## 12. Communication Plan

### Meetings
- **Daily Standups**: Mon/Wed/Fri at 6:00 PM EST (15 min) - Led by Ava
- **Sprint Planning**: First day of each sprint (1 hour) - Led by Shiman & Ava
- **Sprint Review**: Last day of each sprint (45 min) - Led by Shiman
- **Sprint Retrospective**: After each sprint review (30 min) - Led by Ava

### Communication Channels
- **Primary**: Discord server (dedicated project channels)
- **Code**: GitLab (issues, merge requests, wiki)
- **Official**: Email (for SE101 instructor communication)

### Response Time Expectations
- **Urgent blockers**: Within 2 hours
- **Code reviews**: Within 24 hours
- **General messages**: Within 8 hours on weekdays

### Decision-Making Process
1. **Minor technical decisions**: Developer decides, documents in code
2. **Moderate technical decisions**: Lead Developer (Krish) decides after team input
3. **Scope/feature decisions**: Product Owner (Shiman) decides
4. **Major conflicts**: Team vote, Scrum Master (Ava) facilitates

---

## 13. Quality Standards

### Code Quality
- **Linting**: Use Python Black formatter and Flake8
- **Code Reviews**: All changes via merge requests, minimum 1 approval
- **Testing**: ≥70% code coverage via PyTest
- **Documentation**: All functions have docstrings

### Git Standards
- **Commit Messages**: `[type]: description` (e.g., `[feature]: add transaction filtering`)
- **Branch Naming**: `feature/description`, `bugfix/description`
- **No Direct Commits to Main**: All changes via merge requests
- **Branch Protection**: Main branch requires MR approval

### Definition of Done
A task is "Done" when:
- ✅ Code written and follows style guide
- ✅ Tests written and passing (≥70% coverage)
- ✅ Code reviewed and approved
- ✅ Merged into main branch
- ✅ Feature tested in local environment
- ✅ Documentation updated
- ✅ No critical bugs

---

## 14. Success Metrics

### Delivery Metrics
- ✅ 100% of high-priority features completed
- ✅ All deliverables submitted on time
- ✅ Final grade target: ≥85%

### Quality Metrics
- ✅ Test coverage ≥70%
- ✅ 100% code review rate
- ✅ 0 critical bugs in v1.0 release

### Process Metrics
- ✅ ≥90% meeting attendance
- ✅ Each member contributes ≥15% of commits
- ✅ Average MR review time <24 hours

---

## 15. Approval and Signatures

By signing below, all team members agree to:
- Fulfill their assigned responsibilities
- Attend scheduled meetings or provide 24-hour notice
- Communicate openly and support teammates
- Adhere to quality standards and processes
- Complete assigned work on time
- Maintain a positive, collaborative team environment

| Team Member | Role | Signature | Date |
|-------------|------|-----------|------|
| **Shiman** | Product Owner & Extension Lead | _________________ | _______ |
| **Ava** | Scrum Master & QA | _________________ | _______ |
| **Krish** | Lead Developer & Documentation | _________________ | _______ |
| **Elaine** | Reports & Documentation Lead | _________________ | _______ |
| **Liron** | Authentication & Deployment Lead | _________________ | _______ |

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

## Appendix B: Key Dates

| Milestone | Due Date | Owner |
|-----------|----------|-------|
| Charter Approval | Week 1 | All |
| Requirements Documentation | Week 2 | Krish |
| Sprint 1 Complete | Week 2 | All |
| Sprint 2 Complete | Week 3 | All |
| Sprint 3 Complete | Week 4, Day 3 | All |
| Extension Published | Week 4, Day 3 | Liron |
| v1.0 Release | Week 4, Day 6 | All |
| Demo Video | Week 4, Day 6 | Elaine |
| Final Presentation | Week 4, Day 7 | Ava, Shiman |

---

**Document Version**: 1.0  
**Last Updated**: [Insert Date]  
**Status**: Draft - Pending Team Approval

---

*This charter is a living document and may be updated with team consensus.*