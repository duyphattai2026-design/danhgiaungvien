import React from 'react';
import { Printer, AlertTriangle } from 'lucide-react';
import { DEFAULT_ROLEPLAY_SCENARIOS } from '../data/defaultData';
import StatusBadge from './StatusBadge';

export default function TabPrintA4({
  rankedCandidates,
  selectedCandidateId,
  onSelectCandidate,
  onUpdateCandidate,
}) {
  const selected =
    rankedCandidates.find((c) => c.id === selectedCandidateId) || rankedCandidates[0] || null;

  if (!selected) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        Chưa có ứng viên nào để xuất phiếu A4.
      </div>
    );
  }

  const roleplay = selected.roleplay || {
    rp1Score: 0,
    rp1Notes: '',
    rp2Score: 0,
    rp2Notes: '',
    interviewerDecision: 'pending',
    interviewDate: '',
    panelNames: 'HR / Quản lý Vận hành / Giám đốc Chuỗi',
  };

  const updateRoleplay = (patch) => {
    onUpdateCandidate(selected.id, {
      roleplay: {
        ...roleplay,
        ...patch,
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* Control Toolbar (hidden when printing) */}
      <div className="no-print rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Chọn ứng viên xuất A4:
            </span>
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
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700 shadow-xs"
          >
            <Printer className="h-4 w-4" />
            In / Lưu PDF (Chuẩn A4)
          </button>
        </div>

        {/* Quick Role-play & Panel Decision Editor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Điểm Role-play 1 (CSKH giờ cao điểm /10)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={roleplay.rp1Score}
              onChange={(e) => updateRoleplay({ rp1Score: Number(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Điểm Role-play 2 (QSC/5S đầu ca 8h30 /10)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={roleplay.rp2Score}
              onChange={(e) => updateRoleplay({ rp2Score: Number(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Kết luận sau phỏng vấn thực chiến
            </label>
            <select
              value={roleplay.interviewerDecision}
              onChange={(e) => updateRoleplay({ interviewerDecision: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold"
            >
              <option value="pending">Chờ phỏng vấn / Đang đánh giá</option>
              <option value="hire">ĐỀ XUẤT TUYỂN DỤNG (Nhận việc)</option>
              <option value="consider">CÂN NHẮC VÒNG 2 / THỬ VIỆC</option>
              <option value="reject">KHÔNG PHÙ HỢP</option>
            </select>
          </div>
        </div>
      </div>

      {/* A4 PRINT SHEET */}
      <div className="a4-sheet mx-auto w-full max-w-[210mm] rounded-xl border border-slate-300 bg-white p-8 sm:p-10 shadow-lg text-slate-900">
        {/* Sheet Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-amber-700">
              CHUỖI TRÀ SỮA TUTIMI • PHÒNG NHÂN SỰ & VẬN HÀNH
            </div>
            <h1 className="mt-1 text-xl font-extrabold uppercase text-slate-900">
              PHIẾU ĐÁNH GIÁ HỒ SƠ & PHỎNG VẤN THỰC CHIẾN
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Vị trí: <strong>Quản lý Cửa hàng (Store Manager)</strong> — Quy mô &gt; 1 tỷ/tháng • 20–30 nhân sự • Dine-in đông
            </p>
          </div>
          <div className="text-right text-xs">
            <div className="font-bold text-slate-800">Mã HS: {selected.id.slice(-6).toUpperCase()}</div>
            <div className="text-slate-500 mt-0.5">
              Ngày in: {new Date().toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>

        {/* Candidate Info */}
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border border-slate-300 bg-slate-50/60 p-3.5 text-xs">
          <div>
            <span className="text-slate-500">Họ và tên:</span>{' '}
            <strong className="text-sm text-slate-900">{selected.fullName}</strong>
          </div>
          <div>
            <span className="text-slate-500">Điện thoại:</span>{' '}
            <strong>{selected.phone || '—'}</strong>
          </div>
          <div>
            <span className="text-slate-500">Email:</span>{' '}
            <strong>{selected.email || '—'}</strong>
          </div>
          <div>
            <span className="text-slate-500">Địa chỉ:</span>{' '}
            <strong>{selected.address || '—'}</strong>
          </div>
        </div>

        {/* Section 1: CV Screening Table (Reactive Sync) */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              I. KẾT QUẢ SÀNG LỌC HỒ SƠ (THANG 100 ĐIỂM)
            </h2>
            <div className="text-xs font-bold">
              Tổng điểm:{' '}
              <span className="text-base font-extrabold text-amber-700">
                {selected.evaluation.totalScore}/100
              </span>{' '}
              — <span className="uppercase">{selected.evaluation.statusLabel}</span>
            </div>
          </div>

          {selected.knockoutVSATTP && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-rose-400 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                CẢNH BÁO ĐIỂM LIỆT VSATTP: LOẠI TRỰC TIẾP{' '}
                {selected.knockoutReason ? `(${selected.knockoutReason})` : ''}
              </span>
            </div>
          )}

          <table className="w-full border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold">
                <th className="border border-slate-300 py-1.5 px-2 text-center w-10">STT</th>
                <th className="border border-slate-300 py-1.5 px-2.5 text-left">Tiêu chí đánh giá</th>
                <th className="border border-slate-300 py-1.5 px-2 text-center w-20">Trọng số</th>
                <th className="border border-slate-300 py-1.5 px-2 text-center w-20">Điểm (/10)</th>
                <th className="border border-slate-300 py-1.5 px-2 text-center w-24">Quy đổi</th>
              </tr>
            </thead>
            <tbody>
              {selected.evaluation.breakdown.map((row, idx) => (
                <tr key={row.criterionId}>
                  <td className="border border-slate-300 py-1.5 px-2 text-center">{idx + 1}</td>
                  <td className="border border-slate-300 py-1.5 px-2.5 font-medium">{row.name}</td>
                  <td className="border border-slate-300 py-1.5 px-2 text-center">{row.weight}%</td>
                  <td className="border border-slate-300 py-1.5 px-2 text-center font-bold">
                    {row.rawScore}
                  </td>
                  <td className="border border-slate-300 py-1.5 px-2 text-center font-bold">
                    {row.weightedPoints}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-extrabold">
                <td colSpan={2} className="border border-slate-300 py-1.5 px-2.5 text-right">
                  TỔNG CỘNG
                </td>
                <td className="border border-slate-300 py-1.5 px-2 text-center">
                  {selected.evaluation.totalWeight}%
                </td>
                <td className="border border-slate-300 py-1.5 px-2 text-center">—</td>
                <td className="border border-slate-300 py-1.5 px-2 text-center text-amber-700">
                  {selected.evaluation.totalScore}/100
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-2.5 grid grid-cols-1 gap-1.5 text-xs">
            <div className="rounded border border-slate-200 p-2">
              <strong>Tóm tắt CV:</strong> {selected.cvSummary || '—'}
            </div>
            <div className="rounded border border-slate-200 p-2">
              <strong>Lưu ý phỏng vấn & Xác minh:</strong> {selected.interviewNotes || '—'}
            </div>
          </div>
        </div>

        {/* Section 2: Role-play 15 minutes */}
        <div className="mt-5 page-break-inside-avoid">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2">
            II. PHIẾU CHẤM THI ROLE-PLAY THỰC TẾ (15 PHÚT)
          </h2>

          <div className="space-y-3">
            {DEFAULT_ROLEPLAY_SCENARIOS.map((sc, idx) => {
              const scoreVal = idx === 0 ? roleplay.rp1Score : roleplay.rp2Score;
              const notesVal = idx === 0 ? roleplay.rp1Notes : roleplay.rp2Notes;
              return (
                <div key={sc.id} className="rounded-lg border border-slate-300 p-3 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-bold text-slate-900">{sc.title}</div>
                    <div className="shrink-0 rounded border border-slate-300 bg-slate-50 px-2.5 py-0.5 font-extrabold">
                      Điểm: {scoreVal > 0 ? `${scoreVal}/10` : '_____ / 10'}
                    </div>
                  </div>
                  <p className="mt-1 text-slate-700 italic">{sc.prompt}</p>
                  <ul className="mt-1.5 list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                    {sc.checkpoints.map((cp, cIdx) => (
                      <li key={cIdx}>{cp}</li>
                    ))}
                  </ul>
                  <div className="mt-2 border-t border-dashed border-slate-300 pt-1.5">
                    <span className="font-semibold text-slate-600">Nhận xét thực tế: </span>
                    {notesVal ? (
                      <span>{notesVal}</span>
                    ) : (
                      <span className="text-slate-400">
                        ........................................................................................................................................
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Final Decision & Signatures */}
        <div className="mt-5 page-break-inside-avoid">
          <div className="rounded-lg border border-slate-300 p-3 text-xs flex flex-wrap items-center justify-between gap-2">
            <div>
              <strong>KẾT LUẬN CỦA HỘI ĐỒNG PHỎNG VẤN:</strong>{' '}
              <span className="ml-2 font-extrabold uppercase text-amber-800">
                {roleplay.interviewerDecision === 'hire'
                  ? '☑ ĐỀ XUẤT TUYỂN DỤNG'
                  : roleplay.interviewerDecision === 'consider'
                  ? '☑ CÂN NHẮC / THỬ VIỆC'
                  : roleplay.interviewerDecision === 'reject'
                  ? '☑ KHÔNG PHÙ HỢP'
                  : '☐ Đạt   ☐ Cân nhắc   ☐ Không đạt'}
              </span>
            </div>
            <div className="text-slate-500">Ngày PV: ____ / ____ / 202__</div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="font-bold uppercase">Đại diện Nhân sự (HR)</div>
              <div className="text-[11px] text-slate-500">(Ký & ghi rõ họ tên)</div>
              <div className="h-16" />
            </div>
            <div>
              <div className="font-bold uppercase">Quản lý Vận hành</div>
              <div className="text-[11px] text-slate-500">(Ký & ghi rõ họ tên)</div>
              <div className="h-16" />
            </div>
            <div>
              <div className="font-bold uppercase">Giám đốc Chuỗi Tutimi</div>
              <div className="text-[11px] text-slate-500">(Ký & ghi rõ họ tên)</div>
              <div className="h-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
