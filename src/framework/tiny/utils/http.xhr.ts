/* eslint-disable @typescript-eslint/no-explicit-any */
import querystring from 'qs';
type XMLHttpRequestMethod = 'GET' | 'POST' | 'DELETE' | 'PUT';

export class XHRHttp implements http {

	timeout: number = 5;
	headers: Record<string, string>;

	private async getResponseData(request: XMLHttpRequest): Promise<BodyInit> {
		let data: BodyInit;
		const contentType = request.getResponseHeader('content-type') || request.getResponseHeader('Content-Type') || '';
		if (contentType.indexOf('application/json') !== -1) {
			if (typeof request.response === 'string') {
				data = JSON.parse(request.response);
			} else {
				data = request.response;
			}
		} else if (contentType.indexOf('application/x-www-form-urlencoded') !== -1) {
			if (typeof request.response === 'string') {
				data = querystring.parse(request.response) as unknown as BodyInit;
			} else {
				data = request.response;
			}
		} else if (contentType.indexOf('text/plain') !== -1) {
			data = request.responseText || request.response;
		} else if (contentType.indexOf('application/octet-stream') !== -1) {
			data = request.response;
		}
		if (data === undefined) data = request.response as BodyInit;
		if (typeof data === 'string' && ((data.startsWith('{') && data.endsWith('}')) || (data.startsWith('[') && data.endsWith(']')))) {
			try { data = JSON.parse(data); } catch (error) { /* empty */ }
		}
		return data;
	}

	fetch(method: XMLHttpRequestMethod, url: string, body?: BodyInit | Record<string, any>, headers?: Record<string, string>, responseType?: string): Promise<any> {
		return new Promise((done, fail) => {
			let handled = false;
			const resolve = (ret: any) => {
				if (!handled) {
					handled = true;
					done(ret);
				}
			};
			const reject = (err: any) => {
				if (!handled) {
					handled = true;
					fail(err);
				}
			};
			const request = new XMLHttpRequest();
			request.timeout = this.timeout * 1000;
			request.onload = async () => {
				if (request.status >= 400) {
					reject({ data: request.response, method, url, code: request.status, message: `Response error` });
					return;
				}
				resolve(await this.getResponseData(request));
			};
			request.onerror = async (evt) => {
				const data = await this.getResponseData(request) || undefined;
				reject({ data, method, code: request.status || 0, url, message: `Reqest failed` });
			};
			request.onabort = () => { reject({ url, method, code: -1, message: `Request abort` }); };
			request.ontimeout = () => { reject({ url, method, code: -2, message: `Request timeout` }); };
			request.open(method, url);
			if (responseType) request.responseType = 'arraybuffer';
			headers = headers || this.headers;
			if (typeof headers === 'object') {
				for (const key of Object.getOwnPropertyNames(headers)) {
					request.setRequestHeader(key, headers[key]);
				}
			}

			const contentType = request.getResponseHeader('Content-Type') || request.getResponseHeader('content-type');
			if (!contentType) {
				if (typeof body === 'object') {
					if (!(body instanceof ArrayBuffer)) {
						request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
						body = JSON.stringify(body);
					}
				} else if (typeof body === 'string') {
					request.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
				}
			}
			request.send(body as string | ArrayBuffer);
		});
	}

	post(url: string, data?: BodyInit | Record<string, any>, headers?: Record<string, string>, responseType?: string): Promise<any> {
		return this.fetch('POST', url, data, headers, responseType);
	}

	get(url: string, params?: Record<string, any>, headers?: Record<string, string>, responseType?: string): Promise<any> {
		const qs = querystring.stringify(params as any);
		if (qs) {
			url += `?${qs}`;
		}
		return this.fetch('GET', url, undefined, headers, responseType);
	}
}
