// ==========================================================================
// SciencePre: Certificate Image Export & Clipboard Sharing Engine
// 真正使用 HTML5 Canvas 绘制高清荣誉奖状并提供一键下载和剪贴板战报复制
// ==========================================================================

export async function exportCertificateAsImage(studentName = "Sky", dateStr = "2026.10") {
  const canvas = document.createElement("canvas");
  const width = 1200;
  const height = 800;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // 1. 背景渐变
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#fefce8");
  bgGrad.addColorStop(0.5, "#ffffff");
  bgGrad.addColorStop(1, "#f0fdf4");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. 双重华丽金绿边框
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 14;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 8]);
  ctx.strokeRect(36, 36, width - 72, height - 72);
  ctx.setLineDash([]); // 恢复实线

  // 3. 顶部勋章图标与大标题
  ctx.textAlign = "center";
  ctx.font = "64px serif";
  ctx.fillText("🌱 🏆 🌸", width / 2, 120);

  ctx.fillStyle = "#065f46";
  ctx.font = "bold 44px -apple-system, sans-serif";
  ctx.fillText("JUNIOR BOTANIST AWARD", width / 2, 185);

  ctx.fillStyle = "#047857";
  ctx.font = "bold 24px -apple-system, sans-serif";
  ctx.fillText("SciencePre · 皇家植物小学者认证", width / 2, 225);

  // 4. 正文表彰词
  ctx.fillStyle = "#475569";
  ctx.font = "22px -apple-system, sans-serif";
  ctx.fillText("兹证明优秀自然小探险家", width / 2, 300);

  // 小朋友名字
  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 56px -apple-system, sans-serif";
  ctx.fillText(studentName, width / 2, 380);

  // 名字下方下划金线
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 200, 400);
  ctx.lineTo(width / 2 + 200, 400);
  ctx.stroke();

  // 学习成就叙述
  ctx.fillStyle = "#334155";
  ctx.font = "24px -apple-system, sans-serif";
  const descLine1 = "在《Plants: Nature's Green Magic》主题探索营中，深入掌握了";
  const descLine2 = "根 (Roots)、茎 (Stem)、叶 (Leaves)、花 (Flowers)、种子 (Seeds)";
  const descLine3 = "的科学机理与英语核心词汇，顺利通关科学问答，特授予此荣誉称号！";
  ctx.fillText(descLine1, width / 2, 460);
  ctx.font = "bold 25px -apple-system, sans-serif";
  ctx.fillStyle = "#047857";
  ctx.fillText(descLine2, width / 2, 505);
  ctx.font = "24px -apple-system, sans-serif";
  ctx.fillStyle = "#334155";
  ctx.fillText(descLine3, width / 2, 550);

  // 5. 底部落款与盖印
  ctx.textAlign = "left";
  ctx.fillStyle = "#64748b";
  ctx.font = "20px -apple-system, sans-serif";
  ctx.fillText(`颁发日期: ${dateStr}`, 100, 680);
  ctx.fillText("认证平台: SciencePre (pre.igcse.xyz)", 100, 715);

  // 右侧金色官方印章圆形
  ctx.save();
  ctx.translate(width - 200, 670);
  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 60, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#d97706";
  ctx.textAlign = "center";
  ctx.font = "bold 14px -apple-system, sans-serif";
  ctx.fillText("OFFICIAL SEAL", 0, -15);
  ctx.font = "bold 18px -apple-system, sans-serif";
  ctx.fillText("VERIFIED", 0, 10);
  ctx.font = "12px -apple-system, sans-serif";
  ctx.fillText("SCIENCE PRE", 0, 30);
  ctx.restore();

  // 6. 导出并触发下载
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Junior_Botanist_Award_${studentName.replace(/\s+/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      resolve(true);
    }, "image/png");
  });
}

export async function copyCertificateReport(studentName = "Sky") {
  const text = `🎉【SciencePre 皇家自然小学者战报】\n` +
    `恭喜小探险家 ${studentName} 成功通关《Theme 01: Plants (植物与这首英文诗)》！\n` +
    `✅ 掌握植物 5 大器官：Roots (根), Stem (茎), Leaves (叶), Flowers (花), Seeds (种子)\n` +
    `✅ 攻克 20 个诗歌核心英语词与 9 个科学高阶词\n` +
    `✅ 搞懂光合作用超级厨房与导管水梯的科学事实！\n` +
    `🌐 荣誉证书核验地址：https://pre.igcse.xyz/plants/`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn("Clipboard API write failed, falling back:", e);
    }
  }

  // Fallback
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const success = document.execCommand("copy");
    document.body.removeChild(ta);
    return success;
  } catch (err) {
    return false;
  }
}
