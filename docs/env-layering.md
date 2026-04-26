# 环境分层约定（V1）

## 1. 目标
- 统一环境标识为两套：`dev`、`prod`。
- 前端与云函数都基于同一命名约定做环境判断。
- 当前阶段不定义第三套环境，避免口径漂移。

## 2. 配置位置
- 小程序端：`miniprogram/constants/env-profile.js`
- 小程序云环境 ID 映射：`miniprogram/constants/cloud-env.js`
- 云函数端：`cloudfunctions/common/env-profile.js`

## 3. 命名与映射规则

### 3.1 小程序端（微信内置 envVersion -> 业务环境）
| 微信 `envVersion` | 业务环境 |
|---|---|
| `develop` | `dev` |
| `trial` | `dev` |
| `release` | `prod` |

说明：V1 仅识别以上三个微信值，统一归并到两套业务环境。

### 3.2 云函数端（CloudBase 环境 ID -> 业务环境）
| CloudBase 环境 ID 后缀 | 业务环境 |
|---|---|
| `-dev` | `dev` |
| `-prod` | `prod` |

示例：
- `cloudbase-d6g0oscry3022da21` -> `dev`（显式映射）
- `guihua-home-dev` -> `dev`
- `guihua-home-prod` -> `prod`

## 4. 约束
- 业务代码只允许使用 `dev`、`prod` 两个值。
- 若读取到未定义值，必须抛出错误，禁止静默降级。
- 后续步骤新增配置时，必须复用这两份环境映射模块，避免重复定义。
