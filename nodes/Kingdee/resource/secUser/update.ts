import { INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import RequestUtils from '../../../help/utils/RequestUtils';
import { commonOptions } from '../../../help/utils/sharedOptions';

/**
 * 系统用户表单ID
 */
const FORM_ID = 'SEC_User';

/**
 * 系统用户可更新字段选项（包含自定义字段选项）
 */
const SEC_USER_UPDATE_FIELD_OPTIONS = [
	{ name: '用户名称 (FName)', value: 'FName' },
	{ name: '用户账号 (FUserAccount)', value: 'FUserAccount' },
	{ name: '组织内码 (FOrgId)', value: 'FOrgId' },
	{ name: '手机号码 (FPhone)', value: 'FPhone' },
	{ name: '邮箱 (FEmail)', value: 'FEmail' },
	{ name: '关联员工内码 (FLinkObject)', value: 'FLinkObject' },
	{ name: '备注 (FDescription)', value: 'FDescription' },
	{ name: '── 自定义字段 ──', value: '__custom__' },
];

/**
 * NeedUpDateFields 字段选项（包含自定义字段选项）
 */
const NEED_UPDATE_FIELD_OPTIONS = [
	{ name: '用户名称 (FName)', value: 'FName' },
	{ name: '用户账号 (FUserAccount)', value: 'FUserAccount' },
	{ name: '组织内码 (FOrgId)', value: 'FOrgId' },
	{ name: '手机号码 (FPhone)', value: 'FPhone' },
	{ name: '邮箱 (FEmail)', value: 'FEmail' },
	{ name: '关联员工内码 (FLinkObject)', value: 'FLinkObject' },
	{ name: '备注 (FDescription)', value: 'FDescription' },
	{ name: '── 自定义字段 ──', value: '__custom__' },
];

/**
 * 修改系统用户操作定义
 */
const operation: ResourceOperations = {
	name: '修改',
	value: 'update',
	description: '修改系统用户信息 (Save)',
	action: '修改系统用户',
	order: 4,
	options: [
		{
			displayName: '用户内码',
			name: 'userId',
			type: 'string',
			default: '',
			required: true,
			description: '要修改的用户内码 FUserID',
		} as INodeProperties,
		{
			displayName: '更新字段',
			name: 'updateFields',
			type: 'fixedCollection',
			typeOptions: {
				multipleValues: true,
			},
			default: {},
			description: '选择要更新的字段和值',
			options: [
				{
					name: 'fields',
					displayName: '字段',
					values: [
						{
							displayName: '字段名',
							name: 'fieldName',
							type: 'options',
							options: SEC_USER_UPDATE_FIELD_OPTIONS,
							default: 'FName',
							description: '选择要更新的字段',
						},
						{
							displayName: '自定义字段名',
							name: 'customFieldName',
							type: 'string',
							default: '',
							displayOptions: {
								show: {
									fieldName: ['__custom__'],
								},
							},
							description: '输入自定义字段名，如：FCustomField',
						},
						{
							displayName: '字段值',
							name: 'fieldValue',
							type: 'string',
							default: '',
							description: '字段的新值',
						},
					],
				},
			],
		} as INodeProperties,
		{
			displayName: '指定更新字段',
			name: 'needUpdateFields',
			type: 'multiOptions',
			options: NEED_UPDATE_FIELD_OPTIONS,
			default: [],
			description:
				'需要更新的字段列表（NeedUpDateFields）。留空则自动根据上方填写的字段生成',
		} as INodeProperties,
		{
			displayName: '自定义更新字段',
			name: 'customNeedUpdateFields',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					needUpdateFields: ['__custom__'],
				},
			},
			description:
				'自定义更新字段名，多个字段用逗号分隔。示例：FCustomField1,FCustomField2',
		} as INodeProperties,
		{
			displayName: '禁用网控',
			name: 'disableNetworkCtrl',
			type: 'boolean',
			default: true,
			description:
				'Whether to disable network control. When enabled, can avoid "business operation conflict" errors.',
		} as INodeProperties,
		commonOptions,
	],
	call: async function (index) {
		const userId = this.getNodeParameter('userId', index) as string;
		const updateFieldsData = this.getNodeParameter('updateFields', index, {}) as {
			fields?: Array<{
				fieldName: string;
				customFieldName?: string;
				fieldValue: string;
			}>;
		};
		const needUpdateFieldsSelected = this.getNodeParameter('needUpdateFields', index, []) as string[];
		const customNeedUpdateFields = this.getNodeParameter('customNeedUpdateFields', index, '') as string;
		const disableNetworkCtrl = this.getNodeParameter('disableNetworkCtrl', index, true) as boolean;

		// 构建 Model 对象
		const model: Record<string, any> = {
			FUserID: userId,
		};

		// 自动收集需要更新的字段
		const autoUpdateFields: string[] = [];

		// 处理更新字段
		if (updateFieldsData.fields && Array.isArray(updateFieldsData.fields)) {
			for (const field of updateFieldsData.fields) {
				let fieldName = field.fieldName;

				// 如果是自定义字段，使用自定义字段名
				if (fieldName === '__custom__' && field.customFieldName) {
					fieldName = field.customFieldName.trim();
				}

				// 跳过无效字段名
				if (!fieldName || fieldName === '__custom__') {
					continue;
				}

				// 设置字段值（允许空字符串作为有效值）
				model[fieldName] = field.fieldValue;
				if (!autoUpdateFields.includes(fieldName)) {
					autoUpdateFields.push(fieldName);
				}
			}
		}

		// 处理 NeedUpDateFields
		let needUpdateFields: string[] = [];

		// 从多选中获取字段（排除 __custom__ 占位符）
		if (needUpdateFieldsSelected && needUpdateFieldsSelected.length > 0) {
			needUpdateFields = needUpdateFieldsSelected.filter((f) => f !== '__custom__');

			// 如果选择了自定义字段，解析自定义更新字段
			if (needUpdateFieldsSelected.includes('__custom__') && customNeedUpdateFields) {
				const customFields = customNeedUpdateFields
					.split(',')
					.map((f) => f.trim())
					.filter((f) => f);
				needUpdateFields.push(...customFields);
			}
		}

		// 如果未指定更新字段，则使用自动收集的字段
		if (needUpdateFields.length === 0) {
			needUpdateFields = autoUpdateFields;
		}

		// 去重
		needUpdateFields = [...new Set(needUpdateFields)];

		// 构建请求数据
		const data = {
			Model: model,
			NeedUpDateFields: needUpdateFields,
			NetworkCtrl: disableNetworkCtrl ? 'false' : 'true',
		};

		// 调用金蝶 WebAPI Save 接口
		return RequestUtils.call.call(this, 'DynamicFormService', 'Save', [FORM_ID, data]);
	},
};

export default operation;
