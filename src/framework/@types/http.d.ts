type HttpRequestMethod = 'GET' | 'POST' | 'DELETE' | 'PUT';

declare interface http {
	/** 发起 HTTP 请求 */
	fetch(method: HttpRequestMethod, url: string, body?: BodyInit | Record<string, any>, headers?: Record<string, string>, responseType?: string): Promise<any>;
	/** 发起 POST 请求 */
	post(url: string | string, data?: BodyInit | Record<string, any>, headers?: Record<string, string>, responseType?: string): Promise<any>;
	/** 发起 GET 请求 */
	get(url: string | string, params?: Record<string, any>, headers?: Record<string, string>, responseType?: string): Promise<any>;
}
