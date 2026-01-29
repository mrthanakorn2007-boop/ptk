-- Add description and image_url columns to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN notifications.description IS 'Long text field for detailed notification description';
COMMENT ON COLUMN notifications.image_url IS 'URL or path to notification image';
