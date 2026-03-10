# Errors Log

Command failures, exceptions, and unexpected behaviors.

---

## [ERR-20260310-001] Edit tool

**Logged**: 2026-03-10T00:00:00Z
**Priority**: high
**Status**: pending
**Area**: config

### Summary
Edit tool fails with "File has not been read yet" even for files read earlier in the session.

### Error
```
File has not been read yet. Read it first before writing to it.
```

### Context
- The Edit tool tracks file reads **per conversation turn**, not per session
- After context compression or starting a new turn, all previously-read files are treated as unread
- When editing multiple files in parallel, if any file errors, the rest may fail with "Cancelled: parallel tool call errored"

### Suggested Fix
Before any multi-file Edit batch: read all target files in parallel first (even `limit: 1` is sufficient), then edit in parallel. Never assume a file is "still read" from a previous turn.

### Metadata
- Reproducible: yes
- Related Files: any
- Tags: edit-tool, file-read, parallel

---

## [ERR-20260310-002] Skill tool

**Logged**: 2026-03-10T00:00:00Z
**Priority**: medium
**Status**: pending
**Area**: config

### Summary
`Skill({ skill: "brainstorming" })` failed — skill invoked via user message `@path/`, not via Skill tool.

### Error
```
Unknown skill: brainstorming
```

### Context
- User invoked brainstorming with `@.agents/skills/brainstorming/`
- This is a direct skill reference in the user message, not a Skill tool invocation
- The Skill tool only works for skills explicitly listed in the system-reminder as "available skills"

### Suggested Fix
When user references `@path/to/skill/`, read the SKILL.md at that path and follow its instructions directly. Do not attempt to call it via the Skill tool.

### Metadata
- Reproducible: yes
- Related Files: `.agents/skills/brainstorming/SKILL.md`
- Tags: skill-tool, brainstorming

