import { path } from 'framework/tiny/utils/path';

export class BytedanceFileDownloader implements IFileDownloader {

	constructor(readonly fs: IFilesSystem) { }

	load(url: string, file: string, options?: IDownloadFileOptions): IDownloadTask {
		const task: IDownloadTask = { url, file, abort: null };
		let maxSize = 0;
		let timerID = 0 as unknown as ReturnType<typeof setTimeout>;
		const clear = () => clearTimeout(timerID);
		const ttTask = tt.downloadFile({
			url,
			header: options?.headers,
			success: async (ret) => {
				clear();
				try {
					const filePath = file;
					await this.fs.mkdir(path.dirname(filePath), true);
					await this.fs.copyFile(ret.tempFilePath, filePath);
					(task.file as string) = filePath;
					if (task.onprogress) task.onprogress(maxSize, maxSize);
					if (task.onload) task.onload();
				} catch (error) {
					task.error = error;
					task.onerror && task.onerror(error);
				}
			},
			fail(err) {
				clear();
				task.error = err;
				task.onerror && task.onerror(err);
			}
		});
		if (options?.timeout) {
			timerID = setTimeout(() => {
				ttTask.abort();
				task.error = new Error('timeout');
			}, options.timeout);
		}
		ttTask.onProgressUpdate(progress => {
			maxSize = progress.totalBytesExpectedToWrite;
			if (task.onprogress) task.onprogress(progress.totalBytesWritten, progress.totalBytesExpectedToWrite);
		});
		task.abort = () => ttTask.abort();
		return task;
	}
}
