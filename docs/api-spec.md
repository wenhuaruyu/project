# API 规范（api-spec）

## 1. 文档说明

- 适用范围：`Guihua Home` 微信小程序 V1。
- 接口形式：微信云开发云函数（`wx.cloud.callFunction`）。
- 鉴权方式：小程序登录态 + 业务校验（预订手机号/订单号）。
- 返回结构统一：

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "requestId": "req_xxx"
}
```

说明：`code=0` 表示成功，非 0 表示失败。

---

## 2. 错误码约定

| code | 含义 | 处理建议 |
|---|---|---|
| 0 | 成功 | 正常展示 |
| 40001 | 参数错误 | 前端提示用户检查输入 |
| 40003 | 未登录或登录态失效 | 引导重新登录 |
| 40004 | 预订校验失败 | 提示核对订单号/手机号 |
| 40301 | 无权限访问 | 提示无访问权限 |
| 40401 | 数据不存在 | 展示空状态 |
| 40901 | 库存不足 | 提示修改购买数量 |
| 40902 | 订单状态冲突 | 刷新订单状态 |
| 42901 | 请求过于频繁 | 稍后重试 |
| 50001 | 服务器内部错误 | 提示稍后再试并记录日志 |
| 50002 | 支付服务异常 | 提示支付失败，允许重试 |

---

## 3. 通用调用格式

```js
wx.cloud.callFunction({
  name: "cloud-function-name",
  data: {
    // request payload
  }
})
```

---

## 4. 接口清单

## 4.1 认证与准入

### 4.1.1 校验预订身份
- 云函数：`auth-verify-booking`
- 用途：校验用户是否为已预订客户并建立业务访问权限。

请求参数：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| bookingNo | string | 是 | 预订号 |
| phone | string | 是 | 预订手机号 |

成功返回 `data`：

| 字段 | 类型 | 说明 |
|---|---|---|
| verified | boolean | 是否通过校验 |
| userId | string | 用户 ID |
| bookingId | string | 预订记录 ID |
| storeId | string | 门店 ID |

---

## 4.2 入住信息与客户登记

### 4.2.1 获取门店入住信息
- 云函数：`store-info-get`
- 用途：获取 Wi-Fi、地址、联系方式、入住须知。

请求参数：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| storeId | string | 是 | 门店 ID |

成功返回 `data`：

| 字段 | 类型 | 说明 |
|---|---|---|
| storeId | string | 门店 ID |
| name | string | 门店名 |
| address | string | 地址 |
| lat | number | 纬度 |
| lng | number | 经度 |
| wifiName | string | Wi-Fi 名称 |
| wifiPasswordMasked | string | 脱敏密码 |
| contactPhone | string | 联系电话 |
| notice | string | 入住须知 |

### 4.2.2 提交客户登记
- 云函数：`guest-profile-submit`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| bookingId | string | 是 | 预订记录 ID |
| name | string | 是 | 入住人姓名 |
| phone | string | 是 | 手机号 |
| idNo | string | 否 | 证件号（按配置） |
| arrivalTime | string | 是 | 预计到店时间（ISO） |
| specialNeeds | string | 否 | 特殊需求 |

成功返回 `data`：

| 字段 | 类型 | 说明 |
|---|---|---|
| profileId | string | 登记记录 ID |
| submittedAt | string | 提交时间 |

---

## 4.3 旅游攻略

### 4.3.1 攻略列表查询
- 云函数：`guide-query`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| storeId | string | 是 | 门店 ID |
| category | string | 否 | 分类（spot/food/photo/night 等） |
| sortBy | string | 否 | 排序（distance/popular） |
| pageNo | number | 是 | 页码，从 1 开始 |
| pageSize | number | 是 | 每页条数，建议 <= 20 |

成功返回 `data`：

| 字段 | 类型 | 说明 |
|---|---|---|
| list | array | 攻略列表 |
| total | number | 总条数 |
| pageNo | number | 当前页 |
| pageSize | number | 每页条数 |

### 4.3.2 攻略详情
- 云函数：`guide-detail-get`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| guideId | string | 是 | 攻略 ID |

成功返回 `data`：

| 字段 | 类型 | 说明 |
|---|---|---|
| guideId | string | 攻略 ID |
| title | string | 标题 |
| category | string | 分类 |
| content | string | 详情内容 |
| traffic | object | 交通信息 |
| durationText | string | 建议时长 |
| tips | string | 注意事项 |

---

## 4.4 商品与订单

### 4.4.1 商品列表查询
- 云函数：`product-query`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| storeId | string | 是 | 门店 ID |
| category | string | 否 | 商品分类 |
| pageNo | number | 是 | 页码 |
| pageSize | number | 是 | 每页条数 |

### 4.4.2 商品详情
- 云函数：`product-detail-get`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| productId | string | 是 | 商品 ID |

### 4.4.3 创建订单
- 云函数：`order-create`
- 说明：服务端校验价格和库存，前端提交仅作意图。

请求参数：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| storeId | string | 是 | 门店 ID |
| items | array | 是 | 商品列表 |
| deliveryType | string | 是 | `pickup` / `delivery` |
| address | object | 否 | 配送地址（配送必填） |
| remark | string | 否 | 买家备注 |

`items` 元素：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| productId | string | 是 | 商品 ID |
| skuId | string | 否 | 规格 ID |
| quantity | number | 是 | 购买数量 |

成功返回 `data`：

| 字段 | 类型 | 说明 |
|---|---|---|
| orderId | string | 订单 ID |
| orderNo | string | 订单号 |
| amountTotal | number | 应付金额 |
| expiredAt | string | 订单过期时间 |

### 4.4.4 发起支付
- 云函数：`order-pay`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| orderId | string | 是 | 订单 ID |

成功返回 `data`：

| 字段 | 类型 | 说明 |
|---|---|---|
| paymentParams | object | 小程序支付参数 |

### 4.4.5 支付回调
- 云函数：`payment-callback`
- 触发方：微信支付服务端回调。
- 说明：该接口不由前端调用，以回调结果为最终支付状态。

### 4.4.6 查询我的订单列表
- 云函数：`order-list-query`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| pageNo | number | 是 | 页码 |
| pageSize | number | 是 | 每页条数 |
| status | string | 否 | 订单状态过滤 |

### 4.4.7 查询订单详情
- 云函数：`order-detail-get`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| orderId | string | 是 | 订单 ID |

---

## 4.5 运营后台

### 4.5.1 内容管理（攻略/商品）
- 云函数：`admin-content-manage`
- 说明：支持新增、编辑、上下架、排序，要求管理员权限。

请求参数示例：

```json
{
  "resource": "guide",
  "action": "update",
  "payload": {
    "guideId": "g_001",
    "title": "西湖夜游路线",
    "status": "online"
  }
}
```

---

## 5. 状态枚举建议

### 5.1 订单支付状态 `payStatus`
- `UNPAID`
- `PAID`
- `REFUNDED`

### 5.2 订单业务状态 `orderStatus`
- `PENDING_PAY`
- `PAID`
- `PREPARING`
- `COMPLETED`
- `CANCELLED`

### 5.3 内容状态 `status`
- `draft`
- `online`
- `offline`

---

## 6. 安全要求

- 所有关键写操作必须经过云函数，不允许前端直写高权限集合。
- 支付最终结果以支付回调为准，前端结果仅用于提示。
- 敏感字段（手机号、证件号、Wi-Fi 密码）必须加密或脱敏。
- 所有接口需记录 `requestId`，便于日志追踪和问题排查。
