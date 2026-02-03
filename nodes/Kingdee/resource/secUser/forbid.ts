import { INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import { commonOptions } from '../../../help/utils/sharedOptions';

/**
 * 系统用户表单ID
 */
const FORM_ID = 'SEC_User';

/**
 * 禁用系统用户操作定义
 */
const operation: ResourceOperations = {
	name: '禁用',
	value: 'forbid',
	description: '禁用系统用户账户 (Forbid)',
	action: '禁用系统用户',
	order: 2,
	options: [
		{
			displayName: '查询方式',
			name: 'queryType',
			type: 'options',
			default: 'number',
			options: [
				{
					name: '按编码禁用 (FNumber)',
					value: 'number',
					description: '使用用户编码 FNumber 字段禁用',
				},
				{
					name: '按内码禁用 (FUserID)',
					value: 'id',
					description: '使用用户内码 FUserID 字段禁用',
				},
			],
			description: '选择禁用系统用户的方式',
		} as INodeProperties,
		{
			displayName: '用户编码',
			name: 'numbers',
			type: 'string',
			default: '',
			required: true,
			displayOptions: {
				show: {
					queryType: ['number'],
				},
			},
			description: '用户编码 FNumber，多个编码用逗号分隔，如：user1,user2,user3',
		} as INodeProperties,
		{
			displayName: '用户内码',
			name: 'ids',
			type: 'string',
			default: '',
			required: true,
			displayOptions: {
				show: {
					queryType: ['id'],
				},
			},
			description: '用户内码 FUserID，多个内码用逗号分隔，如：100001,100002,100003',
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

		// 根据查询方式获取参数
		let numbers: string[] = [];
		let ids = '';

		if (queryType === 'number') {
			const numbersStr = this.getNodeParameter('numbers', index) as string;
			numbers = numbersStr.split(',').map((n) => n.trim()).filter((n) => n);
		} else {
			ids = this.getNodeParameter('ids', index) as string;
		}

		// 构建请求参数
		const data = {
			CreateOrgId: createOrgId,
			Numbers: numbers,
			Ids: ids,
			UseOrgId: useOrgId,
			NetworkCtrl: networkCtrl ? 'true' : 'false',
			IgnoreInterationFlag: ignoreInterationFlag ? 'true' : 'false',
		};

		// 调用金蝶 WebAPI 通用操作接口
		// 使用 ExecuteOperation 接口，opNumber 为 'Disable' 表示禁用操作
		return RequestUtils.call.call(this, 'DynamicFormService', 'ExecuteOperation', [FORM_ID, 'Disable', data]);
	},
};

export default operation;
