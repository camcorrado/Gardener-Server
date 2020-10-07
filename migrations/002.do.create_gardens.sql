CREATE TABLE IF NOT EXISTS gardens (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    plants TEXT[],
    zipcode INTEGER
    );