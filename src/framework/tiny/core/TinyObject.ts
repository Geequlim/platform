import { EventEmitter } from './EventEmitter';
import { HashObject } from './HashObject';

export class TinyObject extends HashObject {
	/** 事件派发器 */
	readonly event = new EventEmitter();

	/** 执行清理/销毁操作，执行该操作之后不应再继续使用该对象 */
	dispose() {
		this.event.dispose();
	}
}
