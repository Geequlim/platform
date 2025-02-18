declare namespace wx {

	interface CreateCustomAdOption {
		/** 广告自动刷新的间隔时间，单位为秒，参数值必须大于等于30（仅对支持自动刷新的模板生效） */
		adIntervals?: number;
		/** 广告单元 id */
		adUnitId: string;
		/** 原生模板广告组件的样式 */
		style: CreateCustomAdStyleOption;
	}

	/** 原生模板广告组件的样式 */
	interface CreateCustomAdStyleOption {
		/** (只对小程序适用) 原生模板广告组件是否固定屏幕位置（不跟随屏幕滚动） */
		fixed?: boolean;
		/** 原生模板广告组件的左上角横坐标 */
		left?: number;
		width?: number;
		/** 原生模板广告组件的左上角纵坐标 */
		top?: number;
	}

	interface CustomAdOnErrorCallbackResult {
		/** 需要基础库： `2.2.2`
		 *
		 * 错误码
		 *
		 * 可选值：
		 * - 1000: 后端接口调用失败;
		 * - 1001: 参数错误;
		 * - 1002: 广告单元无效;
		 * - 1003: 内部错误;
		 * - 1004: 无合适的广告;
		 * - 1005: 广告组件审核中;
		 * - 1006: 广告组件被驳回;
		 * - 1007: 广告组件被封禁;
		 * - 1008: 广告单元已关闭;
		 * - 2001: 模板渲染错误;
		 * - 2002: 模板为空;
		 * - 2003: 模板解析失败;
		 * - 2004: 触发频率限制;
		 * - 2005: 触发频率限制; */
		errCode:
		| 1000
		| 1001
		| 1002
		| 1003
		| 1004
		| 1005
		| 1006
		| 1007
		| 1008
		| 2001
		| 2002
		| 2003
		| 2004
		| 2005;
		/** 错误信息 */
		errMsg: string;
	}

	/** 原生模板广告组件。原生模板广告组件是一个原生组件，层级比普通组件高。原生模板广告组件默认是隐藏的，需要调用 CustomAd.show() 将其显示。如果宽度可配置，原生模板广告会根据开发者设置的宽度进行等比缩放。 */
	interface CustomAd {
		/** 原生模板广告组件的样式 */
		style: CustomAdStyle;
		/** [CustomAd.destroy()](https://developers.weixin.qq.com/minigame/dev/api/ad/CustomAd.destroy.html)
		*
		* 销毁原生模板广告。 */
		destroy(): void;
		/** [CustomAd.offClose(function callback)](https://developers.weixin.qq.com/minigame/dev/api/ad/CustomAd.offClose.html)
		 *
		 * 取消监听原生模板广告关闭事件 */
		offClose(
			/** 原生模板广告关闭事件的回调函数 */
			callback?: UDPSocketOffCloseCallback
		): void;
		/** [CustomAd.offError(function callback)](https://developers.weixin.qq.com/minigame/dev/api/ad/CustomAd.offError.html)
		 *
		 * 取消监听原生模板广告错误事件 */
		offError(
			/** 原生模板广告错误事件的回调函数 */
			callback?: CustomAdOffErrorCallback
		): void;
		/** [CustomAd.offHide(function callback)](https://developers.weixin.qq.com/minigame/dev/api/ad/CustomAd.offHide.html)
		 *
		 * 需要基础库： `2.14.4`
		 *
		 * 取消监听原生模板广告隐藏事件 */
		offHide(
			/** 原生模板广告隐藏事件的回调函数 */
			callback?: OffHideCallback
		): void;
		/** [CustomAd.offLoad(function callback)](https://developers.weixin.qq.com/minigame/dev/api/ad/CustomAd.offLoad.html)
		 *
		 * 取消监听原生模板广告加载事件 */
		offLoad(
			/** 原生模板广告加载事件的回调函数 */
			callback?: OffLoadCallback
		): void;
		/** [CustomAd.onClose(function callback)](https://developers.weixin.qq.com/minigame/dev/api/ad/CustomAd.onClose.html)
		 *
		 * 监听原生模板广告关闭事件。 */
		onClose(
			/** 原生模板广告关闭事件的回调函数 */
			callback: UDPSocketOnCloseCallback
		): void;
		/** [CustomAd.onError(function callback)](https://developers.weixin.qq.com/minigame/dev/api/ad/CustomAd.onError.html)
		 *
		 * 监听原生模板广告错误事件。
		 *
		 * **错误码信息与解决方案表**
		 *
		 *  错误码是通过onError获取到的错误信息。调试期间，可以通过异常返回来捕获信息。
		 *  在小程序发布上线之后，如果遇到异常问题，可以在[“运维中心“](https://mp.weixin.qq.com/)里面搜寻错误日志，还可以针对异常返回加上适当的监控信息。
		 *
		 * | 代码 | 异常情况 | 理由 | 解决方案 |
		 * | ------ | -------------- | --------------- | -------------------------- |
		 * | 1000  | 后端错误调用失败  | 该项错误不是开发者的异常情况 | 一般情况下忽略一段时间即可恢复。 |
		 * | 1001  | 参数错误    | 使用方法错误 | 可以前往developers.weixin.qq.com确认具体教程（小程序和小游戏分别有各自的教程，可以在顶部选项中，“设计”一栏的右侧进行切换。|
		 * | 1002  | 广告单元无效    | 可能是拼写错误、或者误用了其他APP的广告ID | 请重新前往mp.weixin.qq.com确认广告位ID。 |
		 * | 1003  | 内部错误    | 该项错误不是开发者的异常情况 | 一般情况下忽略一段时间即可恢复。|
		 * | 1004  | 无适合的广告   | 广告不是每一次都会出现，这次没有出现可能是由于该用户不适合浏览广告 | 属于正常情况，且开发者需要针对这种情况做形态上的兼容。 |
		 * | 1005  | 广告组件审核中  | 你的广告正在被审核，无法展现广告 | 请前往mp.weixin.qq.com确认审核状态，且开发者需要针对这种情况做形态上的兼容。|
		 * | 1006  | 广告组件被驳回  | 你的广告审核失败，无法展现广告 | 请前往mp.weixin.qq.com确认审核状态，且开发者需要针对这种情况做形态上的兼容。|
		 * | 1007  | 广告组件被驳回  | 你的广告能力已经被封禁，封禁期间无法展现广告 | 请前往mp.weixin.qq.com确认小程序广告封禁状态。 |
		 * | 1008  | 广告单元已关闭  | 该广告位的广告能力已经被关闭 | 请前往mp.weixin.qq.com重新打开对应广告位的展现。|
		 * | 2001  | 模板渲染错误  | 渲染过程出现错误 | |
		 * | 2002  | 模板为空  | 该广告位的广告能力已经被关闭 | |
		 * | 2003  | 模板解析失败  | 该广告位的广告能力已经被关闭 | |
		 * | 2004  | 触发频率限制  | 小程序启动一定时间内不允许展示原生模板广告 | |
		 * | 2005  | 触发频率限制  | 距离小程序插屏广告或者激励视频广告上次播放时间间隔不足，不允许展示原生模板广告 | | */
		onError(
			/** 原生模板广告错误事件的回调函数 */
			callback: (res: { errMsg: string; errCode: number; }) => void
		): void;
		/** [CustomAd.onHide(function callback)](https://developers.weixin.qq.com/minigame/dev/api/ad/CustomAd.onHide.html)
		 *
		 * 需要基础库： `2.14.4`
		 *
		 * 监听原生模板广告隐藏事件, 某些模板如矩阵格子模板用户点击关闭时也会触发该事件。 */
		onHide(
			/** 原生模板广告隐藏事件的回调函数 */
			callback: OnHideCallback
		): void;
		/** [CustomAd.onLoad(function callback)](https://developers.weixin.qq.com/minigame/dev/api/ad/CustomAd.onLoad.html)
		 *
		 * 监听原生模板广告加载事件。 */
		onLoad(
			/** 原生模板广告加载事件的回调函数 */
			callback: OnLoadCallback
		): void;
		/** [Promise CustomAd.hide()](https://developers.weixin.qq.com/minigame/dev/api/ad/CustomAd.hide.html)
		 *
		 * 隐藏原生模板广告。（某些模板广告无法隐藏） */
		hide(): Promise<any>;
		/** [Promise CustomAd.show()](https://developers.weixin.qq.com/minigame/dev/api/ad/CustomAd.show.html)
		 *
		 * 显示原生模板广告。 */
		show(): Promise<any>;
		/** [boolean CustomAd.isShow()](https://developers.weixin.qq.com/minigame/dev/api/ad/CustomAd.isShow.html)
		 *
		 * 查询原生模板广告展示状态。 */
		isShow(): boolean;
	}
	interface CustomAdOnErrorCallbackResult {
		/** 需要基础库： `2.2.2`
		 *
		 * 错误码
		 *
		 * 可选值：
		 * - 1000: 后端接口调用失败;
		 * - 1001: 参数错误;
		 * - 1002: 广告单元无效;
		 * - 1003: 内部错误;
		 * - 1004: 无合适的广告;
		 * - 1005: 广告组件审核中;
		 * - 1006: 广告组件被驳回;
		 * - 1007: 广告组件被封禁;
		 * - 1008: 广告单元已关闭;
		 * - 2001: 模板渲染错误;
		 * - 2002: 模板为空;
		 * - 2003: 模板解析失败;
		 * - 2004: 触发频率限制;
		 * - 2005: 触发频率限制; */
		errCode:
		| 1000
		| 1001
		| 1002
		| 1003
		| 1004
		| 1005
		| 1006
		| 1007
		| 1008
		| 2001
		| 2002
		| 2003
		| 2004
		| 2005;
		/** 错误信息 */
		errMsg: string;
	}

	/** 原生模板广告组件的样式 */
	interface CustomAdStyle {
		/** (只对小程序适用) 原生模板广告组件是否固定屏幕位置（不跟随屏幕滚动） */
		fixed: boolean;
		/** 原生模板广告组件的左上角横坐标 */
		left: number;
		/** 原生模板广告组件的左上角纵坐标 */
		top: number;
	}

	/** [wx.createCustomAd(Object object)](https://developers.weixin.qq.com/minigame/dev/api/ad/wx.createCustomAd.html)
	*
	* 需要基础库： `2.11.1`
	*
	* 创建原生模板广告组件。请通过 [wx.getSystemInfoSync()](https://developers.weixin.qq.com/minigame/dev/api/base/system/wx.getSystemInfoSync.html) 返回对象的 SDKVersion 判断基础库版本号 >= 2.11.1 后再使用该 API。每次调用该方法创建原生模板广告都会返回一个全新的实例。 */
	function createCustomAd(option: CreateCustomAdOption): CustomAd;
}
