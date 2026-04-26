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
