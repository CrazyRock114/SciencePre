// ==========================================================================
// SciencePre: Certificate Controller (Plants)
// 依据 5 项硬性学习条件解锁官方小学者证书，支持动态姓名、Canvas图下载与剪贴板战报
// ==========================================================================

import { progressTracker } from "../core/progress.js";
import { exportCertificateAsImage, copyCertificateReport } from "../core/share.js";
import { audio } from "../core/audio.js";

export class CertificateController {
  constructor() {
    this.lockedBox = document.getElementById("cert-locked-box");
    this.unlockedBox = document.getElementById("cert-unlocked-box");
    this.checklistEl = document.getElementById("cert-checklist-container");
    this.progressFillEl = document.getElementById("cert-progress-fill");
    this.progressPercentEl = document.getElementById("cert-progress-percent");
    this.nameInput = document.getElementById("student-name-input");
    this.certDisplayName = document.getElementById("cert-display-student-name");
    this.downloadBtn = document.getElementById("cert-download-btn");
    this.shareBtn = document.getElementById("cert-share-btn");
    this.dateEl = document.getElementById("cert-date");
  }

  init() {
    const d = new Date();
    const dateStr = `${d.getFullYear()}.${d.getMonth() + 1}`;
    if (this.dateEl) this.dateEl.innerText = dateStr;

    // 绑定学生姓名输入
    if (this.nameInput) {
      this.nameInput.value = progressTracker.getStudentName();
      this.nameInput.addEventListener("input", (e) => {
        const val = e.target.value;
        progressTracker.setStudentName(val);
        if (this.certDisplayName) this.certDisplayName.innerText = val || "Sky";
      });
    }

    if (this.certDisplayName) {
      this.certDisplayName.innerText = progressTracker.getStudentName();
    }

    // 绑定导出与分享
    if (this.downloadBtn) {
      this.downloadBtn.addEventListener("click", async () => {
        const name = progressTracker.getStudentName();
        audio.playPop();
        const success = await exportCertificateAsImage(name, dateStr);
        if (success) {
          audio.playVictory();
          alert(`🎉 恭喜！${name} 的小学者证书图片已成功下载！`);
        }
      });
    }

    if (this.shareBtn) {
      this.shareBtn.addEventListener("click", async () => {
        const name = progressTracker.getStudentName();
        audio.playPop();
        const success = await copyCertificateReport(name);
        if (success) {
          audio.playCorrect();
          alert("📋 荣誉战报已复制到剪贴板！快去微信或社群分享给爸爸妈妈和老师吧！");
        } else {
          alert("未能自动复制，请手动截屏分享！");
        }
      });
    }

    // 订阅进度状态更新
    progressTracker.subscribe((status) => {
      this.renderStatus(status);
    });
  }

  renderStatus(status) {
    if (this.progressFillEl) this.progressFillEl.style.width = `${status.percent}%`;
    if (this.progressPercentEl) this.progressPercentEl.innerText = `${status.percent}%`;

    // 渲染 5 项核对清单
    if (this.checklistEl) {
      this.checklistEl.innerHTML = "";
      status.checklist.forEach((item) => {
        const row = document.createElement("div");
        row.className = `cert-task-item ${item.done ? "task-done" : "task-todo"}`;
        row.innerHTML = `
          <span class="task-check-icon">${item.done ? "✅" : "⏳"}</span>
          <div class="task-info">
            <div class="task-name">${item.label}</div>
            <div class="task-detail">${item.detail}</div>
          </div>
        `;
        this.checklistEl.appendChild(row);
      });
    }

    // 解锁与锁定状态切换
    if (status.isUnlocked) {
      if (this.lockedBox) this.lockedBox.style.display = "none";
      if (this.unlockedBox) this.unlockedBox.style.display = "block";
    } else {
      if (this.lockedBox) this.lockedBox.style.display = "block";
      if (this.unlockedBox) this.unlockedBox.style.display = "none";
    }
  }

  celebrateConfetti() {
    audio.playVictory();
    for (let i = 0; i < 28; i++) {
      const p = document.createElement("div");
      p.className = "confetti-particle";
      const emojis = ["🌸", "🍃", "🌱", "☀️", "💧", "✨", "⭐", "🏆"];
      p.innerText = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.left = `${Math.random() * 95}vw`;
      p.style.top = `${window.scrollY + 100 + Math.random() * 300}px`;
      p.style.fontSize = `${18 + Math.random() * 18}px`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 2200);
    }
  }
}
