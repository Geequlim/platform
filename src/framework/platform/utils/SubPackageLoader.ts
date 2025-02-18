import { EventEmitter } from 'framework/tiny/core/EventEmitter';
import { AsyncOperation } from 'framework/tiny/core/async-operation/AsyncOperation';

type PackageLoaderTaskEvents = {
	done: () => void,
	faild: (err: Error) => void;
	progress: (current: number, total: number) => void;
};
export class SubPackageLoadTask extends EventEmitter<PackageLoaderTaskEvents>{
	constructor(readonly subpackage: ISubPackage) {
		super();
	}
}

/** 小游戏分包加载器 */
export class SubPackageLoader extends AsyncOperation<void> {
	verbose?: boolean;

	static readonly LOADED_SUBPACKAGES = new Set((config.subpackages || []).filter(p => p.priority === 'bootstrap'));
	static readonly LOADING_SUBPACKAGES = new Map<ISubPackage, SubPackageLoadTask>();

	constructor(readonly pkg: ISubPackage) {
		super({ description: `load subpackage ${pkg.name}` });
	}

	start() {
		super.start();
		this.$progress.total = 1;
		this.$progress.current = 0;
		const loader = config.subpackage_loader;
		if (loader) {
			if (SubPackageLoader.LOADED_SUBPACKAGES.has(this.pkg)) {
				this.done();
			} else if (SubPackageLoader.LOADING_SUBPACKAGES.has(this.pkg)) {
				const task = SubPackageLoader.LOADING_SUBPACKAGES.get(this.pkg);
				const onDone = () => {
					this.done();
					clear();
				};
				const onError = (err: Error) => {
					this.fail(err);
					clear();
				};
				const onProgress = (c: number, t: number) => this.updateProgress(c / t);
				const clear = () => {
					task.off('done', onDone);
					task.off('faild', onError);
					task.off('progress', onProgress);
				};
				task.once('done', onDone);
				task.once('faild', onError);
				task.on('progress', onProgress);
			} else {
				if (this.verbose) console.log('开始加载分包', this.pkg.name);
				const task = new SubPackageLoadTask(this.pkg);
				SubPackageLoader.LOADING_SUBPACKAGES.set(this.pkg, task);
				const rawTask = loader({
					name: this.pkg.name,
					success: () => {
						SubPackageLoader.LOADED_SUBPACKAGES.add(this.pkg);
						SubPackageLoader.LOADING_SUBPACKAGES.delete(this.pkg);
						if (this.verbose) console.log('已加载分包', this.pkg.name);
						this.updateProgress(this.$progress.total);
						this.done();
						task.emit('done');
					},
					fail: (err: string) => {
						SubPackageLoader.LOADING_SUBPACKAGES.delete(this.pkg);
						const error = new Error(`分包加载失败: ${this.pkg} ${err}`);
						this.fail(error);
						task.emit('faild', error);
					}
				});
				if (rawTask && rawTask.onProgressUpdate) {
					rawTask.onProgressUpdate(res => {
						this.updateProgress(res.totalBytesWritten / res.totalBytesExpectedToWrite);
						task.emit('progress', res.totalBytesWritten, res.totalBytesExpectedToWrite);
					});
				}
			}
		}
	}

	protected updateProgress(value: number) {
		this.$progress.current = value;
	}
}
