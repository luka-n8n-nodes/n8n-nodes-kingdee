import { INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import { commonOptions } from '../../../help/utils/sharedOptions';

const FORM_ID = 'AR_RECEIVEBILL';

const operation: ResourceOperations = {
	name: '暂存',
	value: 'draft',
	description: '暂存收款单 (Draft)',
	action: '暂存收款单',
	order: 4,
	options: [
		{
			displayName: 'Model (JSON)',
			name: 'modelJson',
			type: 'json',
			default: '{}',
			required: true,
			description: '收款单数据模型 JSON，包含表单字段数据',
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
		const createOrgId = this.getNodeParameter('createOrgId', index, 0) as number;
		const networkCtrl = this.getNodeParameter('networkCtrl', index, false) as boolean;
		const ignoreInterationFlag = this.getNodeParameter('ignoreInterationFlag', index, true) as boolean;

		const model = typeof modelJson === 'string' ? JSON.parse(modelJson) : modelJson;

		const data = {
			Model: model,
			CreateOrgId: createOrgId,
			NetworkCtrl: networkCtrl ? 'true' : 'false',
			IgnoreInterationFlag: ignoreInterationFlag ? 'true' : 'false',
		};

		return RequestUtils.call.call(this, 'DynamicFormService', 'Draft', [FORM_ID, data]);
	},
};

export default operation;
