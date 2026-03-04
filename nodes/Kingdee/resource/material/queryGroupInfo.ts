import { INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import { commonOptions } from '../../../help/utils/sharedOptions';

const FORM_ID = 'BD_MATERIAL';

const operation: ResourceOperations = {
	name: '分组信息查询',
	value: 'queryGroupInfo',
	description: '查询物料分组信息 (QueryGroupInfo)',
	action: '查询物料分组信息',
	order: 16,
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
			displayName: '查询方式',
			name: 'queryType',
			type: 'options',
			default: 'id',
			options: [
				{
					name: '按内码查询',
					value: 'id',
					description: '使用内码列表查询分组信息',
				},
				{
					name: '按过滤条件查询',
					value: 'filter',
					description: '使用过滤条件查询分组信息',
				},
			],
			description: '选择查询分组信息的方式',
		} as INodeProperties,
		{
			displayName: '内码列表',
			name: 'ids',
			type: 'string',
			default: '',
			required: true,
			displayOptions: {
				show: {
					queryType: ['id'],
				},
			},
			description: '内码列表，多个内码用逗号分隔',
		} as INodeProperties,
		{
			displayName: '过滤条件',
			name: 'filterString',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					queryType: ['filter'],
				},
			},
			description: '过滤条件，支持 SQL 语法',
		} as INodeProperties,
		commonOptions,
	],
	call: async function (index) {
		const groupFieldKey = this.getNodeParameter('groupFieldKey', index) as string;
		const queryType = this.getNodeParameter('queryType', index) as string;

		const data: Record<string, any> = {
			GroupFieldKey: groupFieldKey,
		};

		if (queryType === 'id') {
			const idsStr = this.getNodeParameter('ids', index) as string;
			data.Ids = idsStr.split(',').map((n) => n.trim()).filter((n) => n);
		} else {
			data.FilterString = this.getNodeParameter('filterString', index, '') as string;
		}

		return RequestUtils.call.call(this, 'DynamicFormService', 'QueryGroupInfo', [FORM_ID, data]);
	},
};

export default operation;
