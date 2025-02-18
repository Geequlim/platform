import { EventEmitter } from '../EventEmitter';
import { TinyObject } from '../TinyObject';


export interface IAsyncOperationProgress {
	/** 能否计算 */
	computable?: boolean;
	/** 当前值 */
	current: number;
	/** 总值 */
	total: number;
}

export const NON_COMPUTABLE_PROGRESS: Readonly<IAsyncOperationProgress> = { computable: false, current: 0, total: 1 };
export const EMPTY_PROGRESS: Readonly<IAsyncOperationProgress> = { computable: true, current: 0, total: 1 };
export const FULL_PROGRESS: Readonly<IAsyncOperationProgress> = { computable: true, current: 1, total: 1 };

export class CancelError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = 'Canceled';
	}
}

export type AsyncOperationState = 'pending' | 'processing' | 'done' | 'failed' | 'canceled';
export interface IAsyncOperationInit {
	weight?: number;
	description?: string;
}

export class AsyncOperation<T = unknown> extends TinyObject {

	readonly event: EventEmitter<{
		/** 开始操作 */
		start(): void;
		/** 被取消 */
		canceled(): void;
		/** 任务完成 */
		done(result?: T): void;
		/** 任务失败 */
		failed(error?: Error): void;
		/** 任务完成或失败 */
		complete(result?: T, error?: Error): void;
		/** 状态改变事件 */
		stateChanged(state: AsyncOperationState): void;
	}>;

	/** 权重 */
	public weight: number = 1;
	/** 描述信息 */
	readonly description?: string;
	/** 失败的错误信息 */
	readonly error?: Error;
	/** 执行成功结果 */
	readonly result?: T;

	/** 是否已经执行结束 */
	get settled(): boolean { return this.$state != 'pending' && this.$state != 'processing'; }
	get started(): boolean { return this.$state == 'processing'; }
	/** 任务进度 */
	get progress(): Readonly<IAsyncOperationProgress> { return this.$progress; }
	/** 进度百分比 */
	get percent(): number {
		const { current, total } = this.progress;
		return current / Math.max(total || 1, current);
	}

	protected $progress: IAsyncOperationProgress = Object.assign({}, NON_COMPUTABLE_PROGRESS);
	/** 获取 Promise 对象 */
	get promise(): Promise<T> {
		if (!this.$promise) {
			if (this.settled) {
				this.$promise = this.$state === 'done' ? Promise.resolve(this.result) : Promise.reject(this.error);
			} else {
				this.$promise = new Promise<T>((resolve, reject) => {
					this.event.once('done', resolve);
					this.event.once('failed', reject);
					this.event.once('canceled', () => reject(this.error));
				});
			}
		}
		return this.$promise;
	}
	protected $promise: Promise<T>;

	/** 设置状态 */
	settle(v: 'done' | 'failed' | 'canceled', result?: T, reason?: Error) {
		if (v != this.$state) {
			this.$state = v;
			if (v === 'done') {
				(this.result as T) = result;
				this.event.emit(v, result);
			} if (reason) {
				(this.error as Error) = reason;
				this.event.emit(v, reason);
			}
			this.event.emit('stateChanged', this.$state);
			this.event.emit('complete', result, reason);
		}
	}

	get state(): AsyncOperationState { return this.$state; }
	private $state: AsyncOperationState = 'pending';

	constructor(init?: IAsyncOperationInit) {
		super();
		if (init) {
			this.weight = typeof (init.weight) == 'number' ? Math.max(init.weight, 1) : 1;
			this.description = init.description;
		}
	}

	start() {
		if (this.$state == 'pending') {
			this.$state = 'processing';
			this.event.emit('stateChanged', this.$state);
			this.event.emit('start');
			return;
		}
	}

	/** 是否允许执行取消操作 */
	get cancelable() { return !this.settled; }
	/** 执行取消操作 */
	cancel() {
		if (this.cancelable) {
			this.settle('canceled', undefined, new CancelError('Operation canceled'));
		} else {
			throw new Error('Operation not cancelable');
		}
	}

	protected done(value: T) {
		this.$progress.current = this.$progress.total;
		this.settle('done', value);
	}

	protected fail(reason?: Error) {
		this.settle('failed', undefined, reason);
	}
}
