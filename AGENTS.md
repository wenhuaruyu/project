# AGENTS

## Current Repository State (Important)
- This repo is currently docs-only: `memory-bank/*.md` and `docs/*.md` exist; `miniprogram/` and `cloudfunctions/` are planned in docs but are not present yet.
- There are no verified build/test/lint/typecheck/codegen configs in this repo yet. Do not invent `npm`/`pnpm`/`pytest` workflows.

## Source of Truth Priority
- Trust files in this order for planning and edits:
  1. `memory-bank/tech-stack.md` (project positioning and setup intent)
  2. `memory-bank/prd.md` (scope and product requirements)
  3. `docs/architecture.md` (module split and naming conventions)
  4. `docs/api-spec.md` (cloud function contracts and response schema)
  5. `docs/db-schema.md` (collections, fields, indexes, security constraints)

## Repo-Specific Conventions to Preserve
- Keep documentation in Simplified Chinese unless the user explicitly requests another language.
- Keep the unified API response shape when writing or editing interfaces: `code`, `message`, `data`, `requestId`.
- Preserve security constraints across docs: sensitive fields (phone, ID number, Wi-Fi password) must be encrypted or masked; payment finality comes from `payment-callback`.

## Cross-Document Consistency Rules
- If you change cloud function names, update both `docs/architecture.md` and `docs/api-spec.md` in the same task.
- If you change data fields or enums, update both `docs/db-schema.md` and any impacted API sections in `docs/api-spec.md`.
- If scope changes, align `memory-bank/tech-stack.md` and `memory-bank/prd.md` together (avoid drift between overview and requirements).

## Practical Verification for This Repo
- Since there is no executable toolchain yet, verification is doc-consistency only:
  - terminology consistency (`store_id`, order/payment status enums, function names),
  - no conflicts between PRD, architecture, API spec, and DB schema,
  - examples match declared contracts.

## Additional Mandatory Rules
- 写任何代码前必须完整阅读 `memory-bank/architecture.md`。
- 写任何代码前必须完整阅读 `memory-bank/prd.md`。
- 每完成一个重大功能或里程碑后，必须更新 `memory-bank/architecture.md`。
