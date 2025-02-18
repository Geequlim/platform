declare interface AsyncCallbackOptions<T = any> {
	success?(ret: T): void;
	fail?(err: { errMsg: string; }): void;
	complete?(): void;
}
declare namespace tt {
	const env: {
		USER_DATA_PATH: string;
		/** @deprecated 抖音 Unity WebGL 小游戏, iOS 29.1.0 后不再提供 */
		TEMP_DATA_PATH?: string;
		/** @deprecated 抖音 Unity WebGL 小游戏, iOS 29.1.0 后不再提供 */
		PACKAGE_DATA_PATH?: string;
		/** @deprecated 抖音 Unity WebGL 小游戏, 安卓环境未提供 */
		VERSION: string;
	};

	export function getEnvInfoSync(): {
		microapp: {
			/** 小游戏版本号（如果是预览版本的小游戏，该值为preview） */
			mpVersion: string;
			/** 小游戏环境; */
			envType: 'production' | 'development' | 'preview' | 'gray';
			/** 小游戏 appId; */
			appId: string;
		};
		common: {
			/** 用户数据存储的路径（默认值 ttfile://user） */
			USER_DATA_PATH: string;
			/** 临时数据存储的路径（默认值 ttfile://temp） */
			TEMP_DATA_PATH: string;
		}
	}

	export function getSystemInfoSync(): {
		/** 操作系统版本 如 "11.4" | "8.0.0" */
		system: string;
		/** 操作系统类型 如 "ios" | "android" */
		platform: string;
		/** 设备语言 如 'zh_CN' */
		language: string;
		/** 手机品牌 如 "Apple" | "Xiaomi" */
		brand: string;
		/** 手机型号 */
		model: string;
		/** 宿主 App 版本号（宿主指今日头条、抖音等 如 	6.7.8 */
		version: string;
		/** 宿主 APP 名称 如 "Toutiao" */
		appName: string;
		/** 客户端基础库版本 如 "1.0.0" */
		SDKVersion: string;
		/** 屏幕宽度 */
		screenWidth: number;
		/** 屏幕高度 */
		screenHeight: number;
		/** 可使用窗口宽度 */
		windowWidth: number;
		/** 可使用窗口高度 */
		windowHeight: number;
		/** 设备像素比 */
		pixelRatio: number;
		/** 安全区域指的是一个可视窗口范围，处于安全区域的内容不受圆角（corners）、齐刘海（sensor housing）、小黑条（Home Indicator）影响。 */
		safeArea: {
			/** 安全区域左上角横坐标 */
			left: number;
			/** 安全区域右下角横坐标 */
			right: number;
			/** 安全区域左上角纵坐标 */
			top: number;
			/** 安全区域右下角纵坐标 */
			bottom: number;
			/** 安全区域的宽度，单位逻辑像素 */
			width: number;
			/** 安全区域的高度，单位逻辑像素 */
			height: number;
		};
		/** 机型性能评分 */
		deviceScore: {
			/** cpu 分数 */
			cpu: number;
			/** gpu 分数 */
			gpu: number;
			/** 内存分数 */
			memory: number;
			/** 综合评分 */
			overall: number;
		};
	};

	/** 获取当前时间的时间戳(单位：微秒) */
	export function getPerformance(): { now(): number; };

	/** 显示灰色背景的消息提示框。 */
	export function showToast(options: {
		/** 内容 */
		title: string;
		/** 图标，取值范围包括 success,loading, none,fail */
		icon?: 'success' | 'loading' | 'none' | 'fail';
		/** 提示框停留时间，单位ms, 默认 1500*/
		duration?: number;
		/** 接口调用成功后的回调函数 */
		success?: Function;
		/** 接口调用失败后的回调函数 */
		fail?: Function;
		/** 接口调用结束后的回调函数（调用成功、失败都会执行） */
		complete?: Function;
	}): void;

	/** 显示模态弹窗。 */
	export function showModal(options: {
		/** 标题 */
		title?: string;
		/** 内容 */
		content?: string;
		/** 确定按钮的文案，最多 4 个字符, 默认值 `确定` */
		confirmText?: string;
		/** 是否显示取消按钮, 默认值 `true` */
		showCancel?: boolean;
		/** 取消按钮的文案，最多 4 个字符, 默认值 `取消` */
		cancelText?: string;
		/** 接口调用成功后的回调函数 */
		success?: (ret: { confirm: boolean; }) => void;
		/** 接口调用失败后的回调函数 */
		fail?: Function;
		/** 接口调用结束后的回调函数（调用成功、失败都会执行） */
		complete?: (object: { cancel: boolean, confirm: boolean; }) => void;
	}): void;

	/**
	 * 加载自定义字体文件。
	 * @export
	 * @param {string} path 字体文件路径，可以是代码包文件路径，也可以是 ttfile:// 协议的本地文件路径
	 * @returns {string} 字体 family 值
	 */
	export function loadFont(path: string): string;

	export class BannerAd {
		/**
		 * 展现广告
		 *
		 * 广告创建后默认是隐藏的，可以通过该方法显示广告。
		 *
		 * 该方法返回一个 Promise 对象。
		 *
		 * 当广告组件正常获取素材时，该 Promise 对象会是一个 resolved Promise。
		 *
		 * 当广告组件发生错误时，会是一个 rejected Promise，参数与error 事件监听器获得的参数相同。
		 *
		 * Tip： 必须调用 BannerAd.onLoad 监听广告素材成功拉取后才能调用 BannerAd.show，否则广告将无法及时展示
		 */
		show(): Promise<void>;

		/** 隐藏广告 */
		hide(): Promise<void>;

		/** 绑定 load 事件的监听器。 广告组件成功拉取广告素材时会触发 load 事件的监听器。 */
		onLoad(callback: () => void): void;

		/** 解除绑定 load 事件的监听器 */
		offLoad(callback: () => void): void;

		/** 绑定 error 事件的监听器。 广告组件拉取广告素材时如果发生错误，会触发 error 事件的监听器
		 * @see [错误代码文档](https://microapp.bytedance.com/docs/zh-CN/mini-game/develop/open-capacity/ads/banner-ad/banner-ad-on-error)
		*/
		onError(callback: (error: { errCode: number; errMsg: string; }) => void): void;
		/** 解除绑定 error 事件的监听器 */
		offError(callback: (error: { errCode: number; errMsg: string; }) => void): void;

		/** 绑定 resize 事件的监听器
		 * 开发者除了可以在创建 bannerAd 实例时指定广告的 style，还可以在获得实例后修改其 style 属性中的属性值
		 * 一旦广告尺寸发生变化，会触发 resize 事件的监听器。监听器会获得一个包含 width 和 height 属性的对象参数，该参数表征广告的实际渲染尺寸。
		 *
		 * 返回参数
		 *
		 * 	广告实际渲染的宽度
		 * width: number;
		 * 广告实际渲染的高度
		 * height: number;
		 */
		onResize(callback: (size: { width: number; height: number; }) => void): void;
		/** 解除绑定 resize 事件的监听器 */
		offResize(callback: (size: { width: number; height: number; }) => void): void;

		/** 销毁广告实例。 当开发者确定某个广告实例无需展示时应当主动销毁以提升性能。 */
		destroy: Function;
		/** 样式 */
		style: {
			/** 广告位区域左上角横坐标 */
			top: number;
			/** 广告位区域左上角纵坐标 */
			left: number;
			/** 广告位区域宽度 */
			width: number;
			/** 高度 */
			height?: number;
			/** 宽度 */
			realWidth: number;
			/** 高度 */
			realHeight: number;
		};
	}

	/**
	 * 开发者可以在小游戏中使用 Banner 广告获得收入。Banner 广告是由客户端原生渲染，覆盖在开发者指定的区域上。
	 *
	 * Bug & Tip
	 *
	 * Tip: 每个广告实例只会与一条固定的广告素材绑定。开发者如果想要展示另一条广告，需要创建一个新的 bannerAd 实例。
	 *
	 * Tip: 竖屏情况下，Banner 广告 接受的最小宽度是 300（设备像素），最大宽度是 Math.floor(屏幕宽度）。
	 *
	 * Tip: 横屏情况下，Banner 广告 接受的最小宽度是 128（设备像素），最大宽度是 208（设备像素）。开发者可以在这之间自由指定广告宽度。广告组件会自动等比例缩放素材。
	 *
	 * @param options
	 */
	export function createBannerAd(options: {
		/* 广告位 id*/
		adUnitId: string;
		/* 广告自动刷新的间隔时间，单位为秒，参数值必须大于等于 30（该参数不传入时 Banner 广告不会自动刷新）*/
		adIntervals?: number;
		/* 广告位区域，包括left、top、width字段*/
		style?: {
			/** 广告位区域左上角横坐标 */
			left?: number;
			/** 广告位区域左上角纵坐标; */
			top?: number;
			/** 广告位区域宽度, 默认 `128`*/
			width?: number;
		};
	}): BannerAd;


	/** 插屏广告实例。通过tt.createInterstitialAd方法获取。 */
	class InterstitialAd {
		/** 显示插屏广告。 */
		show(): Promise<void>;
		/** 隐藏插屏广告。 */
		hide(): Promise<void>;

		/* 加载插屏广告。*/
		load(): Promise<void>;

		/** 监听插屏广告加载事件。 */
		onLoad(callback: Function): void;
		/** 取消监听插屏广告加载事件。 */
		offLoad(callback: Function): void;

		/** 监听插屏错误事件。*/
		onError(callback: (error: { errCode: number; errMsg: string; }) => void): void;

		/** 取消监听插屏错误事件。 */
		offError(callback: (error: { errCode: number; errMsg: string; }) => void): void;

		/** 监听插屏广告关闭事件。 */
		onClose(callback: Function): void;

		/** 取消监听插屏广告关闭事件。 */
		offClose(callback: Function): void;

		/** 销毁插屏广告实例。*/
		destroy(): void;
	}

	/**
	 * 注意，目前只能在抖音使用该方法，今日头条等宿主暂不支持。
	 *
	 * 创建插屏广告，开发者可以在小游戏中使用插屏广告获得收入。插屏广告是由客户端原生渲染，由开发者控制广告组件的显示。该能力支持竖屏版和横屏版小游戏。
	 */
	export function createInterstitialAd(options: { adUnitId: string; }): InterstitialAd;

	/** 全局唯一的视频广告实例，通过tt.createRewardedVideoAd来创建。 */
	class RewardedVideoAd {

		/**
		 * 广告创建后默认是隐藏的，可以通过该方法显示广告。 该方法返回一个 Promise 对象。
		 *
		 * 当广告组件正常获取素材时，该 Promise 对象会是一个 resolved Promise。当广告组件发生错误时，会是一个 rejected Promise，参数与error 事件监听器获得的参数相同。
		 * */
		show(): Promise<void>;

		/**
		 * 通过 load 方法主动预加载广告内容。
		 * 此外，在显示广告出现问题时也可以尝试主动 load 一次。
		 * 该方法返回一个 Promise，如果广告已经自动拉取成功，调用该方法返回一个 resolved Promise。
		 */
		load(): void;

		/** 绑定 load 事件的监听器。 广告组件成功拉取广告素材时会触发 load 事件的监听器。 */
		onLoad(callback: () => void): void;

		/** 解除绑定 load 事件的监听器 */
		offLoad(callback: () => void): void;

		/** 监听插屏错误事件。*/
		onError(callback: (error: { errCode: number; errMsg: string; }) => void): void;

		/** 取消监听插屏错误事件。 */
		offError(callback: (error: { errCode: number; errMsg: string; }) => void): void;

		/** 绑定 close 事件的监听器。 当用户点击了 Video 广告上的关闭按钮时，会触发 close 事件的监听器。 */
		onClose(callback: (ret: { isEnded: boolean; }) => void): void;

		/** 解除绑定 close 事件的监听器。 */
		offClose(callback: (ret: { isEnded: boolean; }) => void): void;

		/** 通过 destroy 方法主动销毁广告实例
		 *
		 * 该方法返回一个 Promise，如果广告已经销毁成功，调用该方法返回一个 resolved Promise；如果是频繁的销毁重建，确保在收到 Promise 保证后再次创建新的。
		 */
		destroy(): void;
	}

	/**
	 * 开发者可以在小游戏中使用 Video 广告获得收入。
	 *
	 * Video 广告是由客户端原生渲染，覆盖在整个小游戏 Canvas 区域之上。
	 * Video 广告展示的时候用户不能操作小游戏。 Video 广告目前支持竖屏展示。
	 * 如果是横屏游戏在展示时会先切到竖屏。开发者工具上暂不支持调试该 API，请直接在真机上进行调试。
	 */
	export function createRewardedVideoAd(options: { adUnitId: string; }): RewardedVideoAd;

	class GameRecorderManager {
		/** 开始录屏。可以通过 onStart 接口监听录屏开始事件。*/
		start(options: {
			/** 录屏的时长，单位 s，必须大于 3s，最大值 300s（5 分钟）， 默认10s */
			duration?: number;
			/** 是否添加水印，会在录制出来的视频上添加默认水印，目前不支持自定义水印图案, 默认 `true` */
			isMarkOpen?: boolean;
			/** 水印距离屏幕上边界的位置，单位为 dp */
			locTop?: number;
			/** 水印距离屏幕左边界的位置，单位为 dp */
			locLeft?: number;
			/** 设置录屏帧率，对于性能较差的手机可以调低参数以降低录屏性能消耗。 */
			frameRate?: number;
		}): void;

		/** 监听录屏开始事件。 */
		onStart(callback: () => void): void;

		/**
		 * 记录精彩的视频片段，调用时必须是正在录屏，以调用时的录屏时刻为基准，指定前 x 秒，后 y 秒为将要裁剪的片段，可以多次调用，记录不同时刻
		 *
		 * 在结束录屏时，可以调用 clipVideo 接口剪辑并合成记录的片段。 */
		recordClip(options: {
			/** 数组的值表示记录这一时刻的前后时间段内的视频，单位是 s */
			timeRange?: number[];
			/** 接口调用成功的回调函数 */
			success: (index: number) => void;
			/** 接口调用失败的回调函数 */
			fail?: () => void;
			/** 接口调用结束的回调函数（调用成功、失败都会执行） */
			complete?: () => void;
		}): number;

		/**
		 * 剪辑精彩的视频片段。
		 *
		 * clipRange：
		 *
		 *     若不传clipRange字段，会按照默认的recordClip的调用顺序裁剪视频并合并，对于 recordClip 调用时 timeRange字段可能产生交集的部分会自动合并，确保生成的视频内容是无重复且顺序符合记录顺序。
		 *
		 *     若指定了clipRange字段，平台将只会按 clipRange 数据的顺序裁剪合并视频，并对于重复的部分不做处理，开发者可利用该功能实现自定义裁剪片段、自定义拼接顺序（若同时指定了 timeRange，该片段将依旧作为最后一段拼接），对于最终视频可能出现的重复内容，需要开发者自己保证。
		 * */
		clipVideo(options: {
			/** 的值为停止录屏拿到的视频地址 */
			path: string;
			/** 裁剪的范围，用法含义与recordClip 中的timeRange，完全相同，只是记录时相对的当前时刻规定为录屏结束时刻 */
			timeRange?: number[],
			/** 指定要裁剪的范围，数组中每一项为调用 recordClip 得到返回值 */
			clipRange?: number[],
			/** 接口调用成功的回调函数 */
			success?: (res: {
				/** 剪辑的视频地址 */
				videoPath: string;
			}) => void;
			/** 接口调用失败的回调函数 */
			fail?: () => void;
			/** 接口调用结束的回调函数（调用成功、失败都会执行） */
			complete?: () => void;
		}): void;

		/** 暂停录屏。 */
		pause(): void;

		/** 监听录屏暂停事件。 */
		onPause(callback: () => void): void;

		/** 继续录屏 */
		resume(): void;

		/** 监听继续录屏事件。 */
		onResume(callback: () => void): void;

		/** 停止录屏 */
		stop(): void;

		/** 监听录屏结束事件，可以获得录屏地址。 */
		onStop(callback: (res: { videoPath: string; }) => void): void;

		/** 监听录屏错误事件。 */
		onError(callback: (err: { errMsg: string; }) => void): void;

		/** 监听录屏中断开始事件。 */
		onInterruptionBegin(callback: () => void): void;
		/** 监听录屏中断结束。 */
		onInterruptionEnd(callback: () => void): void;

		/** 获取录屏水印宽高。开发者可以通过宽高计算水印添加的位置。 */
		getMark(): {
			/** 水印的宽度 */
			markWidth: number;
			/** 水印的高度 */
			markHeight: number;
		};
	}

	export function getGameRecorderManager(): GameRecorderManager;

	export interface InviteShareResult {
		data: { name: string; icon: string; }[];
	}

	/**
	 *
	 *
	 *
	 * Tip：端外分享不支持通过代码设置自定义分享内容。
	 *
	 * Tip：当发布视频内容时，不支持通过 imageUrl 参数设置分享图片。
	 *
	 * Tip：头条拍视频不支持设置 title 。
	 *
	 * Tip：只有分享视频内容时，才可以通过 extra 设置附加信息。
	 *
	 * Tip：videoTopics 即将废弃，应使用 hashtag_list 代替；或者同时设置以保证兼容性。
	 *
	 * Tip：分享时，在 channel 是 "video"的情况下，如果 videoPath 是不存在会拉起摄像头拍摄界面
	 *
	 * Tip：如果需要获取视频信息或者跳转视频播放页，以及获取抖音视频排行榜时，需要填写 withVideoId 为 true。
	 *
	 */
	export interface ShareParams {
		/** 转发内容类型
		 *
		 * article	发布图文内容，仅头条 APP 支持
		 * video	发布视频内容
		 * token	口令分享，生成一串特定的字符串文本，仅头条 APP 支持
		 */
		channel?: 'article' | 'video' | 'token' | 'invite';
		/** 分享素材模板 id，指定通过平台审核的 templateId 来选择分享内容，需在平台设置且通过审核。参考小程序相关说明 */
		templateId?: string;
		/** 分享文案，不传则默认使用后台配置内容或平台默认。 */
		desc?: string;
		/** 转发标题，不传则默认使用后台配置或当前小游戏的名称。 */
		title?: string;
		/** 转发显示图片的链接，可以是网络图片路径或本地图片文件路径或相对代码包根目录的图片文件路径，显示图片长宽比推荐 5:4 */
		imageUrl?: string;
		/** 查询字符串，必须是 key1=val1&key2=val2 的格式。从这条转发消息进入后，可通过 tt.getLaunchOptionsSync 或 tt.onShow 获取启动参数中的 query。 */
		query?: string;
		/** 附加信息 */
		extra?: {
			/** 是否支持跳转到播放页， 以及支持获取视频信息等接口 （为 true 时会在 success 回调中带上 videoId） */
			withVideoId?: boolean;
			/** 视频地址 ，分享一个本地视频 */
			videoPath?: string;
			/** 视频话题(仅抖音支持) ，目前由 hashtag_list 代替，为保证兼容性，建议同时填写两个。 */
			videoTopics?: string[];
			/** 是否分享为挑战视频 ( 仅头条支持 ), 默认 false */
			createChallenge?: boolean;
			/** 生成输入的默认文案 */
			video_title?: string;
			/** 视频话题(仅抖音支持) */
			hashtag_list?: string[];
			/** 分享视频的标签，可以结合获取抖音视频排行榜使用 */
			videoTag?: string;
			/** 抖音 pgc 音乐的短链(仅抖音支持，需要基础库版本大于 1.90) 。形如https://v.douyin.com/JmcxWo8/， 参考 抖音小游戏录屏带配乐能力 */
			defaultBgm?: string;
		};
		/** 分享成功后执行的回调函数 */
		success?: (res: { videoId: string; } | InviteShareResult) => void;
		/** 分享失败或者用户取消发布器后执行的回调函数 */
		fail?: Function;
		/** 分享完成（无论成功与否）后执行的回调函数 */
		compelete?: Function;
	}

	/** 主动拉起转发界面（发布器）。 */
	export function shareAppMessage(options: ShareParams): void;

	/** 给指定的好友分享游戏信息 */
	export function shareMessageToFriend(options: {
		/** 发送对象的 openId */
		openId: string;
		/** 分享素材模板 id，指定通过平台审核的 templateId 来选择分享内容，需在平台设置且通过审核 */
		templateId: string;
		/** 查询字符串，必须是 key1=val1&key2=val2 的格式。从这条转发消息进入后，可通过 tt.getLaunchOptionsSync 或 tt.onShow 获取启动参数中的 query用来实现信息透传 */
		query?: string;
		/** 分享成功后执行的回调函数 */
		success?: (res: { videoId: string; }) => void;
		/** 分享失败或者用户取消发布器后执行的回调函数 */
		fail?: Function;
		/** 分享完成（无论成功与否）后执行的回调函数 */
		compelete?: Function;
	}): void;

	/** 监听用户点击右上角菜单中的“转发”按钮时触发的事件。 */
	export function onShareAppMessage(callback: (ret: {
		/** 转发内容类型，有 article、video */
		channel?: string;
		/** 该返回对象可以用来自定义分享的内容。 */
		shareParam: ShareParams;
	}) => void): void;

	/** 使手机发生较长时间的振动（400 ms)。 */
	export function vibrateLong(options?: AsyncCallbackOptions): void;

	/** 使手机发生较短时间的振动。安卓震动时间为 30ms，ios 震动时间为 15ms。 */
	export function vibrateShort(options?: AsyncCallbackOptions): void;

	/** Audio 对象 对齐 HTMLAudioElement，提供类似 HTMLAudioElement 的能力。 */
	class Audio {
		/** 播放音频文件路径 */
		src: string;
		/** 支持设置二进制数据的音频源，与 src, 属性设置效果一致 */
		srcObject: ArrayBuffer;
		/** 当前播放的位置，单位为秒。写操作会定位到设置的时间处 */
		currentTime: number;
		/** 从何时开始播放，单位为秒 */
		startTime: number;
		/** 音频总长度，单位为秒。 */
		readonly duration: number;
		/** 音量 0~1 */
		volume: number;
		/** 是否自动播放 */
		autoplay: boolean;
		/** 是否循环播放 */
		loop: boolean;
		/** 是否处于暂停或停止状态 */
		readonly paused: boolean;

		play(): void;
		pause(): void;
		stop(): void;

		onended(): void;
		onstop(): void;
	}

	interface MediaElementAudioSourceNode {
		connect(target: object): void;
	}

	/**
	 * AudioBuffer 接口表示存在内存里的一段短小的音频资源，利用AudioContext.decodeAudioData 方法从一个音频文件构建，或者利用 AudioContext.createBuffer 从原始数据构建。把音频放入 AudioBuffer 后，可以传入到一个 AudioBufferSourceNode 进行播放。
	 */
	interface AudioBuffer {
		/** 默认值 `2048` 返回存储在缓存区的 PCM 数据的通道数 */
		readonly numberOfChannels: number;
		/** 默认值 `- 30` 返回存储在缓存区的 PCM 数据的采样帧率 */
		readonly length: number;
		/** 默认值 `- 100` 返回存储在缓存区的 PCM 数据的时长（单位为秒） */
		readonly duration: number;
		/** 默认值 `fftSize / 2` 存储在缓存区的 PCM 数据的采样率，单位为 sample / s */
		readonly sampleRate: number;
		/** 默认值 `AudioBuffer` 所对应的缓存区（buffer） */
		readonly buffer: ArrayBuffer;
		/** 返回一个 Float32Array，包含了带有频道的 PCM 数据，由频道参数定义（0 代表第一个频道）。 */
		getChannelData(channel: number): Float32Array;
	}

	/** AudioContext 实例，可通过 tt.getAudioContext 接口获取实例。 */
	class AudioContext {
		/** 采样率（每秒采样数）， 同一个 AudioContext 中的所有节点采样率相同，所以不支持采样率转换 */
		sampleRate: number;
		/** 	返回以秒为单位的时间，当获取 AudioContext 的时候初始值为 0，并实时增加。所有的预定时间都和它相关。这不是一个可以开始、暂停、和重定位的时间，它总是增加的 */
		currentTime: number;
		/** 表示音频图形在特定情况下的最终输出地址（通常为扬声器）
		 *
		 * 输入音频源 audio
		 *
		 * 音频源连接到 AudioNode 做额外处理
		 *
		 * AudioNode 再连接到 AudioContext.destination 上做输出
		*/
		destination: AudioNode;

		/** 用于新建一个 Audio 对象，对齐 HTMLAudioElement。 */
		createAudio(): Audio;

		createMediaElementSource(element: Audio): MediaElementAudioSourceNode;

		/** 创建并返回一个新的 GainNode 对象实例，GainNode 是一个 AudioNode 音频处理模块，在输出前使用给定增益应用到输入。*/
		createGain(): GainNode;

		/**
		 * 创建一个新的 AudioBufferSourceNode 节点, 该节点可以播放 AudioBuffer 对象的音频数据。
		 * AudioBuffer 对象可以通过 AudioContext.createBuffer 来创建或者通过 AudioContext.decodeAudioData 成功解码音轨后获取。
		 */
		createBufferSource(): AudioBufferSourceNode;

		/** 用于异步解码音频文件， 并以 ArrayBuffer 的形式返回音频文件中的内容。该方法返回一个 Promise 对象。 */
		decodeAudioData(data: ArrayBuffer): Promise<AudioBuffer>;
	}

	/**
	 * 通过它能够操作音频播放。
	 *
	 * Tip：iOS 中可以创建多个 audio 实例，支持多个 audio 同时播放。
	 *
	 * Tip：Android 目前只支持单个 audio 实例，每次只能播放一个 audio ，若多次创建并设置 src 参数，播放源为最后一次设置的 src 。
	 *
	 * */
	class InnerAudioContext {
		/** 音频源地址 */
		src: string;
		/** 开始播放的位置，单位s */
		startTime: number;
		/** 是否自动播放 */
		autoplay: boolean;
		/** 是否自动循环 */
		loop: boolean;
		/** 是否遵循系统静音开关 */
		obeyMuteSwitch: boolean;
		/** 当前音频总时长，单位s，只读 */
		duration: number;
		/** 当前音频进度，单位s，只读 */
		currentTime: number;
		/** 当前音频是否处于暂停状态，只读 */
		paused: boolean;
		/** 当前音频已缓冲部分，单位百分比，只读 */
		buffered: number;
		/** 当前音量，只读 */
		volume: number;

		/** 播放 */
		play(): void;
		/** 暂停 */
		pause(): void;
		/** 停止 */
		stop(): void;
		/** 跳转到 position 指定的位置播放，数据格式为 number，单位为s */
		seek(position: number): void;
		/** 销毁当前 innerAudioContext 实例。 */
		destory(): void;
		/** 音频进入可以播放状态，但不保证后面可以流畅播放。 */
		onCanplay(callback: () => void): void;
		/** 取消监听 Canplay 事件。 */
		offCanplay(callback: () => void): void;
		/** 音频播放事件 */
		onPlay(callback: () => void): void;
		/** 取消 onPlay 事件 */
		offPlay(callback: () => void): void;
		/** 音频暂停事件。 */
		onPause(callback: () => void): void;
		/** 取消 onPause 事件 */
		offPause(callback: () => void): void;
		/** 音频停止事件。 */
		onStop(callback: () => void): void;
		/** 取消 onStop 事件 */
		offStop(callback: () => void): void;
		/** 音频自然播放结束事件 */
		onEnded(callback: () => void): void;
		/** 取消监听 Ended 事件 */
		offEnded(callback: () => void): void;
		/** 音频播放进度更新事件 */
		onTimeUpdate(callback: () => void): void;
		/** 取消监听 TimeUpdate 事件 */
		offTimeUpdate(callback: () => void): void;
		/** 音频播放错误事件 */
		onError(callback: (error: any) => void): void;
		/** 取消监听 Error 事件 */
		offError(callback: () => void): void;
		/** 音频加载中事件，当音频因为数据不足，需要停下来加载时会触发 */
		onWaiting(callback: () => void): void;
		/** 取消监听 Waiting 事件 */
		offWaiting(callback: () => void): void;
		/** 音频进行 seek 操作事件 */
		onSeeking(callback: () => void): void;
		/** 取消监听 Seeking 事件 */
		offSeeking(callback: () => void): void;
		/** 音频完成 seek 操作事件 */
		onSeeked(callback: () => void): void;
		/** 取消监听 Seeked 事件 */
		offSeeked(callback: () => void): void;
	}

	export function getAudioContext(): AudioContext;
	export function createInnerAudioContext(): InnerAudioContext;

	interface AuthorizeOptions extends AsyncCallbackOptions {
		/**
		 * scope.userInfo	用户信息
		 *
		 * scope.userLocation	地理位置
		 *
		 * scope.record	录音功能
		 *
		 * scope.album	保存到相册
		 *
		 * scope.camera 摄像头
		 */
		scope: 'scope.userInfo' | 'scope.userLocation' | 'scope.record' | 'scope.album' | 'scope.camera';
	}

	export function authorize(options: AuthorizeOptions): void;

	interface AuthSetting {
		/** 用户信息 */
		'scope.userInfo'?: boolean;
		/** 地理位置 */
		'scope.userLocation'?: boolean;
		/** 录音功能 */
		'scope.record'?: boolean;
		/** 通讯地址 */
		'scope.address'?: boolean;
		/** 保存到相册 */
		'scope.album'?: boolean;
		/** 摄像头 */
		'scope.camera'?: boolean;
	}

	interface SettingOptions extends AsyncCallbackOptions {
		success(ret: { errMsg: string, data: AuthSetting; }): void;
	}

	/** 获取用户已经授权过的配置。结果中只会包含小程序向用户请求过的权限。 */
	export function getSetting(option: SettingOptions): void;


	export interface IUserInfo {
		/** 用户头像 */
		avatarUrl: string;
		/** 用户名 */
		nickName: string;
		/** 	用户性别，0: 未知；1:男性；2女性 */
		gender: number;
		/** 用户城市 */
		city: string;
		/** 用户省份 */
		province: string;
		/** 用户国家 */
		country: string;
		/** 用户语言，目前为空 */
		language: string;

		/** 用于校验用户信息是否被篡改 */
		signature?: string;
		/** 包括敏感信息（如 openId）在内的已加密用户数据 */
		encryptedData?: string;
		/** 加密算法参数 */
		iv?: string;
	}

	interface GetUserInforOptions extends AsyncCallbackOptions {

		success(ret: {
			userInfo: IUserInfo;
			rawData: string;
		}): void;

		/** 是否需要返回敏感数据 */
		withCredentials?: boolean;
		/** 是否需要返回用户实名认证状态 */
		withRealNameAuthenticationInfo?: boolean;
	}

	/**
	 * 获取已登录用户的基本信息或特殊信息，首次使用的用户会弹出授权提示窗，若用户同意，则会返回用户的真实数据。
	 *
	 * 提示
	 *
	 * 本 API 需要用户授权方可调用，详细信息可参考 用户授权
	 *
	 * 本 API 依赖于 login，请确保调用前已经调用了该 API
	 */
	export function getUserInfo(options: GetUserInforOptions): void;

	/**
	 * 用户的登录态具有时效性，随着用户未使用小游戏的时间增加，用户的登录态越容易失效；
	 * 反之，则用户登录态可持续保持有效。使用该 API 可检查用户当前的 session 状态是否有效，登录态过期后开发者可以再调用 tt.login 获取新的用户登录态。
	 */
	export function checkSession(options: AsyncCallbackOptions): void;

	interface LoginOptions {

		success(ret: {
			/** 临时登录凭证, 有效期 3 分钟。开发者可以通过在服务器端调用 登录凭证校验接口 换取 openid 和 session_key 等信息。 */
			code: string;
			/** 用于标识当前设备, 无论登录与否都会返回, 有效期 3 分钟 */
			anonymousCode: string;
			/** 判断在当前 APP（头条、抖音等）是否处于登录状态。 */
			isLogin: boolean;
		}): void;
		/** 未登录时, 是否强制调起登录框, 默认为true */
		force?: boolean;
	}

	/** 调用该 API 可以获取用户临时的登录凭证。 */
	export function login(options: LoginOptions): void;

	/**
	 * 自定义分析数据上报接口，调用后，会将数据上报到小程序开发者平台，开发者可以在小程序开发者平台中查看上报数据。
	 *
	 * 使用前，需要在小程序管理后台事件中新建事件，配置好事件名与字段。
	 */
	export function reportAnalytics(eventName: string, data: Record<string, any>): void;



	interface ShowMoreGameModuleOption extends AsyncCallbackOptions {
		/** 小游戏的启动参数 */
		appLaunchOptions: Array<{
			/** 推荐游戏列表中要打开的小游戏 appId */
			appId: string,
			/** 查询字符串，必须是 key1=val1&key2=val2 的格式。可通过tt.getLaunchOptionSync或tt.onShow 获取启动参数中的 query */
			query?: string;
			/** 需要传递给目标小游戏的数据。可通过tt.getLaunchOptionSync或tt.onShow字段获取对应数据 */
			extraData?: object;
		}>;
	}

	/**
	 * tt.showMoreGamesModal 仅 Android 支持，iOS 不支持，开发者需做相应兼容处理。
	 *
	 * 在不支持小游戏盒子的宿主端该 API 调用后会展示“更多游戏”弹窗
	 *
	 * 弹出小游戏盒子界面，盒子中包含开发者预先配置的小游戏列表，以及其他游戏推荐
	 */
	export function showMoreGamesModal(options: ShowMoreGameModuleOption): void;

	/**
	 * 设置更多游戏配置，用于更新小游戏固定菜单按钮跳转更多游戏的配置，调用该 api 会同时更新游戏按钮，更多游戏 banner 和右上角固定的盒子按钮的小游戏配置。
	 */
	export function setMoreGamesInfo(options: ShowMoreGameModuleOption): void;

	export class OpenDataContext {
		canvas: HTMLCanvasElement;
		postMessage(message: string): void;
	}

	/** 获取开放数据域。 */
	export function getOpenDataContext(): OpenDataContext;

	/** 退出小程序 */
	export function exitMiniProgram(options: AsyncCallbackOptions): void;

	export class UpdateManager {
		/** 当向字节小程序后台请求完新版本信息，会进行回调。 */
		onCheckForUpdate(callback: (res: { hasUpdate: boolean }) => void): void;
		/** 当新版本下载完成，会进行回调。 */
		onUpdateReady(callback: () => void): void;
		/** 当新版本下载失败，会进行回调。 */
		onUpdateFailed(callback: (err: string) => void): void;
		/** 当新版本下载完成，调用该方法会强制当前小游戏应用上新版本并重启。*/
		applyUpdate(): void;
	}

	/** 获取全局唯一的版本更新管理器，用于管理小游戏更新。 */
	export function getUpdateManager(): UpdateManager;


	interface LauchOptions {
		/** 启动参数 */
		query: { [key: string]: any; };
		/** 来源信息，从另一个小程序进入小程序时返回，否则返回空对象`{}` */
		refererInfo: {
			/** 来源小程序 appId */
			appId: string;
			/** 来源小程序传过来的数据	 */
			extraData: object;
		};
		launch_from?: string;
		location?: string;
	}



	/** 监听小游戏回到前台的事件。 */
	export function onShow(callback: (params: LauchOptions) => void): void;

	/**
	 * 取消监听小游戏回到前台的事件。
	 * @param callback 小游戏回到前台的事件回调, 参数为空，表示取消所有的回到前台的监听函数。参数为回调函数，表示取消当前传入的回到前台的监听函数。
	 */
	export function offShow(callback?: (params: LauchOptions) => void): void;

	/** 返回小游戏启动参数 */
	export function getLaunchOptionsSync(): LauchOptions;

	/** 监听小游戏隐藏到后台的事件。锁屏、按 HOME 键退到桌面等操作会触发此事件。 */
	export function onHide(callback: () => void): void;

	/** 取消监听小游戏隐藏到后台事件。锁屏、按 HOME 键退到桌面等操作会触发此事件。 */
	export function offHide(callback: () => void): void;

	/** 短视频信息 */
	interface VideoInfo {
		/** 视频ID */
		alias_id: string,
		video_info: {
			/** 点赞数量 */
			digg_count: 0,
			/** 封面图 */
			cover_url: string,
			/** 宿主端标识符，1128(抖音)，1112（抖音火山），13（头条） */
			AID: number;
		};
	}

	interface NavigateToVideoViewOption extends AsyncCallbackOptions {
		/** 视频ID */
		videoId: string;
	}
	interface NavigateToMiniProgram extends AsyncCallbackOptions {
		appId: string,
		path: string;
		extraData: Record<string, any>,
		envVersion: 'current' | 'latest';
	}

	/** 跳转到分享的视频播放页面。 */
	export function navigateToVideoView(option: NavigateToVideoViewOption): void;

	/** 跳转到分享的视频播放页面。 */
	export function navigateToMiniProgram(option: NavigateToMiniProgram): void;

	/** 显示灰色背景的 loading 提示框。该提示框不会主动隐藏。 */
	export function showLoading(options?: { title: string; } & AsyncCallbackOptions): void;
	/** 隐藏 loading 提示框。 */
	export function hideLoading(option?: AsyncCallbackOptions): void;

	/** 上报转化事件 */
	export function sendtoTAQ(params: { convert_id: string, event_type: string; }): void;

	interface ShowFavoriteGuideOptions extends AsyncCallbackOptions {
		/** 小游戏中只能使用
		 *
		 * 默认值：tip
		 * 引导组件类型，可以是 bar（底部弹窗）、tip（顶部气泡）
		 */
		type?: 'bar' | 'tip';
		/**
		 * 弹窗文案,最多显示 12 个字符
		 *
		 * 默认值: `一键添加到我的小程序`
		 */
		content?: string;
		/** 小游戏中该字段无意义
		 *
		 * 弹窗类型为 bar 时的位置参数，可以是 bottom（贴近底部）、overtab（悬于页面 tab 区域上方）
		 */
		position?: 'bottom' | 'overtab';
	}

	/**
	 * 在小游戏内调起关注小程序的引导组件，用于引导用户关注小游戏。
	 *
	 * 展现策略：
	 *
	 * 10s 后自动消失
	 *
	 * 每位用户最多触达【2 次】，最短间隔【一周】才能第二次展现
	 *
	 * 若检测到用户已收藏该小程序，则不展示任何引导组件
	 *
	 * @param options
	 */
	export function showFavoriteGuide(options: ShowFavoriteGuideOptions): void;


	/**
	  * 加载分包任务实例，用于获取分包加载状态
	  */
	type LoadSubpackageTask = {
		/**
		 * 监听分包加载进度变化事件
		 * @param callback 分包加载进度变化事件的回调函数
		 */
		onProgressUpdate(
			callback: (res: {
				/** 分包下载进度百分比*/
				progress: number;
				/** 已经下载的数据长度，单位 Bytes	*/
				totalBytesWritten: number;
				/** 预期需要下载的数据总长度，单位 Bytes*/
				totalBytesExpectedToWrite: number;
			}) => void
		): void;
	};

	/**
	 * 加载分包
	 */
	function loadSubpackage(res: {
		/** 分包的名字，可以填 name 或者 root*/
		name: string;
		/** 分包加载成功回调事件*/
		success: (res: any) => void;
		/** 分包加载失败回调事件*/
		fail: (err: any) => void;
		/** 分包加载结束回调事件(加载成功、失败都会执行）*/
		complete?: () => void;
	}): LoadSubpackageTask;

	/**
	 * 添加桌面图标
	 */
	function addShortcut(callbacks: {
		/** 成功 */
		success: (res: any) => void;
		/** 失败 */
		fail: (err: { errMsg: string; }) => void;
	}): void;

	/**
	 * 检查桌面图标是否存在
	 */
	function checkShortcut(callbacks: {
		/** 成功 */
		success: (res: { errMsg: string, status?: { exist: boolean, needUpdate: boolean; }; }) => void;
		/** 失败 */
		fail: (err: { errMsg: string; }) => void;
	}): void;

	/** 设置系统剪贴板内容。可以和tt.getClipboardData配套使用。 */
	function setClipboardData(options: AsyncCallbackOptions & {
		/** 剪贴板的内容 */
		data: string;
	}): void;

	/** 获取系统剪贴板内容。 */
	function getClipboardData(options: {
		success: (ret: { errMsg: 'getClipboardData:ok', data: string; }) => void;
		fail?: (err: { errMsg: string; }) => void;
		complete?: () => void;
	}): void;

	/** 提供从小游戏查看抖音号是否关注的能力。该功能为抖音专有 API，使用该功能前开发者需要绑定想要查看的抖音号，具体信息请参考游戏内关注抖音号能力。 */
	function checkFollowAwemeState(options: AsyncCallbackOptions<{ hasFollowed: boolean; }>);
	/** 跳转个人抖音号主页或者弹出关注面板，用户可以选择关注/取消关注抖音号。 */
	function openAwemeUserProfile(options: AsyncCallbackOptions<{ hasFollowed?: boolean; }>);


	/** 群聊信息 */
	type GroupInfo = {
		/** 群头像 */
		avatar_uri: string;
		/** 群描述 */
		description: string;
		/** 群门槛，如“无要求，万粉” */
		entry_limit: string[];
		/** 群现有人数 */
		exist_num: number;
		/** 群 ID */
		group_id: string;
		/** 群名 */
		group_name: string;
		/** 群最大支持进入人数 */
		max_num: number;
		/** 群状态，正常:normal, 封禁:ban, 已满:full */
		status: 'normal' | 'full' | 'ban';
		/** 群标签，如活跃群，群主近期发言 */
		tags: string[];
	};

	type GroupOptions = {
		/** 建群用户的 openid */
		openid: boolean;
		/** 预留字段 */
		sessionFrom?: string;
		/** 预留字段 */
		extraInfo?: string;
	};

	/** 查询用户通过小游戏平台创建的群的信息 */
	function checkGroupInfo(options: AsyncCallbackOptions<GroupOptions & { success?: (res: { errMsg: string; data: { groupInfoList: GroupInfo[]; }; }) => void; }>);
	/** 引导用户加入抖音群 */
	function joinGroup(options: AsyncCallbackOptions<{
		groupid: string;
		sessionFrom?: string;
		extraInfo?: string;
		success?: (res: { errMsg: string; data: string; }) => void;
	}>);


	interface Stats {
		/** 文件的类型和存取的权限，对应 POSIX stat.st_mode */
		mode: string;
		/** 文件大小，单位：B，对应 POSIX stat.st_size */
		size: number;
		/** 文件最近一次被存取或被执行的时间，UNIX 时间戳，对应 POSIX stat.st_atime */
		lastAccessedTime: number;
		/** 文件最后一次被修改的时间，UNIX 时间戳，对应 POSIX stat.st_mtime */
		lastModifiedTime: number;
		/** 判断当前文件是否一个目录 */
		isDirectory(): boolean;
		/** 判断当前文件是否一个普通文件 */
		isFile(): boolean;
	}

	interface FileSystemManager {
		/** 判断文件/目录是否存在。 */
		access(options: AsyncCallbackOptions & { path: string; });
		/** 判断文件/目录是否存在。 */
		accessSync(filePath: string): boolean;

		/** 获取文件 Stats 对象。 */
		stat(options: AsyncCallbackOptions<{ stat: Stats, stats: Stats; }> & { path: string; });
		/** 获取文件 Stats 对象。 */
		statSync(path: string): Stats;

		/** 删除文件，只能在 ttfile://user 开头的用户目录下操作。 */
		unlink(options: AsyncCallbackOptions & { filePath: string; });
		/** 重命名文件，可以把文件从 oldPath 移动到 newPath。 */
		rename(options: AsyncCallbackOptions & { oldPath: string; newPath: string; });

		/** 在 用户目录 下创建目录。
		 * @param dirPath 创建的目录路径, 必须 `ttfile://user` 开头
		 *
		*/
		mkdir(options: AsyncCallbackOptions & { dirPath: string; });

		/** 在 用户目录 下创建目录
		 * @param dirPath 创建的目录路径, 必须 `ttfile://user` 开头
		 */
		mkdirSync(dirPath: string);

		/** 删除目录, 只能是 ttfile://user 下的目录。 */
		rmdir(options: AsyncCallbackOptions & { dirPath: string; });

		/** 读取目录内文件列表。 */
		readdir(options: AsyncCallbackOptions<{ files: string[]; }> & { dirPath: string; });

		/** 读取本地文件内容。 */
		readFile(options: AsyncCallbackOptions<{ data: string | ArrayBuffer; }> & { filePath: string; encoding: string; });

		/** 读取本地文件内容。 */
		readFileSync(filePath: string, encoding: string): string | ArrayBuffer;

		/** 写文件，只能写入用户目录(ttfile://user) */
		writeFile(options: AsyncCallbackOptions & { filePath: string; data: string | ArrayBuffer; encoding: string; });
		/** 写文件，只能写入用户目录(ttfile://user) */
		writeFileSync(filePath: string, data: string | ArrayBuffer, encoding: string);

		/** 复制文件 */
		copyFile(options: AsyncCallbackOptions & { srcPath: string; destPath: string; });
	}
	function getFileSystemManager(): FileSystemManager;

	/** 网络请求任务对象 */
	interface RequestTask {
		/** 中断请求任务 */
		abort(): void;
	}

	interface RequestResult {
		/** 返回的 HTTP 状态码 */
		statusCode: number,
		/** 返回的 HTTP Response Header */
		header: Record<string, string>,
		/** 返回的数据，类型取决于 dataType 和 responseType 参数 */
		data: object | string | arraybuffer;
	}

	/** 发起一个网络请求。网络相关的 API 在使用前需要配置域名白名单。请参考网络请求使用说明 */
	function request(options: AsyncCallbackOptions<RequestResult> & {
		/** 请求地址 */
		url: string;
		/** 网络请求方法 */
		method?: 'GET' | 'POST' | 'OPTIONS' | 'PUT' | 'HEAD' | 'DELETE',
		/** 请求 Header */
		header?: Record<string, string>,
		/** 请求的参数 */
		data?: object | Array | ArrayBuffer,
		/** 期望返回的数据类型，支持 json、string */
		dataType?: string;
		/** 期望响应的数据类型，支持 text 或 arraybuffer */
		responseType?: 'arraybuffer' | 'text';
	});

	interface DownloadTask {
		/** 中断下载任务 */
		abort();
		/** 监听下载任务 */
		onProgressUpdate(callback: (progress: {
			/** 下载进度 */
			progress: number;
			/** 已经下载的数据长度，单位 byte */
			totalBytesWritten: number;
			/** 预期需要下载的数据总长度，单位 byte */
			totalBytesExpectedToWrite: number;
		}) => void);
	}

	/**
	 * 客户端直接发起一个 HTTPS GET 请求，下载网络文件到本地临时目录。单次下载允许的最大文件为 50MB。网络相关的 API 在使用前需要配置域名白名单。
	 *
	 * 注意：请在服务端响应的 header 中指定合理的 Content-Type 字段，以保证客户端正确处理文件类型。
	 * @param options
	 */
	function downloadFile(options: AsyncCallbackOptions<{ tempFilePath: string; statusCode: number; }> & {
		/** 请求地址 */
		url: string;
		/** 请求 Header */
		header?: Record<string, string>,
	}): DownloadTask;

	interface ImageEventMap {
		"load": Event;
		"error": Event;
	}

	interface Image {
		/** 图片的 URL, base64 内容, 或者 ArrayBuffer 数据 */
		src: string | ArrayBuffer;
		/** 图片的真实宽度 */
		width: number;
		/** 图片的真实高度 */
		height: number;
		addEventListener<K extends keyof ImageEventMap>(type: K, listener: (this: Image, ev: ImageEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
		removeEventListener<K extends keyof ImageEventMap>(type: K, listener: (this: Image, ev: ImageEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
	}
	function createImage(): Image;

	/** 重启小游戏。 */
	function restartMiniProgramSync(): void;

	function setStorageSync(key: string, data: any): void;
	function getStorageSync(key: string): any;
	function removeStorageSync(key: string): void;
	function clearStorageSync(): void;

	/** WebSocket 任务，通过 tt.connectSocket 接口创建返回。 */

	class SocketTask {
		send(options: AsyncCallbackOptions & { data: string | ArrayBuffer; });
		close(options: AsyncCallbackOptions & { code?: number; reason?: string; });
		onOpen(callback: (res: { header: object; protocolType: string; socketType: "ttnet" | "tradition"; }) => void);
		onMessage(callback: (res: { data: string | ArrayBuffer; protocolType: string; socketType: "ttnet" | "tradition"; }) => void);
		onClose(callback: (res: { code: number; reason: string; protocolType: string; socketType: "ttnet" | "tradition"; }) => void);
		onError(callback: (res: { errMsg: string; }) => void);
	}

	/** 创建一个 WebSocket 连接实例，并通过返回的SocketTask操作该连接。网络相关的 API 在使用前需要配置域名白名单。 */
	function connectSocket(options: AsyncCallbackOptions<{
		/** 当前创建的 sockTask 的序号 */
		socketTaskId: number;
		errMsg: string;
	}> & {
		/** Socket 连接地址 */
		url: string;
		/** HTTP Header */
		header?: object;
		/** 子协议数组 */
		protocols?: string[];
	}): SocketTask;


	class Video {
		/** 空字符串 视频资源地址 */
		src: string;
		/** 播放音量 （值范围为 0 ～ 1） */
		volume: number;
		/** 是否静音（true 为静音） */
		muted: bool;
		/** 是否循环播放（true 为循环播放） */
		loop: bool;
		/** 是否自动播放（true 为自动播放） */
		autoplay: bool;
		/** 期望视频宽度（单位：像素） */
		width: number;
		/** 期望视频高度（单位：像素） */
		height: number;
		/** 视频当前播放到的时长（单位：s） */
		currentTime: number;
		/** 视频总时长（单位：s） */
		readonly duration: number;

		play(): void;
		pause(): void;
		stop(): void;
		seek(time: number): void;
		destroy(): void;

		paintTo(canvas: any, dx: number, dy: number, sx: number, sy: number, sw: number, sh: number);

		/** 监听视频进入可以播放的事件，回调函数的参数 scale 为 video 对象的高度和宽度之比 */
		onCanplay(callback: (scale: number) => void): void;
		/** 监听视频首帧事件; */
		onCandraw(callback: Function);
		offCandraw(callback: Function);
		/** 监听播放视频事件; */
		onPlay(callback: Function);
		/** 监听暂停视频事件; */
		onPause(callback: Function);
		/** 监听停止播放视频事件; */
		onStop(callback: Function);
		/** 监听视频自然播放至结束的事件; */
		onEnded(callback: Function);
		/** 监听视频播放错误事件; */
		onError(callback: Function);
		/** 监听视频跳转事件; */
		onTimeUpdate(callback: Function);
		/** 取消监听视频可以播放事件; */
		offCanplay(callback: Function);
		/** 取消监听视频播放事件; */
		offPlay(callback: Function);
		/** 取消监听视频暂停事件; */
		offPause(callback: Function);
		/** 取消监听视频停止事件; */
		offStop(callback: Function);
		/** 取消监听视频自然播放至结束事件; */
		offEnded(callback: Function);
		/** 取消监听播放视频错误事件 */
		offError(callback: Function);
	}
	function createVideo(): Video;

	function createOffscreenVideo(): Video;

	interface Canvas {
		width: number;
		height: number;
		/** 获取画布对象的绘图上下文; */
		getContext(contextType: string);
		/** 将当前 Canvas 保存为一个临时文件，并生成相应的临时文件路径; */
		toTempFilePath(object: Object);
		/** toTempFilePath 方法的同步版本，参数与 toTempFilePath 的参数 相同，返回值为 string 类型的临时文件路径; */
		toTempFilePathSync(object: Object);
		/** 把画布上的绘制内容以一个 string 的格式返回; */
		toDataURL();
		/** 主动释放 canvas 的资源，释放后绑定的 context 将无法使用 */
		dispose();
	}
	function createCanvas(): Canvas;

	/**
	 * 是平台提供的小游戏客服能力，按钮界面由开发者绘制后，使用该 api 进行调用
	 * 本方法仅支持抖音&抖 lite，其他宿主请使用tt.createContactButton接入客服
	 */
	function openCustomerServiceConversation(options: AsyncCallbackOptions<{
		/**
		 * 1 ：小 6 客服
		 * 2 :  抖音IM 客服（仅支持抖音）
		 */
		type: number;
		/** 保留字段，暂时可以不填 */
		sessionFrom: string;
	}>);

	class GridGamePanel {
		show(): Promise<void>;
		hide(): void;
		destroy(): void;
	}

	function createGridGamePanel(options: {
		gridCount: 'one' | 'four' | 'nine',
		size?: 'large' | 'medium' | 'small',
		position?: {
			left: number;
			top: number;
		},
		query?: Record<string, string>;
	}): GridGamePanel;

	/** 确认当前宿主版本是否支持跳转某个小游戏入口场景。 */
	function checkScene(options: AsyncCallbackOptions<{ isExist: boolean; errMsg: string; }> & {
		/**
		 * - sidebar 侧边栏
		 */
		scene: string;
	});

	/** 调用该API可以跳转到某个小游戏入口场景。 */
	function navigateToScene(options: AsyncCallbackOptions<{ errNo: number; errMsg: string; }> & {
		/**
		 * - sidebar 侧边栏
		 */
		scene: string;
	});

	/** 更新键盘，只有当键盘处于拉起状态时才会产生效果。 */
	function updateKeyboard(res: {
		value: string;
		success?: (res?: any) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): void;

	/**
	 * 隐藏键盘
	 */
	function hideKeyboard(object: {
		success?: (res?: any) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): void;

	/**
	 * 显示键盘
	 */
	function showKeyboard(object: {
		defaultValue: string;
		maxLength: number;
		multiple: boolean;
		confirmHold: boolean;
		confirmType: "done" | "next" | "search" | "go" | "send";
		success?: (res?: any) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): void;
	/**
	 * 监听键盘输入事件
	 */
	function onKeyboardInput(callback: (res: { value: string; }) => void): void;
	/**
	 * 取消监听键盘输入事件
	 */
	function offKeyboardInput(callback: () => void): void;
	/**
	 * 监听用户点击键盘 Confirm 按钮时的事件
	 */
	function onKeyboardConfirm(callback: (res: { value: string; }) => void): void;
	/**
	 * 取消监听用户点击键盘 Confirm 按钮时的事件
	 */
	function offKeyboardConfirm(callback: () => void): void;
	/**
	 * 监听监听键盘收起的事件
	 */
	function onKeyboardComplete(callback: (res: { value: string; }) => void): void;
	/**
	 * 取消监听监听键盘收起的事件
	 */
	function offKeyboardComplete(callback: () => void): void;

	/**
	 *监听加速度数据
	 * @param callback
	 */
	function onAccelerometerChange(callback: (res: { x: number, y: number, z: number }) => void): void;

	/**
	 *解绑加速度数据监听器
	* @param callback
	*/
	function offAccelerometerChange(callback: (res: { x: number, y: number, z: number }) => void): void;

	interface ChooseImageOptions extends AsyncCallbackOptions<{
		/** 图片的本地文件路径列表 */
		tempFilePaths: string[];
		/** 图片对象数组 */
		tempFiles: {
			/** 本地文件路径 */
			path: string;
			/** 本地文件大小，单位 B */
			size: number;
		}[];
	}> {
		/**
		 * 最多可以选择的图片数量，拍照时此选项无效
		 * 默认值 9
		 */
		count?: number;
		/** 指定图片来源，album 从相册选图，camera 使用相机，默认二者都有 */
		sourceType?: ('album' | 'camera')[];
	}
	function chooseImage(options: {})
}
