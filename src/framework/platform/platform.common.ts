import { EventEmitter } from 'framework/tiny/core/EventEmitter';
import { globalGet } from 'framework/tiny/core/global';

class InpackageReadonlyFileSystem implements IReadonlyFilesSystem {
	constructor(readonly fs: IReadonlyFilesSystem, readonly platform: Platform) {}

	exists(filePath: string) { return this.fs.exists(filePath); }
	existsSync(filePath: string) { return this.fs.existsSync(filePath); }
	stat(filePath: string) { return this.fs.stat(filePath); }
	statSync(filePath: string): Stat { return this.fs.statSync(filePath); }
	readdir(dirPath: string) { return this.fs.readdir(dirPath); }
	readFile(filePath: string, encoding: 'binary'): Promise<ArrayBuffer>;
	readFile(filePath: string, encoding: 'utf8' | 'utf-8'): Promise<string>;
	async readFile(filePath: unknown, encoding: unknown): Promise<string | ArrayBuffer> {
		if (this.platform.check('readLocalFile')) {
			try {
				return this.platform.readLocalFile(filePath as string, encoding === 'utf8' || encoding === 'utf-8' ? 'text' : 'binary');
			} catch (error) {
				// pass
			}
		}
		return this.fs.readFile(filePath as string, encoding as 'binary');
	}
}

export class GamePlatformBase extends EventEmitter<ApplicationEvents> implements Platform {

	get persistentDataPath() { return ''; }
	get channel(): string { return this.type; }
	get type(): string { return 'laya-base'; }
	get isRunningInBrowser() { return typeof window === 'object' && typeof document === 'object' && typeof window.navigator === 'object' && typeof window.history === 'object' && typeof window.location === 'object'; }
	get os(): OSInformation { return null; }
	get device(): DeviceInformation { return null; }
	get application(): HostApplicationInformation { return null; }
	get launchOptions(): { path?: string; query?: object; scene?: string | number; group_id?: string; } { return null; }
	readonly localStorage: LocalStorage;

	protected $launchAt = globalGet('launchAt') || Date.now();
	now(): number {
		if (typeof performance !== 'undefined') {
			return performance.now();
		}
		return (Date.now() - this.$launchAt);
	}

	protected setState(v: keyof ApplicationEvents) {
		if (v != this.$state) {
			this.$state = v;
			this.emit(v);
		}
	}
	private $state: keyof ApplicationEvents;

	get http(): http { return this.$http; }
	protected $http: http;

	check(type: keyof Platform): boolean {
		// @ts-expect-error check if the property exists
		return typeof this[type] !== 'undefined';
	}

	protected wrapReadonlyFS(fs: IReadonlyFilesSystem): InpackageReadonlyFileSystem {
		return new InpackageReadonlyFileSystem(fs, this);
	}

	alert(message: string, title?: string): Promise<void> {
		return Promise.reject(new Error('Method not implemented.'));
	}

	accept(message: string, title?: string, confirm?: string, cancel?: string): Promise<void> {
		return Promise.reject(new Error('Method not implemented.'));
	}

	toast(message: string, icon?: ToastType): Promise<void> {
		return Promise.reject(new Error('Method not implemented.'));
	}

	vibrate(durationMs: number): void {
		throw new Error('Method not implemented.');
	}

	reload(): Promise<void> {
		return Promise.reject(new Error('Method not implemented.'));
	}

	exit(): Promise<void> {
		return Promise.reject(new Error('Method not implemented.'));
	}
}
