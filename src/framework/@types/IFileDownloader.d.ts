declare interface IDownloadTask {
	/** 取消下载 */
	abort();
	/** 下载进度事件 */
	onprogress?: (current: number, max: number) => void;
	/** 下载完成事件 */
	onload?: () => void;
	/** 下载出错事件 */
	onerror?: (error: any) => void;
	/** 错误信息 */
	error?: any;
	/** 请求的 url */
	readonly url: string;
	/** 文件保存的实际路径，注意可能与传入的路径不一致，如添加用户可写路径等操作，需要以返回值的路径为准 */
	readonly file: string;
}

declare interface IDownloadFileOptions {
	/** 存储类型 */
	type: 'text' | 'arraybuffer';
	/** 请求 header */
	headers?: Record<string, string>;
	/** 超时时间 单位 ms */
	timeout?: number;
}

declare interface IFileDownloader {
	load(url: string, file: string, options?: IDownloadFileOptions): IDownloadTask;
}
