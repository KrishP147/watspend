# Team Project Repo

In this repo there are two subdirectories:

1. To-Do-App
2. Project

In the To-Do-App directory you are required to
1. Create a project charter for a web-access To-Do-App. Place it in `charter.md`
   in the docs directory.
2. Create requirements for functions:
   a. add()
   b. update()
   c. delete()
   d. next()
   e. today()
   f. tomorrow()
   where all changes in the To-Do list are reflected in the database.  Since we
   are headed toward having a web-accessible version of this To-Do App, you will
   want to add a userid to the task table.  For now, though, security can be
   left at the level of "whichever userid is logged into the database server
   will be the userid for the To-Do list" though this will affect the SQL query
   necessary to access only that user's tasks:

	SELECT ... AND userid = '...";
   
3. We wish to work toward a web-accessible version of this application.
   Initiallly we do this as a "local-only" web setup (the web server will be on
   your local machine and running as a python application).  To do this, install
   the python web framework: 

	pip install flask

4. Using your favourite LLMs, work out how to add in the web functionality.

5. Create an appropriate test plan and testcases for this.

When doing this work, you are required to:

0. Create an issue and branch for this work.  For individual functions, tests,
   *etc.* you should create subbranches from that branch.
1. Have each team member work on one of the functions, within their own subbranch.
2. Have a separate team member create the test cases for that functions.
3. Have a third team member require the merge request, approving or not, as they
   see fit. If not approved, the dev and tester should fix things until it is
   approved.
4. When all functions and tests are complete and merged into your To-Do-App
   branch, issue a Merge Request and assign it to `d3feng`.

In the Project directory, options are as follows:

1. Extend the To-Do-App to make it a fully featured web application.  Note that
   there will be some additional work within the labs in this space, though only
   with respect to making it a fully web-accessible web application, rather than
   local only.
2. Extend the To-Do-App to make it a fully featured Android application (only
   Teams 1-23)
3. Propose a project of your own devising.  This must be approved by the SE101
   instruction team.

Discuss in your team your ideas, and within the `Projects/docs` directory write
a `charter.md` file with the project you are proposing.

