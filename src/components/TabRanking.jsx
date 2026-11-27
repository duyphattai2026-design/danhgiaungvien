import React, { useMemo, useState } from 'react';
import {
  Search,
  UserPlus,
  Trophy,
  SlidersHorizontal,
  Printer,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  AlertOctagon,
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function TabRanking({
  rankedCandidates,
  onOpenAddModal,
  onSelectForScoring,
  onSelectForPrint,
  onDeleteCandidate,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = useMemo(() => {
    const total = rankedCandidates.length;
    const pass = rankedCandidates.filter((c) => c.evaluation.statusKey === 'pass').length;
    const consider = rankedCandidates.filter((c) => c.evaluation.statusKey === 'consider').length;
    const failOrKnockout = rankedCandidates.filter(
      (c) => c.evaluation.statusKey === 'fail' || c.evaluation.statusKey === 'knockout'
    ).length;
    return { total, pass, consider, failOrKnockout };
  }, [rankedCandidates]);

  const filteredCandidates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rankedCandidates.filter((c) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'fail_group') {
          if (c.evaluation.statusKey !== 'fail' && c.evaluation.statusKey !== 'knockout') return false;
        } else if (c.evaluation.statusKey !== statusFilter) {
          return false;
        }
      }
      if (!q) return true;
      return (
        c.fullName.toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.address || '').toLowerCase().includes(q) ||
        (c.cvSummary || '').toLowerCase().includes(q)
      );
    });
  }, [rankedCandidates, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng hồ sơ</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.total}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">Ứng viên Store Manager</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">ĐẠT – Mời PV trực tiếp</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-700">{stats.pass}</p>
          <p className="mt-0.5 text-[11px] text-emerald-600">Ưu tiên đặt lịch phỏng vấn</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">CÂN NHẮC – PV điện thoại</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-amber-700">{stats.consider}</p>
          <p className="mt-0.5 text-[11px] text-amber-600">Sàng lọc nhanh 10 phút</p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700">Chưa đạt / Điểm liệt</span>
            <AlertOctagon className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-rose-700">{stats.failOrKnockout}</p>
          <p className="mt-0.5 text-[11px] text-rose-600">Dự phòng hoặc loại VSATTP</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo họ tên, SĐT, email, kinh nghiệm..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50/60 pl-9 pr-3.5 py-2 text-sm focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'pass', label: 'Đạt' },
              { id: 'consider', label: 'Cân nhắc' },
              { id: 'fail_group', label: 'Chưa đạt / Loại' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStatusFilter(item.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === item.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 shadow-xs shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          + Thêm ứng viên mới
        </button>
      </div>

      {/* Ranked Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 w-16 text-center">Hạng</th>
                <th className="py-3.5 px-4">Ứng viên & Liên hệ</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Tóm tắt năng lực F&B</th>
                <th className="py-3.5 px-4 text-center w-28">Tổng điểm</th>
                <th className="py-3.5 px-4 w-64">Kết quả sàng lọc</th>
                <th className="py-3.5 px-4 text-right w-48">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Không tìm thấy ứng viên nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cand, index) => (
                  <tr key={cand.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-4 px-4 text-center align-top">
                      <div
                        className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold ${
                          index === 0 && !cand.knockoutVSATTP
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {index === 0 && !cand.knockoutVSATTP ? (
                          <Trophy className="h-4 w-4 text-amber-600" />
                        ) : (
                          `#${index + 1}`
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 align-top">
                      <div className="font-bold text-slate-900 text-base">{cand.fullName}</div>
                      <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                        {cand.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{cand.phone}</span>
                          </div>
                        )}
                        {cand.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span>{cand.email}</span>
                          </div>
                        )}
                        {cand.address && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span>{cand.address}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 align-top hidden lg:table-cell max-w-md">
                      <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                        {cand.cvSummary || 'Chưa có tóm tắt CV.'}
                      </p>
                      {cand.interviewNotes && (
                        <p className="mt-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 line-clamp-2">
                          <span className="font-semibold">Lưu ý PV:</span> {cand.interviewNotes}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center align-top">
                      <div
                        className={`text-2xl font-extrabold ${
                          cand.knockoutVSATTP
                            ? 'text-rose-600 line-through'
                            : cand.evaluation.statusKey === 'pass'
                            ? 'text-emerald-600'
                            : cand.evaluation.statusKey === 'consider'
                            ? 'text-amber-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {cand.evaluation.totalScore}
                      </div>
                      <div className="text-[11px] font-medium text-slate-400">/ 100 điểm</div>
                    </td>

                    <td className="py-4 px-4 align-top">
                      <StatusBadge evaluation={cand.evaluation} />
                      {cand.knockoutVSATTP && cand.knockoutReason && (
                        <p className="mt-1.5 text-[11px] text-rose-600 font-medium">
                          Lý do: {cand.knockoutReason}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right align-top">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectForScoring(cand.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                          title="Chấm điểm & Xem CV song song"
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                          Chấm điểm
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectForPrint(cand.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          title="Xem & In phiếu A4"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          A4
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Xóa hồ sơ ứng viên "${cand.fullName}"?`)) {
                              onDeleteCandidate(cand.id);
                            }
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          title="Xóa ứng viên"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
