// Reads the design tokens from the loaded stylesheet (tokens/tokens.css, imported by
// .storybook/preview.js) at render time, so these pages can't drift from the real values.
import React, { useEffect, useState } from "react";

function readTokens(prefix) {
  const out = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin sheet
    }
    for (const rule of Array.from(rules || [])) {
      if (!rule.style || !/:root/.test(rule.selectorText || "")) continue;
      for (const name of Array.from(rule.style)) {
        if (name.startsWith(prefix) && !out.some((t) => t.name === name)) {
          out.push({ name, value: rule.style.getPropertyValue(name).trim() });
        }
      }
    }
  }
  return out;
}

function useTokens(prefix) {
  const [tokens, setTokens] = useState([]);
  useEffect(() => setTokens(readTokens(prefix)), [prefix]);
  return tokens;
}

const cell = { padding: "8px 12px", borderBottom: "1px solid var(--color-neutral-200)", verticalAlign: "middle" };
const code = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "13px" };

function Table({ head, children }) {
  return (
    <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "14px", margin: "16px 0" }}>
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h} style={{ ...cell, textAlign: "left", fontWeight: 600 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

/** Colour swatches for every token starting with `prefix`, e.g. "--color-brand-". */
export function ColorScale({ prefix }) {
  const tokens = useTokens(prefix);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px", margin: "16px 0 32px" }}>
      {tokens.map((t) => (
        <div key={t.name} style={{ border: "1px solid var(--color-neutral-200)", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ height: "56px", background: `var(${t.name})` }} />
          <div style={{ padding: "8px", fontSize: "12px", lineHeight: 1.4 }}>
            <div style={{ ...code, fontSize: "12px", fontWeight: 600 }}>{t.name.replace("--color-", "")}</div>
            <div style={{ ...code, fontSize: "11px", color: "var(--color-neutral-500)", wordBreak: "break-all" }}>{t.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Spacing, radius or shadow tokens with a visual sample. kind: "space" | "radius" | "shadow". */
export function TokenSamples({ prefix, kind }) {
  const tokens = useTokens(prefix);
  const sample = (t) => {
    if (kind === "space") return <div style={{ width: `var(${t.name})`, height: "16px", background: "var(--color-brand-600)", borderRadius: "2px" }} />;
    if (kind === "radius") return <div style={{ width: "48px", height: "48px", background: "var(--color-brand-100)", border: "1px solid var(--color-brand-600)", borderRadius: `var(${t.name})` }} />;
    return <div style={{ width: "96px", height: "48px", background: "white", borderRadius: "8px", boxShadow: `var(${t.name})` }} />;
  };
  return (
    <Table head={["Token", "Value", "Sample"]}>
      {tokens.map((t) => (
        <tr key={t.name}>
          <td style={{ ...cell, ...code }}>{t.name}</td>
          <td style={{ ...cell, ...code, color: "var(--color-neutral-500)" }}>{t.value}</td>
          <td style={{ ...cell, padding: "16px 12px" }}>{sample(t)}</td>
        </tr>
      ))}
    </Table>
  );
}

/** The text roles from design.md's Typography table, rendered at their real sizes. */
export function TypeRoles() {
  const roles = [
    ["Page title", "h1", "1.5rem / 2rem", 700, "--color-neutral-900", "Project overview"],
    ["Card title", "h2", "1rem / 1.5rem", 600, "--color-neutral-900", "Recent activity"],
    ["Section title", "h3", "0.875rem / 1.25rem", 600, "--color-neutral-900", "Team members"],
    ["Body", "p", "0.875rem / 1.25rem", 400, "--color-neutral-700", "Maya Chen moved Website redesign to In review."],
    ["Meta", "small", "0.75rem / 1rem", 400, "--color-neutral-500", "Updated 3 hours ago"],
  ];
  return (
    <Table head={["Role", "Element", "Size / line height", "Sample"]}>
      {roles.map(([role, el, size, weight, color, sample]) => {
        const [fs, lh] = size.split(" / ");
        return (
          <tr key={role}>
            <td style={cell}>{role}</td>
            <td style={{ ...cell, ...code }}>{el}</td>
            <td style={{ ...cell, ...code, color: "var(--color-neutral-500)" }}>{size}</td>
            <td style={{ ...cell, fontFamily: "var(--font-sans)", fontSize: fs, lineHeight: lh, fontWeight: weight, color: `var(${color})` }}>{sample}</td>
          </tr>
        );
      })}
    </Table>
  );
}

/** The 4px spacing scale (Tailwind's default), rendered as bars. */
export function SpacingScale() {
  const steps = [1, 2, 3, 4, 6, 8, 12, 16];
  return (
    <Table head={["Step", "Size", "Sample"]}>
      {steps.map((n) => (
        <tr key={n}>
          <td style={{ ...cell, ...code }}>{n}</td>
          <td style={{ ...cell, ...code, color: "var(--color-neutral-500)" }}>{n * 4}px ({n * 0.25}rem)</td>
          <td style={cell}><div style={{ width: `${n * 4}px`, height: "16px", background: "var(--color-brand-600)", borderRadius: "2px" }} /></td>
        </tr>
      ))}
    </Table>
  );
}

/** Lists tokens matching a prefix in a plain table (no sample). */
export function TokenList({ prefix }) {
  const tokens = useTokens(prefix);
  return (
    <Table head={["Token", "Value"]}>
      {tokens.map((t) => (
        <tr key={t.name}>
          <td style={{ ...cell, ...code }}>{t.name}</td>
          <td style={{ ...cell, ...code, color: "var(--color-neutral-500)" }}>{t.value}</td>
        </tr>
      ))}
    </Table>
  );
}
