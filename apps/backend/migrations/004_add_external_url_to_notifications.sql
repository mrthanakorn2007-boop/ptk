-- Add external_url column to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN notifications.external_url IS 'Optional external URL link for the notification';
