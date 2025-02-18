/* eslint-disable @typescript-eslint/no-explicit-any */
import { BodyInit, XMLHttpRequestBase, XMLHttpRequestEventTarget, XMLHttpRequestMethod, XMLHttpRequestReadyState, XMLHttpRequestUpload } from 'framework/webapi/xhr/xhr.common';
import HttpStatusCode from 'http-status-codes';
import MIMEType from 'whatwg-mimetype';

class KSXMLHttpRequest extends XMLHttpRequestBase {
	protected $request: ReturnType<typeof ks.request>;
	private $status: number;
	private $requestResult: { data: string | object | ArrayBuffer; statusCode: number; header: Record<string, string>; };
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
		this.$request = ks.request({
			url: this.url.url,
			method: this.$method as any,
			data: body,
			dataType: '其他',
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
globalSet('XMLHttpRequestEventTarget', XMLHttpRequestEventTarget);
globalSet('XMLHttpRequestReadyState', XMLHttpRequestReadyState);
globalSet('XMLHttpRequestUpload', XMLHttpRequestUpload);
globalSet('XMLHttpRequest', KSXMLHttpRequest);

