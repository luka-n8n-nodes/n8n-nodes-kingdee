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
			displayName: '分组字段Key',
			name: 'groupFieldKey',
			type: 'string',
			default: '',
			description: '不填时取默认，无默认，取第一个分组',
		} as INodeProperties,
		{
			displayName: '分组内码',
			name: 'groupPkIds',
			type: 'string',
			default: '',
			description: '格式："Id1,Id2,..."（使用分组内码时必录，分组内码和单据内码同时录时，分组内码优先）',
		} as INodeProperties,
		{
			displayName: '单据内码集合',
			name: 'ids',
			type: 'string',
			default: '',
			description: '格式："Id1,Id2,..."（使用内码时必录）',
		} as INodeProperties,
		commonOptions,
	],
	call: async function (index) {
		const groupFieldKey = this.getNodeParameter('groupFieldKey', index, '') as string;
		const groupPkIds = this.getNodeParameter('groupPkIds', index, '') as string;
		const ids = this.getNodeParameter('ids', index, '') as string;

		const data: Record<string, any> = {
			FormId: FORM_ID,
		};

		if (groupFieldKey) {
			data.GroupFieldKey = groupFieldKey;
		}
		if (groupPkIds) {
			data.GroupPkIds = groupPkIds;
		}
		if (ids) {
			data.Ids = ids;
		}

		const result = await RequestUtils.call.call(this, 'DynamicFormService', 'QueryGroupInfo', [JSON.stringify(data)]);
		return result?.NeedReturnData ?? result
	},
};

export default operation;
