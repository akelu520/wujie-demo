# Feature Requests

Capabilities requested by user that don't currently exist.

---

## [FEAT-20260310-001] visual-design-companion

**Logged**: 2026-03-10T00:00:00Z
**Priority**: medium
**Status**: pending
**Area**: frontend

### Requested Capability
Live in-browser preview that renders different design options side-by-side so user can compare without reading CSS descriptions.

### User Context
During card hover state brainstorming, options (shadow-lift vs ring-deepen vs scale+shadow) were described as CSS diffs. User had to imagine the visual result. A live preview component would let them see each option rendered with real components.

### Complexity Estimate
complex

### Suggested Implementation
A temporary Vite dev page (`/design-preview`) that renders the same component with each variant side-by-side. Could be generated as part of the brainstorming skill output, then cleaned up after confirmation.

### Metadata
- Frequency: first_time
- Related Features: brainstorming skill

---

## [FEAT-20260310-002] auto-persist-brainstorm-decisions

**Logged**: 2026-03-10T00:00:00Z
**Priority**: medium
**Status**: pending
**Area**: docs

### Requested Capability
After a brainstorming flow concludes with a confirmed decision, automatically write a spec file and update `MEMORY.md` with the design token/pattern.

### User Context
The brainstorming flow for button click state and card hover state produced confirmed decisions, but the spec file and memory update required manual follow-up. These should be automatic as part of the brainstorming skill's conclusion step.

### Complexity Estimate
medium

### Suggested Implementation
Add a "conclusion" step to the brainstorming SKILL.md that, upon final user approval (`ok` / `确认`), automatically:
1. Writes spec to `admin/docs/superpowers/specs/YYYY-MM-DD-{topic}.md`
2. Appends a summary line to `MEMORY.md` under a "Design Decisions" section

### Metadata
- Frequency: recurring
- Related Features: brainstorming skill, self-improvement skill

