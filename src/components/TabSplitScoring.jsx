import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Link2,
  ExternalLink,
  AlertOctagon,
  HelpCircle,
  Plus,
  Trash2,
  Printer,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { fileToDataUrl } from '../services/geminiAi';

function formatEmbedUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  // Tự động chuyển link Google Drive /view thành /preview để nhúng mượt
  if (trimmed.includes('drive.google.com/file/d/')) {
    return trimmed.replace(/\/view(\?.*)?$/, '/preview').replace(/\/edit(\?.*)?$/, '/preview');
  }
  return trimmed;
}

export default function TabSplitScoring({
  rankedCandidates,
  selectedCandidateId,
  onSelectCandidate,
  criteria,
  onUpdateCandidate,
  onGoToPrint,
}) {
  const selected =
    rankedCandidates.find((c) => c.id === selectedCandidateId) || rankedCandidates[0] || null;
  const [newQuestion, setNewQuestion] = useState('');

  if (!selected) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        Chưa có ứng viên nào. Vui lòng thêm ứng viên ở Tab 1 hoặc quét CV bằng AI ở Tab 3.
      </div>
    );
  }

  const handleScoreChange = (criterionId, value) => {
    const num = Math.max(0, Math.min(10, Number(value) || 0));
    onUpdateCandidate(selected.id, {
      scores: {
        ...(selected.scores || {}),
        [criterionId]: num,
      },
    });
  };

  const handleCvFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      onUpdateCandidate(selected.id, {
        cvSourceType: 'file',
        cvFileName: file.name,
        cvFileDataUrl: dataUrl,
        cvFileMimeType: file.type,
      });
    } catch (err) {
      alert(err.message);
    }
    e.target.value = '';
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    onUpdateCandidate(selected.id, {
      suggestedQuestions: [...(selected.suggestedQuestions || []), newQuestion.trim()],
    });
    setNewQuestion('');
  };

  const handleRemoveQuestion = (idx) => {
    const next = [...(selected.suggestedQuestions || [])];
    next.splice(idx, 1);
    onUpdateCandidate(selected.id, { suggestedQuestions: next });
  };

  const viewMode = selected.cvSourceType || 'summary';
  const embedUrl = formatEmbedUrl(selected.cvLinkUrl);

  return (
    <div className="space-y-4">
      {/* Candidate Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Đang chấm hồ sơ:</span>
          <select
            value={selected.id}
            onChange={(e) => onSelectCandidate(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
          >
            {rankedCandidates.map((c, idx) => (
              <option key={c.id} value={c.id}>
                #{idx + 1} — {c.fullName} ({c.evaluation.totalScore}/100)
              </option>
            ))}
          </select>
          <StatusBadge evaluation={selected.evaluation} />
        </div>

        <button
          type="button"
          onClick={() => onGoToPrint(selected.id)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 shrink-0"
        >
          <Printer className="h-3.5 w-3.5" />
          Xem Phiếu A4
        </button>
      </div>

      {/* Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: CV VIEWER */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col lg:sticky lg:top-4 lg:max-h-[calc(100vh-140px)]">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'summary', label: 'Tóm tắt CV', icon: FileText },
                { id: 'file', label: 'File PDF / Ảnh', icon: Upload },
                { id: 'link', label: 'Link Drive / TopCV', icon: Link2 },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onUpdateCandidate(selected.id, { cvSourceType: tab.id })}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                      viewMode === tab.id
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100">
              <Upload className="h-3.5 w-3.5" />
              Tải CV lên
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={handleCvFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto p-4 min-h-[420px]">
            {viewMode === 'summary' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500">Họ và tên</label>
                    <input
                      type="text"
                      value={selected.fullName}
                      onChange={(e) => onUpdateCandidate(selected.id, { fullName: e.target.value })}
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500">Số điện thoại</label>
                    <input
                      type="text"
                      value={selected.phone || ''}
                      onChange={(e) => onUpdateCandidate(selected.id, { phone: e.target.value })}
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500">Email</label>
                    <input
                      type="email"
                      value={selected.email || ''}
                      onChange={(e) => onUpdateCandidate(selected.id, { email: e.target.value })}
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500">Địa chỉ</label>
                    <input
                      type="text"
                      value={selected.address || ''}
                      onChange={(e) => onUpdateCandidate(selected.id, { address: e.target.value })}
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tóm tắt kinh nghiệm & Quá trình công tác
                  </label>
                  <textarea
                    rows={6}
                    value={selected.cvSummary || ''}
                    onChange={(e) => onUpdateCandidate(selected.id, { cvSummary: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 leading-relaxed focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 mb-1">Điểm mạnh nổi bật</label>
                    <textarea
                      rows={4}
                      value={selected.strengths || ''}
                      onChange={(e) => onUpdateCandidate(selected.id, { strengths: e.target.value })}
                      placeholder="Ghi chú điểm mạnh..."
                      className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 p-2.5 text-xs text-slate-800 leading-relaxed focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-rose-700 mb-1">Điểm yếu / Cần làm rõ</label>
                    <textarea
                      rows={4}
                      value={selected.weaknesses || ''}
                      onChange={(e) => onUpdateCandidate(selected.id, { weaknesses: e.target.value })}
                      placeholder="Ghi chú điểm yếu..."
                      className="w-full rounded-xl border border-rose-200 bg-rose-50/30 p-2.5 text-xs text-slate-800 leading-relaxed focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'file' && (
              <div className="h-full flex flex-col">
                {selected.cvFileDataUrl ? (
                  <div className="space-y-2 flex-1 flex flex-col">
                    <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-100 rounded-lg px-3 py-1.5">
                      <span className="font-semibold truncate">{selected.cvFileName}</span>
                      <a
                        href={selected.cvFileDataUrl}
                        download={selected.cvFileName || 'cv'}
                        className="text-amber-700 font-semibold hover:underline shrink-0 ml-2"
                      >
                        Tải xuống
                      </a>
                    </div>
                    {selected.cvFileMimeType?.includes('pdf') ||
                    selected.cvFileName?.toLowerCase().endsWith('.pdf') ? (
                      <iframe
                        src={selected.cvFileDataUrl}
                        title="CV PDF Preview"
                        className="w-full h-[540px] rounded-xl border border-slate-200"
                      />
                    ) : (
                      <img
                        src={selected.cvFileDataUrl}
                        alt={selected.cvFileName}
                        className="w-full rounded-xl border border-slate-200 object-contain max-h-[600px]"
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <Upload className="h-10 w-10 text-slate-400 mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Chưa có file CV đính kèm</p>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      Hỗ trợ file PDF hoặc Ảnh (JPG, PNG) để xem trực tiếp song song khi chấm điểm.
                    </p>
                    <label className="cursor-pointer rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700">
                      Chọn file PDF / Ảnh
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={handleCvFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'link' && (
              <div className="space-y-3 h-full flex flex-col">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={selected.cvLinkUrl || ''}
                    onChange={(e) => onUpdateCandidate(selected.id, { cvLinkUrl: e.target.value })}
                    placeholder="Dán link Google Drive hoặc TopCV tại đây..."
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                  {selected.cvLinkUrl && (
                    <a
                      href={selected.cvLinkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Mở tab mới
                    </a>
                  )}
                </div>

                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title="CV External Link"
                    className="w-full h-[520px] rounded-xl border border-slate-200 bg-slate-50"
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <Link2 className="h-9 w-9 text-slate-400 mb-2" />
                    <p className="text-xs text-slate-500">
                      Dán link Google Drive (chế độ Chia sẻ công khai) hoặc TopCV để nhúng xem trực tiếp.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SCORING & QUESTIONS */}
        <div className="lg:col-span-6 space-y-4">
          {/* Score Summary + Knock-out Rule */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tổng điểm sàng lọc tự động
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span
                    className={`text-4xl font-extrabold ${
                      selected.knockoutVSATTP
                        ? 'text-rose-600 line-through'
                        : selected.evaluation.statusKey === 'pass'
                        ? 'text-emerald-600'
                        : selected.evaluation.statusKey === 'consider'
                        ? 'text-amber-600'
                        : 'text-slate-700'
                    }`}
                  >
                    {selected.evaluation.totalScore}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">/ 100 điểm</span>
                </div>
              </div>
              <StatusBadge evaluation={selected.evaluation} />
            </div>

            {/* Knock-out toggle */}
            <div
              className={`rounded-xl border p-3.5 transition ${
                selected.knockoutVSATTP
                  ? 'border-rose-300 bg-rose-50'
                  : 'border-slate-200 bg-slate-50/70'
              }`}
            >
              <label className="flex items-start justify-between gap-3 cursor-pointer">
                <div className="flex items-start gap-2.5">
                  <AlertOctagon
                    className={`h-5 w-5 shrink-0 mt-0.5 ${
                      selected.knockoutVSATTP ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Quy tắc Điểm Liệt (VSATTP nghiêm trọng)
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Bật nếu ứng viên vi phạm nguyên tắc VSATTP (VD: đồng ý giữ trân châu qua đêm để bán tiếp).
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(selected.knockoutVSATTP)}
                  onChange={(e) =>
                    onUpdateCandidate(selected.id, { knockoutVSATTP: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 mt-0.5"
                />
              </label>

              {selected.knockoutVSATTP && (
                <input
                  type="text"
                  value={selected.knockoutReason || ''}
                  onChange={(e) =>
                    onUpdateCandidate(selected.id, { knockoutReason: e.target.value })
                  }
                  placeholder="Nhập lý do vi phạm VSATTP cụ thể..."
                  className="mt-2.5 w-full rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs text-rose-900 focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Criteria Sliders */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Chấm điểm theo bộ tiêu chí Tutimi (Thang 0 – 10)
            </h3>

            <div className="space-y-4">
              {criteria.map((c, idx) => {
                const rawScore = Number(selected.scores?.[c.id] ?? 0);
                const bd = selected.evaluation.breakdown.find((b) => b.criterionId === c.id);
                return (
                  <div key={c.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {idx + 1}. {c.name}{' '}
                          <span className="ml-1 inline-block rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                            {c.weight}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{c.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-extrabold text-amber-700">
                          +{bd ? bd.weightedPoints : 0}đ
                        </div>
                        <div className="text-[10px] text-slate-400">trên {c.weight}đ</div>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={rawScore}
                        onChange={(e) => handleScoreChange(c.id, e.target.value)}
                        className="flex-1 accent-amber-600 cursor-pointer"
                      />
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={rawScore}
                        onChange={(e) => handleScoreChange(c.id, e.target.value)}
                        className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1 text-center text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interview Notes & Suggested Questions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Ghi chú phỏng vấn & Điểm cần xác minh
              </label>
              <textarea
                rows={3}
                value={selected.interviewNotes || ''}
                onChange={(e) => onUpdateCandidate(selected.id, { interviewNotes: e.target.value })}
                placeholder="Ghi chú câu hỏi xác minh mốc thời gian, người tham chiếu, năng lực thực chiến..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 leading-relaxed focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                <HelpCircle className="h-4 w-4 text-amber-600" />
                <span>Câu hỏi phỏng vấn gợi ý dành riêng cho ứng viên</span>
              </div>

              <div className="space-y-2">
                {(selected.suggestedQuestions || []).map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"
                  >
                    <span className="font-bold text-amber-700 shrink-0">Q{idx + 1}.</span>
                    <span className="flex-1 leading-relaxed">{q}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-slate-400 hover:text-rose-600 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-2.5 flex gap-2">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddQuestion();
                    }
                  }}
                  placeholder="Thêm câu hỏi phỏng vấn mới..."
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
