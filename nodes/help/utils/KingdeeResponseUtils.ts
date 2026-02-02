import { LanguageCode } from '../type/enums';

/**
 * 金蝶响应数据处理工具类
 * 用于处理金蝶云星空 API 返回的特殊数据格式
 */
class KingdeeResponseUtils {
	/**
	 * 递归处理结果中的特殊格式（如日期、多语言字段）
	 * @param data 原始数据
	 * @param lcid 语言代码，默认简体中文
	 * @returns 处理后的数据
	 */
	static normalizeResult(data: any, lcid: number = LanguageCode.SimplifiedChinese): any {
		if (data === null || data === undefined) return data;

		if (Array.isArray(data)) {
			// 处理金蝶特有的多语言数组格式: [{ Key: 2052, Value: "..." }]
			if (
				data.length > 0 &&
				typeof data[0] === 'object' &&
				'Key' in data[0] &&
				'Value' in data[0]
			) {
				const match = data.find((item) => item.Key === lcid) || data[0];
				return this.normalizeResult(match.Value, lcid);
			}
			return data.map((item) => this.normalizeResult(item, lcid));
		}

		if (typeof data === 'object') {
			// 处理嵌套的多语言结构
			if ('Key' in data && 'Value' in data) {
				return this.normalizeResult(data.Value, lcid);
			}

			const newData: Record<string, any> = {};
			for (const key in data) {
				if (Object.prototype.hasOwnProperty.call(data, key)) {
					newData[key] = this.normalizeResult(data[key], lcid);
				}
			}
			return newData;
		}

		if (typeof data === 'string') {
			// 匹配 /Date(123123123)/ 格式
			const dateMatch = data.match(/^\/Date\((-?\d+)\)\/$/);
			if (dateMatch) {
				const timestamp = parseInt(dateMatch[1], 10);
				return new Date(timestamp).toISOString();
			}
		}

		return data;
	}

	/**
	 * 会话丢失错误关键词列表
	 * 金蝶云星空没有明确的会话过期状态码，需要通过消息文本判断
	 */
	private static readonly SESSION_LOST_KEYWORDS = [
		'会话信息已丢失',
		'会话已过期',
		'会话失效',
		'登录已过期',
		'登录已失效',
		'请重新登录',
		'session lost',
		'session expired',
		'session invalid',
	];

	/**
	 * 检查消息是否包含会话丢失关键词
	 * @param message 消息文本
	 * @returns 是否包含会话丢失关键词
	 */
	private static containsSessionLostKeyword(message: string): boolean {
		const lowerMessage = message.toLowerCase();
		return this.SESSION_LOST_KEYWORDS.some((keyword) =>
			lowerMessage.includes(keyword.toLowerCase()),
		);
	}

	/**
	 * 检查 ResponseStatus 中是否包含会话丢失错误
	 * @param responseStatus ResponseStatus 对象
	 * @returns 是否包含会话丢失错误
	 */
	private static checkResponseStatusForSessionLost(responseStatus: any): boolean {
		if (!responseStatus) return false;

		// 检查 Errors 数组
		const errors = responseStatus.Errors;
		if (Array.isArray(errors) && errors.length > 0) {
			for (const error of errors) {
				if (error.Message && this.containsSessionLostKeyword(error.Message)) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * 检查是否为会话丢失错误
	 * @param result API 响应结果
	 * @returns 是否会话丢失
	 */
	static isSessionLost(result: any): boolean {
		// 检查金蝶验证错误格式（数组形式）
		// 格式: [{"FieldName":null,"Message":"会话信息已丢失，请重新登录","DIndex":0}]
		if (Array.isArray(result) && result.length > 0) {
			const firstItem = result[0];

			// 金蝶验证错误格式：包含 FieldName、Message、DIndex 字段
			if (
				firstItem &&
				typeof firstItem === 'object' &&
				'Message' in firstItem &&
				'DIndex' in firstItem &&
				typeof firstItem.Message === 'string'
			) {
				if (this.containsSessionLostKeyword(firstItem.Message)) {
					return true;
				}
			}

			// 二维数组格式：[[{Result:{ResponseStatus:{...}}}, null, ...]]
			// ExecuteBillQuery 返回的错误格式
			if (Array.isArray(firstItem) && firstItem.length > 0) {
				const innerFirst = firstItem[0];
				if (innerFirst?.Result?.ResponseStatus) {
					if (this.checkResponseStatusForSessionLost(innerFirst.Result.ResponseStatus)) {
						return true;
					}
				}
			}

			// 一维数组中第一个元素包含 Result.ResponseStatus
			// 格式: [{Result:{ResponseStatus:{Errors:[...]}}}]
			if (firstItem?.Result?.ResponseStatus) {
				if (this.checkResponseStatusForSessionLost(firstItem.Result.ResponseStatus)) {
					return true;
				}
			}
		}

		// 检查对象形式的会话丢失错误
		if (result && typeof result === 'object' && !Array.isArray(result)) {
			// 直接包含 Message 字段
			if ('Message' in result && typeof result.Message === 'string') {
				if (this.containsSessionLostKeyword(result.Message)) {
					return true;
				}
			}

			// ResponseStatus 中的错误（直接在 result.Result 下）
			if (result.Result?.ResponseStatus) {
				if (this.checkResponseStatusForSessionLost(result.Result.ResponseStatus)) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * 检查金蝶 API 响应是否成功
	 * @param result API 响应结果
	 * @returns 是否成功
	 */
	static isSuccess(result: any): boolean {
		// 检查登录响应
		if ('LoginResultType' in result) {
			return result.LoginResultType === 1;
		}

		// 检查是否会话丢失（优先检查，因为会话丢失时需要特殊处理）
		if (this.isSessionLost(result)) {
			return false;
		}

		// 检查常规 API 响应
		if (result.Result?.ResponseStatus) {
			return result.Result.ResponseStatus.IsSuccess === true;
		}

		// 检查数组形式的响应
		if (Array.isArray(result) && result.length > 0) {
			const firstItem = result[0];

			// 一维数组：[{Result:{ResponseStatus:{...}}}]
			if (firstItem?.Result?.ResponseStatus) {
				return firstItem.Result.ResponseStatus.IsSuccess === true;
			}

			// 二维数组：[[{Result:{ResponseStatus:{...}}}, null, ...]]
			// ExecuteBillQuery 返回的格式
			if (Array.isArray(firstItem) && firstItem.length > 0) {
				const innerFirst = firstItem[0];
				if (innerFirst?.Result?.ResponseStatus) {
					return innerFirst.Result.ResponseStatus.IsSuccess === true;
				}
			}
		}

		return true;
	}

	/**
	 * 从 ResponseStatus 中提取错误信息
	 * @param responseStatus ResponseStatus 对象
	 * @returns 错误信息字符串或 null
	 */
	private static extractErrorsFromResponseStatus(responseStatus: any): string | null {
		if (!responseStatus) return null;

		const errors = responseStatus.Errors;
		if (Array.isArray(errors) && errors.length > 0) {
			// 提取所有错误消息
			const messages = errors
				.map((e: any) => e.Message)
				.filter((m: string) => m)
				.join('; ');
			return messages || JSON.stringify(errors);
		}

		return null;
	}

	/**
	 * 提取金蝶 API 响应中的错误信息
	 * @param result API 响应结果
	 * @returns 错误信息字符串
	 */
	static extractErrorMessage(result: any): string {
		// 登录错误
		if ('LoginResultType' in result && result.LoginResultType !== 1) {
			let errorMsg = result.Message || JSON.stringify(result);

			// 智能诊断建议
			if (result.MessageCode === '002005000003016') {
				errorMsg +=
					'\n💡 诊断建议: 签名不匹配。请尝试在金蝶管理中心重置 AppSecret，并检查 appId 是否完整（包含下划线）。';
			} else if (result.Message && result.Message.includes('次数超限')) {
				errorMsg +=
					'\n💡 诊断建议: 登录失败次数超限。该用户可能已被临时锁定，请联系管理员在金蝶"用户管理"中解锁，或等待 30 分钟。';
			}

			return errorMsg;
		}

		// 常规 API 错误（对象形式）
		if (result.Result?.ResponseStatus) {
			const msg = this.extractErrorsFromResponseStatus(result.Result.ResponseStatus);
			if (msg) return msg;
		}

		// 数组形式的错误
		if (Array.isArray(result) && result.length > 0) {
			const firstItem = result[0];

			// 一维数组：[{Result:{ResponseStatus:{...}}}]
			if (firstItem?.Result?.ResponseStatus) {
				const msg = this.extractErrorsFromResponseStatus(firstItem.Result.ResponseStatus);
				if (msg) return msg;
			}

			// 二维数组：[[{Result:{ResponseStatus:{...}}}, null, ...]]
			if (Array.isArray(firstItem) && firstItem.length > 0) {
				const innerFirst = firstItem[0];
				if (innerFirst?.Result?.ResponseStatus) {
					const msg = this.extractErrorsFromResponseStatus(innerFirst.Result.ResponseStatus);
					if (msg) return msg;
				}
			}

			// 金蝶验证错误格式：[{FieldName, Message, DIndex}]
			if (firstItem && 'Message' in firstItem && 'DIndex' in firstItem) {
				return firstItem.Message || JSON.stringify(firstItem);
			}
		}

		// 直接包含 Message 字段的对象
		if (result && typeof result === 'object' && 'Message' in result) {
			return result.Message || JSON.stringify(result);
		}

		return '未知错误';
	}

	/**
	 * 提取金蝶 API 响应中的实际数据
	 * @param result API 响应结果
	 * @returns 实际数据
	 */
	static extractData(result: any): any {
		return result.Result?.Result || result.Result || result;
	}
}

export default KingdeeResponseUtils;
