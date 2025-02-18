import { path } from 'framework/tiny/utils/path';
import { SubPackageLoader } from '../utils/SubPackageLoader';

const fs = ks.getFileSystemManager();
const REVERSED_DIRS = [
	ks.env.USER_DATA_PATH,
	'ksfile://temp'
];

export class KuaishouFileSystem implements IFilesSystem {
	constructor(readonly name: string) { }

	async exists(filePath: string): Promise<boolean> {
		try {
			if (REVERSED_DIRS.includes(filePath)) return true;
			fs.accessSync(filePath);
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

	stat(filePath: string): Promise<Stat> {
		return new Promise((resolve, reject) => {
			if (REVERSED_DIRS.includes(filePath)) {
				resolve({
					size: 0,
					lastModifiedTime: 0,
					isFile() { return false; },
					isDirectory() { return true; }
				});
				return;
			} else {
				const inpkgFile = config.assets.files[filePath];
				if (inpkgFile) {
					resolve({
						size: inpkgFile.size,
						lastModifiedTime: inpkgFile.mtime,
						isDirectory() { return false; },
						isFile() { return true; }
					});
				} else {
					fs.stat({
						path: filePath,
						success: (ret) => resolve(ret.stats as ks.Stats),
						fail: reject
					});
				}
			}
		});
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
			return ret as ks.Stats;
		}
	}

	unlink(filePath: string): Promise<void> {
		return new Promise((resolve, reject) => {
			fs.unlink({ filePath, success: resolve, fail: reject });
		});
	}

	rename(oldPath: string, newPath: string): Promise<void> {
		return new Promise((resolve, reject) => {
			fs.rename({ oldPath, newPath, success: resolve, fail: reject });
		});
	}

	async mkdir(dirPath: string, recursive: boolean): Promise<void> {
		if (this.existsSync(dirPath)) return;
		await fs.mkdirSync(dirPath, recursive);
	}

	mkdirSync(dirPath: string, recursive: boolean) {
		if (this.existsSync(dirPath)) return;
		fs.mkdirSync(dirPath, recursive);
	}

	rmdir(dirPath: string, recursive: boolean): Promise<void> {
		return new Promise((resolve, reject) => {
			fs.rmdir({ dirPath, recursive, success: resolve, fail: reject });
		});
	}

	readdir(dirPath: string): Promise<string[]> {
		return new Promise((resolve, reject) => {
			dirPath = dirPath.endsWith('/') ? dirPath : dirPath + '/';
			fs.readdir({
				dirPath,
				success: (ret) => resolve(ret.files),
				fail: reject
			});
		});
	}

	readFile(filePath: string, encoding: 'binary'): Promise<ArrayBuffer>;
	readFile(filePath: string, encoding: 'utf8' | 'utf-8'): Promise<string>;
	readFile(filePath: string, encoding: 'utf8' | 'utf-8' | 'binary'): Promise<string | ArrayBuffer> {
		const params = { filePath };
		if (encoding !== 'binary') Object.assign(params, { encoding });
		return new Promise((resolve, reject) => {
			fs.readFile({
				...params,
				success: (ret) => {
					resolve(ret.data);
				},
				fail: (err) => {
					reject(new Error('读取文件出错: ' + filePath));
				}
			});
		});
	}

	readFileSync(filePath: string, encoding: 'binary'): ArrayBuffer;
	readFileSync(filePath: string, encoding: 'utf8' | 'utf-8'): string;
	readFileSync(filePath: string, encoding: 'utf8' | 'utf-8' | 'binary'): string | ArrayBuffer {
		return fs.readFileSync(filePath, encoding === 'binary' ? undefined : encoding);
	}

	writeFile(filePath: string, data: ArrayBuffer, encoding: 'binary'): Promise<void>;
	writeFile(filePath: string, data: string, encoding: 'utf8' | 'utf-8'): Promise<void>;
	writeFile(filePath: string, data: string | ArrayBuffer, encoding: string): Promise<void> {
		return new Promise((resolve, reject) => {
			fs.writeFile({
				filePath,
				encoding: encoding as 'utf8',
				data,
				success: resolve,
				fail: reject
			});
		});
	}

	writeFileSync(filePath: string, data: ArrayBuffer, encoding: 'binary'): void;
	writeFileSync(filePath: string, data: string, encoding: 'utf8' | 'utf-8'): void;
	writeFileSync(filePath: string, data: string | ArrayBuffer, encoding: string): void {
		return fs.writeFileSync(filePath, data, encoding as 'utf8');
	}

	copyFile(srcPath: string, destPath: string): Promise<void> {
		return new Promise((resolve, reject) => {
			fs.copyFile({ srcPath, destPath, success: resolve, fail: reject });
		});
	}
}

export class KuaishouInPackageFileSystem extends KuaishouFileSystem {
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
