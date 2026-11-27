import { createClient } from '@supabase/supabase-js';
import { DEFAULT_CANDIDATES, DEFAULT_CRITERIA, DEFAULT_THRESHOLDS } from '../data/defaultData';

const LOCAL_STATE_KEY = 'tutimi_hr_state_v1';
const LOCAL_SEEDED_KEY = 'tutimi_hr_seeded_ids_v2';
const LOCAL_SETTINGS_KEY = 'tutimi_hr_settings_v1';
const SUPABASE_TABLE = 'tutimi_hr_workspace';
const WORKSPACE_ROW_ID = 'default';

export function loadSettings() {
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (!raw) {
      return {
        geminiApiKey: '',
        supabaseUrl: '',
        supabaseAnonKey: '',
      };
    }
    return {
      geminiApiKey: '',
      supabaseUrl: '',
      supabaseAnonKey: '',
      ...JSON.parse(raw),
    };
  } catch {
    return {
      geminiApiKey: '',
      supabaseUrl: '',
      supabaseAnonKey: '',
    };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
}

export function loadLocalState() {
  try {
    const raw = localStorage.getItem(LOCAL_STATE_KEY);
    if (!raw) {
      return {
        criteria: DEFAULT_CRITERIA,
        thresholds: DEFAULT_THRESHOLDS,
        candidates: DEFAULT_CANDIDATES,
        updatedAt: new Date().toISOString(),
      };
    }
    const parsed = JSON.parse(raw);
    let candidates = Array.isArray(parsed.candidates) ? parsed.candidates : DEFAULT_CANDIDATES;

    // Tự động bổ sung ứng viên mặc định mới (nếu chưa từng được seed vào máy người dùng)
    try {
      const seededRaw = localStorage.getItem(LOCAL_SEEDED_KEY);
      const seededIds = seededRaw ? JSON.parse(seededRaw) : [];
      const existingIds = new Set(candidates.map((c) => c.id));
      const newDefaults = DEFAULT_CANDIDATES.filter(
        (dc) => !existingIds.has(dc.id) && !seededIds.includes(dc.id)
      );
      if (newDefaults.length > 0) {
        candidates = [...newDefaults, ...candidates];
      }
      // Cập nhật một lần hồ sơ Dương Minh Kha nếu đang ở trạng thái chưa chấm PV
      if (!seededIds.includes('cand-duong-minh-kha-pv-v2')) {
        const latestKha = DEFAULT_CANDIDATES.find((dc) => dc.id === 'cand-duong-minh-kha');
        if (latestKha) {
          candidates = candidates.map((c) =>
            c.id === 'cand-duong-minh-kha' && (!c.roleplay || c.roleplay.interviewerDecision === 'pending')
              ? latestKha
              : c
          );
        }
      }
      localStorage.setItem(
        LOCAL_SEEDED_KEY,
        JSON.stringify([...DEFAULT_CANDIDATES.map((dc) => dc.id), 'cand-duong-minh-kha-pv-v2'])
      );
    } catch {
      // ignore seed tracking errors
    }

    return {
      criteria: Array.isArray(parsed.criteria) && parsed.criteria.length ? parsed.criteria : DEFAULT_CRITERIA,
      thresholds: parsed.thresholds || DEFAULT_THRESHOLDS,
      candidates,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return {
      criteria: DEFAULT_CRITERIA,
      thresholds: DEFAULT_THRESHOLDS,
      candidates: DEFAULT_CANDIDATES,
      updatedAt: new Date().toISOString(),
    };
  }
}

export function saveLocalState(state) {
  localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(state));
}

export function createSupabaseClient(url, anonKey) {
  if (!url || !anonKey) return null;
  try {
    return createClient(url.trim(), anonKey.trim());
  } catch {
    return null;
  }
}

export async function fetchRemoteState(supabase) {
  const { data, error } = await supabase
    .from(SUPABASE_TABLE)
    .select('payload, updated_at')
    .eq('id', WORKSPACE_ROW_ID)
    .maybeSingle();

  if (error) throw error;
  return data?.payload || null;
}

export async function pushRemoteState(supabase, state) {
  const { error } = await supabase.from(SUPABASE_TABLE).upsert(
    {
      id: WORKSPACE_ROW_ID,
      payload: state,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );
  if (error) throw error;
}

export const SUPABASE_SETUP_SQL = `-- Chạy đoạn SQL này trong Supabase SQL Editor để tạo bảng đồng bộ cho team HR Tutimi:
create table if not exists public.tutimi_hr_workspace (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.tutimi_hr_workspace enable row level security;

create policy "Allow public read write for Tutimi HR"
  on public.tutimi_hr_workspace
  for all
  using (true)
  with check (true);

-- Bật Realtime cho bảng này (tùy chọn nhưng khuyên dùng):
alter publication supabase_realtime add table public.tutimi_hr_workspace;`;
