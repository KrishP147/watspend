# Database Setup Instructions

## Environment Variables

Create a `.env` file in the project root with the following:

```bash
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_DATABASE=watcard_dashboard

**Important:** Never commit `.env` to git! It should be in `.gitignore` (I put it in there, but please make sure)

