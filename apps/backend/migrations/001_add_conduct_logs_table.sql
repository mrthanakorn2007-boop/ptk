-- Migration: Add conduct_logs table
-- Description: Creates the conduct_logs table for tracking student conduct score changes
-- Date: 2024-01-17

-- Create conduct_logs table
CREATE TABLE IF NOT EXISTS conduct_logs (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    teacher_id UUID NOT NULL,
    score_change INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Foreign keys
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_teacher FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conduct_logs_student_id ON conduct_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_conduct_logs_teacher_id ON conduct_logs(teacher_id);
CREATE INDEX IF NOT EXISTS idx_conduct_logs_created_at ON conduct_logs(created_at DESC);

-- Add comment
COMMENT ON TABLE conduct_logs IS 'Tracks all changes to student conduct scores with reasons and timestamps';
