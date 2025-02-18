import { path } from 'framework/tiny/utils/path';
import { avoidRepeat } from 'framework/tiny/utils/promise';
import localforage from 'localforage';
interface IPathEntry {
	/** 文件字节大小，未必可靠，实现中如果平台不支持应返回`1` */
	size: number;
	/** 文件最后修改时间，未必可靠，实现中如果平台不支持应返回`0` */
	lastModifiedTime: number;
	/** 类型 */
	type: 'file' | 'directory';
	/** 子路径 */
	children?: Set<string>;
}

type IPathEntrySerialized = Omit<IPathEntry, 'children'> & { children?: string[] };

export class WebIndexedDBFileSystem implements IFilesSystem {
	readonly entries: Record<string, IPathEntry>;

	readonly store: LocalForage;
	constructor(readonly name: string, readonly root: string) {
		this.store = localforage.createInstance({
			name: config?.name || 'tiny',
			storeName: name,
			driver: localforage.INDEXEDDB
		});
	}

	protected initialize() {
		if (this.entries) return this.entries;
		return avoidRepeat('fs.web.idfs.tiny.initialize', async () => {
			let data = await this.store.getItem('__meta__') as Record<string, IPathEntrySerialized>;
			const newDisk = !data;
			if (newDisk) {
				data = { [this.root]: { type: 'directory', size: 0, lastModifiedTime: Date.now(), children: [] } };
			}
			(this.entries as typeof this.entries) = {};
			for (const [id, e] of Object.entries(data)) {
				this.entries[id] = { ...e, children: e.children ? new Set(e.children) : undefined };
			}
			if (newDisk) this.saveMetaData();
		});
	}

	protected saveMetaData() {
		return avoidRepeat('fs.web.idfs.tiny.meta.save', async () => {
			const data = {} as Record<string, IPathEntrySerialized>;
			for (const [id, e] of Object.entries(this.entries)) {
				const value = Object.assign({}, e as unknown as IPathEntrySerialized);
				if (e.type === 'directory' && e.children) {
					value.children = Array.from(e.children);
				}
				data[id] = value;
			}
			return this.store.setItem('__meta__', data);
		});
	}

	private saveEntry(entryPath: string, entry: IPathEntry) {
		this.entries[entryPath] = entry;
		this.syncParent(entryPath, 'add');
		return this.saveMetaData();
	}

	private async removeEntry(entryPath: string) {
		delete this.entries[entryPath];
		this.store.removeItem(entryPath);
		this.syncParent(entryPath, 'remove');
		return this.saveMetaData();
	}

	private syncParent(filePath: string, action: 'add' | 'remove') {
		const dir = path.dirname(filePath);
		if (!dir) return;
		const entry = path.basename(filePath);
		const parent = this.entries[dir];
		if (action === 'add') {
			parent.children.add(entry);
		} else if (action === 'remove') {
			parent.children.delete(entry);
		}
	}


	async unlink(filePath: string): Promise<void> {
		await this.initialize();
		const stat = await this.stat(filePath);
		if (stat.isFile()) {
			await this.removeEntry(filePath);
		} else {
			throw new Error(`Cannot unlink ${filePath} is not a file`);
		}
	}

	async rename(oldPath: string, newPath: string): Promise<void> {
		await this.initialize();
		const item: IPathEntry = this.entries[oldPath];
		if (!item) throw new Error(`No such file or directory ${oldPath}`);
		const dist = this.entries[newPath];
		if (dist) {
			if(dist.type !== item.type) throw new Error(`Cannot rename ${oldPath} to ${newPath}`);
			if (dist.type === 'directory') {
				await this.rmdir(newPath, true);
			} else {
				await this.unlink(newPath);
			}
			this.removeEntry(newPath);
		}
		await this.saveEntry(newPath, item);
	}

	async mkdir(dirPath: string, recursive: boolean = false): Promise<void> {
		await this.initialize();
		if (recursive) {
			const dirs = [] as string[];
			let dir = dirPath;
			let exists = this.existsSync(dir);
			while (dir && !exists) {
				dirs.push(dir);
				dir = path.dirname(dir);
				exists = this.existsSync(dir);
			}
			dirs.reverse();
			for (const dir of dirs) {
				await this.mkdir(dir);
			}
		} else {
			const base = path.dirname(dirPath);
			if (base) {
				const be = this.entries[base] as IPathEntry;
				if (!be || be.type != 'directory') throw new Error(`Cannot make director at ${dirPath}`);
			}
			let e = this.entries[dirPath] as IPathEntry;
			if (!e) {
				e = {
					type: 'directory',
					size: 0,
					lastModifiedTime: Date.now(),
					children: new Set<string>(),
				};
			}
			await this.saveEntry(dirPath, e);
		}
	}

	async rmdir(dirPath: string, recursive: boolean): Promise<void> {
		const dir = this.entries[dirPath];
		if (!dir || dir.type !== 'directory') {
			throw new Error(`Directory ${dir} does not exists exists`);
		}
		if (dir.children.size && !recursive) {
			throw new Error(`Directory ${dirPath} is not empty`);
		}
		for (const s of Array.from(dir.children)) {
			const f = path.join(dirPath, s);
			const se = this.entries[f];
			if (!se) continue;
			if (se.type === 'directory') {
				await this.rmdir(f, recursive);
			} else {
				await this.unlink(f);
			}
		}
		await this.removeEntry(dirPath);
	}

	writeFile(filePath: string, data: ArrayBuffer, encoding: 'binary'): Promise<void>;
	writeFile(filePath: string, data: string, encoding: 'utf8' | 'utf-8'): Promise<void>;
	async writeFile(filePath: any, data: any, encoding: any): Promise<void> {
		await this.initialize();
		let dir = path.dirname(filePath);
		while (dir && dir !== this.root) {
			const e = this.entries[dir] as IPathEntry;
			if (!e || e.type !== 'directory') {
				throw new Error(`Directory ${dir} does not exists`);
			}
			dir = path.dirname(dir);
		}
		let size = 0;
		if (typeof data === 'string') size = data.length;
		else if (data instanceof ArrayBuffer) size = data.byteLength;
		const e: IPathEntry = { size, type: 'file', lastModifiedTime: Date.now() };
		this.syncParent(filePath, 'add');
		await this.store.setItem(filePath, data);
		await this.saveEntry(filePath, e);
	}

	writeFileSync(filePath: string, data: ArrayBuffer, encoding: 'binary'): void;
	writeFileSync(filePath: string, data: string, encoding: 'utf8' | 'utf-8'): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	writeFileSync(filePath: any, data: any, encoding: any): void {
		throw new Error('Method not implemented.');
	}

	async exists(filePath: string): Promise<boolean> {
		if (filePath === '/') return true;
		if (filePath.endsWith('://')) return true;
		await this.initialize();
		return this.existsSync(filePath);
	}

	existsSync(filePath: string): boolean {
		if (!this.entries) throw new Error('File system is not initialized');
		return this.entries[filePath] != null;
	}

	async stat(filePath: string): Promise<Stat> {
		await this.initialize();
		return this.statSync(filePath);
	}

	statSync(filePath: string): Stat {
		if (!this.entries) throw new Error('File system is not initialized');
		const e = this.entries[filePath];
		if (!e) throw new Error(`No such file or directory ${filePath}`);
		return {
			size: e.size,
			lastModifiedTime: e.lastModifiedTime,
			isFile: () => e.type === 'file',
			isDirectory: () => e.type === 'directory',
		};
	}

	async readdir(dirPath: string): Promise<string[]> {
		await this.initialize();
		const item: IPathEntry = this.entries[dirPath];
		if (!item || item.type !== 'directory') throw new Error(`No such directory ${dirPath}`);
		return Array.from(item.children || []);
	}

	readFile(filePath: string, encoding: 'binary'): Promise<ArrayBuffer>;
	readFile(filePath: string, encoding: 'utf8' | 'utf-8'): Promise<string>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async readFile(filePath: any, encoding: any): Promise<string | ArrayBuffer> {
		await this.initialize();
		const e = this.entries[filePath];
		if (!e) {
			throw new Error(`${filePath} does not exists`);
		} else if (e.type !== 'file') {
			throw new Error(`${filePath} is not a valid file`);
		}
		return this.store.getItem(filePath);
	}

	readFileSync(filePath: string, encoding: 'binary'): ArrayBuffer;
	readFileSync(filePath: string, encoding: 'utf8' | 'utf-8'): string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readFileSync(filePath: any, encoding: any): string | ArrayBuffer {
		throw new Error('Method not implemented.');
	}

	async copyFile(src: string, dist: string): Promise<void> {
		await this.initialize();
		const se = this.entries[src];
		if (!se || se.type !== 'file') throw new Error(`No such file ${src}`);
		const de = this.entries[dist];
		if (de && de.type === 'directory') throw new Error(`Cannot copy file to directory ${dist}`);
		await this.saveEntry(dist, se);
	}
}
