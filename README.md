# Guihua Home

## 项目简介

Guihua Home 是一个面向已预订客户的民宿微信小程序，主题风格为“桂花”，强调清淡优雅、信息清晰、操作简单。

核心功能：

- 入住助手：展示 Wi-Fi、地址、联系方式、入住须知，并支持客户信息登记。
- 旅游攻略：介绍附近景点、交通方式与游玩建议，支持一键导航。
- 伴手礼预定：推荐本地伴手礼和文创产品，支持下单与支付。

项目目标是以个人可维护的方式构建一个稳定、安全、可部署、可扩展的小程序系统。

## 如何运行

### 1. 环境准备

- 安装微信开发者工具。
- 注册并开通微信小程序账号。
- 开通微信云开发（CloudBase）环境。

### 2. 获取项目

```bash
git clone <your-repo-url>
cd guihua-home
```

### 3. 导入小程序项目

- 使用微信开发者工具打开 `miniprogram/` 目录。
- 在“云开发”中绑定你的环境 ID（如 `guihua-home-prod`）。

### 4. 部署云函数

- 在开发者工具中进入 `cloudfunctions/`。
- 逐个上传并部署云函数（如 `auth-verify-booking`、`order-create`、`payment-callback`）。

### 5. 初始化数据

- 在云数据库创建基础集合（如 `stores`、`guides`、`products`、`orders`）。
- 导入初始数据（民宿信息、攻略、商品）。

### 6. 本地调试与发布

- 在开发者工具中进行真机预览与功能验证。
- 通过小程序管理后台提交审核并发布。

## 技术栈

- 客户端：微信小程序原生（WXML + WXSS + JavaScript）
- 后端：微信云开发 CloudBase（云函数）
- 数据库：云开发数据库（NoSQL）
- 文件存储：云存储（图片、素材）
- 支付：微信支付
- 地图：腾讯位置服务（导航/定位）
- 消息通知：微信订阅消息
- 监控与日志：云开发监控、日志告警

## 项目文档

- 产品需求文档：`docs/PRD.md`
- 系统架构文档：`docs/ARCHITECTURE.md`
- 接口规范文档：`docs/api-spec.md`
- 数据模型文档：`docs/db-schema.md`

## 目录建议

```text
guihua-home/
├─ miniprogram/
├─ cloudfunctions/
├─ docs/
│  ├─ PRD.md
│  ├─ api-spec.md
│  ├─ db-schema.md
│  └─ ARCHITECTURE.md
└─ README.md
```

## 后续扩展方向

- 多门店支持（按 `store_id` 隔离数据）
- 优惠券与组合购
- 推荐系统（按用户浏览与购买行为推荐）
- 独立管理后台（店主内容与订单管理）
