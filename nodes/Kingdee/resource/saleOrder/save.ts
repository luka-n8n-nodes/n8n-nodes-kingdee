import { INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import { commonOptions } from '../../../help/utils/sharedOptions';

const FORM_ID = 'SAL_SaleOrder';

const operation: ResourceOperations = {
	name: '保存',
	value: 'save',
	description: '保存销售订单 (Save)',
	action: '保存销售订单',
	order: 3,
	options: [
		{
			displayName: '销售订单数据 (Model)',
			name: 'modelJson',
			type: 'json',
			default: '{}',
			required: true,
			description:
				'销售订单的表单数据，可直接填写 JSON，也可切换为表达式直接传入上游节点的对象。带 FID 为修改（明细行需带 FEntryID），不带 FID 为新增。示例：{"FBillTypeID":{"FNUMBER":"XSDD01_SYS"},"FDate":"2026-10-29","FSaleOrgId":{"FNumber":"100"},"FCustId":{"FNumber":"CUST0001"},"FSaleOrderEntry":[{"FMaterialId":{"FNumber":"M001"},"FUnitID":{"FNumber":"Pcs"},"FQty":10,"FTaxPrice":100}]}',
		} as INodeProperties,
		{
			displayName: '需要更新的字段',
			name: 'needUpDateFields',
			type: 'string',
			default: '',
			description: '需要更新的字段列表（NeedUpDateFields），多个字段用逗号分隔。留空则更新所有字段',
		} as INodeProperties,
		{
			displayName: '创建者组织内码',
			name: 'createOrgId',
			type: 'number',
			default: 0,
			description: '创建者组织内码 FID，非必须',
		} as INodeProperties,
		{
			displayName: '启用网控',
			name: 'networkCtrl',
			type: 'boolean',
			default: false,
			description: 'Whether to enable network control',
		} as INodeProperties,
		{
			displayName: '忽略交互',
			name: 'ignoreInterationFlag',
			type: 'boolean',
			default: true,
			description: 'Whether to ignore interaction prompts',
		} as INodeProperties,
		commonOptions,
	],
	call: async function (index) {
		const modelJson = this.getNodeParameter('modelJson', index, '{}') as string;
		const needUpDateFieldsStr = this.getNodeParameter('needUpDateFields', index, '') as string;
		const createOrgId = this.getNodeParameter('createOrgId', index, 0) as number;
		const networkCtrl = this.getNodeParameter('networkCtrl', index, false) as boolean;
		const ignoreInterationFlag = this.getNodeParameter('ignoreInterationFlag', index, true) as boolean;

		const model = typeof modelJson === 'string' ? JSON.parse(modelJson) : modelJson;

		const needUpDateFields = needUpDateFieldsStr
			? needUpDateFieldsStr.split(',').map((f) => f.trim()).filter((f) => f)
			: [];

		const data: Record<string, any> = {
			Model: model,
			CreateOrgId: createOrgId,
			NetworkCtrl: networkCtrl ? 'true' : 'false',
			IgnoreInterationFlag: ignoreInterationFlag ? 'true' : 'false',
		};

		if (needUpDateFields.length > 0) {
			data.NeedUpDateFields = needUpDateFields;
		}

		return RequestUtils.call.call(this, 'DynamicFormService', 'Save', [FORM_ID, data]);
	},
};

export default operation;
