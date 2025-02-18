import { EventEmitter } from 'framework/tiny/core/EventEmitter';
import { PureBasicStateMachine } from 'framework/tiny/utils/StateMachine.basic';

export class KuaishouGameRecorder extends PureBasicStateMachine<RecorderState> implements IGameRecorder {
	readonly event: EventEmitter<IRecorderEventMap>;
	readonly lastRecordVideoId: number;
	public get recordSharedCount(): number { return this.$recordSharedCount; }
	protected $recordSharedCount: number;

	readonly native = ks.getGameRecorder();
	constructor() {
		super('idle');
		this.native.on('start', () => {
			this.state = 'recording';
			this.event.emit('start');
		});
		this.native.on('stop', res => {
			this.state = 'stop';
			(this.lastRecordVideoId as number) = res.videoID;
			this.event.emit('stop');
		});
		this.native.on('pause', () => {
			this.state = 'pause';
			this.event.emit('pause');
		});
		this.native.on('resume', () => {
			this.state = 'recording';
			this.event.emit('resume');
		});
		this.native.on('error', err => {
			this.state = 'idle';
			this.event.emit('error', err.msg);
		});
		this.native.on('abort', () => {
			this.state = 'idle';
			this.event.emit('interruption-end');
		});
	}

	/**
	 * 开始录屏
	 * @param duration 录屏时长（秒）
	 * @param frameRate 帧率，默认30
	 */
	start(duration: number, frameRate: number = 30) {
		this.native.start();
	}

	/** 停止录屏 */
	async stop() {
		await this.native.stop();
	}

	/** 暂停 */
	async pause() {
		await this.native.pause();
	}

	/** 继续录屏 */
	async resume() {
		await this.native.resume();
	}

	/** 分享录屏 */
	share(params: { templateId?: string, query?: Record<string, any> } = {}): Promise<{ videoId: string; }> {
		return new Promise((resolve, reject) => {
			this.native.publishVideo({
				video: this.lastRecordVideoId,
				mouldId: params.templateId || undefined,
				query: params.query ? JSON.stringify(params.query) : undefined,
				callback: (err) => {
					if (err) {
						reject(new Error(`发布视频出错：${err.code} ${err.msg}`));
					} else {
						resolve({ videoId: undefined });
					}
				}
			});
		});
	}

}
