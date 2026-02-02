import { INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import {
	queryOptions,
	paginationOptions,
	ICommonOptionsValue,
	transformArrayToObject,
} from '../../../help/utils/sharedOptions';

/**
 * 员工表单ID
 */
const FORM_ID = 'BD_Empinfo';

/**
 * 员工字段选项
 */
const EMPLOYEE_FIELD_OPTIONS = [
	{ name: '员工内码 (FID)', value: 'FID' },
	{ name: '员工编码 (FNumber)', value: 'FNumber' },
	{ name: '员工姓名 (FName)', value: 'FName' },
	{ name: '手机号码 (FMobile)', value: 'FMobile' },
	{ name: '电子邮件 (FEmail)', value: 'FEmail' },
	{ name: '创建组织编码 (FCreateOrgId.FNumber)', value: 'FCreateOrgId.FNumber' },
	{ name: '创建组织名称 (FCreateOrgId.FName)', value: 'FCreateOrgId.FName' },
	{ name: '使用组织编码 (FUseOrgId.FNumber)', value: 'FUseOrgId.FNumber' },
	{ name: '使用组织名称 (FUseOrgId.FName)', value: 'FUseOrgId.FName' },
	{ name: '工作组织编码 (FWorkOrgId.FNumber)', value: 'FWorkOrgId.FNumber' },
	{ name: '所属部门编码 (FPostDept.FNumber)', value: 'FPostDept.FNumber' },
	{ name: '所属部门名称 (FPostDept.FName)', value: 'FPostDept.FName' },
	{ name: '就任岗位编码 (FPost.FNumber)', value: 'FPost.FNumber' },
	{ name: '就任岗位名称 (FPost.FName)', value: 'FPost.FName' },
	{ name: '禁用状态 (FForbidStatus)', value: 'FForbidStatus' },
	{ name: '入职日期 (FJoinDate)', value: 'FJoinDate' },
	{ name: '员工编号 (FStaffNumber)', value: 'FStaffNumber' },
];

/**
 * 默认选中的字段
 */
const DEFAULT_FIELD_KEYS = ['FID', 'FName'];

/**
 * 查询员工列表操作定义
 */
const operation: ResourceOperations = {
	name: '查询列表',
	value: 'query',
	description: '查询员工列表 (ExecuteBillQuery)',
	action: '查询员工列表',
	order: 2,
	options: [
		paginationOptions.returnAll,
		paginationOptions.limit(2000),
		{
			displayName: '查询字段',
			name: 'fieldKeys',
			type: 'multiOptions',
			options: EMPLOYEE_FIELD_OPTIONS,
			default: DEFAULT_FIELD_KEYS as string[],
			description: '选择需要查询的字段',
		} as INodeProperties,
		{
			displayName: '过滤条件',
			name: 'filterString',
			type: 'string',
			default: '',
			description:
				"过滤条件，支持 SQL 语法。示例：FForbidStatus = 'A'、FName like '%张%'、FCreateOrgId.FNumber = '100' and FForbidStatus = 'A'",
		} as INodeProperties,
		{
			displayName: '排序字段',
			name: 'orderString',
			type: 'string',
			default: '',
			description:
				'排序字段，格式：字段名 ASC/DESC。示例：FNumber ASC（按编码升序）、FID DESC（按内码降序）、FCreateOrgId ASC, FNumber DESC（多字段排序）',
		} as INodeProperties,
		queryOptions,
	],
	call: async function (index) {
		const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
		const fieldKeysArray = this.getNodeParameter('fieldKeys', index, DEFAULT_FIELD_KEYS) as string[];
		const filterString = this.getNodeParameter('filterString', index, '') as string;
		const orderString = this.getNodeParameter('orderString', index, '') as string;

		// 获取选项
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;
		const transformData = options.transformData !== false; // 默认为 true

		// 将字段数组转换为逗号分隔的字符串
		const fieldKeys = fieldKeysArray.join(',');

		// 构建基础请求数据
		const buildRequestData = (limit: number, start: number) => ({
			FormId: FORM_ID,
			FieldKeys: fieldKeys,
			FilterString: filterString,
			OrderString: orderString,
			StartRow: start,
			Limit: limit,
		});

		// 处理结果转换
		const processResult = (result: any) => {
			if (transformData && Array.isArray(result)) {
				return transformArrayToObject(result, fieldKeysArray);
			}
			return result;
		};

		if (returnAll) {
			// 返回所有结果：分页查询直到没有更多数据
			const allResults: any[] = [];
			const pageSize = 2000;
			let currentStart = 0;
			let hasMore = true;

			while (hasMore) {
				const data = buildRequestData(pageSize, currentStart);
				const result = await RequestUtils.call.call(
					this,
					'DynamicFormService',
					'ExecuteBillQuery',
					[data],
				);

				if (Array.isArray(result) && result.length > 0) {
					allResults.push(...result);
					currentStart += result.length;
					// 如果返回数量小于请求数量，说明已经没有更多数据
					hasMore = result.length >= pageSize;
				} else {
					hasMore = false;
				}
			}

			return processResult(allResults);
		} else {
			// 返回限制数量的结果
			const limit = this.getNodeParameter('limit', index, 100) as number;
			const data = buildRequestData(limit, 0);

			const result = await RequestUtils.call.call(
				this,
				'DynamicFormService',
				'ExecuteBillQuery',
				[data],
			);
			return processResult(result);
		}
	},
};

export default operation;
