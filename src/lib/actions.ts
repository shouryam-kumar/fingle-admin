"use server";

import { supabase } from "./supabase";

export async function suspendUserAction(userId: string, type: 'temporary' | 'permanent', reason: string, expiresAt?: string) {
  const { data } = await supabase.rpc('admin_suspend_user', {
    p_user_id: userId,
    p_type: type,
    p_reason: reason,
    p_admin_id: '',
    p_expires_at: expiresAt ?? null,
  });
  return data;
}

export async function unsuspendUserAction(userId: string) {
  const { data } = await supabase.rpc('admin_unsuspend_user', { p_user_id: userId, p_admin_id: '' });
  return data;
}

export async function deletePostAction(postId: string, postType: string, reason: string) {
  const { data } = await supabase.rpc('admin_delete_post', {
    p_post_id: postId,
    p_post_type: postType,
    p_reason: reason,
    p_admin_id: '',
  });
  return data;
}

export async function resolveReportAction(reportId: string, reportType: string, resolution: string, notes: string) {
  const { data } = await supabase.rpc('admin_resolve_report', {
    p_report_id: reportId,
    p_report_type: reportType,
    p_resolution: resolution,
    p_notes: notes,
    p_admin_id: '',
  });
  return data;
}

export async function searchUsersAction(query: string) {
  const { data } = await supabase
    .from('users')
    .select('id, auth_id, name, username, email, profile_pic, is_verified, is_suspended, followers_count, created_at')
    .or(`name.ilike.%${query}%,username.ilike.%${query}%,email.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(30);
  return data ?? [];
}

export async function searchContentAction(query: string) {
  // Search by username — find user then get their content
  const { data: users } = await supabase
    .from('users')
    .select('auth_id')
    .or(`username.ilike.%${query}%,name.ilike.%${query}%`)
    .limit(5);

  if (!users || users.length === 0) return [];

  const userIds = users.map(u => u.auth_id);
  const { data } = await supabase.rpc('admin_get_all_content', { p_limit: 50, p_offset: 0 });

  // Filter client-side by matched user IDs
  return ((data ?? []) as any[]).filter((p: any) => userIds.includes(p.user_id));
}

export async function getPostByIdAction(postId: string) {
  // Try each post table
  const tables = [
    { table: 'video_posts', type: 'video', userCol: 'auth_user_id', captionCol: 'description' },
    { table: 'photo_posts', type: 'photo', userCol: 'user_id', captionCol: 'caption' },
    { table: 'scribble_posts', type: 'scribble', userCol: 'user_id', captionCol: 'caption' },
    { table: 'beats_posts', type: 'beats', userCol: 'user_id', captionCol: 'caption' },
  ];

  for (const t of tables) {
    const { data } = await supabase.from(t.table).select('*').eq('id', postId).maybeSingle();
    if (data) {
      const userId = data[t.userCol];
      const { data: user } = await supabase.from('users').select('username, name, profile_pic, auth_id').eq('auth_id', userId).maybeSingle();
      return [{
        id: data.id,
        type: t.type,
        content_text: data[t.captionCol],
        thumbnail_url: data.thumbnail_url ?? data.preview_image_url ?? data.cover_image_url,
        created_at: data.created_at,
        views: data.views ?? data.views_count ?? 0,
        username: user?.username,
        user_name: user?.name,
        profile_pic: user?.profile_pic,
        user_id: user?.auth_id,
      }];
    }
  }
  return [];
}

export async function getRecentContentAction(limit = 20) {
  const { data } = await supabase.rpc('admin_get_all_content', { p_limit: limit, p_offset: 0 });
  return data ?? [];
}
