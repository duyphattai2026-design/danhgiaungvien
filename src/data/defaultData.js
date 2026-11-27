export const DEFAULT_CRITERIA = [
  {
    id: 'c1',
    name: 'Kinh nghiệm ngành F&B & Mô hình tương đồng',
    weight: 25,
    description:
      '≥ 2 năm làm Quản lý/Giám sát chuỗi đồ uống (trà sữa, cà phê) khách tại chỗ đông, doanh thu cao (> 1 tỷ/tháng).',
  },
  {
    id: 'c2',
    name: 'Quy mô quản lý nhân sự',
    weight: 20,
    description:
      'Từng quản lý trực tiếp 15–30 nhân sự xoay ca (full-time & part-time), có kỹ năng đào tạo và giữ chân nhân viên.',
  },
  {
    id: 'c3',
    name: 'Quản trị Vệ sinh & Chất lượng - QSC',
    weight: 20,
    description:
      'Nghiêm khắc với 5S, VSATTP, hạn sử dụng nguyên liệu/topping, quy trình vận hành chuẩn.',
  },
  {
    id: 'c4',
    name: 'Định hướng Chăm sóc Khách hàng - CSKH',
    weight: 20,
    description:
      'Kỹ năng quan sát sảnh, điều phối giờ cao điểm, xử lý khiếu nại tại chỗ khéo léo.',
  },
  {
    id: 'c5',
    name: 'Tư duy số liệu & Kiểm soát P&L',
    weight: 10,
    description:
      'Quản lý doanh thu (Sale), hao hụt nguyên liệu (COGS) và quỹ lương (COL).',
  },
  {
    id: 'c6',
    name: 'Tính ổn định & Sự chỉn chu hồ sơ',
    weight: 5,
    description:
      'Thời gian gắn bó trung bình ≥ 1.5–2 năm/nơi, CV trình bày cẩn thận, có người tham chiếu uy tín.',
  },
];

export const DEFAULT_THRESHOLDS = {
  passMin: 80,
  considerMin: 65,
};

export const DEFAULT_ROLEPLAY_SCENARIOS = [
  {
    id: 'rp1',
    title: 'Tình huống 1: Xử lý sự cố CSKH giờ cao điểm (15 phút)',
    prompt:
      'Tối Thứ 7 giờ cao điểm, khách bàn 4 phàn nàn vì chờ nước quá 25 phút và bàn chưa được dọn sạch. Ứng viên xử lý trực tiếp tại sảnh như thế nào?',
    checkpoints: [
      'Thái độ bình tĩnh, lắng nghe, xin lỗi chân thành không đổ lỗi cho nhân viên/hệ thống',
      'Xử lý ngay tại chỗ: ưu tiên dọn bàn sạch sẽ, kiểm tra tiến độ đơn tại quầy bar, đề xuất phương án bù đắp hợp lý',
      'Điều phối lại nhân sự sảnh/bar để giải tỏa ùn tắc, theo dõi lại sự hài lòng của khách sau khi phục vụ',
    ],
  },
  {
    id: 'rp2',
    title: 'Tình huống 2: Kiểm tra QSC/5S đầu ca 8h30 sáng',
    prompt:
      'Kiểm tra vệ sinh đầu ca 8h30 phát hiện: (1) Nồi trân châu còn dư từ tối qua được nhân viên giữ lại để bán tiếp, (2) Máy làm đá có cặn bẩn, (3) Nhà vệ sinh có mùi hôi. Ứng viên quyết định và hành động ra sao?',
    checkpoints: [
      'KIÊN QUYẾT hủy bỏ toàn bộ trân châu qua đêm ngay lập tức (không tiết kiệm sai quy định VSATTP)',
      'Tạm dừng sử dụng máy đá để vệ sinh/khử khuẩn theo chuẩn 5S trước khi mở bán',
      'Phân công xử lý triệt để WC, lập biên bản nhắc nhở/đào tạo lại ca trước & thiết lập checklist kiểm soát đầu ca',
    ],
  },
];

export const DEFAULT_CANDIDATES = [
  {
    id: 'cand-duong-minh-kha',
    fullName: 'Dương Minh Kha',
    phone: '0901391301',
    email: 'khaduong2607@gmail.com',
    address: 'Quận 10, TP.HCM',
    appliedPosition: 'Quản lý Cửa hàng (Store Manager)',
    createdAt: '2026-11-26T09:00:00.000Z',
    scores: {
      c1: 10,
      c2: 8,
      c3: 9,
      c4: 7,
      c5: 9,
      c6: 6,
    },
    knockoutVSATTP: false,
    knockoutReason: '',
    cvSummary:
      'Store Manager tại Katinat Coffee & Tea (6/2024–6/2025, tham gia NSO mở mới miền Bắc); Restaurant Manager Nhà hàng Thái SongKran (6/2023–6/2024); Store Manager LV1,2 tại Highlands Coffee Sân bay Quốc tế (11/2021–8/2024). Vững COL, COGS, COS.',
    strengths:
      'Kinh nghiệm thực chiến chuỗi đồ uống lớn (Katinat, Highlands sân bay) rất sát mô hình Tutimi; nắm chắc chỉ số vận hành COL, COGS, COS và quy trình QSC.',
    weaknesses:
      'Mốc thời gian 2023–2024 bị trùng giữa Highlands (11/2021–8/2024) và Nhà hàng SongKran (6/2023–6/2024); chưa thể hiện rõ chi tiết xử lý CSKH tại chỗ trong CV.',
    interviewNotes:
      'Cần hỏi rõ mốc thời gian 2023–2024 bị trùng giữa Highlands và Nhà hàng SongKran; xác nhận quy mô nhân sự thực tế 20–30 người và xin thông tin người tham chiếu.',
    suggestedQuestions: [
      'Trong CV có giai đoạn 6/2023–6/2024 trùng giữa Highlands Coffee và Nhà hàng Thái SongKran, bạn có thể làm rõ quá trình công tác ở hai nơi này?',
      'Tại Katinat hoặc Highlands, quy mô nhân sự ca đông nhất bạn từng trực tiếp điều phối là bao nhiêu người (full-time/part-time) và bạn giữ chân nhân sự part-time bằng cách nào?',
      'Kể lại một tình huống khách hàng khiếu nại gay gắt tại sảnh giờ cao điểm mà bạn đã trực tiếp xử lý thành công.',
    ],
    cvSourceType: 'summary', // 'summary' | 'file' | 'link'
    cvFileName: '',
    cvFileDataUrl: '',
    cvFileMimeType: '',
    cvLinkUrl: '',
    roleplay: {
      rp1Score: 0,
      rp1Notes: '',
      rp2Score: 0,
      rp2Notes: '',
      interviewerDecision: 'pending', // 'pending' | 'hire' | 'consider' | 'reject'
      interviewDate: '',
      panelNames: 'HR / Quản lý Vận hành / Giám đốc Chuỗi',
    },
  },
  {
    id: 'cand-pham-hoang-thinh',
    fullName: 'Phạm Hoàng Thịnh',
    phone: '0386555978',
    email: 'ph.thinh107@gmail.com',
    address: 'P. Long Bình, TP.HCM',
    appliedPosition: 'Quản lý Cửa hàng (Store Manager)',
    createdAt: '2026-11-26T10:30:00.000Z',
    scores: {
      c1: 9.2,
      c2: 9.5,
      c3: 9,
      c4: 5,
      c5: 10,
      c6: 6,
    },
    knockoutVSATTP: false,
    knockoutReason: '',
    cvSummary:
      'Tổng Quản Lý Hải Sản Hoàng Gia (06/2025–09/2026, quản lý 20–25 nhân sự, 1 CH Q.7 + 3 quầy siêu thị); Giám sát chuỗi vận hành khu vực kiêm QC tại Abby (04/2024–05/2025, 9 cơ sở + kho); Giám sát - CHT tại Katinat & Maycha (11/2022–03/2024); Cửa hàng phó G Kitchen (10/2020–10/2022). Người tham chiếu: Anh Tống Văn Khánh Long - QLKV Maycha (0937154570).',
    strengths:
      'Nền tảng chuỗi trà sữa/cà phê (Katinat, Maycha) và kinh nghiệm QC 9 cơ sở rất phù hợp; quản lý quy mô 20–25 nhân sự; tư duy P&L và kiểm soát số liệu xuất sắc.',
    weaknesses:
      'CV thiếu minh chứng cụ thể về năng lực CSKH tại chỗ (dine-in); có một số lỗi chính tả trong CV ("bao lưu", "Nhân báo cáo").',
    interviewNotes:
      'Nền tảng chuỗi trà sữa/cà phê và QC rất tốt, nhưng CV thiếu minh chứng về CSKH tại chỗ và có vài lỗi chính tả ("bao lưu", "Nhân báo cáo"). Cần test kỹ role-play CSKH và gọi xác minh anh Long (Maycha).',
    suggestedQuestions: [
      'Khi làm CHT tại Maycha/Katinat, bạn làm thế nào để quan sát sảnh và điều phối phục vụ tại chỗ khi đơn tăng đột biến vào cuối tuần?',
      'Với vai trò QC tại Abby, tiêu chuẩn kiểm tra VSATTP đầu ca nào bạn cho là dễ bị nhân viên bỏ sót nhất tại cửa hàng trà sữa?',
      'Lý do bạn chuyển đổi qua các mô hình từ F&B đồ uống sang hải sản và hiện tại muốn quay lại chuỗi trà sữa Tutimi là gì?',
    ],
    cvSourceType: 'summary',
    cvFileName: '',
    cvFileDataUrl: '',
    cvFileMimeType: '',
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
  },
  {
    id: 'cand-nguyen-phu-hoang-son',
    fullName: 'Nguyễn Phú Hoàng Sơn',
    phone: '0932792401',
    email: 'nphoangson@gmail.com',
    address: 'Gò Vấp, TP.HCM',
    appliedPosition: 'Quản lý Cửa hàng (Store Manager)',
    createdAt: '2026-11-27T10:56:00.000Z',
    scores: {
      c1: 9,
      c2: 8.5,
      c3: 9,
      c4: 7,
      c5: 9,
      c6: 8,
    },
    knockoutVSATTP: false,
    knockoutReason: '',
    cvSummary:
      'Quản lý chuỗi cửa hàng Dose Coffee (T6/2026–Hiện tại, quản lý 2–3 cửa hàng, 15–30 nhân viên, giảm 40% tỷ lệ hao hụt nguyên vật liệu, chuẩn hóa SOP pha chế & phục vụ); Quản lý nhà hàng tại Công ty TNHH AUTORILL VFS F&B (2022–T6/2026, vận hành F&B tại Sân bay Tân Sơn Nhất, tuân thủ HACCP, có chứng nhận VSATTP & PCCC).',
    strengths:
      'Hơn 4 năm kinh nghiệm quản lý F&B ổn định (2022–2026), có chứng nhận VSATTP, HACCP và PCCC tại sân bay; kiểm soát hao hụt nguyên vật liệu rất tốt (giảm 40% tỷ lệ hao hụt).',
    weaknesses:
      'CV ghi mốc Dose Coffee bắt đầu T6/2026 nhưng thành tích giảm 40% hao hụt ghi "trong 6 tháng đầu năm 2026"; chưa nêu ví dụ cụ thể về xử lý khiếu nại khách tại chỗ (dine-in); Excel ở mức cơ bản.',
    interviewNotes:
      'Cần làm rõ mốc thời gian thành tích 6 tháng đầu 2026 tại Dose Coffee; kiểm tra thực tế khả năng dùng Excel báo cáo P&L (COL/COGS) và test kỹ tình huống CSKH giờ cao điểm tại sảnh.',
    suggestedQuestions: [
      'Trong CV ghi bạn bắt đầu làm tại Dose Coffee từ T6/2026 nhưng có thành tích giảm 40% hao hụt nguyên vật liệu trong 6 tháng đầu 2026 — bạn có thể chia sẻ rõ hơn về dự án kiểm soát hao hụt này?',
      'Khi vận hành 2–3 cửa hàng với 15–30 nhân sự, bạn phân bổ thời gian kiểm tra QSC/5S đầu ca và điều phối nhân sự xoay ca như thế nào?',
      'Nếu khách hàng tại quán phàn nàn đồ uống ra chậm 25 phút vào tối cuối tuần, quy trình xử lý trực tiếp tại bàn của bạn là gì?',
    ],
    cvSourceType: 'summary',
    cvFileName: '',
    cvFileDataUrl: '',
    cvFileMimeType: '',
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
  },
  {
    id: 'cand-lai-tran-khanh',
    fullName: 'Lại Trần Khánh',
    phone: '0335008602',
    email: 'khanhtranlai@gmail.com',
    address: 'Q. Bình Thạnh, TP.HCM',
    appliedPosition: 'Quản lý Cửa hàng (Store Manager)',
    createdAt: '2026-11-27T11:13:00.000Z',
    scores: {
      c1: 9.5,
      c2: 7.5,
      c3: 8.5,
      c4: 8,
      c5: 8.5,
      c6: 6.5,
    },
    knockoutVSATTP: false,
    knockoutReason: '',
    cvSummary:
      'Quản lý Cửa hàng tại Lam Trà F&B Group (04/2026–10/2026, quản lý nhân sự, COL, COGS, KPI); Nhân viên bán hàng Uniqlo Việt Nam (07/2025–04/2026); Quản lý Cửa hàng tại Maycha (10/2023–07/2025, vận hành, kiểm soát VSATTP & nguyên vật liệu, xếp lịch); Giám sát ca/Cán bộ nguồn tại Phúc Long (01/2021–07/2023). Thành thạo Excel, Word, PowerPoint.',
    strengths:
      'Kinh nghiệm cực kỳ sát chuỗi trà sữa/trà lớn (Phúc Long, Maycha, Lam Trà); nắm chắc COL, COGS, kiểm soát VSATTP và có nền tảng dịch vụ khách hàng chuẩn mực từ Uniqlo.',
    weaknesses:
      'CV chưa nêu rõ quy mô nhân sự (20–30 người) và doanh thu cửa hàng từng quản lý; giai đoạn 2025–2026 chuyển việc khá nhanh (Maycha -> Uniqlo -> Lam Trà); còn nhiều lỗi chính tả trong CV ("đạo tạo", "nguyên vật liệt", "hiệu xuất", "Côn Ty").',
    interviewNotes:
      'Cần hỏi rõ lý do rời Maycha sang làm nhân viên bán hàng tại Uniqlo rồi chỉ làm Lam Trà 6 tháng; xác nhận quy mô doanh thu & số lượng nhân sự/ca từng quản lý trực tiếp.',
    suggestedQuestions: [
      'Sau gần 2 năm làm Quản lý Cửa hàng tại Maycha, vì sao bạn chuyển sang làm Nhân viên bán hàng tại Uniqlo rồi làm ở Lam Trà 6 tháng?',
      'Tại Maycha và Lam Trà, quy mô cửa hàng bạn phụ trách đạt doanh thu khoảng bao nhiêu/tháng và có bao nhiêu nhân sự full-time/part-time?',
      'Với kinh nghiệm tại Phúc Long và Maycha, bạn kiểm soát hạn sử dụng topping/trân châu và xử lý tình huống khách chờ nước lâu giờ cao điểm như thế nào?',
    ],
    cvSourceType: 'summary',
    cvFileName: '',
    cvFileDataUrl: '',
    cvFileMimeType: '',
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
  },
];
