# AGENTS.md instructions for c:\Workspace\Bootmatch

<INSTRUCTIONS>
## Skills
A skill is a set of local instructions to follow that is stored in a `SKILL.md` file. Below is the list of skills that can be used. Each entry includes a name, description, and file path so you can open the source for full instructions when using a specific skill.
### Available skills
- skill-creator: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Codex's capabilities with specialized knowledge, workflows, or tool integrations. (file: C:/Users/SimonvanRoozendaal/.codex/skills/.system/skill-creator/SKILL.md)
- skill-installer: Install Codex skills into $CODEX_HOME/skills from a curated list or a GitHub repo path. Use when a user asks to list installable skills, install a curated skill, or install a skill from another repo (including private repos). (file: C:/Users/SimonvanRoozendaal/.codex/skills/.system/skill-installer/SKILL.md)
### How to use skills
- Discovery: The list above is the skills available in this session (name + description + file path). Skill bodies live on disk at the listed paths.
- Trigger rules: If the user names a skill (with `$SkillName` or plain text) OR the task clearly matches a skill's description shown above, you must use that skill for that turn. Multiple mentions mean use them all. Do not carry skills across turns unless re-mentioned.
- Missing/blocked: If a named skill isn't in the list or the path can't be read, say so briefly and continue with the best fallback.
- How to use a skill (progressive disclosure):
  1) After deciding to use a skill, open its `SKILL.md`. Read only enough to follow the workflow.
  2) If `SKILL.md` points to extra folders such as `references/`, load only the specific files needed for the request; don't bulk-load everything.
  3) If `scripts/` exist, prefer running or patching them instead of retyping large code blocks.
  4) If `assets/` or templates exist, reuse them instead of recreating from scratch.
- Coordination and sequencing:
  - If multiple skills apply, choose the minimal set that covers the request and state the order you'll use them.
  - Announce which skill(s) you're using and why (one short line). If you skip an obvious skill, say why.
- Context hygiene:
  - Keep context small: summarize long sections instead of pasting them; only load extra files when needed.
  - Avoid deep reference-chasing: prefer opening only files directly linked from `SKILL.md` unless you're blocked.
  - When variants exist (frameworks, providers, domains), pick only the relevant reference file(s) and note that choice.
- Safety and fallback: If a skill can't be applied cleanly (missing files, unclear instructions), state the issue, pick the next-best approach, and continue.
</INSTRUCTIONS>

## Project overview
BootMatch is a minimal MVP that resolves a renter's ski boot (brand + model + optional flex/year) to a canonical boot record and returns the top similar-fitting boots.

## Stack
- Next.js 14 (pages router) + React 18
- Prisma + SQLite (local)
- Scraper CLI (tsx) for ingestion

## Key areas and pointers
- Scraper (separate runtime)
  - Entry: `src/scrapers/cli.ts`, `src/scrapers/runner.ts`
  - Sources: `src/scrapers/sources/example/*`, `src/scrapers/sources/evo/*`
  - Shared helpers: `src/scrapers/common/*`
- User app (frontend)
  - UI pages: `src/pages/index.tsx`, `src/pages/results/[bootId].tsx`, `src/pages/admin.tsx`
  - Global styles: `src/styles/globals.css`
- App backend (API + logic)
  - API routes: `src/pages/api/*.ts`, `src/pages/api/admin/*.ts`
  - Matching/resolution: `src/lib/match.ts`, `src/lib/resolver.ts`, `src/lib/fuzzy.ts`, `src/lib/normalize.ts`
  - DB access: `src/lib/db.ts`, `prisma/schema.prisma`

## Data and scripts
- Seed data: `src/data/boots.seed.json`
- Seed scripts: `src/lib/seed.ts` (API), `scripts/seed.js` (CLI)
- Tests: `tests/*`

## Dev commands
- App: `npm run dev`
- Seed DB: `npm run seed`
- Scraper: `npm run crawl -- --source=example --mode=discover|parse|ingest`
