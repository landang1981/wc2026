# 05 — Dev Rules & Team Workflow

**Team:** 4 developers · Remote-first · Next.js 14 / Supabase / Vercel
**Tools:** Git + GitHub · Conventional Commits · ESLint · Prettier · TypeScript strict mode

---

## Part 1 — Git Branching Strategy

### Branch Model

```
main
 └── staging          ← mirrors Vercel Preview (auto-deploy)
      └── develop     ← integration branch (all features merge here first)
           ├── feature/WC-001-match-card-component
           ├── feature/WC-012-bet-selector-lock
           ├── fix/WC-023-timezone-drift-rls
           └── chore/WC-031-tailwind-config-cleanup
```

| Branch | Purpose | Who merges | Auto-deploy |
|---|---|---|---|
| `main` | Production. Tagged releases only. | Tech Lead (manual PR) | Vercel Production |
| `staging` | QA / stakeholder review | Tech Lead after QA pass | Vercel Preview |
| `develop` | Active integration | Any dev via approved PR | — |
| `feature/*` | New feature work | Dev → PR to `develop` | — |
| `fix/*` | Bug fixes | Dev → PR to `develop` | — |
| `hotfix/*` | Critical prod fix | Dev → PR to `main` + back-merge to `develop` | — |
| `chore/*` | Config, deps, tooling | Dev → PR to `develop` | — |

### Branch Naming Rules

```
<type>/<TASK-ID>-<short-kebab-description>

# Examples
feature/WC-001-leaderboard-realtime
feature/WC-015-admin-create-user-form
fix/WC-023-bet-lock-server-time
hotfix/WC-034-rls-bets-insert-policy
chore/WC-009-eslint-strict-config
```

- `TASK-ID` matches the GitHub Issue number (e.g., `WC-001`).
- Max 50 characters total in branch name.
- Lowercase only. Hyphens, no underscores.
- **Never commit directly to `main`, `staging`, or `develop`.**

---

## Part 2 — Commit Message Format (Conventional Commits)

### Structure

```
<type>(<scope>): <short summary>

[optional body — what and WHY, not how]

[optional footer: refs, breaking changes]
```

### Types

| Type | When to use |
|---|---|
| `feat` | New user-facing feature |
| `fix` | Bug fix |
| `refactor` | Code change with no behaviour change |
| `style` | Formatting, Tailwind class changes, no logic |
| `test` | Adding or updating tests |
| `chore` | Build config, deps, tooling, CI |
| `docs` | Documentation only |
| `perf` | Performance improvement |
| `ci` | GitHub Actions / Vercel config |

### Scopes (project-specific)

`auth` · `matches` · `bets` · `leaderboard` · `admin` · `db` · `ui` · `api` · `config`

### Rules

- Summary line: **imperative mood**, max **72 chars**, **lowercase**, **no period**.
- Body: explain *why*, not *what*. What is obvious from the diff.
- Reference issues with `Refs: #WC-001` or `Closes: #WC-001`.

### Examples

```bash
# ✅ Correct
feat(bets): lock bet submission when match_datetime ≤ server NOW()

Closes: #WC-023

# ✅ Correct
fix(rls): add missing WITH CHECK on bets update policy

The UPDATE policy had USING but no WITH CHECK, allowing prediction
changes after kickoff when the user had an existing row.

Refs: #WC-023

# ✅ Correct
chore(config): add tailwind neon glow keyframes and shadow tokens

# ❌ Wrong — vague
git commit -m "fix stuff"

# ❌ Wrong — past tense, no scope
git commit -m "Fixed the bet form"

# ❌ Wrong — too long summary
git commit -m "feat(bets): add the ability for users to place bets on match outcomes before kickoff starts"
```

---

## Part 3 — Pull Request Process

### PR Title Format

Same as commit: `<type>(<scope>): <summary>`

```
feat(leaderboard): add realtime subscription via supabase channel
fix(auth): redirect to /change-password on must_change_password flag
```

### PR Checklist (enforce via GitHub PR template)

```markdown
<!-- .github/pull_request_template.md -->
## Summary
<!-- 1-3 bullets on what changed and why -->

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
```

### Review Rules

- **Minimum 1 approval** required to merge into `develop`.
- **Tech Lead approval** required to merge `develop` → `staging` or `staging` → `main`.
- Reviewer must run the branch locally for UI changes — screenshot review is not sufficient.
- Author is responsible for resolving all review comments before re-requesting review.
- **No self-merge** — even Tech Lead needs a second approval on `main` merges.

---

## Part 4 — Code Quality Rules (Enforced by CI)

### 4.1 TypeScript — Strict Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**Rules enforced by team convention:**

```typescript
// ❌ FORBIDDEN
const data: any = await fetchSomething()
// @ts-ignore
const result = riskyCall()
function doThing(x) { return x }   // implicit any parameter

// ✅ REQUIRED
const data: Match[] = await fetchSomething()
function doThing(x: string): boolean { return x.length > 0 }

// ❌ FORBIDDEN — non-null assertion without guard
const name = user!.display_name

// ✅ REQUIRED — explicit guard
const name = user?.display_name ?? 'Unknown'
```

**All shared types live in `types/index.ts`.** No inline type definitions that duplicate existing types.

### 4.2 ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked"
  ],
  "rules": {
    "no-console": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "type-imports" }],
    "@typescript-eslint/explicit-function-return-type": ["warn", { "allowExpressions": true }],
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### 4.3 Prettier Configuration

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

`prettier-plugin-tailwindcss` auto-sorts Tailwind class names — no manual ordering required.

### 4.4 Banned Patterns (CI blocks merge if found)

| Pattern | Why banned |
|---|---|
| `console.log` / `console.error` | Use structured logging or remove |
| `// @ts-ignore` | Fix the type issue instead |
| `// eslint-disable` | Fix the lint issue instead |
| `as any` | Use proper types or unknown + type guard |
| Hardcoded hex colours (`#00FF87` in JSX/TSX) | Use Tailwind tokens |
| `new Date()` in bet-lock logic (client-side) | Use server time from DB |
| Direct `supabase.from().insert()` in Client Components | Use Server Actions |

---

## Part 5 — Pre-commit Hooks (Husky + lint-staged)

```json
// package.json (relevant section)
{
  "scripts": {
    "lint":       "next lint",
    "type-check": "tsc --noEmit",
    "format":     "prettier --write .",
    "prepare":    "husky"
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

```json
// .lintstagedrc.json
{
  "*.{ts,tsx}": [
    "eslint --fix --max-warnings 0",
    "prettier --write"
  ],
  "*.{json,md,css}": ["prettier --write"]
}
```

Commits are **blocked** if ESLint reports any errors or warnings.

---

## Part 6 — CI Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [develop, staging, main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run type-check    # tsc --noEmit
      - run: npm run lint          # next lint (zero warnings)
      - run: npx prettier --check . # format check
```

All three checks must pass — type errors, lint errors, and format errors each independently block the PR.

---

## Part 7 — Task Assignment & Scope Rules

### Team Structure

| Dev | Primary Domain |
|---|---|
| Dev 1 (Tech Lead) | Architecture, DB, RLS, API routes, Server Actions |
| Dev 2 | Match management UI, Admin panel |
| Dev 3 | Betting engine UI, BetSelector, bet locking |
| Dev 4 | Leaderboard UI, Realtime subscription, Auth flows |

### Scope Rules

- **One feature branch = one GitHub Issue** — no bundling unrelated changes.
- Each PR touches **≤ 5 files** for feature work, **≤ 10 files** for large refactors.
- If a task requires touching shared types, create a preparatory PR (`chore(types): ...`) first.
- Never modify `02-database-schema.md` schema unilaterally — schema changes require Tech Lead sign-off and a coordinated migration PR.

### Definition of Done

A task is **done** only when:
1. PR is merged to `develop`.
2. Feature is verified on the `develop` environment (not just locally).
3. GitHub Issue is closed and linked in the merge commit.
4. Any follow-up issues discovered during review are filed as new Issues.
