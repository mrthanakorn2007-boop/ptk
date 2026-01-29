-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('urgent', 'general', 'event')),
    target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'students', 'teachers')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_target_audience ON notifications(target_audience);

-- Add sample notifications
-- (These will be created by the seed script or admin users)
