import { EventEmitter } from '../core/EventEmitter';
import { TinyObject } from '../core/TinyObject';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BasicStateType = any;
export type IEventMap<T extends BasicStateType> = {
	'state-changed': (next: T, last: T) => void;
};


export class PureBasicStateMachine<T extends BasicStateType> extends TinyObject {
	readonly event: EventEmitter<IEventMap<T>>;

	constructor(initState?: T) {
		super();
		this.$state = initState;
	}

	get state(): T { return this.$state; }
	public set state(v: T) { this.setState(v); }
	protected $state: T;

	protected setState(v: T) {
		if (v != this.$state) {
			const last = this.$state;
			this.$state = v;
			this.event.emit('state-changed', v, last);
		}
	}
}
