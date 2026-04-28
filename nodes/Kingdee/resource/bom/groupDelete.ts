import { INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import { commonOptions } from '../../../help/utils/sharedOptions';

const FORM_ID = 'ENG_BOM';

const operation: ResourceOperations = {
	name: '分组删除',
	value: 'groupDelete',
	description: '删除物料清单分组 (GroupDelete)',
	action: '删除物料清单分组',
	order: 17,
	options: [
		{
			displayName: '分组字段标识',
			name: 'groupFieldKey',
			type: 'string',
			default: '',
			required: true,
			// description: '分组字段标识',
		} as INodeProperties,
		{
			displayName: '分组内码列表',
			name: 'pkIds',
			type: 'string',
			default: '',
			required: true,
			description: '分组内码列表，多个内码用逗号分隔',
		} as INodeProperties,
		commonOptions,
	],
	call: async function (index) {
		const groupFieldKey = this.getNodeParameter('groupFieldKey', index) as string;
		const pkIdsStr = this.getNodeParameter('pkIds', index) as string;

		const pkIds = pkIdsStr.split(',').map((n) => n.trim()).filter((n) => n);

		const data = {
			GroupFieldKey: groupFieldKey,
			PkIds: pkIds,
		};

		return RequestUtils.call.call(this, 'DynamicFormService', 'GroupDelete', [FORM_ID, data]);
	},
};

export default operation;
