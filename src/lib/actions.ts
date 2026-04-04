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

export async function getRecentContentAction(limit = 20) {
  const { data } = await supabase.rpc('admin_get_all_content', { p_limit: limit, p_offset: 0 });
  return data ?? [];
}
