---
name: analyze-codebase
description: Parallel codebase health analysis across multiple dimensions
argument-hint: "[optional: specific area to focus on]"
---

# Codebase Analysis Workflow

**Focus Area:** $ARGUMENTS (or full codebase)

---

## Parallel Fanout Analysis

Launch all analysis agents simultaneously:

```
┌→ Code Quality Agent ───┐
│→ Security Agent ───────┼→ Aggregate Report
│→ Architecture Agent ───┤
│→ Test Coverage Agent ──┤
└→ Performance Agent ────┘
```

---

### Agent 1: Code Quality Analysis
**@code-reviewer** examines:
- Linting violations
- Code duplication (DRY)
- Complexity metrics (cyclomatic complexity)
- Dead code detection
- Naming conventions
- Comment quality

**Output:** `analysis/code-quality-report.md`

---

### Agent 2: Security Analysis
**@security-auditor** examines:
- Dependency vulnerabilities (`npm audit`)
- OWASP Top 10 compliance
- Hardcoded secrets scan
- Input validation patterns
- Authentication implementation
- Authorization patterns

**Output:** `analysis/security-report.md`

---

### Agent 3: Architecture Analysis
**@architect** examines:
- Module coupling/cohesion
- SOLID principles adherence
- Design patterns usage
- API consistency
- Database design quality
- Scalability concerns

**Output:** `analysis/architecture-report.md`

---

### Agent 4: Test Coverage Analysis
**@test-writer** examines:
- Current coverage percentage
- Untested critical paths
- Test quality assessment
- Missing edge case tests
- Integration test coverage

**Output:** `analysis/test-coverage-report.md`

---

### Agent 5: Performance Analysis
**@backend-engineer** examines:
- N+1 query patterns
- Missing database indexes
- Memory leak potential
- Bundle size analysis
- API response times
- Caching opportunities

**Output:** `analysis/performance-report.md`

---

## Aggregation

Combine all reports into executive summary:

```markdown
# Codebase Health Report

**Generated:** $TIMESTAMP
**Scope:** $ARGUMENTS

## Executive Summary

| Dimension | Score | Trend |
|-----------|-------|-------|
| Code Quality | B+ | ↑ |
| Security | A- | → |
| Architecture | B | ↓ |
| Test Coverage | C+ | ↑ |
| Performance | B- | → |

**Overall Health Score:** B

## Critical Issues (Immediate Action Required)
1. [Issue with severity and location]

## High Priority (This Sprint)
1. [Issue]

## Medium Priority (This Quarter)
1. [Issue]

## Low Priority (Backlog)
1. [Issue]

## Recommendations

### Quick Wins (< 1 day effort)
1. [Recommendation]

### Medium Effort (1-3 days)
1. [Recommendation]

### Large Initiatives (> 1 week)
1. [Recommendation]

## Detailed Reports
- [Code Quality Report](./code-quality-report.md)
- [Security Report](./security-report.md)
- [Architecture Report](./architecture-report.md)
- [Test Coverage Report](./test-coverage-report.md)
- [Performance Report](./performance-report.md)
```

---

## Commands

```bash
# Run all automated checks
npm run lint -- --format json > analysis/lint-results.json
npm test -- --coverage --json > analysis/test-results.json
npm audit --json > analysis/security-audit.json

# Generate reports
mkdir -p analysis
```
