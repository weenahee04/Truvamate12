# TruvaMate Lottery Database Schema

## Database Design Overview
This document outlines the database schema for TruvaMate Lottery Messenger platform.

---

## Tables

### 1. users
User authentication and profile information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| first_name | VARCHAR(100) | NOT NULL | User's first name |
| last_name | VARCHAR(100) | NOT NULL | User's last name |
| phone_number | VARCHAR(20) | UNIQUE | Phone number |
| date_of_birth | DATE | NOT NULL | User's date of birth |
| country | VARCHAR(2) | NOT NULL | Country code (ISO 3166-1 alpha-2) |
| language | VARCHAR(2) | DEFAULT 'EN' | Preferred language (EN, TH) |
| wallet_balance | DECIMAL(10,2) | DEFAULT 0.00 | User's wallet balance |
| kyc_status | ENUM | DEFAULT 'PENDING' | KYC verification status (PENDING, VERIFIED, REJECTED) |
| status | ENUM | DEFAULT 'ACTIVE' | Account status (ACTIVE, SUSPENDED, DELETED) |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |
| last_login | TIMESTAMP | NULL | Last login timestamp |

**Indexes:**
- `idx_users_email` on email
- `idx_users_phone` on phone_number
- `idx_users_status` on status

---

### 2. lottery_games
Available lottery games configuration

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(50) | PRIMARY KEY | Game identifier (powerball, megamillions) |
| name | VARCHAR(100) | NOT NULL | Game display name |
| country | VARCHAR(2) | NOT NULL | Country code where game is operated |
| main_numbers_min | INT | NOT NULL | Minimum value for main numbers |
| main_numbers_max | INT | NOT NULL | Maximum value for main numbers |
| main_numbers_count | INT | NOT NULL | Count of main numbers to select |
| power_numbers_min | INT | NOT NULL | Minimum value for power number |
| power_numbers_max | INT | NOT NULL | Maximum value for power number |
| power_numbers_count | INT | DEFAULT 1 | Count of power numbers to select |
| base_price | DECIMAL(10,2) | NOT NULL | Base price per line |
| currency | VARCHAR(3) | DEFAULT 'USD' | Currency code (ISO 4217) |
| draw_days | JSON | NOT NULL | Array of draw days ['MON', 'WED', 'SAT'] |
| draw_time | TIME | NOT NULL | Draw time (UTC) |
| sales_cutoff_hours | INT | DEFAULT 2 | Hours before draw when sales close |
| is_active | BOOLEAN | DEFAULT true | Whether game is currently active |
| logo_color | VARCHAR(50) | NULL | CSS class for game logo color |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_lottery_games_active` on is_active
- `idx_lottery_games_country` on country

---

### 3. lottery_draws
Scheduled and completed lottery draws

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Draw identifier |
| game_id | VARCHAR(50) | FOREIGN KEY | Reference to lottery_games.id |
| draw_date | TIMESTAMP | NOT NULL | Scheduled draw date and time |
| jackpot_amount | DECIMAL(15,2) | NOT NULL | Current jackpot amount |
| currency | VARCHAR(3) | DEFAULT 'USD' | Currency code |
| sales_close_date | TIMESTAMP | NOT NULL | When ticket sales close |
| status | ENUM | DEFAULT 'SCHEDULED' | Draw status (SCHEDULED, CLOSED, DRAWN, CANCELLED) |
| winning_main_numbers | JSON | NULL | Array of winning main numbers |
| winning_power_numbers | JSON | NULL | Array of winning power numbers |
| result_announced_at | TIMESTAMP | NULL | When results were announced |
| total_winners | INT | DEFAULT 0 | Total number of winners |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_draws_game_date` on (game_id, draw_date)
- `idx_draws_status` on status
- `idx_draws_sales_close` on sales_close_date

---

### 4. orders
User ticket purchase orders

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Order identifier |
| order_number | VARCHAR(50) | UNIQUE, NOT NULL | Human-readable order number (TR-XXXX-XXX) |
| user_id | UUID | FOREIGN KEY | Reference to users.id |
| game_id | VARCHAR(50) | FOREIGN KEY | Reference to lottery_games.id |
| draw_id | UUID | FOREIGN KEY | Reference to lottery_draws.id |
| ticket_type | ENUM | NOT NULL | Ticket type (STANDARD, SYNDICATE, BUNDLE) |
| total_lines | INT | NOT NULL | Number of lines in order |
| line_price | DECIMAL(10,2) | NOT NULL | Price per line |
| service_fee | DECIMAL(10,2) | DEFAULT 0.00 | Service fee |
| discount | DECIMAL(10,2) | DEFAULT 0.00 | Discount applied |
| total_amount | DECIMAL(10,2) | NOT NULL | Total order amount |
| currency | VARCHAR(3) | DEFAULT 'USD' | Currency code |
| status | ENUM | DEFAULT 'PENDING' | Order status (PENDING, PAID, PROCESSING, CONFIRMED, FAILED, REFUNDED) |
| payment_method | VARCHAR(50) | NULL | Payment method used |
| payment_id | VARCHAR(255) | NULL | Payment gateway transaction ID |
| paid_at | TIMESTAMP | NULL | Payment completion timestamp |
| confirmed_at | TIMESTAMP | NULL | Order confirmation timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Order creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_orders_user` on user_id
- `idx_orders_status` on status
- `idx_orders_draw` on draw_id
- `idx_orders_order_number` on order_number

---

### 5. tickets
Individual lottery tickets (lines) in an order

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Ticket identifier |
| order_id | UUID | FOREIGN KEY | Reference to orders.id |
| user_id | UUID | FOREIGN KEY | Reference to users.id |
| game_id | VARCHAR(50) | FOREIGN KEY | Reference to lottery_games.id |
| draw_id | UUID | FOREIGN KEY | Reference to lottery_draws.id |
| main_numbers | JSON | NOT NULL | Array of selected main numbers |
| power_numbers | JSON | NOT NULL | Array of selected power numbers |
| is_quick_pick | BOOLEAN | DEFAULT false | Whether numbers were randomly generated |
| official_ticket_number | VARCHAR(100) | NULL | Official ticket number from lottery operator |
| scanned_image_url | VARCHAR(500) | NULL | URL to scanned physical ticket image |
| status | ENUM | DEFAULT 'PENDING' | Ticket status (PENDING, PURCHASED, SCANNED, CHECKED, WIN, LOSE, CLAIMED) |
| win_amount | DECIMAL(10,2) | DEFAULT 0.00 | Winning amount if applicable |
| win_tier | VARCHAR(50) | NULL | Prize tier (JACKPOT, MATCH_5, MATCH_4, etc.) |
| scanned_at | TIMESTAMP | NULL | When physical ticket was scanned |
| checked_at | TIMESTAMP | NULL | When ticket was checked against results |
| claimed_at | TIMESTAMP | NULL | When winnings were claimed |
| created_at | TIMESTAMP | DEFAULT NOW() | Ticket creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_tickets_order` on order_id
- `idx_tickets_user` on user_id
- `idx_tickets_draw` on draw_id
- `idx_tickets_status` on status

---

### 6. transactions
Financial transactions (deposits, withdrawals, winnings)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Transaction identifier |
| user_id | UUID | FOREIGN KEY | Reference to users.id |
| order_id | UUID | FOREIGN KEY, NULL | Reference to orders.id if related to order |
| ticket_id | UUID | FOREIGN KEY, NULL | Reference to tickets.id if related to winnings |
| type | ENUM | NOT NULL | Transaction type (DEPOSIT, WITHDRAWAL, PURCHASE, REFUND, WINNINGS, CASHBACK) |
| amount | DECIMAL(10,2) | NOT NULL | Transaction amount |
| currency | VARCHAR(3) | DEFAULT 'USD' | Currency code |
| balance_before | DECIMAL(10,2) | NOT NULL | Wallet balance before transaction |
| balance_after | DECIMAL(10,2) | NOT NULL | Wallet balance after transaction |
| status | ENUM | DEFAULT 'PENDING' | Transaction status (PENDING, COMPLETED, FAILED, CANCELLED) |
| payment_method | VARCHAR(50) | NULL | Payment method used |
| payment_gateway_id | VARCHAR(255) | NULL | Payment gateway transaction ID |
| description | TEXT | NULL | Transaction description |
| metadata | JSON | NULL | Additional transaction metadata |
| completed_at | TIMESTAMP | NULL | Transaction completion timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Transaction creation timestamp |

**Indexes:**
- `idx_transactions_user` on user_id
- `idx_transactions_type` on type
- `idx_transactions_status` on status
- `idx_transactions_created` on created_at

---

### 7. promotions
Promotional campaigns and offers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Promotion identifier |
| code | VARCHAR(50) | UNIQUE | Promo code |
| name | VARCHAR(200) | NOT NULL | Promotion name |
| description | TEXT | NULL | Promotion description |
| type | ENUM | NOT NULL | Promotion type (DISCOUNT, CASHBACK, FREE_LINES, BONUS) |
| discount_type | ENUM | NULL | Discount type (PERCENTAGE, FIXED_AMOUNT) |
| discount_value | DECIMAL(10,2) | NULL | Discount value |
| min_purchase | DECIMAL(10,2) | DEFAULT 0.00 | Minimum purchase amount |
| max_discount | DECIMAL(10,2) | NULL | Maximum discount cap |
| applicable_games | JSON | NULL | Array of game IDs (null = all games) |
| start_date | TIMESTAMP | NOT NULL | Promotion start date |
| end_date | TIMESTAMP | NOT NULL | Promotion end date |
| usage_limit | INT | NULL | Total usage limit (null = unlimited) |
| usage_per_user | INT | DEFAULT 1 | Usage limit per user |
| is_active | BOOLEAN | DEFAULT true | Whether promotion is active |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_promotions_code` on code
- `idx_promotions_dates` on (start_date, end_date)
- `idx_promotions_active` on is_active

---

### 8. promotion_usage
Track promotion code usage

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Usage record identifier |
| promotion_id | UUID | FOREIGN KEY | Reference to promotions.id |
| user_id | UUID | FOREIGN KEY | Reference to users.id |
| order_id | UUID | FOREIGN KEY | Reference to orders.id |
| discount_applied | DECIMAL(10,2) | NOT NULL | Discount amount applied |
| used_at | TIMESTAMP | DEFAULT NOW() | Usage timestamp |

**Indexes:**
- `idx_promotion_usage_promotion` on promotion_id
- `idx_promotion_usage_user` on user_id

---

### 9. notifications
User notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Notification identifier |
| user_id | UUID | FOREIGN KEY | Reference to users.id |
| type | ENUM | NOT NULL | Notification type (ORDER_CONFIRMED, TICKET_SCANNED, DRAW_RESULT, WINNER, PROMOTION, SYSTEM) |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| data | JSON | NULL | Additional notification data |
| is_read | BOOLEAN | DEFAULT false | Whether notification was read |
| read_at | TIMESTAMP | NULL | When notification was read |
| created_at | TIMESTAMP | DEFAULT NOW() | Notification creation timestamp |

**Indexes:**
- `idx_notifications_user` on user_id
- `idx_notifications_read` on (user_id, is_read)

---

### 10. kyc_documents
KYC verification documents

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Document identifier |
| user_id | UUID | FOREIGN KEY | Reference to users.id |
| document_type | ENUM | NOT NULL | Document type (PASSPORT, ID_CARD, DRIVER_LICENSE, PROOF_OF_ADDRESS) |
| document_number | VARCHAR(100) | NULL | Document number |
| front_image_url | VARCHAR(500) | NOT NULL | URL to front image |
| back_image_url | VARCHAR(500) | NULL | URL to back image |
| selfie_image_url | VARCHAR(500) | NULL | URL to selfie image |
| status | ENUM | DEFAULT 'PENDING' | Verification status (PENDING, APPROVED, REJECTED) |
| rejection_reason | TEXT | NULL | Reason for rejection |
| verified_by | UUID | FOREIGN KEY, NULL | Admin user who verified |
| verified_at | TIMESTAMP | NULL | Verification timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Upload timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_kyc_user` on user_id
- `idx_kyc_status` on status

---

### 11. admin_users
Administrator accounts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Admin user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Admin email |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| full_name | VARCHAR(200) | NOT NULL | Admin full name |
| role | ENUM | NOT NULL | Admin role (SUPER_ADMIN, ADMIN, SUPPORT, FINANCE) |
| permissions | JSON | NULL | Array of permission flags |
| is_active | BOOLEAN | DEFAULT true | Whether account is active |
| last_login | TIMESTAMP | NULL | Last login timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_admin_email` on email
- `idx_admin_active` on is_active

---

### 12. audit_logs
System audit trail

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Log identifier |
| actor_type | ENUM | NOT NULL | Actor type (USER, ADMIN, SYSTEM) |
| actor_id | UUID | NULL | Reference to user or admin |
| action | VARCHAR(100) | NOT NULL | Action performed |
| entity_type | VARCHAR(50) | NOT NULL | Entity type affected |
| entity_id | UUID | NULL | Entity identifier |
| changes | JSON | NULL | JSON of changes made |
| ip_address | VARCHAR(45) | NULL | IP address of actor |
| user_agent | TEXT | NULL | User agent string |
| created_at | TIMESTAMP | DEFAULT NOW() | Log timestamp |

**Indexes:**
- `idx_audit_actor` on (actor_type, actor_id)
- `idx_audit_entity` on (entity_type, entity_id)
- `idx_audit_created` on created_at

---

## Relationships

### Entity Relationship Diagram

```
users (1) ──────────< (N) orders
users (1) ──────────< (N) tickets
users (1) ──────────< (N) transactions
users (1) ──────────< (N) notifications
users (1) ──────────< (N) kyc_documents

lottery_games (1) ──< (N) lottery_draws
lottery_games (1) ──< (N) orders
lottery_games (1) ──< (N) tickets

lottery_draws (1) ──< (N) orders
lottery_draws (1) ──< (N) tickets

orders (1) ──────────< (N) tickets
orders (1) ──────────< (N) transactions

promotions (1) ──────< (N) promotion_usage
promotion_usage (N) >── (1) users
promotion_usage (N) >── (1) orders

admin_users (1) ─────< (N) kyc_documents (verified_by)
```

---

## Data Security & Privacy

### Sensitive Data Encryption
- Password fields: Bcrypt hashing (cost factor 12)
- KYC documents: Encrypted at rest (AES-256)
- Payment information: PCI-DSS compliant (tokenized)

### Data Retention
- User data: Retained until account deletion + 7 years (legal requirement)
- Transaction history: 10 years
- Audit logs: 5 years
- Deleted accounts: Anonymized after 30 days

### Backup Strategy
- Full backup: Daily at 2 AM UTC
- Incremental backup: Every 6 hours
- Point-in-time recovery: 30 days retention
- Geographic replication: Multi-region setup

---

## Performance Optimization

### Database Indexing Strategy
- All foreign keys indexed
- Composite indexes on frequently queried column combinations
- Full-text search indexes on text fields (descriptions)

### Caching Strategy
- Redis cache for:
  - Active lottery draws (TTL: 1 hour)
  - User sessions (TTL: 24 hours)
  - Lottery game configurations (TTL: 24 hours)
  - Recent results (TTL: 6 hours)

### Query Optimization
- Use read replicas for reporting queries
- Partition large tables (transactions, audit_logs) by date
- Archive old data to cold storage after 2 years

---

## Scalability Considerations

### Horizontal Scaling
- Database sharding by user_id for users, orders, tickets
- Separate database for audit logs and analytics

### Load Balancing
- Read-write splitting
- Connection pooling (minimum 10, maximum 100)
- Query routing based on operation type

---

## Database Migration Strategy

### Version Control
- Use migration tools (e.g., Flyway, Liquibase)
- Sequential versioning: V1.0.0__initial_schema.sql
- Rollback scripts for each migration

### Deployment Process
1. Run migrations on staging environment
2. Validate data integrity
3. Blue-green deployment to production
4. Monitor for errors
5. Rollback if critical issues detected
