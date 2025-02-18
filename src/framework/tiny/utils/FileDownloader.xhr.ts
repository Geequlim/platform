export class XHRFileDownloader implements IFileDownloader {

	load(url: string, file: string, options?: IDownloadFileOptions): IDownloadTask {
		const request = new XMLHttpRequest();
		request.responseType = options?.type === 'text' ? 'text' : 'arraybuffer';
		const task: IDownloadTask = {
			url,
			file,
			abort: () => request.abort(),
		};
		if (typeof options?.headers === 'object') {
			for (const key of Object.getOwnPropertyNames(options.headers)) {
				request.setRequestHeader(key, options.headers[key]);
			}
		}
		request.timeout = options?.timeout;
		request.onload = () => {
			if (request.status >= 400) {
				task.error = request.response || { url, code: request.status, message: 'Network error' };
				if (task.onerror) task.onerror(task.error);
				return;
			}
			this.saveResponse(request, task).then(() => {
				if (task.onload) {
					task.onload();
				}
			}).catch(err => {
				task.error = err;
				if (task.onerror) task.onerror(err);
			});
		};
		request.onprogress = (ev) => {
			if (task.onprogress) {
				task.onprogress(ev.loaded, ev.total);
			}
		};
		request.onerror = () => {
			task.error = request.response || { url, code: request.status, message: 'Network error' };
			if (task.onerror) task.onerror(task.error);
		};
		request.onabort = () => task.error = { url, code: -1, message: 'Request abort' };
		request.ontimeout = () => task.error = { url, code: -2, message: 'Request timeout' };
		request.open('GET', url);
		request.send();
		return task;
	}

	protected saveResponse(request: XMLHttpRequest, task: IDownloadTask, onProgress?: (current: number, max: number) => void): Promise<void> {
		if (onProgress) {
			onProgress(0, 1);
			onProgress(1, 1);
		}
		return Promise.resolve();
	}

}
