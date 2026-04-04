import { supabase } from './supabase';

// ============================================
// Overview Metrics
// ============================================

export async function getTotalUsers() {
  const { count } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true });
  return count ?? 0;
}

export async function getDAU() {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase.rpc('get_dau', { p_date: today });
  return (data as number) ?? 0;
}

export async function getMAU() {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase.rpc('get_mau', { p_date: today });
  return (data as number) ?? 0;
}

export async function getWAU() {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase.rpc('get_wau', { p_date: today });
  return (data as number) ?? 0;
}

export async function getSignupTrend(days: number = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from('users')
    .select('created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: true });

  // Group by date
  const byDate: Record<string, number> = {};
  for (const row of data ?? []) {
    const date = new Date(row.created_at).toISOString().split('T')[0];
    byDate[date] = (byDate[date] ?? 0) + 1;
  }

  // Fill in missing dates
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    result.push({ date, count: byDate[date] ?? 0 });
  }
  return result;
}

export async function getDAUTrend(days: number = 30) {
  const { data } = await supabase
    .from('user_sessions')
    .select('user_id, started_at')
    .gte('started_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

  // Group unique users by date
  const byDate: Record<string, Set<string>> = {};
  for (const row of data ?? []) {
    const date = new Date(row.started_at).toISOString().split('T')[0];
    if (!byDate[date]) byDate[date] = new Set();
    byDate[date].add(row.user_id);
  }

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    result.push({ date, count: byDate[date]?.size ?? 0 });
  }
  return result;
}

// ============================================
// Retention Metrics
// ============================================

export async function getRetentionCohorts(weeks: number = 4) {
  const { data: users } = await supabase
    .from('users')
    .select('id, created_at')
    .gte('created_at', new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000).toISOString());

  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('user_id, started_at')
    .gte('started_at', new Date(Date.now() - (weeks + 4) * 7 * 24 * 60 * 60 * 1000).toISOString());

  // Build session lookup: user_id → set of active dates
  const userActiveDates: Record<string, Set<string>> = {};
  for (const s of sessions ?? []) {
    if (!userActiveDates[s.user_id]) userActiveDates[s.user_id] = new Set();
    userActiveDates[s.user_id].add(new Date(s.started_at).toISOString().split('T')[0]);
  }

  // Build cohorts by signup week
  const cohorts: Array<{
    week: string;
    signups: number;
    retention: number[];
  }> = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const weekStart = new Date(Date.now() - (w + 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(Date.now() - w * 7 * 24 * 60 * 60 * 1000);
    const weekLabel = weekStart.toISOString().split('T')[0];

    const cohortUsers = (users ?? []).filter(u => {
      const d = new Date(u.created_at);
      return d >= weekStart && d < weekEnd;
    });

    const retention = [];
    for (let retWeek = 0; retWeek <= 4; retWeek++) {
      const retStart = new Date(weekStart.getTime() + retWeek * 7 * 24 * 60 * 60 * 1000);
      const retEnd = new Date(retStart.getTime() + 7 * 24 * 60 * 60 * 1000);

      let retained = 0;
      for (const user of cohortUsers) {
        const dates = userActiveDates[user.id];
        if (dates) {
          for (const dateStr of dates) {
            const d = new Date(dateStr);
            if (d >= retStart && d < retEnd) { retained++; break; }
          }
        }
      }
      retention.push(cohortUsers.length > 0 ? Math.round(100 * retained / cohortUsers.length) : 0);
    }

    cohorts.push({ week: weekLabel, signups: cohortUsers.length, retention });
  }

  return cohorts;
}

// ============================================
// Engagement Metrics
// ============================================

export async function getEngagementTrend(days: number = 14) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const [reactions, views, messages] = await Promise.all([
    supabase.from('video_reactions').select('created_at').gte('created_at', since),
    supabase.from('video_views').select('created_at').gte('created_at', since),
    supabase.from('messages').select('created_at').gte('created_at', since),
  ]);

  const groupByDate = (items: Array<{ created_at: string }>) => {
    const byDate: Record<string, number> = {};
    for (const item of items) {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      byDate[date] = (byDate[date] ?? 0) + 1;
    }
    return byDate;
  };

  const reactionsByDate = groupByDate(reactions.data ?? []);
  const viewsByDate = groupByDate(views.data ?? []);
  const messagesByDate = groupByDate(messages.data ?? []);

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    result.push({
      date,
      reactions: reactionsByDate[date] ?? 0,
      views: viewsByDate[date] ?? 0,
      messages: messagesByDate[date] ?? 0,
    });
  }
  return result;
}

// ============================================
// Content Metrics
// ============================================

export async function getContentStats() {
  const [photos, videos, scribbles, beats] = await Promise.all([
    supabase.from('photo_posts').select('id', { count: 'exact', head: true }),
    supabase.from('video_posts').select('id', { count: 'exact', head: true }),
    supabase.from('scribble_posts').select('id', { count: 'exact', head: true }),
    supabase.from('beats_posts').select('id', { count: 'exact', head: true }),
  ]);

  return {
    photos: photos.count ?? 0,
    videos: videos.count ?? 0,
    scribbles: scribbles.count ?? 0,
    beats: beats.count ?? 0,
    total: (photos.count ?? 0) + (videos.count ?? 0) + (scribbles.count ?? 0) + (beats.count ?? 0),
  };
}

export async function getCreatorRatio() {
  const { count: totalUsers } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true });

  // Users who have at least one post
  const [photoCreators, videoCreators, scribbleCreators] = await Promise.all([
    supabase.from('photo_posts').select('user_id'),
    supabase.from('video_posts').select('creator_id'),
    supabase.from('scribble_posts').select('user_id'),
  ]);

  const creatorSet = new Set<string>();
  for (const p of photoCreators.data ?? []) creatorSet.add(p.user_id);
  for (const v of videoCreators.data ?? []) creatorSet.add(v.creator_id);
  for (const s of scribbleCreators.data ?? []) creatorSet.add(s.user_id);

  return {
    total: totalUsers ?? 0,
    creators: creatorSet.size,
    consumers: (totalUsers ?? 0) - creatorSet.size,
    creatorPct: totalUsers ? Math.round(100 * creatorSet.size / totalUsers) : 0,
  };
}

export async function getAvgSessionDuration() {
  const { data } = await supabase
    .from('user_sessions')
    .select('duration_seconds')
    .not('duration_seconds', 'is', null)
    .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if (!data || data.length === 0) return 0;
  const total = data.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0);
  return Math.round(total / data.length);
}

// ============================================
// Funnel Metrics
// ============================================

export async function getFunnelData() {
  const [totalUsers, onboarded, photoCreators, videoCreators, scribbleCreators, usersWithReactions] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('onboarding_completed', true),
    supabase.from('photo_posts').select('user_id'),
    supabase.from('video_posts').select('creator_id'),
    supabase.from('scribble_posts').select('user_id'),
    supabase.from('video_reactions').select('user_id'),
  ]);

  const creatorSet = new Set<string>();
  for (const p of photoCreators.data ?? []) creatorSet.add(p.user_id);
  for (const v of videoCreators.data ?? []) creatorSet.add(v.creator_id);
  for (const s of scribbleCreators.data ?? []) creatorSet.add(s.user_id);

  const engagedSet = new Set<string>();
  for (const r of usersWithReactions.data ?? []) engagedSet.add(r.user_id);

  return [
    { step: 'Signed Up', count: totalUsers.count ?? 0 },
    { step: 'Onboarded', count: onboarded.count ?? 0 },
    { step: 'First Post', count: creatorSet.size },
    { step: 'First Reaction', count: engagedSet.size },
  ];
}

// ============================================
// Users / Leaderboard
// ============================================

export async function getTopFollowed(limit = 10) {
  const { data } = await supabase
    .from('user_follows')
    .select('following_id');

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.following_id] = (counts[row.following_id] ?? 0) + 1;
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit);
  const userIds = sorted.map(([id]) => id);

  if (userIds.length === 0) return [];

  const { data: users } = await supabase
    .from('users')
    .select('id, name, username, profile_pic, is_verified')
    .in('id', userIds);

  const userMap = new Map((users ?? []).map(u => [u.id, u]));
  return sorted.map(([id, followers]) => ({ ...userMap.get(id), followers })).filter(u => u.name);
}

export async function getTopCreators(limit = 10) {
  const [photos, videos, scribbles] = await Promise.all([
    supabase.from('photo_posts').select('user_id'),
    supabase.from('video_posts').select('creator_id'),
    supabase.from('scribble_posts').select('user_id'),
  ]);

  const counts: Record<string, number> = {};
  for (const p of photos.data ?? []) counts[p.user_id] = (counts[p.user_id] ?? 0) + 1;
  for (const v of videos.data ?? []) counts[v.creator_id] = (counts[v.creator_id] ?? 0) + 1;
  for (const s of scribbles.data ?? []) counts[s.user_id] = (counts[s.user_id] ?? 0) + 1;

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit);
  const userIds = sorted.map(([id]) => id);

  if (userIds.length === 0) return [];

  const { data: users } = await supabase
    .from('users')
    .select('id, name, username, profile_pic, is_verified')
    .in('id', userIds);

  const userMap = new Map((users ?? []).map(u => [u.id, u]));
  return sorted.map(([id, posts]) => ({ ...userMap.get(id), posts })).filter(u => u.name);
}

export async function getSignupSources() {
  const { data } = await supabase.from('users').select('email');
  let google = 0, email = 0, other = 0;
  for (const u of data ?? []) {
    if (u.email?.endsWith('@gmail.com')) google++;
    else if (u.email?.includes('@')) email++;
    else other++;
  }
  return [
    { name: 'Google', value: google },
    { name: 'Email', value: email },
    { name: 'Other', value: other },
  ].filter(d => d.value > 0);
}

// ============================================
// Device & Version Analytics
// ============================================

export async function getDeviceBreakdown() {
  const { data } = await supabase
    .from('user_sessions')
    .select('device_info')
    .not('device_info', 'is', null);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const os = row.device_info?.startsWith('android') ? 'Android' : row.device_info?.startsWith('ios') ? 'iOS' : 'Other';
    counts[os] = (counts[os] ?? 0) + 1;
  }

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export async function getVersionAdoption() {
  const { data } = await supabase
    .from('user_sessions')
    .select('app_version, user_id')
    .not('app_version', 'is', null);

  // Latest version per user
  const latestPerUser: Record<string, string> = {};
  for (const row of data ?? []) {
    latestPerUser[row.user_id] = row.app_version; // last one wins (ordered by created_at)
  }

  const counts: Record<string, number> = {};
  for (const version of Object.values(latestPerUser)) {
    counts[version] = (counts[version] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([version, users]) => ({ version, users }))
    .sort((a, b) => b.users - a.users);
}

// ============================================
// Content Intelligence
// ============================================

export async function getPostingHeatmap() {
  const [photos, videos, scribbles] = await Promise.all([
    supabase.from('photo_posts').select('created_at'),
    supabase.from('video_posts').select('created_at'),
    supabase.from('scribble_posts').select('created_at'),
  ]);

  const allPosts = [...(photos.data ?? []), ...(videos.data ?? []), ...(scribbles.data ?? [])];

  // hour (0-23) × day (0-6, Sun-Sat)
  const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

  for (const post of allPosts) {
    const d = new Date(post.created_at);
    heatmap[d.getUTCDay()][d.getUTCHours()]++;
  }

  const result = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      result.push({ day: days[day], hour, count: heatmap[day][hour] });
    }
  }
  return result;
}

export async function getDeadContent() {
  // Posts with 0 reactions
  const { data: allPhotos } = await supabase.from('photo_posts').select('id, user_id, created_at');
  const { data: allVideos } = await supabase.from('video_posts').select('id, creator_id, created_at');
  const { data: reactions } = await supabase.from('video_reactions').select('video_id');

  const reactedIds = new Set((reactions ?? []).map(r => r.video_id));

  const deadPhotos = (allPhotos ?? []).filter(p => !reactedIds.has(p.id)).length;
  const deadVideos = (allVideos ?? []).filter(v => !reactedIds.has(v.id)).length;
  const totalPosts = (allPhotos?.length ?? 0) + (allVideos?.length ?? 0);

  return {
    dead: deadPhotos + deadVideos,
    total: totalPosts,
    deadPct: totalPosts > 0 ? Math.round(100 * (deadPhotos + deadVideos) / totalPosts) : 0,
  };
}

// ============================================
// Monitoring & System Health
// ============================================

export async function getDatabaseStats() {
  const tables = [
    'users', 'photo_posts', 'video_posts', 'scribble_posts', 'beats_posts',
    'video_reactions', 'comments', 'messages', 'conversations', 'user_follows',
    'user_sessions', 'notifications', 'flashes', 'flash_views', 'video_views',
    'bookmarks', 'search_analytics', 'user_interactions',
  ];

  const results = await Promise.all(
    tables.map(async (table) => {
      try {
        const { count } = await supabase.from(table).select('id', { count: 'exact', head: true });
        return { table, rows: count ?? 0 };
      } catch {
        return { table, rows: 0 };
      }
    })
  );

  return results.sort((a, b) => b.rows - a.rows);
}

export async function getSupabaseHealth() {
  const start = Date.now();
  try {
    await supabase.from('users').select('id', { count: 'exact', head: true });
    const latency = Date.now() - start;
    return { status: 'healthy' as const, latency };
  } catch {
    return { status: 'down' as const, latency: Date.now() - start };
  }
}

export async function getStorageBuckets() {
  try {
    const { data } = await supabase.storage.listBuckets();
    return (data ?? []).map(b => ({
      name: b.name,
      public: b.public,
      id: b.id,
    }));
  } catch {
    return [];
  }
}

// ============================================
// User Search
// ============================================

export async function searchUsers(query: string) {
  const { data } = await supabase
    .from('users')
    .select('id, auth_id, name, username, email, profile_pic, is_verified, created_at, onboarding_completed, age')
    .or(`name.ilike.%${query}%,username.ilike.%${query}%,email.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(20);
  return data ?? [];
}

export async function getUserActivity(userId: string) {
  const [sessions, posts, reactions, follows] = await Promise.all([
    supabase.from('user_sessions').select('started_at, duration_seconds, app_version').eq('user_id', userId).order('started_at', { ascending: false }).limit(10),
    supabase.from('photo_posts').select('id, created_at').eq('user_id', userId),
    supabase.from('video_reactions').select('id, created_at').eq('user_id', userId),
    supabase.from('user_follows').select('id').eq('follower_id', userId),
  ]);

  return {
    sessions: sessions.data ?? [],
    totalPosts: posts.data?.length ?? 0,
    totalReactions: reactions.data?.length ?? 0,
    totalFollowing: follows.data?.length ?? 0,
    lastActive: sessions.data?.[0]?.started_at ?? null,
  };
}

export async function getWoWGrowth() {
  const now = new Date();
  const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [thisWeek, lastWeek] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', thisWeekStart.toISOString()),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', lastWeekStart.toISOString()).lt('created_at', thisWeekStart.toISOString()),
  ]);

  const thisCount = thisWeek.count ?? 0;
  const lastCount = lastWeek.count ?? 0;
  const growth = lastCount > 0 ? Math.round(((thisCount - lastCount) / lastCount) * 100) : 0;

  return { thisWeek: thisCount, lastWeek: lastCount, growth };
}
