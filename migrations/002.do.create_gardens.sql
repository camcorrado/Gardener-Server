CREATE TABLE IF NOT EXISTS gardens (
    id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    plants TEXT[] DEFAULT NULL,
    hardiness_zone TEXT DEFAULT NULL
    );