import { path } from '../path';

export class XHRFileSystem implements IReadonlyFilesSystem {

	constructor(readonly root: string) {}

	exists(filePath: string): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	existsSync(filePath: string): boolean {
		throw new Error('Method not implemented.');
	}

	stat(filePath: string): Promise<Stat> {
		throw new Error('Method not implemented.');
	}

	statSync(filePath: string): Stat {
		throw new Error('Method not implemented.');
	}

	readdir(dirPath: string): Promise<string[]> {
		throw new Error('Method not implemented.');
	}

	readFile(filePath: string, encoding: 'binary'): Promise<ArrayBuffer>;
	readFile(filePath: string, encoding: 'utf8' | 'utf-8'): Promise<string>;
	readFile(filePath: unknown, encoding: unknown): Promise<string | ArrayBuffer> {
		const url = this.root ? path.join(this.root, filePath as string) : filePath as string;
		return new Promise((resolve, reject) => {
			const request = new XMLHttpRequest();
			request.responseType = encoding === 'binary' ? 'arraybuffer' : 'text';
			request.onload = () => {
				if (request.status >= 400) {
					reject(request.response || { url: url, code: request.status, message: 'Network error' });
					return;
				}
				resolve(request.response);
			};
			request.onerror = () => {
				reject(request.response || { url: url, code: request.status, message: 'Network error' });
			};
			request.ontimeout = () => reject(request.response || { url, code: -2, message: 'Request timeout' });
			request.open('GET', url);
			request.send();
		});
	}
}
