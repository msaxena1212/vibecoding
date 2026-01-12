-- SQL Script to manually initialize Vibe-LangGraph tables in Supabase
-- Run this in the Supabase SQL Editor if automation fails

-- 1. Create Project Table
CREATE TABLE IF NOT EXISTS project (
    id TEXT PRIMARY KEY,
    user_intent TEXT NOT NULL,
    description TEXT,
    framework TEXT DEFAULT 'vanilla',
    status TEXT DEFAULT 'draft',
    files JSONB DEFAULT '{}'::jsonb,
    dependency_graph JSONB DEFAULT '{}'::jsonb,
    total_tokens INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Chat Message Table
CREATE TABLE IF NOT EXISTS chat_message (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES project(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Generation Log Table
CREATE TABLE IF NOT EXISTS generation_log (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES project(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    step_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Set up auto-updating timestamp for project table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_project_updated_at ON project;
CREATE TRIGGER update_project_updated_at
BEFORE UPDATE ON project
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
