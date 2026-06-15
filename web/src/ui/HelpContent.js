import { GameState } from "../core/GameState.js";

const CONTENT = {
  [GameState.Scout]: {
    title: "Scout / Contract",
    body: "Review the next dungeon contract before committing resources. The opposition roster shows what your guild will fight. Contract payout is the gold earned if your party wins.",
  },
  [GameState.Shop]: {
    title: "Shop / Recruitment",
    body: "Spend gold to sign new adventurers or promote matching ones. Hiring expands your roster, but every adventurer adds wage pressure. Reroll refreshes candidates. Pay Debt converts spare gold into lower debt.",
  },
  [GameState.Formation]: {
    title: "Formation & Payroll",
    body: "Step 1 — Drag heroes onto hex tiles. Frontline takes hits first; backline is safer but can still be hit by some enemies. Step 2 — Choose your payroll policy. Standard Pay is safe. A loan gives gold now but adds debt. Cut Wages lowers costs but weakens the party. Victory Bonus boosts attack but adds debt pressure if you lose.",
  },
  [GameState.Combat]: {
    title: "Combat / Report",
    body: "Combat is automatic. Your formation, roster, payroll choice, and enemy matchup determine the result. After combat, the ledger applies payout, wages, debt interest, morale changes, and staff development.",
  },
  [GameState.RelicReward]: {
    title: "Relic",
    body: "Choose one relic to add a permanent benefit for the rest of the run. Each relic modifies a guild mechanic in a different way.",
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
