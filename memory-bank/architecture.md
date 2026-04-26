# 架构记录与文件职责

## 当前阶段架构洞察（里程碑：第 1 步）
- 项目处于“骨架先行”阶段：先固定目录边界，再逐步填充实现。
- 目录边界已按前后端分离建立：`miniprogram/` 承载小程序端，`cloudfunctions/` 承载 BFF 与业务规则。
- 云函数采用“单函数单职责”的目录拆分，和实施计划后续步骤一一对应，便于分步开发与回归验证。
- 当前通过 `.gitkeep` 保持空目录可追踪，降低多人/多会话协作时目录漂移风险。

## 当前阶段架构洞察（里程碑：第 2 步）
- 环境分层已从“文档建议”升级为“代码与文档双落地”：前端、云函数各有唯一环境映射入口。
- V1 环境口径固定为 `dev` / `prod`，并通过显式抛错阻断未定义环境，避免灰度值被误用到业务分支。
- 小程序侧采用“平台值归并”策略：微信 `develop`、`trial` 归并到业务 `dev`，`release` 映射到 `prod`。
- 云函数侧采用“环境 ID 后缀约束”策略：仅接受 `-dev` 与 `-prod` 后缀，降低多人协作时环境命名漂移风险。

## 文件作用说明
- `memory-bank/prd.md`：产品目标、用户流程与 V1 范围边界的来源文档。
- `memory-bank/tech-stack.md`：技术选型、部署方式与项目运行上下文说明。
- `memory-bank/implementation-plan.md`：面向 AI 开发者的分步执行与每步验收口径。
- `memory-bank/progress.md`：开发进度与每步完成证据记录，作为发布判定输入之一。
- `memory-bank/architecture.md`：持续维护的架构决策日志，记录模块边界、文件职责和阶段性架构结论。
- `docs/architecture.md`：系统级架构总览（模块划分、目录建议、规范要求），作为实施边界参考。
- `docs/api-spec.md`：云函数接口契约与统一响应结构来源（`code`、`message`、`data`、`requestId`）。
- `docs/db-schema.md`：数据库集合、字段、索引及安全约束来源。
- `docs/env-layering.md`：第 2 步新增的环境分层单一事实来源，定义 `dev` / `prod` 映射与约束。

## 代码目录作用说明
- `miniprogram/`：小程序前端主工程目录。
- `miniprogram/pages/`：业务页面目录，按用户路径拆分页面。
- `miniprogram/components/`：可复用 UI 组件目录。
- `miniprogram/services/`：云函数调用与接口封装层。
- `miniprogram/utils/`：通用工具能力（校验、格式化、请求辅助）。
- `miniprogram/constants/`：业务常量与枚举定义。
- `miniprogram/constants/env-profile.js`：小程序环境归并入口（`develop/trial/release` -> `dev/prod`）。
- `miniprogram/styles/`：全局与主题样式资源。
- `cloudfunctions/`：云函数集合目录。
- `cloudfunctions/common/env-profile.js`：云函数环境识别入口（CloudBase 环境 ID 后缀 -> `dev/prod`）。
- `cloudfunctions/auth-verify-booking/`：预订身份校验入口。
- `cloudfunctions/guest-profile-submit/`：客户登记数据写入与敏感字段处理。
- `cloudfunctions/guide-query/`：攻略列表查询。
- `cloudfunctions/product-query/`：商品列表查询。
- `cloudfunctions/order-create/`：订单创建与价格/库存校验入口。
- `cloudfunctions/order-pay/`：支付发起参数生成。
- `cloudfunctions/payment-callback/`：支付回调处理与最终支付状态确认。
- `cloudfunctions/inventory-lock/`：库存锁定与回滚能力。
- `cloudfunctions/admin-content-manage/`：后台内容管理能力（云函数侧）。
- `scripts/`：初始化数据与辅助脚本目录（当前预留，后续按步骤补齐）。

## 后续维护要求
- 每完成一个重大步骤或里程碑，必须同步更新本文件。
- 当目录结构、函数命名、数据边界变更时，先更新本文件再推进实现。
