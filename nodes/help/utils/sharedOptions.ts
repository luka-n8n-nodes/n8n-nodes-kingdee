import { INodeProperties } from 'n8n-workflow';

/**
 * 批处理选项
 * 用于控制并发请求的批次大小和间隔
 */
export const batchingOption: INodeProperties = {
	displayName: 'Batching',
	name: 'batching',
	placeholder: 'Add Batching',
	type: 'fixedCollection',
	typeOptions: {
		multipleValues: false,
	},
	default: {
		batch: {},
	},
	options: [
		{
			displayName: 'Batching',
			name: 'batch',
			values: [
				{
					displayName: 'Items per Batch',
					name: 'batchSize',
					type: 'number',
					typeOptions: {
						minValue: 1,
					},
					default: 50,
					description: '每批并发请求数量。添加此选项后启用并发模式。0 将被视为 1。',
				},
				{
					displayName: 'Batch Interval (Ms)',
					name: 'batchInterval',
					type: 'number',
					typeOptions: {
						minValue: 0,
					},
					default: 1000,
					description: '每批请求之间的时间（毫秒）。0 表示禁用。',
				},
			],
		},
	],
};

/**
 * 超时选项
 * 用于控制请求超时时间
 */
export const timeoutOption: INodeProperties = {
	displayName: 'Timeout',
	name: 'timeout',
	type: 'number',
	typeOptions: {
		minValue: 0,
	},
	default: 0,
	description:
		'等待服务器发送响应头（并开始响应体）的时间（毫秒），超过此时间将中止请求。0 表示不限制超时。',
};

/**
 * 自动转换数据选项
 * 将金蝶返回的数组格式转换为对象格式
 */
export const transformDataOption: INodeProperties = {
	displayName: 'Transform Data',
	name: 'transformData',
	type: 'boolean',
	default: true,
	description: 'Whether to transform array response to object format using field keys',
};

/**
 * 通用选项集合
 * 包含 Batching 和 Timeout 选项
 */
export const commonOptions: INodeProperties = {
	displayName: 'Options',
	name: 'options',
	type: 'collection',
	placeholder: 'Add option',
	default: {},
	options: [batchingOption, timeoutOption],
};

/**
 * 查询操作选项集合
 * 包含 Batching、Timeout 和 Transform Data 选项
 * 专用于 ExecuteBillQuery 等查询操作
 */
export const queryOptions: INodeProperties = {
	displayName: 'Options',
	name: 'options',
	type: 'collection',
	placeholder: 'Add option',
	default: {},
	options: [batchingOption, timeoutOption, transformDataOption],
};

/**
 * 获取选项的类型定义
 * 用于在操作函数中解析选项参数
 */
export interface ICommonOptionsValue {
	batching?: {
		batch?: {
			batchSize?: number;
			batchInterval?: number;
		};
	};
	timeout?: number;
	transformData?: boolean;
}

/**
 * 处理字段值，将空字符串转换为 null
 * @param value 原始值
 * @returns 处理后的值
 */
function normalizeValue(value: any): any {
	if (value === undefined) {
		return null;
	}
	// 如果是字符串且为空或只包含空格，返回 null
	if (typeof value === 'string' && value.trim() === '') {
		return null;
	}
	return value;
}

/**
 * 将数组数据转换为对象格式
 * @param data 金蝶返回的数组数据
 * @param fieldKeys 字段键数组
 * @returns 转换后的对象数组
 */
export function transformArrayToObject(data: any[], fieldKeys: string[]): Record<string, any>[] {
	if (!Array.isArray(data) || data.length === 0) {
		return [];
	}

	// 检查是否为二维数组（多条记录）
	if (Array.isArray(data[0])) {
		return data.map((row: any[]) => {
			const obj: Record<string, any> = {};
			fieldKeys.forEach((key, index) => {
				obj[key] = normalizeValue(row[index]);
			});
			return obj;
		});
	}

	// 单条记录（一维数组）
	const obj: Record<string, any> = {};
	fieldKeys.forEach((key, index) => {
		obj[key] = normalizeValue(data[index]);
	});
	return [obj];
}

/**
 * 分页参数选项（金蝶云星空）
 */
export const paginationOptions = {
	/**
	 * 返回所有结果选项
	 */
	returnAll: {
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	} as INodeProperties,

	/**
	 * 限制返回数量选项
	 * @param maxValue 最大值，默认 2000
	 */
	limit: (maxValue = 2000): INodeProperties => ({
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
			maxValue,
		},
		displayOptions: {
			show: {
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	}),

	/**
	 * 起始行号选项（金蝶分页）
	 */
	startRow: {
		displayName: '起始行号',
		name: 'StartRow',
		type: 'number',
		default: 0,
		description: '分页起始行号，从 0 开始',
	} as INodeProperties,
};
