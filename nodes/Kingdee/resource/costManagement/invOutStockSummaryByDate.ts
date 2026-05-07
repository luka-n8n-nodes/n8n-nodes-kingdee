import { INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import {
	queryOptions,
	paginationOptions,
	ICommonOptionsValue,
	transformArrayToObject,
} from '../../../help/utils/sharedOptions';

const FORM_ID = 'HS_INOUTSTOCKSUMMARYBYDATERPT';

/**
 * 将编码字符串转换为金蝶基础资料对象格式
 * 空字符串 => { FNumber: "" }（API 要求始终发送完整结构）
 */
function toBaseDataObject(value: string): Record<string, any> {
	return { FNumber: (value ?? '').trim() };
}

/**
 * 将逗号分隔的编码字符串转换为基础资料对象数组
 * 空字符串 => [{ FNumber: "" }]（API 要求始终发送完整结构）
 */
function toBaseDataArray(value: string): Record<string, any>[] {
	const trimmed = (value ?? '').trim();
	if (!trimmed) return [{ FNumber: '' }];
	return trimmed
		.split(',')
		.map((s) => s.trim())
		.filter((s) => s)
		.map((s) => ({ FNumber: s }));
}

const operation: ResourceOperations = {
	name: '存货收发存汇总表（按日期）',
	value: 'invOutStockSummaryByDate',
	description: '查询存货收发存汇总表（按日期）报表数据 (GetSysReportData)',
	action: '查询存货收发存汇总表（按日期）',
	order: 1,
	options: [
		paginationOptions.returnAll,
		paginationOptions.limit(10000),
		{
			displayName: '查询字段',
			name: 'fieldKeys',
			type: 'string',
			default:
				'FMaterialNumber,FMaterialName,FSpecification,FUnitName,FBeginQty,FBeginAmount,FInQty,FInAmount,FOutQty,FOutAmount,FEndQty,FEndAmount',
			required: true,
			description:
				'需查询的字段key集合，多个字段用逗号分隔。常用字段：FMaterialNumber(物料编码),FMaterialName(物料名称),FSpecification(规格型号),FUnitName(计量单位),FBeginQty(期初数量),FBeginAmount(期初金额),FInQty(收入数量),FInAmount(收入金额),FOutQty(发出数量),FOutAmount(发出金额),FEndQty(期末数量),FEndAmount(期末金额),FStockOrgNumber(库存组织),FStockName(仓库名称),FDate(日期)',
		} as INodeProperties,
		{
			displayName: '核算体系编码',
			name: 'fAcctgSystemId',
			type: 'string',
			default: '',
			required: true,
			description: '核算体系编码 (FACCTGSYSTEMID.FNumber)',
		} as INodeProperties,
		{
			displayName: '核算组织编码',
			name: 'fAcctgOrgId',
			type: 'string',
			default: '',
			required: true,
			description: '核算组织编码 (FACCTGORGID.FNumber)',
		} as INodeProperties,
		{
			displayName: '会计政策编码',
			name: 'fAcctPolicyId',
			type: 'string',
			default: '',
			required: true,
			description: '会计政策编码 (FACCTPOLICYID.FNumber)',
		} as INodeProperties,
		{
			displayName: '开始日期',
			name: 'fBeginDate',
			type: 'string',
			default: '2026-05-01',
			required: true,
			description: '开始日期 (FBEGINDATE)，格式 YYYY-MM-DD。留空则默认当前月第一天',
		} as INodeProperties,
		{
			displayName: '结束日期',
			name: 'fEndDate',
			type: 'string',
			default: '2026-05-31',
			required: true,
			description: '结束日期 (FENDDATE)，格式 YYYY-MM-DD。留空则默认当前月最后一天',
		} as INodeProperties,
		{
			displayName: '期间开始日期',
			name: 'fPeriodStartDate',
			type: 'string',
			default: '2026-05-01',
			required: true,
			description: '期间开始日期 (FPeriodStartDate)，格式 YYYY-MM-DD。留空则默认当前月第一天',
		} as INodeProperties,
		{
			displayName: '汇总依据',
			name: 'fComboTotalType',
			type: 'string',
			default: '',
			required: true,
			description: '汇总依据 (FCOMBOTotalType)',
		} as INodeProperties,
		{
			displayName: '显示维度',
			name: 'fDimType',
			type: 'string',
			default: '',
			required: true,
			description: '显示维度 (FDimType)',
		} as INodeProperties,
		{
			displayName: '可选过滤条件',
			name: 'optionalFilters',
			type: 'collection',
			placeholder: '添加过滤条件',
			default: {},
			description: 'Model 中的可选过滤字段，留空则使用默认空值',
			options: [
				{
					displayName: '开始会计年度',
					name: 'fYear',
					type: 'string',
					default: '',
					description: '开始会计年度 (FYear)',
				},
				{
					displayName: '日期/期间',
					name: 'fPeriod',
					type: 'string',
					default: '',
					description: '日期/期间 (FPeriod)',
				},
				{
					displayName: '结束会计年度',
					name: 'fEndYear',
					type: 'string',
					default: '',
					description: '结束会计年度 (FENDYEAR)',
				},
				{
					displayName: '结束会计期间',
					name: 'fEndPeriod',
					type: 'string',
					default: '',
					description: '结束会计期间 (FEndPeriod)',
				},
				{
					displayName: '物料编码（起）',
					name: 'fMaterialId',
					type: 'string',
					default: '',
					description: '物料编码 (FMATERIALID.FNumber)',
				},
				{
					displayName: '物料编码（止）',
					name: 'fEndMaterialId',
					type: 'string',
					default: '',
					description: '物料编码至 (FENDMATERIALID.FNumber)',
				},
				{
					displayName: '费用项目（起）',
					name: 'fExpenId',
					type: 'string',
					default: '',
					description: '费用项目 (FEXPENID.FNumber)',
				},
				{
					displayName: '费用项目（止）',
					name: 'fEndExpenId',
					type: 'string',
					default: '',
					description: '费用项目至 (FENDEXPENID.FNumber)',
				},
				{
					displayName: '核算范围编码',
					name: 'fAcctGrangeId',
					type: 'string',
					default: '',
					description: '核算范围编码 (FACCTGRANGEID.FNumber)',
				},
				{
					displayName: '货主编码',
					name: 'fOwnerId',
					type: 'string',
					default: '',
					description: '货主 (FOwnerID.FNumber)',
				},
				{
					displayName: '库存组织编码',
					name: 'fStockOrgId',
					type: 'string',
					default: '',
					description: '库存组织 (FSTOCKORGID.FNumber)',
				},
				{
					displayName: '库存状态编码',
					name: 'fStockStatusId',
					type: 'string',
					default: '',
					description:
						'库存状态 (FSTOCKSTATUSID)，多个用逗号分隔。示例："KCZT01,KCZT02"',
				},
				{
					displayName: '仓库（起）',
					name: 'fStockId',
					type: 'string',
					default: '',
					description: '仓库 (FSTOCKId.FNumber)',
				},
				{
					displayName: '仓库（止）',
					name: 'fEndStockId',
					type: 'string',
					default: '',
					description: '仓库至 (FENDSTOCKID.FNumber)',
				},
				{
					displayName: '存货类别编码',
					name: 'fMaterTypeId',
					type: 'string',
					default: '',
					description: '存货类别 (FMATERTYPEID.FNUMBER)',
				},
				{
					displayName: '本位币编码',
					name: 'fCurrencyId',
					type: 'string',
					default: '',
					description: '本位币 (FCURRENCYID.FNumber)',
				},
				{
					displayName: '单据状态',
					name: 'fComboStatus',
					type: 'string',
					default: '',
					description: '单据状态 (FCOMBOSTATUS)',
				},
				{
					displayName: '显示费用项目明细',
					name: 'fChxExpense',
					type: 'boolean',
					default: false,
					description: 'Whether to show expense details (FCHXEXPENSE)',
				},
				{
					displayName: '只显示汇总行',
					name: 'fChxTotal',
					type: 'boolean',
					default: false,
					description: 'Whether to only show summary rows (FCHXTotal)',
				},
				{
					displayName: '无收发不显示',
					name: 'fChxNoInOut',
					type: 'boolean',
					default: false,
					description: 'Whether to hide records without inflow/outflow (FCHXNOINOUT)',
				},
				{
					displayName: '不统计核算组织内调拨单据',
					name: 'fChxNoCostAllot',
					type: 'boolean',
					default: false,
					description:
						'Whether to exclude intra-organization transfer documents (FCHXNOCOSTALLOT)',
				},
				{
					displayName: '显示各期间明细',
					name: 'fIsDisplayPeriod',
					type: 'boolean',
					default: false,
					description: 'Whether to show details for each period (FIsDisplayPeriod)',
				},
				{
					displayName: '不统计库存调整单据',
					name: 'fChxNoStockAdj',
					type: 'boolean',
					default: false,
					description: 'Whether to exclude stock adjustment documents (FCHXNOSTOCKADJ)',
				},
			],
		} as INodeProperties,
		{
			displayName: '方案ID',
			name: 'schemeId',
			type: 'string',
			default: '',
			description: '过滤方案内码 (SchemeId)',
		} as INodeProperties,
		{
			displayName: '过滤条件',
			name: 'filterString',
			type: 'json',
			default: '[]',
			description:
				'过滤条件，JSON 数组。示例：[{"Left":"(","FieldName":"Field1","Compare":"67","Value":"111","Right":")","Logic":"0"}]',
		} as INodeProperties,
		{
			displayName: '是否验证基础资料',
			name: 'isVerifyBaseDataField',
			type: 'boolean',
			default: true,
			description:
				'Whether to verify the validity of base data fields (IsVerifyBaseDataField)',
		} as INodeProperties,
		{
			displayName: 'Model 扩展（JSON）',
			name: 'modelExtraJson',
			type: 'json',
			default: '{}',
			description:
				'Model 中的额外字段，JSON 格式。会与上方结构化字段合并（同名字段以此为准），用于扩展或覆盖 Model',
		} as INodeProperties,
		queryOptions,
	],
	call: async function (index) {
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth();
		const firstDayOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
		const lastDayOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}`;

		const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
		const fieldKeys = this.getNodeParameter('fieldKeys', index, '') as string;

		const fAcctgSystemId = this.getNodeParameter('fAcctgSystemId', index, '') as string;
		const fAcctgOrgId = this.getNodeParameter('fAcctgOrgId', index, '') as string;
		const fAcctPolicyId = this.getNodeParameter('fAcctPolicyId', index, '') as string;
		const fBeginDateRaw = this.getNodeParameter('fBeginDate', index, '') as string;
		const fEndDateRaw = this.getNodeParameter('fEndDate', index, '') as string;
		const fPeriodStartDateRaw = this.getNodeParameter(
			'fPeriodStartDate',
			index,
			'',
		) as string;
		const fBeginDate = fBeginDateRaw.trim() || firstDayOfMonth;
		const fEndDate = fEndDateRaw.trim() || lastDayOfMonth;
		const fPeriodStartDate = fPeriodStartDateRaw.trim() || firstDayOfMonth;
		const fComboTotalType = this.getNodeParameter('fComboTotalType', index, '') as string;
		const fDimType = this.getNodeParameter('fDimType', index, '') as string;

		const optionalFilters = this.getNodeParameter('optionalFilters', index, {}) as Record<
			string,
			any
		>;

		const schemeId = this.getNodeParameter('schemeId', index, '') as string;
		const filterStringRaw = this.getNodeParameter('filterString', index, '[]') as
			| string
			| any[];
		const isVerifyBaseDataField = this.getNodeParameter(
			'isVerifyBaseDataField',
			index,
			true,
		) as boolean;
		const modelExtraJsonRaw = this.getNodeParameter('modelExtraJson', index, '{}') as
			| string
			| Record<string, any>;

		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;
		const transformData = options.transformData !== false;

		const modelExtra =
			typeof modelExtraJsonRaw === 'string'
				? modelExtraJsonRaw.trim()
					? JSON.parse(modelExtraJsonRaw)
					: {}
				: modelExtraJsonRaw || {};

		// 构建完整的 Model，始终发送全部字段（金蝶 API 要求完整结构）
		const model: Record<string, any> = {
			FACCTGSYSTEMID: toBaseDataObject(fAcctgSystemId),
			FACCTGORGID: toBaseDataObject(fAcctgOrgId),
			FACCTPOLICYID: toBaseDataObject(fAcctPolicyId),
			FBEGINDATE: fBeginDate,
			FENDDATE: fEndDate,
			FYear: optionalFilters.fYear ?? '',
			FPeriod: optionalFilters.fPeriod ?? '',
			FENDYEAR: optionalFilters.fEndYear ?? '',
			FEndPeriod: optionalFilters.fEndPeriod ?? '',
			FMATERIALID: toBaseDataObject(optionalFilters.fMaterialId ?? ''),
			FENDMATERIALID: toBaseDataObject(optionalFilters.fEndMaterialId ?? ''),
			FEXPENID: toBaseDataObject(optionalFilters.fExpenId ?? ''),
			FENDEXPENID: toBaseDataObject(optionalFilters.fEndExpenId ?? ''),
			FACCTGRANGEID: toBaseDataObject(optionalFilters.fAcctGrangeId ?? ''),
			FOwnerID: toBaseDataObject(optionalFilters.fOwnerId ?? ''),
			FSTOCKORGID: toBaseDataObject(optionalFilters.fStockOrgId ?? ''),
			FSTOCKSTATUSID: toBaseDataArray(optionalFilters.fStockStatusId ?? ''),
			FSTOCKId: toBaseDataObject(optionalFilters.fStockId ?? ''),
			FENDSTOCKID: toBaseDataObject(optionalFilters.fEndStockId ?? ''),
			FMATERTYPEID: {
				FNUMBER: ((optionalFilters.fMaterTypeId as string) ?? '').trim(),
			},
			FCOMBOTotalType: fComboTotalType,
			FDimType: fDimType,
			FCHXEXPENSE: String(optionalFilters.fChxExpense ?? false),
			FCHXTotal: String(optionalFilters.fChxTotal ?? false),
			FCHXNOINOUT: String(optionalFilters.fChxNoInOut ?? false),
			FCHXNOCOSTALLOT: String(optionalFilters.fChxNoCostAllot ?? false),
			FIsDisplayPeriod: String(optionalFilters.fIsDisplayPeriod ?? false),
			FCHXNOSTOCKADJ: String(optionalFilters.fChxNoStockAdj ?? false),
			FCOMBOSTATUS: optionalFilters.fComboStatus ?? '',
			FPeriodStartDate: fPeriodStartDate,
			FCURRENCYID: toBaseDataObject(optionalFilters.fCurrencyId ?? ''),
		};

		Object.assign(model, modelExtra);

		// 解析 FilterString
		let filterString: any[];
		if (typeof filterStringRaw === 'string') {
			const trimmed = filterStringRaw.trim();
			filterString = trimmed ? JSON.parse(trimmed) : [];
		} else {
			filterString = filterStringRaw ?? [];
		}

		const buildRequestData = (limit: number, start: number) => {
			const data: Record<string, any> = {
				FieldKeys: fieldKeys,
				StartRow: start,
				Limit: limit,
				IsVerifyBaseDataField: String(isVerifyBaseDataField),
				FilterString: filterString,
				Model: model,
			};
			if (schemeId) {
				data.SchemeId = schemeId;
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
				return transformArrayToObject(
					rows,
					fieldKeys.split(',').map((k) => k.trim()),
				);
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
			const limit = this.getNodeParameter('limit', index, 2000) as number;
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
