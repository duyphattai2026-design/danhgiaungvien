import React, { useState } from 'react';
import {
  Scale,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import { rebalanceWeights } from '../utils/scoring';
import { analyzeCvWithGemini, fileToDataUrl } from '../services/geminiAi';
import { DEFAULT_CRITERIA, DEFAULT_THRESHOLDS } from '../data/defaultData';

export default function TabCriteriaAndAi({
  criteria,
  thresholds,
  onUpdateCriteria,
  onUpdateThresholds,
  geminiApiKey,
  onOpenSettings,
  onAddScannedCandidate,
  onGoToScoring,
}) {
  const [scanQueue, setScanQueue] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const totalWeight = criteria.reduce((sum, c) => sum + Number(c.weight || 0), 0);

  const handleCriterionChange = (id, field, value) => {
    const next = criteria.map((c) =>
      c.id === id
        ? { ...c, [field]: field === 'weight' ? Math.max(0, Math.min(100, Number(value) || 0)) : value }
        : c
    );
    onUpdateCriteria(next);
  };

  const handleAddCriterion = () => {
    const newId = `c_${Date.now()}`;
    onUpdateCriteria([
      ...criteria,
      {
        id: newId,
        name: 'Tiêu chí đánh giá mới',
        weight: 0,
        description: 'Mô tả chi tiết yêu cầu của tiêu chí...',
      },
    ]);
  };

  const handleDeleteCriterion = (id) => {
    if (criteria.length <= 1) {
      alert('Cần giữ lại ít nhất 1 tiêu chí đánh giá.');
      return;
    }
    onUpdateCriteria(criteria.filter((c) => c.id !== id));
  };

  const handleRebalance = () => {
    onUpdateCriteria(rebalanceWeights(criteria));
  };

  const handleResetCriteria = () => {
    if (window.confirm('Khôi phục 6 tiêu chí mặc định và ngưỡng chuẩn của Tutimi?')) {
      onUpdateCriteria(DEFAULT_CRITERIA);
      onUpdateThresholds(DEFAULT_THRESHOLDS);
    }
  };

  const handleMultiFileScan = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    if (!geminiApiKey) {
      alert('Vui lòng nhập Gemini API Key trong phần Cài đặt để sử dụng AI Quét CV.');
      onOpenSettings();
      return;
    }

    const initialItems = files.map((f, idx) => ({
      id: `${Date.now()}_${idx}`,
      fileName: f.name,
      status: 'pending',
      message: 'Đang chờ xử lý...',
      candidateId: null,
      candidateName: '',
    }));

    setScanQueue(initialItems);
    setIsScanning(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const itemId = initialItems[i].id;

      setScanQueue((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, status: 'processing', message: 'AI đang đọc & chấm điểm CV...' } : it))
      );

      try {
        const [aiResult, dataUrl] = await Promise.all([
          analyzeCvWithGemini({ file, apiKey: geminiApiKey, criteria }),
          fileToDataUrl(file),
        ]);

        const newCandId = `cand-ai-${Date.now()}-${i}`;
        const newCandidate = {
          id: newCandId,
          fullName: aiResult.fullName,
          phone: aiResult.phone,
          email: aiResult.email,
          address: aiResult.address,
          appliedPosition: 'Quản lý Cửa hàng (Store Manager)',
          createdAt: new Date().toISOString(),
          scores: aiResult.scores,
          knockoutVSATTP: false,
          knockoutReason: '',
          cvSummary: aiResult.cvSummary,
          strengths: aiResult.strengths,
          weaknesses: aiResult.weaknesses,
          interviewNotes: aiResult.interviewNotes,
          suggestedQuestions: aiResult.suggestedQuestions,
          cvSourceType: 'file',
          cvFileName: file.name,
          cvFileDataUrl: dataUrl,
          cvFileMimeType: file.type,
          cvLinkUrl: '',
          roleplay: {
            rp1Score: 0,
            rp1Notes: '',
            rp2Score: 0,
            rp2Notes: '',
            interviewerDecision: 'pending',
            interviewDate: '',
            panelNames: 'HR / Quản lý Vận hành / Giám đốc Chuỗi',
          },
        };

        onAddScannedCandidate(newCandidate);

        setScanQueue((prev) =>
          prev.map((it) =>
            it.id === itemId
              ? {
                  ...it,
                  status: 'done',
                  message: 'Đã trích xuất & thêm vào bảng xếp hạng',
                  candidateId: newCandId,
                  candidateName: aiResult.fullName,
                }
              : it
          )
        );
      } catch (err) {
        setScanQueue((prev) =>
          prev.map((it) =>
            it.id === itemId ? { ...it, status: 'error', message: err.message || 'Lỗi quét CV' } : it
          )
        );
      }
    }

    setIsScanning(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT: DYNAMIC CRITERIA & THRESHOLDS */}
      <div className="lg:col-span-7 space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Bộ Tiêu Chí Chấm Điểm Động (Thang 100)</h2>
              <p className="text-xs text-slate-500">
                Mọi thay đổi sẽ tự động tính lại điểm số, xếp hạng và cập nhật Phiếu A4 của tất cả ứng viên.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-extrabold border ${
                  Math.abs(totalWeight - 100) < 0.01
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                Tổng trọng số: {totalWeight}%
              </span>
              <button
                type="button"
                onClick={handleRebalance}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
              >
                <Scale className="h-3.5 w-3.5" />
                Tự động cân bằng 100%
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {criteria.map((c, idx) => (
              <div
                key={c.id}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700 shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => handleCriterionChange(c.id, 'name', e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={c.weight}
                      onChange={(e) => handleCriterionChange(c.id, 'weight', e.target.value)}
                      className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-xs font-extrabold text-amber-700"
                    />
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCriterion(c.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Xóa tiêu chí"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={c.description}
                  onChange={(e) => handleCriterionChange(c.id, 'description', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 focus:border-amber-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={handleAddCriterion}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Thêm tiêu chí mới
            </button>

            <button
              type="button"
              onClick={handleResetCriteria}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Khôi phục mặc định Tutimi
            </button>
          </div>
        </div>

        {/* Thresholds */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Ngưỡng phân loại tự động</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
              <div className="text-xs font-bold text-emerald-800">ĐẠT (Mời PV trực tiếp)</div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-slate-600">Từ</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={thresholds.passMin}
                  onChange={(e) =>
                    onUpdateThresholds({ ...thresholds, passMin: Number(e.target.value) || 0 })
                  }
                  className="w-16 rounded-lg border border-emerald-300 bg-white px-2 py-1 text-center text-xs font-extrabold text-emerald-700"
                />
                <span className="text-xs text-slate-600">– 100 điểm</span>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
              <div className="text-xs font-bold text-amber-800">CÂN NHẮC (PV ĐT 10p)</div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-slate-600">Từ</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={thresholds.considerMin}
                  onChange={(e) =>
                    onUpdateThresholds({ ...thresholds, considerMin: Number(e.target.value) || 0 })
                  }
                  className="w-16 rounded-lg border border-amber-300 bg-white px-2 py-1 text-center text-xs font-extrabold text-amber-700"
                />
                <span className="text-xs text-slate-600">– {thresholds.passMin - 1}đ</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-bold text-slate-700">CHƯA ĐẠT (Dự phòng)</div>
              <div className="mt-2 text-xs text-slate-600 py-1">
                Dưới <span className="font-bold">{thresholds.considerMin}</span> điểm
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: AI CV SCANNER */}
      <div className="lg:col-span-5 space-y-4">
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-amber-50/40 p-5 shadow-2xs space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">AI Quét CV Tự Động (Gemini)</h2>
                <p className="text-xs text-slate-500">
                  Tải 1 hoặc nhiều file PDF/Ảnh CV để trích xuất & chấm điểm gợi ý.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-indigo-600" />
              <span className="font-medium text-slate-700">
                Gemini API Key:{' '}
                {geminiApiKey ? (
                  <span className="text-emerald-600 font-bold">Đã cấu hình</span>
                ) : (
                  <span className="text-rose-600 font-bold">Chưa nhập</span>
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenSettings}
              className="font-semibold text-indigo-600 hover:underline"
            >
              Cài đặt Key
            </button>
          </div>

          <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 bg-white/80 p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 transition">
            {isScanning ? (
              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-3" />
            ) : (
              <Upload className="h-10 w-10 text-indigo-500 mb-3" />
            )}
            <p className="text-sm font-bold text-slate-800">
              {isScanning ? 'Đang phân tích CV bằng Gemini AI...' : 'Chọn 1 hoặc nhiều file CV (PDF / Ảnh)'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              AI tự trích xuất Họ tên, SĐT, Email, kinh nghiệm, chấm điểm 6 tiêu chí & gợi ý 3 câu hỏi PV.
            </p>
            <input
              type="file"
              multiple
              accept="application/pdf,image/*"
              disabled={isScanning}
              onChange={handleMultiFileScan}
              className="hidden"
            />
          </label>

          {scanQueue.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-700">Tiến trình quét CV:</h4>
              {scanQueue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 truncate">
                      {item.candidateName || item.fileName}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{item.message}</div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {item.status === 'processing' && (
                      <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
                    )}
                    {item.status === 'done' && (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <button
                          type="button"
                          onClick={() => onGoToScoring(item.candidateId)}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
                        >
                          Xem
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </>
                    )}
                    {item.status === 'error' && <AlertCircle className="h-4 w-4 text-rose-600" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
