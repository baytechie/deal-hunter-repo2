# Amazon Associates Compliance Guide

## Overview

This document outlines Deal Hunt's compliance with Amazon Associates Program policies and serves as a checklist for maintaining program eligibility.

## Compliance Checklist

### 1. Proper Disclosure

- [x] Clear affiliate disclosure on every page with Amazon links
- [x] "As an Amazon Associate, Deal Hunt earns from qualifying purchases" statement
- [x] Disclosure visible before users click affiliate links
- [x] Privacy Policy includes affiliate disclosure section
- [x] About page with detailed affiliate explanation
- [x] Info icon on deal cards showing disclosure on tap

### 2. Original Content

- [x] Every featured deal includes original analysis (50-150 words)
- [x] Unique pros and cons not copied from Amazon
- [x] Original expert verdicts (BUY NOW/WAIT/PASS)
- [x] "When to Buy" timing recommendations
- [x] "Best For" audience targeting
- [x] Content adds value beyond what's on Amazon

### 3. Price Accuracy

- [x] Prices fetched from Amazon API or updated regularly
- [x] Clear indication that prices may change
- [x] No misleading price comparisons
- [x] Discount percentages calculated accurately

### 4. Link Compliance

- [x] All Amazon links include proper Associate tag
- [x] Links open Amazon directly (no cloaking)
- [x] No link manipulation or circumvention
- [x] Links work correctly on all devices

### 5. Prohibited Content

- [x] No sexually explicit content
- [x] No violent content
- [x] No discriminatory content
- [x] No illegal products promotion
- [x] No trademark infringement

### 6. Technical Requirements

- [x] Associates tag applied to all Amazon product links
- [x] Mobile app complies with mobile Associates policies
- [x] No programmatic link shortening that hides destination

## Implementation Details

### Affiliate Tag Configuration

```
Associate Tag: huntdeals05-20
```

The tag is applied in:
- `src/modules/deals/services/affiliate.service.ts` (Backend)
- All Amazon product links in the app

### Disclosure Locations

1. **Profile Page**: "How We Make Money" expandable section
2. **About Page**: Full affiliate disclosure
3. **Deal Cards**: Info icon with disclosure snackbar
4. **Privacy Policy**: Section 5 - Affiliate Links
5. **App Footer**: Affiliate Disclosure link

### Database Fields for Compliance

New fields added to Deal entity:

```typescript
originalAnalysis: string | null;  // 50-150 word unique analysis
pros: string[] | null;            // Array of advantages
cons: string[] | null;            // Array of disadvantages
expertVerdict: string | null;     // "BUY NOW", "WAIT", "PASS"
whenToBuy: string | null;         // Timing recommendation
bestFor: string | null;           // Target audience
retailer: string | null;          // Retailer identifier
priceHistoryJson: string | null;  // Historical price data
```

## Reapplication Guide

If program membership was terminated, follow these steps:

### Step 1: Review Denial Reasons

Common reasons for denial:
- Insufficient original content
- Missing or inadequate disclosure
- Too much Amazon content copied
- Low traffic/engagement
- Misleading information

### Step 2: Make Required Changes

1. Ensure all deals have original analysis
2. Add pros/cons to featured deals
3. Verify disclosure is visible everywhere
4. Update Privacy Policy with detailed affiliate section
5. Add About page with full disclosure

### Step 3: Reapply

1. Wait required period (typically 24 hours)
2. Submit new application at https://affiliate-program.amazon.com
3. Provide updated app details
4. Explain improvements made

### Step 4: Post-Approval

1. Verify Associate tag is correct
2. Test links are working
3. Monitor for any policy updates
4. Keep adding original content

## Content Guidelines

### What Makes Good Original Analysis

**Good Example:**
> "This is the lowest price we've seen for the AirPods Pro in the last 90 days. At $189, you're saving $60 off the regular price. The 2nd generation model adds improved noise cancellation and a new charging case with Find My support. If you've been waiting for a deal, this is it. The only downside is limited color options - just white. Best for Apple users who want premium audio quality."

**Poor Example:**
> "AirPods Pro on sale. Good price. Buy now."

### Verdict Guidelines

- **BUY NOW**: Use when price is at or near historical low, product has good reviews, and value is clear
- **WAIT**: Use when price is good but not great, or a better deal is likely coming soon
- **PASS**: Use when price isn't actually a deal, or product has significant issues

## Monitoring and Maintenance

### Weekly Tasks
- Review new deals for original content
- Check that disclosure is displaying correctly
- Verify affiliate links are working

### Monthly Tasks
- Review Amazon Associates reports
- Check for policy updates
- Update any outdated content

### Quarterly Tasks
- Audit all disclosure text
- Review and update Privacy Policy
- Check competitor compliance for benchmarking

## Contact Information

Amazon Associates Support: associates@amazon.com

Deal Hunt Support: hunter4dealsapp@gmail.com

## Version History

- **v1.0** (January 2026): Initial compliance implementation
- Added disclosure to Profile, About, Deal Cards
- Created original analysis fields
- Updated Privacy Policy

---

*This document should be reviewed and updated whenever Amazon Associates policies change.*
