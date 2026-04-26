# 数据模型设计（db-schema）

## 1. 设计原则

- 面向 V1：先满足入住助手、旅游攻略、伴手礼预定三大模块。
- 兼顾扩展：关键集合均预留 `store_id`，便于未来多门店。
- 安全优先：敏感信息加密/脱敏存储，最小化采集。
- 查询优先：针对高频查询场景预先建立索引。

---

## 2. 集合总览

| 集合名 | 用途 |
|---|---|
| users | 小程序用户基础信息 |
| bookings | 预订记录 |
| guest_profiles | 客户登记信息 |
| stores | 门店与入住信息 |
| guides | 旅游攻略 |
| products | 商品与文创产品 |
| orders | 订单主表 |
| order_logs | 订单操作日志 |
| events | 行为埋点事件 |

---

## 3. 字段设计明细

## 3.1 users

用途：存储小程序用户基础身份，不保存不必要明文隐私数据。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| _id | string | 是 | 文档 ID |
| openid | string | 是 | 微信用户唯一标识 |
| phone_masked | string | 否 | 脱敏手机号（如 138****1234） |
| role | string | 是 | `customer` / `admin` |
| status | string | 是 | `active` / `disabled` |
| created_at | datetime | 是 | 创建时间 |
| last_login_at | datetime | 否 | 最后登录时间 |

索引建议：
- `openid` 唯一索引。

---

## 3.2 bookings

用途：记录预订信息，用于准入校验。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| _id | string | 是 | 文档 ID |
| booking_no | string | 是 | 预订号 |
| guest_phone_hash | string | 是 | 预订手机号哈希 |
| store_id | string | 是 | 门店 ID |
| checkin_date | date | 是 | 入住日期 |
| checkout_date | date | 是 | 离店日期 |
| status | string | 是 | `booked` / `checked_in` / `completed` / `cancelled` |
| created_at | datetime | 是 | 创建时间 |

索引建议：
- `booking_no` 唯一索引。
- `guest_phone_hash + checkin_date` 联合索引。

---

## 3.3 guest_profiles

用途：存储客户登记信息（合规处理敏感字段）。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| _id | string | 是 | 文档 ID |
| booking_id | string | 是 | 对应预订 ID |
| user_id | string | 是 | 对应用户 ID |
| name | string | 是 | 入住人姓名 |
| phone_encrypted | string | 是 | 加密手机号 |
| id_no_encrypted | string | 否 | 加密证件号 |
| arrival_time | datetime | 是 | 预计到店时间 |
| special_needs | string | 否 | 特殊需求 |
| created_at | datetime | 是 | 提交时间 |

索引建议：
- `booking_id` 索引。
- `user_id + created_at` 联合索引。

---

## 3.4 stores

用途：门店基础信息与入住信息。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| _id | string | 是 | 门店 ID |
| name | string | 是 | 门店名称 |
| address | string | 是 | 详细地址 |
| lat | number | 是 | 纬度 |
| lng | number | 是 | 经度 |
| wifi_name | string | 是 | Wi-Fi 名称 |
| wifi_password_encrypted | string | 是 | 加密 Wi-Fi 密码 |
| contact_phone | string | 是 | 联系电话 |
| notice | string | 否 | 入住须知 |
| theme_config | object | 否 | 主题配置（桂花主题） |
| status | string | 是 | `active` / `inactive` |
| updated_at | datetime | 是 | 更新时间 |

索引建议：
- `status` 索引。

---

## 3.5 guides

用途：景点与游玩攻略内容。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| _id | string | 是 | 攻略 ID |
| store_id | string | 是 | 门店 ID |
| title | string | 是 | 标题 |
| category | string | 是 | 分类（spot/food/photo/night） |
| cover_url | string | 否 | 封面图 |
| distance_km | number | 否 | 距离（km） |
| duration_text | string | 否 | 建议时长 |
| traffic | object | 否 | 交通方式 |
| content | string | 是 | 攻略正文 |
| tips | string | 否 | 注意事项 |
| status | string | 是 | `draft` / `online` / `offline` |
| sort | number | 是 | 排序值，越小越靠前 |
| updated_at | datetime | 是 | 更新时间 |

索引建议：
- `store_id + status + sort` 联合索引。
- `category` 索引。

---

## 3.6 products

用途：伴手礼与文创商品。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| _id | string | 是 | 商品 ID |
| store_id | string | 是 | 门店 ID |
| name | string | 是 | 商品名 |
| category | string | 是 | 分类（souvenir/cultural/giftbox） |
| price | number | 是 | 单价（分） |
| stock | number | 是 | 库存 |
| cover_url | string | 否 | 封面图 |
| images | array | 否 | 详情图 |
| desc | string | 否 | 商品描述 |
| status | string | 是 | `draft` / `online` / `offline` |
| sales_count | number | 是 | 销量 |
| updated_at | datetime | 是 | 更新时间 |

索引建议：
- `store_id + status` 联合索引。
- `category` 索引。

---

## 3.7 orders

用途：订单主数据。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| _id | string | 是 | 订单 ID |
| order_no | string | 是 | 订单号 |
| user_id | string | 是 | 用户 ID |
| store_id | string | 是 | 门店 ID |
| items | array | 是 | 商品明细列表 |
| amount_total | number | 是 | 订单总金额（分） |
| pay_status | string | 是 | `UNPAID` / `PAID` / `REFUNDED` |
| order_status | string | 是 | `PENDING_PAY` / `PAID` / `PREPARING` / `COMPLETED` / `CANCELLED` |
| delivery_type | string | 是 | `pickup` / `delivery` |
| address | object | 否 | 配送地址（配送必填） |
| remark | string | 否 | 买家备注 |
| expire_at | datetime | 否 | 支付超时截止时间 |
| paid_at | datetime | 否 | 支付时间 |
| created_at | datetime | 是 | 下单时间 |

`items` 元素建议结构：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| product_id | string | 是 | 商品 ID |
| sku_id | string | 否 | 规格 ID |
| product_name | string | 是 | 快照名称 |
| price | number | 是 | 下单单价快照（分） |
| quantity | number | 是 | 数量 |
| amount_subtotal | number | 是 | 小计（分） |

索引建议：
- `order_no` 唯一索引。
- `user_id + created_at` 联合索引。
- `store_id + order_status + created_at` 联合索引。

---

## 3.8 order_logs

用途：记录订单生命周期与操作审计。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| _id | string | 是 | 日志 ID |
| order_id | string | 是 | 订单 ID |
| action | string | 是 | 操作动作（create/pay/prepare/complete/cancel/refund） |
| operator | string | 是 | 操作者（system/admin/user） |
| remark | string | 否 | 备注 |
| created_at | datetime | 是 | 操作时间 |

索引建议：
- `order_id + created_at` 联合索引。

---

## 3.9 events

用途：用户行为埋点与转化分析。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| _id | string | 是 | 事件 ID |
| event_name | string | 是 | 事件名 |
| user_id | string | 否 | 用户 ID |
| store_id | string | 否 | 门店 ID |
| meta | object | 否 | 扩展属性 |
| created_at | datetime | 是 | 事件时间 |

索引建议：
- `event_name + created_at` 联合索引。
- `user_id + created_at` 联合索引。

---

## 4. 安全与合规要求

- 不保存不必要的敏感明文数据（手机号、证件号、Wi-Fi 密码）。
- 敏感字段采用加密存储，返回前进行脱敏处理。
- 数据访问采用最小权限原则：
  - 用户仅可访问本人相关数据。
  - 管理员可访问运营相关数据。
- 关键操作（订单、支付、库存）必须记录日志，支持审计与追踪。

---

## 5. 未来扩展建议

- 多门店：沿用 `store_id` 即可扩展。
- 活动营销：新增 `coupons`、`campaigns` 集合。
- 推荐能力：新增 `recommendation_snapshots` 存储推荐结果快照。
- 数据分析：将高频埋点离线归档到数据仓库（后续阶段）。
