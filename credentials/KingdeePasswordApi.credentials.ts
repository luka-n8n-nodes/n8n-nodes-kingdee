import {
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	INodeProperties,
} from 'n8n-workflow';

export class KingdeePasswordApi implements ICredentialType {
	name = 'kingdeePasswordApi';
	displayName = '金蝶云星空 账户密码（已废弃） API';
	documentationUrl = 'https://open.kingdee.com/';
	icon = 'file:icon.svg' as const;
	properties: INodeProperties[] = [
		{
			displayName: '⚠️ 此认证方式已被官方废弃',
			name: 'deprecatedNotice',
			type: 'notice',
			default: '',
			description:
				'金蝶官方已废弃账户密码登录方式，推荐使用「应用授权 API」凭证。此方式仅为兼容旧系统保留。',
		},
		{
			displayName: 'API 请求域名',
			name: 'host',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'https://your-domain.kingdee.com/K3Cloud',
			description:
				'企业访问金蝶云星空的域名，支持的合法 path 后缀应为 /K3Cloud 或 /galaxyapi',
		},
		{
			displayName: '账套 ID',
			name: 'acctId',
			type: 'string',
			default: '',
			required: true,
			description:
				'管理员登录金蝶云星空后台，在搜索框搜索「webapi」并点击查看，在「在线测试 WebAPI」->「WebAPI 在线验证」页面获取账套 ID',
		},
		{
			displayName: '用户名',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
			description: '登录用户名',
		},
		{
			displayName: '密码',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: '登录密码',
		},
		{
			displayName: '语言种类',
			name: 'lcid',
			type: 'options',
			options: [
				{
					name: '简体中文',
					value: 2052,
				},
				{
					name: 'English',
					value: 1033,
				},
				{
					name: '繁體中文',
					value: 3076,
				},
			],
			default: 2052,
			description: '金蝶云星空支持简体中文、英文、繁体中文，根据实际情况选择即可',
		},
		{
			displayName: 'Cookie',
			name: 'cookie',
			type: 'hidden',
			default: '',
			typeOptions: {
				expirable: true,
			},
		},
	];

	async preAuthentication(
		this: IHttpRequestHelper,
		credentials: ICredentialDataDecryptedObject,
	) {
		const host = (credentials.host as string).endsWith('/')
			? (credentials.host as string).slice(0, -1)
			: (credentials.host as string);

		const url = `${host}/Kingdee.BOS.WebApi.ServicesStub.AuthService.ValidateUser.common.kdsvc`;

		const res = (await this.helpers.httpRequest({
			method: 'POST',
			url,
			body: {
				acctid: credentials.acctId,
				username: credentials.username,
				password: credentials.password,
				lcid: credentials.lcid,
			},
			returnFullResponse: true,
		})) as any;

		if (res.body.LoginResultType !== 1) {
			let errorMsg = `登录失败: ${res.body.Message || JSON.stringify(res.body)}`;

			// 智能诊断建议
			if (res.body.Message && res.body.Message.includes('次数超限')) {
				errorMsg +=
					'\n💡 诊断建议: 登录失败次数超限。该用户可能已被临时锁定，请联系管理员在金蝶"用户管理"中解锁，或等待 30 分钟。';
			}

			throw new Error(errorMsg);
		}

		// 从响应头中提取 Cookie
		const setCookie = res.headers['set-cookie'];
		let cookie = '';
		if (setCookie) {
			if (Array.isArray(setCookie)) {
				cookie = setCookie.map((c: string) => c.split(';')[0]).join('; ');
			} else {
				cookie = setCookie.split(';')[0];
			}
		}

		return { cookie };
	}

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Cookie: '={{$credentials.cookie}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.host}}',
			url: '/Kingdee.BOS.WebApi.ServicesStub.AuthService.ValidateUser.common.kdsvc',
			method: 'POST',
			body: {
				acctid: '={{$credentials.acctId}}',
				username: '={{$credentials.username}}',
				password: '={{$credentials.password}}',
				lcid: '={{$credentials.lcid}}',
			},
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					message: '账套 ID 无效',
					key: 'LoginResultType',
					value: 0,
				},
			},
			{
				type: 'responseSuccessBody',
				properties: {
					message: '用户名或密码错误',
					key: 'LoginResultType',
					value: 2,
				},
			},
		],
	};
}
