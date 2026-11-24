// Shared by the behavior checks for components that draw a form field's edge (combobox, tag input,
// date range picker). WCAG 1.4.11 asks 3:1 for the visual information needed to identify a
// component, and for a text field that's its border. These components used neutral-200, 1.23:1 on
// white, until 2026-11-24; found while migrating SkillRx. Measures the real computed border color
// against the real background behind it, through a canvas so any color syntax (oklch, var())
// resolves to sRGB.
//
// fieldEdge(page, find, name) -> { name, ok, detail }. `find` runs in the page and returns the
// element whose border is the field's edge.

async function fieldEdge(page, find, name = "field edge has 3:1 contrast with what's behind it (WCAG 1.4.11)") {
  const r = await page.evaluate((findSrc) => {
    const el = new Function(`return (${findSrc})()`)();
    if (!el) return { error: "field not found" };
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const rgba = (c) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = "#000"; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data]; };
    const lum = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
      .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
    const border = getComputedStyle(el).borderTopColor;
    let n = el.parentElement || el.getRootNode().host, bg = "rgb(255, 255, 255)";
    while (n && n.nodeType === 1) {
      const c = getComputedStyle(n).backgroundColor;
      if (rgba(c)[3] === 255) { bg = c; break; }
      n = n.parentElement || (n.getRootNode() !== document && n.getRootNode().host);
    }
    const [a, b] = [lum(rgba(border)), lum(rgba(bg))];
    return { ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), border, bg, width: getComputedStyle(el).borderTopWidth };
  }, find.toString());
  if (r.error) return { name, ok: false, detail: r.error };
  return { name, ok: r.ratio >= 3 && parseFloat(r.width) >= 1, detail: `${r.ratio.toFixed(2)}:1 (${r.border} on ${r.bg}, ${r.width})` };
}

module.exports = { fieldEdge };
