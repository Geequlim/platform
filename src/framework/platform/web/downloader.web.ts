import { XHRFileDownloader } from 'framework/tiny/utils/FileDownloader.xhr';
import { path } from 'framework/tiny/utils/path';

export class WebFileDownloader extends XHRFileDownloader {
	constructor(readonly fs: IFilesSystem) {
		super();
	}

	protected async saveResponse(request: XMLHttpRequest, task: IDownloadTask, onProgress?: (current: number, max: number) => void): Promise<void> {
		if (onProgress) onProgress(0, 1);
		const type = typeof request.response === 'string' ? 'utf8' : 'binary';
		await this.fs.mkdir(path.dirname(task.file), true);
		await this.fs.writeFile(task.file, request.response, type as unknown as 'binary');
		if (onProgress) onProgress(1, 1);
	}
}
