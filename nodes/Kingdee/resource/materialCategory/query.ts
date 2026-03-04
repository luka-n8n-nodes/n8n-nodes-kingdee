import { INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import {
	queryOptions,
	paginationOptions,
	ICommonOptionsValue,
	transformArrayToObject,
} from '../../../help/utils/sharedOptions';

const FORM_ID = 'BD_MATERIALCATEGORY';

const MATERIAL_CATEGORY_FIELD_OPTIONS = [
	{ name: '类别内码 (FCATEGORYID)', value: 'FCATEGORYID' },
	{ name: '编码 (FNumber)', value: 'FNumber' },
	{ name: '名称 (FName)', value: 'FName' },
	{ name: '描述 (FDescription)', value: 'FDescription' },
	{ name: '上级类别内码 (FParentID)', value: 'FParentID' },
	{ name: '上级类别编码 (FParentID.FNumber)', value: 'FParentID.FNumber' },
	{ name: '上级类别名称 (FParentID.FName)', value: 'FParentID.FName' },
	{ name: '创建组织编码 (FCreateOrgId.FNumber)', value: 'FCreateOrgId.FNumber' },
	{ name: '创建组织名称 (FCreateOrgId.FName)', value: 'FCreateOrgId.FName' },
	{ name: '使用组织编码 (FUseOrgId.FNumber)', value: 'FUseOrgId.FNumber' },
	{ name: '使用组织名称 (FUseOrgId.FName)', value: 'FUseOrgId.FName' },
];

const DEFAULT_FIELD_KEYS = ['FCATEGORYID', 'FNumber', 'FName'];

const operation: ResourceOperations = {
	name: '单据查询',
	value: 'query',
	description: '查询存货类别列表 (ExecuteBillQuery)',
	action: '查询存货类别列表',
	order: 1,
	options: [
		paginationOptions.returnAll,
		paginationOptions.limit(2000),
		{
			displayName: '查询字段',
			name: 'fieldKeys',
			type: 'multiOptions',
			options: MATERIAL_CATEGORY_FIELD_OPTIONS,
			default: DEFAULT_FIELD_KEYS as string[],
			description: '选择需要查询的字段',
		} as INodeProperties,
		{
			displayName: '过滤条件',
			name: 'filterString',
			type: 'string',
			default: '',
			description:
				"过滤条件，支持 SQL 语法。示例：FName like '%原材料%'",
		} as INodeProperties,
		{
			displayName: '排序字段',
			name: 'orderString',
			type: 'string',
			default: '',
			description:
				'排序字段，格式：字段名 ASC/DESC。示例：FNumber ASC、FCATEGORYID DESC',
		} as INodeProperties,
		queryOptions,
	],
	call: async function (index) {
		const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
		const fieldKeysArray = this.getNodeParameter('fieldKeys', index, DEFAULT_FIELD_KEYS) as string[];
		const filterString = this.getNodeParameter('filterString', index, '') as string;
		const orderString = this.getNodeParameter('orderString', index, '') as string;

		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;
		const transformData = options.transformData !== false;

		const fieldKeys = fieldKeysArray.join(',');

		const buildRequestData = (limit: number, start: number) => ({
			FormId: FORM_ID,
			FieldKeys: fieldKeys,
			FilterString: filterString,
			OrderString: orderString,
			StartRow: start,
			Limit: limit,
		});

		const processResult = (result: any) => {
			if (transformData && Array.isArray(result)) {
				return transformArrayToObject(result, fieldKeysArray);
			}
			return result;
		};

		if (returnAll) {
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
					hasMore = result.length >= pageSize;
				} else {
					hasMore = false;
				}
			}

			return processResult(allResults);
		} else {
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
