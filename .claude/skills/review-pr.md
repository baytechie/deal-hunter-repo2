---
name: review-pr
description: Comprehensive PR review with parallel analysis
argument-hint: "<PR number or branch name>"
---

# Pull Request Review Workflow

**PR:** $ARGUMENTS

---

## Parallel Analysis Phase

I will launch multiple agents in parallel to analyze different aspects:

### Agent 1: Code Quality Review
**@code-reviewer** agent checks:
- Code style and conventions
- DRY violations
- Complexity issues
- Naming consistency
- Error handling

### Agent 2: Security Audit
**@security-auditor** agent checks:
- OWASP Top 10 vulnerabilities
- Input validation
- Authentication/authorization
- SQL injection risks
- XSS vulnerabilities
- Hardcoded secrets

### Agent 3: Architecture Review
**@architect** agent checks:
- SOLID principles adherence
- Design pattern usage
- Module boundaries
- API design consistency
- Database design

### Agent 4: Test Coverage
**@test-writer** agent checks:
- Test coverage percentage
- Edge cases covered
- Happy path tests
- Error scenario tests
- Missing test cases

---

## Aggregation Phase

After parallel analysis completes, aggregate findings:

```markdown
# PR Review Summary: $ARGUMENTS

## Overview
- **Files Changed:** [count]
- **Lines Added:** [count]
- **Lines Removed:** [count]

## Code Quality Score: [A-F]
[Findings from code-reviewer]

## Security Score: [A-F]
[Findings from security-auditor]

## Architecture Score: [A-F]
[Findings from architect]

## Test Coverage: [percentage]
[Findings from test-writer]

## Critical Issues (Must Fix)
1. [Issue with file:line reference]

## Warnings (Should Fix)
1. [Warning with file:line reference]

## Suggestions (Nice to Have)
1. [Suggestion]

## Recommendation
- [ ] APPROVE
- [ ] REQUEST CHANGES
- [ ] NEEDS DISCUSSION
```

---

## Automated Checks

```bash
# Run all checks
npm run lint
npm run build
npm test
npm run test:cov

# Security scan (if available)
npm audit
```

---

## Review Checklist

**Code Quality:**
- [ ] Follows existing code patterns
- [ ] No unnecessary complexity
- [ ] Proper error handling
- [ ] Appropriate logging

**Security:**
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] SQL/NoSQL injection safe
- [ ] XSS prevention in place

**Testing:**
- [ ] Tests added for new code
- [ ] Tests pass locally
- [ ] Coverage maintained/improved

**Documentation:**
- [ ] Code comments where needed
- [ ] README updated if needed
- [ ] CHANGELOG entry added
