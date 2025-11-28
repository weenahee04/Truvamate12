# TruvaMate Lottery API Documentation

## API Overview

**Base URL:** `https://api.truvamate.com/v1`

**Authentication:** Bearer Token (JWT)

**Content-Type:** `application/json`

**Rate Limiting:** 
- Public endpoints: 100 requests/minute
- Authenticated endpoints: 1000 requests/minute

---

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Lottery Games](#lottery-games)
4. [Draws](#draws)
5. [Orders & Tickets](#orders--tickets)
6. [Payments](#payments)
7. [Results](#results)
8. [Notifications](#notifications)
9. [Profile & KYC](#profile--kyc)
10. [Admin APIs](#admin-apis)

---

## Authentication

### POST /auth/register
Register a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+66812345678",
  "date_of_birth": "1990-01-15",
  "country": "TH",
  "language": "TH",
  "terms_accepted": true
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-v4",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "status": "ACTIVE",
      "kyc_status": "PENDING"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

**Validation:**
- Email: Valid email format, unique
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- Phone: Valid international format
- Age: Must be 18+ years old

---

### POST /auth/login
User login

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-v4",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "wallet_balance": 150.00,
      "language": "TH",
      "kyc_status": "VERIFIED"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

---

### POST /auth/refresh
Refresh access token

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

---

### POST /auth/logout
Logout user (invalidate token)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST /auth/forgot-password
Request password reset

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### POST /auth/reset-password
Reset password with token

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "new_password": "NewSecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## User Management

### GET /users/me
Get current user profile

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+66812345678",
    "date_of_birth": "1990-01-15",
    "country": "TH",
    "language": "TH",
    "wallet_balance": 150.00,
    "kyc_status": "VERIFIED",
    "status": "ACTIVE",
    "created_at": "2024-01-01T00:00:00Z",
    "last_login": "2024-11-28T10:30:00Z"
  }
}
```

---

### PATCH /users/me
Update user profile

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone_number": "+66887654321",
  "language": "EN"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Smith",
    "phone_number": "+66887654321",
    "language": "EN",
    "updated_at": "2024-11-28T10:35:00Z"
  }
}
```

---

### POST /users/me/change-password
Change user password

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewPassword456!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### GET /users/me/wallet
Get wallet balance and transactions

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)
- `type` (string, optional): DEPOSIT, WITHDRAWAL, PURCHASE, REFUND, WINNINGS

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "balance": 150.00,
    "currency": "USD",
    "transactions": [
      {
        "id": "uuid-v4",
        "type": "DEPOSIT",
        "amount": 100.00,
        "balance_before": 50.00,
        "balance_after": 150.00,
        "status": "COMPLETED",
        "description": "Wallet top-up",
        "created_at": "2024-11-28T09:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 95,
      "items_per_page": 20
    }
  }
}
```

---

## Lottery Games

### GET /games
Get all available lottery games

**Query Parameters:**
- `is_active` (boolean, default: true)
- `country` (string, optional): Filter by country code

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "powerball",
      "name": "POWERBALL®",
      "country": "US",
      "main_numbers": {
        "min": 1,
        "max": 69,
        "count": 5
      },
      "power_numbers": {
        "min": 1,
        "max": 26,
        "count": 1,
        "label": "Powerball"
      },
      "base_price": 5.00,
      "currency": "USD",
      "draw_days": ["MON", "WED", "SAT"],
      "draw_time": "22:59:00",
      "sales_cutoff_hours": 2,
      "logo_color": "bg-gradient-to-br from-red-600 to-red-500",
      "next_draw": {
        "draw_id": "uuid-v4",
        "draw_date": "2024-11-30T22:59:00Z",
        "jackpot": 719000000.00,
        "sales_close": "2024-11-30T20:59:00Z",
        "time_remaining": "2d 21h 7m 20s"
      },
      "is_active": true
    },
    {
      "id": "megamillions",
      "name": "MEGA MILLIONS",
      "country": "US",
      "main_numbers": {
        "min": 1,
        "max": 70,
        "count": 5
      },
      "power_numbers": {
        "min": 1,
        "max": 25,
        "count": 1,
        "label": "Mega Ball"
      },
      "base_price": 5.00,
      "currency": "USD",
      "draw_days": ["TUE", "FRI"],
      "draw_time": "23:00:00",
      "sales_cutoff_hours": 2,
      "logo_color": "bg-gradient-to-br from-blue-600 to-blue-500",
      "next_draw": {
        "draw_id": "uuid-v4",
        "draw_date": "2024-11-29T23:00:00Z",
        "jackpot": 480000000.00,
        "sales_close": "2024-11-29T21:00:00Z",
        "time_remaining": "1d 14h 0m 0s"
      },
      "is_active": true
    }
  ]
}
```

---

### GET /games/{game_id}
Get specific lottery game details

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "powerball",
    "name": "POWERBALL®",
    "country": "US",
    "description": "America's most popular lottery game",
    "main_numbers": {
      "min": 1,
      "max": 69,
      "count": 5
    },
    "power_numbers": {
      "min": 1,
      "max": 26,
      "count": 1,
      "label": "Powerball"
    },
    "base_price": 5.00,
    "currency": "USD",
    "draw_days": ["MON", "WED", "SAT"],
    "draw_time": "22:59:00",
    "sales_cutoff_hours": 2,
    "odds": {
      "jackpot": "1 in 292,201,338",
      "match_5": "1 in 11,688,054",
      "match_4_plus_power": "1 in 913,129"
    },
    "prize_tiers": [
      {
        "tier": "JACKPOT",
        "match": "5 + Powerball",
        "prize": "Jackpot",
        "odds": "1 in 292,201,338"
      },
      {
        "tier": "MATCH_5",
        "match": "5",
        "prize": "$1,000,000",
        "odds": "1 in 11,688,054"
      }
    ],
    "next_draw": {
      "draw_id": "uuid-v4",
      "draw_date": "2024-11-30T22:59:00Z",
      "jackpot": 719000000.00,
      "sales_close": "2024-11-30T20:59:00Z"
    }
  }
}
```

---

## Draws

### GET /draws
Get scheduled and past draws

**Query Parameters:**
- `game_id` (string, optional)
- `status` (string, optional): SCHEDULED, CLOSED, DRAWN
- `from_date` (ISO date, optional)
- `to_date` (ISO date, optional)
- `page` (integer, default: 1)
- `limit` (integer, default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-v4",
      "game_id": "powerball",
      "game_name": "POWERBALL®",
      "draw_date": "2024-11-30T22:59:00Z",
      "jackpot": 719000000.00,
      "currency": "USD",
      "sales_close_date": "2024-11-30T20:59:00Z",
      "status": "SCHEDULED",
      "winning_numbers": null,
      "total_winners": 0
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_items": 200,
    "items_per_page": 20
  }
}
```

---

### GET /draws/{draw_id}
Get specific draw details

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "game_id": "powerball",
    "game_name": "POWERBALL®",
    "draw_date": "2024-11-27T22:59:00Z",
    "jackpot": 680000000.00,
    "currency": "USD",
    "sales_close_date": "2024-11-27T20:59:00Z",
    "status": "DRAWN",
    "winning_numbers": {
      "main": [5, 12, 33, 41, 58],
      "power": [12]
    },
    "result_announced_at": "2024-11-27T23:15:00Z",
    "total_winners": 3,
    "prize_breakdown": [
      {
        "tier": "JACKPOT",
        "winners": 0,
        "prize_per_winner": 680000000.00
      },
      {
        "tier": "MATCH_5",
        "winners": 2,
        "prize_per_winner": 1000000.00
      },
      {
        "tier": "MATCH_4_PLUS_POWER",
        "winners": 15,
        "prize_per_winner": 50000.00
      }
    ]
  }
}
```

---

### GET /draws/{draw_id}/results
Get draw results (public endpoint)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "draw_id": "uuid-v4",
    "game_name": "POWERBALL®",
    "draw_date": "2024-11-27T22:59:00Z",
    "winning_numbers": {
      "main": [5, 12, 33, 41, 58],
      "power": [12]
    },
    "jackpot": 680000000.00,
    "next_jackpot": 719000000.00,
    "next_draw_date": "2024-11-30T22:59:00Z"
  }
}
```

---

## Orders & Tickets

### POST /orders
Create a new order (purchase tickets)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "game_id": "powerball",
  "draw_id": "uuid-v4",
  "ticket_type": "STANDARD",
  "lines": [
    {
      "main_numbers": [5, 12, 33, 41, 58],
      "power_numbers": [12],
      "is_quick_pick": false
    },
    {
      "main_numbers": [2, 18, 21, 39, 40],
      "power_numbers": [5],
      "is_quick_pick": true
    }
  ],
  "promo_code": "WELCOME25"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid-v4",
      "order_number": "TR-8829-102",
      "game_id": "powerball",
      "game_name": "POWERBALL®",
      "draw_id": "uuid-v4",
      "draw_date": "2024-11-30T22:59:00Z",
      "ticket_type": "STANDARD",
      "total_lines": 2,
      "line_price": 5.00,
      "service_fee": 0.00,
      "discount": 2.50,
      "total_amount": 7.50,
      "currency": "USD",
      "status": "PENDING",
      "created_at": "2024-11-28T10:00:00Z"
    },
    "tickets": [
      {
        "id": "uuid-v4",
        "main_numbers": [5, 12, 33, 41, 58],
        "power_numbers": [12],
        "is_quick_pick": false,
        "status": "PENDING"
      },
      {
        "id": "uuid-v4",
        "main_numbers": [2, 18, 21, 39, 40],
        "power_numbers": [5],
        "is_quick_pick": true,
        "status": "PENDING"
      }
    ],
    "payment_required": true
  }
}
```

**Validation:**
- Draw must be in SCHEDULED status
- Sales must not be closed
- Numbers must be within valid range
- No duplicate numbers in main_numbers
- User must have sufficient balance OR proceed to payment

---

### GET /orders
Get user's orders

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (string, optional): PENDING, PAID, CONFIRMED
- `game_id` (string, optional)
- `from_date` (ISO date, optional)
- `to_date` (ISO date, optional)
- `page` (integer, default: 1)
- `limit` (integer, default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-v4",
      "order_number": "TR-8829-102",
      "game_id": "powerball",
      "game_name": "POWERBALL®",
      "draw_date": "2024-11-30T22:59:00Z",
      "total_lines": 2,
      "total_amount": 10.00,
      "currency": "USD",
      "status": "CONFIRMED",
      "paid_at": "2024-11-28T10:05:00Z",
      "confirmed_at": "2024-11-28T10:10:00Z",
      "created_at": "2024-11-28T10:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_items": 45,
    "items_per_page": 20
  }
}
```

---

### GET /orders/{order_id}
Get specific order details

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "order_number": "TR-8829-102",
    "game_id": "powerball",
    "game_name": "POWERBALL®",
    "draw_id": "uuid-v4",
    "draw_date": "2024-11-30T22:59:00Z",
    "ticket_type": "STANDARD",
    "total_lines": 2,
    "line_price": 5.00,
    "service_fee": 0.00,
    "discount": 0.00,
    "total_amount": 10.00,
    "currency": "USD",
    "status": "CONFIRMED",
    "payment_method": "CREDIT_CARD",
    "paid_at": "2024-11-28T10:05:00Z",
    "confirmed_at": "2024-11-28T10:10:00Z",
    "created_at": "2024-11-28T10:00:00Z",
    "tickets": [
      {
        "id": "uuid-v4",
        "main_numbers": [5, 12, 33, 41, 58],
        "power_numbers": [12],
        "is_quick_pick": false,
        "official_ticket_number": "US-PB-2024-1130-12345",
        "scanned_image_url": "https://cdn.truvamate.com/tickets/abc123.jpg",
        "status": "SCANNED",
        "scanned_at": "2024-11-28T11:00:00Z"
      }
    ]
  }
}
```

---

### GET /tickets
Get all user tickets

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (string, optional): PENDING, SCANNED, WIN, LOSE
- `game_id` (string, optional)
- `page` (integer, default: 1)
- `limit` (integer, default: 50)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-v4",
      "order_id": "uuid-v4",
      "order_number": "TR-8829-102",
      "game_id": "powerball",
      "game_name": "POWERBALL®",
      "draw_date": "2024-11-30T22:59:00Z",
      "main_numbers": [5, 12, 33, 41, 58],
      "power_numbers": [12],
      "is_quick_pick": false,
      "official_ticket_number": "US-PB-2024-1130-12345",
      "scanned_image_url": "https://cdn.truvamate.com/tickets/abc123.jpg",
      "status": "SCANNED",
      "win_amount": 0.00,
      "scanned_at": "2024-11-28T11:00:00Z",
      "checked_at": null,
      "created_at": "2024-11-28T10:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 89,
    "items_per_page": 50
  }
}
```

---

### GET /tickets/{ticket_id}
Get specific ticket details

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "order_id": "uuid-v4",
    "order_number": "TR-8829-102",
    "game_id": "powerball",
    "game_name": "POWERBALL®",
    "draw_id": "uuid-v4",
    "draw_date": "2024-11-27T22:59:00Z",
    "main_numbers": [5, 12, 33, 41, 58],
    "power_numbers": [12],
    "is_quick_pick": false,
    "official_ticket_number": "US-PB-2024-1127-12345",
    "scanned_image_url": "https://cdn.truvamate.com/tickets/abc123.jpg",
    "status": "WIN",
    "win_amount": 50000.00,
    "win_tier": "MATCH_4_PLUS_POWER",
    "scanned_at": "2024-11-27T12:00:00Z",
    "checked_at": "2024-11-27T23:30:00Z",
    "claimed_at": null,
    "draw_results": {
      "winning_numbers": {
        "main": [5, 12, 33, 41, 58],
        "power": [26]
      },
      "matches": {
        "main": 4,
        "power": 1
      }
    }
  }
}
```

---

### POST /tickets/quick-pick
Generate quick pick numbers

**Request Body:**
```json
{
  "game_id": "powerball",
  "count": 5
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "main_numbers": [5, 12, 33, 41, 58],
      "power_numbers": [12]
    },
    {
      "main_numbers": [2, 18, 21, 39, 40],
      "power_numbers": [5]
    },
    {
      "main_numbers": [7, 15, 28, 45, 67],
      "power_numbers": [19]
    }
  ]
}
```

---

## Payments

### POST /payments/deposit
Deposit funds to wallet

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "amount": 100.00,
  "currency": "USD",
  "payment_method": "CREDIT_CARD",
  "payment_details": {
    "card_token": "tok_visa_1234567890",
    "save_card": true
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "transaction_id": "uuid-v4",
    "amount": 100.00,
    "currency": "USD",
    "status": "PENDING",
    "payment_intent_id": "pi_1234567890",
    "redirect_url": null
  }
}
```

---

### POST /payments/orders/{order_id}
Pay for an order

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "payment_method": "WALLET",
  "use_wallet_balance": true
}
```

**or**

```json
{
  "payment_method": "CREDIT_CARD",
  "payment_details": {
    "card_token": "tok_visa_1234567890"
  }
}
```

**or**

```json
{
  "payment_method": "PROMPTPAY",
  "payment_details": {}
}
```

**Response:** `200 OK`

For Wallet payment:
```json
{
  "success": true,
  "data": {
    "order_id": "uuid-v4",
    "payment_status": "COMPLETED",
    "transaction_id": "uuid-v4",
    "new_wallet_balance": 140.00
  }
}
```

For PromptPay:
```json
{
  "success": true,
  "data": {
    "order_id": "uuid-v4",
    "payment_status": "PENDING",
    "payment_method": "PROMPTPAY",
    "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "qr_string": "00020101021129370016A000000677010111...",
    "amount": 10.00,
    "expires_at": "2024-11-28T10:15:00Z"
  }
}
```

---

### GET /payments/{transaction_id}
Get payment transaction status

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "type": "PURCHASE",
    "amount": 10.00,
    "currency": "USD",
    "status": "COMPLETED",
    "payment_method": "CREDIT_CARD",
    "order_id": "uuid-v4",
    "completed_at": "2024-11-28T10:05:00Z",
    "created_at": "2024-11-28T10:00:00Z"
  }
}
```

---

### POST /payments/withdraw
Request withdrawal

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "amount": 50.00,
  "withdrawal_method": "BANK_TRANSFER",
  "bank_details": {
    "bank_code": "BBL",
    "account_number": "1234567890",
    "account_name": "John Doe"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "transaction_id": "uuid-v4",
    "amount": 50.00,
    "status": "PENDING",
    "estimated_completion": "2024-11-30T10:00:00Z",
    "note": "Withdrawal will be processed within 2-3 business days"
  }
}
```

---

## Results

### GET /results
Get recent lottery results

**Query Parameters:**
- `game_id` (string, optional)
- `from_date` (ISO date, optional)
- `to_date` (ISO date, optional)
- `page` (integer, default: 1)
- `limit` (integer, default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "draw_id": "uuid-v4",
      "game_id": "powerball",
      "game_name": "POWERBALL®",
      "draw_date": "2024-11-27T22:59:00Z",
      "winning_numbers": {
        "main": [5, 12, 33, 41, 58],
        "power": [12]
      },
      "jackpot": 680000000.00,
      "currency": "USD",
      "total_winners": 3
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 50,
    "total_items": 1000,
    "items_per_page": 20
  }
}
```

---

### POST /results/check-ticket
Check if ticket is a winner (manual check)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "game_id": "powerball",
  "draw_id": "uuid-v4",
  "main_numbers": [5, 12, 33, 41, 58],
  "power_numbers": [12]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "is_winner": true,
    "prize_tier": "MATCH_4_PLUS_POWER",
    "prize_amount": 50000.00,
    "matches": {
      "main": 4,
      "power": 1
    },
    "winning_numbers": {
      "main": [5, 12, 33, 41, 58],
      "power": [26]
    }
  }
}
```

---

## Notifications

### GET /notifications
Get user notifications

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `is_read` (boolean, optional)
- `type` (string, optional): ORDER_CONFIRMED, TICKET_SCANNED, DRAW_RESULT, WINNER
- `page` (integer, default: 1)
- `limit` (integer, default: 50)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-v4",
      "type": "WINNER",
      "title": "Congratulations! You Won!",
      "message": "Your ticket for Powerball draw on Nov 27, 2024 won $50,000!",
      "data": {
        "ticket_id": "uuid-v4",
        "win_amount": 50000.00,
        "prize_tier": "MATCH_4_PLUS_POWER"
      },
      "is_read": false,
      "created_at": "2024-11-27T23:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_items": 47,
    "items_per_page": 50
  },
  "unread_count": 5
}
```

---

### PATCH /notifications/{notification_id}/read
Mark notification as read

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### POST /notifications/read-all
Mark all notifications as read

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## Profile & KYC

### POST /kyc/upload
Upload KYC documents

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `document_type`: PASSPORT | ID_CARD | DRIVER_LICENSE
- `document_number`: string
- `front_image`: file (max 10MB, jpg/png)
- `back_image`: file (optional, max 10MB, jpg/png)
- `selfie_image`: file (max 10MB, jpg/png)

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "document_type": "PASSPORT",
    "status": "PENDING",
    "submitted_at": "2024-11-28T10:00:00Z",
    "estimated_review_time": "24-48 hours"
  }
}
```

---

### GET /kyc/status
Get KYC verification status

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "kyc_status": "VERIFIED",
    "documents": [
      {
        "id": "uuid-v4",
        "document_type": "PASSPORT",
        "status": "APPROVED",
        "submitted_at": "2024-11-28T10:00:00Z",
        "verified_at": "2024-11-28T15:00:00Z"
      }
    ]
  }
}
```

---

## Admin APIs

### POST /admin/auth/login
Admin login

**Request Body:**
```json
{
  "email": "admin@truvamate.com",
  "password": "AdminPassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "uuid-v4",
      "email": "admin@truvamate.com",
      "full_name": "Admin User",
      "role": "ADMIN",
      "permissions": ["VIEW_USERS", "MANAGE_ORDERS", "VERIFY_KYC"]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 28800
  }
}
```

---

### GET /admin/users
Get all users (admin)

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `status` (string, optional)
- `kyc_status` (string, optional)
- `search` (string, optional): Search by name, email, phone
- `page` (integer, default: 1)
- `limit` (integer, default: 50)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-v4",
      "email": "user@example.com",
      "full_name": "John Doe",
      "phone_number": "+66812345678",
      "country": "TH",
      "wallet_balance": 150.00,
      "kyc_status": "VERIFIED",
      "status": "ACTIVE",
      "total_orders": 15,
      "total_spent": 750.00,
      "total_winnings": 125.00,
      "created_at": "2024-01-01T00:00:00Z",
      "last_login": "2024-11-28T10:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 100,
    "total_items": 5000,
    "items_per_page": 50
  }
}
```

---

### GET /admin/orders
Get all orders (admin)

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `status` (string, optional)
- `game_id` (string, optional)
- `user_id` (uuid, optional)
- `from_date` (ISO date, optional)
- `to_date` (ISO date, optional)
- `page` (integer, default: 1)
- `limit` (integer, default: 50)

**Response:** Similar to user orders endpoint with additional admin fields

---

### PATCH /admin/tickets/{ticket_id}/scan
Upload scanned ticket image (admin)

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data
```

**Request Body:**
- `official_ticket_number`: string
- `scanned_image`: file
- `notes`: string (optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "ticket_id": "uuid-v4",
    "status": "SCANNED",
    "official_ticket_number": "US-PB-2024-1130-12345",
    "scanned_image_url": "https://cdn.truvamate.com/tickets/abc123.jpg",
    "scanned_at": "2024-11-28T11:00:00Z"
  }
}
```

---

### POST /admin/draws/{draw_id}/results
Update draw results (admin)

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "winning_numbers": {
    "main": [5, 12, 33, 41, 58],
    "power": [12]
  },
  "jackpot_winners": 0,
  "result_announced_at": "2024-11-27T23:15:00Z"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "draw_id": "uuid-v4",
    "status": "DRAWN",
    "winning_numbers": {
      "main": [5, 12, 33, 41, 58],
      "power": [12]
    },
    "tickets_checked": 1250,
    "winners_found": 3,
    "total_payout": 1125000.00
  }
}
```

---

### PATCH /admin/kyc/{document_id}/verify
Verify or reject KYC document (admin)

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "status": "APPROVED",
  "notes": "Document verified successfully"
}
```

**or**

```json
{
  "status": "REJECTED",
  "rejection_reason": "Document image is unclear, please resubmit"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "document_id": "uuid-v4",
    "user_id": "uuid-v4",
    "status": "APPROVED",
    "verified_at": "2024-11-28T15:00:00Z"
  }
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "email",
      "reason": "Email already exists"
    }
  }
}
```

### Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | INVALID_REQUEST | Invalid request parameters |
| 401 | UNAUTHORIZED | Missing or invalid authentication token |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource conflict (duplicate) |
| 422 | VALIDATION_ERROR | Validation failed |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Internal server error |

### Specific Error Codes

- `EMAIL_EXISTS`: Email already registered
- `INVALID_CREDENTIALS`: Invalid email or password
- `TOKEN_EXPIRED`: JWT token expired
- `INSUFFICIENT_BALANCE`: Not enough wallet balance
- `SALES_CLOSED`: Ticket sales closed for this draw
- `INVALID_NUMBERS`: Invalid lottery numbers selected
- `ORDER_ALREADY_PAID`: Order already paid
- `KYC_REQUIRED`: KYC verification required for this action
- `PAYMENT_FAILED`: Payment processing failed

---

## Webhooks

### POST {webhook_url}
Webhook notifications for various events

**Headers:**
```
X-TruvaMate-Signature: hmac-sha256-signature
Content-Type: application/json
```

**Event Types:**

#### order.confirmed
```json
{
  "event": "order.confirmed",
  "timestamp": "2024-11-28T10:10:00Z",
  "data": {
    "order_id": "uuid-v4",
    "order_number": "TR-8829-102",
    "user_id": "uuid-v4",
    "total_amount": 10.00,
    "status": "CONFIRMED"
  }
}
```

#### ticket.scanned
```json
{
  "event": "ticket.scanned",
  "timestamp": "2024-11-28T11:00:00Z",
  "data": {
    "ticket_id": "uuid-v4",
    "order_id": "uuid-v4",
    "user_id": "uuid-v4",
    "official_ticket_number": "US-PB-2024-1130-12345",
    "scanned_image_url": "https://cdn.truvamate.com/tickets/abc123.jpg"
  }
}
```

#### ticket.winner
```json
{
  "event": "ticket.winner",
  "timestamp": "2024-11-27T23:30:00Z",
  "data": {
    "ticket_id": "uuid-v4",
    "user_id": "uuid-v4",
    "game_name": "POWERBALL®",
    "prize_tier": "MATCH_4_PLUS_POWER",
    "win_amount": 50000.00
  }
}
```

---

## Rate Limiting

**Headers returned:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1701172800
```

When rate limit exceeded:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 60
  }
}
```

---

## API Versioning

Current version: `v1`

Version is specified in the base URL: `https://api.truvamate.com/v1`

Future versions will be available at: `https://api.truvamate.com/v2`

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import TruvaMate from 'truvamate-sdk';

const client = new TruvaMate({
  apiKey: 'your-api-key',
  environment: 'production' // or 'sandbox'
});

// Login
const { user, token } = await client.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Get games
const games = await client.games.list();

// Create order
const order = await client.orders.create({
  gameId: 'powerball',
  drawId: 'uuid-v4',
  lines: [
    { mainNumbers: [5, 12, 33, 41, 58], powerNumbers: [12] }
  ]
});
```

### Python
```python
from truvamate import TruvaMate

client = TruvaMate(
    api_key='your-api-key',
    environment='production'
)

# Login
user, token = client.auth.login(
    email='user@example.com',
    password='password'
)

# Get games
games = client.games.list()

# Create order
order = client.orders.create(
    game_id='powerball',
    draw_id='uuid-v4',
    lines=[
        {'main_numbers': [5, 12, 33, 41, 58], 'power_numbers': [12]}
    ]
)
```

---

## Testing

**Sandbox Environment:** `https://api-sandbox.truvamate.com/v1`

**Test Credentials:**
- Email: `test@truvamate.com`
- Password: `Test123!`

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Insufficient Funds: `4000 0000 0000 9995`

---

## Support

- Email: api-support@truvamate.com
- Documentation: https://docs.truvamate.com
- Status Page: https://status.truvamate.com
