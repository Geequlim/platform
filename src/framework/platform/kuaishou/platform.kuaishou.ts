/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlatformType } from 'framework/common/constants';
import { SizeLimitedFileSystem } from 'framework/tiny/utils/fs/fs.sizelimited';
import { XHRHttp } from 'framework/tiny/utils/http.xhr';
import { path } from 'framework/tiny/utils/path';
import { GamePlatformBase } from '../platform.common';
import { DefinePlatfrom } from '../utils';
import { KuaishouFileDownloader } from './downloader.kuaishou';
import { KuaishouFileSystem, KuaishouInPackageFileSystem } from './fs.kuaishou';
import { KuaishouGameRecorder } from './recorder.kuaishou';
import { KuaishouLocalStorage } from './storage.kuaishou';
import { KuaiShouWebSocket } from './websocket.kuaishou';
import { DefaultWebFont, WebCanvas } from '../web/canvas';

interface AsyncCallbackOptions<T = any> {
	success?(ret: T): void;
	fail?(err: { msg: string; code: number }): void;
	complete?(): void;
}
/** 调用微信的异步API */
function callAsyncApi<T, R>(api: (options: AsyncCallbackOptions<R> & T) => void, options?: T): Promise<R> {
	return new Promise((resolve, reject) => {
		const params: AsyncCallbackOptions = {
			success: (ret: R) => resolve(ret),
			fail: (err: { code: number, msg: string; }) => reject(new Error(`${err.code} ${err.msg}`)),
			...options
		};
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		api.call(ks, params as any);
	});
}

export class KuaiShouPlatform extends GamePlatformBase implements Platform {

	get type(): string { return PlatformType.KuaiShou; }
	readonly systemInfo = ks.getSystemInfoSync();
	readonly $launchOptions = ks.getLaunchOptionsSync();
	protected $http = new XHRHttp();
	get launchOptions() { return this.$launchOptions; }
	get persistentDataPath() { return ks.env.USER_DATA_PATH; }

	readonly localStorage = new KuaishouLocalStorage();

	private _shareParams: {
		title?: string;
		imageUrl?: string;
		query?: string;
		imageUrlId?: string;
	};

	public get shareParams() {
		return this._shareParams;
	}
	public set shareParams(v) {
		this._shareParams = v;
	}

	now() { return Date.now() - this.$startAt; }
	$startAt = Date.now();

	constructor() {
		super();

		ks.onShow(() => {
			this.emit('visible');
			setTimeout(() => { this.emit('focus'); }, 32); // 微信 iOS 不按套路来
		});

		ks.onHide(() => {
			this.emit('infocus');
			this.emit('hidden');
		});
	}

	get os(): OSInformation {
		return {
			name: this.systemInfo.platform.toLowerCase() as OSType,
			version: this.systemInfo.system
		};
	}
	get device(): DeviceInformation {
		return {
			model: this.systemInfo.model,
			brand: this.systemInfo.brand,
			language: (this.systemInfo.language || 'zh_CN').replace(/_/g, '-'),
			screen: {
				width: this.systemInfo.screenWidth,
				height: this.systemInfo.screenHeight,
				pixelRatio: this.systemInfo.pixelRatio,
				dpi: 160,
			},
			window: {
				width: this.systemInfo.windowWidth,
				height: this.systemInfo.windowHeight,
				safeArea: this.systemInfo.safeArea
			}
		};
	}

	get application(): HostApplicationInformation {
		return {
			name: 'wechat',
			version: this.systemInfo.version,
			SDKVersion: this.systemInfo.SDKVersion
		};
	}

	check(type: keyof Platform): boolean {
		switch (type) {
			case 'createShortcut':
			case 'checkShortcut':
				return this.os.name === 'android' && false; // 快手需要申请权限？
			case 'followProfile':
				return false;
			case 'loadImageBuffer':
				return this.os.name === 'ios'; // 安卓上还不验证域名
			case 'renderText':
				return this.os.name === 'ios'; // 安卓上文字渲染效果不好
			default:
				break;
		}
		return super.check(type);
	}

	alert(message: string, title?: string): Promise<void> {
		return new Promise((resolve, reject) => {
			ks.showModal({
				title,
				content: message,
				showCancel: false,
				complete: ret => resolve()
			});
		});
	}

	accept(message: string, title?: string, confirm?: string, cancel?: string): Promise<void> {
		return new Promise((resolve, reject) => {
			ks.showModal({
				title,
				content: message,
				confirmText: confirm,
				cancelText: cancel,
				showCancel: true,
				complete: (ret) => ret.confirm ? resolve() : reject()
			});
		});
	}

	async toast(message: string, icon: 'success' | 'fail' | 'loading' | 'none' = 'none'): Promise<void> {
		if (icon === 'fail') {
			icon = 'error' as any;
		}
		await callAsyncApi(ks.showToast, { title: message, icon: icon as 'none' });
	}

	vibrate(durationMs: number): void {
		if (durationMs >= 400) {
			ks.vibrateLong();
		} else {
			ks.vibrateShort();
		}
	}

	async exit() {
		await callAsyncApi(ks.exitMiniProgram, {});
	}

	share(params?: any): Promise<void> {
		if (params && !this.shareParams) this.shareParams = params;
		return new Promise((resolve, reject) => {
			ks.shareAppMessage({
				...params,
				success: resolve,
				fail: reject
			});
		});
	}

	async invite(params: ShareInfo): Promise<{ name?: string; icon?: string; }> {
		await this.share({ ...params });
		return null;
	}

	/** 登录 */
	async login() {
		const data = await callAsyncApi(ks.login);
		return {
			token: data.gameToken,
			openid: data.gameUserId,
		};
	}

	/**
	 *	获取用户信息
	 * @returns IUserInfo 用户信息
	 */
	async getUserInfo(): Promise<IUserInfo> {
		if (this.$userInfo) return this.$userInfo;
		await this.authorize();
		const ret = await callAsyncApi(ks.getUserInfo);
		this.$userInfo = {
			nickName: ret.userName,
			avatarUrl: ret.userHead,
			gender: ret.gender ? (ret.gender === 'M' ? 1 : 2) : 0,
			language: undefined,
			city: ret.userCity || undefined
		};
		return this.$userInfo;
	}
	private $userInfo: IUserInfo;

	/** 授权 */
	async authorize(scope: string = 'scope.userInfo') {
		let authorized = false;
		try {
			const settings = await callAsyncApi(ks.getSetting);
			// @ts-expect-error
			if (!settings || !settings.result || !settings.result[scope]) {
				throw new Error('not authorized');
			} else {
				authorized = true;
			}
		} catch (error) {
			authorized = false;
		}
		if (!authorized) {
			await callAsyncApi(ks.authorize, { scope });
		}
	}

	createShortcut(): Promise<void> {
		return new Promise((resolve, reject) => {
			ks.saveAPKShortcut(ret => {
				if (ret.code === 1) {
					resolve();
				} else {
					reject(new Error(`创建失败: (${ret.code}) ${ret.msg}`));
				}
			});

		});
	}

	checkShortcut(): Promise<boolean> {
		return new Promise((resolve, reject) => {
			ks.getAPKShortcutInstallStatus(ret => {
				if (ret.code === 1) {
					resolve(ret.installed);
				} else {
					reject(new Error(`检查失败: (${ret.code}) ${ret.msg}`));
				}
			});
		});
	}

	checkFollowProfile() {
		return new Promise<boolean>((resolve, reject) => {
			ks.checkFollowState({
				accountType: 'MiniGameOfficialAccount',
				callback: ret => {
					if (ret.errorCode === 1) {
						resolve(ret.hasFollow);
					} else {
						reject(new Error(`检查失败： (${ret.errorCode}) ${ret.errorMsg}`));
					}
				}
			});
		});
	}

	followProfile() {
		return new Promise<void>((resolve, reject) => {
			ks.openUserProfile({
				accountType: 'MiniGameOfficialAccount',
				callback: async ret => {
					if (ret.errorCode === 1) {
						const followed = await this.checkFollowProfile();
						if (followed) {
							resolve();
						} else {
							reject(new Error('关注操作被取消'));
						}
					} else {
						reject(new Error(`检查失败： (${ret.errorCode}) ${ret.errorMsg}`));
					}
				}
			});
		});
	}

	async showLoading(title: string): Promise<void> {
		await callAsyncApi(ks.showLoading, { title });
	}

	async hideLoading(): Promise<void> {
		await callAsyncApi(ks.hideLoading);
	}

	get fs() {
		if (!this.$fs) {
			this.$fs = {
				readonly: this.wrapReadonlyFS(new KuaishouInPackageFileSystem('StreamingAssets')),
				writable: new SizeLimitedFileSystem(new KuaishouFileSystem('fs.writable'), {
					verbose: !PRODUCTION,
					maxSize: 200 * 1000 * 1000,
					reservedSize: 16 * 1000 * 1000,
					storage: this.localStorage,
					root: this.persistentDataPath,
					retainFiles: [
						path.join(this.persistentDataPath, 'tinysdk.localStorage.bin'),
					],
					metaFile: path.join(this.persistentDataPath, 'fs.writable.json')
				})
			};
		}
		return this.$fs;
	}
	private $fs: { readonly?: IReadonlyFilesSystem; writable?: IFilesSystem; };

	get downloader() {
		if (!this.$downloader) {
			this.$downloader = new KuaishouFileDownloader(this.fs.writable);
		}
		return this.$downloader;
	}
	private $downloader: IFileDownloader;

	readonly recorder = new KuaishouGameRecorder();
	readonly WebSocket = KuaiShouWebSocket;

	renderText(text: string, style: Partial<TextStyle>): Promise<ArrayBuffer> {
		return this.canvas.renderText(text, style);
	}

	loadImageBuffer(url: string): Promise<ArrayBuffer> {
		return this.canvas.loadImageBuffer(url);
	}
	protected canvas = new KSCanvas({ defaultFont: DefaultWebFont[this.os.name] });
	readonly keyboard = new KSInputKeyboard();


	async validateRuntime(params: VerifiedRuntimeInfo) {
		return (params.appid || []).includes(this.systemInfo.host.appId);
	}
}
DefinePlatfrom(KuaiShouPlatform);

class KSCanvas extends WebCanvas {
	createCanvas(): HTMLCanvasElement {
		return wx.createCanvas() as unknown as HTMLCanvasElement;
	}

	createImage(): HTMLImageElement {
		return wx.createImage() as unknown as HTMLImageElement;
	}
}

class KSInputKeyboard implements InputKeyboard {
	visible: boolean;
	height?: number;
	value: string;

	constructor() {
		wx.onKeyboardInput(({ value }) => this.value = value);
		wx.onKeyboardComplete(() => this.visible = false);
	}

	show(params: ShowInputKeyboardParams): void {
		this.visible = true;
		this.value = params.text;
		wx.showKeyboard({
			defaultValue: params.text,
			confirmType: params.confirmType || 'done',
			confirmHold: params.confirmHold || true,
			maxLength: params.maxLength || (params.multiline ? 2048 : 256),
			multiple: params.multiline || false,
			success: () => this.visible = true,
			fail: () => this.visible = false
		});
	}

	hide(): void {
		wx.hideKeyboard({ success: () => this.visible = false });
	}
}
