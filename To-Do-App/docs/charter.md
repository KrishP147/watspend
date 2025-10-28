# Project Charter: Web-Accessible To-Do Application

## 1. Project Title
**Web-Accessible To-Do Application**

## 2. Project Overview
The goal of this project is to develop a lightweight, web-accessible To-Do List application using Python and the Flask web framework. The application will allow users to create, update, delete, and view tasks through a web interface. Each task will be associated with a specific `userid`, ensuring that users only see their own tasks.

Initially, the web server will run locally on each user’s machine. Future iterations may extend functionality to a fully accessible online web application.

## 3. Project Objectives
- Implement a functioning To-Do list with full CRUD (Create, Read, Update, Delete) capabilities.
- Store all task data in a database, ensuring persistence and consistency.
- Add a `userid` field to support multi-user access.
- Create a local Flask-based web interface to interact with the To-Do list.
- Develop and execute a structured testing plan to verify core functionality.
- Use GitLab branching workflows and Merge Requests for proper collaboration.

## 4. Scope
### In Scope
- Command and web-based interaction with the To-Do list.
- User task management:  
  - `add()` – Add a task to the list  
  - `update()` – Modify an existing task  
  - `delete()` – Remove a task  
  - `next()` – View upcoming task(s)  
  - `today()` – View today’s tasks  
  - `tomorrow()` – View tomorrow’s tasks
- Database integration with task persistence.
- Basic userid-based task filtering in queries.
- Local Flask server setup and integration with backend functions.
- Automated test cases for each function.

### Out of Scope
- Authentication and advanced security features.
- Deployment on remote or production web servers.
- Mobile application development (may be a future extension).

## 5. Stakeholders
| Role            | Name / Group           | Responsibilities                              |
| --------------- | ---------------------- | --------------------------------------------- |
| Project Sponsor | SE101 Instruction Team | Approve project charter and final deliverable |

## 6. Deliverables
- Flask-based local web application for managing tasks
- SQL-based database with `userid` task filtering
- Fully implemented and tested core functions (`add`, `update`, `delete`, `next`, `today`, `tomorrow`)
- Automated unit test cases and test plan
- `charter.md` and project documentation in `docs/`
- Proper GitLab branching structure and approved merge requests

## 7. Technology Stack
- **Language:** Python  
- **Framework:** Flask  
- **Database:** MySQL 
- **Version Control:** Git (GitLab)  
- **Testing:** Pytest  

## 8. Roles and Responsibilities
| Team Member | Function Responsibility | Testing Responsibility | MR Reviewer  |
| ----------- | ----------------------- | ---------------------- | ------------ |
| Shiman      | `add()`                 | Test `update()`        | `delete()`   |
| Elaine      | `update()`              | Test `add()`           | `add()`      |
| Liron       | `delete()`              | Test `today()`         | `update()`   |
| Ava         | `today()`               | Test `tomorrow()`      | `next()`     |
| Krish       | `tomorrow()`            | Test `next()`          | `today()`    |
| Krish       | `next()`                | Test `add()`           | `tomorrow()` |


## 9. Milestones and Timeline
| Milestone               | Description                                         | Due Date  |
| ----------------------- | --------------------------------------------------- | --------- |
| Charter Completion      | Finalize and upload `charter.md`                    | Monday    |
| Function Implementation | Each team member implements their assigned function | Tuesday   |
| Testing                 | Test cases written and run                          | Wednesday |
| Code Review and Merging | Merge requests reviewed, fixed, and approved        | Thursday  |
| Local Flask Integration | Frontend connected to backend functions             | Friday    |
| Final Submission        | All work merged, project delivered to sponsor       | Saturday  |

## 10. Risk Assessment
| Risk                               | Impact | Likelihood | Mitigation Strategy                                               |
| ---------------------------------- | ------ | ---------- | ----------------------------------------------------------------- |
| Merge conflicts                    | Medium | High       | Use feature branches, frequent commits, and timely merge requests |
| Delayed implementation by a member | High   | Medium     | Redistribute tasks early, maintain team communication             |
| Flask integration errors           | Medium | Medium     | Incremental integration with testing                              |
| Database inconsistencies           | High   | Low        | Use consistent schema and test queries early                      |

## 11. Approval
By approving this charter, all team members agree to:
- Follow the defined branching and review workflow
- Complete assigned functions and tests on time
- Collaborate and communicate effectively to meet project milestones

| Name   | Signature | Date       |
| ------ | --------- | ---------- |
| Shiman | Shiman    | 10/28/2025 |
| Ava    |           |            |
| Krish  | Krish     | 10/28/2025 |
| Elaine |           |            |
| Liron  | Liron     | 10/28/2025 |

---
