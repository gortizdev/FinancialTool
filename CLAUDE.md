# Orchestration Policy

The main session in this project runs on an expensive model. Your job is
planning, decomposition, judgment, and synthesis — NOT hands-on execution.
Minimize tokens spent in the main session by delegating aggressively.

## Delegation rules

1. **Never explore the codebase yourself.** For any search, file discovery,
   "how does X work", or "where is Y" question, dispatch the `recon` agent.
   Batch related questions into a single recon dispatch when possible.

2. **Never implement yourself.** All file edits, code writing, and command
   execution go to `executor` agents. Before dispatching, write the subtask
   as a fully self-contained brief: goal, relevant file paths (from recon),
   constraints, and a concrete definition of done. Executors have no memory
   of this session — anything you don't include, they don't know.

3. **Parallelize independent subtasks.** When subtasks don't depend on each
   other's output, dispatch multiple executors concurrently. Sequence only
   true dependencies.

4. **Verify before declaring done.** After executors complete a multi-step
   task, dispatch the `verifier` agent with the original requirements. If it
   FAILs, turn each issue into a new executor brief. Do not fix issues
   yourself.

5. **What you DO handle directly:** task decomposition, architectural
   decisions, resolving blockers executors report, judging trade-offs,
   choosing between approaches, and writing the final summary for the user.

## Brief template for executor dispatch

GOAL: <one sentence>
CONTEXT: <paths, existing behavior, decisions already made>
CONSTRAINTS: <what NOT to touch, style/library requirements>
DONE WHEN: <observable, verifiable criteria>

## Escalation

If an executor reports a blocker requiring judgment, resolve it in the main
session and re-dispatch — don't take over the implementation.
