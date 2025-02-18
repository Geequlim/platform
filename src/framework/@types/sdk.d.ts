declare interface ISDKClass {
	/** SDK 的类型 */
	readonly type: string;
	/** 启动游戏时被创建 */
	new(options?: Record<string, any>): ISDK;
}

/** SDK 接口 */
declare interface ISDK {
	/** SDK 名称 */
	readonly name?: string;

	/** 游戏启动时被调用, 需要及时 reslove 否则将阻止游戏启动流程 */
	initialize?(): Promise<void>;

	/** 游戏结束时被调用 */
	finalize?(): void;

	/** 游戏开始时调用 */
	start?(): void;

	/** 上报事件 */
	sendEvent?(event: string, values?: Record<string, boolean|string|number|null>): Promise<void>;

	/** 用户登陆成功时被调用 */
	onUserLogin?(user: User): void;

	/** 应用进入前台时调用 */
	onShow?(): void;

	/** 应用进入后台是调用 */
	onHide?(): void;
}
