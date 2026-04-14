# Spec-Driven Development Guide

## How This Works
Each remaining task has a numbered spec file in this directory. Specs are self-contained: they include the problem, root cause, exact fix, files to read, files to modify, verification steps, and rollback plan.

**Rule: 1 spec = 1 Claude Code session = 1 commit.**

## Execution Order

| # | Spec | Type | Risk | Dependencies |
|---|------|------|------|--------------|
| 00 | Fix baseline errors (tsc + Expo Go) | Bug fix | Low | None -- DO THIS FIRST |
| 01 | Fix custom fast duration display | Bug fix | Low | COMPLETED |
| 02 | Fix chart X-axis label truncation | Bug fix | Medium | 00 (clean tsc baseline) |
| 03 | Fix goal line visibility on chart | Bug fix | Medium | None (can combine with 02) |
| 04 | Add user name to greeting | Feature | Low | None |
| 05 | Apple Health sync onboarding screen | Feature | Low | None |
| 06 | Learn tab images | Feature | Low | Deferred/optional |
| 07 | Premium feature gating | Feature | Medium | RevenueCat dashboard configured |
| 08 | App Store submission | Checklist | N/A | All above complete |

**SPEC-02 and SPEC-03 can be combined** into one session since they both modify `WeightChart.tsx`. All others should be separate sessions.

## How to Run a Session

### Before Starting
1. Open Claude Code in the `expo/` directory
2. Claude Code will auto-read `CLAUDE.md`
3. Tell Claude Code: "Execute SPEC-NN" (e.g., "Execute SPEC-01")
4. Claude Code should read the spec file, then the listed source files, then implement

### Prompt Template
```
Read expo/specs/01-fix-custom-fast-duration.md and implement the fix described in it.
Follow the session protocol in CLAUDE.md. Run npx tsc --noEmit before and after.
```

### After Completion
1. Verify the fix works (spec has verification steps)
2. If complete, move spec to `specs/completed/`
3. Commit: `fix(timer): use plannedDuration for custom fast display\n\nSpec: SPEC-01`
4. If incomplete, add Progress Notes to the spec file for the next session

## Token Budget Guidelines

### What Claude Code SHOULD read per session:
- `CLAUDE.md` (auto-loaded, ~3KB)
- The spec file (~1-2KB)
- Files listed in "Files to Read" (~2-10KB depending on task)
- **Total: 6-15KB of context per session**

### What Claude Code should NOT read:
- `audit_docs/` (outdated, superseded by specs)
- `docs/` (setup guides, not needed for code changes)
- `*.md` files other than CLAUDE.md and the current spec
- Asset files, Android-specific files
- Files not listed in the spec

### If context gets large:
- Start a new session rather than continuing a bloated one
- Update the spec with Progress Notes so the new session can pick up

## When Claude Code Gets Stuck

### Symptom: TypeScript errors cascading after a change
**Action:** `git checkout -- .` to revert, re-read the spec, try again with smaller changes.

### Symptom: A library limitation blocks the approach
**Action:** Document what was tried in the spec's Progress Notes. Consider the spec's alternative approaches if listed. If no alternative, mark as "blocked" and move to the next spec.

### Symptom: Fix works but breaks something else
**Action:** Run `npx tsc --noEmit` to find type errors. Check the "Testing Checklist" in CLAUDE.md for the affected area. The regression likely touches the same store or component.

### Abandon Threshold
If 3 attempts at the same fix fail, stop. Document what was tried and why it failed in the spec's Progress Notes. Move to the next spec and revisit later with fresh context.

## Spec File Format

```markdown
# SPEC-NN: Title

**Status:** pending | in-progress | completed | blocked
**Priority:** P0 (ship blocker) | P1 (should fix) | P2 (nice to have)
**Estimated Effort:** low (<30 min) | medium (30-90 min) | high (90+ min)

## Problem
[User-visible impact in one sentence]

## Root Cause
[Technical explanation with file paths and line numbers]

## Exact Fix
[Step-by-step code changes]

## Files to Read Before Starting
[Ordered list]

## Files to Modify
[Exhaustive list]

## Verification Steps
[How to confirm it works]

## Rollback Plan
[How to undo]

## Progress Notes
[Updated by Claude Code if partially completed]
```

## After All Specs Are Done
Move to `APP_STORE_CHECKLIST.md` for submission preparation.
