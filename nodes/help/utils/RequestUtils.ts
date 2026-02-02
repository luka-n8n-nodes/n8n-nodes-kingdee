import { IExecuteFunctions, IHttpRequestOptions, JsonObject, NodeApiError } from 'n8n-workflow';
import { Credentials } from '../type/enums';
import KingdeeResponseUtils from './KingdeeResponseUtils';

/**
 * 金蝶 API 请求工具类
 */
class RequestUtils {
	/**
	 * 获取金蝶 API 的完整 URL
	 * @param host API 域名
	 * @param serviceName 服务名称
	 * @param module 模块名称，默认 AuthService
	 * @returns 完整的 API URL
	 */
	static getApiUrl(host: string, serviceName: string, module = 'AuthService'): string {
		const baseHost = host.endsWith('/') ? host.slice(0, -1) : host;
		return `${baseHost}/Kingdee.BOS.WebApi.ServicesStub.${module}.${serviceName}.common.kdsvc`;
	}

	/**
	 * 原始请求方法
	 * @param options HTTP 请求选项
	 * @param clearCookie 是否清除 Cookie 重新登录
	 */
	static async originRequest(
		this: IExecuteFunctions,
		options: IHttpRequestOptions,
		clearCookie = false,
	) {
		const authenticationMethod = this.getNodeParameter(
			'authentication',
			0,
			Credentials.KingdeeAppAuthApi,
		) as string;

		const credentials = await this.getCredentials(authenticationMethod);
		options.baseURL = credentials.host as string;

		const additionalCredentialOptions = {
			credentialsDecrypted: {
				id: Credentials.Id,
				name: authenticationMethod,
				type: Credentials.Type,
				data: {
					...credentials,
					cookie: clearCookie ? '' : credentials.cookie,
				},
			},
		};

		return this.helpers.httpRequestWithAuthentication.call(
			this,
			authenticationMethod,
			options,
			additionalCredentialOptions,
		);
	}

	/**
	 * 会话丢失错误类，用于触发自动重试
	 */
	private static SessionLostError = class extends Error {
		constructor(message: string) {
			super(message);
			this.name = 'SessionLostError';
		}
	};

	/**
	 * 处理金蝶 API 响应
	 * @param res API 响应
	 * @param lcid 语言代码
	 * @param throwSessionLost 是否抛出会话丢失错误（用于触发重试）
	 */
	private static processResponse(res: any, lcid?: number, throwSessionLost = true) {
		// 对于二进制数据，直接返回
		if (res instanceof Buffer || res instanceof ArrayBuffer || res instanceof Uint8Array) {
			return res;
		}

		// 检查是否会话丢失，抛出特殊错误用于触发重试
		if (throwSessionLost && KingdeeResponseUtils.isSessionLost(res)) {
			const errorMsg = KingdeeResponseUtils.extractErrorMessage(res);
			throw new RequestUtils.SessionLostError(errorMsg);
		}

		// 检查是否成功
		if (!KingdeeResponseUtils.isSuccess(res)) {
			const errorMsg = KingdeeResponseUtils.extractErrorMessage(res);
			throw new Error(`金蝶 API 错误: ${errorMsg}`);
		}

		// 提取并标准化数据
		const data = KingdeeResponseUtils.extractData(res);
		return KingdeeResponseUtils.normalizeResult(data, lcid);
	}

	/**
	 * 发起金蝶 API 请求
	 * @param options HTTP 请求选项
	 */
	static async request(this: IExecuteFunctions, options: IHttpRequestOptions) {
		if (options.json === undefined) options.json = true;

		const authenticationMethod = this.getNodeParameter(
			'authentication',
			0,
			Credentials.KingdeeAppAuthApi,
		) as string;
		const credentials = await this.getCredentials(authenticationMethod);
		const lcid = credentials.lcid as number;

		return RequestUtils.originRequest
			.call(this, options)
			.then((res) => RequestUtils.processResponse(res, lcid))
			.catch(async (error) => {
				// 检查是否为会话丢失错误，自动重新登录
				if (error instanceof RequestUtils.SessionLostError) {
					this.logger.info('会话已过期，正在自动重新登录...');
					return RequestUtils.originRequest
						.call(this, options, true)
						.then((res) => RequestUtils.processResponse(res, lcid, false));
				}

				// 尝试解析错误响应
				if (error.context?.data) {
					let errorData: any = {};

					if (error.context.data.LoginResultType !== undefined) {
						errorData = error.context.data;
					} else if (typeof error.context.data === 'string') {
						try {
							errorData = JSON.parse(error.context.data);
						} catch {
							throw error;
						}
					} else {
						errorData = error.context.data;
					}

					// 检查是否需要重新登录（LoginResultType === 0）
					if (errorData.LoginResultType === 0) {
						this.logger.info('登录凭证已失效，正在自动重新登录...');
						return RequestUtils.originRequest
							.call(this, options, true)
							.then((res) => RequestUtils.processResponse(res, lcid, false));
					}

					// 检查是否为会话丢失错误
					if (KingdeeResponseUtils.isSessionLost(errorData)) {
						this.logger.info('会话已过期，正在自动重新登录...');
						return RequestUtils.originRequest
							.call(this, options, true)
							.then((res) => RequestUtils.processResponse(res, lcid, false));
					}

					const errorMsg = KingdeeResponseUtils.extractErrorMessage(errorData);
					throw new NodeApiError(this.getNode(), error as JsonObject, {
						message: `金蝶 API 错误: ${errorMsg}`,
					});
				}

				throw error;
			});
	}

	/**
	 * 调用金蝶云星空 WebAPI
	 * @param module 模块名称
	 * @param action 操作名称
	 * @param parameters 参数
	 */
	static async call(
		this: IExecuteFunctions,
		module: string,
		action: string,
		parameters: any[],
	) {
		const url = RequestUtils.getApiUrl('', action, module);

		const options: IHttpRequestOptions = {
			method: 'POST',
			url,
			body: {
				format: 1,
				useragent: 'n8n-nodes-kingdee',
				rid: Math.random().toString(36).substring(7),
				parameters: JSON.stringify(parameters),
			},
			headers: {
				'Content-Type': 'application/json',
			},
		};

		return RequestUtils.request.call(this, options);
	}
}

export default RequestUtils;
