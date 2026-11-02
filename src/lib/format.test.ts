import { describe, expect, it } from "vitest";
import { formatCompact, formatDateFr, formatDuration, formatFCFA, formatNumber, formatPercent } from "./format";

describe("format", () => {
  it("groupe les milliers avec une espace fine insécable", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(1250000)).toBe("1 250 000");
    expect(formatNumber(-45000)).toBe("−45 000");
    expect(formatNumber(Number.NaN)).toBe("0");
  });

  it("formate les montants en FCFA", () => {
    expect(formatFCFA(350000)).toBe("350 000 FCFA");
    expect(formatFCFA(5000, { signed: true })).toBe("+5 000 FCFA");
  });

  it("formate en notation compacte", () => {
    expect(formatCompact(950)).toBe("950");
    expect(formatCompact(350000)).toBe("350 k");
    expect(formatCompact(1500000)).toBe("1,5 M");
    expect(formatCompact(12000000)).toBe("12 M");
  });

  it("formate les pourcentages", () => {
    expect(formatPercent(0.183)).toBe("18 %");
    expect(formatPercent(0.1834, 1)).toBe("18,3 %");
    expect(formatPercent(0.2, 1)).toBe("20 %");
  });

  it("formate les durées et dates", () => {
    expect(formatDuration(5)).toBe("5 mois");
    expect(formatDuration(12)).toBe("1 an");
    expect(formatDuration(27)).toBe("2 ans et 3 mois");
    expect(formatDateFr("2026-10-01")).toBe("1er octobre 2026");
    expect(formatDateFr("2026-03-15")).toBe("15 mars 2026");
  });
});
