/** 操作系统类型 */
declare type OSType = 'unknown' | 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'devtools';
/** 打开操作 */

declare type OpenTargetOptions = {
	target: string;
	type: 'app' | 'url' | 'ugc-video';
	path?: string;
	params?: Record<string, any>;
};

declare type TinyKeyboardEvent = {
	readonly key: string;
	readonly code: number;

	readonly location: 'left' | 'right' | 'numpad' | 'standard';
	readonly repeat: boolean;

	readonly alt: boolean;
	readonly ctrl: boolean;
	readonly meta: boolean;
	readonly shift: boolean;
};

declare type ApplicationEvents = {
	focus(): void,
	infocus(): void,
	visible(): void,
	hidden(): void,
	/** 执行返回操作（ Android 系统） */
	back(): void;
	/** 键盘按下事件 */
	keydown(event: TinyKeyboardEvent): void;
	/** 键盘抬起事件 */
	keyup(event: TinyKeyboardEvent): void;

	/** 切换性能面板开关 */
	switchDebugOption(event: 'performanceMonitor' | 'vConsole' | 'navigator-line', value: boolean): void;
};

declare interface VersionEnumeration<T> {
	/** 类型 */
	readonly name: T;
	/** 版本 */
	readonly version: string;
}

declare type OSInformation = VersionEnumeration<OSType>;

declare interface HostApplicationInformation extends VersionEnumeration<string> {
	/** SDK 版本号 */
	readonly SDKVersion: string;
}

declare interface DeviceInformation {
	/** 设备型号 */
	readonly model: string;
	/** 品牌 */
	readonly brand: string;
	/**
	 * 设备或系统使用的语言代码
	 * 返回符合 ISO-639-1 规范的语言代码和，符合 ISO-3166-1 规范的地区代码
	 *
	 * 示例:
	 *  - zh-CN
	 *  - en-US
	 */
	readonly language: string;
	/** 屏幕信息 */
	readonly screen: {
		/** 宽度（逻辑像素） */
		readonly width: number;
		/** 高度（逻辑像素） */
		readonly height: number;
		/** 设备像素比(每个逻辑需要多少个物理像素点) */
		readonly pixelRatio: number;
		/** 每英寸多少个逻辑像素 */
		readonly dpi: number;
	};
	/** 游戏窗口 */
	readonly window: {
		/** 宽度（逻辑像素） */
		readonly width: number;
		/** 高度（逻辑像素） */
		readonly height: number;
		/** 安全区域 */
		readonly safeArea: {
			/** 安全区域左上角横坐标 */
			readonly left: number;
			/** 安全区域右下角横坐标 */
			readonly right: number;
			/** 安全区域左上角纵坐标 */
			readonly top: number;
			/** 安全区域右下角纵坐标 */
			readonly bottom: number;
			/** 安全区域的宽度，单位逻辑像素 */
			readonly width: number;
			/** 安全区域的高度，单位逻辑像素 */
			readonly height: number;
		};
	};
}

declare interface CommunityInfo {
	/** 类型 */
	type: string;
	/** 名称 */
	name: string;
	/** 数据 */
	data?: any;
}

/** 分享信息 */
declare interface ShareInfo {
	/** 标题 */
	title?: string;
	/** 描述 */
	desc?: string;
	/** 图片 */
	imageUrl?: string;
	/** 分享参数 */
	query?: Record<string, unknown>;
}


declare interface TextStyle {
	color: string;
	font: string;
	fontSize: number;
	bold: boolean;
	italic: boolean;
	strokeWidth: number;
	strokeColor: string;
}

/** 性别 */
declare enum GenerType {
	/** 未知 */
	UNKNOWN,
	/** 男 */
	MALE,
	/** 女 */
	FEMALE,
}

/**
 * 用户信息
 */
declare interface IUserInfo {
	/** 用户ID */
	id?: string;
	/** 用户昵称 */
	nickName: string;
	/** 用户头像链接 */
	avatarUrl: string;
	/** 0 未知 1男 2女 */
	gender?: GenerType;
	/** 城市 */
	city?: string;
	/** 省 */
	province?: string;
	/** 国家 */
	country?: string;
	/** 语言 */
	language?: string;
	/** 附加信息 */
	meta?: any;
}


declare interface InputKeyboard {
	/** 键盘是否可见 */
	readonly visible: boolean;
	/** 键盘高度 */
	readonly height?: number;
	/** 键盘输入内容 */
	readonly value: string;
	/** 显示键盘 */
	show(params: ShowInputKeyboardParams): void;
	/** 隐藏键盘 */
	hide(): void;
}

declare interface ShowInputKeyboardParams {
	text: string;
	multiline?: boolean;
	maxLength?: number;
	confirmType?: 'done' | 'go' | 'next' | 'search' | 'send';
	confirmHold?: boolean;
}


declare interface VerifiedRuntimeInfo {
	appid?: string[];
	domain?: string[];
	package?: string[]
};

declare type ToastType = 'success' | 'fail' | 'loading' | 'warn' | 'none';

/** 平台信息 */
declare interface Platform extends IEventEmitter<ApplicationEvents> {
	/** 平台类型 */
	readonly type: string;
	/** 渠道号 */
	readonly channel: string;
	/** 操作系统信息 */
	readonly os: OSInformation;
	/** 设备信息 */
	readonly device: DeviceInformation;
	/** 应用程序（宿主）信息 */
	readonly application: HostApplicationInformation;
	/** 启动参数 */
	readonly launchOptions: {
		/**
		 * 启动路径
		 */
		path?: string,
		/** URL */
		url?: string;
		/**
		 * 启动参数
		 */
		query?: Record<string, any>,
		/**
		 * 启动场景，来源类型
		 */
		scene?: string | number,
		/** 来源类型的分组 */
		group_id?: string,
		[key: string]: any;
	};

	/** HTTP 请求适配器 */
	readonly http: http;

	/** 本地存储 */
	readonly localStorage: LocalStorage;

	/** 数据持久化保存的目录 */
	readonly persistentDataPath: string;

	/** 键盘实例 */
	readonly keyboard?: InputKeyboard;

	/** 获取高精度时间戳，单位（ms），时间从启动程序开始计算 */
	now(): number;

	/**
	 * 弹出消息窗
	 * @param message 消息内容
	 * @param title 标题, 默认为 `提示`
	 */
	alert(message: string, title?: string): Promise<void>;

	/**
	 * 请求用户自行进行确认
	 *
	 * @param message 消息内容
	 * @param title 标题, 默认为 `提示`
	 * @param confirm 确认按钮文本, 默认为`确定`
	 * @param cancel 取消按钮文本，默认为`取消`
	 *
	 * @returns 用户确认后 promise 将被 resolve ，取消或关闭则被 reject
	 */
	accept(message: string, title?: string, confirm?: string, cancel?: string): Promise<void>;

	/**
	 * 显示消息提示框
	 *
	 * @param {string} message 消息
	 * @param {string} [icon] 图标
	 * @memberof PlatformInformation
	 */
	toast(message: string, icon?: ToastType): Promise<void>;

	/**
	 * 设备震动
	 *
	 * @param {number} durationMs 震动时长
	 * @memberof BowserPlatform
	 */
	vibrate(durationMs: number): void;

	/** 重启游戏 */
	reload(): Promise<void>;

	/** 退出游戏 */
	exit(): Promise<void>;

	/** 检查平台是否支持某种特性 */
	check(type: keyof Platform): boolean;

	/** 分享参数 */
	shareParams?: {
		/** 分享标题 */
		title?: string;
		/** 分享图 */
		imageUrl?: string;
	};

	/** 分享应用 */
	share?: (params: ShareInfo) => Promise<void>;

	/** 邀请好友 */
	invite?: (params: ShareInfo) => Promise<{ name?: string; icon?: string; }>;

	/** 执行登陆 */
	login?: () => Promise<{ code?: string, token?: string, authCode?: string, anonymousCode?: string; openid?: string; }>;
	/** 获取设备ID */
	getDeviceID?: () => Promise<string>;
	/** 获取剪切板内容 */
	getClipboardData?: () => Promise<string>;
	/** 设置剪切板内容 */
	setClipboardData?: (data: string) => Promise<void>;
	/** 添加快捷方式 */
	createShortcut?: () => Promise<void>;
	/** 检查快捷方式 */
	checkShortcut?: () => Promise<boolean>;
	/**
	 * 获取用户信息
	 * @param resason 获取用户信息的权限请求理由，用于提示用户授权
	 * @returns 用户信息
	 */
	getUserInfo?: (resason?: string) => Promise<IUserInfo>;
	/** 关注公众号、抖音号、开发者 */
	followProfile?: () => Promise<void>;
	/** 检查是否关注公众号、抖音号、开发者 */
	checkFollowProfile?: () => Promise<boolean>;

	/** 加入社区 */
	joinCommunity?: (options?: CommunityInfo) => Promise<void>;
	/** 获取社区列表 */
	getCommunitys?: (...options?: any[]) => Promise<CommunityInfo[]>;

	/** 查看用户分享的视频*/
	showUserGeneratedVideo?: (videoID: string) => Promise<void>;

	/** 打开目标 */
	openTarget?: (options: OpenTargetOptions) => Promise<void>;

	/** 展示加载提示 */
	showLoading?: (title: string) => Promise<void>;
	/** 隐藏加载提示 */
	hideLoading?: () => Promise<void>;

	/** 展示应用商店打分弹窗 */
	showRatePopup?: () => Promise<void>;

	/** 隐藏原生闪屏 */
	hideSplash?: () => Promise<void>;

	/** 选择文件 */
	selectFiles?(type: 'image' | 'video' | 'audio' | 'file', options: { multiple?: boolean; accept?: string; } = {}): Promise<string[]>;

	/** 是否在浏览器中运行 */
	isRunningInBrowser: boolean;

	/** 文件系统 */
	readonly fs?: {
		/** 只读文件系统 */
		readonly readonly?: IReadonlyFilesSystem;
		/** 可写文件系统 */
		readonly writable?: IFilesSystem;
	};

	/** 文件下载器 */
	readonly downloader?: IFileDownloader;

	/** 游戏录屏，录制器 */
	readonly recorder?: IGameRecorder;

	/** 加速度计 */
	readonly accelerometer?: IEventEmitter<{
		changed(event: { x: number, y: number, z: number }): void;
	}>;

	/** WebSocket 实现 */
	WebSocket?: TinyWebSocketClass;

	/** 平台提供的 SDK */
	readonly SDKS?: ISDKClass[];

	/** 打开客服功能 */
	openCustomerServiceConversation?: () => Promise<void>;

	/** 查看小游戏入口面板 */
	showMiniGamePanel?: () => Promise<void>;

	/** 获取运行时信息 */
	getRuntimeInfo?: () => Promise<{ appid: string; }>
	/** 验证运行时环境 */
	validateRuntime?: (params: VerifiedRuntimeInfo) => Promise<boolean>;

	/** 读取构建时嵌入包体的文件 */
	readLocalFile?(file: string, format: 'text'): Promise<string>;
	readLocalFile?(file: string, format: 'binary'): Promise<ArrayBuffer>;
	readLocalFile?(file: string, format: 'text' | 'binary'): Promise<string | ArrayBuffer>;

	/** 加载图像内容 */
	loadImageBuffer?(url: string): Promise<ArrayBuffer>;
	/** 渲染文字到图像  */
	renderText?(text: string, style: Partial<WebTextStyle>): Promise<ArrayBuffer>;

	/** 获取系统字体 */
	getDefaultFont?(): { family: string; path?: string; };

	/** 使用协议 */
	startupConsent?(): Promise<void>;
}

/** 获取平台信息 */
declare function getPlatform(): Platform;


/** This Web Storage API interface provides access to a particular domain's session or local storage. It allows, for example, the addition, modification, or deletion of stored data items. */
interface LocalStorage {
	/**
	 * Removes the key/value pair with the given key, if a key/value pair with the given key exists.
	 *
	 * Dispatches a storage event on Window objects holding an equivalent Storage object.
	 */
	removeItem(key: string): void;
	/**
	 * Removes all key/value pairs, if there are any.
	 *
	 * Dispatches a storage event on Window objects holding an equivalent Storage object.
	 */
	clear(): void;
	/**
	 * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
	 *
	 * Throws a "QuotaExceededError" DOMException exception if the new value couldn't be set. (Setting could fail if, e.g., the user has disabled storage for the site, or if the quota has been exceeded.)
	 *
	 * Dispatches a storage event on Window objects holding an equivalent Storage object.
	 */
	setItem(key: string, value: string): void;

	/** Returns the current value associated with the given key, or null if the given key does not exist. */
	getItem(key: string): string | null;
}
