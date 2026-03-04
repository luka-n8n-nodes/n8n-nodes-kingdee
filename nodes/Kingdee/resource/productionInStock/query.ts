import { INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import {
	queryOptions,
	paginationOptions,
	ICommonOptionsValue,
	transformArrayToObject,
} from '../../../help/utils/sharedOptions';

const FORM_ID = 'PRD_INSTOCK';

const operation: ResourceOperations = {
	name: '单据查询',
	value: 'query',
	description: '查询生产入库单列表 (ExecuteBillQuery)',
	action: '查询生产入库单列表',
	order: 2,
	options: [
		paginationOptions.returnAll,
		paginationOptions.limit(2000),
		{
			displayName: '查询字段',
			name: 'fieldKeys',
			type: 'string',
			default: 'FID,FBillNo',
			description:
				'查询字段列表，多个字段用逗号分隔。示例：FID,FBillNo,FDate,FBillTypeID',
		} as INodeProperties,
		{
			displayName: '过滤条件',
			name: 'filterString',
			type: 'string',
			default: '',
			description:
				"过滤条件，支持 SQL 语法。示例：FBillNo = 'xxx'、FDocumentStatus = 'C'",
		} as INodeProperties,
		{
			displayName: '排序字段',
			name: 'orderString',
			type: 'string',
			default: '',
			description:
				'排序字段，格式：字段名 ASC/DESC。示例：FBillNo ASC、FID DESC',
		} as INodeProperties,
		queryOptions,
	],
	call: async function (index) {
		const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
		const fieldKeys = this.getNodeParameter('fieldKeys', index, 'FID,FBillNo') as string;
		const filterString = this.getNodeParameter('filterString', index, '') as string;
		const orderString = this.getNodeParameter('orderString', index, '') as string;

		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;
		const transformData = options.transformData !== false;

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
				return transformArrayToObject(result, fieldKeys.split(',').map((k) => k.trim()));
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
