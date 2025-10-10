-- MNEX Database Schema for Railway PostgreSQL
-- This schema stores all MNEX AI data, posts, comments, and autonomous behavior

-- Posts table - stores all generated posts
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    personas_used TEXT[] NOT NULL,
    template_used VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    safety_checked BOOLEAN DEFAULT false,
    posted_to_twitter BOOLEAN DEFAULT false,
    posted_to_telegram BOOLEAN DEFAULT false,
    twitter_post_id VARCHAR(50),
    telegram_post_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    posted_at TIMESTAMP,
    metadata JSONB
);

-- Comments table - stores Twitter comments and replies
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    twitter_comment_id VARCHAR(50) UNIQUE NOT NULL,
    parent_post_id INTEGER REFERENCES posts(id),
    author_id VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    replied_to BOOLEAN DEFAULT false,
    reply_content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    replied_at TIMESTAMP
);

-- Autonomous behavior log
CREATE TABLE IF NOT EXISTS autonomous_log (
    id SERIAL PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL, -- 'post', 'reply', 'search', 'update'
    content TEXT,
    context JSONB,
    success BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market data cache
CREATE TABLE IF NOT EXISTS market_data (
    id SERIAL PRIMARY KEY,
    data_type VARCHAR(50) NOT NULL, -- 'solana_price', 'news', 'token_launch'
    title VARCHAR(255),
    content TEXT,
    source_url VARCHAR(500),
    relevance_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- User interactions
CREATE TABLE IF NOT EXISTS user_interactions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    platform VARCHAR(20) NOT NULL, -- 'twitter', 'telegram', 'website'
    interaction_type VARCHAR(50) NOT NULL, -- 'message', 'comment', 'like'
    content TEXT,
    response_generated TEXT,
    sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System configuration
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Presale transactions
CREATE TABLE IF NOT EXISTS presale_transactions (
    id SERIAL PRIMARY KEY,
    transaction_hash VARCHAR(100) UNIQUE NOT NULL,
    wallet_address VARCHAR(50) NOT NULL,
    sol_amount DECIMAL(20,8) NOT NULL,
    mnex_tokens DECIMAL(20,8) NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

-- AI learning data
CREATE TABLE IF NOT EXISTS ai_learning (
    id SERIAL PRIMARY KEY,
    input_data TEXT NOT NULL,
    output_data TEXT NOT NULL,
    feedback_score INTEGER, -- 1-5 rating
    learning_type VARCHAR(50) NOT NULL, -- 'post_generation', 'reply_generation'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_event_type ON posts(event_type);
CREATE INDEX IF NOT EXISTS idx_comments_parent_post ON comments(parent_post_id);
CREATE INDEX IF NOT EXISTS idx_comments_replied_to ON comments(replied_to);
CREATE INDEX IF NOT EXISTS idx_autonomous_log_action ON autonomous_log(action_type);
CREATE INDEX IF NOT EXISTS idx_market_data_type ON market_data(data_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_presale_tx_hash ON presale_transactions(transaction_hash);

-- Insert default system configuration
INSERT INTO system_config (config_key, config_value) VALUES
('autonomous_posting_enabled', 'true'),
('comment_reply_enabled', 'true'),
('market_analysis_enabled', 'true'),
('posting_frequency_hours', '3'),
('comment_check_frequency_minutes', '30'),
('max_posts_per_day', '8'),
('persona_weights', '{"oracle": 30, "analyst": 20, "trickster": 25, "cultivator": 15, "archivist": 10}'),
('safety_mode', 'strict'),
('presale_mode', 'false')
ON CONFLICT (config_key) DO NOTHING;
