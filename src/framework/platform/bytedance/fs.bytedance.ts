import { path } from 'framework/tiny/utils/path';
const fs = tt.getFileSystemManager();
/** 调用头条的异步API */
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

export const DouyinFileSystem = {
	USER_DATA_PATH: 'scfile://user',
	PACKAGE_DATA_PATH: 'scfile://pkg',
	TEMP_DATA_PATH: 'scfile://temp'
};

const REVERSED_DIRS = [
	DouyinFileSystem.USER_DATA_PATH,
	DouyinFileSystem.PACKAGE_DATA_PATH,
	DouyinFileSystem.TEMP_DATA_PATH
];

export class BytedanceFileSystem implements IFilesSystem, ISyncReadonlyFilesSystem {
	constructor(readonly name: string) {
		for (const reversed of REVERSED_DIRS.slice()) {
			if (!this.existsSync(reversed)) {
				REVERSED_DIRS.splice(REVERSED_DIRS.indexOf(reversed), 1);
			}
		}
	}

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
			const stat = ret.stat || ret.stats;
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
			const ret = fs.statSync(filePath);
			return ret;
		}
	}

	unlink(filePath: string): Promise<void> {
		return callAsyncApi(fs.unlink, { filePath });
	}

	rename(oldPath: string, newPath: string): Promise<void> {
		return callAsyncApi(fs.rename, { oldPath, newPath });
	}

	/** 抖音小游戏在启动游戏时批量加载资源可能导致重复创建目录而报错，这里启用同步操作 */
	async mkdir(dirPath: string, recursive: boolean, forceSync = true): Promise<void> {
		if (this.existsSync(dirPath)) return;
		if (recursive) {
			const dirs = [] as string[];
			let dir = dirPath;
			let exists = await this.exists(dir);
			while (dir && !exists) {
				dirs.push(dir);
				dir = path.dirname(dir);
				exists = this.existsSync(dir);
			}
			dirs.reverse();
			for (const dir of dirs) {
				if (forceSync) {
					fs.mkdirSync(dir);
				} else {
					await callAsyncApi(fs.mkdir, { dirPath: dir });
				}
			}
		} else {
			if (forceSync) {
				fs.mkdirSync(dirPath);
			} else {
				await callAsyncApi(fs.mkdir, { dirPath });
			}
		}
	}

	async mkdirSync(dirPath: string, recursive: boolean) {
		if (this.existsSync(dirPath)) return;
		if (recursive) {
			const dirs = [] as string[];
			let dir = dirPath;
			let exists = await this.exists(dir);
			while (dir && !exists) {
				dirs.push(dir);
				dir = path.dirname(dir);
				exists = await this.exists(dir);
			}
			dirs.reverse();
			for (const dir of dirs) {
				fs.mkdirSync(dir);
			}
		} else {
			fs.mkdirSync(dirPath);
		}
	}

	async rmdir(dirPath: string, recursive: boolean, forceSync = true): Promise<void> {
		if (forceSync) {
			fs.mkdirSync(dirPath);
		} else {
			await callAsyncApi(fs.rmdir, { dirPath, recursive });
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
	writeFile(filePath: string, data: string | ArrayBuffer, encoding: string): Promise<void> {
		return callAsyncApi(fs.writeFile, { filePath, data, encoding });
	}
	writeFileSync(filePath: string, data: ArrayBuffer, encoding: 'binary'): void;
	writeFileSync(filePath: string, data: string, encoding: 'utf8' | 'utf-8'): void;
	writeFileSync(filePath: string, data: string | ArrayBuffer, encoding: string): void {
		return fs.writeFileSync(filePath, data, encoding);
	}

	copyFile(srcPath: string, destPath: string): Promise<void> {
		return callAsyncApi(fs.copyFile, { srcPath, destPath });
	}
}


export class BytedanceInPackageFileSystem extends BytedanceFileSystem {

	constructor(readonly root: string = '') {
		super('fs.readonly');
	}

	exists(filePath: string): Promise<boolean> {
		filePath = path.join(this.root, filePath);
		if (config.assets.files[filePath]) {
			return Promise.resolve(true);
		}
		return super.exists(filePath);
	}

	existsSync(filePath: string): boolean {
		filePath = path.join(this.root, filePath);
		if (config.assets.files[filePath]) {
			return true;
		}
		return super.existsSync(filePath);
	}

	readFile(filePath: string, encoding: 'binary'): Promise<ArrayBuffer>;
	readFile(filePath: string, encoding: 'utf8' | 'utf-8'): Promise<string>;
	async readFile(filePath: string, encoding: 'binary' | 'utf8' | 'utf-8'): Promise<string | ArrayBuffer> {
		filePath = path.join(this.root, filePath);
		return super.readFile(filePath, encoding as 'utf8');
	}

	readFileSync(filePath: string, encoding: 'binary'): ArrayBuffer;
	readFileSync(filePath: string, encoding: 'utf8' | 'utf-8'): string;
	readFileSync(filePath: string, encoding: 'binary' | 'utf8' | 'utf-8'): string | ArrayBuffer {
		filePath = path.join(this.root, filePath);
		return super.readFileSync(filePath, encoding as 'utf8');
	}
}
