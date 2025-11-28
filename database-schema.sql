-- TruvaMate Lottery Database Schema (PostgreSQL)
-- Version: 1.0.0
-- Created: 2024-11-28

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');
CREATE TYPE kyc_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE ticket_type AS ENUM ('STANDARD', 'SYNDICATE', 'BUNDLE');
CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'CONFIRMED', 'FAILED', 'REFUNDED', 'CANCELLED');
CREATE TYPE ticket_status AS ENUM ('PENDING', 'PURCHASED', 'SCANNED', 'CHECKED', 'WIN', 'LOSE', 'CLAIMED');
CREATE TYPE draw_status AS ENUM ('SCHEDULED', 'CLOSED', 'DRAWN', 'CANCELLED');
CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'PURCHASE', 'REFUND', 'WINNINGS', 'CASHBACK');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TYPE promotion_type AS ENUM ('DISCOUNT', 'CASHBACK', 'FREE_LINES', 'BONUS');
CREATE TYPE discount_type AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
CREATE TYPE notification_type AS ENUM ('ORDER_CONFIRMED', 'TICKET_SCANNED', 'DRAW_RESULT', 'WINNER', 'PROMOTION', 'SYSTEM');
CREATE TYPE document_type AS ENUM ('PASSPORT', 'ID_CARD', 'DRIVER_LICENSE', 'PROOF_OF_ADDRESS');
CREATE TYPE document_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE admin_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'FINANCE');
CREATE TYPE actor_type AS ENUM ('USER', 'ADMIN', 'SYSTEM');

-- =====================================================
-- TABLE: users
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    date_of_birth DATE NOT NULL,
    country VARCHAR(2) NOT NULL,
    language VARCHAR(2) DEFAULT 'EN',
    wallet_balance DECIMAL(10,2) DEFAULT 0.00 CHECK (wallet_balance >= 0),
    kyc_status kyc_status DEFAULT 'PENDING',
    status user_status DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);

-- =====================================================
-- TABLE: lottery_games
-- =====================================================

CREATE TABLE lottery_games (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(2) NOT NULL,
    main_numbers_min INT NOT NULL,
    main_numbers_max INT NOT NULL,
    main_numbers_count INT NOT NULL,
    power_numbers_min INT NOT NULL,
    power_numbers_max INT NOT NULL,
    power_numbers_count INT DEFAULT 1,
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    draw_days JSONB NOT NULL,
    draw_time TIME NOT NULL,
    sales_cutoff_hours INT DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    logo_color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lottery_games
CREATE INDEX idx_lottery_games_active ON lottery_games(is_active);
CREATE INDEX idx_lottery_games_country ON lottery_games(country);

-- =====================================================
-- TABLE: lottery_draws
-- =====================================================

CREATE TABLE lottery_draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id VARCHAR(50) NOT NULL REFERENCES lottery_games(id),
    draw_date TIMESTAMP NOT NULL,
    jackpot_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    sales_close_date TIMESTAMP NOT NULL,
    status draw_status DEFAULT 'SCHEDULED',
    winning_main_numbers JSONB,
    winning_power_numbers JSONB,
    result_announced_at TIMESTAMP,
    total_winners INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lottery_draws
CREATE INDEX idx_draws_game_date ON lottery_draws(game_id, draw_date);
CREATE INDEX idx_draws_status ON lottery_draws(status);
CREATE INDEX idx_draws_sales_close ON lottery_draws(sales_close_date);
CREATE INDEX idx_draws_draw_date ON lottery_draws(draw_date DESC);

-- =====================================================
-- TABLE: orders
-- =====================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    game_id VARCHAR(50) NOT NULL REFERENCES lottery_games(id),
    draw_id UUID NOT NULL REFERENCES lottery_draws(id),
    ticket_type ticket_type NOT NULL,
    total_lines INT NOT NULL CHECK (total_lines > 0),
    line_price DECIMAL(10,2) NOT NULL CHECK (line_price > 0),
    service_fee DECIMAL(10,2) DEFAULT 0.00,
    discount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    status order_status DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    payment_id VARCHAR(255),
    paid_at TIMESTAMP,
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for orders
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_draw ON orders(draw_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- =====================================================
-- TABLE: tickets
-- =====================================================

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    user_id UUID NOT NULL REFERENCES users(id),
    game_id VARCHAR(50) NOT NULL REFERENCES lottery_games(id),
    draw_id UUID NOT NULL REFERENCES lottery_draws(id),
    main_numbers JSONB NOT NULL,
    power_numbers JSONB NOT NULL,
    is_quick_pick BOOLEAN DEFAULT false,
    official_ticket_number VARCHAR(100),
    scanned_image_url VARCHAR(500),
    status ticket_status DEFAULT 'PENDING',
    win_amount DECIMAL(10,2) DEFAULT 0.00,
    win_tier VARCHAR(50),
    scanned_at TIMESTAMP,
    checked_at TIMESTAMP,
    claimed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for tickets
CREATE INDEX idx_tickets_order ON tickets(order_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_draw ON tickets(draw_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_official_number ON tickets(official_ticket_number);

-- =====================================================
-- TABLE: transactions
-- =====================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    ticket_id UUID REFERENCES tickets(id),
    type transaction_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    status transaction_status DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    payment_gateway_id VARCHAR(255),
    description TEXT,
    metadata JSONB,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for transactions
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_transactions_order ON transactions(order_id);

-- =====================================================
-- TABLE: promotions
-- =====================================================

CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type promotion_type NOT NULL,
    discount_type discount_type,
    discount_value DECIMAL(10,2),
    min_purchase DECIMAL(10,2) DEFAULT 0.00,
    max_discount DECIMAL(10,2),
    applicable_games JSONB,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    usage_limit INT,
    usage_per_user INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (end_date > start_date)
);

-- Indexes for promotions
CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX idx_promotions_active ON promotions(is_active);

-- =====================================================
-- TABLE: promotion_usage
-- =====================================================

CREATE TABLE promotion_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promotion_id UUID NOT NULL REFERENCES promotions(id),
    user_id UUID NOT NULL REFERENCES users(id),
    order_id UUID NOT NULL REFERENCES orders(id),
    discount_applied DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for promotion_usage
CREATE INDEX idx_promotion_usage_promotion ON promotion_usage(promotion_id);
CREATE INDEX idx_promotion_usage_user ON promotion_usage(user_id);
CREATE UNIQUE INDEX idx_promotion_usage_unique ON promotion_usage(promotion_id, order_id);

-- =====================================================
-- TABLE: notifications
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- =====================================================
-- TABLE: kyc_documents
-- =====================================================

CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    document_type document_type NOT NULL,
    document_number VARCHAR(100),
    front_image_url VARCHAR(500) NOT NULL,
    back_image_url VARCHAR(500),
    selfie_image_url VARCHAR(500),
    status document_status DEFAULT 'PENDING',
    rejection_reason TEXT,
    verified_by UUID,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for kyc_documents
CREATE INDEX idx_kyc_user ON kyc_documents(user_id);
CREATE INDEX idx_kyc_status ON kyc_documents(status);

-- =====================================================
-- TABLE: admin_users
-- =====================================================

CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role admin_role NOT NULL,
    permissions JSONB,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for admin_users
CREATE INDEX idx_admin_email ON admin_users(email);
CREATE INDEX idx_admin_active ON admin_users(is_active);

-- Add foreign key for verified_by
ALTER TABLE kyc_documents 
ADD CONSTRAINT fk_kyc_verified_by 
FOREIGN KEY (verified_by) REFERENCES admin_users(id);

-- =====================================================
-- TABLE: audit_logs
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_type actor_type NOT NULL,
    actor_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit_logs
CREATE INDEX idx_audit_actor ON audit_logs(actor_type, actor_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lottery_games_updated_at BEFORE UPDATE ON lottery_games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lottery_draws_updated_at BEFORE UPDATE ON lottery_draws
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_documents_updated_at BEFORE UPDATE ON kyc_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_number VARCHAR(50);
    counter INT;
BEGIN
    SELECT COUNT(*) INTO counter FROM orders WHERE DATE(created_at) = CURRENT_DATE;
    new_number := 'TR-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || '-' || LPAD((counter + 1)::TEXT, 3, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to check ticket against draw results
CREATE OR REPLACE FUNCTION check_ticket_win(
    p_ticket_id UUID
) RETURNS TABLE(
    is_winner BOOLEAN,
    win_tier VARCHAR(50),
    win_amount DECIMAL(10,2),
    main_matches INT,
    power_matches INT
) AS $$
DECLARE
    v_ticket RECORD;
    v_draw RECORD;
    v_main_matches INT := 0;
    v_power_matches INT := 0;
    v_win_tier VARCHAR(50) := NULL;
    v_win_amount DECIMAL(10,2) := 0.00;
BEGIN
    -- Get ticket details
    SELECT t.*, d.winning_main_numbers, d.winning_power_numbers
    INTO v_ticket
    FROM tickets t
    JOIN lottery_draws d ON t.draw_id = d.id
    WHERE t.id = p_ticket_id;
    
    -- Check if draw has results
    IF v_ticket.winning_main_numbers IS NULL THEN
        RETURN QUERY SELECT false, NULL::VARCHAR(50), 0.00::DECIMAL(10,2), 0, 0;
        RETURN;
    END IF;
    
    -- Count main number matches
    SELECT COUNT(*)
    INTO v_main_matches
    FROM jsonb_array_elements_text(v_ticket.main_numbers) AS ticket_num
    WHERE ticket_num::INT IN (
        SELECT jsonb_array_elements_text(v_ticket.winning_main_numbers)::INT
    );
    
    -- Count power number matches
    SELECT COUNT(*)
    INTO v_power_matches
    FROM jsonb_array_elements_text(v_ticket.power_numbers) AS ticket_power
    WHERE ticket_power::INT IN (
        SELECT jsonb_array_elements_text(v_ticket.winning_power_numbers)::INT
    );
    
    -- Determine win tier and amount (example for Powerball)
    IF v_main_matches = 5 AND v_power_matches = 1 THEN
        v_win_tier := 'JACKPOT';
        -- Jackpot amount from draw
        SELECT jackpot_amount INTO v_win_amount FROM lottery_draws WHERE id = v_ticket.draw_id;
    ELSIF v_main_matches = 5 AND v_power_matches = 0 THEN
        v_win_tier := 'MATCH_5';
        v_win_amount := 1000000.00;
    ELSIF v_main_matches = 4 AND v_power_matches = 1 THEN
        v_win_tier := 'MATCH_4_PLUS_POWER';
        v_win_amount := 50000.00;
    ELSIF v_main_matches = 4 AND v_power_matches = 0 THEN
        v_win_tier := 'MATCH_4';
        v_win_amount := 100.00;
    ELSIF v_main_matches = 3 AND v_power_matches = 1 THEN
        v_win_tier := 'MATCH_3_PLUS_POWER';
        v_win_amount := 100.00;
    ELSIF v_main_matches = 3 AND v_power_matches = 0 THEN
        v_win_tier := 'MATCH_3';
        v_win_amount := 7.00;
    ELSIF v_main_matches = 2 AND v_power_matches = 1 THEN
        v_win_tier := 'MATCH_2_PLUS_POWER';
        v_win_amount := 7.00;
    ELSIF v_main_matches = 1 AND v_power_matches = 1 THEN
        v_win_tier := 'MATCH_1_PLUS_POWER';
        v_win_amount := 4.00;
    ELSIF v_main_matches = 0 AND v_power_matches = 1 THEN
        v_win_tier := 'MATCH_POWER';
        v_win_amount := 4.00;
    END IF;
    
    -- Update ticket if winner
    IF v_win_amount > 0 THEN
        UPDATE tickets
        SET status = 'WIN',
            win_amount = v_win_amount,
            win_tier = v_win_tier,
            checked_at = CURRENT_TIMESTAMP
        WHERE id = p_ticket_id;
        
        RETURN QUERY SELECT true, v_win_tier, v_win_amount, v_main_matches, v_power_matches;
    ELSE
        UPDATE tickets
        SET status = 'LOSE',
            checked_at = CURRENT_TIMESTAMP
        WHERE id = p_ticket_id;
        
        RETURN QUERY SELECT false, NULL::VARCHAR(50), 0.00::DECIMAL(10,2), v_main_matches, v_power_matches;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert lottery games
INSERT INTO lottery_games (id, name, country, main_numbers_min, main_numbers_max, main_numbers_count, 
                          power_numbers_min, power_numbers_max, power_numbers_count, 
                          base_price, currency, draw_days, draw_time, logo_color) VALUES
('powerball', 'POWERBALL®', 'US', 1, 69, 5, 1, 26, 1, 5.00, 'USD', 
 '["MON", "WED", "SAT"]'::jsonb, '22:59:00', 'bg-gradient-to-br from-red-600 to-red-500'),
('megamillions', 'MEGA MILLIONS', 'US', 1, 70, 5, 1, 25, 1, 5.00, 'USD', 
 '["TUE", "FRI"]'::jsonb, '23:00:00', 'bg-gradient-to-br from-blue-600 to-blue-500'),
('eurojackpot', 'EUROJACKPOT', 'EU', 1, 50, 5, 1, 12, 2, 5.00, 'EUR', 
 '["TUE", "FRI"]'::jsonb, '20:00:00', 'bg-gradient-to-br from-yellow-500 to-amber-500');

-- Create default admin user (password: Admin123!)
INSERT INTO admin_users (email, password_hash, full_name, role, permissions) VALUES
('admin@truvamate.com', crypt('Admin123!', gen_salt('bf', 12)), 'System Administrator', 'SUPER_ADMIN', 
 '["VIEW_USERS", "MANAGE_USERS", "VIEW_ORDERS", "MANAGE_ORDERS", "VERIFY_KYC", "MANAGE_DRAWS", "VIEW_REPORTS"]'::jsonb);

-- =====================================================
-- VIEWS
-- =====================================================

-- View for user statistics
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    u.id,
    u.email,
    u.first_name || ' ' || u.last_name AS full_name,
    u.wallet_balance,
    u.kyc_status,
    u.status,
    COUNT(DISTINCT o.id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_spent,
    COUNT(DISTINCT t.id) AS total_tickets,
    COUNT(DISTINCT CASE WHEN t.status = 'WIN' THEN t.id END) AS winning_tickets,
    COALESCE(SUM(CASE WHEN t.status = 'WIN' THEN t.win_amount ELSE 0 END), 0) AS total_winnings,
    u.created_at,
    u.last_login
FROM users u
LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'CONFIRMED'
LEFT JOIN tickets t ON u.id = t.user_id
GROUP BY u.id;

-- View for upcoming draws
CREATE OR REPLACE VIEW upcoming_draws AS
SELECT 
    d.id,
    d.game_id,
    g.name AS game_name,
    d.draw_date,
    d.jackpot_amount,
    d.currency,
    d.sales_close_date,
    d.status,
    EXTRACT(EPOCH FROM (d.sales_close_date - CURRENT_TIMESTAMP)) AS seconds_until_close
FROM lottery_draws d
JOIN lottery_games g ON d.game_id = g.id
WHERE d.status = 'SCHEDULED'
  AND d.sales_close_date > CURRENT_TIMESTAMP
ORDER BY d.draw_date;

-- View for recent results
CREATE OR REPLACE VIEW recent_results AS
SELECT 
    d.id,
    d.game_id,
    g.name AS game_name,
    d.draw_date,
    d.jackpot_amount,
    d.currency,
    d.winning_main_numbers,
    d.winning_power_numbers,
    d.total_winners,
    d.result_announced_at
FROM lottery_draws d
JOIN lottery_games g ON d.game_id = g.id
WHERE d.status = 'DRAWN'
  AND d.result_announced_at IS NOT NULL
ORDER BY d.draw_date DESC;

-- =====================================================
-- PARTITIONING (Optional - for large scale)
-- =====================================================

-- Partition transactions table by date (example for monthly partitions)
-- Uncomment if needed for large-scale deployment

-- CREATE TABLE transactions_partitioned (
--     LIKE transactions INCLUDING ALL
-- ) PARTITION BY RANGE (created_at);

-- CREATE TABLE transactions_2024_11 PARTITION OF transactions_partitioned
--     FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');

-- CREATE TABLE transactions_2024_12 PARTITION OF transactions_partitioned
--     FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Create roles (adjust as needed for your deployment)
-- CREATE ROLE truvamate_app;
-- CREATE ROLE truvamate_admin;
-- CREATE ROLE truvamate_readonly;

-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO truvamate_app;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO truvamate_admin;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO truvamate_readonly;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'User accounts with authentication and profile information';
COMMENT ON TABLE lottery_games IS 'Configuration for available lottery games';
COMMENT ON TABLE lottery_draws IS 'Scheduled and completed lottery draws';
COMMENT ON TABLE orders IS 'User ticket purchase orders';
COMMENT ON TABLE tickets IS 'Individual lottery ticket entries';
COMMENT ON TABLE transactions IS 'Financial transactions for all money movements';
COMMENT ON TABLE promotions IS 'Promotional campaigns and discount codes';
COMMENT ON TABLE notifications IS 'User notifications and alerts';
COMMENT ON TABLE kyc_documents IS 'KYC verification documents and status';
COMMENT ON TABLE audit_logs IS 'System audit trail for all actions';

-- End of schema
