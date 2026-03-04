import { INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import { commonOptions } from '../../../help/utils/sharedOptions';

const FORM_ID = 'AR_RECEIVEBILL';

const operation: ResourceOperations = {
	name: '下推',
	value: 'push',
	description: '下推收款单 (Push)',
	action: '下推收款单',
	order: 10,
	options: [
		{
			displayName: '查询方式',
			name: 'queryType',
			type: 'options',
			default: 'number',
			options: [
				{
					name: '按编码下推 (FNumber)',
					value: 'number',
					description: '使用单据编码 FNumber 字段下推',
				},
				{
					name: '按内码下推 (FID)',
					value: 'id',
					description: '使用表单内码 FID 字段下推',
				},
			],
			description: '选择下推收款单的方式',
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
			description: '收款单编码 FNumber，多个编码用逗号分隔',
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
			description: '收款单表单内码 FID，多个内码用逗号分隔',
		} as INodeProperties,
		{
			displayName: '目标单据FormId',
			name: 'targetFormId',
			type: 'string',
			default: '',
			required: true,
			description: '下推生成的目标单据FormId',
		} as INodeProperties,
		{
			displayName: '使用默认转换规则',
			name: 'isEnableDefaultRule',
			type: 'boolean',
			default: true,
			description: 'Whether to use the default conversion rule',
		} as INodeProperties,
		{
			displayName: '转换规则内码',
			name: 'ruleId',
			type: 'string',
			default: '',
			description: '转换规则内码，非必须。如不填写则使用默认转换规则',
		} as INodeProperties,
		{
			displayName: '目标组织内码',
			name: 'targetOrgId',
			type: 'number',
			default: 0,
			description: '目标组织内码，非必须',
		} as INodeProperties,
		commonOptions,
	],
	call: async function (index) {
		const queryType = this.getNodeParameter('queryType', index) as string;
		const targetFormId = this.getNodeParameter('targetFormId', index) as string;
		const isEnableDefaultRule = this.getNodeParameter('isEnableDefaultRule', index, true) as boolean;
		const ruleId = this.getNodeParameter('ruleId', index, '') as string;
		const targetOrgId = this.getNodeParameter('targetOrgId', index, 0) as number;

		let numbers: string[] = [];
		let ids = '';

		if (queryType === 'number') {
			const numbersStr = this.getNodeParameter('numbers', index) as string;
			numbers = numbersStr.split(',').map((n) => n.trim()).filter((n) => n);
		} else {
			ids = this.getNodeParameter('ids', index) as string;
		}

		const data: Record<string, any> = {
			Numbers: numbers,
			Ids: ids,
			TargetFormId: targetFormId,
			IsEnableDefaultRule: isEnableDefaultRule ? 'true' : 'false',
		};

		if (ruleId) {
			data.RuleId = ruleId;
		}
		if (targetOrgId) {
			data.TargetOrgId = targetOrgId;
		}

		return RequestUtils.call.call(this, 'DynamicFormService', 'Push', [FORM_ID, data]);
	},
};

export default operation;
