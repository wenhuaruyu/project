# 开发进度记录

## 快速入口
- MVP 方案文档：`mvp.md`

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

### 环境绑定修正（2026-04-27）
- 小程序云环境映射更新：`miniprogram/constants/cloud-env.js` 中 `dev` 映射改为 `cloudbase-d6g0oscry3022da21`，`prod` 保持原映射不变。
- 云函数环境识别兼容更新：`cloudfunctions/common/env-profile.js` 新增显式环境 ID 映射（`cloudbase-d6g0oscry3022da21 -> dev`），并保留 `-dev/-prod` 后缀规则。
- 文档同步：`docs/env-layering.md` 已补充 `cloud-env.js` 配置位置与显式环境 ID 示例；`memory-bank/architecture.md` 已新增本次架构洞察。

### 本次调整后验证建议
- 微信开发者工具切换环境为 `cloudbase-d6g0oscry3022da21` 后执行“清缓存并编译”。
- 调用 `auth-verify-booking` 验证初始化链路，确认无 `501000` 环境权限异常。

### 登录口径调整（2026-04-27）
- 需求变更：小程序不再要求“预订号 + 手机号登录”，入住助手改为免登录可进入。
- `pages/home` 调整为默认加载 `store-info-get`，移除登录输入项。
- `guest-profile-submit` 调整为 `bookingId` 非必填，免登录提交场景使用 `walkin` 记录。
- 文档同步：`docs/api-spec.md`、`memory-bank/implementation-plan.md`、`mvp.md` 已更新为“身份校验可选，流程 A 免登录”。

### 登记字段收敛（2026-04-27）
- 需求变更：客人登记仅需姓名、手机号、身份证号码、身份证照片正反面，不再提交其他字段。
- 前端调整：`pages/checkin` 移除证件号/到店时间/特殊需求输入，新增身份证正反面图片选择与预览。
- 后端调整：`guest-profile-submit` 必填改为 `name/phone/idNo/idCardFrontImage/idCardBackImage`，写入字段改为 `id_no_encrypted/id_card_front_url/id_card_back_url`。
- 文档同步：`docs/api-spec.md` 与 `docs/db-schema.md` 已更新对应字段定义。

### 流程 C 页面打通（2026-04-27）
- 新增伴手礼购买链路页面交互：`gift-list`、`gift-detail`、`order-confirm`、`order-list`，支持浏览、下单、支付演示与订单筛选。
- 增强本地演示能力：`miniprogram/utils/local-mock-functions.js` 新增 `product-query/product-detail-get/order-create/order-pay/payment-callback/order-list-query/order-detail-get` 模拟实现。
- 订单服务补齐：`miniprogram/services/order.service.js` 新增 `confirmPayment`，用于支付回调演示。
- 验证结果：本地脚本 smoke test 覆盖商品查询、下单、支付参数生成、回调置已支付、订单列表筛选，全部通过。

### 流程 C 交互优化（2026-04-27）
- 伴手礼列表增加可购状态提示：售罄商品不可进入详情，价格展示统一两位小数。
- 商品详情增加库存上限约束与售罄禁购态，避免超量下单。
- 订单确认页补齐支付状态反馈：创建后禁止重复下单，支付成功后显示“已完成支付”并禁用重复支付。
- 订单列表增加激活态筛选、下单时间展示、金额格式化与“继续逛伴手礼”快捷入口。

### 订单详情页与状态时间轴（2026-04-27）
- 新增页面：`pages/order-detail`，支持从订单列表点击进入查看单个订单详情。
- 新增展示：订单基础信息、商品明细、状态流转时间轴（创建/支付/取消）。
- 交互补齐：订单列表卡片增加“点击查看订单详情”提示，形成列表到详情闭环。

### 底部导航（TabBar）补齐（2026-04-27）
- 在 `app.json` 新增底部 TabBar：`首页 / 伴手礼 / 订单 / 我的`。
- 采用桂花主题配色（`#F8F3E8` 背景、`#D9A441` 选中态），提升核心页面切换效率。
- 流程 C 常用路径从“多级返回”优化为“一跳直达”，减少重复操作。

### 我的页面可用化（2026-04-27）
- 完成 `pages/profile` 从占位页到可用页改造：展示游客信息、常用功能入口、门店联系信息。
- 新增快捷动作：去登记、去伴手礼、去订单、拨打前台电话、复制 Wi-Fi 密码。
- 与 TabBar 导航协同：`伴手礼/订单` 使用全局直达，减少页面堆栈跳转负担。

### 首页快捷动作补齐（2026-04-27）
- 在 `pages/home` 新增门店快捷动作：复制 Wi-Fi 密码、一键拨号、导航到门店。
- 对齐 PRD 入住助手能力，强化“查看信息后立即操作”的首页转化路径。
- 操作失败场景补齐提示（无电话、无定位、无 Wi-Fi 密码），降低空点击困惑。

### 订单状态中文化与空态优化（2026-04-27）
- 订单列表与订单详情统一展示中文状态文案（业务状态、支付状态），降低用户理解成本。
- 订单列表空态改为按筛选条件给出差异化提示（全部/待支付/已支付），并提供“去逛伴手礼”快捷入口。
- 订单详情补齐“无商品明细”提示，避免空白区域造成歧义。

### 订单页问题修复（2026-04-27）
- 修复“继续逛伴手礼”按钮跳转失败：Tab 页面改用 `switchTab`。
- 修复订单时间显示时区偏差：统一按本地时间格式化到“YYYY-MM-DD HH:mm”。

### 订单列表交互增强（2026-04-27）
- 新增下拉刷新能力：订单页可通过手势快速重新拉取数据。
- 状态展示升级为徽标化样式（待支付/已支付/备货中/已完成/已取消、未支付/已退款），提升扫读效率。
- 维持中文状态映射与本地时间展示的一致口径，减少客服与用户沟通歧义。

### 待支付订单补充“去支付”入口（2026-04-27）
- 在订单列表卡片中为 `PENDING_PAY` 订单新增“去支付”按钮，支持直接重新发起支付。
- 在订单详情页同步新增“去支付”按钮，避免用户只能返回列表才能完成支付。
- 支付成功后自动刷新订单数据，状态即时切换为已支付。

### 订单详情体验统一（2026-04-27）
- 订单详情页新增下拉刷新能力，支持在详情页直接手势刷新状态。
- 订单详情状态展示改为徽标化样式，与订单列表保持一致的视觉语言。
- 列表页与详情页形成统一状态表达规范，减少用户在页面切换时的认知负担。

### 订单筛选维度补齐（2026-04-27）
- 订单列表筛选从“全部/待支付/已支付”扩展为“全部/待支付/已支付/备货中/已完成/已取消”。
- 筛选区支持自动换行，避免多状态下按钮拥挤或遮挡。
- 空态文案按新增状态同步细分，减少筛选后“空列表”理解成本。

### 旅游攻略模块可用化（2026-04-27）
- 完成 `guide-list` 页面：支持分类筛选、排序（推荐/距离/热度）、关键词搜索与列表跳详情。
- 完成 `guide-detail` 页面：展示攻略内容、交通方式、建议时长、注意事项，并支持复制地址与一键导航。
- 首页补齐“去旅游攻略”入口，形成流程 B 的首页直达路径。
- 本地 mock 新增 `guide-query` / `guide-detail-get` 数据与逻辑，保障云端异常时仍可演示攻略闭环。

### 旅游攻略体验增强（2026-04-27）
- 攻略列表新增“分类/距离/热度”可视标签，提升快速扫读效率。
- 攻略列表与详情页均补齐下拉刷新能力，和订单模块保持一致交互习惯。
- 热度标签按分值分层（高热/热门/小众），便于用户快速决策。

### 旅游攻略入口与分享补齐（2026-04-27）
- 首页新增“旅游攻略”强调入口卡片，提升流程 B 触达效率。
- 攻略详情页新增“分享这条攻略”按钮，支持微信原生分享。
- 分享路径直达当前攻略详情页，便于用户在群内传播具体内容。

### TabBar 加入旅游攻略（2026-04-27）
- 全局底部 TabBar 新增“攻略”入口，形成 `首页/攻略/伴手礼/订单/我的` 五入口结构。
- 首页“去旅游攻略”跳转方式改为 `switchTab`，与 Tab 页面导航语义保持一致。

### MVP 阻塞项修复（2026-04-27）
- 修复 `guest-profile-submit` 未落库问题，恢复向 `guest_profiles` 写入加密敏感字段。
- 重新执行 `node scripts/release-precheck.js`：两阶段校验全部通过。
- 当前仓库状态下，MVP 关键发布前脚本验收已解除阻塞。
