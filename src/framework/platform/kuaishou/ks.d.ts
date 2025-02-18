declare namespace ks {
	const env: {
		USER_DATA_PATH: string;
	};

	export function getSystemInfoSync(): {
		/** 设备品牌 */
		brand: string;
		/** 设备型号 */
		model: string;
		/** 设备像素比 */
		pixelRatio: number;
		/** 屏幕宽度，单位px */
		screenWidth: number;
		/** 屏幕高度，单位px */
		screenHeight: number;
		/** 可使用窗口宽度，单位px */
		windowWidth: number;
		/** 可使用窗口高度，单位px */
		windowHeight: number;
		/** 状态栏的高度，单位px */
		statusBarHeight: number;
		/** 快手设置的语言 */
		language: string;
		/** 快手小游戏版本号 */
		version: string;
		/** SDK 版本号 */
		SDKVersion: string;
		/** 操作系统及版本 */
		system: string;
		/** 客户端平台 */
		platform: string;
		/** 允许使用相册的开关（仅 iOS 有效） */
		albumAuthorized: boolean;
		/** 允许使用摄像头的开关 */
		cameraAuthorized: boolean;
		/** 允许使用定位的开关 */
		locationAuthorized: boolean;
		/** 允许使用麦克风的开关 */
		microphoneAuthorized: boolean;
		/** 允许通知的开关 */
		notificationAuthorized: boolean;
		/** 允许通知带有提醒的开关（仅 iOS 有效） */
		notificationAlertAuthorized: boolean;
		/** 允许通知带有标记的开关（仅 iOS 有效） */
		notificationBadgeAuthorized: boolean;
		/** 允许通知带有声音的开关（仅 iOS 有效） */
		notificationSoundAuthorized: boolean;
		/** 蓝牙的系统开关 */
		bluetoothEnabled: boolean;
		/** 地理位置的系统开关 */
		locationEnabled: boolean;
		/** Wi-Fi 的系统开 */
		wifiEnabled: boolean;
		/** 在竖屏正方向下的安全区域 */
		safeArea: {
			/** 安全区域左上角横坐标 */
			left: number;
			/** 安全区域右下角横坐标 */
			right: number;
			/** 安全区域左上角纵坐标 */
			top: number;
			/** 安全区域右下角纵坐标 */
			bottom: number;
			/** 宽 */
			width: number;
			/** 高 */
			height: number;
		};
		/** 当前小游戏运行的宿主环境 */
		host: {
			/**	宿主 app 对应的 appId */
			appId: string;
			/**	哪种快手app，有快手，快手极速版，和快看点三个值 */
			env: string;
			/**	游戏版本 */
			gameVersion: string;
		}
	};

	type LauchOptions = {
		/** 游戏启动场景 */
		from: string;
		/** 启动小游戏时传入的参数 */
		query: Object;
	}

	export function exitMiniProgram(): void;

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


	/**
	 * 加载自定义字体文件。
	 * @export
	 * @param {string} path 字体文件路径。支持本地路径、代码包路径。
	 * @returns {string} 字体 family 值
	 */
	export function loadFont(path: string): string;

	interface Image {
		/**
		 * 图片的 URL
		 */
		src: string;
		/**
		 * 图片的真实宽度
		 */
		width: number;
		/**
		 * 图片的真实高度
		 */
		height: number;
		/**
		 * 图片的加载完成
		 */
		onload: (res?: any) => void;
		/**
		 * 图片加载发生错误后触发的回调函数
		 */
		onerror: (res?: any) => void;
	}

	/**
	 * 创建一个图片对象
	 */
	function createImage(): Image;

	/** 显示消息提示框*/
	function showToast(object: {
		title: string;
		icon?: "success" | "loading" | "none";
		image?: string;
		duration?: number; // 1500;
		mask?: boolean;
		success?: (res?: any) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): void;

	/**
	 * 显示模态对话框
	 */
	function showModal(object: {
		title: string;
		content: string;
		showCancel?: boolean; // true;
		cancelText?: string; // "取消";
		cancelColor?: string; // "#000000";
		confirmText?: string; // "确定";
		confirmColor?: string; // "#3cc51f";
		success?: (res?: any) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): void;

	/**
	 * 显示操作菜单
	 */
	function showActionSheet(object: {
		itemList: string[];
		itemColor?: string;
		success?: (res?: { tapIndex: number; }) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): void;

	/** 隐藏消息提示框*/
	function hideToast(object: {
		success?: (res?: any) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): void;

	/** 隐藏 loading 提示框*/
	function hideLoading(object: {
		success?: (res?: any) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): void;
	/** 显示 loading 提示框。需主动调用 ks.hideLoading 才能关闭提示框*/
	function showLoading(object: {
		title: string;
		mask?: boolean;
		success?: (res?: any) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): void;

	interface RequestTask {
		abort(): void;
		/** 监听 HTTP Response Header 事件。会比请求完成事件更早*/
		onHeadersReceived(callback: (res: { header: Object; }) => void): void;
		/** 取消监听 HTTP Response Header 事件*/
		offHeadersReceived(callback: () => void): void;
	}

	/**
	 * 发起网络请求。
	 */
	function request(object: {
		url: string;
		data?: string | {} | ArrayBuffer;
		header?: {};
		method?: "OPTIONS" | "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "TRACE" | "CONNECT";
		dataType?: "json" | string;
		responseType?: "text" | "arraybuffer";
		success?: (res?: { data: string | {} | ArrayBuffer; statusCode: number; header: {}; }) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): RequestTask;

	interface DownloadTask {
		abort(): void;

		/** 监听下载进度变化事件*/
		onProgressUpdate(
			callback: (res: { progress: number; totalBytesWritten: number; totalBytesExpectedToWrite: number; }) => void
		): void;

		/** 取消监听下载进度变化事件*/
		offProgressUpdate(callback: () => void): void;
		/** 监听 HTTP Response Header 事件。会比请求完成事件更早*/
		onHeadersReceived(callback: (res: { header: Object; }) => void): void;
		/** 取消监听 HTTP Response Header 事件*/
		offHeadersReceived(callback: () => void): void;
	}

	/** 使手机发生较长时间的振动（400 ms)*/
	function vibrateLong(object?: {
		success?: (res?: any) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): void;

	/** 使手机发生较短时间的振动（15 ms）。仅在 iPhone 7 / 7 Plus 以上及 Android 机型生效*/
	function vibrateShort(object?: {
		success?: (res?: any) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): void;

	/**
	 * 下载文件资源到本地，客户端直接发起一个 HTTP GET 请求，返回文件的本地文件路径。
	 */
	function downloadFile(object: {
		url: string;
		header?: Object;
		filePath?: string;
		success?: (res?: { tempFilePath: string; statusCode: number; }) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): DownloadTask;

	/** 主动拉起转发，进入选择通讯录界面。 */
	function shareAppMessage(object: {
		templateId: string;
		query?: string;
		success?: (res?: any) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	});


	/**
	 * ks.getStorageInfo 的同步版本
	 */
	function getStorageInfoSync(): { keys: Array<string>; currentSize: number; limitSize: number; };

	/**
	 * 异步获取当前storage的相关信息
	 */
	function getStorageInfo(object: {
		success?: (res: { keys: Array<string>; currentSize: number; limitSize: number; }) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): void;

	/**
	 * ks.clearStorage 的同步版本
	 */
	function clearStorageSync(): void;

	/**
	 * 清理本地数据缓存
	 */
	function clearStorage(object: {
		success?: (res?: any) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): void;

	/**
	 * ks.removeStorage 的同步版本
	 */
	function removeStorageSync(key: string): void;

	/**
	 * 从本地缓存中移除指定 key
	 */
	function removeStorage(object: {
		key: string;
		success?: (res?: any) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): void;

	/**
	 * ks.setStorage 的同步版本
	 */
	function setStorageSync(key: string, data: any): void;

	/**
	 * 将数据存储在本地缓存中指定的 key 中，会覆盖掉原来该 key 对应的内容。
	 */
	function setStorage(object: {
		key: string;
		data: any;
		success?: (res?: any) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): void;

	/**
	 * ks.getStorage 的同步版本
	 */
	function getStorageSync(key: string): any;

	/**
	 * 从本地缓存中异步获取指定 key 的内容
	 */
	function getStorage(object: {
		key: string;
		success?: (res: { data: any; }) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): void;


	/**
	 * InnerAudioContext 实例，可通过 ks.createInnerAudioContext 接口获取实例。
	 */
	interface InnerAudioContext {
		/** 音频资源的地址，用于直接播放。2.2.3 开始支持云文件ID*/
		src: string;
		/** 开始播放的位置（单位：s），默认为 0*/
		startTime: number;
		/** 是否自动开始播放，默认为 false*/
		autoplay: boolean;
		/** 是否循环播放，默认为 false*/
		loop: boolean;
		/** 是否遵循系统静音开关，默认为 true。当此参数为 false 时，即使用户打开了静音开关，也能继续发出声音*/
		obeyMuteSwitch: boolean;
		/** 基础库 1.9.90 开始支持，低版本需做兼容处理。音量。范围 0~1。默认为 1*/
		volume: number;
		/** 当前音频的长度（单位 s）。只有在当前有合法的 src 时返回（只读）*/
		duration: number;
		/** 当前音频的播放位置（单位 s）。只有在当前有合法的 src 时返回，时间保留小数点后 6 位（只读）*/
		currentTime: number;
		/** 当前是是否暂停或停止状态（只读）*/
		paused: boolean;
		/** 音频缓冲的时间点，仅保证当前播放时间点到此时间点内容已缓冲（只读）*/
		buffered: number;
		/**
		 * 销毁当前实例
		 */
		destroy(): void;
		/**
		 * 取消监听音频进入可以播放状态的事件
		 */
		offCanplay(callback: () => void): void;
		/**
		 * 监听音频暂停事件
		 */
		onPause(callback: () => void): void;
		/**
		 * 监听音频停止事件
		 */
		onStop(callback: () => void): void;
		/**
		 * 取消监听音频停止事件
		 */
		offStop(callback: () => void): void;
		/**
		 * 监听音频自然播放至结束的事件
		 */
		onEnded(callback: () => void): void;
		/**
		 * 取消监听音频自然播放至结束的事件
		 */
		offEnded(callback: () => void): void;
		/**
		 * 监听音频播放进度更新事件
		 */
		onTimeUpdate(callback: () => void): void;
		/**
		 * 监听音频播放事件
		 */
		onPlay(callback: () => void): void;
		/**
		 * 监听音频播放错误事件
		 */
		onError(callback: (res: { errCode: 10001 | 10002 | 10003 | 10004 | -1; }) => void): void;
		/**
		 * 取消监听音频暂停事件
		 */
		offPause(callback: () => void): void;
		/**
		 * 监听音频加载中事件，当音频因为数据不足，需要停下来加载时会触发
		 */
		onWaiting(callback: () => void): void;
		/**
		 * 取消监听音频加载中事件，当音频因为数据不足，需要停下来加载时会触发
		 */
		offWaiting(callback: () => void): void;
		/**
		 * 监听音频进行跳转操作的事件
		 */
		onSeeking(callback: () => void): void;
		/**
		 * 取消监听音频进行跳转操作的事件
		 */
		offSeeking(callback: () => void): void;
		/**
		 * 监听音频完成跳转操作的事件
		 */
		onSeeked(callback: () => void): void;
		/**
		 * 取消监听音频完成跳转操作的事件
		 */
		offSeeked(callback: () => void): void;
		/**
		 * 取消监听音频播放事件
		 */
		offPlay(callback: () => void): void;
		/**
		 * 取消监听音频播放进度更新事件
		 */
		offTimeUpdate(callback: () => void): void;
		/**
		 * 监听音频进入可以播放状态的事件
		 */
		onCanplay(callback: () => void): void;
		/**
		 * 取消监听音频播放错误事件
		 */
		offError(callback: (res: { errCode: 10001 | 10002 | 10003 | 10004 | -1; }) => void): void;
		/**
		 * 停止。停止后的音频再播放会从头开始播放。
		 */
		pause(): void;
		/**
		 * 播放
		 */
		play(): void;
		/**
		 * 停止
		 */
		stop(): void;
		/**
		 * 跳转到指定位置，单位 s
		 */
		seek(position: number): void;
	}
	/**
	 * 创建内部 audio 上下文 InnerAudioContext 对象。
	 */
	function createInnerAudioContext(): InnerAudioContext;


	/** 文件管理器*/
	interface FileSystemManager {
		/**
		 * 判断文件/目录是否存在
		 */
		access(object: {
			path: string;
			success?: (res?: any) => void;
			fail?: (res?: { errMsg: string; }) => void;
			complete?: (res?: any) => void;
		}): void;
		/**
		 * FileSystemManager.access 的同步版本
		 */
		accessSync(path: string): void;

		/** 在文件结尾追加内容*/
		appendFile(
			filePath: string,
			data: string | ArrayBuffer,
			encoding: string,
			success?: (res?: any) => void,
			fail?: (res: { errMsg: string; }) => void,
			complete?: (res?: any) => void
		): void;

		/** appendFile同步版本*/
		appendFileSync(filePath: string, data: string | ArrayBuffer, encoding: string): void;

		/**
		 * 保存临时文件到本地。此接口会移动临时文件，因此调用成功后，tempFilePath 将不可用。
		 */
		saveFile(object: {
			tempFilePath: string;
			filePath?: string;
			success?: (res: { savedFilePath: number; }) => void;
			fail?: (res: { errMsg: string; }) => void;
			complete?: (res?: any) => void;
		}): void;

		/**
		 * FileSystemManager.saveFile 的同步版本
		 */
		saveFileSync(tempFilePath: string, filePath: string): number;

		/**
		 * 获取该小程序下已保存的本地缓存文件列表
		 */
		getSavedFileList(object: {
			success?: (res: { fileList: Array<{ filePath: string; size: number; createTime: number; }>; }) => void;
			fail?: (res?: any) => void;
			complete?: (res?: any) => void;
		}): void;

		/**
		 * 删除该小程序下已保存的本地缓存文件
		 */
		removeSavedFile(object: {
			filePath: string;
			success?: (res?: any) => void;
			fail?: (res: { errMsg: string; }) => void;
			complete?: (res?: any) => void;
		}): void;

		/**
		 * 复制文件
		 */
		copyFile(object: {
			srcPath: string;
			destPath: string;
			success?: (res?: any) => void;
			fail?: (res: { errMsg: string; }) => void;
			complete?: (res?: any) => void;
		}): void;

		/**
		 * FileSystemManager.copyFile 的同步版本
		 */
		copyFileSync(srcPath: string, destPath: string): void;

		/**
		 * 获取该小程序下的 本地临时文件 或 本地缓存文件 信息
		 */
		getFileInfo(object: {
			filePath: string;
			success?: (res: { size: number; }) => void;
			fail?: (res: { errMsg: string; }) => void;
			complete?: (res?: any) => void;
		}): void;

		/**
		 * 创建目录
		 */
		mkdir(object: {
			dirPath: string;
			recursive?: boolean;
			success?: (res?: any) => void;
			fail?: (res: { errMsg: string; }) => void;
			complete?: (res?: any) => void;
		}): void;

		/**
		 * FileSystemManager.mkdir 的同步版本
		 */
		mkdirSync(dirPath: string, recursive: boolean): void;

		/**
		 * 读取本地文件内容
		 */
		readFile(object: {
			filePath: string;
			encoding?: string;
			success?: (res: { data: string | ArrayBuffer; }) => void;
			fail?: (res: { errMsg: string; }) => void;
			complete?: (res?: any) => void;
		}): void;

		/**
		 * FileSystemManager.readFile 的同步版本
		 */
		readFileSync(filePath: string, encoding: string): string | ArrayBuffer;

		/**
		 * 读取目录内文件列表
		 */
		readdir(object: {
			dirPath: string;
			success?: (res: { files: Array<string>; }) => void;
			fail?: (res: { errMsg: string; }) => void;
			complete?: (res?: any) => void;
		}): void;
		/**
		 * FileSystemManager.readdir 的同步版本
		 */
		readdirSync(dirPath: string): string[];

		/**
		 * 重命名文件，可以把文件从 oldPath 移动到 newPath
		 */
		rename(object: {
			oldPath: string;
			newPath: string;
			success?: (res?: any) => void;
			fail?: (res: { errMsg: string; }) => void;
			complete?: (res?: any) => void;
		}): void;

		/**
		 * FileSystemManager.rename 的同步版本
		 */
		renameSync(oldPath: string, newPath: string): void;

		/**
		 * 删除目录
		 */
		rmdir(object: {
			dirPath: string;
			recursive: boolean;
			success?: (res?: any) => void;
			fail?: (res: { errMsg: string; }) => void;
			complete?: (res?: any) => void;
		}): void;

		/**
		 * FileSystemManager.rmdir 的同步版本
		 */
		rmdirSync(dirPath: string, recursive: boolean): void;

		/**
		 * 获取文件 Stats 对象
		 */
		stat(object: {
			path: string;
			recursive?: boolean;
			success?: (res: { stats: Stats; }) => void;
			fail?: (res: { errMsg: string; }) => void;
			complete?: (res?: any) => void;
		}): Stats;

		/**
		 * FileSystemManager.stat 的同步版本
		 */
		statSync(path: string, recursive: boolean): Stats;

		/**
		 * 删除文件
		 */
		unlink(object: {
			filePath: string;
			success?: (res?: any) => void;
			fail?: (res: { errMsg: string; }) => void;
			complete?: (res?: any) => void;
		}): void;

		/**
		 * 解压文件
		 */
		unzip(object: {
			zipFilePath: string;
			targetPath: string;
			success?: (res?: any) => void;
			fail?: (res: { errMsg: string; }) => void;
			complete?: (res?: any) => void;
		}): void;

		/**
		 * FileSystemManager.unlink 的同步版本
		 */
		unlinkSync(filePath: string): void;

		/**
		 * 写文件
		 */
		writeFile(object: {
			filePath: string;
			data: string | ArrayBuffer;
			encoding: string;
			success?: (res?: any) => void;
			fail?: (res: { errMsg: string; }) => void;
			complete?: (res?: any) => void;
		}): void;

		/**
		 * FileSystemManager.writeFile 的同步版本
		 */
		writeFileSync(filePath: string, data: string | ArrayBuffer, encoding: string): void;
	}

	/** 描述文件状态的对象*/
	interface Stats {
		/**
		 * 文件的类型和存取的权限，对应 POSIX stat.st_mode
		 */
		mode: string;
		/**
		 * 文件大小，单位：B，对应 POSIX stat.st_size
		 */
		size: number;
		/**
		 * 文件最近一次被存取或被执行的时间，UNIX 时间戳，对应 POSIX stat.st_atime
		 */
		lastAccessedTime: number;
		/**
		 * 文件最后一次被修改的时间，UNIX 时间戳，对应 POSIX stat.st_mtime
		 */
		lastModifiedTime: number;
		/**
		 * 判断当前文件是否一个目录
		 */
		isDirectory(): boolean;
		/**
		 * 判断当前文件是否一个普通文件
		 */
		isFile(): boolean;
	}

	/**
	 * 获取全局唯一的文件管理器
	 */
	function getFileSystemManager(): FileSystemManager;


	interface UserInfo {
		/** 昵称 */
		userName: string;
		/** 头像 */
		userHead: string;
		/** 性别，M-男，F-女 */
		gender: string;
		/** 城市 */
		userCity: string;
		/** 年龄 */
		age: number;
		/** 关联同一个开发者不同游戏的同一用户的唯一标识 */
		unionID: string;
	}

	/** 获取用户信息。
	 *
	 * 如果在未调用ks.authorize接口授权userInfo信息的情况下，调用ks.getUserInfo接口，返回的数据仅包含unionID。
	 *
	 * unionID的作用包括：
	 *
	 *  1、CP可以根据unionID关联同一个宿主下(都上架到快手平台)自己开发的不同游戏的同一个用户
	 *
	 *  2、针对多宿主的场景，CP可以通过unionId关联同一个游戏在不同宿主下的同一个用户
	 *
	 */
	function getUserInfo(options: {
		success?: (res: UserInfo) => void;
		fail?: (res: { msg: string; }) => void;
		complete?: (res?: any) => void;
	}): void;

	function login(option: {
		success?: (res: {
			/** 用户id */
			gameUserId: string;
			/** token */
			gameToken: string;
		}) => void;
		fail?: (res: { msg: string; }) => void;
		complete?: (res?: any) => void;
	}): void;

	/**
	 * 向用户发起授权请求。
	 *
	 * 1.如果尚未发起过授权请求，则弹窗询问用户是否同意授权游戏使用某项功能或获取用户的某些数据；
	 *
	 * 2.如果用户之前已经同意授权，则不会出现弹窗，直接返回成功；
	 *
	 * 3.如果用户之前已经拒绝授权，则不会再次出现弹窗，直接返回失败。
	 *
	 * 需要首先调用 ks.login 接口。
	*/
	function authorize(object: {
		scope: string;
		success?: (res?: any) => void;
		fail?: (res?: { code: number, msg: string }) => void;
		complete?: (res?: any) => void;
	}): void;

	/** 获取用户的当前设置。返回值中只会出现小程序已经向用户请求过的权限。*/
	function getSetting(object: {
		success?: (res: { result: { 'scope.userInfo': boolean }; }) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): void;


	/** 游戏画面录制对象 */
	interface GameRecorder {

		/** 开始录制游戏画面 */
		start(): void;

		/** 结束录制游戏画面。结束录制后可以发起分享。 */
		stop(): Promise;

		/** 暂停录制游戏画面。 */
		pause(): Promise;

		/** 恢复录制游戏画面。 */
		resume(): Promise;

		/** 放弃录制游戏画面。此时已经录制的内容会被丢弃。 */
		abort(): Promise;

		/** 注册监听录制事件的回调函数。当对应事件触发时，回调函数会被执行。 */
		on(event: string, callback: Function): void;

		/** 取消监听录制事件。当对应事件触发时，该回调函数不再执行。 */
		off(event: string, callback: Function): void;

		/** 发布录屏到快手 */
		publishVideo(object: {
			/** 回调函数 */
			callback: (error?: string | Object) => void;
			/** 分享文案模板 id。通过指定 mouldId 来选择分享文案，文案内容需在开放平台设置且通过审核。非必填。 */
			mouldId: string;
			/** 待发布的视频片段 videoID 或 videoID 数组。如果不传该字段，则默认发布最后一次 start，stop 之间生成的视频数据。若录屏失败则不会生成videoID，发布录屏会失败 */
			video: number | number[];
			/** 发布录屏携带字段信息，支持格式为格式为aaa=bbb&ccc=ddd。通过发布的视频打开游戏可以通过ks.getLaunchOptionsSync的query字段获取，此时获取的是一个object */
			query: string;
		}): void;
	}

	/** 查看关注官方帐号状态 */
	function checkFollowState(options: {
		/** 要关注的用户类型 CPServiceAccount : CP的服务号 MiniGameOfficialAccount:快手小游戏官方号 说明:不需要填具体的帐号，就填这两个字符串就可以了，参考示例	 */
		accountType: string;
		/** 回调信息 */
		callback: (res: {
			/** 1 表示成功 */
			errorCode: number;
			/** 错误信息 */
			errorMsg: string;
			/** 是否关注 */
			hasFollow: bool;
		}) => void
	}): void;

	/** 打开官方帐号profile */
	function openUserProfile(object: {
		/** 要关注的用户类型	CPServiceAccount : CP的服务号 MiniGameOfficialAccount:快手小游戏官方号 说明:不需要填具体的帐号，就填这两个字符串就可以了 */
		accountType: string;
		/** 回调信息  */
		callback: (res: {
			/** 1表示成功 */
			errorCode: number;
			/** 错误信息 */
			errorMsg: string;
		}) => void;
	}): void;


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
	 *  触发分包加载，详见 分包加载
	 */
	function loadSubpackage(res: {
		/** 分包的名字，可以填 name 或者 root*/
		name: string;
		/** 分包加载成功回调事件*/
		success: () => void;
		/** 分包加载失败回调事件*/
		fail: () => void;
		/** 分包加载结束回调事件(加载成功、失败都会执行）*/
		complete: () => void;
	}): LoadSubpackageTask;

	/** 激励视频广告组件。激励视频广告组件是一个原生组件，层级比普通组件高 */
	class RewardedVideoAd {
		/** 显示激励视频广告。激励视频广告将从屏幕下方推入。 */
		show(): Promise;
		/** 销毁激励视频广告实例。 */
		destroy(): void;
		/** 激励视频错误事件的回调函数 */
		onError(callback: (err: { code: number, msg: string }) => void): void;
		/** 取消监听激励视频错误事件 */
		offError(callback: (err: { code: number, msg: string }) => void): void;
		/** 监听用户关闭激励视频广告。 */
		onClose(callback: (res: { isEnded: boolean }) => void): void;
		/** 取消监听用户点击 关闭广告 按钮的事件 */
		offClose(callback: (res: { isEnded: boolean }) => void): void;
	}
	/** 创建激励视频广告组件。调用该方法创建的激励视频广告是一个单例。 */
	function createRewardedVideoAd(options: { adUnitId: string }): RewardedVideoAd;


	/** 插屏广告组件。插屏广告组件是一个原生组件，层级比普通组件高。插屏广告组件每次创建都会返回一个全新的实例，默认是隐藏的，需要调用 InterstitialAd.show() 将其显示。*/
	class InterstitialAd {
		/** 显示插屏广告。 */
		show(): Promise;
		/** 销毁插屏广告实例。 */
		destroy(): void;
		/** 监听插屏错误事件。 */
		onError(callback: (err: { code: number, msg: string }) => void): void;
		/** 取消监听插屏错误事件 */
		offError(callback: (err: { code: number, msg: string }) => void): void;
		/** 监听用户点击 关闭广告 按钮的事件。 */
		onClose(callback: () => void): void;
		/** 取消监听用户点击 关闭广告 按钮的事件 */
		offClose(callback: () => void): void;
	}

	/** 创建插屏广告组件。每次调用该方法创建插屏广告都会返回一个全新的实例。 */
	function createInterstitialAd(options: {adUnitId: string}): InterstitialAd;

	/** 游戏画面录制对象 */
	class GameRecorder {
		/** 开始录制游戏画面 */
		start(): void;
		/** 结束录制游戏画面。结束录制后可以发起分享。 */
		stop(): Promise<void>;
		/** 暂停录制游戏画面 */
		pause(): Promise<void>;
		/** 恢复录制游戏画面。 */
		resume(): Promise<void>;
		/** 放弃录制游戏画面。此时已经录制的内容会被丢弃。 */
		abort(): Promise<void>;
		/** 注册监听录制事件的回调函数。当对应事件触发时，回调函数会被执行。 */
		on(
			event: 'start' | 'stop' | 'pause' | 'resume' | 'abort' | 'error',
			callback: (err?: { code: number, msg: string, videoID?: number}) => void
		): void;
		/** 取消监听录制事件。当对应事件触发时，该回调函数不再执行。 */
		off(
			event: 'start' | 'stop' | 'pause' | 'resume' | 'abort' | 'error',
			callback: (err?: { code: number, msg: string}) => void
		): void;

		/** 发布录屏到快手。 */
		publishVideo(options: {
			/** 分享文案模板 id。通过指定 mouldId 来选择分享文案，文案内容需在开放平台设置且通过审核。非必填。 */
			mouldId?: string;
			/** 待发布的视频片段 videoID 或 videoID 数组。如果不传该字段，则默认发布最后一次 start，stop 之间生成的视频数据。若录屏失败则不会生成videoID，发布录屏会失败 */
			video?: number | number[];
			/** 布录屏携带字段信息，支持格式为格式为aaa=bbb&ccc=ddd。通过发布的视频打开游戏可以通过ks.getLaunchOptionsSync的query字段获取，此时获取的是一个object */
			query?: string;
			/** 回调函数 */
			callback?: (err?: { code: number, msg: string }) => void;
		}): void;
	}
	/** 获取全局唯一的游戏画面录制对象 */
	function getGameRecorder(): GameRecorder;

	/** 查询APK是否保存到桌面 */
	function getAPKShortcutInstallStatus(
		callback: (ret: {
			/** 1 表示成功 */
			code: number;
			/** 是否安装 */
			installed: boolean;
			/** 错误信息 */
			msg: string;
		}) => void
	): void;

	/** 保存小游戏APK到桌面 */
	function saveAPKShortcut(
		callback: (ret: {
			/** 1 表示成功 */
			code: number;
			/** 错误信息 */
			msg: string;
		}) => void
	):void;

	/** 查看关注官方帐号状态 */
	function checkFollowState(options: {
		/** 要关注的用户类型 CPServiceAccount : CP的服务号 MiniGameOfficialAccount:快手小游戏官方号 */
		accountType: 'CPServiceAccount' | 'MiniGameOfficialAccount',
		/** 回调信息 */
		callback: (ret: {
			errorMsg: string;
			errorCode: number;
			hasFollow: boolean;
		}) => void;
	});

	/** 打开官方帐号profile */
	function openUserProfile(options: {
		/** 要关注的用户类型 CPServiceAccount : CP的服务号 MiniGameOfficialAccount:快手小游戏官方号 */
		accountType: 'CPServiceAccount' | 'MiniGameOfficialAccount',
		/** 回调信息 */
		callback: (ret: {
			errorMsg: string;
			errorCode: number;
		}) => void;
	});

	function setStorageSync(key: string, data: any): void;
	function getStorageSync(key: string): any;
	function removeStorageSync(key: string): void;
	function clearStorageSync(): void;

	interface SocketTask {
		/**
		 * 关闭 WebSocket 连接
		 */
		close(object: {
			code?: number;
			reason?: string;
			success?: (res?: any) => void;
			fail?: (res?: any) => void;
			complete?: (res?: any) => void;
		}): void;
		/**
		 * 监听WebSocket 连接打开事件
		 */
		onOpen(callback: (res: { header: Object; }) => void): void;
		/**
		 * 监听WebSocket 连接关闭事件
		 */
		onClose(callback: (res: { code: number; reason: string; }) => void): void;
		/**
		 * 监听WebSocket 错误事件
		 */
		onError(callback: (res: { errMsg: string; }) => void): void;
		/**
		 * 监听WebSocket 接受到服务器的消息事件
		 */
		onMessage(callback: (res: { data: string | ArrayBuffer; }) => void): void;
		/**
		 * 通过 WebSocket 连接发送数据
		 */
		send(object: {
			data: string | ArrayBuffer;
			success?: (res?: any) => void;
			fail?: (res?: any) => void;
			complete?: (res?: any) => void;
		}): void;
	}

	/**
	 * 创建一个 WebSocket 连接。
	 */
	function connectSocket(object: {
		url: string;
		header?: {};
		protocols: Array<string>;
		success?: (res?: any) => void;
		fail?: (res?: any) => void;
		complete?: (res?: any) => void;
	}): SocketTask;
}
