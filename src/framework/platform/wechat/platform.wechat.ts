/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlatformType } from 'framework/common/constants';
import { SizeLimitedFileSystem } from 'framework/tiny/utils/fs/fs.sizelimited';
import { XHRHttp } from 'framework/tiny/utils/http.xhr';
import { path } from 'framework/tiny/utils/path';
import qs from 'qs';
import { GamePlatformBase } from '../platform.common';
import { DefinePlatfrom } from '../utils';
import { DefaultWebFont, WebCanvas } from '../web/canvas';
import { WechatFileDownloader } from './downloader.wechat';
import { WechatFileSystem, WechatInPackageFileSystem } from './fs.wechat';
import { WechatLocalStorage } from './storage.wechat';
import { WechatWebSocket } from './websocket.wechat';

interface AsyncCallbackOptions<T = any> {
	success?(ret: T): void;
	fail?(err: { errMsg: string; }): void;
	complete?(): void;
}
/** 调用微信的异步API */
function callAsyncApi<T, R>(api: (options: AsyncCallbackOptions<R> & T) => void, options?: T): Promise<R> {
	return new Promise((resolve, reject) => {
		const params: AsyncCallbackOptions = {
			success: (ret: R) => resolve(ret),
			fail: (err: { errMsg: string; }) => reject(err),
			...options
		};
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		api.call(wx, params as any);
	});
}

export class WechatPlatform extends GamePlatformBase implements Platform {

	get type(): string { return PlatformType.Wechat; }
	readonly systemInfo = wx.getSystemInfoSync();
	readonly $launchOptions = wx.getLaunchOptionsSync();
	protected $http = new XHRHttp();
	get launchOptions() { return this.$launchOptions; }
	get persistentDataPath() { return wx.env.USER_DATA_PATH; }
	readonly localStorage = new WechatLocalStorage();

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

	private userInfoButton: wx.UserInfoButton;
	private getUserInfoCallback: (res: {
		userInfo: wx.UserInfo;
		rawData: string;
		signature: string;
		encryptedData: string;
		iv: string;
	}) => void;

	constructor() {
		super();
		this.checkUpdate();

		wx.onShow(() => {
			this.emit('visible');
			setTimeout(() => { this.emit('focus'); }, 32); // 微信 iOS 不按套路来
		});

		wx.onHide(() => {
			this.emit('infocus');
			this.emit('hidden');
		});
		this.userInfoButton = wx.createUserInfoButton({
			type: 'image',
			image: 'images/privacy.png',
			style: {
				left: 0,
				top: this.systemInfo.windowHeight - (this.systemInfo.windowWidth * 408 / 828),
				width: this.systemInfo.windowWidth,
				height: this.systemInfo.windowWidth * 408 / 828,
			},
			withCredentials: false
		});
		this.userInfoButton.hide();
		this.userInfoButton.onTap(res => {
			this.userInfoButton.hide();
			this.getUserInfoCallback(res);
		});
		wx.showShareMenu({ withShareTicket: true });
		wx.onShareAppMessage(() => this.shareParams);
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
		return super.check(type);
	}

	alert(message: string, title?: string): Promise<void> {
		return new Promise((resolve, reject) => {
			wx.showModal({
				title,
				content: message,
				showCancel: false,
				complete: ret => resolve()
			});
		});
	}

	accept(message: string, title?: string, confirm?: string, cancel?: string): Promise<void> {
		return new Promise((resolve, reject) => {
			wx.showModal({
				title,
				content: message,
				confirmText: confirm,
				cancelText: cancel,
				showCancel: true,
				complete: (ret) => ret.confirm ? resolve() : reject()
			});
		});
	}

	async toast(message: string, icon: ToastType): Promise<void> {
		if (icon === 'fail') {
			icon = 'error' as any;
		}
		await callAsyncApi(wx.showToast, { title: message, icon: icon as 'none' });
	}

	vibrate(durationMs: number): void {
		if (durationMs >= 400) {
			wx.vibrateLong();
		} else {
			wx.vibrateShort();
		}
	}

	async exit() {
		await callAsyncApi(wx.exitMiniProgram, {});
	}

	async reload() {
		await callAsyncApi(wx.restartMiniProgram, {});
	}
	checkUpdate() {
		const updateManager = wx.getUpdateManager();
		updateManager.onUpdateReady(() => {
			wx.showModal({
				title: '更新提示',
				content: '新版本已经准备好, 现在重启程序?',
				success: (res) => {
					if (res.confirm) {
						// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
						updateManager.applyUpdate();
					}
				}
			});
		});
		updateManager.onCheckForUpdate(() => { });
	}

	share(params?: any): Promise<void> {
		return new Promise((resolve, reject) => {
			if (params && !this.shareParams) this.shareParams = params;
			const startTime = Date.now();
			const onShow = () => {
				wx.offShow(onShow);
				const duration = Date.now() - startTime;
				if (duration < 2000) {
					reject(new Error('未完成分享'));
				} if (duration < 3000) {
					reject(new Error('请分享给其他好友'));
				} else if (duration > 16000) {
					reject(new Error('操作超时'));
				} else {
					resolve();
				}
			};
			wx.onShow(onShow);
			params = { ...params, query: params.query ? qs.stringify(params.query) : '' };
			wx.shareAppMessage(params);

		});
	}

	async invite(params: ShareInfo): Promise<{ name?: string; icon?: string; }> {
		await this.share({ ...params });
		return null;
	}

	/** 登录 */
	login() {
		return callAsyncApi(wx.login);
	}

	now(): number { return (this.$performance.now() - this.$performanceStartTime) / this.$performanceScale; }
	protected $performance = wx.getPerformance();
	private $performanceStartTime: number = this.$performance.now();
	private $performanceScale = this.systemInfo.platform === 'devtools' ? 1 : 1000;

	/**
	 *	获取用户信息
	 * @returns IUserInfo 用户信息
	 */
	getUserInfo(): Promise<wx.UserInfo> {
		if (this.$userInfo) return Promise.resolve(this.$userInfo);
		return new Promise((resolve, reject) => {
			const getFromUserInfoButton = () => {
				this.userInfoButton.show();
				this.getUserInfoCallback = (res) => {
					if (res.userInfo) {
						this.localStorage.setItem('wx.userInfo.auth', '1');
						this.$userInfo = res as unknown as wx.UserInfo;
						resolve(res.userInfo);
					} else {
						reject();
					}
				};
			};
			if (this.localStorage.getItem('wx.userInfo.auth') === '1') {
				callAsyncApi(wx.getUserInfo)
					.then(res => resolve(res.data as any))
					.catch(err => {
						console.warn('获取用户信息出错, 尝试展示用户信息按钮', err);
						getFromUserInfoButton();
					});
			} else {
				getFromUserInfoButton();
			}
		});
	}
	private $userInfo: wx.UserInfo;


	async validateRuntime(params: VerifiedRuntimeInfo) {
		const data = wx.getAccountInfoSync();
		return (params.appid || []).includes(data.miniProgram.appId);
	}

	/** 授权 */
	async authorize(scope: string = 'scope.userInfo') {
		let authorized = false;
		try {
			const settings = await callAsyncApi(wx.getSetting);
			// @ts-expect-error
			if (!settings || !settings.authSetting || !settings.authSetting[scope]) {
				throw new Error('not authorized');
			} else {
				authorized = true;
			}
		} catch (error) {
			authorized = false;
		}
		if (!authorized) {
			await callAsyncApi(wx.authorize, { scope });
		}
	}

	async showLoading(title: string): Promise<void> {
		await callAsyncApi(wx.showLoading, { title });
	}

	async hideLoading(): Promise<void> {
		await callAsyncApi(wx.hideLoading);
	}

	getClipboardData(): Promise<string> {
		return new Promise((resolve, reject) => {
			wx.getClipboardData({
				success: (ret) => resolve(ret.data),
				fail: (err) => reject(new Error(err.errMsg))
			});
		});
	}

	setClipboardData(data: string): Promise<void> {
		return new Promise((resolve, reject) => {
			wx.setClipboardData({
				data,
				success: (ret: any) => resolve(),
				fail: (err) => reject(new Error(err.errMsg)),
			});
		});
	}

	get fs() {
		if (!this.$fs) {
			this.$fs = {
				readonly: this.wrapReadonlyFS(new WechatInPackageFileSystem('StreamingAssets')),
				writable: new SizeLimitedFileSystem(new WechatFileSystem('fs.writable'), {
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
			this.$downloader = new WechatFileDownloader(this.fs.writable);
		}
		return this.$downloader;
	}
	private $downloader: IFileDownloader;

	readonly WebSocket = WechatWebSocket;


	renderText(text: string, style: Partial<TextStyle>): Promise<ArrayBuffer> {
		return this.canvas.renderText(text, style);
	}

	loadImageBuffer(url: string): Promise<ArrayBuffer> {
		return this.canvas.loadImageBuffer(url);
	}
	protected canvas = new WechatCanvas({ defaultFont: DefaultWebFont[this.os.name] });
	readonly keyboard = new WechatInputKeyboard();
}
DefinePlatfrom(WechatPlatform);


class WechatCanvas extends WebCanvas {
	createCanvas(): HTMLCanvasElement {
		return wx.createCanvas() as unknown as HTMLCanvasElement;
	}

	createImage(): HTMLImageElement {
		return wx.createImage() as unknown as HTMLImageElement;
	}
}

class WechatInputKeyboard implements InputKeyboard {
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
