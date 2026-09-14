CREATE TABLE IF NOT EXISTS users (
                                     id BIGSERIAL PRIMARY KEY,
                                     name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS expense_groups (
                                              id BIGSERIAL PRIMARY KEY,
                                              name VARCHAR(150) NOT NULL,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS group_members (
                                             group_id BIGINT NOT NULL REFERENCES expense_groups(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id BIGSERIAL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
    );

CREATE TABLE IF NOT EXISTS expenses (
                                        id BIGSERIAL PRIMARY KEY,
                                        group_id BIGINT NOT NULL REFERENCES expense_groups(id) ON DELETE CASCADE,
    paid_by BIGINT NOT NULL REFERENCES users(id),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    description VARCHAR(255),
    expense_date TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS expense_splits (
                                              id BIGSERIAL PRIMARY KEY,
                                              expense_id BIGINT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    amount_owed NUMERIC(12, 2) NOT NULL CHECK (amount_owed >= 0)
    );

CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_user_id ON expense_splits(user_id);