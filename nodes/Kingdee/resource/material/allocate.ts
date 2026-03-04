import { INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import { commonOptions } from '../../../help/utils/sharedOptions';

const FORM_ID = 'BD_MATERIAL';

const operation: ResourceOperations = {
	name: '分配',
	value: 'allocate',
	description: '分配物料 (Allocate)',
	action: '分配物料',
	order: 12,
	options: [
		{
			displayName: '物料内码列表',
			name: 'pkIds',
			type: 'string',
			default: '',
			required: true,
			description: '物料内码列表，多个内码用逗号分隔，如：100001,100002,100003',
		} as INodeProperties,
		{
			displayName: '目标组织内码列表',
			name: 'tOrgIds',
			type: 'string',
			default: '',
			required: true,
			description: '目标组织内码列表，多个内码用逗号分隔，如：1,2,3',
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
		const pkIdsStr = this.getNodeParameter('pkIds', index) as string;
		const tOrgIdsStr = this.getNodeParameter('tOrgIds', index) as string;
		const networkCtrl = this.getNodeParameter('networkCtrl', index, false) as boolean;
		const ignoreInterationFlag = this.getNodeParameter('ignoreInterationFlag', index, true) as boolean;

		const pkIds = pkIdsStr.split(',').map((n) => n.trim()).filter((n) => n);
		const tOrgIds = tOrgIdsStr.split(',').map((n) => n.trim()).filter((n) => n).map(Number);

		const data = {
			PkIds: pkIds,
			TOrgIds: tOrgIds,
			NetworkCtrl: networkCtrl ? 'true' : 'false',
			IgnoreInterationFlag: ignoreInterationFlag ? 'true' : 'false',
		};

		return RequestUtils.call.call(this, 'DynamicFormService', 'Allocate', [FORM_ID, data]);
	},
};

export default operation;
