import { el } from "./dom.js";
import { FeedbackReportBuilder } from "./FeedbackReportBuilder.js";

const MODAL_ID = "report-issue-modal";

export class FeedbackReporter {
  constructor(gm) {
    this._gm = gm;
    this._currentScreenLabel = null;
  }

  setCurrentScreen(label) {
    this._currentScreenLabel = label;
  }

  open() {
    if (document.getElementById(MODAL_ID)) return;

    let shortDesc = "";
    let whatHappened = "";
    let whatExpected = "";

    const close = () => document.getElementById(MODAL_ID)?.remove();

    const openGitHub = () => {
      const title = FeedbackReportBuilder.buildIssueTitle(shortDesc);
      const body = FeedbackReportBuilder.buildIssueBody(
        { whatHappened, whatExpected },
        this._gm.currentRunState,
        this._currentScreenLabel,
      );
      const url = FeedbackReportBuilder.buildGitHubUrl(title, body);
      window.open(url, "_blank", "noopener,noreferrer");
    };

    const descInput = el("input", {
      class: "report-field",
      type: "text",
      placeholder: "Short description (becomes the issue title)",
    });
    descInput.addEventListener("input", () => { shortDesc = descInput.value; });

    const happenedInput = el("textarea", {
      class: "report-field report-textarea",
      placeholder: "What happened?",
    });
    happenedInput.addEventListener("input", () => { whatHappened = happenedInput.value; });

    const expectedInput = el("textarea", {
      class: "report-field report-textarea",
      placeholder: "What did you expect to happen?",
    });
    expectedInput.addEventListener("input", () => { whatExpected = expectedInput.value; });

    const copyStatusEl = el("span", { class: "report-copy-status" });

    const copyReport = () => {
      const report = FeedbackReportBuilder.buildDebugReport(
        this._gm.currentRunState,
        this._currentScreenLabel,
      );
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(report).then(() => {
          copyStatusEl.textContent = "Copied!";
          setTimeout(() => { copyStatusEl.textContent = ""; }, 2000);
        }).catch(() => {
          copyStatusEl.textContent = "Copy failed — use Download instead.";
        });
      } else {
        copyStatusEl.textContent = "Clipboard unavailable — use Download instead.";
      }
    };

    const downloadReport = () => {
      const report = FeedbackReportBuilder.buildDebugReport(
        this._gm.currentRunState,
        this._currentScreenLabel,
      );
      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const filename = `dungeon-debt-debug-report-${ts}.md`;
      const blob = new Blob([report], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    };

    const backdrop = el("div", { id: MODAL_ID, class: "tutorial-backdrop" });
    const modal = el("div", { class: "tutorial-modal" }, [
      el("div", { class: "tutorial-header" }, [
        el("h2", { class: "tutorial-title", text: "Report Issue" }),
        el("button", { class: "btn tutorial-close", text: "✕", onClick: close }),
      ]),
      el("div", { class: "tutorial-body" }, [
        el("p", { class: "tutorial-intro", text: "Fill in the fields below, then open a prefilled GitHub issue." }),
        descInput,
        happenedInput,
        expectedInput,
        el("p", { class: "report-hint", text: "Build and run context will be added automatically." }),
        el("div", { class: "report-debug-row" }, [
          el("button", { class: "btn", text: "Copy Debug Report", onClick: copyReport }),
          el("button", { class: "btn", text: "Download Debug Report", onClick: downloadReport }),
          copyStatusEl,
        ]),
        el("p", { class: "report-hint", text: "Drag the downloaded report or a screenshot into the GitHub issue before submitting." }),
      ]),
      el("div", { class: "tutorial-footer" }, [
        el("button", { class: "btn primary", text: "Open GitHub Issue", onClick: openGitHub }),
        el("button", { class: "btn", text: "Cancel", onClick: close }),
      ]),
    ]);

    backdrop.appendChild(modal);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
    document.getElementById("app").appendChild(backdrop);
  }
}
