export enum PlatformType {
	/** 平台类型无法被正确检测 */
	Unknown = 'unknown',
	/** 原生应用，直接安装到系统不需要借助其他程序就能运行 */
	Native = 'native',
	/** 原生 - 小米应用市场 */
	NativeMi = 'native-mi',

	/** 开发环境 */
	Dev = 'dev',
	/** 浏览器 */
	Web = 'web',
	/** 微信小游戏 */
	Wechat = 'wechat',
	/** QQ 小游戏 */
	QQ = 'qq',
	/** 字节跳动平台小游戏 */
	ByteDance = 'bytedance',
	/** OPPO小游戏 */
	OPPO = 'oppo',
	/** VIVO小游戏 */
	VIVO = 'vivo',
	/** UC 小游戏 */
	UC = 'uc',
	/** 快手小游戏*/
	KuaiShou = 'kuaishou',
	/** hago游戏 */
	Hago = 'hago',
	/** 安卓原生 */
	Android = 'android',
	/** AppStore */
	iOS = 'iOS',
	/** 玩吧 */
	Wanba = 'wanba'
}

export enum HostApplicationEvent {
	FOCUS = 'focus',
	INFOCUS = 'infocus',
	VISIABLE = 'visiable',
	INVISIABLE = 'invisiable',
}
