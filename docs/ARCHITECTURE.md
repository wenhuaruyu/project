# 民宿微信小程序系统架构设计（ARCHITECTURE）

## 1. 技术栈选择及原因

### 1.1 推荐技术栈（个人项目 / 0 基础友好）
- 客户端：微信小程序原生（WXML + WXSS + JavaScript）
- 后端：微信云开发 CloudBase（云函数）
- 数据库：云开发数据库（NoSQL）
- 文件存储：云存储（图片、素材）
- 支付：微信支付
- 地图与导航：腾讯位置服务
- 消息触达：微信订阅消息
- 监控与运维：云开发日志、监控告警

### 1.2 选择原因
- 学习曲线低：不需要自建服务器与复杂运维，适合个人独立开发。
- 稳定性高：依赖微信生态基础设施，适合面向真实客户使用。
- 部署简单：前端发布与云函数部署路径清晰，可快速迭代。
- 安全成本更可控：身份体系、权限模型、HTTPS 与支付能力完善。
- 可扩展性好：后续可逐步拆分为独立后端（如 Node.js / NestJS），前端基本不重构。

### 1.3 部署环境建议
- `dev`：开发联调环境。
- `prod`：生产发布环境。
- 说明：初期先两套环境，降低维护复杂度；后续可补 `test`。

---

## 2. 项目目录结构

```text
guihua-home/
├─ miniprogram/                         # 小程序前端工程
│  ├─ app.js
│  ├─ app.json
│  ├─ app.wxss
│  ├─ pages/
│  │  ├─ home/                          # 入住助手首页
│  │  ├─ checkin/                       # 客户登记
│  │  ├─ guide-list/                    # 攻略列表
│  │  ├─ guide-detail/                  # 攻略详情
│  │  ├─ gift-list/                     # 商品列表
│  │  ├─ gift-detail/                   # 商品详情
│  │  ├─ order-confirm/                 # 订单确认
│  │  ├─ order-list/                    # 我的订单
│  │  └─ profile/                       # 我的
│  ├─ components/                       # 复用组件
│  │  ├─ info-card/
│  │  ├─ product-card/
│  │  └─ empty-state/
│  ├─ services/                         # API 调用封装
│  │  ├─ auth.service.js
│  │  ├─ checkin.service.js
│  │  ├─ guide.service.js
│  │  ├─ product.service.js
│  │  └─ order.service.js
│  ├─ utils/                            # 工具方法
│  │  ├─ request.js
│  │  ├─ validate.js
│  │  └─ format.js
│  ├─ constants/                        # 常量配置
│  │  ├─ enums.js
│  │  └─ theme.js
│  └─ styles/
│     └─ theme.wxss
│
├─ cloudfunctions/                      # 云函数（核心业务逻辑）
│  ├─ auth-verify-booking/
│  ├─ guest-profile-submit/
│  ├─ guide-query/
│  ├─ product-query/
│  ├─ order-create/
│  ├─ order-pay/
│  ├─ payment-callback/
│  ├─ inventory-lock/
│  └─ admin-content-manage/
│
├─ docs/
│  ├─ PRD.md
│  ├─ ARCHITECTURE.md
│  ├─ api-spec.md
│  └─ db-schema.md
│
├─ scripts/                             # 初始化与导入脚本
└─ README.md
```

说明：当前 `PRD.md` 与 `ARCHITECTURE.md` 放在项目根目录也可；后续建议统一迁移到 `docs/`，保证文档集中管理。

---

## 3. 核心模块说明

### 3.1 客户端模块（miniprogram）

1) 入住助手模块
- 展示：Wi-Fi、地址、联系方式、入住须知。
- 动作：一键复制密码、一键导航、一键拨号。
- 目标：让用户在 3 步内获得关键信息。

2) 客户登记模块
- 表单字段：姓名、手机号、证件信息（按合规配置）、预计到店时间、特殊需求。
- 校验：必填校验、格式校验、到店时间合法性。
- 提交：通过云函数写入，前端不直写敏感数据。

3) 旅游攻略模块
- 能力：列表、搜索、分类筛选、详情、导航。
- 体验：分页加载 + 本地缓存热门内容。

4) 伴手礼商城模块
- 能力：商品浏览、规格选择、下单、支付、订单追踪。
- 关键：库存锁定、支付回调、异常订单回滚。

5) 我的模块
- 能力：查看登记信息、订单列表、联系客服。

### 3.2 云函数模块（BFF 层）
- `auth-verify-booking`：校验预订身份与小程序访问资格。
- `guest-profile-submit`：写入客户登记信息并处理脱敏与校验。
- `guide-query` / `product-query`：查询攻略与商品，支持筛选分页。
- `order-create`：创建订单、校验价格、锁定库存。
- `order-pay`：发起支付参数。
- `payment-callback`：支付结果回调，更新订单与库存状态。
- `inventory-lock`：统一库存扣减/回滚逻辑，避免超卖。
- `admin-content-manage`：运营端管理攻略与商品上下架。

### 3.3 数据层与存储模块
- 云数据库：结构化业务数据。
- 云存储：图片与素材。
- 埋点日志：用户行为与错误追踪。

---

## 4. 数据模型设计

> 说明：以下为 V1 推荐集合（表）与关键字段。

### 4.1 users（用户基础信息）
- 字段：`_id`, `openid`, `phone_masked`, `status`, `created_at`, `last_login_at`
- 说明：仅存必要信息，敏感字段不存明文。

### 4.2 bookings（预订信息）
- 字段：`_id`, `booking_no`, `guest_phone_hash`, `store_id`, `checkin_date`, `checkout_date`, `status`
- 索引：`booking_no` 唯一索引；`guest_phone_hash + checkin_date` 联合索引。

### 4.3 guest_profiles（客户登记）
- 字段：`_id`, `booking_id`, `name`, `phone_encrypted`, `id_no_encrypted`, `arrival_time`, `special_needs`, `created_at`
- 说明：手机号、证件号加密存储，按权限读取。

### 4.4 stores（门店信息）
- 字段：`_id`, `name`, `address`, `lat`, `lng`, `wifi_name`, `wifi_password_encrypted`, `contact_phone`, `notice`, `theme_config`
- 说明：预留 `theme_config` 支持桂花主题与后续多主题扩展。

### 4.5 guides（攻略内容）
- 字段：`_id`, `store_id`, `title`, `category`, `cover_url`, `distance_km`, `duration_text`, `traffic`, `content`, `status`, `sort`, `updated_at`
- 索引：`store_id + status + sort`。

### 4.6 products（商品信息）
- 字段：`_id`, `store_id`, `name`, `category`, `price`, `stock`, `cover_url`, `images`, `desc`, `status`, `sales_count`
- 索引：`store_id + status`，`category`。

### 4.7 orders（订单主表）
- 字段：`_id`, `order_no`, `user_id`, `store_id`, `items`, `amount_total`, `pay_status`, `order_status`, `delivery_type`, `address`, `created_at`, `paid_at`
- 索引：`order_no` 唯一索引；`user_id + created_at` 联合索引。

### 4.8 order_logs（订单日志）
- 字段：`_id`, `order_id`, `action`, `operator`, `remark`, `created_at`
- 说明：用于审计、排错、售后追踪。

### 4.9 events（行为埋点）
- 字段：`_id`, `event_name`, `user_id`, `meta`, `created_at`
- 说明：支撑活跃分析、转化漏斗、性能优化。

---

## 5. 代码规范建议

### 5.1 命名规范
- 目录与页面：`kebab-case`（如 `guide-detail`）。
- 变量与函数：`camelCase`。
- 常量：`UPPER_SNAKE_CASE`。
- 云函数：`业务-动作`（如 `order-create`）。

### 5.2 接口规范
- 所有云函数统一返回：
  - `code`：0 成功，非 0 失败。
  - `message`：错误或提示信息。
  - `data`：业务数据。
  - `requestId`：用于日志追踪。
- 不在前端做价格、库存、权限等关键判断。

### 5.3 安全规范
- 敏感数据（手机号、证件号、Wi-Fi 密码）加密或脱敏存储。
- 数据库权限默认拒绝，按角色开放最小权限。
- 支付结果仅以 `payment-callback` 回调确认为准。
- 日志与埋点禁止输出完整敏感信息。

### 5.4 质量规范
- 统一使用 `ESLint + Prettier`。
- 每个云函数保持单一职责，避免“巨型函数”。
- 公共能力（校验、格式化、请求）抽取到 `utils/`。
- 每次新增接口同步更新 `api-spec.md`。

### 5.5 Git 与发布规范
- 分支建议：`main`（生产）+ `dev`（开发）。
- 提交信息建议：`feat:`、`fix:`、`docs:`、`refactor:` 前缀。
- 发布前检查：
  1. 关键流程可用（登录、登记、下单、支付）。
  2. 核心页面无明显性能问题（首屏与列表加载）。
  3. 权限与敏感数据检查通过。

---

## 6. 可扩展性设计要点

- 多门店扩展：所有核心数据均保留 `store_id`。
- 功能解耦：入住、攻略、商城、支付、库存模块相互独立。
- 后端可迁移：云函数职责明确，后续可平滑迁移到独立服务。
- 运营可配置：门店信息、攻略、商品与推荐位全部后台可配置。
