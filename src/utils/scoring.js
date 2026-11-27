/**
 * Tính toán điểm số và phân loại cho một ứng viên dựa trên bộ tiêu chí động & ngưỡng hiện tại.
 * Đảm bảo Reactive Sync: thay đổi trọng số, tiêu chí hoặc ngưỡng sẽ tự động cập nhật toàn bộ ứng viên.
 */
export function evaluateCandidate(candidate, criteria, thresholds) {
  const totalWeight = criteria.reduce((sum, c) => sum + Number(c.weight || 0), 0);

  const breakdown = criteria.map((criterion) => {
    const rawScore = Number(candidate.scores?.[criterion.id] ?? 0);
    const clampedScore = Math.max(0, Math.min(10, rawScore));
    const weightedPoints = (clampedScore / 10) * Number(criterion.weight || 0);
    return {
      criterionId: criterion.id,
      name: criterion.name,
      weight: Number(criterion.weight || 0),
      rawScore: clampedScore,
      weightedPoints: Math.round(weightedPoints * 100) / 100,
    };
  });

  const rawTotal = breakdown.reduce((sum, b) => sum + b.weightedPoints, 0);
  // Nếu tổng trọng số khác 100%, chuẩn hóa về thang 100 để hiển thị nhất quán hoặc giữ nguyên nếu = 100%
  const normalizedScore =
    totalWeight > 0 && Math.abs(totalWeight - 100) > 0.01
      ? (rawTotal / totalWeight) * 100
      : rawTotal;

  const totalScore = Math.round(normalizedScore * 10) / 10;

  let statusKey = 'fail';
  let statusLabel = 'CHƯA ĐẠT – Lưu hồ sơ dự phòng';
  let statusShort = 'CHƯA ĐẠT';
  let badgeTone = 'slate';

  if (candidate.knockoutVSATTP) {
    statusKey = 'knockout';
    statusLabel = 'LOẠI TRỰC TIẾP (Vi phạm VSATTP nghiêm trọng)';
    statusShort = 'LOẠI TRỰC TIẾP';
    badgeTone = 'rose';
  } else if (totalScore >= Number(thresholds.passMin)) {
    statusKey = 'pass';
    statusLabel = 'ĐẠT – Mời phỏng vấn trực tiếp ngay';
    statusShort = 'ĐẠT';
    badgeTone = 'emerald';
  } else if (totalScore >= Number(thresholds.considerMin)) {
    statusKey = 'consider';
    statusLabel = 'CÂN NHẮC – Phỏng vấn qua điện thoại (10 phút) trước';
    statusShort = 'CÂN NHẮC';
    badgeTone = 'amber';
  }

  return {
    totalScore,
    rawTotal: Math.round(rawTotal * 10) / 10,
    totalWeight,
    breakdown,
    statusKey,
    statusLabel,
    statusShort,
    badgeTone,
  };
}

/**
 * Sắp xếp danh sách ứng viên:
 * - Ứng viên không bị Điểm Liệt xếp trên ứng viên bị Điểm Liệt.
 * - Trong cùng nhóm, sắp xếp theo tổng điểm từ cao xuống thấp.
 */
export function rankCandidates(candidates, criteria, thresholds) {
  return candidates
    .map((candidate) => ({
      ...candidate,
      evaluation: evaluateCandidate(candidate, criteria, thresholds),
    }))
    .sort((a, b) => {
      if (a.knockoutVSATTP !== b.knockoutVSATTP) {
        return a.knockoutVSATTP ? 1 : -1;
      }
      return b.evaluation.totalScore - a.evaluation.totalScore;
    });
}

/**
 * Tự động cân bằng trọng số các tiêu chí về đúng 100%.
 */
export function rebalanceWeights(criteria) {
  if (!criteria.length) return criteria;
  const currentTotal = criteria.reduce((sum, c) => sum + Number(c.weight || 0), 0);

  if (currentTotal <= 0) {
    const base = Math.floor(100 / criteria.length);
    let remainder = 100 - base * criteria.length;
    return criteria.map((c) => {
      const add = remainder > 0 ? 1 : 0;
      if (remainder > 0) remainder -= 1;
      return { ...c, weight: base + add };
    });
  }

  const scaled = criteria.map((c) => (Number(c.weight || 0) / currentTotal) * 100);
  const floored = scaled.map((val) => Math.floor(val));
  let remainder = 100 - floored.reduce((a, b) => a + b, 0);

  const fractions = scaled
    .map((val, idx) => ({ idx, frac: val - floored[idx] }))
    .sort((a, b) => b.frac - a.frac);

  const result = [...floored];
  for (let i = 0; i < remainder; i++) {
    result[fractions[i % fractions.length].idx] += 1;
  }

  return criteria.map((c, idx) => ({ ...c, weight: result[idx] }));
}
