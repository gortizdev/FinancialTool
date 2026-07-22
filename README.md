# Fable 5 Orchestrator / Sonnet 5 Executors — Claude Code Setup

Drop-in config: the main session (Fable 5) plans and delegates; pinned
subagents (Sonnet 5 / Haiku) do the work at lower per-token rates.

## Install

1. Copy `.claude/agents/` and `CLAUDE.md` into your project root.
   (If your project already has a CLAUDE.md, paste the "Orchestration
   Policy" section into it instead.)
2. Start the session on Fable 5:

   ```
   claude --model claude-fable-5
   ```

   Or switch mid-session with `/model claude-fable-5`.

3. If this is the first time the `.claude/agents/` directory exists in the
   project, restart Claude Code once so the new agents directory is picked up.
   After that, edits to agent files hot-reload.

## What's included

| File | Model | Role |
|---|---|---|
| `.claude/agents/recon.md` | Haiku 4.5 | Read-only search/exploration (cheapest) |
| `.claude/agents/executor.md` | Sonnet 5 | Implementation: edits, code, commands |
| `.claude/agents/verifier.md` | Sonnet 5 | Fresh-context verification, read-only |
| `CLAUDE.md` | — | Delegation policy for the Fable 5 main session |

## Cost notes

- The main session bills at Fable 5 rates, so the policy pushes exploration
  and implementation out to subagents. Keep your own messages to the main
  session focused on goals and decisions.
- Consider running the main session at reduced effort (`/effort medium`)
  for routine planning; raise it for genuinely hard decomposition.
- The built-in Explore agent can inherit your main session's model — meaning
  background searches bill at Fable rates. The `recon` agent here exists to
  route that work to Haiku instead; the CLAUDE.md policy tells the session
  to use it.

## Verify it's working

Ask the session to do a small multi-part task and watch the agent activity:
you should see recon/executor/verifier dispatches rather than the main
session reading files itself. Each subagent gets its own context window, so
the main session's context also stays lean over long tasks.

## Tuning

- Make executors cheaper: set `effort: medium` in `executor.md` for routine
  work.
- Team-share: commit `.claude/agents/` and `CLAUDE.md` to the repo.
- Personal/cross-project: copy the agent files to `~/.claude/agents/` instead.
