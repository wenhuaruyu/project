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

## 当前阶段架构洞察（里程碑：第 3 步）
- 接口协议已从“文档约定”升级为“可复用代码约束”：云函数统一通过公共响应构建器输出。
- 云函数响应边界被明确固定为四字段：`code`、`message`、`data`、`requestId`，降低前端适配分支复杂度。
- `requestId` 策略采用“上下文优先 + 本地兜底”双通道，保证联调、日志追踪、离线调用场景均可获得追踪 ID。
- 第 3 步只解决协议一致性，不引入错误码映射规则，错误码治理仍由第 4 步统一落地。

## 当前阶段架构洞察（里程碑：第 4 步）
- 错误码治理已从“文档约定”升级为“代码单一事实来源”：基线收敛到 `cloudfunctions/common/error-codes.js`。
- 响应层形成“成功/失败”双入口：成功走 `success`，失败统一走 `failureByCode`，减少业务函数分散拼装响应。
- 错误码与错误文案建立稳定映射关系，保障同类错误在不同云函数中返回一致语义。
- 第 4 步仅落地基线和验收锚点函数，后续步骤在实现具体业务逻辑时按同一机制持续接入。

## 当前阶段架构洞察（里程碑：第 5-20 步）
- 当前实现已形成“可联调的 BFF 闭环”：认证、入住、攻略、商品、下单、支付回调、订单查询、后台管理已贯通。
- 数据约束按边界执行：API 出口统一 `camelCase`，内部数据模型使用 `snake_case`，通过 mapper 层显式转换。
- 安全策略前移到公共层：敏感字段加密、日志脱敏、支付终态约束、权限拦截不再依赖页面层兜底。
- 验收方式升级为“脚本化可重复检查”：流程 A/B/C、错误码口径、索引计划与发布前检查可以一键复跑。
- 数据访问当前采用 `mock-db` 保持仓库自包含；后续替换为 CloudBase 时，函数签名与响应协议无需改动。

## 当前阶段架构洞察（里程碑：环境绑定修正）
- 小程序侧环境分层从“仅业务环境映射”补齐为“双映射”：`envVersion -> appEnv` 与 `appEnv -> cloudEnvId` 分层清晰。
- 云函数侧环境识别从“后缀约束”升级为“显式 ID + 后缀兜底”并存，兼容历史命名与 CloudBase 默认环境 ID。
- `dev` 实际绑定到 `cloudbase-d6g0oscry3022da21`，`prod` 仍保留独立映射，避免把生产流量误导入开发环境。

## 当前阶段架构洞察（里程碑：免登录改造）
- 入住助手链路调整为“免预订号/免手机号登录”模式：首页直接拉取门店信息，身份校验从强前置改为可选能力。
- 客户登记提交放宽为非预订必填：`guest-profile-submit` 不再强依赖 `bookingId`，免登录场景以 `walkin` 占位归档。
- 保持向后兼容：`auth-verify-booking` 仍支持预订号+手机号联合校验，用于后续需要实名准入的门店配置。

## 当前阶段架构洞察（里程碑：登记字段收敛）
- 登记表单收敛为最小必填集合：姓名、手机号、身份证号码、身份证正反面图片；移除到店时间、特殊需求字段。
- 云函数 `guest-profile-submit` 入参同步收敛，后端写入改为 `id_no_encrypted`、`id_card_front_url`、`id_card_back_url`，减少非必要个人信息采集。
- 前端登记页改为图片采集流程，降低用户输入复杂度并提升证件信息提交准确性。

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

## 新增文件作用说明（第 5-20 步）
- `cloudfunctions/common/crypto-utils.js`：提供哈希、加密/解密、手机号与敏感串脱敏能力。
- `cloudfunctions/common/id.js`：提供统一 ID 生成能力。
- `cloudfunctions/common/logger.js`：关键写操作日志记录与敏感字段脱敏。
- `cloudfunctions/common/mock-db.js`：本地可复现数据层，模拟 `bookings/stores/guides/products/orders` 等集合。
- `cloudfunctions/common/stock.js`：库存锁定与回滚公共逻辑。
- `cloudfunctions/common/mappers.js`：`snake_case -> camelCase` 的接口响应映射层。
- `cloudfunctions/store-info-get/index.js`：门店入住信息查询与 Wi-Fi 脱敏返回。
- `cloudfunctions/guide-detail-get/index.js`：攻略详情查询。
- `cloudfunctions/product-detail-get/index.js`：商品详情查询。
- `cloudfunctions/order-list-query/index.js`：订单列表查询（按用户、状态、分页）。
- `cloudfunctions/order-detail-get/index.js`：订单详情查询与权限拦截。
- `miniprogram/utils/request.js`：前端云函数调用与统一错误抛出。
- `miniprogram/utils/validate.js`：前端基础校验工具。
- `miniprogram/constants/enums.js`：订单/支付状态枚举常量。
- `miniprogram/services/auth.service.js`：认证域调用封装。
- `miniprogram/services/checkin.service.js`：入住域调用封装。
- `miniprogram/services/guide.service.js`：攻略域调用封装。
- `miniprogram/services/product.service.js`：商品域调用封装。
- `miniprogram/services/order.service.js`：订单/支付域调用封装。
- `miniprogram/pages/home/index.js`：流程 A 的“校验并拉取入住信息”页面逻辑骨架。
- `miniprogram/pages/checkin/index.js`：流程 A 的登记提交页面逻辑骨架。
- `miniprogram/pages/guide-list/index.js`：流程 B 的攻略列表页逻辑骨架。
- `miniprogram/pages/guide-detail/index.js`：流程 B 的攻略详情页逻辑骨架。
- `miniprogram/pages/gift-list/index.js`：流程 C 的商品列表页逻辑骨架。
- `miniprogram/pages/gift-detail/index.js`：流程 C 的商品详情页逻辑骨架。
- `miniprogram/pages/order-confirm/index.js`：流程 C 的下单与发起支付页逻辑骨架。
- `miniprogram/pages/order-list/index.js`：流程 C 的订单列表查询页逻辑骨架。
- `miniprogram/pages/profile/index.js`：个人页占位逻辑。
- `scripts/db-indexes.js`：高频集合索引计划定义（bookings/guides/orders）。
- `scripts/verify-index-plan.js`：索引计划校验脚本。
- `scripts/verify-all-steps.js`：覆盖步骤 5-17 关键路径与口径的自动校验脚本。
- `scripts/release-precheck.js`：发布前一键验收入口，串联全量校验。

## 代码目录作用说明
- `miniprogram/`：小程序前端主工程目录。
- `miniprogram/pages/`：业务页面目录，按用户路径拆分页面。
- `miniprogram/components/`：可复用 UI 组件目录。
- `miniprogram/services/`：云函数调用与接口封装层。
- `miniprogram/utils/`：通用工具能力（校验、格式化、请求辅助）。
- `miniprogram/constants/`：业务常量与枚举定义。
- `miniprogram/constants/env-profile.js`：小程序环境归并入口（`develop/trial/release` -> `dev/prod`）。
- `miniprogram/constants/cloud-env.js`：小程序云环境 ID 映射入口（`appEnv` -> CloudBase `env`）。
- `miniprogram/styles/`：全局与主题样式资源。
- `cloudfunctions/`：云函数集合目录。
- `cloudfunctions/common/env-profile.js`：云函数环境识别入口（显式环境 ID 映射 + CloudBase 环境 ID 后缀 -> `dev/prod`）。
- `cloudfunctions/common/error-codes.js`：云函数统一错误码基线与默认错误文案映射。
- `cloudfunctions/common/response.js`：云函数统一响应构建器，固定输出 `code`、`message`、`data`、`requestId`。
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

## 第 3 步新增文件作用说明
- `cloudfunctions/common/response.js`：提供 `success` / `failure` 两个统一出口，封装 `requestId` 解析与兜底生成。
- `cloudfunctions/auth-verify-booking/index.js`：预订校验云函数入口，当前负责按统一协议返回占位结构。
- `cloudfunctions/guest-profile-submit/index.js`：客户登记提交云函数入口，当前负责按统一协议返回占位结构。
- `cloudfunctions/guide-query/index.js`：攻略列表查询云函数入口，当前负责按统一协议返回分页占位结构。
- `cloudfunctions/product-query/index.js`：商品列表查询云函数入口，当前负责按统一协议返回分页占位结构。
- `cloudfunctions/order-create/index.js`：订单创建云函数入口，当前负责按统一协议返回订单占位结构。
- `cloudfunctions/order-pay/index.js`：支付发起云函数入口，当前负责按统一协议返回支付参数占位结构。
- `cloudfunctions/payment-callback/index.js`：支付回调云函数入口，当前负责按统一协议返回回调处理占位结构。
- `cloudfunctions/inventory-lock/index.js`：库存锁定云函数入口，当前负责按统一协议返回锁定占位结构。
- `cloudfunctions/admin-content-manage/index.js`：后台内容管理云函数入口，当前负责按统一协议返回操作占位结构。

## 第 4 步新增/更新文件作用说明
- `cloudfunctions/common/error-codes.js`：维护 V1 错误码常量、默认消息、按 `code` 取文案的方法，作为错误码唯一来源。
- `cloudfunctions/common/response.js`：新增 `failureByCode` 出口，让业务按错误码返回失败响应并复用默认文案。
- `cloudfunctions/auth-verify-booking/index.js`：新增参数缺失校验，作为 `40001` 基线落地点。
- `cloudfunctions/admin-content-manage/index.js`：新增管理员判断锚点，作为 `40301` 基线落地点。
- `cloudfunctions/order-create/index.js`：新增库存不足锚点，作为 `40901` 基线落地点。

## 后续维护要求
- 每完成一个重大步骤或里程碑，必须同步更新本文件。
- 当目录结构、函数命名、数据边界变更时，先更新本文件再推进实现。
