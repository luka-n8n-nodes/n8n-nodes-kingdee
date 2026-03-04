import { INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import { commonOptions } from '../../../help/utils/sharedOptions';

const FORM_ID = 'AR_RECEIVEBILL';

const operation: ResourceOperations = {
	name: '审核',
	value: 'audit',
	description: '审核收款单 (Audit)',
	action: '审核收款单',
	order: 7,
	options: [
		{
			displayName: '查询方式',
			name: 'queryType',
			type: 'options',
			default: 'number',
			options: [
				{
					name: '按编码审核 (FNumber)',
					value: 'number',
					description: '使用单据编码 FNumber 字段审核',
				},
				{
					name: '按内码审核 (FID)',
					value: 'id',
					description: '使用表单内码 FID 字段审核',
				},
			],
			description: '选择审核收款单的方式',
		} as INodeProperties,
		{
			displayName: '收款单编码',
			name: 'numbers',
			type: 'string',
			default: '',
			required: true,
			displayOptions: {
				show: {
					queryType: ['number'],
				},
			},
			description: '收款单编码 FNumber，多个编码用逗号分隔，如：No1,No2,No3',
		} as INodeProperties,
		{
			displayName: '收款单内码',
			name: 'ids',
			type: 'string',
			default: '',
			required: true,
			displayOptions: {
				show: {
					queryType: ['id'],
				},
			},
			description: '收款单表单内码 FID，多个内码用逗号分隔，如：100001,100002,100003',
		} as INodeProperties,
		{
			displayName: '创建者组织内码',
			name: 'createOrgId',
			type: 'number',
			default: 0,
			description: '创建者组织内码 FID，非必须',
		} as INodeProperties,
		{
			displayName: '使用者组织内码',
			name: 'useOrgId',
			type: 'number',
			default: 0,
			description: '使用者组织内码 FID，非必须',
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
		const queryType = this.getNodeParameter('queryType', index) as string;
		const createOrgId = this.getNodeParameter('createOrgId', index, 0) as number;
		const useOrgId = this.getNodeParameter('useOrgId', index, 0) as number;
		const networkCtrl = this.getNodeParameter('networkCtrl', index, false) as boolean;
		const ignoreInterationFlag = this.getNodeParameter('ignoreInterationFlag', index, true) as boolean;

		let numbers: string[] = [];
		let ids = '';

		if (queryType === 'number') {
			const numbersStr = this.getNodeParameter('numbers', index) as string;
			numbers = numbersStr.split(',').map((n) => n.trim()).filter((n) => n);
		} else {
			ids = this.getNodeParameter('ids', index) as string;
		}

		const data = {
			CreateOrgId: createOrgId,
			Numbers: numbers,
			Ids: ids,
			UseOrgId: useOrgId,
			NetworkCtrl: networkCtrl ? 'true' : 'false',
			IgnoreInterationFlag: ignoreInterationFlag ? 'true' : 'false',
		};

		return RequestUtils.call.call(this, 'DynamicFormService', 'Audit', [FORM_ID, data]);
	},
};

export default operation;
