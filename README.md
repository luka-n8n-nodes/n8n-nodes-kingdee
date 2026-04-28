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

## 支持的资源与操作

> 共计 **45 个资源**，覆盖基础资料、财务会计、供应链、生产制造、质量管理、税务管理等模块。

### 基础资料

| 资源 | FormId | 支持的操作 |
|------|--------|-----------|
| 员工 | BD_Empinfo | 查看、查询、启用、禁用 |
| 系统用户 | SEC_User | 查询、更新、启用、禁用 |
| 物料 | BD_MATERIAL | 查看、查询、保存、删除、暂存、提交、审核、反审核、启用、禁用、分配、取消分配、撤销、分组保存、分组删除、查询分组信息、批量保存 |
| 计量单位 | BD_UNIT | 查看、查询 |
| 存货类别 | BD_MATERIALCATEGORY | 查看、查询 |

### 基础管理 - 组织管理

| 资源 | FormId | 支持的操作 |
|------|--------|-----------|
| 组织机构 | ORG_Organizations | 查看、查询 |

### 财务会计 - 出纳管理

| 资源 | FormId | 支持的操作 |
|------|--------|-----------|
| 付款单 | AP_PAYBILL | 保存、提交、审核 |
| 收款单 | AR_RECEIVEBILL | 查看、查询、删除、暂存、保存、提交、审核、反审核、撤销、下推、作废、批量保存 |
| 付款申请单 | CN_PAYAPPLY | 查看、查询 |

### 财务会计 - 应付款管理

| 资源 | FormId | 支持的操作 |
|------|--------|-----------|
| 应付单 | AP_Payable | 查看、查询 |

### 财务会计 - 应收款管理

| 资源 | FormId | 支持的操作 |
|------|--------|-----------|
| 应收单 | AR_receivable | 查看、查询 |

### 财务会计 - 总账

| 资源 | FormId | 支持的操作 |
|------|--------|-----------|
| 凭证 | GL_VOUCHER | 查看、查询 |
| 科目余额表 | GL_RPT_AccountBalance | 查询报表数据 |

### 供应链 - 采购管理

| 资源 | FormId | 支持的操作 |
|------|--------|-----------|
| 采购订单 | PUR_PurchaseOrder | 查看、查询、保存 |
| 采购申请单 | PUR_Requisition | 查看、查询 |
| 收料通知单 | PUR_ReceiveBill | 查看、查询 |
| 采购入库单 | STK_InStock | 查看、查询 |

### 供应链 - 销售管理

| 资源 | FormId | 支持的操作 |
|------|--------|-----------|
| 销售订单 | SAL_SaleOrder | 查看、查询 |
| 发货通知单 | SAL_DELIVERYNOTICE | 查看、查询 |
| 销售出库单 | SAL_OUTSTOCK | 查看、查询 |

### 供应链 - 库存管理

| 资源 | FormId | 支持的操作 |
|------|--------|-----------|
| 即时库存 | STK_Inventory | 查询 |
| 库存同步 | STK_InvUpdateToGY | 查询 |
| 出库申请单 | STK_OutStockApply | 查看、查询 |
| 直接调拨单 | STK_TransferDirect | 查看、查询 |
| 其他出库单 | STK_MisDelivery | 查看、查询 |
| 其他入库单 | STK_MISCELLANEOUS | 查看、查询 |

### 生产制造 - 委外管理

| 资源 | FormId | 支持的操作 |
|------|--------|-----------|
| 委外订单 | SUB_SUBREQORDER | 查看、查询 |
| 委外领料单 | SUB_PICKMTRL | 查看、查询 |

### 生产制造 - 工程管理

| 资源 | FormId | 支持的操作 |
|------|--------|-----------|
| 物料清单 | ENG_BOM | 查看、查询、保存、删除、提交、审核、反审核、禁用、反禁用、撤销、分配、取消分配、分组保存、分组删除 |

### 生产制造 - 计划管理

| 资源 | FormId | 支持的操作 |
|------|--------|-----------|
| 计划订单 | PLN_PLANORDER | 查看、查询 |

### 生产制造 - 生产管理

| 资源 | FormId | 支持的操作 |
|------|--------|-----------|
| 生产订单 | PRD_MO | 查看、查询 |
| 生产领料单 | PRD_PickMtrl | 查看、查询 |
| 生产补料单 | PRD_FeedMtrl | 查看、查询 |
| 生产退料单 | PRD_ReturnMtrl | 查看、查询 |
| 生产汇报单 | PRD_MORPT | 查看、查询 |
| 生产入库单 | PRD_INSTOCK | 查看、查询 |

### 质量管理

| 资源 | FormId | 支持的操作 |
|------|--------|-----------|
| 检验单 | QM_InspectBill | 查看、查询 |
| 生产退料请检单 | QM_ReturnMtrAppQc | 查看、查询 |

### 税务管理 - 发票管理

| 资源 | FormId | 支持的操作 |
|------|--------|-----------|
| 采购普通发票 | IV_PURCHASEOC | 查看、查询 |
| 采购增值税专用发票 | IV_PURCHASEIC | 查看、查询 |
| 进项费用普通发票 | IV_PUREXPINV | 查看、查询 |
| 进项费用增值税发票 | IV_PUREXVATIN | 查看、查询 |
| 销售增值税专用发票 | IV_SALESIC | 查看、查询 |
| 销售普通发票 | IV_SALESOC | 查看、查询 |
| 金税开票单 | IV_GTINVOICE | 查看、查询 |

### 操作说明

| 操作 | API 方法 | 说明 |
|------|---------|------|
| 查看 | View | 按编码或内码查看单据详情 |
| 查询 | ExecuteBillQuery | 批量查询列表，支持分页、过滤、排序、字段选择 |
| 保存 | Save | 新增或更新单据 |
| 暂存 | Draft | 暂存单据草稿 |
| 提交 | Submit | 提交单据 |
| 审核 | Audit | 审核单据 |
| 反审核 | UnAudit | 撤销审核 |
| 删除 | Delete | 删除单据 |
| 撤销 | CancelAssign | 撤销单据 |
| 下推 | Push | 下推生成下游单据 |
| 作废 | Cancel | 作废单据 |
| 批量保存 | BatchSave | 批量新增或更新单据 |
| 查询报表数据 | GetSysReportData | 查询系统报表数据 |

## 过滤条件语法

查询操作支持 SQL 风格的过滤条件：

```sql
-- 单条件查询
FForbidStatus = 'A'

-- 模糊查询
FName LIKE '%张%'

-- 多条件 AND
FForbidStatus = 'A' AND FIsLocked = 0

-- 多条件 OR（并集查询）
FUserAccount = '111' OR FEmail = '222'

-- IN 查询
FUserAccount IN ('user1', 'user2', 'user3')

-- 复合条件
(FUserAccount = '111' OR FEmail LIKE '%@company.com') AND FForbidStatus = 'A'
```

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