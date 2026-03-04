import { INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import { commonOptions } from '../../../help/utils/sharedOptions';

const FORM_ID = 'AP_Payable';

const operation: ResourceOperations = {
	name: '查看',
	value: 'view',
	description: '查看应付单详情 (View)',
	action: '查看应付单',
	order: 1,
	options: [
		{
			displayName: '查询方式',
			name: 'queryType',
			type: 'options',
			default: 'number',
			options: [
			{
				name: '按编码查询 (FNumber)',
				value: 'number',
				description: '使用单据编码 FNumber 字段查询',
			},
			{
				name: '按内码查询 (FID)',
				value: 'id',
				description: '使用表单内码 FID 字段查询',
			},
			],
			description: '选择查询应付单的方式',
		} as INodeProperties,
		{
			displayName: '应付单编码',
			name: 'number',
			type: 'string',
			default: '',
			required: true,
			displayOptions: {
				show: {
					queryType: ['number'],
				},
			},
			description: '应付单编码 FNumber，字符串类型',
		} as INodeProperties,
		{
			displayName: '应付单内码',
			name: 'id',
			type: 'string',
			default: '',
			required: true,
			displayOptions: {
				show: {
					queryType: ['id'],
				},
			},
			description: '应付单表单内码 FID，整数类型',
		} as INodeProperties,
		{
			displayName: '创建者组织内码',
			name: 'createOrgId',
			type: 'number',
			default: 0,
			description: '创建者组织内码 FID，非必须',
		} as INodeProperties,
		{
			displayName: '单据体按序号排序',
			name: 'isSortBySeq',
			type: 'boolean',
			default: false,
			description: 'Whether to sort by sequence number',
		} as INodeProperties,
		commonOptions,
	],
	call: async function (index) {
		const queryType = this.getNodeParameter('queryType', index) as string;
		const createOrgId = this.getNodeParameter('createOrgId', index, 0) as number;
		const isSortBySeq = this.getNodeParameter('isSortBySeq', index, false) as boolean;

		let number = '';
		let id = '';

		if (queryType === 'number') {
			number = this.getNodeParameter('number', index) as string;
		} else {
			id = this.getNodeParameter('id', index) as string;
		}

		const data = {
			CreateOrgId: createOrgId,
			Number: number,
			Id: id,
			IsSortBySeq: isSortBySeq,
		};

		return RequestUtils.call.call(this, 'DynamicFormService', 'View', [FORM_ID, data]);
	},
};

export default operation;
