type RecorderState = 'idle' | 'recording' | 'pause' | 'stop';
type IRecorderEventMap = {

	start(): void;
	stop(path?: string): void;

	pause(): void;
	resume(): void;
	error(err: string): void;

	'interruption-begin': () => void;
	'interruption-end': () => void;
	'state-changed': (next: RecorderState, last: RecorderState) => void;
};

/** 游戏录制器 */
declare interface IGameRecorder extends IEventObject<IRecorderEventMap> {

	/** 当前的状态 */
	state: RecorderState;

	/**
	 * 开始录屏
	 * @param duration 录屏时长（秒）
	 * @param frameRate 帧率，默认30
	 */
	start(duration?: number, frameRate?: number): void;

	/** 停止录屏 */
	stop(): void;

	/** 暂停 */
	pause(): void;

	/** 继续录屏 */
	resume(): void;

	/** 分享录屏 */
	share(params?: Record<string, any>): Promise<{ videoId: string; }>;
}
