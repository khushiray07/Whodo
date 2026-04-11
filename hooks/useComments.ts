import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { TaskComment } from '../types/database';

export function useComments(taskId: string | undefined) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchRef = useRef<() => Promise<void>>(undefined);

  const fetchComments = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    const { data } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    setComments(data ?? []);
    setLoading(false);
  }, [taskId]);

  fetchRef.current = fetchComments;

  useEffect(() => {
    fetchRef.current?.();

    if (!taskId) return;

    const uid = Math.random().toString(36).slice(2);
    const channel = supabase
      .channel(`task-comments-${taskId}-${uid}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'task_comments',
        filter: `task_id=eq.${taskId}`,
      }, () => {
        fetchRef.current?.();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [taskId]);

  const addComment = useCallback(async (authorParticipantId: string, content: string) => {
    if (!taskId) return;
    const { error } = await supabase.from('task_comments').insert({
      task_id: taskId,
      author_participant_id: authorParticipantId,
      content,
    });
    if (error) throw error;
  }, [taskId]);

  return { comments, loading, addComment };
}
