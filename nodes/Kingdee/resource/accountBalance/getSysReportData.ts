import { INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import {
	queryOptions,
	paginationOptions,
	ICommonOptionsValue,
	transformArrayToObject,
} from '../../../help/utils/sharedOptions';

const FORM_ID = 'GL_RPT_AccountBalance';

const operation: ResourceOperations = {
	name: '查询报表数据',
	value: 'getSysReportData',
	description: '查询科目余额表报表数据 (GetSysReportData)',
	action: '查询科目余额表报表数据',
	order: 1,
	options: [
		paginationOptions.returnAll,
		paginationOptions.limit(2000),
		{
			displayName: '查询字段',
			name: 'fieldKeys',
			type: 'string',
			default: '',
			description: '查询字段列表，多个字段用逗号分隔',
		} as INodeProperties,
		{
			displayName: '方案ID',
			name: 'schemeId',
			type: 'string',
			default: '',
			description: '报表方案ID，非必须',
		} as INodeProperties,
		{
			displayName: '过滤条件',
			name: 'filterString',
			type: 'string',
			default: '',
			description: '过滤条件，支持 SQL 语法',
		} as INodeProperties,
		{
			displayName: '排序字段',
			name: 'orderString',
			type: 'string',
			default: '',
			description: '排序字段，格式：字段名 ASC/DESC',
		} as INodeProperties,
		queryOptions,
	],
	call: async function (index) {
		const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
		const fieldKeys = this.getNodeParameter('fieldKeys', index, '') as string;
		const schemeId = this.getNodeParameter('schemeId', index, '') as string;
		const filterString = this.getNodeParameter('filterString', index, '') as string;
		const orderString = this.getNodeParameter('orderString', index, '') as string;

		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;
		const transformData = options.transformData !== false;

		const buildRequestData = (limit: number, start: number) => {
			const data: Record<string, any> = {
				FieldKeys: fieldKeys,
				StartRow: start,
				Limit: limit,
			};
			if (schemeId) {
				data.SchemeId = schemeId;
			}
			if (filterString) {
				data.FilterString = filterString;
			}
			if (orderString) {
				data.OrderString = orderString;
			}
			return data;
		};

		// 提取响应中的数据行：兼容 { Rows: [...] } 包装结构与直接返回数组两种情况
		const extractRows = (result: any): any[] => {
			if (result && Array.isArray(result.Rows)) return result.Rows;
			if (Array.isArray(result)) return result;
			return [];
		};

		const transformRows = (rows: any[]) => {
			if (transformData && fieldKeys && Array.isArray(rows)) {
				return transformArrayToObject(rows, fieldKeys.split(',').map((k) => k.trim()));
			}
			return rows;
		};

		if (returnAll) {
			const allRows: any[] = [];
			const pageSize = 2000;
			let currentStart = 0;
			let totalRowCount = Number.POSITIVE_INFINITY;

			while (currentStart < totalRowCount) {
				const data = buildRequestData(pageSize, currentStart);
				const result = await RequestUtils.call.call(
					this,
					'DynamicFormService',
					'GetSysReportData',
					[FORM_ID, data],
				);

				if (typeof result?.RowCount === 'number') {
					totalRowCount = result.RowCount;
				}

				const rows = extractRows(result);
				if (rows.length === 0) break;

				allRows.push(...rows);
				currentStart += rows.length;

				if (rows.length < pageSize) break;
			}

			return transformRows(allRows);
		} else {
			const limit = this.getNodeParameter('limit', index, 100) as number;
			const data = buildRequestData(limit, 0);

			const result = await RequestUtils.call.call(
				this,
				'DynamicFormService',
				'GetSysReportData',
				[FORM_ID, data],
			);
			return transformRows(extractRows(result));
		}
	},
};

export default operation;
