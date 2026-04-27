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

## 当前阶段架构洞察（里程碑：流程 C 本地闭环）
- 伴手礼模块页面层已形成可演示闭环：列表 -> 详情 -> 下单 -> 支付回调演示 -> 订单列表。
- 在云函数不可用阶段引入 `local-mock-functions` 作为前端调用兜底，保障核心业务体验不被云端依赖阻塞。
- 支付口径在本地演示层仍保持一致：`order-pay` 只返回参数，`payment-callback` 才将订单置为已支付。

## 当前阶段架构洞察（里程碑：流程 C 可用性增强）
- 页面层新增“防误操作”机制：库存上限控制、售罄禁购、重复下单/重复支付禁用，减少错误路径。
- 展示层新增统一格式化策略：金额固定两位小数、订单时间标准化，提升状态可读性和客服排障效率。
- 导航链路补齐反向入口：订单页可回流到商品页，形成“购买-查看-继续购买”的循环路径。

## 当前阶段架构洞察（里程碑：订单详情闭环）
- 新增订单详情页承接列表点击，补齐“列表 -> 详情 -> 回查状态”的查看链路。
- 订单详情以“基础信息 + 时间轴 + 商品明细”三段结构展示，突出状态演进可解释性。
- 页面状态与 mock 数据口径对齐，确保本地演示与后续云端实现可平滑迁移。

## 当前阶段架构洞察（里程碑：全局导航补齐）
- 小程序入口从“页面内跳转为主”升级为“TabBar 全局直达”，核心模块切换成本显著降低。
- TabBar 信息架构固定为 `首页 / 伴手礼 / 订单 / 我的`，与 V1 主流程 A/C 及个人入口对齐。
- 导航样式沿用桂花主题色板，保证跨页面视觉一致性与识别稳定性。

## 当前阶段架构洞察（里程碑：个人页可用化）
- 个人页从纯文案占位升级为“信息聚合页”，承担高频动作分发（登记、下单、查单、联系前台）。
- 页面在数据层复用 `store-info-get`，避免新增接口并保持门店信息来源一致。
- 导航策略按页面类型拆分：Tab 页面走 `switchTab`，业务流程页走 `navigateTo`，降低跳转语义混用风险。

## 当前阶段架构洞察（里程碑：首页操作直达）
- 首页门店信息区从“纯展示”升级为“展示 + 快捷操作”，把复制密码、拨号、导航前置到同一交互块。
- 小程序能力调用统一封装在页面层（`setClipboardData` / `makePhoneCall` / `openLocation`），接口层保持纯数据职责。
- 对设备能力与数据缺失做前置判断并 toast 提示，避免调用失败直接暴露系统报错。

## 当前阶段架构洞察（里程碑：订单信息可读性增强）
- 状态展示从“原始枚举值直出”升级为“页面层语义映射”，统一把 `ORDER_STATUS/PAY_STATUS` 转换为中文文案。
- 空态策略由单一文案升级为“筛选上下文感知”，不同筛选条件返回不同提示语并附带可执行入口。
- 详情页补齐无明细兜底区块，确保数据异常或边界数据下页面结构仍完整可解释。

## 当前阶段架构洞察（里程碑：订单列表操作效率优化）
- 订单列表引入 `enablePullDownRefresh`，使“刷新数据”从按钮操作扩展为系统级手势能力。
- 状态信息采用“枚举 -> 文案 -> 视觉类名”三段映射，保证业务语义、展示文案、样式表达解耦。
- 视觉层使用统一状态徽标规范（warn/success/info/done/muted），为后续其他列表页复用提供模板。

## 当前阶段架构洞察（里程碑：待支付订单可回流支付）
- 支付动作从“仅下单页可发起”升级为“列表页 + 详情页均可发起”，补齐待支付订单的二次支付路径。
- 页面层复用 `order-pay + payment-callback` 组合，不新增接口，保证支付口径与既有流程一致。
- 支付完成后在当前页面就地刷新订单数据，降低用户来回跳转成本。

## 当前阶段架构洞察（里程碑：订单详情与列表一致性）
- 订单详情页引入 `enablePullDownRefresh`，与订单列表形成一致的“手势刷新”交互能力。
- 状态视觉策略统一为“文案 + 徽标色”，并复用相同的状态分类语义（warn/success/info/done/muted）。
- 详情页与列表页在状态表达层保持同构，便于后续抽离共享映射与样式令牌。

## 当前阶段架构洞察（里程碑：订单筛选完整性）
- 订单列表筛选维度补齐到全状态集合，覆盖从待支付到完成/取消的完整生命周期。
- 筛选布局升级为可换行容器，提升小屏设备上的可点击性与可读性。
- 空态提示与筛选状态保持一一对应，形成“筛选语义 -> 结果反馈”的闭环。

## 当前阶段架构洞察（里程碑：流程 B 攻略闭环）
- 旅游攻略从骨架页升级为可用闭环：`guide-list -> guide-detail -> 复制地址/一键导航`。
- 列表页采用“服务端筛选排序 + 页面内关键词过滤”组合策略，在不扩展接口契约的前提下满足搜索体验。
- 本地演示层补齐 `guide-query` 与 `guide-detail-get`，与商品/订单模块保持同一降级策略。
- 首页新增攻略入口后，A/B/C 三条主流程均可从首页单跳触达。

## 当前阶段架构洞察（里程碑：攻略交互一致性）
- 攻略模块引入可视标签层（分类/距离/热度），把原始字段转换为可快速识别的 UI 语义。
- 列表页和详情页统一支持 `enablePullDownRefresh`，形成跨模块一致的刷新交互基线。
- 热度展示采用“分值 -> 档位文案 -> 色彩标签”三段映射，后续可复用到商品推荐等场景。

## 当前阶段架构洞察（里程碑：攻略触达与传播）
- 首页对流程 B 入口做视觉前置，从普通按钮升级为强调卡片，降低用户发现成本。
- 攻略详情接入小程序原生分享能力，通过 `onShareAppMessage` 输出可直达的详情路径。
- 形成“首页触达 -> 详情阅读 -> 一键分享”的轻量传播链路。

## 当前阶段架构洞察（里程碑：流程 B 全局直达）
- TabBar 由四入口扩展为五入口，新增“攻略”并把流程 B 纳入全局一级导航。
- 页面跳转策略保持一致：跳转到 Tab 页面统一使用 `switchTab`，避免 `navigateTo` 失效。
- 当前一级信息架构固定为 `首页/攻略/伴手礼/订单/我的`，A/B/C 三流程均具备全局直达入口。

## 当前阶段架构洞察（里程碑：MVP 验收阻塞解除）
- `guest-profile-submit` 回归公共层能力：统一响应、错误码、加密工具与 mock DB 落库策略重新对齐。
- 客户登记数据写入恢复为 `snake_case` 持久化字段，接口出口继续保持 `camelCase` 响应。
- 发布前脚本（核心流程 + 索引计划）复跑通过，当前版本具备提审前置条件。

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
