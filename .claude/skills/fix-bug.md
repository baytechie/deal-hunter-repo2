---
name: fix-bug
description: Bug investigation and fix workflow with iterative testing
argument-hint: "<bug description or issue number>"
---

# Bug Fix Workflow

**Bug Report:** $ARGUMENTS

---

## Phase 1: Investigation

### Step 1.1: Reproduce the Bug

I will:
1. Parse the bug description
2. Identify reproduction steps
3. Attempt to reproduce locally
4. Capture error logs/screenshots

**Output:** Document reproduction in `docs/bugs/$BUG_SLUG/investigation.md`

---

### Step 1.2: Root Cause Analysis

I will invoke the **@safe-researcher** agent to:
1. Trace the code path
2. Identify the root cause
3. Check for related issues
4. Document findings

**Tasks:**
- [ ] Reproduce bug
- [ ] Identify affected files
- [ ] Find root cause
- [ ] Check for regressions

---

## Phase 2: Fix Implementation

### Step 2.1: Implement Fix

I will invoke the **@backend-engineer** or **@frontend-engineer** agent to:
1. Make minimal, targeted changes
2. Add defensive code where needed
3. Ensure no new issues introduced

**Principle:** Fix the bug with the smallest possible change.

---

### Step 2.2: Write Regression Test

I will invoke the **@test-writer** agent to:
1. Write test that fails without fix
2. Write test that passes with fix
3. Add edge case tests

```bash
# Run specific test
npm test -- --testPathPattern=$BUG_SLUG
```

---

## Phase 3: Verification Loop

```
REPEAT:
  1. Run tests
  2. If fail → identify issue → fix
  3. If pass → continue
UNTIL: All tests pass
```

**Commands:**
```bash
npm run lint
npm run build
npm test
npm run test:e2e
```

---

## Phase 4: Documentation

- [ ] Update CHANGELOG.md
- [ ] Add code comments explaining the fix
- [ ] Document any workarounds

---

## Completion

```markdown
# Bug Fix Complete: $BUG_SLUG

## Root Cause
[Explanation]

## Fix Applied
[Description of changes]

## Files Changed
- [list]

## Tests Added
- [list]

## Verification
- [ ] Bug no longer reproducible
- [ ] All tests passing
- [ ] No regressions
```
