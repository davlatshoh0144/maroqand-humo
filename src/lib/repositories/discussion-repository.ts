import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Discussion, DiscussionReply } from '@/lib/types';
import { fail, guarded, ok, type RepositoryResult } from '@/lib/repositories/result';
import { mapDiscussion, mapDiscussionReply, type Row } from '@/lib/repositories/mappers';

export const discussionRepository = {
  async listDiscussions(): Promise<RepositoryResult<Discussion[]>> {
    return guarded(async () => {
      const { data: discussionRows, error } = await getSupabaseBrowserClient()
        .from('discussions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return fail('PERMISSION_DENIED', error.message, error);

      const ids = ((discussionRows ?? []) as Row[]).map((row) => String(row.id));
      const { data: replyRows, error: replyError } = ids.length
        ? await getSupabaseBrowserClient()
            .from('discussion_replies')
            .select('*')
            .in('discussion_id', ids)
            .order('created_at', { ascending: true })
        : { data: [], error: null };

      if (replyError) return fail('PERMISSION_DENIED', replyError.message, replyError);

      const repliesByDiscussion = new Map<string, DiscussionReply[]>();
      for (const row of (replyRows ?? []) as Row[]) {
        const reply = mapDiscussionReply(row);
        repliesByDiscussion.set(reply.discussionId, [...(repliesByDiscussion.get(reply.discussionId) ?? []), reply]);
      }

      return ok(((discussionRows ?? []) as Row[]).map((row) => mapDiscussion(row, repliesByDiscussion.get(String(row.id)) ?? [])));
    });
  },

  async addDiscussion(discussion: Discussion): Promise<RepositoryResult<Discussion>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .from('discussions')
        .insert({
          course_id: discussion.courseId,
          lesson_id: discussion.lessonId,
          user_id: discussion.userId,
          title: discussion.title,
          content: discussion.content,
          is_pinned: discussion.isPinned,
          is_announcement: discussion.isAnnouncement,
        })
        .select('*')
        .single();

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(mapDiscussion(data as Row));
    });
  },

  async addReply(reply: DiscussionReply): Promise<RepositoryResult<DiscussionReply>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .from('discussion_replies')
        .insert({
          discussion_id: reply.discussionId,
          user_id: reply.userId,
          content: reply.content,
          is_helpful: reply.isHelpful,
          is_instructor: reply.isInstructor,
        })
        .select('*')
        .single();

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(mapDiscussionReply(data as Row));
    });
  },
};
