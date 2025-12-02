-- Add read_at column to messages table for tracking unread messages
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ DEFAULT NULL;

-- Create index for faster unread message queries
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sender ON messages(conversation_id, sender_id);

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_conversation_id UUID, p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE messages 
  SET read_at = NOW() 
  WHERE conversation_id = p_conversation_id 
    AND sender_id != p_user_id 
    AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM messages m
    JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
    WHERE cp.user_id = p_user_id
      AND m.sender_id != p_user_id
      AND m.read_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

