/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'framework/tiny/core/EventEmitter';
import { PureBasicStateMachine } from 'framework/tiny/utils/StateMachine.basic';

export interface DevShareParams {
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

export class DevGameRecorder extends PureBasicStateMachine<RecorderState> implements IGameRecorder {
	readonly event: EventEmitter<IRecorderEventMap>;
	readonly lastRecordVideoId: number;
	public get recordSharedCount(): number { return this.$recordSharedCount; }
	protected $recordSharedCount: number;

	/**
	 * 开始录屏
	 * @param duration 录屏时长（秒）
	 * @param frameRate 帧率，默认30
	 */
	start(duration: number, frameRate: number = 30) {
		this.state = 'recording';
	}

	/** 停止录屏 */
	stop() {
		this.state = 'stop';
	}

	/** 暂停 */
	pause() {
		this.state = 'pause';
	}

	/** 继续录屏 */
	resume() {
		this.state = 'recording';
	}

	/** 分享录屏 */
	async share(params: DevShareParams = { title: '测试' }): Promise<{ videoId: string; }> {
		const extra = {
			withVideoId: true,
		};
		for (const key of ['videoTopics', 'video_title', 'hashtag_list', 'defaultBgm', 'videoTag']) {
			// @ts-ignore
			if (params[key]) extra[key] = params[key];
		}
		const value = {
			title: params.title,
			desc: params.desc,
			imageUrl: params.imageUrl,
			templateId: params.templateId,
			channel: 'video',
			extra
		};
		console.log('模拟分享录屏', value);
		try {
			await getPlatform().accept('选择分享录屏的结果', '模拟录屏分享', '分享成功', '取消分享');
		} catch (error) {
			throw new Error('取消视频分享');
		}
		return { videoId: undefined };
	}

}
