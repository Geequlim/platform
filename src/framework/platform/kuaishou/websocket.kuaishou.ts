export class KuaiShouWebSocket implements TinyWebSocket {

	protected ws: ks.SocketTask;

	onclose: (event: { code: number; reason: string; }) => void;
	/** 连接错误时被调用 */
	onerror: (event: { code: number; message: string; }) => void;
	/** 收到数据时被调用 */
	onmessage: (data: string | ArrayBuffer) => void;
	/** 建立连接后被调用 */
	onopen: () => null;

	constructor(url: string, protocols?: string | string[]) {
		this.ws = ks.connectSocket({
			url,
			protocols: protocols ? (Array.isArray(protocols) ? protocols : [protocols]) : [],
			success: () => {
			},
			fail: (err: { errMsg: string; }) => {
				this.onerror && this.onerror({ code: -1, message: err.errMsg });
			}
		});
		this.ws.onOpen((ev) => {
			console.log('ks.onOpen', url, typeof this.onopen);
			this.onopen && this.onopen();
		});
		this.ws.onClose((ev) => {
			console.log('ks.onClose', url, typeof this.onclose);
			this.onclose && this.onclose(ev);
		});
		this.ws.onError((ev) => {
			console.error('ks.onError', url, typeof this.onerror);
			this.onerror && this.onerror({ code: -1, message: 'Network error' });
		});
		this.ws.onMessage((ev) => this.onmessage && this.onmessage(ev.data));
	}

	close(code?: number, reason?: string) {
		return new Promise<void>((resolve, reject) => {
			this.ws.close({ code, reason, success: resolve, fail: reject });
		});
	}

	send(data: string | ArrayBuffer) {
		return new Promise<void>((resolve, reject) => {
			this.ws.send({
				data,
				success: resolve,
				fail: (err) => {
					this.onerror && this.onerror({ code: -1, message: err.errMsg });
					reject(err);
				}
			});
		});
	}
}
