import { path } from 'framework/tiny/utils/path';
import { SubPackageLoader } from '../utils/SubPackageLoader';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare interface AsyncCallbackOptions<T = any> {
	success?(ret: T): void;
	fail?(err: { errMsg: string; }): void;
	complete?(): void;
}
const fs = wx.getFileSystemManager();

/** 调用微信的异步API */
function callAsyncApi<T, R>(api: (options: AsyncCallbackOptions<R> & T) => void, options: T): Promise<R> {
	return new Promise((resolve, reject) => {
		const params: AsyncCallbackOptions = {
			success: (ret: R) => resolve(ret),
			fail: (err: { errMsg: string; }) => reject(err),
			...options
		};
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		api.call(fs, params as any);
	});
}

const REVERSED_DIRS = [
	wx.env.USER_DATA_PATH,
	'wxfile://temp'
];

export class WechatFileSystem implements IFilesSystem {
	constructor(readonly name: string) { }

	async exists(filePath: string): Promise<boolean> {
		try {
			if (REVERSED_DIRS.includes(filePath)) return true;
			await callAsyncApi(fs.access, { path: filePath });
			return true;
		} catch (error) {
			return false;
		}
	}

	existsSync(filePath: string): boolean {
		try {
			if (REVERSED_DIRS.includes(filePath)) return true;
			fs.accessSync(filePath);
			return true;
		} catch (error) {
			return false;
		}
	}

	async stat(filePath: string): Promise<Stat> {
		if (REVERSED_DIRS.includes(filePath)) {
			return {
				size: 0,
				lastModifiedTime: 0,
				isFile() { return false; },
				isDirectory() { return true; }
			};
		}
		const inpkgFile = config.assets.files[filePath];
		if (inpkgFile) {
			return {
				size: inpkgFile.size,
				lastModifiedTime: inpkgFile.mtime,
				isDirectory() { return false; },
				isFile() { return true; }
			};
		} else {
			const ret = await callAsyncApi(fs.stat, { path: filePath });
			const stat = ret.stats as wx.Stats;
			stat.size = stat.size || 1;
			return stat;
		}
	}

	statSync(filePath: string): Stat {
		if (REVERSED_DIRS.includes(filePath)) {
			return {
				size: 0,
				lastModifiedTime: 0,
				isFile() { return false; },
				isDirectory() { return true; }
			};
		}
		const inpkgFile = config.assets.files[filePath];
		if (inpkgFile) {
			return {
				size: inpkgFile.size,
				lastModifiedTime: inpkgFile.mtime,
				isDirectory() { return false; },
				isFile() { return true; }
			};
		} else {
			const ret = fs.statSync(filePath, false);
			return ret as wx.Stats;
		}
	}

	async unlink(filePath: string): Promise<void> {
		await callAsyncApi(fs.unlink, { filePath });
	}

	async rename(oldPath: string, newPath: string): Promise<void> {
		await callAsyncApi(fs.rename, { oldPath, newPath });
	}

	async mkdir(dirPath: string, recursive: boolean): Promise<void> {
		if (this.existsSync(dirPath)) return;
		await callAsyncApi(fs.mkdir, { dirPath, recursive });
	}

	mkdirSync(dirPath: string, recursive: boolean) {
		if (this.existsSync(dirPath)) return;
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
				fs.mkdirSync(dir);
			}
		} else {
			fs.mkdirSync(dirPath);
		}
	}

	async rmdir(dirPath: string, recursive: boolean): Promise<void> {
		if (false) { // 此接口会出现无响应的 BUG
			await callAsyncApi(fs.rmdir, { dirPath, recursive });
		} else {
			fs.rmdirSync(dirPath, recursive);
		}
	}

	async readdir(dirPath: string): Promise<string[]> {
		dirPath = dirPath.endsWith('/') ? dirPath : dirPath + '/';
		const ret = await callAsyncApi(fs.readdir, { dirPath });
		return ret.files;
	}

	readFile(filePath: string, encoding: 'binary'): Promise<ArrayBuffer>;
	readFile(filePath: string, encoding: 'utf8' | 'utf-8'): Promise<string>;
	async readFile(filePath: string, encoding: 'utf8' | 'utf-8' | 'binary'): Promise<string | ArrayBuffer> {
		const ret = await callAsyncApi(fs.readFile, { filePath, encoding: encoding === 'binary' ? undefined : encoding });
		return ret.data;
	}

	readFileSync(filePath: string, encoding: 'binary'): ArrayBuffer;
	readFileSync(filePath: string, encoding: 'utf8' | 'utf-8'): string;
	readFileSync(filePath: string, encoding: 'utf8' | 'utf-8' | 'binary'): string | ArrayBuffer {
		return fs.readFileSync(filePath, encoding === 'binary' ? undefined : encoding);
	}

	writeFile(filePath: string, data: ArrayBuffer, encoding: 'binary'): Promise<void>;
	writeFile(filePath: string, data: string, encoding: 'utf8' | 'utf-8'): Promise<void>;
	async writeFile(filePath: string, data: string | ArrayBuffer, encoding: string): Promise<void> {
		await callAsyncApi(fs.writeFile, { filePath, data, encoding: encoding as 'utf8' });
	}
	writeFileSync(filePath: string, data: ArrayBuffer, encoding: 'binary'): void;
	writeFileSync(filePath: string, data: string, encoding: 'utf8' | 'utf-8'): void;
	writeFileSync(filePath: string, data: string | ArrayBuffer, encoding: string): void {
		return fs.writeFileSync(filePath, data, encoding as 'utf8');
	}

	async copyFile(srcPath: string, destPath: string): Promise<void> {
		await callAsyncApi(fs.copyFile, { srcPath, destPath });
	}
}

export class WechatInPackageFileSystem extends WechatFileSystem {
	readonly subpackages?: ISubPackage[] = [];

	constructor(readonly root = '') {
		super(root);
		this.subpackages = config.subpackages || [];
	}

	exists(filePath: string): Promise<boolean> {
		if (filePath[0] !== '/') filePath = path.join(this.root, filePath);
		if (config.assets.files[filePath]) {
			return Promise.resolve(true);
		}
		return super.exists(filePath);
	}

	existsSync(filePath: string): boolean {
		if (filePath[0] !== '/') filePath = path.join(this.root, filePath);
		if (config.assets.files[filePath]) {
			return true;
		}
		return super.existsSync(filePath);
	}

	readFile(filePath: string, encoding: 'binary'): Promise<ArrayBuffer>;
	readFile(filePath: string, encoding: 'utf8' | 'utf-8'): Promise<string>;
	async readFile(filePath: string, encoding: 'binary' | 'utf8' | 'utf-8'): Promise<string | ArrayBuffer> {
		if (filePath[0] !== '/') filePath = path.join(this.root, filePath);
		await this.loadSubpackage(filePath);
		return super.readFile(filePath, encoding as 'utf8');
	}

	protected async loadSubpackage(filePath: string) {
		return new Promise<void>((resolve, reject) => {
			if (filePath[0] === '/') filePath = filePath.substring(1);
			const pkg = (this.subpackages || []).find(p => filePath.startsWith(p.root));
			if (pkg) {
				const loader = new SubPackageLoader(pkg);
				loader.verbose = config.verbose;
				const clear = () => loader.dispose();
				loader.event.once('done', () => {
					clear();
					resolve();
				});
				loader.event.once('failed', (err) => {
					clear();
					reject(err);
				});
				loader.start();
			} else {
				resolve();
			}
		});
	}

	readFileSync(filePath: string, encoding: 'binary'): ArrayBuffer;
	readFileSync(filePath: string, encoding: 'utf8' | 'utf-8'): string;
	readFileSync(filePath: string, encoding: 'binary' | 'utf8' | 'utf-8'): string | ArrayBuffer {
		if (filePath[0] !== '/') filePath = path.join(this.root, filePath);
		return super.readFileSync(filePath, encoding as 'utf8');
	}
}
