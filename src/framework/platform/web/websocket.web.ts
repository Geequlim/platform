export class TinyWebSocketW3C implements TinyWebSocket {

	protected readonly ws: WebSocket;

	onclose: (event: { code: number; reason: string; }) => void;
	/** 连接错误时被调用 */
	onerror: (event: { code: number; message: string; }) => void;
	/** 收到数据时被调用 */
	onmessage: (data: string | ArrayBuffer) => void;
	/** 建立连接后被调用 */
	onopen: () => null;

	constructor(url: string, protocols?: string | string[]) {
		this.ws = new WebSocket(url, protocols);
		this.ws.binaryType = 'arraybuffer';
		this.ws.onopen = (ev) => {
			console.log('connectSocket success', url, protocols);
			this.onopen && this.onopen();
		};
		this.ws.onclose = (ev) => {
			console.log('socketClose', url);
			this.onclose && this.onclose(ev);
		};
		this.ws.onerror = (ev) => this.onerror && this.onerror({ code: -1, message: 'Network error'});
		this.ws.onmessage = (ev) => this.onmessage && this.onmessage(ev.data);
	}

	async close(code?: number, reason?: string) {
		this.ws.close(code, reason);
	}

	async send(data: string | ArrayBuffer) {
		this.ws.send(data);
	}
}
