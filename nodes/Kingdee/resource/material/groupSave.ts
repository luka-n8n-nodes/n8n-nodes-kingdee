import { INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import { commonOptions } from '../../../help/utils/sharedOptions';

const FORM_ID = 'BD_MATERIAL';

const operation: ResourceOperations = {
	name: '分组保存',
	value: 'groupSave',
	description: '分组保存物料 (GroupSave)',
	action: '分组保存物料',
	order: 15,
	options: [
		{
			displayName: 'Model (JSON)',
			name: 'modelJson',
			type: 'json',
			default: '{}',
			required: true,
			description: '分组数据模型 JSON，包含分组信息',
		} as INodeProperties,
		{
			displayName: '分组字段标识',
			name: 'groupFieldKey',
			type: 'string',
			default: '',
			// description: '分组字段标识',
		} as INodeProperties,
		commonOptions,
	],
	call: async function (index) {
		const modelJson = this.getNodeParameter('modelJson', index, '{}') as string;
		const groupFieldKey = this.getNodeParameter('groupFieldKey', index, '') as string;

		const model = typeof modelJson === 'string' ? JSON.parse(modelJson) : modelJson;

		const data: Record<string, any> = {
			Model: model,
		};

		if (groupFieldKey) {
			data.GroupFieldKey = groupFieldKey;
		}

		return RequestUtils.call.call(this, 'DynamicFormService', 'GroupSave', [FORM_ID, data]);
	},
};

export default operation;
