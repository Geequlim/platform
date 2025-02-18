declare const global: typeof globalThis;
declare const self: typeof globalThis;
declare const window: typeof globalThis;

// eslint-disable-next-line
let $globalObject: Record<string, any> = undefined;
if (typeof globalThis === 'object') $globalObject = globalThis;
else if (typeof global === 'object') $globalObject = global;
else if (typeof window === 'object') $globalObject = window;
else if (typeof self === 'object') $globalObject = self;
else $globalObject = {};

/** 全局变量对象，兼容多种 JS 运行时环境 */
export const globalObject = $globalObject;

/**
 * 设置全局变量
 *
 * @param {string} key 变量名
 * @param {unknown} value 值
 */
export function globalSet(key: string, value: unknown) {
	try {
		// @ts-ignore
		if (typeof GameGlobal === 'object') GameGlobal[key] = value;
		Object.defineProperty(globalObject, key, { value, enumerable: true, configurable: true, writable: true });
	} catch (error) {
		console.error(`定义全局变量 ${key} 失败:`, error);
	}
}

/**
 * 获取全局变量
 *
 * @param {string} key 变量名
 */
export function globalGet(key: string) {
	return globalObject[key];
}
