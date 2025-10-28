# Lab 5 Setup Instructions - Team 10

## Quick Start Guide

### 1. Install Dependencies
```bash
cd To-Do-App
pip install -r build/requirements.txt
```

### 2. Configure Your Database Connection

**⚠️ Each team member must create their own `.env` file with their credentials:**
```bash
# From To-Do-App directory
cp build/.env.example .env
```

Edit your `.env` file with **YOUR personal credentials**:
```
DB_HOST=riku.shoshin.uwaterloo.ca
DB_DATABASE=SE101_Team_10
DB_USER=your_uwaterloo_userid
DB_PASSWORD=your_database_password
```

**🔒 SECURITY NOTES:**
- `.env` contains YOUR personal database credentials
- `.env` is in `.gitignore` - it will NOT be committed to Git
- **NEVER commit your `.env` file** or share your password
- Each team member has their own `.env` file with their own credentials
- Keep your password private!

### 3. Test Database Connection
```bash
cd src
python code.py
```

**Expected output:**
```
Testing database connection...
✓ Successfully connected to MySQL database
✓ ToDoData table is ready with userid field
✓ Connection closed
```

If you see errors, check your `.env` file credentials.

### 4. Run Flask Web App (After Implementation)
```bash
cd src
python app.py
```

Visit: http://localhost:5000

### 5. Run Tests
```bash
# From To-Do-App directory
cd tests
pytest

# With coverage
pytest --cov=../src --cov-report=html

# Run specific test file
pytest test_code.py -v
```

---

## Project Structure
```
To-Do-App/
├── build/                # Setup & infrastructure files
│   ├── README.md         # This file - setup instructions
│   ├── requirements.txt  # Python package dependencies
│   └── .env.example      # Template for database configuration
│
├── docs/                 # Project documentation
│   ├── charter.md        # Project charter
│   ├── requirements.md   # Functional requirements
│   ├── test_plan.md      # Test strategy and plan
│   └── test_report.md    # Test results (after testing)
│
├── src/                  # Source code
│   ├── code.py           # Core To-Do functions
│   └── app.py            # Flask web application
│
├── tests/                # Test suite
│   ├── test_code.py      # Unit and integration tests
│   ├── conftest.py       # Pytest configuration (if needed)
│   └── pytest.ini        # Pytest settings (if needed)
│
├── templates/            # HTML templates for Flask
│   └── (HTML files here)
│
├── static/               # CSS/JS files for web interface
│   └── (CSS/JS files here)
│
├── .env                  # YOUR credentials (NOT committed)
└── .gitignore            # Files to ignore in Git
```

---

## Work Assignments

See GitLab Issues #2-9 for function assignments:
- **Issue #2**: add() function
- **Issue #3**: update() function
- **Issue #4**: delete() function
- **Issue #5**: next() function
- **Issue #6**: today() function
- **Issue #7**: tomorrow() function
- **Issue #8**: Flask web interface
- **Issue #9**: Test suite

issue-#2-add-function
issue-#3-update-function
issue-#4-delete-function
issue-#5-next-function
issue-#6-today-function
issue-#7-tomorrow-function
issue-#8-flask-interface
issue-#9-test-suite

---

## Git Workflow

### For Function Implementation (Issues #2-7):
```bash
# 1. Pull latest from main Lab 5 branch
git checkout issue-#1-todo-app-lab5
git pull origin issue-#1-todo-app-lab5

# 2. Create YOUR sub-branch for your function
git checkout -b issue-#2-add-function  # (example for add function)

# 3. Implement your function in src/code.py

# 4. Test locally
cd src
python code.py  # Test connection
cd ../tests
pytest  # Run tests

# 5. Commit and push
git add src/code.py
git commit -m "Implement add() function with userid support"
git push -u origin issue-#2-add-function

# 6. Create Merge Request on GitLab
#    - Source: issue-#2-add-function
#    - Target: issue-#1-todo-app-lab5
#    - Assign reviewer from team
```

### For Testing (Issue #9):
```bash
# Create test branch
git checkout issue-#1-todo-app-lab5
git checkout -b issue-#9-test-suite

# Implement tests in tests/test_code.py
# Create test plan in docs/test_plan.md
# Run tests and create test report in docs/test_report.md

# Commit and create MR to issue-#1-todo-app-lab5
```

---

## Testing Approaches

We use **two types of tests**:

### 1. **Unit Tests with Mocks** (Fast)
- Use pytest with mock database connections
- Test function logic without real database
- Run quickly in CI/CD
- Good for testing edge cases

### 2. **Integration Tests with Real Database** (Thorough)
- Use unittest with real database connection
- Test actual SQL queries work
- Catch SQL syntax errors
- Use setup/teardown to clean test data

**Both approaches are important!** Issue #9 implements both.

---

## Important Reminders

✅ **Always pull before creating sub-branches**
✅ **Test locally before pushing**
✅ **Create MRs to `issue-#1-todo-app-lab5`, NOT to main**
✅ **Assign reviewers from team**
✅ **Never commit `.env` file**
✅ **Use descriptive commit messages**
