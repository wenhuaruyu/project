# AGENTS

## Current Repository State (Important)
- This repo is currently docs-only: `memory-bank/*.md` and `docs/*.md` exist; `miniprogram/` and `cloudfunctions/` are planned in docs but are not present yet.
- There are no verified build/test/lint/typecheck/codegen configs in this repo yet. Do not invent `npm`/`pnpm`/`pytest` workflows.

## Source of Truth Priority
- Trust files in this order for planning and edits:
  1. `docs/api-spec.md` (cloud function contracts and response schema)
  2. `docs/db-schema.md` (collections, fields, indexes, security constraints)
  3. `docs/architecture.md` (module split and naming conventions)
  4. `memory-bank/prd.md` (scope and product requirements)
  5. `memory-bank/tech-stack.md` (project positioning and setup intent)

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
- "验证测试"默认是人工验收：使用微信开发者工具与云开发控制台进行可复现检查；当前阶段不强制自动化测试脚本。

## Confirmed Execution Rules
- Payment success is finalized only by `payment-callback`; frontend payment results are informational only. In `dev`, controlled callback simulation is allowed; in `prod`, only real callbacks count.
- `auth-verify-booking` data source in V1 is cloud DB `bookings` only (no real-time external PMS integration).
- Naming rule is fixed: API fields use `camelCase`; DB fields use `snake_case`; mapping is done at cloud-function boundaries.
- V1 admin scope includes backend cloud-function capabilities only (permissions/validation/data writes). Admin UI pages are optional and not a release gate.
- Release approval is by project owner and requires: flow A/B/C pass, payment-callback rule pass, permission checks pass, sensitive-data checks pass, and `memory-bank/progress.md` updated.

## Additional Mandatory Rules
- 写任何代码前必须完整阅读 `memory-bank/architecture.md`。
- 写任何代码前必须完整阅读 `memory-bank/prd.md`。
- 每完成一个重大功能或里程碑后，必须更新 `memory-bank/architecture.md`。
