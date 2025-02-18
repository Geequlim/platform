import { BodyInit, XMLHttpRequestBase, XMLHttpRequestEventTarget, XMLHttpRequestMethod, XMLHttpRequestReadyState, XMLHttpRequestUpload } from 'framework/webapi/xhr/xhr.common';
import HttpStatusCode from 'http-status-codes';
import MIMEType from 'whatwg-mimetype';

class BytedanceXMLHttpRequest extends XMLHttpRequestBase {
	protected $request: tt.RequestTask;
	private $status: number;
	private $requestResult: tt.RequestResult;
	private $requestError: { errMsg: string; };
	private $timeoutUntil: number;

	get status(): number {
		return this.$status;
	}

	get responseURL(): string {
		if (this.url) return this.url.url;
		return null;
	}

	get responseXML(): string {
		return this.responseText;
	}

	get responseText(): string {
		if (!this.$requestResult) return undefined;
		if (typeof this.$requestResult.data === 'string') {
			return this.$requestResult.data;
		} else if (typeof this.$requestResult.data === 'object') {
			if (this.$requestResult.data instanceof ArrayBuffer) {
				return `[ArrayBuffer(${this.$requestResult.data.byteLength})]`;
			} else {
				return JSON.stringify(this.$requestResult.data);
			}
		}
		return undefined;
	}

	getAllResponseHeaders(): string {
		let text = '';
		if (this.$requestResult && this.$requestResult.header) {
			for (const pair of Object.entries(this.$requestResult.header)) {
				text += pair.join(': ');
			}
		}
		return text;
	}

	getResponseHeader(name: string): string {
		return this.$requestResult?.header[name] || this.$requestResult?.header[name.toLowerCase()];
	}

	constructor() {
		super();
	}

	open(method: XMLHttpRequestMethod, url: string, async?: boolean, username?: string | null, password?: string | null): void {
		this.$url = parseUrl(url);
		this.$status = null;
		this.$method = method;
		this.$readyState = XMLHttpRequestReadyState.UNSENT;
		this.$connectionStartAt = Date.now();
	}

	send(body?: BodyInit | null): void {
		this.$requestResult = null;
		this.$requestError = null;
		this.readyState = XMLHttpRequestReadyState.OPENED;
		this.$status = HttpStatusCode.CONTINUE;
		this.$request = tt.request({
			url: this.url.url,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			method: this.$method as any,
			data: body,
			dataType: 'string',
			header: this.$requestHeaders,
			responseType: this.responseType === 'arraybuffer' ? 'arraybuffer' : 'text',
			success: ret => this.$requestResult = ret,
			fail: err => this.$requestError = err
		});
		this.readyState = XMLHttpRequestReadyState.LOADING;

		if (typeof this.timeout === 'number') {
			this.$timeoutUntil = Date.now() + this.timeout;
		}
		this.$dispatch_event('loadstart');
		this.$start_poll();
	}

	abort(): void {
		if (this.$request) {
			this.$request.abort();
			this.$dispatch_event('abort');
			this.$stop_poll();
		}
	}

	protected $getProgress(): ProgressEventInit {
		return {
			lengthComputable: false,
			loaded: this.$requestResult ? 1 : 0,
			total: 1
		};
	}

	public $tick() {
		if (this.$request) {
			if (this.$requestResult) {
				this.$status = this.$requestResult.statusCode;
			}
			if (this.$status) {
				this.readyState = XMLHttpRequestReadyState.OPENED;
			}

			const now = Date.now();
			if (this.$timeoutUntil && now > this.$timeoutUntil) {
				this.$request.abort();
				this.$status = HttpStatusCode.REQUEST_TIMEOUT;
				this.$dispatch_event('timeout');
				this.$finishedLoad();
				return;
			}

			if (this.$requestResult || this.$requestError) {
				this.$finishedLoad();
			}
		}
	}

	private $finishedLoad() {
		this.$stop_poll();
		this.readyState = XMLHttpRequestReadyState.DONE;
		if (this.$requestResult) {
			this.$status = this.$requestResult.statusCode;
			this.$requestHeaders = this.$requestResult.header;
			this.$processResponse(this.$requestResult.data);
		}
		if (this.status == HttpStatusCode.OK) {
			this.$dispatch_event('progress');
			this.$dispatch_event('load');
		} else {
			this.$dispatch_event('error');
		}
		this.$dispatch_event('loadend');
	}

	protected $processResponse(data: unknown) {
		if (this.responseType === undefined) {
			const mime = new MIMEType(this.$overridedMime || this.getResponseHeader('Content-Type') || 'text/plain');
			if (mime.type === 'application' && mime.subtype === 'json') {
				this.responseType = 'json';
			} else if (mime.type === 'text') {
				this.responseType = 'text';
			} else if (mime.isXML() || mime.isHTML() || mime.isJavaScript()) {
				this.responseType = 'text';
			} else {
				this.responseType = 'arraybuffer';
			}
		}
		switch (this.responseType) {
			case '':
			case 'document':
			case 'text':
				this.$response = this.responseText;
				break;
			case 'json': {
				const text = this.responseText;
				if (text) {
					this.$response = JSON.parse(text);
				} else {
					this.$response = null;
				}
			} break;
			default:
				this.$response = data;
				break;
		}
	}
}

import { globalSet } from 'framework/tiny/core/global';
import { parseUrl } from 'framework/webapi/xhr/url';

const defineXMLHttpRequest = () => {
	globalSet('XMLHttpRequestEventTarget', XMLHttpRequestEventTarget);
	globalSet('XMLHttpRequestReadyState', XMLHttpRequestReadyState);
	globalSet('XMLHttpRequestUpload', XMLHttpRequestUpload);
	globalSet('XMLHttpRequest', BytedanceXMLHttpRequest);
};

declare const nativeSystemInfo: ReturnType<typeof tt.getSystemInfoSync>;
declare const originalXHR: typeof XMLHttpRequest;
if (typeof document === 'object' && typeof nativeSystemInfo === 'object' && nativeSystemInfo.platform === 'android') {
	// 安卓平台使用 tt.request
	defineXMLHttpRequest();
} else if (typeof originalXHR !== 'undefined') {
	// iOS 平台使用浏览器的 XMLHttpRequest
	// 抖音小游戏在启动 Unity 前将次功能使用 tt.request 的实现版本对 XHR 进行了替换与我们的实现方案基本一致
	//   BUG: 怎么能相信抖音在发网络请求的基本实现都能有问题, 在少部分 iOS 设备上请求不成功，报错没联网
	// 我们在 adaptor 中将浏览器的 XMLHttpRequest 备份了一下，这里执行恢复
	globalSet('XMLHttpRequest', originalXHR);
}

