## Summary

## Testing
- [ ] Tested locally against Supabase dev instance
- [ ] Tested the happy path
- [ ] Tested edge cases (locked bet, VOID match, first login redirect)
- [ ] No regressions in adjacent features (checked manually)

## Code Quality
- [ ] No `console.log` or `console.error` left in code
- [ ] No `// @ts-ignore` or `// eslint-disable` comments
- [ ] No `any` types introduced
- [ ] All new functions have explicit return types
- [ ] File is ≤ 150 lines
- [ ] No commented-out code blocks

## DB / API (if applicable)
- [ ] RLS policies cover the new data access pattern
- [ ] Server Actions / API routes validate role server-side
- [ ] No client-side time checks for bet locking

## Design (if applicable)
- [ ] Uses design system tokens (no hardcoded hex colours)
- [ ] Tested at 375px (mobile) and 1280px (desktop) widths
- [ ] Dark theme renders correctly