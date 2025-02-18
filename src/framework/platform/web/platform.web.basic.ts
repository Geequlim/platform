import FingerprintJS from '@fingerprintjs/fingerprintjs';
import Bowser from 'bowser';
import { PlatformType } from 'framework/common/constants';
import { XHRFileSystem } from 'framework/tiny/utils/fs/fs.xhr';
import { XHRHttp } from 'framework/tiny/utils/http.xhr';
import qs from 'qs';
import SafeAreaInsets from 'safe-area-insets';
import { GamePlatformBase } from '../platform.common';
import { DefinePlatfrom } from '../utils';
import { WebFileDownloader } from './downloader.web';
import { WebIndexedDBFileSystem } from './fs.web';
import { TinyWebSocketW3C } from './websocket.web';
import { globalSet } from 'framework/tiny/core/global';
import { SizeLimitedFileSystem } from 'framework/tiny/utils/fs/fs.sizelimited';
import { path } from 'framework/tiny/utils/path';

globalSet('tr', (text: string) => text);

export class BasicWebPlatform extends GamePlatformBase implements Platform {

	protected $http = new XHRHttp();
	get channel(): string { return config.channel; }
	get type(): string { return PlatformType.Web; }
	get launchOptions() { return this.$launchOptions; }
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected $launchOptions: any = qs.parse(location.search, { ignoreQueryPrefix: true });

	get persistentDataPath() { return 'tinyfs://user'; }

	protected bowser = Bowser.getParser(window.navigator?.userAgent || 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1');
	readonly localStorage = window.localStorage;

	constructor() {
		super();
		window.addEventListener('focus', () => this.setState('focus'), false);
		window.addEventListener('blur', () => this.setState('infocus'), false);
		document.addEventListener('visibilitychange', () => {
			switch (document.visibilityState) {
				case 'visible':
					this.setState(document.visibilityState);
					this.setState('focus');
					break;
				case 'hidden':
					this.emit('infocus');
					this.setState(document.visibilityState);
					break;
			}
		}, false);
		this.fs.writable.mkdir(this.persistentDataPath, true);
	}

	get application(): HostApplicationInformation {
		return {
			name: this.bowser.getBrowserName(),
			version: this.bowser.getBrowserVersion(),
			SDKVersion: this.bowser.getBrowserVersion(),
		};
	}

	get os(): OSInformation {
		return {
			name: (this.bowser.getOSName() as OSType || 'unknown').toLowerCase() as OSType,
			version: this.bowser.getOSVersion() || 'unknown',
		};
	}

	get device(): DeviceInformation {
		return {
			model: 'unknown',
			brand: 'unknown',
			language: this.launchOptions?.lang || navigator.language,
			screen: {
				width: window.screen.width,
				height: window.screen.height,
				pixelRatio: window.devicePixelRatio,
				dpi: this.getDPI(),
			},
			window: {
				width: window.innerWidth,
				height: window.innerHeight,
				safeArea: {
					left: SafeAreaInsets.left,
					right: SafeAreaInsets.right,
					top: SafeAreaInsets.top,
					bottom: SafeAreaInsets.bottom,
					width: window.innerWidth - SafeAreaInsets.left - SafeAreaInsets.right,
					height: window.innerHeight - SafeAreaInsets.top - SafeAreaInsets.bottom
				}
			}
		};
	}

	protected getDPI() {
		const div = document.createElement('div');
		div.style.height = '1in';
		div.style.width = '1in';
		div.style.top = '-100%';
		div.style.left = '-100%';
		div.style.position = 'absolute';
		document.body.appendChild(div);
		const result = div.offsetHeight;
		document.body.removeChild(div);
		return result;
	}

	vibrate(durationMs: number): void {
		if (window.navigator.vibrate) window.navigator.vibrate(durationMs);
	}

	reload(): Promise<void> {
		return new Promise((resolve, reject) => {
			window.location.reload();
			resolve();
		});
	}

	exit(): Promise<void> {
		return new Promise((resolve, reject) => {
			window.open('/', '_self', '');
			window.close();
		});
	}

	async getDeviceID(): Promise<string> {
		const a = await FingerprintJS.load();
		const ret = await a.get();
		return ret ? ret.visitorId : undefined;
	}

	/** 获取剪切板内容 */
	getClipboardData(): Promise<string> {
		return navigator.clipboard.readText();
	}
	/** 设置剪切板内容 */
	setClipboardData(data: string): Promise<void> {
		try {
			navigator.clipboard.writeText(data);
			return Promise.resolve();
		} catch (error) {
			console.warn(tr('设置剪切板内容出错'));
			return Promise.reject(error);
		}
	}

	async hideSplash(): Promise<void> {
		const splash = document.getElementById('splash');
		if (splash) splash.parentNode.removeChild(splash);
	}

	async login(): Promise<{ code?: string, token?: string, authCode?: string, anonymousCode?: string; game_token?: string; gameUserId?: string; }> {
		return { code: await this.getDeviceID() };
	}

	async selectFiles(type: 'image' | 'video' | 'audio' | 'file', options: { multiple?: boolean; accept?: string; } = {}): Promise<string[]> {
		const input = document.createElement('input');
		input.type = 'file';
		input.multiple = options.multiple;
		let accept = options.accept;
		if (!accept) {
			switch (type) {
				case 'image':
					accept = 'image/*';
					break;
				case 'audio':
					accept = 'audio/*';
					break;
				case 'video':
					accept = 'video/*';
					break;
				case 'file':
				default:
					accept = '*/*';
					break;
			}
		}
		input.accept = accept;
		input.click();
		return new Promise((resolve, reject) => {
			input.onchange = () => {
				resolve(Array.from(input.files).map(file => URL.createObjectURL(input.files[0])));
			};
			input.oncancel = () => reject(new Error(tr('用户取消操作')));
		});
	}

	get fs() {
		if (!this.$fs) {
			this.$fs = {
				readonly: this.wrapReadonlyFS(new XHRFileSystem('')),
				writable: new SizeLimitedFileSystem(
					new WebIndexedDBFileSystem('fs.writable', this.persistentDataPath),
					{
						verbose: !PRODUCTION,
						maxSize: 512 * 1000 * 1000,
						reservedSize: 16 * 1000 * 1000,
						storage: this.localStorage,
						root: this.persistentDataPath,
						retainFiles: [
							path.join(this.persistentDataPath, 'tinysdk.localStorage.bin'),
						],
						metaFile: path.join(this.persistentDataPath, 'fs.writable.json'),
					}
				),
			};
		}
		return this.$fs;
	}
	protected $fs: { readonly?: IReadonlyFilesSystem; writable?: IFilesSystem; };

	WebSocket = typeof WebSocket !== 'undefined' ? TinyWebSocketW3C : undefined;

	get downloader() {
		if (!this.$downloader) {
			this.$downloader = new WebFileDownloader(this.fs.writable);
		}
		return this.$downloader;
	}
	protected $downloader: IFileDownloader;
}
DefinePlatfrom(BasicWebPlatform);
