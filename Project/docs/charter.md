# Project Charter: WatCard Meal Plan Dashboard

## 1. Project Title
**WatCard Meal Plan Dashboard**

---

## 2. Project Overview

The **WatCard Meal Plan Dashboard** is a web-based visualization and analytics tool designed to help University of Waterloo students track, analyze, and optimize their WatCard spending patterns.

The system consists of two main components:
1. **Chrome Extension**: Securely scrapes WatCard transaction data when users log into their WatCard account, exporting it in JSON format
2. **Web Dashboard**: A React-based frontend with Express backend that visualizes spending data, stores transactions in a MySQL database, and provides insights through interactive charts and personalized analytics

The dashboard enables students to:
- View categorized spending trends (food, coffee, printing, etc.)
- Set and track monthly spending goals per category
- Generate automated monthly reports and summaries
- Manually log additional spending for complete financial tracking
- Receive SMS notifications for spending alerts and monthly summaries

---

## 3. Project Objectives

### Core Objectives
1. **Data Collection**: Build a Chrome extension to securely scrape WatCard transaction data after user login
2. **Data Processing**: Decipher and map scraped transaction fields to real-world categories for accurate tracking
3. **Data Storage**: Store parsed transaction data and JSON files in a MySQL database with proper schema design
4. **Dashboard Development**: Create an advanced web application with interactive data analytics featuring:
   - Total balance and category-wise spending visualization
   - Individual monthly spending goal charts for each category
   - Spending trends and personalized insights (e.g., "You spent 30% less on coffee this month!")
   - User-added custom transactions and spending categories
5. **User Authentication**: Implement secure authentication (Google OAuth or custom system)
6. **Notifications**: Integrate SMS notifications for monthly summaries and spending alerts
7. **Reporting**: Generate automated monthly spending summaries and reports
8. **UI/UX Enhancement**: Redesign Chrome extension UI for better usability and seamless dashboard integration
9. **Security**: Ensure data privacy and security, preventing unauthorized access to personal financial data

---

## 4. Scope

### In Scope
- Chrome extension for WatCard transaction scraping and JSON export
- Backend API (Express + Node.js) to receive and store JSON transaction data
- MySQL database with optimized schema for transaction storage
- Frontend dashboard (React) featuring:
  - Balance and spending category visualization
  - Monthly category goal setting and tracking
  - Progress bars and trend analysis
  - Personalized monthly reports
- Manual spending entry functionality
- Hyperlink to official WatCard website
- Monthly report generation and display
- SMS notification system (or alternative notification method)
- User authentication system (Google OAuth or custom)
- Local or limited-access server deployment

### Out of Scope
- Public cloud deployment and live web hosting (initial release)
- Integration with official WatCard API (scraping-based approach only)
- External payment platform scraping/API beyond WatCard
- Mobile native applications (iOS/Android)
- Real-time transaction alerts (notifications are batch/monthly)
- Multi-university support (UWaterloo only)

---

## 5. Stakeholders

| Role               | Name / Group           | Responsibilities                                                 |
| ------------------ | ---------------------- | ---------------------------------------------------------------- |
| Project Sponsor    | SE101 Instruction Team | Approve project charter, review deliverables, provide guidance   |
| Product Owner      | Shiman                 | Define requirements, prioritize backlog, accept completed work   |
| Scrum Master       | Ava                    | Facilitate Scrum ceremonies, remove blockers, track progress     |
| Lead Developer     | Krish                  | Architecture design, technical decisions, code review            |
| Developers         | Shiman, Ava, Krish, Elaine, Liron | Implement features, write tests, documentation     |
| QA Lead            | Liron                  | Test planning, execution, quality assurance                      |
| End Users          | UWaterloo Students     | Use dashboard, provide feedback                                  |

---

## 6. Team Roles and Responsibilities

### Detailed Role Breakdown

| Team Member | Primary Role | Function Responsibilities | Testing Responsibilities | MR Reviewer | Deliverable Ownership (%) |
| ----------- | ------------ | ------------------------- | ------------------------ | ----------- | ------------------------- |
| **Shiman** | Product Owner & Frontend Lead | - Charter development (lead)<br>- User stories creation<br>- Frontend dashboard (React components)<br>- Manual input feature<br>- Product backlog management | - Test frontend UI/UX<br>- Test data visualization accuracy<br>- User acceptance testing | Backend, Extension | ~23% |
| **Ava** | Scrum Master & Backend Lead | - Backend API (Express + MySQL)<br>- Database schema design<br>- Authentication system<br>- Sprint facilitation<br>- Weekly progress tracking | - Test extension data parsing<br>- Test API endpoints<br>- Integration testing | Frontend, Dashboard | ~25% |
| **Krish** | Lead Developer & Architecture | - System architecture design<br>- Chrome extension development<br>- JSON data pipeline<br>- Technical documentation<br>- Code review coordination | - Test backend integration<br>- Test data flow pipeline<br>- Security testing | Dashboard, Backend | ~22% |
| **Elaine** | Full-Stack Developer & Visualization | - Frontend visualization (Chart.js/D3.js)<br>- Progress bars and goal tracking UI<br>- Dashboard styling and responsiveness<br>- Monthly report generation | - Test data accuracy<br>- Test goal progress calculations<br>- Cross-browser testing | Extension, Frontend | ~20% |
| **Liron** | QA Lead & DevOps | - Test plan creation<br>- Automated testing setup<br>- Manual input feature testing<br>- SMS notification implementation<br>- Deployment configuration | - Test report generation<br>- Test user input validation<br>- End-to-end testing<br>- Coverage reporting | Backend, Extension | ~20% |

### Shared Responsibilities
- **All Members**: 
  - Participate in daily standups (Mon/Wed/Fri)
  - Attend sprint planning, review, and retrospective meetings
  - Maintain GitLab issues and commit regularly (minimum 2-3 commits/week)
  - Write unit tests for their code
  - Review merge requests assigned to them within 24 hours
  - Contribute to documentation

---

## 7. Deliverables (Aligned with SE101 Requirements)

| % | Deliverable | Path | Owner(s) | Due Date |
|---|------------|------|----------|----------|
| 5% | Project Charter | `docs/charter.md` | Shiman (lead), All review | Week 1 |
| 10% | Product & Sprint Backlogs | GitLab Issue Boards | Shiman (product), Ava (sprint) | Ongoing |
| 10% | Requirements & Design | `docs/user_stories.md`<br>`docs/domain_model.md`<br>`docs/use_cases.md` | Shiman (user stories)<br>Krish (domain model)<br>Ava (use cases) | Week 2 |
| 15% | Source Code & Build | `src/`, `build/` | All developers | Week 4 |
| 10% | Tests & Results | `docs/test_plan.md`<br>`tests/`<br>`docs/test_report.md` | Liron (lead), All contribute | Week 4 |
| 5% | User Manual | `docs/user_manual.md` | Elaine | Week 4 |
| 10% | Final Video Demo | `docs/demo.mp4` | Elaine (production), All participate | Week 4 |
| 10% | Final Sprint Review | `docs/review_presentation.pdf` + live demo | Ava (lead), Shiman (support) | Week 4 |
| 10% | Sprint Retrospectives | `docs/sprint_retrospectives.md` | Ava | After each sprint |
| 10% | Weekly Progress & Git Hygiene | Commits, issues, boards | Ava (monitor), All execute | Ongoing |
| 5% | README & Setup Guide | `README.md` | Krish | Week 4 |

**Total: 100%**

---

## 8. Technology Stack

### Frontend
- **Framework**: React 18.x
- **Styling**: Tailwind CSS or Material-UI
- **State Management**: React Context API (or Redux if needed)
- **HTTP Client**: Axios
- **Visualization**: Chart.js or D3.js

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express.js
- **Authentication**: JWT (jsonwebtoken) + Google OAuth (passport-google-oauth20)
- **Validation**: Joi or express-validator

### Database
- **Database**: MySQL 8.x
- **Connection**: mysql2 package
- **Schema Management**: Manual migrations or Sequelize ORM

### Chrome Extension
- **Technology**: JavaScript (Chrome Extension API)
- **Manifest**: Manifest V3
- **Permissions**: activeTab, storage, tabs (minimal required)

### Notifications
- **SMS Service**: Twilio API or alternative service

### Testing
- **Frontend**: Jest + React Testing Library
- **Backend**: Jest + Supertest
- **E2E**: Manual testing initially, consider Cypress if time permits
- **Coverage Tool**: nyc or Jest built-in coverage

### DevOps & Tools
- **Version Control**: Git (GitLab)
- **CI/CD**: GitLab CI (optional bonus)
- **Deployment**: Local initially, consider Railway/Render for backend
- **Environment Management**: dotenv
- **API Testing**: Postman or Thunder Client

---

## 9. Requirements (User Stories, Domain Model, Use Cases)

### 9.1 User Stories

#### Priority: High (Must Have)

**US-001**: As a **UWaterloo student**, I want to **log into the dashboard with my credentials** so that **my spending data is secure and personalized**.
- **Acceptance Criteria**:
  - User can create account with email/password
  - User can log in with Google OAuth
  - Session persists across browser sessions
  - Logout functionality available

**US-002**: As a **WatCard user**, I want to **scrape my transaction data via Chrome extension** so that **I can import my spending history automatically**.
- **Acceptance Criteria**:
  - Extension activates when on WatCard website
  - User clicks extension button to scrape data
  - Transaction data exports as JSON
  - JSON automatically uploads to dashboard

**US-003**: As a **student tracking spending**, I want to **view my total balance and spending by category** so that **I understand where my money goes**.
- **Acceptance Criteria**:
  - Dashboard displays current WatCard balance
  - Spending categorized (Food, Coffee, Printing, Other)
  - Visual charts show category breakdown
  - Data updates when new transactions imported

**US-004**: As a **budget-conscious student**, I want to **set monthly spending goals for each category** so that **I can control my expenses**.
- **Acceptance Criteria**:
  - User can set dollar amount goal per category
  - Progress bars show spending vs. goal
  - Visual indicator when goal exceeded
  - Goals persist month-to-month until changed

**US-005**: As a **student**, I want to **manually add transactions not captured by WatCard** so that **I have a complete spending picture**.
- **Acceptance Criteria**:
  - Form to add transaction (date, amount, category, description)
  - Manual transactions appear in dashboard
  - Manual transactions stored in database
  - Ability to edit/delete manual entries

#### Priority: Medium (Should Have)

**US-006**: As a **student**, I want to **view spending trends over time** so that **I can identify patterns in my behavior**.
- **Acceptance Criteria**:
  - Line chart shows spending over weeks/months
  - Can filter by category
  - Can select date range
  - Trends show percentage change

**US-007**: As a **user**, I want to **receive personalized spending insights** so that **I get actionable feedback**.
- **Acceptance Criteria**:
  - Dashboard shows insights like "You spent 30% less this month!"
  - Insights update with new data
  - Insights highlight unusual spending

**US-008**: As a **student**, I want to **generate monthly spending reports** so that **I can review my finances periodically**.
- **Acceptance Criteria**:
  - Report shows total spending per category
  - Report compares to previous month
  - Report downloadable as PDF or viewable in dashboard
  - Report accessible for past months

**US-009**: As a **student**, I want to **receive SMS notifications about my spending** so that **I stay informed without checking the app**.
- **Acceptance Criteria**:
  - User can opt-in to SMS notifications
  - Monthly summary sent via SMS
  - Alert sent when spending goal exceeded
  - User can configure notification preferences

#### Priority: Low (Nice to Have)

**US-010**: As a **user**, I want to **access my WatCard account directly from dashboard** so that **I can verify transactions quickly**.
- **Acceptance Criteria**:
  - Link to official WatCard website in dashboard
  - Opens in new tab

**US-011**: As a **student**, I want to **customize spending categories** so that **tracking reflects my personal needs**.
- **Acceptance Criteria**:
  - User can create custom categories
  - Custom categories appear in all visualizations
  - Can rename/delete custom categories

### 9.2 Domain Model

#### Entities (Classes/Objects)

**User**
- Attributes:
  - `userId` (Primary Key, UUID)
  - `email` (String, unique)
  - `passwordHash` (String)
  - `firstName` (String)
  - `lastName` (String)
  - `phoneNumber` (String, optional)
  - `smsNotificationsEnabled` (Boolean)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)

**Transaction**
- Attributes:
  - `transactionId` (Primary Key, UUID)
  - `userId` (Foreign Key → User)
  - `date` (DateTime)
  - `amount` (Decimal, 2 decimals)
  - `category` (Enum: Food, Coffee, Printing, Other, Custom)
  - `description` (String)
  - `vendor` (String)
  - `isManual` (Boolean)
  - `watcardTransactionId` (String, optional, from scraped data)
  - `createdAt` (DateTime)

**SpendingGoal**
- Attributes:
  - `goalId` (Primary Key, UUID)
  - `userId` (Foreign Key → User)
  - `category` (Enum: Food, Coffee, Printing, Other, Custom)
  - `monthYear` (String, format: "YYYY-MM")
  - `goalAmount` (Decimal, 2 decimals)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)

**MonthlyReport**
- Attributes:
  - `reportId` (Primary Key, UUID)
  - `userId` (Foreign Key → User)
  - `monthYear` (String, format: "YYYY-MM")
  - `totalSpending` (Decimal)
  - `categoryBreakdown` (JSON: {category: amount})
  - `insightsText` (Text)
  - `generatedAt` (DateTime)

**Category** (Optional: if custom categories implemented)
- Attributes:
  - `categoryId` (Primary Key, UUID)
  - `userId` (Foreign Key → User, null for default categories)
  - `categoryName` (String)
  - `isDefault` (Boolean)
  - `createdAt` (DateTime)

#### Relationships

- **User** has many **Transactions** (1:N)
- **User** has many **SpendingGoals** (1:N)
- **User** has many **MonthlyReports** (1:N)
- **User** has many **Categories** (1:N, if custom categories implemented)
- **Transaction** belongs to one **User** (N:1)
- **Transaction** has one **Category** (N:1, if category entity exists)
- **SpendingGoal** belongs to one **User** (N:1)
- **MonthlyReport** belongs to one **User** (N:1)

### 9.3 Use-Case Models

#### Use Case 1: Scrape WatCard Transactions

**Actor**: Student (Chrome Extension User)

**Goal**: Import WatCard transaction history into dashboard

**Preconditions**: 
- User logged into WatCard website
- Chrome extension installed
- User registered on dashboard

**Main Flow**:
1. Student navigates to WatCard transaction history page
2. Student clicks WatCard Dashboard extension icon
3. Extension detects WatCard page structure
4. Extension scrapes transaction table (date, amount, vendor, location)
5. Extension maps scraped data to JSON format
6. Extension authenticates with dashboard backend
7. Extension sends JSON data via POST request to `/api/transactions/import`
8. Backend validates and stores transactions in MySQL
9. Extension displays success notification
10. Dashboard automatically refreshes to show new transactions

**Postconditions**: 
- Transactions stored in database
- Dashboard displays updated spending data
- User sees confirmation message

**Exceptions**: 
- **E1**: WatCard page structure changed → Display error message, log issue for developer review
- **E2**: Network error during upload → Cache data locally, retry on next extension activation
- **E3**: Authentication token expired → Prompt user to re-authenticate
- **E4**: Duplicate transactions detected → Skip duplicates, notify user of count

---

#### Use Case 2: Set Monthly Spending Goal

**Actor**: Student (Dashboard User)

**Goal**: Define spending limit for a category to track budget

**Preconditions**: 
- User logged into dashboard
- User has at least one transaction

**Main Flow**:
1. Student navigates to "Goals" section in dashboard
2. System displays current goals and categories
3. Student selects category (e.g., "Food")
4. Student enters goal amount (e.g., "$200")
5. System validates input (positive number, reasonable value)
6. Student clicks "Save Goal"
7. System stores goal in database linked to current month
8. System calculates current spending vs. goal
9. System displays progress bar showing percentage used
10. System returns to goals overview page

**Postconditions**: 
- Goal saved in database for current month
- Progress bar updated on dashboard
- Notifications triggered if goal already exceeded

**Exceptions**: 
- **E1**: Invalid input (negative/non-numeric) → Display validation error, keep form open
- **E2**: Database error → Display error message, allow retry
- **E3**: User sets goal after already exceeding → Show warning, allow confirmation
- **E4**: Network timeout → Cache goal locally, sync when connection restored

---

#### Use Case 3: Generate Monthly Report

**Actor**: System (Automated Process) OR Student (Manual Trigger)

**Goal**: Create comprehensive monthly spending summary

**Preconditions**: 
- User has transactions for the target month
- Month has ended (for automated reports)

**Main Flow**:
1. System triggers report generation on 1st of new month (or user clicks "Generate Report")
2. System queries all transactions for user in previous month
3. System aggregates spending by category
4. System calculates total spending
5. System compares to previous month's spending
6. System retrieves spending goals for month
7. System generates insights:
   - "You spent 15% less than last month"
   - "You exceeded your Coffee goal by $12"
   - "Your top spending category was Food ($145)"
8. System creates MonthlyReport record in database
9. System renders report visualization in dashboard
10. System sends SMS notification with summary (if enabled)
11. Report accessible in "Reports" section

**Postconditions**: 
- MonthlyReport stored in database
- Report visible in dashboard
- SMS sent (if opted-in)
- User notified of report availability

**Exceptions**: 
- **E1**: No transactions for month → Generate report with $0 spending, note to user
- **E2**: SMS service unavailable → Log error, report still generated, send email as fallback
- **E3**: Previous month data missing for comparison → Generate report without comparison
- **E4**: Report generation fails → Log error, queue for retry, notify user of delay

---

#### Use Case 4: Manually Add Transaction

**Actor**: Student (Dashboard User)

**Goal**: Record spending not captured by WatCard

**Preconditions**: 
- User logged into dashboard

**Main Flow**:
1. Student navigates to "Add Transaction" page or clicks "+" button
2. System displays transaction entry form
3. Student enters:
   - Date (date picker, defaults to today)
   - Amount (decimal input)
   - Category (dropdown: Food, Coffee, Printing, Other, Custom categories)
   - Description (optional text)
   - Vendor (optional text)
4. System validates inputs:
   - Date not in future
   - Amount > 0
   - Category selected
5. Student clicks "Add Transaction"
6. System marks transaction as manual (`isManual = true`)
7. System stores transaction in database
8. System recalculates spending totals and goal progress
9. System redirects to dashboard with success message
10. New transaction appears in transaction list and charts

**Postconditions**: 
- Manual transaction stored in database
- Dashboard updated with new data
- Spending goals recalculated
- User confirmation displayed

**Exceptions**: 
- **E1**: Validation fails → Highlight invalid fields, show error messages, keep form data
- **E2**: Database error → Display error message, keep form open for retry
- **E3**: User adds very large amount → Show confirmation dialog ("Did you mean $X?")
- **E4**: Network timeout → Cache transaction locally, show "Will sync when online" message

---

### 9.4 Non-Functional Requirements

#### Performance
- **NFR-001**: Dashboard page load time shall not exceed 2 seconds on standard broadband (95% of requests)
- **NFR-002**: Chrome extension shall scrape and export transaction data in less than 5 seconds for up to 100 transactions
- **NFR-003**: Database queries for monthly reports shall complete in under 1 second for up to 1,000 transactions
- **NFR-004**: API endpoints shall respond within 500ms for 99% of requests

#### Dependability
- **NFR-005**: System uptime shall be 95% during testing period (excluding scheduled maintenance)
- **NFR-006**: Database backups shall occur daily automatically
- **NFR-007**: System shall gracefully handle WatCard website structure changes without crashing

#### Security
- **NFR-008**: All passwords shall be hashed using bcrypt with salt factor ≥12
- **NFR-009**: Authentication tokens (JWT) shall expire after 24 hours
- **NFR-010**: All API endpoints (except login/register) shall require valid authentication token
- **NFR-011**: Database connections shall use encrypted connections (TLS)
- **NFR-012**: Chrome extension shall use minimum required permissions
- **NFR-013**: SQL injection attacks shall be prevented via parameterized queries

#### Privacy
- **NFR-014**: User financial data shall not be shared with third parties without explicit consent
- **NFR-015**: User data shall be deletable upon request (GDPR-style right to deletion)
- **NFR-016**: SMS notifications shall not contain specific transaction amounts, only summaries
- **NFR-017**: Extension shall not collect data when user is not actively using it

#### Usability
- **NFR-018**: Dashboard shall be responsive and usable on screens ≥768px width
- **NFR-019**: Color schemes shall meet WCAG 2.1 AA contrast requirements
- **NFR-020**: All user actions shall provide visual feedback within 200ms
- **NFR-021**: Error messages shall be clear and actionable (not technical jargon)

#### Maintainability
- **NFR-022**: Code shall follow consistent style guide (ESLint + Prettier)
- **NFR-023**: All functions shall have JSDoc comments explaining purpose and parameters
- **NFR-024**: Database schema shall support migrations for version upgrades
- **NFR-025**: Test coverage shall be ≥70% for backend code

---

## 10. Milestones and Timeline

### Sprint Structure
- **Sprint Duration**: 1 week
- **Number of Sprints**: 4 sprints
- **Total Project Duration**: 4 weeks

### Sprint Breakdown

#### Sprint 0: Project Setup & Planning (Week 1)
**Goal**: Establish foundation and clarify requirements

**Deliverables**:
- ✅ Charter finalized and approved
- ✅ User stories documented
- ✅ Domain model created
- ✅ Use cases written
- ✅ GitLab repository structured
- ✅ Technology stack finalized
- ✅ Development environments set up

**Key Tasks**:
- All: Review and sign charter
- Shiman: Write and prioritize user stories
- Krish: Create domain model diagram, design database schema
- Ava: Document use cases, set up GitLab boards
- Elaine: Research visualization libraries
- Liron: Create test plan structure
- All: Install development tools, clone repository

**Sprint Review**: Present charter, user stories, domain model, use cases to team

**Sprint Retrospective**: Discuss team communication and planning process

---

#### Sprint 1: Core Infrastructure (Week 2)
**Goal**: Build backend, database, and basic Chrome extension

**Deliverables**:
- ✅ MySQL database set up with schema
- ✅ Express backend with authentication
- ✅ Basic API endpoints (register, login, get transactions)
- ✅ Chrome extension scaffolding
- ✅ Extension can scrape sample WatCard page

**Key Tasks by Role**:

**Ava (Backend Lead)**:
- Set up Express server with basic routes
- Implement MySQL connection and schema creation scripts
- Build authentication endpoints (POST /api/auth/register, POST /api/auth/login)
- Implement JWT token generation and validation middleware
- Write unit tests for auth endpoints

**Krish (Extension Lead)**:
- Initialize Chrome extension with manifest.json (V3)
- Create popup UI with "Scrape Transactions" button
- Implement content script to detect WatCard page
- Write scraping logic for transaction table
- Test scraping on sample HTML file

**Shiman (Frontend Lead)**:
- Set up React project with Tailwind CSS
- Create basic layout (header, sidebar, main content area)
- Implement login/register pages
- Connect login form to backend API
- Store JWT token in localStorage

**Elaine (Visualization)**:
- Research Chart.js vs D3.js, document decision
- Create sample mock data for testing
- Build basic bar chart component (not connected to API yet)

**Liron (QA Lead)**:
- Set up Jest for backend testing
- Write test cases for authentication flow
- Create test data generation scripts
- Document testing strategy

**Sprint Review**: Demo authentication, database structure, extension scraping, basic React app

**Sprint Retrospective**: Discuss technical challenges, integration points, adjust timeline if needed

---

#### Sprint 2: Core Features & Integration (Week 3)
**Goal**: Complete dashboard visualization, manual transactions, and full data pipeline

**Deliverables**:
- ✅ Dashboard displays transactions from database
- ✅ Spending categorization working
- ✅ Charts showing category breakdown
- ✅ Manual transaction entry form functional
- ✅ Chrome extension uploads data to backend
- ✅ Progress bars for goals

**Key Tasks by Role**:

**Ava (Backend Lead)**:
- Implement POST /api/transactions/import endpoint
- Build GET /api/transactions?userId=X endpoint with filters
- Implement POST /api/transactions/manual endpoint
- Create GET /api/goals and POST /api/goals endpoints
- Write integration tests for full data flow
- Implement category mapping logic

**Krish (Extension Lead)**:
- Integrate extension with backend API
- Implement authentication in extension (popup login or token from dashboard)
- Add JSON export functionality
- Implement POST request to /api/transactions/import
- Handle error cases (network failure, auth failure)
- Add loading indicators

**Shiman (Frontend Lead)**:
- Build dashboard home page layout
- Create transaction list component
- Implement category filter dropdown
- Build "Add Manual Transaction" form
- Connect all components to backend API
- Implement error handling and loading states

**Elaine (Visualization)**:
- Build category spending pie chart
- Create monthly spending line chart
- Implement spending goal cards with progress bars
- Add date range filter component
- Ensure charts are responsive
- Add tooltips and legends

**Liron (QA Lead)**:
- Test extension scraping with real WatCard HTML
- Perform integration testing (extension → backend → database → frontend)
- Test manual transaction validation
- Test goal progress calculation accuracy
- Identify and log bugs in GitLab
- Achieve 70% test coverage

**Sprint Review**: Demo complete data flow from extension to dashboard, manual transactions, goal tracking

**Sprint Retrospective**: Discuss integration challenges, data accuracy, UI/UX feedback

---

#### Sprint 3: Advanced Features & Notifications (Week 4, first half)
**Goal**: Add monthly reports, SMS notifications, insights, and polish

**Deliverables**:
- ✅ Monthly report generation working
- ✅ SMS notifications implemented
- ✅ Spending insights displayed
- ✅ Link to WatCard website added
- ✅ UI polished and responsive
- ✅ All features tested

**Key Tasks by Role**:

**Ava (Backend Lead)**:
- Implement POST /api/reports/generate endpoint
- Build scheduled job for monthly report generation (cron)
- Integrate Twilio API for SMS notifications
- Implement GET /api/reports endpoint
- Test SMS delivery
- Add error logging and monitoring

**Krish (Extension Lead)**:
- Refine extension UI based on feedback
- Add transaction count display before upload
- Implement duplicate detection
- Add settings page for configuration
- Write extension user guide
- Test across Chrome versions

**Shiman (Frontend Lead)**:
- Build monthly reports page
- Display reports with charts and insights
- Add link to WatCard website in navigation
- Implement user settings page (SMS opt-in)
- Polish dashboard styling
- Fix responsive design issues

**Elaine (Visualization)**:
- Create report visualization template
- Implement spending insights algorithm
- Add comparison charts (current vs previous month)
- Create print-friendly report view
- Add export report as PDF functionality (if time permits)
- Ensure accessibility (color contrast, labels)

**Liron (QA Lead)**:
- Execute full test plan across all components
- Perform user acceptance testing
- Test edge cases (no data, large datasets, invalid inputs)
- Test SMS notification delivery
- Document all bugs and verify fixes
- Generate test coverage report

**Sprint Review**: Demo monthly reports, SMS notifications, polished dashboard

**Sprint Retrospective**: Discuss feature completeness, testing findings, documentation needs

---

#### Sprint 4: Finalization & Documentation (Week 4, second half)
**Goal**: Complete documentation, video demo, and final polish

**Deliverables**:
- ✅ User manual completed
- ✅ README with setup instructions
- ✅ Test report finalized
- ✅ Final video demo recorded
- ✅ Sprint review presentation prepared
- ✅ Code cleaned and commented
- ✅ v1.0 release tagged

**Key Tasks by Role**:

**All Team**:
- Code cleanup and commenting
- Review and merge final pull requests
- Tag v1.0 release in GitLab
- Participate in video demo recording
- Practice final presentation

**Shiman (Product Owner)**:
- Finalize sprint review presentation
- Prepare product demo script
- Collect team velocity metrics
- Summarize completed user stories
- Prepare stakeholder feedback summary

**Ava (Scrum Master)**:
- Complete final sprint retrospective
- Document lessons learned
- Update GitLab issue boards
- Verify all deliverables submitted
- Prepare process improvement summary

**Krish (Technical Lead)**:
- Write comprehensive README.md
- Document system architecture
- Create API documentation
- Write deployment guide
- Review all code comments

**Elaine (Documentation Lead)**:
- Write user manual with screenshots
- Record and edit demo video
- Create troubleshooting guide
- Write feature documentation

**Liron (QA Lead)**:
- Finalize test report with coverage metrics
- Document test execution results
- List known bugs and their severity
- Provide quality assessment summary
- Archive test data

**Sprint Review**: Final presentation to stakeholders, live demo of all features

**Sprint Retrospective**: Reflect on entire project, celebrate successes, identify learnings

---

## 11. Risk Assessment

| Risk ID | Risk Description | Impact | Likelihood | Mitigation Strategy | Owner | Status |
|---------|-----------------|--------|-----------|---------------------|-------|--------|
| **R-001** | WatCard website structure changes, breaking scraper | High | Medium | - Keep CSS selectors flexible and well-documented<br>- Use data attributes if available<br>- Implement scraping version detection<br>- Test scraper weekly<br>- Have fallback manual upload option | Krish | Active |
| **R-002** | Privacy concerns over storing personal financial data | High | High | - Keep all data on local server, no cloud sync<br>- Implement user data deletion feature<br>- Hash sensitive data<br>- No third-party analytics<br>- Clear privacy policy in user manual | Ava | Active |
| **R-003** | Chrome extension API limitations or permission issues | Medium | Medium | - Use minimal required permissions<br>- Test across Chrome versions<br>- Document permission requirements clearly<br>- Have fallback manual upload option | Krish | Active |
| **R-004** | Database errors or inconsistent data parsing | Medium | Medium | - Validate JSON structure before insertion<br>- Use database transactions for atomicity<br>- Implement rollback mechanism<br>- Unit test parsing logic thoroughly<br>- Log all database errors | Ava | Active |
| **R-005** | Time constraints preventing frontend polish | Medium | Medium | - Focus on core features first (MVP approach)<br>- Use UI library (Material-UI) for faster development<br>- Timebox styling tasks<br>- Prioritize functionality over aesthetics | Shiman | Active |
| **R-006** | Integration issues between extension and backend | High | Medium | - Define clear API contract early<br>- Use Postman for API testing<br>- Implement comprehensive error handling<br>- Schedule integration testing in Sprint 2<br>- Daily standups to surface blockers | Ava, Krish | Active |
| **R-007** | Insufficient test coverage (<70%) | Medium | Medium | - Write tests alongside code (TDD approach)<br>- Dedicate Liron full-time to testing in Sprint 3<br>- Use coverage tools to identify gaps<br>- Make tests part of MR approval criteria | Liron | Active |
| **R-008** | Team member unavailability or illness | Medium | Low | - Cross-train on critical components<br>- Document all work in progress<br>- Maintain clear GitLab issues<br>- Pair programming for knowledge sharing<br>- Have backup assignments prepared | Ava | Active |
| **R-009** | MySQL performance issues with large datasets | Low | Low | - Index frequently queried columns<br>- Optimize queries with EXPLAIN<br>- Limit initial data imports<br>- Test with large mock datasets<br>- Consider pagination for large results | Ava | Active |
| **R-010** | SMS notification service (Twilio) reliability/cost | Low | Medium | - Have email fallback option<br>- Use free tier for testing<br>- Batch notifications to reduce cost<br>- Make notifications optional<br>- Consider alternative providers | Liron | Active |
| **R-011** | Authentication security vulnerabilities | High | Low | - Use established JWT libraries<br>- Implement bcrypt with high salt factor<br>- Add rate limiting to auth endpoints<br>- Security review by all team members<br>- Test with OWASP Top 10 in mind | Ava | Active |
| **R-012** | Scope creep from additional feature requests | Medium | Medium | - Strictly adhere to charter<br>- Product Owner (Shiman) controls scope changes<br>- Maintain backlog of "future features"<br>- Focus on completing high-priority user stories<br>- Review scope in each sprint planning | Shiman | Active |

### Risk Response Plan
- **High Impact + High Likelihood**: Address immediately, develop contingency plan
- **High Impact + Medium Likelihood**: Monitor closely, implement mitigation strategies
- **Medium Impact**: Monitor, implement basic mitigation
- **Low Impact**: Accept risk, document workarounds

---

## 12. Communication Plan

### Meeting Schedule

#### Daily Standups
- **Frequency**: Monday, Wednesday, Friday at 6:00 PM EST
- **Duration**: 15 minutes (strict)
- **Format**: Each person answers:
  1. What did I complete since last standup?
  2. What will I work on next?
  3. Any blockers or help needed?
- **Platform**: Discord voice channel
- **Leader**: Ava (Scrum Master)
- **Notes**: Ava logs blockers in GitLab issues

#### Sprint Planning
- **Frequency**: First day of each sprint (Monday)
- **Duration**: 1-1.5 hours
- **Agenda**:
  1. Review previous sprint outcomes
  2. Shiman presents prioritized backlog
  3. Team estimates effort (planning poker)
  4. Team commits to sprint goals
  5. Break user stories into tasks
  6. Assign tasks to team members
- **Platform**: Discord voice + screen share
- **Leader**: Shiman (Product Owner) & Ava (Scrum Master)
- **Output**: Sprint backlog in GitLab with assigned issues

#### Sprint Review
- **Frequency**: Last day of each sprint (Sunday)
- **Duration**: 45 minutes
- **Agenda**:
  1. Demo completed features (each developer presents their work)
  2. Review sprint goals: met or not met?
  3. Gather feedback from team
  4. Update product backlog based on learnings
- **Platform**: Discord voice + screen share
- **Leader**: Shiman (Product Owner)
- **Attendance**: All team members required
- **Output**: Demo recording (for final submission), updated backlog

#### Sprint Retrospective
- **Frequency**: After each sprint review (Sunday)
- **Duration**: 30 minutes
- **Agenda**:
  1. What went well this sprint?
  2. What didn't go well?
  3. What should we start doing?
  4. What should we stop doing?
  5. Action items for next sprint
- **Platform**: Discord voice
- **Leader**: Ava (Scrum Master)
- **Output**: Retrospective notes in `docs/sprint_retrospectives.md`

#### Ad-Hoc Pairing/Debugging Sessions
- **Frequency**: As needed
- **Duration**: Variable
- **Format**: Two or more team members work together on complex problem
- **Platform**: Discord screen share or in-person
- **Scheduling**: Posted in Discord #general channel

### Communication Channels

#### Discord Server (Primary)
- **#general**: General discussion, questions, coordination
- **#standup**: Standup updates (if voice unavailable)
- **#blockers**: Urgent issues needing immediate attention
- **#code-review**: MR notifications and review requests
- **#testing**: QA updates, bug reports, test results
- **#resources**: Links to documentation, tutorials, tools

#### GitLab (Secondary)
- **Issues**: Task tracking, bug reporting
- **Merge Requests**: Code reviews, comments on specific code
- **Wiki**: Documentation, meeting notes, guides
- **Issue Boards**: Visual task management

#### Email (Tertiary)
- **Usage**: Official communication with SE101 instructors
- **Response Time**: Check daily

### Response Time Expectations
- **Urgent (blocker, production down)**: Within 2 hours (tag with @here in Discord)
- **Code review requests**: Within 24 hours on weekdays
- **GitLab issue assignments**: Acknowledge within 24 hours
- **Discord messages**: Within 8 hours on weekdays
- **Meeting attendance**: Mandatory unless 24-hour advance notice given

### Decision-Making Process
1. **Minor technical decisions** (variable names, file structure): Developer makes decision, documents in code comments
2. **Moderate technical decisions** (library choice, architecture pattern): Lead Developer (Krish) decides after team input
3. **Scope/feature decisions**: Product Owner (Shiman) decides after stakeholder input
4. **Major conflicts or impasses**: Team vote (majority rules), Scrum Master (Ava) facilitates, Product Owner breaks ties
5. **Process changes**: Scrum Master (Ava) proposes, team approves via vote in retrospective

---

## 13. Quality Standards

### Code Quality

#### Style and Formatting
- **Linting**: ESLint configured with Airbnb style guide
- **Formatting**: Prettier for automatic code formatting
- **Pre-commit Hooks**: Husky runs lint and format checks before commits
- **Naming Conventions**:
  - Variables/functions: camelCase (e.g., `getUserTransactions`)
  - Components: PascalCase (e.g., `TransactionList`)
  - Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
  - Database tables: snake_case (e.g., `user_transactions`)

#### Code Reviews
- **Requirement**: All code changes must go through Merge Request (MR)
- **Approval**: Minimum 1 approval from assigned reviewer before merge
- **Reviewer Assignment**: See "MR Reviewer" column in Roles table
- **Review Checklist**:
  - ✅ Code follows style guide
  - ✅ No console.log or debug code
  - ✅ Functions have JSDoc comments
  - ✅ Tests included and passing
  - ✅ No security vulnerabilities (SQL injection, XSS, etc.)
  - ✅ Error handling implemented
  - ✅ Performance acceptable (no obvious bottlenecks)

#### Documentation
- **JSDoc Comments**: All functions must have JSDoc with description, @param, @returns
- **README Files**: Each major directory has README explaining purpose
- **Inline Comments**: Complex logic must have explanatory comments
- **API Documentation**: All endpoints documented with request/response examples

### Git Standards

#### Commit Messages
- **Format**: `[type]: description` (e.g., `[feature]: add transaction filtering`)
- **Types**: `[feature]`, `[fix]`, `[refactor]`, `[docs]`, `[test]`, `[style]`
- **Description**: Clear, concise, imperative mood (e.g., "add" not "added")
- **Length**: 50 characters or less for subject line
- **Example**: `[fix]: resolve duplicate transaction bug in import endpoint`

#### Branch Naming
- **Format**: `[type]/[description]` (e.g., `feature/monthly-reports`)
- **Types**: `feature/`, `bugfix/`, `hotfix/`, `refactor/`, `docs/`
- **Description**: Lowercase with hyphens, descriptive (e.g., `feature/sms-notifications`)

#### Merge Requests
- **Title**: Clear description of changes (e.g., "Add spending goal progress bars")
- **Description Template**:
  ```
  ## What does this MR do?
  [Brief description]
  
  ## Related Issues
  Closes #[issue-number]
  
  ## Testing
  - [ ] Unit tests added/updated
  - [ ] Manual testing performed
  - [ ] No regressions introduced
  
  ## Screenshots (if UI changes)
  [Attach screenshots]
  ```
- **Labels**: Add appropriate labels (e.g., `feature`, `bug`, `priority::high`)
- **Assignee**: Assign to yourself
- **Reviewer**: Assign reviewer based on role matrix

#### No Direct Commits to Main
- **Rule**: `main` branch is protected
- **Process**: All changes via feature branches → MR → approval → merge
- **Exception**: None (emergency hotfixes still require MR, just expedited review)

### Testing Standards

#### Coverage Target
- **Overall**: ≥70% code coverage
- **Backend**: ≥80% coverage (critical business logic)
- **Frontend**: ≥60% coverage (UI components)
- **Measurement**: Use Jest coverage reports, enforce with GitLab CI (if implemented)

#### Test Types Required
- **Unit Tests**: All backend functions, frontend utility functions
- **Integration Tests**: API endpoints, database operations
- **Component Tests**: React components (render, interactions)
- **E2E Tests**: At least 3 critical user flows (manual initially)

#### Test Documentation
- **Test Files**: Named `[filename].test.js` in same directory as source
- **Test Structure**: Use `describe` and `it` blocks with clear descriptions
- **Test Data**: Use mock data factories, document in `tests/fixtures/`
- **Assertions**: Use clear, specific assertions (not just "truthy")

### Definition of Done

A user story/task is **Done** when:
1. ✅ Code written and follows style guide
2. ✅ Unit tests written and passing (coverage ≥70% for that feature)
3. ✅ Code reviewed and approved by assigned reviewer
4. ✅ Merged into `main` branch without conflicts
5. ✅ Feature tested in local environment
6. ✅ Acceptance criteria from user story met (verified by Product Owner)
7. ✅ Documentation updated (if applicable)
8. ✅ No known critical or high-priority bugs
9. ✅ GitLab issue moved to "Done" column

---

## 14. Success Metrics

### Delivery Metrics
- ✅ **Feature Completion**: 100% of high-priority user stories (US-001 to US-005) completed
- ✅ **Sprint Goal Achievement**: ≥80% of committed sprint stories completed per sprint
- ✅ **Deadline Adherence**: All deliverables submitted on or before due date
- ✅ **Final Grade**: Target ≥85% (B+ or higher) on project

### Quality Metrics
- ✅ **Test Coverage**: ≥70% overall, ≥80% backend
- ✅ **Code Review Rate**: 100% of code changes reviewed before merge
- ✅ **Critical Bugs**: 0 critical bugs in v1.0 release
- ✅ **High-Priority Bugs**: ≤2 high-priority bugs in v1.0 release
- ✅ **Linting Errors**: 0 ESLint errors in final codebase

### Process Metrics
- ✅ **Sprint Velocity Consistency**: Variation ≤20% between sprints 2-4
- ✅ **Commit Distribution**: Each team member contributes ≥15% of total commits
- ✅ **Meeting Attendance**: ≥90% attendance across all team members
- ✅ **MR Review Time**: Average <24 hours for review completion
- ✅ **Issue Resolution Time**: Average <48 hours for medium-priority bugs

### User Satisfaction Metrics
- ✅ **Usability**: Team members (as users) rate dashboard ≥4/5 on ease of use
- ✅ **Feature Usefulness**: ≥80% of user stories rated "very useful" by team
- ✅ **Performance**: Dashboard load time <2 seconds on standard connection
- ✅ **Documentation Quality**: User manual enables new user to set up system without assistance

---

## 15. Approval and Signatures

By signing below, all team members agree to:
- ✅ Fulfill their assigned responsibilities to the best of their ability
- ✅ Attend all scheduled meetings (standups, sprint planning, review, retrospective) or provide 24-hour advance notice
- ✅ Communicate openly, respectfully, and proactively with the team
- ✅ Support teammates when they need help or are blocked
- ✅ Adhere to all quality standards, coding guidelines, and processes outlined in this charter
- ✅ Complete assigned work on time and notify the team immediately if delays anticipated
- ✅ Actively participate in code reviews and provide constructive feedback
- ✅ Maintain confidentiality of user data and follow security best practices
- ✅ Contribute to a positive, collaborative team environment

### Team Signatures

| Team Member | Primary Role | Signature | Date |
|-------------|--------------|-----------|------|
| **Shiman** | Product Owner & Frontend Lead | _________________ | _______ |
| **Ava** | Scrum Master & Backend Lead | _________________ | _______ |
| **Krish** | Lead Developer & Architecture | _________________ | _______ |
| **Elaine** | Full-Stack Developer & Visualization | _________________ | _______ |
| **Liron** | QA Lead & DevOps | _________________ | _______ |

---

## Appendix A: Key Dates and Deadlines

| Milestone | Description | Due Date | Owner | Status |
|-----------|-------------|----------|-------|--------|
| **Charter Approval** | Finalize and upload charter.md | End of Week 1 | Shiman | Pending |
| **Sprint 0 Complete** | User stories, domain model, use cases done | End of Week 1 | All | Pending |
| **Sprint 1 Complete** | Backend + DB + Extension scaffolding | End of Week 2 | Ava, Krish | Pending |
| **Sprint 2 Complete** | Dashboard + Integration working | End of Week 3 | Shiman, Elaine | Pending |
| **Sprint 3 Complete** | Reports + Notifications functional | Mid Week 4 | Ava, Liron | Pending |
| **Sprint 4 Complete** | Documentation + Demo ready | End of Week 4 | All | Pending |
| **v1.0 Release** | Tagged release in GitLab | End of Week 4 | Krish | Pending |
| **Demo Video Due** | Upload demo.mp4 to GitLab | End of Week 4 | Elaine | Pending |
| **Final Presentation** | Sprint review presentation | End of Week 4 | Shiman, Ava | Pending |

---

## Appendix B: GitLab Repository Structure

```
watcard-dashboard/
├── README.md                          # Setup instructions, project overview
├── .gitignore                         # Ignore node_modules, .env, etc.
├── .env.example                       # Example environment variables
├── docs/
│   ├── charter.md                     # This file
│   ├── user_stories.md                # Detailed user stories
│   ├── domain_model.md                # ER diagram and entity descriptions
│   ├── use_cases.md                   # Use case specifications
│   ├── test_plan.md                   # Testing strategy and test cases
│   ├── test_report.md                 # Test execution results
│   ├── user_manual.md                 # End-user guide with screenshots
│   ├── sprint_retrospectives.md       # Retro notes for all sprints
│   ├── review_presentation.pdf        # Final sprint review slides
│   ├── demo.mp4                       # Final demo video
│   └── api_documentation.md           # API endpoint reference
├── src/
│   ├── backend/
│   │   ├── server.js                  # Express app entry point
│   │   ├── config/
│   │   │   ├── database.js            # MySQL connection config
│   │   │   └── auth.js                # JWT config
│   │   ├── routes/
│   │   │   ├── auth.routes.js         # /api/auth endpoints
│   │   │   ├── transactions.routes.js # /api/transactions endpoints
│   │   │   ├── goals.routes.js        # /api/goals endpoints
│   │   │   └── reports.routes.js      # /api/reports endpoints
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── transactions.controller.js
│   │   │   ├── goals.controller.js
│   │   │   └── reports.controller.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── transaction.model.js
│   │   │   ├── goal.model.js
│   │   │   └── report.model.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js     # JWT validation
│   │   │   └── validation.middleware.js
│   │   └── utils/
│   │       ├── categoryMapper.js      # Map scraped data to categories
│   │       └── insightsGenerator.js   # Generate spending insights
│   ├── frontend/
│   │   ├── public/
│   │   │   └── index.html
│   │   ├── src/
│   │   │   ├── App.js
│   │   │   ├── index.js
│   │   │   ├── components/
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── Login.jsx
│   │   │   │   │   └── Register.jsx
│   │   │   │   ├── Dashboard/
│   │   │   │   │   ├── DashboardHome.jsx
│   │   │   │   │   ├── TransactionList.jsx
│   │   │   │   │   └── CategoryFilter.jsx
│   │   │   │   ├── Transactions/
│   │   │   │   │   └── AddManualTransaction.jsx
│   │   │   │   ├── Goals/
│   │   │   │   │   ├── GoalsList.jsx
│   │   │   │   │   ├── GoalCard.jsx
│   │   │   │   │   └── ProgressBar.jsx
│   │   │   │   ├── Charts/
│   │   │   │   │   ├── CategoryPieChart.jsx
│   │   │   │   │   ├── SpendingLineChart.jsx
│   │   │   │   │   └── GoalProgressBar.jsx
│   │   │   │   ├── Reports/
│   │   │   │   │   ├── MonthlyReportView.jsx
│   │   │   │   │   └── ReportsList.jsx
│   │   │   │   └── Shared/
│   │   │   │       ├── Header.jsx
│   │   │   │       ├── Sidebar.jsx
│   │   │   │       └── LoadingSpinner.jsx
│   │   │   ├── services/
│   │   │   │   ├── api.js             # Axios instance
│   │   │   │   ├── authService.js
│   │   │   │   ├── transactionService.js
│   │   │   │   └── goalService.js
│   │   │   ├── context/
│   │   │   │   └── AuthContext.js     # Global auth state
│   │   │   └── styles/
│   │   │       └── tailwind.css
│   │   └── package.json
│   └── extension/
│       ├── manifest.json               # Extension manifest V3
│       ├── popup/
│       │   ├── popup.html
│       │   ├── popup.js
│       │   └── popup.css
│       ├── content/
│       │   └── scraper.js              # Content script for scraping
│       ├── background/
│       │   └── background.js           # Service worker
│       └── icons/
│           ├── icon16.png
│           ├── icon48.png
│           └── icon128.png
├── tests/
│   ├── backend/
│   │   ├── auth.test.js
│   │   ├── transactions.test.js
│   │   ├── goals.test.js
│   │   └── reports.test.js
│   ├── frontend/
│   │   ├── components/
│   │   │   ├── Login.test.jsx
│   │   │   ├── DashboardHome.test.jsx
│   │   │   └── GoalCard.test.jsx
│   │   └── services/
│   │       └── authService.test.js
│   └── fixtures/
│       ├── mockUsers.js
│       ├── mockTransactions.js
│       └── sampleWatCardHTML.html      # For testing scraper
├── database/
│   ├── schema.sql                      # Database schema creation
│   ├── seed.sql                        # Sample data for testing
│   └── migrations/                     # Future: schema version migrations
├── build/                              # Compiled/built files (gitignored)
├── node_modules/                       # Dependencies (gitignored)
├── .gitlab-ci.yml                      # Optional: CI/CD pipeline config
├── package.json                        # Root dependencies
└── package-lock.json
```

---

## Appendix C: Glossary

- **Chrome Extension**: Browser add-on that runs in Google Chrome to scrape WatCard data
- **JSON**: JavaScript Object Notation, data format for transaction export
- **JWT**: JSON Web Token, authentication token format
- **MySQL**: Relational database management system
- **OAuth**: Open Authorization, third-party login protocol (e.g., Google login)
- **REST API**: Representational State Transfer Application Programming Interface
- **Scraping**: Extracting data from web pages programmatically
- **SMS**: Short Message Service, text messaging
- **WatCard**: University of Waterloo student ID card with meal plan functionality

---

## Document Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [Insert Date] | Shiman | Initial charter creation based on SE101 requirements |
| 1.1 | [Insert Date] | All | Team review and approval |

---

**Document Status**: Draft  
**Next Review Date**: End of Sprint 1  
**Approval Required From**: All team members + SE101 instructor (if applicable)

---

*This charter is a living document and may be updated as the project evolves. Major changes require team consensus and updated signatures. Minor clarifications can be made by the Product Owner with notification to the team.*