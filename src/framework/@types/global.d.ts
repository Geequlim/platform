/** 发布模式构建时为`true` */
declare const PRODUCTION: boolean;
/** 构建时间戳 */
declare const BUILD_TIME: number;
/** 构建设备的局域网 IPv4 地址 */
declare const BUILD_LOCAL_HOST: string;
/** 资源版本 */
declare const RESOURCE_VERSION: string;
/** 构建指令中传过来的覆盖配置 */
declare const OVERRIDE_OPTIONS: Record<string, any>;

declare type PartialRecord<K extends string | number | symbol, V> = Partial<Record<K, V>>;

/** 提取 Promise 的返回值 */
declare type Resolve<T> = T extends PromiseLike<infer U> ? U : T;
/** 提取异步函数的返回值 */
declare type Await<T extends (...args: any[]) => PromiseLike<any>> = Resolve<ReturnType<T>>;

declare interface Function {
	/**
	 * For a given function, creates a bound function that has the same body as the original function.
	 * The this object of the bound function is associated with the specified object, and has the specified initial parameters.
	 * @param thisArg The object to be used as the this object.
	 * @param args Arguments to bind to the parameters of the function.
	 */
	bind<T>(this: T, thisArg: ThisParameterType<T>): OmitThisParameter<T>;
	bind<T, A0, A extends any[], R>(this: (this: T, arg0: A0, ...args: A) => R, thisArg: T, arg0: A0): (...args: A) => R;
	bind<T, A0, A1, A extends any[], R>(this: (this: T, arg0: A0, arg1: A1, ...args: A) => R, thisArg: T, arg0: A0, arg1: A1): (...args: A) => R;
	bind<T, A0, A1, A2, A extends any[], R>(this: (this: T, arg0: A0, arg1: A1, arg2: A2, ...args: A) => R, thisArg: T, arg0: A0, arg1: A1, arg2: A2): (...args: A) => R;
	bind<T, A0, A1, A2, A3, A extends any[], R>(this: (this: T, arg0: A0, arg1: A1, arg2: A2, arg3: A3, ...args: A) => R, thisArg: T, arg0: A0, arg1: A1, arg2: A2, arg3: A3): (...args: A) => R;
	bind<T, AX, R>(this: (this: T, ...args: AX[]) => R, thisArg: T, ...args: AX[]): (...args: AX[]) => R;
}

/** 翻译文本 */
declare function tr(text: string, values?: Record<string, unknown>, context?: string, lang?: string): string;

/** 微信小游戏的全局对象 */
declare const GameGlobal: {};
/** 应用的启动时间戳 */
declare const launchAt: number;
