# 开发进度记录

## 2026-04-26

### 已完成步骤
- 第 1 步：建立基础目录骨架（已完成并通过人工验收）。
- 第 2 步：确定环境分层约定（已完成并通过人工验收）。

### 本步实际执行内容
- 新建顶层目录：`miniprogram/`、`cloudfunctions/`、`scripts/`。
- 新建前端页面目录：`home`、`checkin`、`guide-list`、`guide-detail`、`gift-list`、`gift-detail`、`order-confirm`、`order-list`、`profile`。
- 新建前端公共目录：`components/info-card`、`components/product-card`、`components/empty-state`、`services`、`utils`、`constants`、`styles`。
- 新建云函数目录：`auth-verify-booking`、`guest-profile-submit`、`guide-query`、`product-query`、`order-create`、`order-pay`、`payment-callback`、`inventory-lock`、`admin-content-manage`。
- 为空目录添加 `.gitkeep`，确保目录结构可被 Git 跟踪。

### 验证结果（人工验收）
- 目录完整性：与 `docs/architecture.md` 的第 1 步范围一致。
- 命名规范：目录名全部小写，复合词采用 `kebab-case`。
- 验证结论：第 1 步通过，可在用户确认后进入第 2 步。

### 下一步
- 待执行第 3 步：统一接口返回协议（`code`、`message`、`data`、`requestId`）。

### 第 2 步实际执行内容
- 新增小程序环境映射文件：`miniprogram/constants/env-profile.js`。
- 新增云函数环境映射文件：`cloudfunctions/common/env-profile.js`。
- 新增环境约定文档：`docs/env-layering.md`。
- 更新 `docs/architecture.md` 环境说明，明确 V1 固定 `dev` / `prod` 两套环境。

### 第 2 步验证结果（人工验收）
- 双环境确认：文档与配置中仅定义 `dev`、`prod` 两套业务环境。
- 前端映射确认：`develop/trial -> dev`，`release -> prod`，未知值抛错。
- 云函数映射确认：`-dev -> dev`，`-prod -> prod`，未知后缀抛错。
- 第三环境检查：全仓检索 `test/staging/uat/sandbox`，未发现作为业务环境被启用；`docs/architecture.md` 已移除“后续补 test”描述。
- 验证结论：第 2 步通过，可进入第 3 步。

## 2026-04-27

### 已完成步骤
- 第 3 步：统一接口返回协议（已完成并通过人工验收）。

### 第 3 步实际执行内容
- 新增统一响应构建文件：`cloudfunctions/common/response.js`。
- 固定云函数响应顶层协议：`code`、`message`、`data`、`requestId`。
- 在 `response.js` 中统一处理 `requestId`：优先读取上下文（`requestId`/`awsRequestId`/`request_id`），缺失时生成兜底 `req_*`。
- 为以下 9 个云函数补齐 `index.js` 入口并统一接入响应构建器：
  - `cloudfunctions/auth-verify-booking/index.js`
  - `cloudfunctions/guest-profile-submit/index.js`
  - `cloudfunctions/guide-query/index.js`
  - `cloudfunctions/product-query/index.js`
  - `cloudfunctions/order-create/index.js`
  - `cloudfunctions/order-pay/index.js`
  - `cloudfunctions/payment-callback/index.js`
  - `cloudfunctions/inventory-lock/index.js`
  - `cloudfunctions/admin-content-manage/index.js`

### 第 3 步验证结果（人工验收）
- 随机抽检函数：`guest-profile-submit`、`payment-callback`、`product-query`。
- 抽检结果：3/3 均返回统一四字段，协议检查全部 PASS。
- 验证结论：第 3 步通过；在用户确认前未进入第 4 步，当前可在后续指令下继续执行第 4 步。

### 给后续开发者的提示
- 新增云函数时，优先复用 `cloudfunctions/common/response.js`，禁止在函数内手写不一致响应结构。
- 本阶段只统一了“返回协议”，尚未统一“错误码映射基线”；错误码对齐应在第 4 步完成。

### 已完成步骤
- 第 4 步：落地错误码基线（已完成并通过人工验收）。

### 第 4 步实际执行内容
- 新增统一错误码基线文件：`cloudfunctions/common/error-codes.js`。
- 将 `docs/api-spec.md` 错误码表落地为代码常量与默认消息映射，避免各函数自定义冲突码值。
- 扩展 `cloudfunctions/common/response.js`，新增 `failureByCode`，统一按错误码生成失败响应。
- 在 3 个验收场景函数中接入错误码基线：
  - `cloudfunctions/auth-verify-booking/index.js`：缺少 `bookingNo/phone` 时返回 `40001`。
  - `cloudfunctions/admin-content-manage/index.js`：非管理员场景返回 `40301`。
  - `cloudfunctions/order-create/index.js`：库存不足场景返回 `40901`。

### 第 4 步验证结果（人工验收）
- 参数错误场景：`auth-verify-booking` 传空对象，返回 `40001`，结构校验 PASS。
- 权限错误场景：`admin-content-manage` 传空对象，返回 `40301`，结构校验 PASS。
- 库存不足场景：`order-create` 传 `{ forceStockInsufficient: true }`，返回 `40901`，结构校验 PASS。
- 验证结论：第 4 步通过，可按计划进入第 5 步。

### 给后续开发者的提示
- 后续新增业务错误时，先补充 `cloudfunctions/common/error-codes.js`，再在函数里使用 `failureByCode`，不要手写散落错误码。
- 第 4 步仅落地了基线与三类场景锚点，其余错误码会在后续具体业务实现（第 5 步起）逐步接入。

### 已完成步骤
- 第 5-20 步：已连续执行实现，并完成本地脚本化验收（当前仓库阶段以人工可复现检查为主）。

### 第 5-20 步实际执行内容（后端与流程闭环）
- 预订准入：`auth-verify-booking` 接入 `bookings` 数据源校验，命中返回 `verified/userId/bookingId/storeId`，未命中返回 `40004`。
- 入住信息：新增 `store-info-get`，读取 `stores` 并返回脱敏 `wifiPasswordMasked`，门店缺失返回 `40401`。
- 客户登记：`guest-profile-submit` 完成必填校验、`guest_profiles` 写入、手机号/证件号加密存储。
- 攻略能力：`guide-query` 支持门店/分类/排序/分页，新增 `guide-detail-get` 返回详情结构。
- 商品能力：`product-query` 支持门店/分类/分页，新增 `product-detail-get` 返回详情结构。
- 下单与库存：`order-create` 完成参数校验、价格计算、库存锁定、订单生成；库存不足统一返回 `40901`。
- 支付与回调：`order-pay` 仅生成支付参数；`payment-callback` 才会将订单置为 `PAID`，保证“回调最终态”口径。
- 订单查询：新增 `order-list-query`、`order-detail-get`，支持按状态筛选及权限校验。
- 后台能力：`admin-content-manage` 支持 `guide/product` 的 create/update/setStatus/sort，非管理员返回 `40301`。
- 公共层补齐：新增 `crypto-utils`、`mappers`、`mock-db`、`stock`、`logger`、`id`，统一字段映射、敏感数据处理、库存与日志能力。

### 第 5-20 步实际执行内容（前端调用层与验收脚本）
- 新增小程序调用封装：`miniprogram/utils/request.js`、`miniprogram/utils/validate.js`。
- 新增服务层：`auth/checkin/guide/product/order` 五个 service 文件，对应云函数调用。
- 新增页面逻辑骨架：`home/checkin/guide-list/guide-detail/gift-list/gift-detail/order-confirm/order-list/profile` 的 `index.js`。
- 索引与发布验收脚本：新增 `scripts/db-indexes.js`、`scripts/verify-index-plan.js`、`scripts/verify-all-steps.js`、`scripts/release-precheck.js`。

### 第 5-20 步验证结果（代执行）
- 执行 `node scripts/verify-all-steps.js`：通过。
- 执行 `node scripts/verify-index-plan.js`：通过。
- 执行 `node scripts/release-precheck.js`：通过（包含流程 A/B/C 关键链路、支付回调口径、权限校验、敏感字段加密与索引计划检查）。
- 验证结论：按当前仓库阶段可执行条件，第 5-20 步已实现并通过脚本化验收，可进入后续微信开发者工具联调与云开发控制台复核阶段。

### 给后续开发者的提示
- 当前数据层为 `cloudfunctions/common/mock-db.js` 的本地可复现实现，后续接入真实 CloudBase 时保持 API `camelCase` 与 DB `snake_case` 显式映射不变。
- 支付终态规则不可破坏：前端支付结果仅提示，最终状态只能由 `payment-callback` 更新。
- 发布前继续执行 `node scripts/release-precheck.js`，并在微信开发者工具完成真机路径复核后再提请 owner 发布。
