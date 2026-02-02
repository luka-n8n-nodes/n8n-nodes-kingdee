# n8n-nodes-kingdee

金蝶云星空 n8n 社区节点，提供金蝶云星空 WebAPI 的集成支持。

## 安装

参考：https://docs.n8n.io/integrations/community-nodes/installation/

节点名称：`@luka-cat-mimi/n8n-nodes-kingdee`

## 功能特性

- ✅ 支持金蝶云星空 WebAPI 调用
- ✅ 两种凭证认证方式：
  - **应用授权**（推荐）：使用 AppID + AppSecret 进行认证
  - **账户密码**（已废弃）：使用用户名密码进行认证
- ✅ 自动 Cookie 会话管理
- ✅ 响应数据自动处理（日期格式、多语言字段）
- ✅ 支持批量并发请求

## 凭证类型

### 应用授权凭证（推荐）

| 字段 | 说明 |
|------|------|
| API 请求域名 | 企业访问金蝶云星空的域名，支持 `/K3Cloud` 或 `/galaxyapi` 后缀 |
| 账套 ID | 在金蝶后台「在线测试 WebAPI」->「WebAPI 在线验证」页面获取 |
| 用户名 | 登录用户名 |
| 应用 ID | 后台授权的应用 ID |
| 应用密钥 | 后台授权的应用密钥 |
| 组织编码 | 多组织时填写，非必填 |
| 语言种类 | 简体中文(2052) / 英文(1033) / 繁体中文(3076) |

### 账户密码凭证（已废弃）

> ⚠️ 此认证方式已被金蝶官方废弃，推荐使用应用授权凭证。

| 字段 | 说明 |
|------|------|
| API 请求域名 | 同上 |
| 账套 ID | 同上 |
| 用户名 | 登录用户名 |
| 密码 | 登录密码 |
| 语言种类 | 同上 |

## 注意事项

1. 使用应用授权凭证时，需要在金蝶后台配置应用并获取 AppID 和 AppSecret
2. 账套 ID 可在金蝶后台「在线测试 WebAPI」->「WebAPI 在线验证」页面获取
3. 账户密码认证方式已被金蝶官方废弃，建议尽快迁移到应用授权方式

## 支持

- 邮箱：luka.cat.mimi@gmail.com
- [问题反馈](https://github.com/luka-n8n-nodes/n8n-nodes-feishu-project/issues)

## 许可证

MIT License