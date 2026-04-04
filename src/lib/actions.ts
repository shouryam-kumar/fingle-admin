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
