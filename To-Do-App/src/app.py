#code for flask app here (branch 8)

# do all the following tests in branch 9: 

# Test plan document in docs/test_plan.md
# All test cases in tests/test_todo.py
# Test for all 6 functions
# Test for Flask routes

# adding basic flask app code below (branch 1 + sub branches)

#!/usr/bin/env python3
"""Flask web application - TODO: Implement"""
from flask import Flask

app = Flask(__name__)

@app.route('/')
def index():
    return "To-Do App - Under Construction"

if __name__ == '__main__':
    app.run(debug=True)