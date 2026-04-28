import { INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import {
	queryOptions,
	paginationOptions,
	ICommonOptionsValue,
	transformArrayToObject,
} from '../../../help/utils/sharedOptions';

const FORM_ID = 'ENG_BOM';

const BOM_FIELD_OPTIONS = [
	{ name: '物料清单内码 (FID)', value: 'FID' },
	{ name: '编码 (FNumber)', value: 'FNumber' },
	{ name: '名称 (FName)', value: 'FName' },
	{ name: '物料编码 (FMaterialId.FNumber)', value: 'FMaterialId.FNumber' },
	{ name: '物料名称 (FMaterialId.FName)', value: 'FMaterialId.FName' },
	{ name: '单位编码 (FUnitId.FNumber)', value: 'FUnitId.FNumber' },
	{ name: '单位名称 (FUnitId.FName)', value: 'FUnitId.FName' },
	{ name: '基本数量 (FBaseQty)', value: 'FBaseQty' },
	{ name: '禁用状态 (FForbidStatus)', value: 'FForbidStatus' },
	{ name: '数据状态 (FDocumentStatus)', value: 'FDocumentStatus' },
	{ name: '创建组织编码 (FCreateOrgId.FNumber)', value: 'FCreateOrgId.FNumber' },
	{ name: '创建组织名称 (FCreateOrgId.FName)', value: 'FCreateOrgId.FName' },
	{ name: '使用组织编码 (FUseOrgId.FNumber)', value: 'FUseOrgId.FNumber' },
	{ name: '使用组织名称 (FUseOrgId.FName)', value: 'FUseOrgId.FName' },
];

const DEFAULT_FIELD_KEYS = ['FID', 'FNumber', 'FName'];

const operation: ResourceOperations = {
	name: '单据查询',
	value: 'query',
	description: '查询物料清单列表 (ExecuteBillQuery)',
	action: '查询物料清单列表',
	order: 1,
	options: [
		paginationOptions.returnAll,
		paginationOptions.limit(2000),
		{
			displayName: '查询字段',
			name: 'fieldKeys',
			type: 'multiOptions',
			options: BOM_FIELD_OPTIONS,
			default: DEFAULT_FIELD_KEYS as string[],
			description: '选择需要查询的字段',
		} as INodeProperties,
		{
			displayName: '自定义查询字段',
			name: 'customFieldKeys',
			type: 'string',
			default: '',
			description:
				'额外的自定义查询字段，支持逗号分隔的字符串或表达式数组。示例：FField1,FField2。会与上方选择的字段合并去重',
		} as INodeProperties,
		{
			displayName: '过滤条件',
			name: 'filterString',
			type: 'string',
			default: '',
			description:
				"过滤条件，支持 SQL 语法。示例：FForbidStatus = 'A'、FName like '%物料清单%'、FCreateOrgId.FNumber = '100'",
		} as INodeProperties,
		{
			displayName: '排序字段',
			name: 'orderString',
			type: 'string',
			default: '',
			description:
				'排序字段，格式：字段名 ASC/DESC。示例：FNumber ASC、FID DESC',
		} as INodeProperties,
		queryOptions,
	],
	call: async function (index) {
		const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
		const fieldKeysArray = this.getNodeParameter('fieldKeys', index, DEFAULT_FIELD_KEYS) as string[];
		const customFieldKeys = this.getNodeParameter('customFieldKeys', index, '') as string | string[];
		const filterString = this.getNodeParameter('filterString', index, '') as string;
		const orderString = this.getNodeParameter('orderString', index, '') as string;

		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;
		const transformData = options.transformData !== false;

		let customFields: string[] = [];
		if (customFieldKeys) {
			if (Array.isArray(customFieldKeys)) {
				customFields = customFieldKeys.map((f) => String(f).trim()).filter((f) => f);
			} else if (typeof customFieldKeys === 'string') {
				customFields = customFieldKeys.split(',').map((f) => f.trim()).filter((f) => f);
			}
		}

		const allFieldKeysArray = [...new Set([...fieldKeysArray, ...customFields])];
		const fieldKeys = allFieldKeysArray.join(',');

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
				return transformArrayToObject(result, allFieldKeysArray);
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
