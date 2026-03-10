# Learnings Log

Captured learnings, corrections, and discoveries. Review before major tasks.

---

## [LRN-20260310-001] best_practice

**Logged**: 2026-03-10T00:00:00Z
**Priority**: high
**Status**: pending
**Area**: frontend

### Summary
Use `in-data-*:` Tailwind v4 canonical syntax instead of `[[data-attr]_&]:` arbitrary variants.

### Details
When using ancestor-attribute conditional styles in Tailwind v4, the canonical form is `in-data-hoverable:hover:scale-[1.015]` instead of `[[data-hoverable]_&]:hover:scale-[1.015]`. The linter (`suggestCanonicalClasses`) will flag the verbose form and suggest the shorter one. Both produce identical CSS but the `in-data-*:` form is more readable and future-proof.

### Suggested Action
Use `in-data-*:` prefix when writing data-attribute ancestor conditions in Tailwind classes.

### Metadata
- Source: error
- Related Files: `admin/*/src/components/ui/card.tsx`
- Tags: tailwind, css, frontend

---

## [LRN-20260310-002] best_practice

**Logged**: 2026-03-10T00:00:00Z
**Priority**: medium
**Status**: pending
**Area**: frontend

### Summary
Scope card hover effects to multi-card grid context via `data-hoverable` attribute on the grid wrapper.

### Details
When a hover effect (scale, shadow) should only apply to cards inside multi-column grids (not full-width container cards), the cleanest pattern is:
1. Add `in-data-hoverable:hover:...` to the Card component base class
2. Add `data-hoverable` attribute to grid wrapper `<div>` in each page
Full-width cards (filter bars, table containers) are not inside a `data-hoverable` div so they get no hover. Grid stat cards inside `data-hoverable` get the hover. Avoids per-card prop drilling and keeps the Card component API clean.

### Suggested Action
Promote this pattern to `MEMORY.md` as a project convention for any future interactive card groups.

### Metadata
- Source: conversation
- Related Files: `admin/*/src/components/ui/card.tsx`, `admin/apps/*/src/pages/*.tsx`
- Tags: tailwind, card, hover, pattern, frontend

---

## [LRN-20260310-003] correction

**Logged**: 2026-03-10T00:00:00Z
**Priority**: high
**Status**: pending
**Area**: frontend

### Summary
shadcn/ui default button variant hover was broken: `[a]:hover:bg-primary/80` only fires inside `<a>` tags.

### Details
The scaffolded `button.tsx` default variant had `[a]:hover:bg-primary/80` which is a CSS descendant selector meaning "when this button is inside an anchor element". In normal usage, buttons are not inside anchors, so the hover was completely non-functional. Fixed to `hover:bg-primary/90`. This bug likely exists in any project that scaffolded shadcn/ui radix-nova style without reviewing the default variant.

### Suggested Action
When auditing button components, verify the default variant has a plain `hover:` class, not `[a]:hover:`.

### Metadata
- Source: user_feedback
- Related Files: `admin/*/src/components/ui/button.tsx`
- Tags: shadcn, button, hover, bug, frontend

---

## [LRN-20260310-004] best_practice

**Logged**: 2026-03-10T00:00:00Z
**Priority**: medium
**Status**: pending
**Area**: frontend

### Summary
`active:brightness-90` is better than `active:scale-95` for button click state.

### Details
`active:scale-95` causes layout shift (the button physically shrinks, pushing adjacent content) and can clip overflow content. `active:brightness-90` applies `filter: brightness(0.9)` — purely visual darkening with no geometry change. Works uniformly across all button variants without per-variant code. Chosen via structured brainstorming (3 questions: feedback clarity → uniform vs per-variant → specific enhancement).

### Suggested Action
Remove `active:scale-95` from button base class. Use `active:brightness-90` instead.

### Metadata
- Source: conversation
- Related Files: `admin/*/src/components/ui/button.tsx`
- Tags: button, active-state, animation, frontend

