import React from 'react';
import {
  ClipboardCheck,
  Calendar,
  Users,
  AlertOctagon,
  CheckCircle2,
  Clock,
  XCircle,
  Printer,
  MessageSquare,
  ShieldCheck,
  Award,
  Store,
  PhoneCall,
  CheckSquare,
  Square,
  RotateCcw,
} from 'lucide-react';
import { DEFAULT_ROLEPLAY_SCENARIOS } from '../data/defaultData';
import StatusBadge from './StatusBadge';

const INTERVIEW_CRITERIA = [
  {
    key: 'attitudeScore',
    label: 'Thái độ, Tác phong & Phù hợp văn hóa Tutimi',
    desc: 'Sự cầu thị, tác phong chuyên nghiệp, tinh thần phục vụ khách hàng và năng lượng tích cực.',
    anchors: ['< 5: Thụ động / thiếu chuẩn mực', '5–7: Đạt yêu cầu cơ bản', '8–10: Tác phong lãnh đạo, cầu thị'],
  },
  {
    key: 'leadershipScore',
    label: 'Năng lực Dẫn dắt & Quản lý đội ngũ (20–30 NV)',
    desc: 'Cách phân ca giờ cao điểm, đào tạo nhân viên mới, tạo động lực và giữ chân part-time.',
    anchors: ['< 5: Quản lý cảm tính', '5–7: Có phương pháp cơ bản', '8–10: Hệ thống bài bản, thực chiến'],
  },
  {
    key: 'verificationScore',
    label: 'Độ trung thực & Xác minh CV / Người tham chiếu',
    desc: 'Giải trình rõ ràng các mốc thời gian, số liệu doanh thu/COGS/COL và kết quả check tham chiếu.',
    anchors: ['< 5: Mập mờ / thiếu nhất quán', '5–7: Khớp cơ bản', '8–10: Minh bạch, số liệu sắc nét'],
  },
];

const QUICK_SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function computeInterviewSummary(roleplay = {}) {
  const rp1 = Number(roleplay.rp1Score || 0);
  const rp2 = Number(roleplay.rp2Score || 0);
  const att = Number(roleplay.attitudeScore || 0);
  const lead = Number(roleplay.leadershipScore || 0);
  const ver = Number(roleplay.verificationScore || 0);

  const hasAnyScore = rp1 > 0 || rp2 > 0 || att > 0 || lead > 0 || ver > 0;
  const roleplayAvg = (rp1 + rp2) / 2;
  const interviewAvg = (att + lead + ver) / 3;
  const overallInterview = Math.round((roleplayAvg * 0.5 + interviewAvg * 0.5) * 10) / 10;

  let tierLabel = 'Chưa chấm điểm';
  let tierColor = 'text-slate-500 bg-slate-100 border-slate-200';
  if (hasAnyScore) {
    if (overallInterview >= 8.5) {
      tierLabel = 'Xuất sắc – Sẵn sàng nhận việc';
      tierColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    } else if (overallInterview >= 7.0) {
      tierLabel = 'Đạt chuẩn Store Manager';
      tierColor = 'text-teal-700 bg-teal-50 border-teal-200';
    } else if (overallInterview >= 5.5) {
      tierLabel = 'Cần cân nhắc / Đào tạo thêm';
      tierColor = 'text-amber-700 bg-amber-50 border-amber-200';
    } else {
      tierLabel = 'Chưa đạt yêu cầu';
      tierColor = 'text-rose-700 bg-rose-50 border-rose-200';
    }
  }

  return {
    hasAnyScore,
    roleplayAvg: Math.round(roleplayAvg * 10) / 10,
    interviewAvg: Math.round(interviewAvg * 10) / 10,
    overallInterview,
    tierLabel,
    tierColor,
  };
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
}

export default function TabInterviewEvaluation({
  rankedCandidates,
  selectedCandidateId,
  onSelectCandidate,
  onUpdateCandidate,
  onGoToPrint,
}) {
  const selected =
    rankedCandidates.find((c) => c.id === selectedCandidateId) || rankedCandidates[0] || null;

  if (!selected) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        Chưa có ứng viên nào để đánh giá phỏng vấn.
      </div>
    );
  }

  const roleplay = {
    rp1Score: 0,
    rp1Notes: '',
    rp1Checks: [],
    rp2Score: 0,
    rp2Notes: '',
    rp2Checks: [],
    attitudeScore: 0,
    leadershipScore: 0,
    verificationScore: 0,
    interviewFormat: 'Trực tiếp tại cửa hàng',
    interviewDate: '',
    panelNames: 'HR / Quản lý Vận hành / Giám đốc Chuỗi',
    interviewerDecision: 'pending',
    proposedSalary: '',
    availableDate: '',
    targetStore: '',
    referenceVerified: false,
    overallFeedback: '',
    ...(selected.roleplay || {}),
  };

  const updateRoleplay = (patch) => {
    onUpdateCandidate(selected.id, {
      roleplay: {
        ...roleplay,
        ...patch,
      },
    });
  };

  const handleResetInterview = () => {
    if (
      !window.confirm(
        `Xóa toàn bộ kết quả phỏng vấn hiện tại của "${selected.fullName}" để đánh giá lại từ đầu?`
      )
    ) {
      return;
    }
    onUpdateCandidate(selected.id, {
      roleplay: {
        rp1Score: 0,
        rp1Notes: '',
        rp1Checks: [],
        rp2Score: 0,
        rp2Notes: '',
        rp2Checks: [],
        attitudeScore: 0,
        leadershipScore: 0,
        verificationScore: 0,
        interviewFormat: 'Trực tiếp tại cửa hàng',
        interviewDate: '',
        panelNames: 'HR / Quản lý Vận hành / Giám đốc Chuỗi',
        interviewerDecision: 'pending',
        proposedSalary: '',
        availableDate: '',
        targetStore: '',
        referenceVerified: false,
        overallFeedback: '',
      },
    });
  };

  const toggleCheckpoint = (checksKey, cpIndex) => {
    const current = Array.isArray(roleplay[checksKey]) ? roleplay[checksKey] : [];
    const next = current.includes(cpIndex)
      ? current.filter((i) => i !== cpIndex)
      : [...current, cpIndex];
    updateRoleplay({ [checksKey]: next });
  };

  const summary = computeInterviewSummary(roleplay);

  const decisionOptions = [
    {
      id: 'hire',
      label: 'Đề xuất Tuyển dụng',
      sub: 'Đạt chuẩn, tiến hành gửi Offer',
      icon: CheckCircle2,
      activeClass: 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20',
      iconClass: 'text-emerald-600',
    },
    {
      id: 'consider',
      label: 'Cân nhắc / Vòng 2',
      sub: 'Theo dõi thêm hoặc thử việc',
      icon: Clock,
      activeClass: 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20',
      iconClass: 'text-amber-600',
    },
    {
      id: 'reject',
      label: 'Không phù hợp',
      sub: 'Không đạt yêu cầu vị trí',
      icon: XCircle,
      activeClass: 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20',
      iconClass: 'text-rose-600',
    },
    {
      id: 'pending',
      label: 'Chờ đánh giá',
      sub: 'Chưa chốt quyết định cuối',
      icon: ClipboardCheck,
      activeClass: 'border-slate-500 bg-slate-100 text-slate-900 ring-2 ring-slate-400/30',
      iconClass: 'text-slate-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* EXECUTIVE SCORECARD HEADER */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-4 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-base shrink-0 shadow-xs">
              {getInitials(selected.fullName)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selected.id}
                  onChange={(e) => onSelectCandidate(e.target.value)}
                  className="rounded-lg bg-slate-800 border border-slate-600 px-2.5 py-1 text-sm font-bold text-white focus:border-amber-400 focus:outline-none"
                >
                  {rankedCandidates.map((c, idx) => (
                    <option key={c.id} value={c.id}>
                      #{idx + 1} — {c.fullName}
                    </option>
                  ))}
                </select>
                <StatusBadge evaluation={selected.evaluation} compact />
              </div>
              <p className="mt-1 text-xs text-slate-300 truncate">
                {selected.phone || 'Chưa có SĐT'} • {selected.email || 'Chưa có email'} •{' '}
                {selected.address || 'TP.HCM'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-4 rounded-xl bg-slate-800/90 border border-slate-700 px-4 py-2">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Sàng lọc CV</div>
                <div className="text-sm font-extrabold text-white">
                  {selected.evaluation.totalScore}
                  <span className="text-[11px] font-normal text-slate-400">/100</span>
                </div>
              </div>
              <div className="h-7 w-px bg-slate-700" />
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Role-play</div>
                <div className="text-sm font-extrabold text-amber-400">
                  {summary.roleplayAvg}
                  <span className="text-[11px] font-normal text-slate-400">/10</span>
                </div>
              </div>
              <div className="h-7 w-px bg-slate-700" />
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Năng lực PV</div>
                <div className="text-sm font-extrabold text-sky-400">
                  {summary.interviewAvg}
                  <span className="text-[11px] font-normal text-slate-400">/10</span>
                </div>
              </div>
              <div className="h-7 w-px bg-slate-700" />
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">
                  Tổng điểm PV
                </div>
                <div className="text-lg font-extrabold text-emerald-400">
                  {summary.overallInterview}
                  <span className="text-xs font-normal text-slate-400">/10</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetInterview}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/40 bg-rose-500/20 px-3 py-2.5 text-xs font-bold text-rose-200 hover:bg-rose-500/30 shrink-0"
              title="Xóa kết quả phỏng vấn để chấm lại"
            >
              <RotateCcw className="h-4 w-4" />
              Xóa đánh giá PV
            </button>

            <button
              type="button"
              onClick={() => onGoToPrint(selected.id)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 shadow-xs shrink-0"
            >
              <Printer className="h-4 w-4" />
              Xuất Phiếu A4
            </button>
          </div>
        </div>

        {/* Interview Session Metadata Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 px-5 py-3.5 border-t border-slate-200">
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-1">
              <Calendar className="h-3.5 w-3.5 text-amber-600" />
              Ngày phỏng vấn
            </label>
            <input
              type="date"
              value={roleplay.interviewDate || ''}
              onChange={(e) => updateRoleplay({ interviewDate: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-1">
              <MessageSquare className="h-3.5 w-3.5 text-amber-600" />
              Hình thức phỏng vấn
            </label>
            <select
              value={roleplay.interviewFormat || 'Trực tiếp tại cửa hàng'}
              onChange={(e) => updateRoleplay({ interviewFormat: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-amber-500 focus:outline-none"
            >
              <option value="Trực tiếp tại cửa hàng">Trực tiếp tại cửa hàng (Role-play)</option>
              <option value="Phỏng vấn điện thoại (10 phút)">Phỏng vấn điện thoại (10 phút)</option>
              <option value="Phỏng vấn Online (Google Meet / Zoom)">Phỏng vấn Online (Google Meet / Zoom)</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-1">
              <Users className="h-3.5 w-3.5 text-amber-600" />
              Hội đồng phỏng vấn
            </label>
            <input
              type="text"
              value={roleplay.panelNames || ''}
              onChange={(e) => updateRoleplay({ panelNames: e.target.value })}
              placeholder="HR / Quản lý Vận hành / Giám đốc"
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <label
              className={`w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 cursor-pointer transition ${
                roleplay.referenceVerified
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                <PhoneCall className="h-3.5 w-3.5" />
                Đã check người tham chiếu
              </span>
              <input
                type="checkbox"
                checked={Boolean(roleplay.referenceVerified)}
                onChange={(e) => updateRoleplay({ referenceVerified: e.target.checked })}
                className="h-4 w-4 rounded text-emerald-600"
              />
            </label>
          </div>
        </div>
      </div>

      {/* BODY: 2-COLUMN STRUCTURED SCORECARD */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (7/12): ROLE-PLAY THỰC CHIẾN */}
        <div className="xl:col-span-7 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Phần 1: Đánh giá Role-play Thực Chiến (15 phút)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tích chọn các hành động đạt chuẩn của ứng viên &amp; chấm điểm nhanh từ 1–10.
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-800">
                TB: {summary.roleplayAvg} / 10
              </span>
            </div>

            <div className="p-5 space-y-5">
              {DEFAULT_ROLEPLAY_SCENARIOS.map((sc, idx) => {
                const scoreKey = idx === 0 ? 'rp1Score' : 'rp2Score';
                const notesKey = idx === 0 ? 'rp1Notes' : 'rp2Notes';
                const checksKey = idx === 0 ? 'rp1Checks' : 'rp2Checks';
                const scoreVal = Number(roleplay[scoreKey] || 0);
                const notesVal = roleplay[notesKey] || '';
                const checkedList = Array.isArray(roleplay[checksKey]) ? roleplay[checksKey] : [];

                return (
                  <div
                    key={sc.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white mb-1">
                          Tình huống {idx + 1}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900">
                          {sc.title.replace(/^Tình huống \d+:\s*/, '')}
                        </h4>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                          {sc.prompt}
                        </p>
                      </div>
                      <div className="shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-center min-w-[68px]">
                        <div className="text-[10px] font-bold uppercase text-amber-700">Điểm</div>
                        <div className="text-lg font-extrabold text-amber-800 leading-tight">
                          {scoreVal}
                          <span className="text-xs font-medium text-amber-600">/10</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Checklist */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Tiêu chí quan sát thực tế ({checkedList.length}/{sc.checkpoints.length} đạt)
                      </div>
                      {sc.checkpoints.map((cp, cIdx) => {
                        const isChecked = checkedList.includes(cIdx);
                        return (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => toggleCheckpoint(checksKey, cIdx)}
                            className={`w-full flex items-start gap-2.5 rounded-xl border px-3 py-2 text-left text-xs transition ${
                              isChecked
                                ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950 font-medium'
                                : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100/70'
                            }`}
                          >
                            {isChecked ? (
                              <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <Square className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                            )}
                            <span className="leading-snug">{cp}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick 1-10 Pill Bar */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                        <span>Chấm điểm nhanh:</span>
                        <span className="text-slate-400 font-normal">Hoặc nhập số lẻ (VD: 7.5)</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {QUICK_SCORES.map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() =>
                              updateRoleplay({ [scoreKey]: scoreVal === num ? 0 : num })
                            }
                            className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                              scoreVal === num
                                ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-500/30'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={scoreVal}
                          onChange={(e) =>
                            updateRoleplay({
                              [scoreKey]: Math.max(0, Math.min(10, Number(e.target.value) || 0)),
                            })
                          }
                          className="ml-auto h-8 w-16 rounded-lg border border-slate-300 px-2 text-center text-xs font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={notesVal}
                      onChange={(e) => updateRoleplay({ [notesKey]: e.target.value })}
                      placeholder="Ghi nhận phản ứng thực tế, thái độ và cách giải quyết của ứng viên..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                );
              })}

              {/* Knock-out Rule Card */}
              <div
                className={`rounded-xl border p-4 transition ${
                  selected.knockoutVSATTP
                    ? 'border-rose-400 bg-rose-50'
                    : 'border-slate-200 bg-slate-50'
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
                      <div className="text-xs font-extrabold text-slate-900">
                        Cảnh báo Điểm Liệt VSATTP trong buổi phỏng vấn
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Đánh dấu nếu ứng viên đồng ý giữ lại trân châu/nguyên liệu qua đêm hoặc xem nhẹ VSATTP.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(selected.knockoutVSATTP)}
                    onChange={(e) =>
                      onUpdateCandidate(selected.id, {
                        knockoutVSATTP: e.target.checked,
                        ...(e.target.checked ? {} : { knockoutReason: '' }),
                      })
                    }
                    className="h-5 w-5 rounded text-rose-600 mt-0.5"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5/12): COMPETENCY RUBRIC & EXECUTIVE DECISION */}
        <div className="xl:col-span-5 space-y-5">
          {/* Competency Rubric */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Phần 2: Năng lực Phỏng vấn</h3>
                  <p className="text-[11px] text-slate-500">Chiếm 50% tổng điểm phỏng vấn.</p>
                </div>
              </div>
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-extrabold text-sky-800">
                TB: {summary.interviewAvg} / 10
              </span>
            </div>

            <div className="p-5 space-y-4">
              {INTERVIEW_CRITERIA.map((item) => {
                const val = Number(roleplay[item.key] || 0);
                return (
                  <div
                    key={item.key}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">{item.label}</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-xs font-extrabold text-sky-700">
                        {val}/10
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {QUICK_SCORES.map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => updateRoleplay({ [item.key]: val === num ? 0 : num })}
                          className={`h-7 w-7 rounded-md text-[11px] font-bold transition ${
                            val === num
                              ? 'bg-sky-600 text-white shadow-2xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-500">
                      {item.anchors.map((anc, aIdx) => (
                        <span key={aIdx} className="rounded bg-white px-1.5 py-0.5 border border-slate-200">
                          {anc}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Executive Decision & Offer Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-3.5">
              <h3 className="text-sm font-bold text-slate-900">Phần 3: Quyết định Tuyển dụng</h3>
              <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${summary.tierColor}`}>
                {summary.tierLabel}
              </span>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {decisionOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = roleplay.interviewerDecision === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateRoleplay({ interviewerDecision: opt.id })}
                      className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? opt.activeClass
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${isSelected ? opt.iconClass : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs font-extrabold">{opt.label}</div>
                        <div className="text-[10px] opacity-80 mt-0.5">{opt.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Mức lương đề xuất
                  </label>
                  <input
                    type="text"
                    value={roleplay.proposedSalary || ''}
                    onChange={(e) => updateRoleplay({ proposedSalary: e.target.value })}
                    placeholder="VD: 16–18 triệu + KPI"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Ngày có thể nhận việc
                  </label>
                  <input
                    type="text"
                    value={roleplay.availableDate || ''}
                    onChange={(e) => updateRoleplay({ availableDate: e.target.value })}
                    placeholder="VD: Nhận việc ngay / 01/12"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-1">
                  <Store className="h-3.5 w-3.5 text-amber-600" />
                  Chi nhánh dự kiến phân công
                </label>
                <input
                  type="text"
                  value={roleplay.targetStore || ''}
                  onChange={(e) => updateRoleplay({ targetStore: e.target.value })}
                  placeholder="VD: Tutimi Sư Vạn Hạnh (Q.10) / Chi nhánh mới"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Kết luận &amp; Nhận xét chung của Hội đồng
                </label>
                <textarea
                  rows={3}
                  value={roleplay.overallFeedback || ''}
                  onChange={(e) => updateRoleplay({ overallFeedback: e.target.value })}
                  placeholder="Tóm tắt điểm nổi bật, rủi ro cần lưu ý khi thử việc hoặc lý do từ chối..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 leading-relaxed focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
