import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Trophy,
  Columns2,
  Sliders,
  ClipboardCheck,
  Printer,
  Settings,
  CupSoda,
  Database,
  HardDrive,
} from 'lucide-react';
import { DEFAULT_CANDIDATES, DEFAULT_CRITERIA, DEFAULT_THRESHOLDS } from './data/defaultData';
import { rankCandidates } from './utils/scoring';
import {
  loadLocalState,
  saveLocalState,
  loadSettings,
  saveSettings,
  createSupabaseClient,
  fetchRemoteState,
  pushRemoteState,
} from './services/storage';
import TabRanking from './components/TabRanking';
import TabSplitScoring from './components/TabSplitScoring';
import TabCriteriaAndAi from './components/TabCriteriaAndAi';
import TabInterviewEvaluation from './components/TabInterviewEvaluation';
import TabPrintA4 from './components/TabPrintA4';
import AddCandidateModal from './components/AddCandidateModal';
import SettingsModal from './components/SettingsModal';

const TABS = [
  { id: 'ranking', label: '1. Bảng Xếp Hạng', icon: Trophy },
  { id: 'scoring', label: '2. Chấm Điểm & Xem CV', icon: Columns2 },
  { id: 'criteria', label: '3. Tiêu Chí & AI Đọc CV', icon: Sliders },
  { id: 'interview', label: '4. Kết Quả Phỏng Vấn', icon: ClipboardCheck },
  { id: 'print', label: '5. Phiếu A4 & In PDF', icon: Printer },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('ranking');
  const [state, setState] = useState(() => loadLocalState());
  const [settings, setSettings] = useState(() => loadSettings());
  const [selectedCandidateId, setSelectedCandidateId] = useState(
    () => loadLocalState().candidates[0]?.id || ''
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState('LocalStorage');

  const supabase = useMemo(
    () => createSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey),
    [settings.supabaseUrl, settings.supabaseAnonKey]
  );

  const isRemoteUpdateRef = useRef(false);

  // Reactive Sync: luôn tính lại điểm, xếp hạng và dữ liệu A4 cho TẤT CẢ ứng viên
  const rankedCandidates = useMemo(
    () => rankCandidates(state.candidates, state.criteria, state.thresholds),
    [state.candidates, state.criteria, state.thresholds]
  );

  // Lưu LocalStorage mỗi khi state thay đổi
  useEffect(() => {
    saveLocalState(state);
  }, [state]);

  // Kết nối & đồng bộ realtime Supabase nếu đã cấu hình
  useEffect(() => {
    if (!supabase) {
      setSyncStatus('LocalStorage (Offline)');
      return;
    }

    let cancelled = false;
    setSyncStatus('Đang kết nối Supabase...');

    fetchRemoteState(supabase)
      .then((remote) => {
        if (cancelled) return;
        if (remote && Array.isArray(remote.candidates)) {
          isRemoteUpdateRef.current = true;
          setState(remote);
        }
        setSyncStatus('Supabase Realtime');
      })
      .catch(() => {
        if (!cancelled) setSyncStatus('Lỗi kết nối Supabase');
      });

    const channel = supabase
      .channel('tutimi_hr_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tutimi_hr_workspace', filter: 'id=eq.default' },
        (payload) => {
          const remotePayload = payload.new?.payload;
          if (remotePayload && Array.isArray(remotePayload.candidates)) {
            isRemoteUpdateRef.current = true;
            setState(remotePayload);
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Đẩy thay đổi lên Supabase (debounced)
  useEffect(() => {
    if (!supabase) return;
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      pushRemoteState(supabase, state)
        .then(() => setSyncStatus('Supabase Realtime'))
        .catch(() => setSyncStatus('Lỗi đồng bộ Supabase'));
    }, 600);

    return () => clearTimeout(timer);
  }, [state, supabase]);

  const updateState = (updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return { ...next, updatedAt: new Date().toISOString() };
    });
  };

  const handleAddCandidate = (candidate) => {
    updateState((prev) => ({
      ...prev,
      candidates: [candidate, ...prev.candidates],
    }));
    setSelectedCandidateId(candidate.id);
    setActiveTab('scoring');
  };

  const handleAddScannedCandidate = (candidate) => {
    updateState((prev) => ({
      ...prev,
      candidates: [candidate, ...prev.candidates],
    }));
  };

  const handleUpdateCandidate = (candidateId, patch) => {
    updateState((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c) => (c.id === candidateId ? { ...c, ...patch } : c)),
    }));
  };

  const handleDeleteCandidate = (candidateId) => {
    updateState((prev) => ({
      ...prev,
      candidates: prev.candidates.filter((c) => c.id !== candidateId),
    }));
  };

  const handleSaveSettings = (nextSettings) => {
    setSettings(nextSettings);
    saveSettings(nextSettings);
    alert('Đã lưu cấu hình!');
  };

  const handlePushSupabase = async () => {
    if (!supabase) return;
    try {
      await pushRemoteState(supabase, state);
      setSyncStatus('Supabase Realtime');
      alert('Đã đẩy toàn bộ dữ liệu lên Supabase thành công!');
    } catch (err) {
      alert(`Lỗi đẩy dữ liệu: ${err.message}`);
    }
  };

  const handlePullSupabase = async () => {
    if (!supabase) return;
    try {
      const remote = await fetchRemoteState(supabase);
      if (remote && Array.isArray(remote.candidates)) {
        isRemoteUpdateRef.current = true;
        setState(remote);
        alert('Đã tải dữ liệu mới nhất từ Supabase!');
      } else {
        alert('Chưa có dữ liệu trên Supabase. Hãy bấm "Đẩy lên Supabase" trước.');
      }
    } catch (err) {
      alert(`Lỗi tải dữ liệu: ${err.message}`);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tutimi-hr-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (parsed) => {
    if (!parsed || !Array.isArray(parsed.candidates) || !Array.isArray(parsed.criteria)) {
      alert('Cấu trúc file JSON không đúng định dạng hệ thống Tutimi.');
      return;
    }
    updateState(parsed);
    alert('Đã nhập dữ liệu JSON thành công!');
  };

  const handleResetDefault = () => {
    const fresh = {
      criteria: DEFAULT_CRITERIA,
      thresholds: DEFAULT_THRESHOLDS,
      candidates: DEFAULT_CANDIDATES,
      updatedAt: new Date().toISOString(),
    };
    updateState(fresh);
    setSelectedCandidateId(DEFAULT_CANDIDATES[0].id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Header (hidden on print) */}
      <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xs shrink-0">
                <CupSoda className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                  Hệ thống Sàng lọc & Đánh giá Hồ sơ Quản lý Cửa hàng – Chuỗi Trà Sữa Tutimi
                </h1>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-semibold text-amber-700">Store Manager</span>
                  <span className="hidden sm:inline">• Doanh thu &gt; 1 tỷ/tháng • 20–30 nhân sự • Trọng tâm CSKH &amp; QSC/5S</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div
                className={`hidden md:inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                  supabase
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-100 text-slate-600'
                }`}
              >
                {supabase ? <Database className="h-3.5 w-3.5" /> : <HardDrive className="h-3.5 w-3.5" />}
                <span>{syncStatus}</span>
              </div>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Cài đặt & Sync</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto pb-0 -mb-px">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition ${
                    isActive
                      ? 'border-amber-600 text-amber-700 bg-amber-50/40'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6">
        {activeTab === 'ranking' && (
          <TabRanking
            rankedCandidates={rankedCandidates}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onSelectForScoring={(id) => {
              setSelectedCandidateId(id);
              setActiveTab('scoring');
            }}
            onSelectForInterview={(id) => {
              setSelectedCandidateId(id);
              setActiveTab('interview');
            }}
            onSelectForPrint={(id) => {
              setSelectedCandidateId(id);
              setActiveTab('print');
            }}
            onDeleteCandidate={handleDeleteCandidate}
          />
        )}

        {activeTab === 'scoring' && (
          <TabSplitScoring
            rankedCandidates={rankedCandidates}
            selectedCandidateId={selectedCandidateId}
            onSelectCandidate={setSelectedCandidateId}
            criteria={state.criteria}
            onUpdateCandidate={handleUpdateCandidate}
            onGoToPrint={(id) => {
              setSelectedCandidateId(id);
              setActiveTab('print');
            }}
          />
        )}

        {activeTab === 'criteria' && (
          <TabCriteriaAndAi
            criteria={state.criteria}
            thresholds={state.thresholds}
            onUpdateCriteria={(nextCriteria) =>
              updateState((prev) => ({ ...prev, criteria: nextCriteria }))
            }
            onUpdateThresholds={(nextThresholds) =>
              updateState((prev) => ({ ...prev, thresholds: nextThresholds }))
            }
            geminiApiKey={settings.geminiApiKey}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onAddScannedCandidate={handleAddScannedCandidate}
            onGoToScoring={(id) => {
              setSelectedCandidateId(id);
              setActiveTab('scoring');
            }}
          />
        )}

        {activeTab === 'interview' && (
          <TabInterviewEvaluation
            rankedCandidates={rankedCandidates}
            selectedCandidateId={selectedCandidateId}
            onSelectCandidate={setSelectedCandidateId}
            onUpdateCandidate={handleUpdateCandidate}
            onGoToPrint={(id) => {
              setSelectedCandidateId(id);
              setActiveTab('print');
            }}
          />
        )}

        {activeTab === 'print' && (
          <TabPrintA4
            rankedCandidates={rankedCandidates}
            selectedCandidateId={selectedCandidateId}
            onSelectCandidate={setSelectedCandidateId}
            onUpdateCandidate={handleUpdateCandidate}
          />
        )}
      </main>

      {/* Modals */}
      <AddCandidateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCandidate}
        criteria={state.criteria}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        syncStatus={syncStatus}
        onPushSupabase={handlePushSupabase}
        onPullSupabase={handlePullSupabase}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onResetDefault={handleResetDefault}
      />
    </div>
  );
}
