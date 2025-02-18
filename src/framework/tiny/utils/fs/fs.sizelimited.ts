import { filesize } from 'filesize';
import { path } from '../path';
import { avoidRepeat } from '../promise';
import FileUtils from './FileUtils';
import { deferred } from '../deferred';

interface IFileSystemSizeLimiterOptions {
	/** 最大占用空间 */
	readonly maxSize: number;
	/** 存储目录 */
	readonly root: string;
	/** meta 文件名 */
	readonly metaFile: string;
	/**
	 * 强制保留的文件
	 *
	 * NOTE: **注意，仅支持 root 目录下的内容，不支持其子目录的文件**
	 */
	retainFiles?: string[];
	/** 保留的空间大小 */
	reservedSize?: number;
	readonly storage: LocalStorage;
	readonly verbose?: boolean;
}

interface IFileMeta {
	accessTime: number;
	size: number;
}

const RESERVED_ID = 'protected.fs.reserved';

export class SizeLimitedFileSystem implements IFilesSystem {

	private readonly version = '20240922';

	log(...msg: any[]) {
		this.options.verbose && console.log('[fs.sizelimited]', ...msg);
	}

	readonly manifest: Record<string, IFileMeta> = {};
	getUsedSize() {
		let size = 0;
		for (const m of Object.values(this.manifest)) {
			size += m.size;
		}
		return size;
	}

	constructor(readonly fs: IFilesSystem, readonly options: IFileSystemSizeLimiterOptions) {
		this.options.retainFiles = this.options.retainFiles || [];
		this.options.retainFiles.push(RESERVED_ID);
		this.options.retainFiles.push(this.options.metaFile);
		const reservedSize = (options.reservedSize || 0) + 1024 * 1000;
		this.options.reservedSize = reservedSize;
		this.log(`文件系统概况: 容量${filesize(options.maxSize)} 保留${filesize(reservedSize || 0)}`);
	}

	private async initialize() {
		if (this.$initialized) return Promise.resolve();
		return avoidRepeat('fs.size-limited.initialize', async () => {
			const dir = path.dirname(this.options.metaFile);
			await this.fs.mkdir(dir, true);
			if (await this.fs.exists(this.options.metaFile) && (await this.fs.stat(this.options.metaFile)).isFile()) {
				const text = await this.fs.readFile(this.options.metaFile, 'utf8');
				(this.manifest as Record<string, IFileMeta>) = JSON.parse(text) as Record<string, IFileMeta>;
			}

			const VERSION = 'fs.sizelimited.version';
			const version = this.options.storage.getItem(VERSION);
			if (version != this.version) {
				try {
					this.log('文件系统版本升级,即将清空磁盘数据', version, '->', this.version);
					await this.doClearRoot();
				} catch (error) {
					this.log('文件系统版本升级失败', error);
				}
			}
			this.initReserved();
			this.$initialized = true;
			this.options.storage.setItem(VERSION, this.version);
			this.log(`文件系统概况: 可用容量${filesize(this.options.maxSize - this.getUsedSize())}`);
		});
	}
	private $initialized = false;

	async unlink(filePath: string): Promise<void> {
		await this.initialize();
		this.updateMeta(filePath, undefined);
		if (await this.fs.exists(filePath)) {
			this.log('删除文件', filePath);
			await this.fs.unlink(filePath);
		}
	}

	async rename(oldPath: string, newPath: string): Promise<void> {
		await this.initialize();
		this.updateMeta(newPath, this.manifest[newPath]);
		this.updateMeta(oldPath, undefined);
		await this.fs.rename(oldPath, newPath);
	}

	mkdir(dirPath: string, recursive: boolean): Promise<void> {
		return this.fs.mkdir(dirPath, recursive);
	}

	async copyFile(src: string, dist: string): Promise<void> {
		const data = await this.fs.readFile(src, 'binary');
		await this.writeFile(dist, data, 'binary');
	}

	async rmdir(dirPath: string, recursive: boolean): Promise<void> {
		await this.initialize();
		const files = await FileUtils.getFiles(this.fs, dirPath, recursive);
		files.forEach(f => this.updateMeta(f, undefined));
		await this.fs.rmdir(dirPath, recursive);
	}

	writeFile(filePath: string, data: ArrayBuffer, encoding: 'binary'): Promise<void>;
	writeFile(filePath: string, data: string, encoding: 'utf8' | 'utf-8'): Promise<void>;
	async writeFile(filePath: any, data: any, encoding: any): Promise<void> {
		await this.initialize();
		const size = Math.max(this.getDataSize(data) - (this.manifest[filePath]?.size || 0), 0);
		if (size > (this.options.maxSize - this.options.reservedSize)) throw new Error('No enough space');
		let avaliable = this.options.maxSize - this.getUsedSize();
		if (avaliable < size) {
			let files: ({ path: string; } & IFileMeta)[] = [];
			for (const pair of Object.entries(this.manifest)) {
				files.push({ path: pair[0], ...(pair[1]) });
			}
			files.sort((a, b) => a.accessTime - b.accessTime);
			files = files.filter(f => {
				if (f.path == this.options.metaFile || f.path === RESERVED_ID) return false;
				if (this.options.retainFiles) {
					return !this.options.retainFiles.includes(f.path);
				}
				return true;
			});

			const drop: typeof files = [];
			for (const f of files) {
				drop.push(f);
				avaliable += f.size;
				if (avaliable > size) break;
			}
			this.log('为了保存', filePath, '而删除', drop);
			for (const f of drop) {
				await this.unlink(f.path);
			}
		}
		this.updateMeta(filePath, { accessTime: Date.now(), size: this.getDataSize(data) });
		await this.fs.writeFile(filePath, data, encoding);
	}

	exists(filePath: string): Promise<boolean> {
		return this.fs.exists(filePath);
	}

	existsSync(filePath: string): boolean {
		return this.fs.existsSync(filePath);
	}

	stat(filePath: string): Promise<Stat> {
		return this.fs.stat(filePath);
	}
	statSync(filePath: string): Stat {
		return this.fs.statSync(filePath);
	}

	readdir(dirPath: string): Promise<string[]> {
		return this.fs.readdir(dirPath);
	}

	readFile(filePath: string, encoding: 'binary'): Promise<ArrayBuffer>;
	readFile(filePath: string, encoding: 'utf8' | 'utf-8'): Promise<string>;
	async readFile(filePath: any, encoding: any): Promise<ArrayBuffer | string> {
		await this.initialize();
		const data = await this.fs.readFile(filePath, encoding);
		this.updateMeta(filePath, { accessTime: Date.now(), size: this.getDataSize(data) });
		return data;
	}

	private getDataSize(data: string | ArrayBuffer) {
		let size: number = 0;
		if (data instanceof ArrayBuffer) size = data.byteLength;
		else if (typeof data === 'string') size = data.length * 4;
		return size;
	}

	/** 更新文件信息，meta 传入 null 表示删除文件 */
	private updateMeta(file: string, meta: IFileMeta) {
		if (!file.startsWith(this.options.root)) return;
		this.manifest[file] = meta;
		if (!meta) delete this.manifest[file];
		const root = this.manifest[this.options.metaFile];
		if (root) root.accessTime = Date.now();
		deferred(()=> {
			this.fs.writeFile(this.options.metaFile, JSON.stringify(this.manifest, undefined, '\t'), 'utf8');
		}, 500, 2500, 'fs.size-limited.update.meta');
	}

	async clear() {
		await this.initialize();
		this.$initialized = false;
		await avoidRepeat('fs.size-limited.initialize', this.doClearRoot.bind(this));
		this.$initialized = true;
	}

	protected async doClearRoot() {
		const children = await this.fs.readdir(this.options.root);
		const tasks = children.map(async c => {
			const e = path.join(this.options.root, c);
			const stat = await this.fs.stat(e);
			if (stat.isDirectory()) {
				await this.fs.rmdir(e, true);
			} else {
				const file = path.join(this.options.root, c);
				if (this.options.retainFiles.includes(file)) {
					this.log('保留文件', file);
					return;
				}
				await this.fs.unlink(e);
			}
		});
		const rets = await Promise.allSettled(tasks);
		for (let i = 0; i < children.length; i++) {
			const ret = rets[i];
			if (ret.status === 'rejected') {
				this.log('移除', children[i], '失败:', ret.reason);
			} else {
				this.log('移除', children[i], '成功');
			}
		}
		(this.manifest as Record<string, IFileMeta>) = {};
		this.initReserved();
		await this.fs.writeFile(this.options.metaFile, JSON.stringify(this.manifest, undefined, '\t'), 'utf8');
	}

	private initReserved() {
		this.manifest[this.options.metaFile] = { accessTime: Date.now(), size: 1024 * 1000 };
		this.manifest[RESERVED_ID] = { accessTime: Date.now(), size: this.options.reservedSize || 0 };
	}

	getAvailableSize() {
		return filesize(this.options.maxSize - this.getUsedSize());
	}
}
