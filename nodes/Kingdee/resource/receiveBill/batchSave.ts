import { INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import { commonOptions } from '../../../help/utils/sharedOptions';

const FORM_ID = 'AR_RECEIVEBILL';

const operation: ResourceOperations = {
	name: '批量保存',
	value: 'batchSave',
	description: '批量保存收款单 (BatchSave)',
	action: '批量保存收款单',
	order: 12,
	options: [
		{
			displayName: 'Model (JSON)',
			name: 'modelJson',
			type: 'json',
			default: '{}',
			required: true,
			description: '批量收款单数据模型 JSON，包含多条记录的表单字段数据',
		} as INodeProperties,
		{
			displayName: '需要更新的字段',
			name: 'needUpDateFields',
			type: 'string',
			default: '',
			description: '需要更新的字段列表（NeedUpDateFields），多个字段用逗号分隔。留空则更新所有字段',
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
		const networkCtrl = this.getNodeParameter('networkCtrl', index, false) as boolean;
		const ignoreInterationFlag = this.getNodeParameter('ignoreInterationFlag', index, true) as boolean;

		const model = typeof modelJson === 'string' ? JSON.parse(modelJson) : modelJson;

		const needUpDateFields = needUpDateFieldsStr
			? needUpDateFieldsStr.split(',').map((f) => f.trim()).filter((f) => f)
			: [];

		const data: Record<string, any> = {
			Model: model,
			NetworkCtrl: networkCtrl ? 'true' : 'false',
			IgnoreInterationFlag: ignoreInterationFlag ? 'true' : 'false',
		};

		if (needUpDateFields.length > 0) {
			data.NeedUpDateFields = needUpDateFields;
		}

		return RequestUtils.call.call(this, 'DynamicFormService', 'BatchSave', [FORM_ID, data]);
	},
};

export default operation;
