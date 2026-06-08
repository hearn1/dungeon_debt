import { GameState } from "../core/GameState.js";

const CONTENT = {
  [GameState.Scout]: {
    title: "Scout / Contract",
    body: "Review the next dungeon contract before committing resources. The opposition roster shows what your guild will fight. Contract payout is the gold earned if your party wins.",
  },
  [GameState.Shop]: {
    title: "Shop / Recruitment",
    body: "Spend cash to sign new adventurers or promote matching ones. Hiring expands your roster, but every adventurer adds wage pressure. Reroll refreshes candidates. Pay Debt converts spare cash into lower ledger debt.",
  },
  [GameState.Formation]: {
    title: "Formation",
    body: "Frontline slots are targeted first. Backline slots are safer but can still be hit by some enemies. Click two slots to swap adventurers. Place durable heroes in front and fragile damage/support heroes behind.",
  },
  [GameState.Payroll]: {
    title: "Payroll",
    body: "Payroll is your pre-combat risk decision. Standard Payroll is safe. Taking a loan gives cash now but adds debt. Cutting wages lowers current costs but weakens the party. Posting a victory bonus costs cash now for temporary combat power.",
  },
  [GameState.Combat]: {
    title: "Combat / Report",
    body: "Combat is automatic. Your formation, roster, payroll choice, and enemy matchup determine the result. After combat, the ledger applies payout, wages, debt interest, morale changes, and staff development.",
  },
  [GameState.RelicReward]: {
    title: "Ledger Clause",
    body: "Choose one ledger clause to add a permanent benefit for the rest of the run. Each clause modifies a guild mechanic in a different way.",
  },
  [GameState.RivalUpdate]: {
    title: "Rival Update",
    body: "Your rival's ghost adapts to reflect your current roster and performance. Their results can affect your morale at the end of the round.",
  },
};

export const HelpContent = {
  get(state) {
    return CONTENT[state] ?? null;
  },
};
