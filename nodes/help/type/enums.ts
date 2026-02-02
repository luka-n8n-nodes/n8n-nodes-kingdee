/**
 * 输出类型枚举
 */
export declare const enum OutputType {
	Single = 'single',
	Multiple = 'multiple',
	None = 'none',
}

/**
 * 凭证类型枚举
 */
export declare const enum Credentials {
	/** 应用授权凭证（推荐） */
	KingdeeAppAuthApi = 'kingdeeAppAuthApi',
	/** 账户密码凭证（已废弃） */
	KingdeePasswordApi = 'kingdeePasswordApi',
	/** 凭证 ID */
	Id = 'kingdee-credential-id',
	/** 凭证类型 */
	Type = 'kingdee',
}

/**
 * 语言代码枚举
 * 金蝶云星空支持的语言种类
 */
export enum LanguageCode {
	/** 简体中文 */
	SimplifiedChinese = 2052,
	/** 英文 */
	English = 1033,
	/** 繁体中文 */
	TraditionalChinese = 3076,
}

/**
 * 金蝶 API 错误码常量
 */
export const KingdeeErrorCodes = {
	/** 登录成功 */
	LOGIN_SUCCESS: 1,
	/** 签名不匹配 */
	SIGNATURE_MISMATCH: '002005000003016',
} as const;

/**
 * 可自动重试的错误码列表
 */
export const RETRYABLE_ERROR_CODES: readonly string[] = [] as const;
