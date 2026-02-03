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
 * 系统用户表单ID
 */
const FORM_ID = 'SEC_User';

/**
 * 系统用户字段选项
 */
const SEC_USER_FIELD_OPTIONS = [
	{ name: '用户内码 (FUserID)', value: 'FUserID' },
	{ name: '用户名称 (FName)', value: 'FName' },
	{ name: '用户账号 (FUserAccount)', value: 'FUserAccount' },
	{ name: '组织内码 (FOrgId)', value: 'FOrgId' },
	{ name: '用户类型 (FUserType)', value: 'FUserType' },
	{ name: '禁用状态 (FForbidStatus)', value: 'FForbidStatus' },
	{ name: '手机号码 (FPhone)', value: 'FPhone' },
	{ name: '邮箱 (FEmail)', value: 'FEmail' },
	{ name: '创建时间 (FCreateDate)', value: 'FCreateDate' },
	{ name: '关联员工内码 (FLinkObject)', value: 'FLinkObject' },
	{ name: '备注 (FDescription)', value: 'FDescription' },
];

/**
 * 默认选中的字段
 */
const DEFAULT_FIELD_KEYS = ['FUserID', 'FNumber', 'FName'];

/**
 * 查询系统用户列表操作定义
 */
const operation: ResourceOperations = {
	name: '查询列表',
	value: 'query',
	description: '查询系统用户列表 (ExecuteBillQuery)',
	action: '查询系统用户列表',
	order: 1,
	options: [
		paginationOptions.returnAll,
		paginationOptions.limit(2000),
		{
			displayName: '查询字段',
			name: 'fieldKeys',
			type: 'multiOptions',
			options: SEC_USER_FIELD_OPTIONS,
			default: DEFAULT_FIELD_KEYS as string[],
			description: '选择需要查询的字段',
		} as INodeProperties,
		{
			displayName: '自定义查询字段',
			name: 'customFieldKeys',
			type: 'string',
			default: '',
			description: '额外的自定义查询字段，支持逗号分隔的字符串或表达式数组。示例：FField1,FField2。会与上方选择的字段合并去重',
		} as INodeProperties,
		{
			displayName: '过滤条件',
			name: 'filterString',
			type: 'string',
			typeOptions: {
				rows: 4,
			},
			default: '',
			description:
				"过滤条件，支持 SQL 语法。示例：FForbidStatus = 'A'、FName like '%admin%'、FIsLocked = 0",
		} as INodeProperties,
		{
			displayName: '排序字段',
			name: 'orderString',
			type: 'string',
			default: '',
			description:
				'排序字段，格式：字段名 ASC/DESC。示例：FNumber ASC（按编码升序）、FUserID DESC（按内码降序）',
		} as INodeProperties,
		queryOptions,
	],
	call: async function (index) {
		const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
		const fieldKeysArray = this.getNodeParameter('fieldKeys', index, DEFAULT_FIELD_KEYS) as string[];
		const customFieldKeys = this.getNodeParameter('customFieldKeys', index, '') as string | string[];
		const filterString = this.getNodeParameter('filterString', index, '') as string;
		const orderString = this.getNodeParameter('orderString', index, '') as string;

		// 获取选项
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;
		const transformData = options.transformData !== false; // 默认为 true

		// 处理自定义字段：支持逗号分隔字符串或数组
		let customFields: string[] = [];
		if (customFieldKeys) {
			if (Array.isArray(customFieldKeys)) {
				// 表达式返回数组的情况
				customFields = customFieldKeys.map((f) => String(f).trim()).filter((f) => f);
			} else if (typeof customFieldKeys === 'string') {
				// 逗号分隔的字符串
				customFields = customFieldKeys.split(',').map((f) => f.trim()).filter((f) => f);
			}
		}

		// 合并字段并去重
		const allFieldKeysArray = [...new Set([...fieldKeysArray, ...customFields])];

		// 将字段数组转换为逗号分隔的字符串
		const fieldKeys = allFieldKeysArray.join(',');

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
				return transformArrayToObject(result, allFieldKeysArray);
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
