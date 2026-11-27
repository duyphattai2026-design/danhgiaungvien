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
} from 'lucide-react';
import { DEFAULT_ROLEPLAY_SCENARIOS } from '../data/defaultData';
import StatusBadge from './StatusBadge';

const INTERVIEW_CRITERIA = [
  {
    key: 'attitudeScore',
    label: 'Thái độ, Tác phong & Phù hợp văn hóa Tutimi',
    desc: 'Sự cầu thị, chuyên nghiệp, tinh thần phục vụ khách hàng và năng lượng tích cực.',
  },
  {
    key: 'leadershipScore',
    label: 'Năng lực Dẫn dắt & Quản lý đội ngũ (20–30 NV)',
    desc: 'Cách phân ca, đào tạo, tạo động lực và giữ chân nhân sự part-time/full-time.',
  },
  {
    key: 'verificationScore',
    label: 'Độ trung thực & Xác minh CV / Người tham chiếu',
    desc: 'Giải trình rõ ràng các mốc thời gian, số liệu doanh thu/COGS/COL và thông tin tham chiếu.',
  },
];

export function computeInterviewSummary(roleplay = {}) {
  const rp1 = Number(roleplay.rp1Score || 0);
  const rp2 = Number(roleplay.rp2Score || 0);
  const att = Number(roleplay.attitudeScore || 0);
  const lead = Number(roleplay.leadershipScore || 0);
  const ver = Number(roleplay.verificationScore || 0);

  const hasAnyScore = rp1 > 0 || rp2 > 0 || att > 0 || lead > 0 || ver > 0;
  // 50% Role-play (2 bài) + 50% Phỏng vấn trực tiếp (3 tiêu chí)
  const roleplayAvg = (rp1 + rp2) / 2;
  const interviewAvg = (att + lead + ver) / 3;
  const overallInterview = Math.round((roleplayAvg * 0.5 + interviewAvg * 0.5) * 10) / 10;

  return {
    hasAnyScore,
    roleplayAvg: Math.round(roleplayAvg * 10) / 10,
    interviewAvg: Math.round(interviewAvg * 10) / 10,
    overallInterview,
  };
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
    rp2Score: 0,
    rp2Notes: '',
    attitudeScore: 0,
    leadershipScore: 0,
    verificationScore: 0,
    interviewFormat: 'Trực tiếp tại cửa hàng',
    interviewDate: '',
    panelNames: 'HR / Quản lý Vận hành / Giám đốc Chuỗi',
    interviewerDecision: 'pending',
    proposedSalary: '',
    availableDate: '',
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

  const summary = computeInterviewSummary(roleplay);

  const decisionOptions = [
    {
      id: 'hire',
      label: 'ĐỀ XUẤT TUYỂN DỤNG',
      sub: 'Đạt chuẩn Store Manager Tutimi',
      icon: CheckCircle2,
      activeClass: 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20',
    },
    {
      id: 'consider',
      label: 'CÂN NHẮC / THỬ VIỆC',
      sub: 'Cần thêm vòng 2 hoặc theo dõi',
      icon: Clock,
      activeClass: 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20',
    },
    {
      id: 'reject',
      label: 'KHÔNG PHÙ HỢP',
      sub: 'Lưu hồ sơ hoặc loại',
      icon: XCircle,
      activeClass: 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20',
    },
    {
      id: 'pending',
      label: 'CHỜ PHỎNG VẤN',
      sub: 'Chưa chốt kết quả',
      icon: ClipboardCheck,
      activeClass: 'border-slate-500 bg-slate-100 text-slate-800 ring-2 ring-slate-500/20',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Candidate Switcher & Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Ứng viên phỏng vấn:
          </span>
          <select
            value={selected.id}
            onChange={(e) => onSelectCandidate(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
          >
            {rankedCandidates.map((c, idx) => (
              <option key={c.id} value={c.id}>
                #{idx + 1} — {c.fullName} (CV: {c.evaluation.totalScore}/100)
              </option>
            ))}
          </select>
          <StatusBadge evaluation={selected.evaluation} compact />
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs">
            <span className="text-slate-600 font-medium">Điểm PV tổng hợp: </span>
            <strong className="text-amber-800 text-sm">{summary.overallInterview} / 10</strong>
          </div>
          <button
            type="button"
            onClick={() => onGoToPrint(selected.id)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <Printer className="h-3.5 w-3.5" />
            Xuất Phiếu A4
          </button>
        </div>
      </div>

      {/* Interview Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
            <Calendar className="h-3.5 w-3.5 text-amber-600" />
            Ngày phỏng vấn
          </label>
          <input
            type="date"
            value={roleplay.interviewDate || ''}
            onChange={(e) => updateRoleplay({ interviewDate: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-amber-600" />
            Hình thức phỏng vấn
          </label>
          <select
            value={roleplay.interviewFormat || 'Trực tiếp tại cửa hàng'}
            onChange={(e) => updateRoleplay({ interviewFormat: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none"
          >
            <option value="Trực tiếp tại cửa hàng">Trực tiếp tại cửa hàng (Role-play)</option>
            <option value="Phỏng vấn điện thoại (10 phút)">Phỏng vấn điện thoại (10 phút)</option>
            <option value="Phỏng vấn Online (Google Meet / Zoom)">Phỏng vấn Online (Google Meet / Zoom)</option>
          </select>
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
            <Users className="h-3.5 w-3.5 text-amber-600" />
            Hội đồng phỏng vấn
          </label>
          <input
            type="text"
            value={roleplay.panelNames || ''}
            onChange={(e) => updateRoleplay({ panelNames: e.target.value })}
            placeholder="VD: Chị Lan (HR) - Anh Minh (QLVH)"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Grid: Left Role-play, Right Interview Competencies + Decision */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT: 2 ROLE-PLAY SCENARIOS */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  I. Đánh giá Role-play Thực Chiến (15 phút)
                </h3>
                <p className="text-xs text-slate-500">
                  Chiếm 50% điểm phỏng vấn — kiểm tra phản xạ CSKH & kỷ luật QSC/5S thực tế.
                </p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800">
                TB Role-play: {summary.roleplayAvg}/10
              </span>
            </div>

            {DEFAULT_ROLEPLAY_SCENARIOS.map((sc, idx) => {
              const scoreKey = idx === 0 ? 'rp1Score' : 'rp2Score';
              const notesKey = idx === 0 ? 'rp1Notes' : 'rp2Notes';
              const scoreVal = Number(roleplay[scoreKey] || 0);
              const notesVal = roleplay[notesKey] || '';

              return (
                <div key={sc.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{sc.title}</h4>
                      <p className="mt-1 text-xs text-slate-600 italic">{sc.prompt}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-lg font-extrabold text-amber-700">{scoreVal}</span>
                      <span className="text-xs text-slate-400 font-semibold">/10</span>
                    </div>
                  </div>

                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                    {sc.checkpoints.map((cp, cIdx) => (
                      <li key={cIdx}>{cp}</li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={scoreVal}
                      onChange={(e) => updateRoleplay({ [scoreKey]: Number(e.target.value) || 0 })}
                      className="flex-1 accent-amber-600 cursor-pointer"
                    />
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
                      className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1 text-center text-xs font-bold"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={notesVal}
                    onChange={(e) => updateRoleplay({ [notesKey]: e.target.value })}
                    placeholder="Ghi nhận cách ứng viên xử lý tình huống thực tế..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              );
            })}

            {/* Knock-out reminder */}
            <div
              className={`rounded-xl border p-3.5 ${
                selected.knockoutVSATTP
                  ? 'border-rose-300 bg-rose-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <div className="flex items-center gap-2">
                  <AlertOctagon
                    className={`h-4 w-4 ${selected.knockoutVSATTP ? 'text-rose-600' : 'text-slate-400'}`}
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Vi phạm Điểm Liệt VSATTP khi Role-play (VD: giữ trân châu qua đêm)?
                  </span>
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
                  className="h-4 w-4 rounded text-rose-600"
                />
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT: INTERVIEW COMPETENCIES & FINAL DECISION */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  II. Năng lực Phỏng vấn Trực tiếp
                </h3>
                <p className="text-xs text-slate-500">Chiếm 50% điểm phỏng vấn.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
                TB Năng lực: {summary.interviewAvg}/10
              </span>
            </div>

            <div className="space-y-3">
              {INTERVIEW_CRITERIA.map((item) => {
                const val = Number(roleplay[item.key] || 0);
                return (
                  <div key={item.key} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800">{item.label}</span>
                      <span className="text-xs font-extrabold text-amber-700 shrink-0">{val}/10</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    <div className="mt-2 flex items-center gap-2.5">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={val}
                        onChange={(e) => updateRoleplay({ [item.key]: Number(e.target.value) || 0 })}
                        className="flex-1 accent-amber-600 cursor-pointer"
                      />
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={val}
                        onChange={(e) =>
                          updateRoleplay({
                            [item.key]: Math.max(0, Math.min(10, Number(e.target.value) || 0)),
                          })
                        }
                        className="w-14 rounded-lg border border-slate-300 bg-white px-1.5 py-1 text-center text-xs font-bold"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final Decision Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">III. Kết luận của Hội đồng Phỏng vấn</h3>

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
                    <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-extrabold">{opt.label}</div>
                      <div className="text-[10px] opacity-80">{opt.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Mức lương đề xuất / Thỏa thuận
                </label>
                <input
                  type="text"
                  value={roleplay.proposedSalary || ''}
                  onChange={(e) => updateRoleplay({ proposedSalary: e.target.value })}
                  placeholder="VD: 16–18 triệu + KPI"
                  className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
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
                  placeholder="VD: Nhận việc ngay / Sau 15 ngày"
                  className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Nhận xét tổng hợp sau phỏng vấn
              </label>
              <textarea
                rows={3}
                value={roleplay.overallFeedback || ''}
                onChange={(e) => updateRoleplay({ overallFeedback: e.target.value })}
                placeholder="Ghi chú quyết định cuối cùng, điểm lưu ý khi onboard hoặc lý do không phù hợp..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
