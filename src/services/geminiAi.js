/**
 * Đọc file PDF hoặc Ảnh CV bằng Gemini API (generativelanguage.googleapis.com)
 * và trích xuất thông tin ứng viên + chấm điểm gợi ý theo bộ tiêu chí Tutimi hiện hành.
 */
export async function analyzeCvWithGemini({ file, apiKey, criteria }) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Vui lòng nhập Gemini API Key trong phần Cài đặt trước khi quét CV.');
  }

  const base64Data = await fileToBase64(file);
  const mimeType = file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

  const criteriaPrompt = criteria
    .map((c, idx) => `${idx + 1}. [id: "${c.id}"] ${c.name} (Trọng số ${c.weight}%): ${c.description}`)
    .join('\n');

  const prompt = `Bạn là Trưởng phòng Tuyển dụng của Chuỗi Trà Sữa Tutimi.
Hãy đọc kỹ CV đính kèm và đánh giá ứng viên cho vị trí Quản lý Cửa hàng (Store Manager) với quy mô:
- Doanh thu > 1 tỷ đồng/tháng
- Quản lý 20–30 nhân sự xoay ca (full-time & part-time)
- Lượng khách phục vụ tại chỗ (dine-in) rất đông
- Trọng tâm ưu tiên: Năng lực CSKH thực chiến tại chỗ & Quản trị vệ sinh / An toàn thực phẩm (QSC / 5S).

Hãy chấm điểm gợi ý (thang 0 đến 10, có thể dùng số thập phân như 8.5) cho từng tiêu chí sau:
${criteriaPrompt}

Trả về DUY NHẤT một JSON object hợp lệ (không bọc markdown code block) theo đúng cấu trúc sau:
{
  "fullName": "Họ và tên ứng viên",
  "phone": "Số điện thoại",
  "email": "Email",
  "address": "Địa chỉ / Quận / Thành phố",
  "cvSummary": "Tóm tắt kinh nghiệm F&B, các nơi đã làm, quy mô nhân sự, thành tích nổi bật (3-5 câu)",
  "strengths": "Điểm mạnh nổi bật so với yêu cầu Tutimi",
  "weaknesses": "Điểm yếu, khoảng trống kinh nghiệm hoặc điểm nghi vấn cần làm rõ",
  "interviewNotes": "Ghi chú lưu ý cho HR/Hội đồng phỏng vấn",
  "scores": {
    ${criteria.map((c) => `"${c.id}": 0`).join(',\n    ')}
  },
  "suggestedQuestions": [
    "Câu hỏi phỏng vấn 1 dành riêng cho CV này",
    "Câu hỏi phỏng vấn 2 dành riêng cho CV này",
    "Câu hỏi phỏng vấn 3 dành riêng cho CV này"
  ]
}`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
    apiKey.trim()
  )}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Gemini API lỗi (${response.status}): ${errBody.slice(0, 220)}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Gemini API không trả về nội dung phân tích.');
  }

  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    fullName: parsed.fullName || file.name.replace(/\.[^/.]+$/, ''),
    phone: parsed.phone || '',
    email: parsed.email || '',
    address: parsed.address || '',
    cvSummary: parsed.cvSummary || '',
    strengths: parsed.strengths || '',
    weaknesses: parsed.weaknesses || '',
    interviewNotes: parsed.interviewNotes || '',
    scores: parsed.scores || {},
    suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions : [],
  };
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Không thể đọc file tải lên.'));
    reader.readAsDataURL(file);
  });
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Không thể đọc file tải lên.'));
    reader.readAsDataURL(file);
  });
}
