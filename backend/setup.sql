CREATE TABLE IF NOT EXISTS items (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for DESC cursor pagination
-- We drop it first to ensure idempotency if script runs multiple times
DROP INDEX IF EXISTS idx_items_id_desc;

-- Optimal index for scanning backwards which powers our cursor mechanism
CREATE INDEX idx_items_id_desc ON items(id DESC);
