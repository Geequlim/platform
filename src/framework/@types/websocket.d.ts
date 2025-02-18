declare interface TinyWebSocket {

	/** 断开连接时被调用 */
	onclose: (event: { code: number; reason: string; }) => void;
	/** 连接错误时被调用 */
	onerror: (event: { code: number; message: string }) => void;
	/** 收到数据时被调用 */
	onmessage: (data: string | ArrayBuffer) => void;
	/** 建立连接后被调用 */
	onopen: () => void;
	/** 断开连接 */
	close(code?: number, reason?: string): Promise<void>;
	/** 发送数据 */
	send(data: string | ArrayBufferLike): Promise<void>;
}

declare type TinyWebSocketClass = new (url: string, protocols?: string | string[]) => TinyWebSocket;
