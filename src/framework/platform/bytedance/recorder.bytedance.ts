/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'framework/tiny/core/EventEmitter';
import { PureBasicStateMachine } from 'framework/tiny/utils/StateMachine.basic';

export interface BytedanceShareParams {
	/** 分享模板 ID */
	templateId?: string;
	/** 标题 */
	title: string;
	/** 文字内容 */
	desc?: string;
	/** 图片地址 */
	imageUrl?: string;
	/** 视频话题(仅抖音支持) ，目前由 hashtag_list 代替，为保证兼容性，建议同时填写两个。 */
	videoTopics?: string[];
	/** 生成输入的默认文案 */
	video_title?: string;
	/** 视频话题(仅抖音支持) */
	hashtag_list?: string[];
	/** 抖音 pgc 音乐的短链(仅抖音支持，需要基础库版本大于 1.90) 。形如 https://v.douyin.com/JmcxWo8/， 参考 抖音小游戏录屏带配乐能力 */
	defaultBgm?: string;
	/** 分享视频的标签，可以结合获取抖音视频排行榜使用 */
	videoTag?: string;
}

export class BytedanceGameRecorder extends PureBasicStateMachine<RecorderState> implements IGameRecorder {
	readonly event: EventEmitter<IRecorderEventMap>;
	readonly lastRecordVideoPath: string;
	readonly lastRecordVideoId: number;
	public get recordSharedCount(): number { return this.$recordSharedCount; }
	protected $recordSharedCount: number;

	constructor(readonly native: tt.GameRecorderManager) {
		super('idle');
		this.native.onStart(() => {
			this.state = 'recording';
			this.event.emit('start');
		});
		this.native.onStop(res => {
			this.state = 'stop';
			this.event.emit('stop', res.videoPath);
			(this.lastRecordVideoPath as string) = res.videoPath;
		});
		this.native.onPause(() => {
			this.state = 'pause';
			this.event.emit('pause');
		});
		this.native.onResume(() => {
			this.state = 'recording';
			this.event.emit('resume');
		});
		this.native.onError(err => {
			this.state = 'idle';
			this.event.emit('error', err.errMsg);
		});
		this.native.onInterruptionBegin(() => this.event.emit('interruption-begin'));
		this.native.onInterruptionEnd(() => this.event.emit('interruption-end'));
	}

	/**
	 * 开始录屏
	 * @param duration 录屏时长（秒）
	 * @param frameRate 帧率，默认30
	 */
	start(duration: number, frameRate: number = 30) {
		this.native.start({ duration, frameRate });
	}

	/** 停止录屏 */
	stop() {
		this.native.stop();
	}

	/** 暂停 */
	pause() {
		this.native.pause();
	}

	/** 继续录屏 */
	resume() {
		this.native.resume();
	}

	/** 分享录屏 */
	share(params: BytedanceShareParams = { title: '测试' }): Promise<{ videoId: string; }> {
		return new Promise((resolve, reject) => {
			if (!this.lastRecordVideoPath) reject();
			const extra = {
				withVideoId: true,
				videoPath: this.lastRecordVideoPath
			};
			for (const key of ['videoTopics', 'video_title', 'hashtag_list', 'defaultBgm', 'videoTag']) {
				// @ts-expect-error
				if (params[key]) extra[key] = params[key];
			}
			tt.shareAppMessage({
				title: params.title,
				desc: params.desc,
				imageUrl: params.imageUrl,
				templateId: params.templateId,
				channel: 'video',
				extra,
				success: (ret: any) => {
					this.$recordSharedCount += 1;
					resolve(ret);
				},
				fail: () => {
					reject(new Error('分享录屏失败'));
				}
			});
		});
	}

}
