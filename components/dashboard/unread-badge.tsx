'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePathname } from 'next/navigation';

interface UnreadBadgeProps {
  userId: string;
}

// Store the last viewed timestamp in localStorage
const LAST_VIEWED_KEY = 'konex_messages_last_viewed';

export default function UnreadBadge({ userId }: UnreadBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const supabase = createClient();

    const fetchUnreadCount = async () => {
      try {
        // Get last viewed timestamp from localStorage
        const lastViewed = localStorage.getItem(LAST_VIEWED_KEY);
        const lastViewedDate = lastViewed ? new Date(lastViewed) : new Date(0);

        // Get user's conversations
        const { data: participations } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', userId);

        if (!participations || participations.length === 0) {
          setUnreadCount(0);
          return;
        }

        const conversationIds = participations.map(p => p.conversation_id);

        // Count messages from others since last viewed
        const { count, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', conversationIds)
          .neq('sender_id', userId)
          .gt('created_at', lastViewedDate.toISOString());

        if (error) {
          console.error('Error fetching unread count:', error);
          return;
        }

        setUnreadCount(count || 0);
      } catch (err) {
        console.error('Error in fetchUnreadCount:', err);
      }
    };

    // Mark as viewed when on messages page
    if (pathname?.startsWith('/dashboard/messages')) {
      localStorage.setItem(LAST_VIEWED_KEY, new Date().toISOString());
      setUnreadCount(0);
    } else {
      fetchUnreadCount();
    }

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`unread-badge-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as any;
          // If the new message is not from the current user and not on messages page
          if (newMessage.sender_id !== userId && !pathname?.startsWith('/dashboard/messages')) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, pathname, mounted]);

  // Don't render on server or before mount
  if (!mounted || unreadCount === 0) return null;

  return (
    <span className="min-w-[20px] h-[20px] flex items-center justify-center bg-red-500 text-white text-[11px] font-bold rounded-full px-1.5">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}

