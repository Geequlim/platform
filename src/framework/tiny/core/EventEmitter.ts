import { HashObject } from './HashObject';
interface EventHandler {
	(...args: any[]): void;
}
interface EventMap {
	[key: string]: EventHandler;
}

interface HandlerOptions {
	/** 只执行一次 */
	once?: boolean;
	/** 阻止后面的回调被派发 */
	block?: boolean;
}
interface InternalEnternalHandler {
	handler: EventHandler;
	options?: HandlerOptions;
}
type InternalEventHandlerList = InternalEnternalHandler[];

/**
 * 事件派发器，事件派发机制的实现
 *
 * @export
 * @class EventEmitter
 * @extends {HashObject}
 */
export class EventEmitter<T extends EventMap = EventMap> extends HashObject {

	constructor() { super(); }
	private readonly $all = new Map<string, InternalEnternalHandler[]>();

	/**
	 * 添加事件监听器
	 *
	 * @param {EventType} type 事件类型
	 * @param {EventHandler} handler 事件回调
	 * @param {boolean} [options] 派发一次事件后移除该事件
	 * @returns 返回绑定的回调函数，可用于取消绑定
	 * @memberof EventEmitter
	 */
	on<K extends keyof T>(type: K, handler: (...args: Parameters<T[K]>) => void, options?: HandlerOptions) {
		const handlers = this.$all.get(type as string);
		const h = { handler, options };
		const added = handlers && handlers.push(h);
		if (!added) {
			this.$all.set(type as string, [h]);
		}
		return h.handler;
	}

	/**
	 * 添加事件监听器, 事件派发后自动解绑
	 *
	 * @param {EventType} type 事件类型
	 * @param {EventHandler} handler 事件回调
	 * @param {boolean} [options] 派发一次事件后移除该事件
	 * @returns 返回绑定的回调函数，可用于取消绑定
	 * @returns EventEmitter
	 */
	once<K extends keyof T>(type: K, handler: (...args: Parameters<T[K]>) => void, options?: HandlerOptions) {
		const opt = options || {};
		opt.once = true;
		return this.on(type, handler, opt);
	}

	/**
	 * 转发事件
	 * @param target 目标代理对象
	 * @param type 时间类型
	 * @param options 配置参数
	 * @returns 返回代理回调，可用于取消转发
	 */
	pipe<T2 extends EventMap>(target: EventEmitter<T2>, type: keyof (T | T2), options?: HandlerOptions) {
		type K = keyof (T | T2);
		// @ts-ignore
		if (target == this) return undefined;
		const callback = function() {
			// eslint-disable-next-line prefer-rest-params
			target.emit.apply(target, [type as K, ...arguments]);
		};
		this.on(type as K, callback, options);
		return callback;
	}

	/**
	 * 移除事件监听器
	 *
	 * @param {EventType} type 事件类型
	 * @param {EventHandler} handler 要移除的回调
	 * @memberof EventEmitter
	 */
	off<K extends keyof T>(type: K, handler: (...args: Parameters<T[K]>) => void) {
		const handlers = this.$all.get(type as string);
		if (handlers) {
			const h = handlers.find(h => h.handler === handler);
			if (h) {
				handlers.splice(handlers.indexOf(h), 1);
			}
		}
	}

	/**
	 * 移除特定类型是所有事件监听器
	 *
	 * @param {EventType} type 事件类型，传入`*`则清理所有类型的事件回调
	 * @memberof EventEmitter
	 */
	offAll<K extends keyof T>(type: K | '*') {
		if (type === '*') {
			this.$all.clear();
		} else {
			this.$all.delete(type as string);
		}
	}

	/**
	 * 派发事件
	 *
	 * @param {EventType} type 事件类型
	 * @param {...any[]} args 派发参数表
	 * @memberof EventEmitter
	 */
	emit<K extends keyof T>(type: K, ...args: Parameters<T[K]>) {
		const handlers: InternalEventHandlerList = [];
		let blocking = false;
		for (const h of ((this.$all.get(type as string) || []) as InternalEventHandlerList).slice()) {
			const currentBlocking = h.options && h.options.block;
			const currentOnce = h.options && h.options.once;
			if (!blocking) h.handler(...args);
			if (!currentOnce || blocking) handlers.push(h);
			blocking = blocking || currentBlocking;
		}
		this.$all.set(type as string, handlers);
	}

	/** 等待事件派发 */
	wait<K extends keyof T>(event: K): Promise<unknown[]> {
		return new Promise((resolve, reject) => {
			this.on(event, (...args: any[]) => { resolve(args); }, { once: true });
		});
	}

	/** 销毁时解绑所有事件 */
	dispose() {
		this.$all.clear();
	}
}
