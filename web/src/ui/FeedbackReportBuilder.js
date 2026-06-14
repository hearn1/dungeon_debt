import { AppInfo } from "../core/AppInfo.js";
import { DebugLogBuffer } from "../core/DebugLogBuffer.js";

export const FeedbackReportBuilder = {
  buildIssueTitle(shortDescription) {
    const desc = (shortDescription || "").trim();
    return desc ? `Feedback/Bug Report: ${desc}` : "Feedback/Bug Report: (no description)";
  },

  buildIssueBody(fields, run, screenLabel) {
    const { whatHappened = "", whatExpected = "" } = fields || {};
    const lines = [
      "## Build",
      `${AppInfo.displayName} v${AppInfo.version}`,
      "",
      "## Current screen",
      screenLabel || "(unknown)",
      "",
      "## What happened?",
      whatHappened || "(not provided)",
      "",
      "## What did you expect to happen?",
      whatExpected || "(not provided)",
      "",
    ];

    lines.push("## Run state");
    if (run) {
      lines.push(`- Act: ${run.act}`);
      lines.push(`- Round: ${run.round}`);
      lines.push(`- Difficulty: ${run.difficultyDisplayName || "-"}`);
      lines.push(`- Gold: ${run.gold}`);
      lines.push(`- Debt: ${run.debt}`);
      lines.push(`- Morale: ${run.morale}`);
      const roster = (run.party || [])
        .map(h => `${h.definition.displayName} (${h.definition.role}, ${h.tier})`)
        .join(", ");
      lines.push(`- Roster: ${roster || "(empty)"}`);
      const relics = (run.activeRelics || []).join(", ");
      lines.push(`- Relics/Clauses: ${relics || "none"}`);
      const enc = run.currentEncounter;
      lines.push(`- Current encounter: ${enc ? enc.displayName || enc.id || "-" : "none"}`);
    } else {
      lines.push("- No active run.");
    }

    lines.push("");
    lines.push("## Screenshot / notes");
    lines.push("Please drag a screenshot or debug report into this issue before submitting, if available.");

    return lines.join("\n");
  },

  buildGitHubUrl(title, body) {
    const params = new URLSearchParams({ title, body });
    return `${AppInfo.repoIssuesUrl}?${params.toString()}`;
  },

  buildDebugReport(run, screenLabel) {
    const ts = new Date().toISOString();
    const ua = (typeof navigator !== "undefined" && navigator.userAgent) || "(unavailable)";

    const lines = [
      `# Dungeon Debt Debug Report`,
      `Generated: ${ts}`,
      `Build: ${AppInfo.displayName} v${AppInfo.version}`,
      `User agent: ${ua}`,
      `Current screen: ${screenLabel || "(unknown)"}`,
      "",
      "## Run State",
    ];

    if (run) {
      lines.push(`- Act: ${run.act}`);
      lines.push(`- Round: ${run.round}`);
      lines.push(`- Difficulty: ${run.difficultyDisplayName || "-"}`);
      lines.push(`- Gold: ${run.gold}`);
      lines.push(`- Debt: ${run.debt}`);
      lines.push(`- Morale: ${run.morale}`);
      const roster = (run.party || [])
        .map(h => `${h.definition.displayName} (${h.definition.role}, ${h.tier})`)
        .join(", ");
      lines.push(`- Roster: ${roster || "(empty)"}`);
      const relics = (run.activeRelics || []).join(", ");
      lines.push(`- Relics/Clauses: ${relics || "none"}`);
      const enc = run.currentEncounter;
      lines.push(`- Current encounter: ${enc ? enc.displayName || enc.id || "-" : "none"}`);
      if (run.hasLatestRewardSummary) {
        lines.push(`- Last reward gold: ${run.latestRewardGold}`);
        lines.push(`- Last upkeep: ${run.latestTotalUpkeep}`);
        lines.push(`- Last interest: ${run.latestInterestCharged}`);
      }
    } else {
      lines.push("No active run.");
    }

    const entries = DebugLogBuffer.getEntries();
    lines.push("");
    lines.push("## Recent Warnings / Errors");
    if (entries.length === 0) {
      lines.push("(none)");
    } else {
      for (const e of entries) {
        lines.push(`[${e.ts}] [${e.level}] ${e.text}`);
      }
    }

    return lines.join("\n");
  },
};
