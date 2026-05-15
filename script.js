const CHECKS = [
  {
    id: "headline",
    group: "Clarity",
    weight: 8,
    label: "The page states who the product is for and what business outcome it changes.",
    fix: "Rewrite the opening line around buyer type, job, and measurable outcome."
  },
  {
    id: "price-visible",
    group: "Clarity",
    weight: 10,
    label: "A qualified buyer can find a starting price, price range, or quote boundary.",
    fix: "Add a starting price, package range, or explicit quote threshold."
  },
  {
    id: "unit-clear",
    group: "Clarity",
    weight: 7,
    label: "The billing unit is clear: seat, usage, workspace, account, or contract.",
    fix: "Name the billing unit next to every visible price."
  },
  {
    id: "plan-fit",
    group: "Packaging",
    weight: 7,
    label: "Each plan has a buyer-fit cue instead of only feature volume.",
    fix: "Add one buyer-fit line per plan."
  },
  {
    id: "feature-boundaries",
    group: "Packaging",
    weight: 8,
    label: "Feature limits and upgrade boundaries are specific enough to avoid surprise.",
    fix: "Replace vague feature lists with limits, allowances, and upgrade rules."
  },
  {
    id: "usage-risk",
    group: "Packaging",
    weight: 7,
    label: "Usage overages, credits, or variable charges are explained near the plan table.",
    fix: "Add usage examples and overage rules."
  },
  {
    id: "proof",
    group: "Proof",
    weight: 8,
    label: "Pricing is supported by proof: customer names, quantified outcomes, or adoption evidence.",
    fix: "Add pricing-adjacent proof that reduces value doubt."
  },
  {
    id: "roi",
    group: "Proof",
    weight: 6,
    label: "The page explains how buyers justify the cost internally.",
    fix: "Add ROI math, replacement-cost framing, or payback examples."
  },
  {
    id: "security",
    group: "Trust",
    weight: 6,
    label: "Security, compliance, support, and data-retention questions have clear paths.",
    fix: "Link security and compliance evidence from the pricing decision area."
  },
  {
    id: "faq",
    group: "Objections",
    weight: 6,
    label: "The FAQ answers cancellation, trials, invoices, procurement, and plan-change questions.",
    fix: "Add objection-led FAQ entries based on real sales or support friction."
  },
  {
    id: "trial",
    group: "Risk",
    weight: 5,
    label: "Trial, demo, or proof-of-concept expectations are explicit.",
    fix: "Clarify what starts immediately and what requires sales approval."
  },
  {
    id: "cta",
    group: "Conversion",
    weight: 7,
    label: "The primary CTA matches the motion and is repeated after the plan comparison.",
    fix: "Use one primary CTA per motion and repeat it after high-friction sections."
  },
  {
    id: "sales-handoff",
    group: "Conversion",
    weight: 5,
    label: "Sales-assisted or enterprise buyers know what happens after they request contact.",
    fix: "Add response time, meeting expectation, and evaluation steps."
  },
  {
    id: "comparison",
    group: "Decision",
    weight: 5,
    label: "Plan comparisons help buyers choose without opening a spreadsheet.",
    fix: "Group features by buyer decision, not internal product taxonomy."
  },
  {
    id: "mobile",
    group: "Decision",
    weight: 5,
    label: "The plan table, FAQs, and CTAs are readable on mobile.",
    fix: "Use stacked plan cards and keep price, fit, and CTA visible together."
  }
];

const els = {
  checklist: document.querySelector("#checklist"),
  score: document.querySelector("#score"),
  scoreLabel: document.querySelector("#score-label"),
  readyCount: document.querySelector("#ready-count"),
  gapCount: document.querySelector("#gap-count"),
  motion: document.querySelector("#motion"),
  motionLabel: document.querySelector("#motion-label"),
  acv: document.querySelector("#acv"),
  model: document.querySelector("#model"),
  pageUrl: document.querySelector("#page-url"),
  riskList: document.querySelector("#risk-list"),
  reviewStatus: document.querySelector("#review-status"),
  notes: document.querySelector("#notes"),
  report: document.querySelector("#report"),
  reset: document.querySelector("#reset"),
  copyReport: document.querySelector("#copy-report"),
  downloadReport: document.querySelector("#download-report"),
  downloadCsv: document.querySelector("#download-csv")
};

function buildChecklist() {
  els.checklist.textContent = "";
  for (const check of CHECKS) {
    const label = document.createElement("label");
    label.className = "check";
    label.innerHTML = `
      <input type="checkbox" data-id="${check.id}">
      <span>
        <strong>${check.label}</strong>
        <small>${check.fix}</small>
      </span>
      <em class="tag">${check.group}</em>
    `;
    label.querySelector("input").addEventListener("change", render);
    els.checklist.append(label);
  }
}

function checkedIds() {
  return [...document.querySelectorAll("#checklist input:checked")].map((input) => input.dataset.id);
}

function contextLabel(value) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function scoreState() {
  const selected = new Set(checkedIds());
  const total = CHECKS.reduce((sum, check) => sum + check.weight, 0);
  const earned = CHECKS.reduce((sum, check) => sum + (selected.has(check.id) ? check.weight : 0), 0);
  const score = Math.round((earned / total) * 100);
  const gaps = CHECKS.filter((check) => !selected.has(check.id));
  const critical = gaps.filter((check) => check.weight >= 8);
  return { selected, score, gaps, critical };
}

function tier(score) {
  if (score >= 85) return "Confident";
  if (score >= 70) return "Usable";
  if (score >= 50) return "Risky";
  return "Leaky";
}

function motionRisks({ selected, critical }) {
  const risks = [];
  if (!selected.has("price-visible")) {
    risks.push(["Pricing anxiety", "Buyers cannot anchor cost before deciding whether to continue."]);
  }
  if (!selected.has("feature-boundaries")) {
    risks.push(["Upgrade surprise", "Plan differences may create late-stage uncertainty."]);
  }
  if (els.motion.value !== "self-serve" && !selected.has("sales-handoff")) {
    risks.push(["Sales handoff gap", "The page does not set expectations after contact is requested."]);
  }
  if (els.model.value === "usage" && !selected.has("usage-risk")) {
    risks.push(["Usage uncertainty", "Variable charges need examples before buyers trust the model."]);
  }
  if (els.acv.value === "high" && !selected.has("security")) {
    risks.push(["Procurement blocker", "High-ACV buyers usually need security and compliance proof early."]);
  }
  if (critical.length === 0) {
    risks.push(["No critical gaps", "The remaining work is likely copy depth, proof quality, or layout polish."]);
  }
  return risks;
}

function reportText() {
  const state = scoreState();
  const ready = CHECKS.filter((check) => state.selected.has(check.id));
  const risks = motionRisks(state);
  const url = els.pageUrl.value.trim() || "Unspecified";
  const notes = els.notes.value.trim() || "None";
  return [
    "# SaaS Pricing Page Confidence Review",
    "",
    `URL: ${url}`,
    `Motion: ${contextLabel(els.motion.value)}`,
    `ACV: ${els.acv.options[els.acv.selectedIndex].text}`,
    `Pricing model: ${contextLabel(els.model.value)}`,
    `Score: ${state.score}/100 (${tier(state.score)})`,
    `Ready checks: ${ready.length}/${CHECKS.length}`,
    `Critical gaps: ${state.critical.length}`,
    "",
    "## Highest Priority Gaps",
    ...(state.gaps.length ? state.gaps.slice(0, 6).map((check) => `- ${check.group}: ${check.fix}`) : ["- None"]),
    "",
    "## Risk Flags",
    ...risks.map((risk) => `- ${risk[0]}: ${risk[1]}`),
    "",
    "## Ready Evidence",
    ...(ready.length ? ready.map((check) => `- ${check.group}: ${check.label}`) : ["- None yet"]),
    "",
    "## Notes",
    notes
  ].join("\n");
}

function csvText() {
  const selected = new Set(checkedIds());
  const rows = [["group", "check", "ready", "fix"]];
  for (const check of CHECKS) {
    rows.push([check.group, check.label, selected.has(check.id) ? "yes" : "no", check.fix]);
  }
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function csvCell(value) {
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

function download(filename, type, content) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function render() {
  const state = scoreState();
  const risks = motionRisks(state);
  els.score.textContent = String(state.score);
  els.scoreLabel.textContent = tier(state.score);
  els.readyCount.textContent = `${CHECKS.length - state.gaps.length}/${CHECKS.length}`;
  els.gapCount.textContent = String(state.critical.length);
  els.motionLabel.textContent = contextLabel(els.motion.value);
  els.reviewStatus.textContent = `${risks.length} flags`;
  els.riskList.textContent = "";
  for (const [title, message] of risks) {
    const item = document.createElement("div");
    item.className = `risk${title === "No critical gaps" ? " good" : ""}`;
    const strong = document.createElement("strong");
    strong.textContent = title;
    const span = document.createElement("span");
    span.textContent = message;
    item.append(strong, span);
    els.riskList.append(item);
  }
  els.report.value = reportText();
}

buildChecklist();
["change", "input"].forEach((eventName) => {
  [els.motion, els.acv, els.model, els.pageUrl, els.notes].forEach((el) => el.addEventListener(eventName, render));
});

els.reset.addEventListener("click", () => {
  for (const input of document.querySelectorAll("#checklist input")) input.checked = false;
  els.notes.value = "";
  els.pageUrl.value = "";
  render();
});

els.copyReport.addEventListener("click", async () => {
  await navigator.clipboard.writeText(reportText());
  els.reviewStatus.textContent = "Copied";
});

els.downloadReport.addEventListener("click", () => {
  download("saas-pricing-page-confidence-review.md", "text/markdown", reportText());
});

els.downloadCsv.addEventListener("click", () => {
  download("saas-pricing-page-confidence-checklist.csv", "text/csv", csvText());
});

render();
