import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DEFAULT_ROLEPLAY_SCENARIOS } from '../data/defaultData';

let cachedFonts = null;

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function loadVietnameseFonts() {
  if (cachedFonts) return cachedFonts;
  const [regRes, boldRes] = await Promise.all([
    fetch('/fonts/Roboto-Regular.ttf'),
    fetch('/fonts/Roboto-Bold.ttf'),
  ]);
  if (!regRes.ok || !boldRes.ok) {
    throw new Error('Không thể tải font tiếng Việt để xuất PDF.');
  }
  const [regBuf, boldBuf] = await Promise.all([regRes.arrayBuffer(), boldRes.arrayBuffer()]);
  cachedFonts = {
    regular: arrayBufferToBase64(regBuf),
    bold: arrayBufferToBase64(boldBuf),
  };
  return cachedFonts;
}

export function toSlug(str = '') {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const DECISION_LABEL = {
  hire: 'ĐỀ XUẤT TUYỂN DỤNG',
  consider: 'CÂN NHẮC / VÒNG 2',
  reject: 'KHÔNG PHÙ HỢP',
  pending: 'CHỜ PHỎNG VẤN',
};

export async function exportCandidatePdf({ candidate, interviewSummary }) {
  const fonts = await loadVietnameseFonts();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.addFileToVFS('Roboto-Regular.ttf', fonts.regular);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.addFileToVFS('Roboto-Bold.ttf', fonts.bold);
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
  doc.setFont('Roboto', 'normal');

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 13;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  const ensureSpace = (neededMm) => {
    if (y + neededMm > pageHeight - 14) {
      doc.addPage();
      y = 14;
    }
  };

  // HEADER
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text('CHUỖI TRÀ SỮA TUTIMI • PHÒNG NHÂN SỰ & VẬN HÀNH', margin, y);

  doc.setFont('Roboto', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Mã HS: ${candidate.id.slice(-6).toUpperCase()}`, pageWidth - margin, y, { align: 'right' });

  y += 5.5;
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(13.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PHIẾU ĐÁNH GIÁ HỒ SƠ & PHỎNG VẤN THỰC CHIẾN', margin, y);

  doc.setFont('Roboto', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, pageWidth - margin, y, {
    align: 'right',
  });

  y += 4.5;
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'Vị trí: Quản lý Cửa hàng (Store Manager) — Quy mô > 1 tỷ/tháng • 20–30 nhân sự • Dine-in đông',
    margin,
    y
  );

  y += 2.5;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // CANDIDATE INFO BOX
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      font: 'Roboto',
      fontSize: 8.5,
      cellPadding: 2,
      textColor: [15, 23, 42],
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
    },
    body: [
      [
        { content: `Họ và tên: ${candidate.fullName}`, styles: { fontStyle: 'bold' } },
        { content: `Điện thoại: ${candidate.phone || '—'}` },
      ],
      [
        { content: `Email: ${candidate.email || '—'}` },
        { content: `Địa chỉ: ${candidate.address || '—'}` },
      ],
    ],
  });
  y = doc.lastAutoTable.finalY + 3;

  // 2-COLUMN SUMMARY (Hồ sơ CV vs Kết quả PV)
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
    interviewerDecision: 'pending',
    proposedSalary: '',
    availableDate: '',
    targetStore: '',
    referenceVerified: false,
    overallFeedback: '',
    ...(candidate.roleplay || {}),
  };

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      font: 'Roboto',
      fontSize: 8.5,
      cellPadding: 2.5,
      textColor: [15, 23, 42],
      lineColor: [203, 213, 225],
      lineWidth: 0.25,
    },
    body: [
      [
        {
          content: `CỘT 1: KẾT QUẢ ĐÁNH GIÁ HỒ SƠ (CV)\n${candidate.evaluation.totalScore}/100 điểm — ${candidate.evaluation.statusShort}`,
          styles: { fontStyle: 'bold', fillColor: [248, 250, 252] },
        },
        {
          content: `CỘT 2: KẾT QUẢ PHỎNG VẤN THỰC CHIẾN\n${
            interviewSummary.hasAnyScore ? `${interviewSummary.overallInterview}/10 điểm` : 'Chưa chấm PV'
          } — ${DECISION_LABEL[roleplay.interviewerDecision] || 'CHỜ PHỎNG VẤN'}`,
          styles: { fontStyle: 'bold', fillColor: [255, 251, 235] },
        },
      ],
    ],
  });
  y = doc.lastAutoTable.finalY + 5;

  // SECTION I: CV SCREENING TABLE
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('I. KẾT QUẢ SÀNG LỌC HỒ SƠ (THANG 100 ĐIỂM)', margin, y);
  y += 2.5;

  if (candidate.knockoutVSATTP) {
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(190, 18, 60);
    doc.text(
      `! CẢNH BÁO ĐIỂM LIỆT VSATTP: LOẠI TRỰC TIẾP ${
        candidate.knockoutReason ? `(${candidate.knockoutReason})` : ''
      }`,
      margin,
      y + 2
    );
    y += 5;
  }

  const cvRows = candidate.evaluation.breakdown.map((row, idx) => [
    String(idx + 1),
    row.name,
    `${row.weight}%`,
    String(row.rawScore),
    String(row.weightedPoints),
  ]);
  cvRows.push([
    { content: 'TỔNG CỘNG', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
    { content: `${candidate.evaluation.totalWeight}%`, styles: { halign: 'center', fontStyle: 'bold' } },
    { content: '—', styles: { halign: 'center' } },
    {
      content: `${candidate.evaluation.totalScore}/100`,
      styles: { halign: 'center', fontStyle: 'bold', textColor: [180, 83, 9] },
    },
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['STT', 'Tiêu chí đánh giá', 'Trọng số', 'Điểm (/10)', 'Quy đổi']],
    body: cvRows,
    theme: 'grid',
    styles: {
      font: 'Roboto',
      fontSize: 8,
      cellPadding: 1.8,
      textColor: [15, 23, 42],
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'left' },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 20 },
      4: { halign: 'center', cellWidth: 22, fontStyle: 'bold' },
    },
  });
  y = doc.lastAutoTable.finalY + 3;

  // CV Summary & Interview Notes
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      font: 'Roboto',
      fontSize: 8,
      cellPadding: 2,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
    },
    body: [
      [`Tóm tắt CV: ${candidate.cvSummary || '—'}`],
      [`Lưu ý phỏng vấn & Xác minh: ${candidate.interviewNotes || '—'}`],
    ],
  });
  y = doc.lastAutoTable.finalY + 5;

  // SECTION II: ROLE-PLAY 15 MINUTES
  ensureSpace(45);
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('II. PHIẾU CHẤM THI ROLE-PLAY THỰC TẾ (15 PHÚT)', margin, y);
  y += 2.5;

  const rpRows = DEFAULT_ROLEPLAY_SCENARIOS.map((sc, idx) => {
    const scoreVal = idx === 0 ? roleplay.rp1Score : roleplay.rp2Score;
    const notesVal = idx === 0 ? roleplay.rp1Notes : roleplay.rp2Notes;
    return [
      `${sc.title}\n${sc.prompt}\nNhận xét: ${notesVal || '..............................................................'}`,
      scoreVal > 0 ? `${scoreVal}/10` : '___/10',
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Tình huống & Nhận xét thực tế', 'Điểm (/10)']],
    body: rpRows,
    theme: 'grid',
    styles: {
      font: 'Roboto',
      fontSize: 8,
      cellPadding: 2,
      textColor: [15, 23, 42],
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'center', cellWidth: 24, fontStyle: 'bold', valign: 'middle' },
    },
  });
  y = doc.lastAutoTable.finalY + 5;

  // SECTION III: INTERVIEW COMPETENCIES & FINAL DECISION
  ensureSpace(65);
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `III. KẾT QUẢ PHỎNG VẤN TRỰC TIẾP & QUYẾT ĐỊNH HỘI ĐỒNG (Tổng PV: ${
      interviewSummary.hasAnyScore ? `${interviewSummary.overallInterview}/10` : '___/10'
    })`,
    margin,
    y
  );
  y += 2.5;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Tiêu chí phỏng vấn trực tiếp', 'Điểm (/10)']],
    body: [
      [
        'Thái độ, Tác phong & Phù hợp văn hóa Tutimi',
        roleplay.attitudeScore > 0 ? String(roleplay.attitudeScore) : '—',
      ],
      [
        'Năng lực Dẫn dắt & Quản lý đội ngũ (20–30 nhân sự)',
        roleplay.leadershipScore > 0 ? String(roleplay.leadershipScore) : '—',
      ],
      [
        'Độ trung thực & Xác minh CV / Người tham chiếu',
        roleplay.verificationScore > 0 ? String(roleplay.verificationScore) : '—',
      ],
    ],
    theme: 'grid',
    styles: {
      font: 'Roboto',
      fontSize: 8,
      cellPadding: 1.8,
      textColor: [15, 23, 42],
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
    },
    columnStyles: {
      1: { halign: 'center', cellWidth: 24, fontStyle: 'bold' },
    },
  });
  y = doc.lastAutoTable.finalY + 3;

  const dateText = roleplay.interviewDate
    ? new Date(roleplay.interviewDate).toLocaleDateString('vi-VN')
    : '____/____/202__';

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      font: 'Roboto',
      fontSize: 8,
      cellPadding: 2,
      textColor: [15, 23, 42],
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
    },
    body: [
      [
        {
          content: `KẾT LUẬN: ${DECISION_LABEL[roleplay.interviewerDecision] || 'CHỜ PHỎNG VẤN'}`,
          styles: { fontStyle: 'bold', textColor: [146, 64, 14] },
        },
        `Ngày PV: ${dateText} (${roleplay.interviewFormat || 'Trực tiếp'})`,
      ],
      [
        `Mức lương đề xuất: ${roleplay.proposedSalary || '__________________'}`,
        `Ngày có thể nhận việc: ${roleplay.availableDate || '__________________'}`,
      ],
      [
        `Chi nhánh dự kiến: ${roleplay.targetStore || '__________________'}`,
        `Check tham chiếu: ${roleplay.referenceVerified ? '[x] Đã xác minh' : '[ ] Chưa xác minh'}`,
      ],
      ...(roleplay.overallFeedback
        ? [[{ content: `Nhận xét chung: ${roleplay.overallFeedback}`, colSpan: 2 }]]
        : []),
    ],
  });
  y = doc.lastAutoTable.finalY + 8;

  // SIGNATURE BLOCK
  ensureSpace(26);
  const colW = contentWidth / 3;
  const signTitles = ['ĐẠI DIỆN NHÂN SỰ (HR)', 'QUẢN LÝ VẬN HÀNH', 'GIÁM ĐỐC CHUỖI TUTIMI'];
  signTitles.forEach((title, idx) => {
    const cx = margin + colW * idx + colW / 2;
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(title, cx, y, { align: 'center' });
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('(Ký & ghi rõ họ tên)', cx, y + 4, { align: 'center' });
  });

  const safeName = toSlug(candidate.fullName) || 'Ung-Vien';
  doc.save(`Phieu-Danh-Gia-${safeName}.pdf`);
}
