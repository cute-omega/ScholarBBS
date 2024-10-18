-- 创建帖子表
CREATE TABLE posts (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    date TEXT NOT NULL, -- 存储ISO 8601字符串格式的日期时间
    score INTEGER DEFAULT 0
);

-- 创建回复表
CREATE TABLE replies (
    id INTEGER PRIMARY KEY,
    post_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    date TEXT NOT NULL, -- 存储ISO 8601字符串格式的日期时间
    score INTEGER DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES posts(id)
);