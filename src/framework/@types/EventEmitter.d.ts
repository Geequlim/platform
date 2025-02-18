interface EventMap {
	[key: string]: EventHandler;
}

interface HandlerOptions {
	/** 只执行一次 */
	once?: boolean;
	/** 阻止后面的回调被派发 */
	block?: boolean;
}

declare interface IEventEmitter<T extends EventMap> {
	/**
	 * 添加事件监听器
	 *
	 * @param {EventType} type 事件类型
	 * @param {EventHandler} handler 事件回调
	 * @param {boolean} [options] 派发一次事件后移除该事件
	 * @returns 返回绑定的回调函数，可用于取消绑定
	 * @memberof EventEmitter
	 */
	on<K extends keyof T>(type: K, handler: (...args: Parameters<T[K]>) => void, options?: HandlerOptions): void;

	/**
* 添加事件监听器, 事件派发后自动解绑
*
* @param {EventType} type 事件类型
* @param {EventHandler} handler 事件回调
* @param {boolean} [options] 派发一次事件后移除该事件
* @returns 返回绑定的回调函数，可用于取消绑定
* @returns EventEmitter
*/
	once<K extends keyof T>(type: K, handler: (...args: Parameters<T[K]>) => void, options?: HandlerOptions): void;


	/**
	 * 转发事件
	 * @param target 目标代理对象
	 * @param type 时间类型
	 * @param options 配置参数
	 * @returns 返回代理回调，可用于取消转发
	 */
	pipe<T2 extends EventMap>(target: EventEmitter<T2>, type: keyof (T | T2), options?: HandlerOptions): () => void;

	/**
	 * 移除事件监听器
	 *
	 * @param {EventType} type 事件类型
	 * @param {EventHandler} handler 要移除的回调
	 * @memberof EventEmitter
	 */
	off<K extends keyof T>(type: K, handler: (...args: Parameters<T[K]>) => void): void;

	/**
	 * 移除特定类型是所有事件监听器
	 *
	 * @param {EventType} type 事件类型，传入`*`则清理所有类型的事件回调
	 * @memberof EventEmitter
	 */
	offAll<K extends keyof T>(type: K | '*'): void;


	/**
	 * 派发事件
	 *
	 * @param {EventType} type 事件类型
	 * @param {...any[]} args 派发参数表
	 * @memberof EventEmitter
	 */
	emit<K extends keyof T>(type: K, ...args: Parameters<T[K]>): void;

	/** 等待事件派发 */
	wait<K extends keyof T>(event: K): Promise<unknown[]>;

	/** 销毁时解绑所有事件 */
	dispose(): void;
}

declare interface IEventObject<T extends EventMap> {
	/** 事件派发器 */
	readonly event: IEventEmitter<T>;
}
