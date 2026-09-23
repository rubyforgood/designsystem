# Tokens

The first piece of Phase 4 (see `docs/portability/design-md-tagging.md`) — pulling the Local
*values* design.md's Foundations section states (indigo, Figtree, Bootstrap Icons, a specific
4px spacing scale) apart from the Portable *rules* those values happen to satisfy, so a team
adopting this system can keep the rules and replace the values without hunting through prose to
find every place a hex code or a font name is buried.

`theme.css` is the shipped default — Human Essentials' actual palette, unmodified — implemented
as a Tailwind v4 `@theme` block. Swap its **values**, not its **structure** (the role names on
the left): design.md's component rules refer to roles (`brand-600`, `--color-success`), not to
"indigo" or "emerald" by name, so as long as every role still resolves to *something*, retheming
is a find-and-replace in one file, not an edit to the spec.

## Rules vs. defaults, by category

### Colour

**Portable:**
- Never colour alone (WCAG 1.4.1) — every coloured signal carries a word, usually an icon too.
- Semantic tones carry exactly one meaning each: success, warning, danger, info. Four is the
  count that's held up in practice; adding a fifth is a decision to write down, not a default to
  expect.
- Text/icon colour needs to clear WCAG AA contrast (4.5:1) against its background. Human
  Essentials measured its `-700` step against white specifically — that number is an artifact of
  *this* palette and this background; a different hue or a dark-mode surface needs its own
  measurement, not an assumption that "the 700 step" is universally safe.
- Depth comes from a hairline border, not a shadow. A shadow is a hint; the border is the edge.

**Local (this default's answer):**
- Brand hue: indigo. Neutral: Tailwind's slate. Semantic hues: emerald/amber/rose/sky.
- The exact contrast ratio Human Essentials measured (rose-600 at 4.51:1 on white) is evidence
  for *that* pairing, not a number to cite for a different one — see `evidence-discipline`.

### Typography

**Portable:**
- One typeface, self-hosted, no CDN request — the rule is about not shipping two font stacks
  and not taking a network dependency on rendering text, not about which face.
- Heading level is document structure, not size. A heading's rank communicates position in the
  outline; visual size is a separate class, chosen independently.
- Each text role (title, body, secondary, meta, field label) gets one consistent treatment
  system-wide, not a per-page judgment call.

**Local (this default's answer):**
- Figtree. The specific class combinations in design.md's Typography table (`text-2xl font-bold
  tracking-tight text-slate-900` for an h1, etc.) are this default's expression of "one
  consistent treatment," in this default's utility vocabulary.

### Iconography

**Portable:**
- One glyph, one meaning, applied consistently — a symbol shouldn't mean one thing on one screen
  and another thing on the next.
- An icon beside its own label is decorative (`aria-hidden`); an icon-only control needs its own
  accessible name — there's no third option.
- An icon-only interactive control is a real `<button>`, not an anchor styled to look like one —
  this is a WCAG 4.1.2 keyboard-behavior requirement (Enter vs. Space), not a style preference.

**Local (this default's answer):**
- Bootstrap Icons, specifically. Any icon set works as long as it's used consistently and the
  rules above hold.

### Spacing, radius, elevation

**Portable:**
- One spacing scale, applied consistently, rather than ad hoc pixel values chosen per component.
- A small number of named elevations (this default uses two: surface, overlay) rather than an
  open-ended shadow scale — the discipline is "elevation means something," not the specific count.

**Local (this default's answer):**
- Tailwind's default 4px scale, unmodified. The specific values in design.md's Spacing table
  (page gutter, card padding, table cell padding, field spacing) are this app's answers within
  that scale, not universal constants — `design-system-migration`'s own writing-rules guidance
  tags exactly this shape of value as Local ("pick a size and enforce it — the value is yours").

## Retheming checklist

1. Edit `theme.css`'s values. Leave the role names alone unless you're also rewriting which
   component rules reference which role.
2. Re-check contrast for anything at the `-700`-equivalent step against your actual background —
   don't assume a different hue clears 4.5:1 at the same scale step Human Essentials measured.
3. If you change spacing scale, radius, or elevation counts, revisit the Portable rules above —
   they describe a discipline (consistency, a small controlled set), not a tolerance for how far
   you can drift from Tailwind's defaults before something else in the audit suite (`table-audit.js`,
   `disclosure-audit.js`) starts reading your new values as a defect. See
   `docs/portability/adapter-reference-app.md` for what happened the one time this was tried for
   real — a reasonable, different spacing choice on a second app tripped several Local pixel
   thresholds baked into the audits themselves, not just the spec.
