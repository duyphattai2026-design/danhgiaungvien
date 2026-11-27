import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

export default function AddCandidateModal({ isOpen, onClose, onAdd, criteria }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [cvSummary, setCvSummary] = useState('');
  const [cvLinkUrl, setCvLinkUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const initialScores = {};
    criteria.forEach((c) => {
      initialScores[c.id] = 5;
    });

    const newCandidate = {
      id: `cand-${Date.now()}`,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      appliedPosition: 'Quản lý Cửa hàng (Store Manager)',
      createdAt: new Date().toISOString(),
      scores: initialScores,
      knockoutVSATTP: false,
      knockoutReason: '',
      cvSummary: cvSummary.trim(),
      strengths: '',
      weaknesses: '',
      interviewNotes: '',
      suggestedQuestions: [
        'Kể lại kinh nghiệm quản lý ca đông nhất (20–30 nhân sự) và cách bạn giữ chân nhân viên part-time?',
        'Khi phát hiện nguyên liệu/topping qua đêm còn dư, quy trình xử lý của bạn tại cửa hàng là gì?',
        'Bạn xử lý thế nào nếu khách phản ánh chờ nước quá lâu vào tối cuối tuần?',
      ],
      cvSourceType: cvLinkUrl.trim() ? 'link' : 'summary',
      cvFileName: '',
      cvFileDataUrl: '',
      cvFileMimeType: '',
      cvLinkUrl: cvLinkUrl.trim(),
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

    onAdd(newCandidate);
    setFullName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setCvSummary('');
    setCvLinkUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 bg-amber-50/70 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Thêm ứng viên mới</h3>
              <p className="text-xs text-slate-500">Vị trí Quản lý Cửa hàng – Chuỗi Trà Sữa Tutimi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Họ và tên ứng viên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="090xxxxxxx"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@gmail.com"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ / Khu vực</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: Quận 3, TP.HCM"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Link CV (Google Drive / TopCV - tùy chọn)
            </label>
            <input
              type="url"
              value={cvLinkUrl}
              onChange={(e) => setCvLinkUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tóm tắt kinh nghiệm F&B</label>
            <textarea
              rows={3}
              value={cvSummary}
              onChange={(e) => setCvSummary(e.target.value)}
              placeholder="Nhập tóm tắt quá trình làm việc, quy mô nhân sự, chuỗi đã làm..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700 shadow-xs"
            >
              Lưu & Chấm điểm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
