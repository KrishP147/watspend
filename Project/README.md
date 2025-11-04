SE101 Team Project – To-Do App Evolution
Student teams will devise, design, develop, debug, and demo a significant software project using Scrum in GitLab.
All deliverables live in this GitLab repository.


Project Options


Extend the To-Do App into a full web application (web-accessible, persistent data).

Extend the To-Do App into a full Android app (Teams 1–23 only).

Propose your own project → Must be approved via docs/charter.md.



Required Deliverables & Grading



%
Deliverable
Path
Stance




5%
Project Charter
docs/charter.md
Formal agreement on scope, team roles, and success criteria.


10%
Product & Sprint Backlogs
GitLab Issue Boards

Live, groomed boards showing prioritized stories and sprint commitments.


10%
Requirements & Design

docs/user_stories.md, docs/domain_model.md, docs/use_cases.md

Clear, traceable user needs and system structure.


15%
Source Code & Build

src/, build/ (if needed)
Clean, versioned, buildable code with tagged v1.0 release.


10%
Tests & Results

docs/test_plan.md tests/, docs/test_report.md

Automated tests with execution proof and coverage ≥70%.


5%
User Manual
docs/user_manual.md
Simple guide for end-users to operate the app.


10%
Final Video Demo
docs/demo.mp4
2–4 min walkthrough of all user stories in action.


10%
Final Sprint Review

docs/review_presentation.pdf + live demo
Summary of increment, velocity, and stakeholder feedback.


10%
Sprint Retrospectives
docs/sprint_retrospectives.md
Reflections per sprint on process and improvements.


10%
Weekly Progress & Git Hygiene
Commits, issues, boards
Consistent activity, meaningful messages, and backlog updates.


5%
README & Setup Guide
README.md
Reproducible instructions to run the app from scratch.




Total: 100%



Directory Structure (Required)

.
├── README.md                  ← This file (setup + overview)
├── docs/
│   ├── charter.md
│   ├── user_stories.md
│   ├── domain_model.md
│   ├── use_cases.md
│   ├── test_report.md
│   ├── user_manual.md
│   ├── sprint_retrospectives.md
│   ├── review_presentation.pdf
│   └── demo.mp4               ← Final demo video
├── src/                       ← All source code
├── tests/                     ← Unit + integration tests
├── build/                     ← Optional: compiled output
└── .gitlab-ci.yml             ← Optional: CI pipeline (bonus)




GitLab Setup

Use Issue Boards under Plan > Issue boards

One board: Product Backlog (label: backlog)
One board per sprint: Sprint 1, Sprint 2, etc. (use Milestones or Iterations)


Label issues: type::story, type::bug, priority::high, sprint::1, etc.
Tag final release: git tag v1.0 && git push origin v1.0