# API Documentation: Personal Budgeting SaaS

## Authentication
`POST /api/auth/request-otp`
- Body: `{ "email": "user@example.com" }`
- Response: `200 OK`

`POST /api/auth/verify-otp`
- Body: `{ "email": "user@example.com", "otp": "123456" }`
- Response: `200 OK` with JWT token and user info.

## Categories
`GET /api/categories` - List user categories
`POST /api/categories` - Create new category
`PUT /api/categories/{id}` - Update category
`DELETE /api/categories/{id}` - Delete category

## Budgets
`GET /api/budgets/current?month=3&year=2026` - Get monthly budget
`GET /api/budgets/history` - List all past budgets
`POST /api/budgets` - Create or update monthly budget

## Expenses
`GET /api/expenses` - List all expenses
`POST /api/expenses` - Add new expense (Triggers Government Mode check)
`PUT /api/expenses/{id}` - Update expense
`DELETE /api/expenses/{id}` - Delete expense

## Dashboard
`GET /api/dashboard/summary?month=3&year=2026` - Get summary analytics
