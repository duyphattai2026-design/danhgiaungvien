import React, { useState } from 'react';
import {
  X,
  KeyRound,
  Database,
  Download,
  Upload,
  RotateCcw,
  Copy,
  Check,
  CloudUpload,
  CloudDownload,
} from 'lucide-react';
import { SUPABASE_SETUP_SQL } from '../services/storage';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  syncStatus,
  onPushSupabase,
  onPullSupabase,
  onExportJson,
  onImportJson,
  onResetDefault,
}) {
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey || '');
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings({
      geminiApiKey: geminiApiKey.trim(),
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
    });
  };

  const handleCopySql = async () => {
    await navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        onImportJson(parsed);
      } catch {
        alert('File JSON không hợp lệ.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Cài đặt AI, Đồng bộ Supabase & Sao lưu</h3>
            <p className="text-xs text-slate-500">
              Lưu trữ cục bộ tự động trên trình duyệt và đồng bộ thời gian thực qua Supabase khi cấu hình.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleSave} className="space-y-5">
            {/* Gemini API */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <KeyRound className="h-4 w-4 text-indigo-600" />
                <span>Gemini API Key (Dành cho AI Quét CV Tự Động)</span>
              </div>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-xl border border-indigo-200 bg-white px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <p className="text-xs text-slate-600">
                Key chỉ được lưu trên trình duyệt của bạn (LocalStorage) để gọi trực tiếp Gemini API đọc file PDF/Ảnh CV.
              </p>
            </div>

            {/* Supabase Sync */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <Database className="h-4 w-4 text-emerald-600" />
                  <span>Kết nối Supabase (Dùng chung dữ liệu toàn team HR)</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-emerald-200 text-emerald-700">
                  {syncStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supabase Project URL</label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full rounded-xl border border-emerald-200 bg-white px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supabase Anon Key</label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full rounded-xl border border-emerald-200 bg-white px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Lưu cấu hình & Kết nối
                </button>
                <button
                  type="button"
                  onClick={onPullSupabase}
                  disabled={!supabaseUrl || !supabaseAnonKey}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                >
                  <CloudDownload className="h-3.5 w-3.5" />
                  Tải từ Supabase
                </button>
                <button
                  type="button"
                  onClick={onPushSupabase}
                  disabled={!supabaseUrl || !supabaseAnonKey}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                >
                  <CloudUpload className="h-3.5 w-3.5" />
                  Đẩy lên Supabase
                </button>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-600">SQL khởi tạo bảng trên Supabase:</span>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    {copiedSql ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedSql ? 'Đã copy SQL' : 'Copy SQL'}
                  </button>
                </div>
                <pre className="rounded-lg bg-slate-900 text-slate-100 p-3 text-[11px] overflow-x-auto leading-relaxed">
                  {SUPABASE_SETUP_SQL}
                </pre>
              </div>
            </div>
          </form>

          {/* Export / Import / Reset */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <h4 className="text-sm font-bold text-slate-800">Sao lưu & Khôi phục dữ liệu (JSON)</h4>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={onExportJson}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Download className="h-4 w-4" />
                Xuất file JSON
              </button>

              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                <Upload className="h-4 w-4" />
                Nhập file JSON
                <input type="file" accept="application/json" onChange={handleFileImport} className="hidden" />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Khôi phục toàn bộ tiêu chí và 2 ứng viên mẫu ban đầu?')) {
                    onResetDefault();
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 ml-auto"
              >
                <RotateCcw className="h-4 w-4" />
                Khôi phục dữ liệu mẫu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
