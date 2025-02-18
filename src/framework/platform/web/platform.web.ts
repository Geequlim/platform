import Bowser from 'bowser';
import { PlatformType } from 'framework/common/constants';
import { XHRHttp } from 'framework/tiny/utils/http.xhr';
import qrcode from 'qrcode-generator';
import qs from 'qs';
import Swal from 'sweetalert2';
import VConsole from 'vconsole';
import { DefinePlatfrom } from '../utils';
import { DefaultWebFont, WebCanvas } from './canvas';
import { BasicWebPlatform } from './platform.web.basic';

export class WebPlatform extends BasicWebPlatform implements Platform {

	readonly Swal = Swal;

	protected $http = new XHRHttp();
	get channel(): string { return config.channel; }
	get type(): string { return PlatformType.Web; }
	get launchOptions() { return this.$launchOptions; }
	protected $launchOptions = qs.parse(location.search, { ignoreQueryPrefix: true });

	protected bowser = Bowser.getParser(window.navigator.userAgent);
	readonly localStorage = window.localStorage;
	readonly vconsole?: VConsole;
	private deferredPrompt: {
		prompt(): void;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; }>;
	};

	constructor() {
		super();
		if (this.os.name == 'ios' || this.os.name == 'android') {
			this.vconsole = new VConsole({ theme: 'dark', });
			if (PRODUCTION) this.vconsole.hideSwitch();
			this.on('switchDebugOption', (event, value) => {
				if (event === 'vConsole') {
					value ? this.vconsole.showSwitch() : this.vconsole.hideSwitch();
				}
			});
		}
		if (true) {
			const KeyboardLocations: Record<number, TinyKeyboardEvent['location']> = {
				[KeyboardEvent.DOM_KEY_LOCATION_LEFT]: 'left',
				[KeyboardEvent.DOM_KEY_LOCATION_RIGHT]: 'right',
				[KeyboardEvent.DOM_KEY_LOCATION_STANDARD]: 'standard',
				[KeyboardEvent.DOM_KEY_LOCATION_NUMPAD]: 'numpad',
			};
			const convertKeyboardEvent = (ev: KeyboardEvent): TinyKeyboardEvent => {
				return {
					key: ev.key,
					code: ev.keyCode,
					location: KeyboardLocations[ev.location],
					repeat: ev.repeat,
					alt: ev.altKey,
					ctrl: ev.ctrlKey,
					meta: ev.metaKey,
					shift: ev.shiftKey
				};
			};
			document.addEventListener('keydown', ev => this.emit('keydown', convertKeyboardEvent(ev)));
			document.addEventListener('keyup', ev => this.emit('keyup', convertKeyboardEvent(ev)));
		}
		// 获取安装提示，并显示安装按钮,如果没有该事件表示不支持PWA
		window.addEventListener('beforeinstallprompt', (event) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			this.deferredPrompt = event as any;
		});
		window.onload = () => {
			const urlParams = new URLSearchParams(window.location.search);
			const sourceParam = urlParams.get('scene');
			// @ts-ignore 无法识别 navigator.standalone
			if (navigator['standalone'] || window.matchMedia('(display-mode: standalone)').matches || sourceParam == 'pwa') {
				this.$launchOptions = Object.assign(this.launchOptions || {}, { scene: 'pwa' });
			}
		};
	}

	check(type: keyof Platform): boolean {
		switch (type) {
			case 'checkShortcut':
			case 'createShortcut':
				return 'serviceWorker' in navigator;
			default:
				return super.check(type);
		}
	}

	alert(message: string, title?: string): Promise<void> {
		return new Promise((resolve, reject) => {
			Swal.fire({ title: title || tr('提示'), text: message, confirmButtonText: tr('确定') }).finally(() => resolve());
		});
	}

	accept(message: string, title?: string, confirm?: string, cancel?: string): Promise<void> {
		return new Promise((resolve, reject) => {
			Swal.fire({
				title,
				text: message,
				showDenyButton: false,
				showCancelButton: true,
				confirmButtonText: confirm,
				denyButtonText: cancel,
				cancelButtonText: cancel
			}).then(result => {
				result.isConfirmed ? resolve() : reject(new Error(tr('操作被取消')));
			});
		});
	}

	toast(message: string, icon?: ToastType): Promise<void> {
		try {
			Swal.fire({
				position: 'bottom',
				text: message,
				icon: icon === 'success' ? 'success' : icon === 'fail' ? 'error' : undefined,
				showConfirmButton: false,
				timer: 1500,
			});
			if (icon === 'loading') {
				Swal.showLoading(null);
			}
			return Promise.resolve();
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async showLoading(title: string): Promise<void> {
		Swal.fire({
			position: 'bottom',
			text: title,
			showConfirmButton: false,
			timer: 1500,
		});
		Swal.showLoading(null);
	}

	async hideLoading(): Promise<void> {
		Swal.hideLoading();
	}


	async checkShortcut() {
		return this.deferredPrompt == null;
	}

	async createShortcut() {
		this.deferredPrompt.prompt();
		const choiceResult = await this.deferredPrompt.userChoice;
		if (choiceResult.outcome !== 'accepted') {
			throw new Error(tr('操作被取消'));
		}
	}

	async invite(params: ShareInfo): Promise<{ name?: string; icon?: string; }> {
		await this.share(params);
		return null;
	}

	async share(params: ShareInfo) {
		const title = params.title ? tr(params.title) : tr('分享游戏');
		const text = params.desc ? tr(params.desc) : tr(`快来跟我一起玩{name}吧！`, { name: tr(config.name) });
		const query = params.query || {};
		const url = `${window.location.origin}${window.location.pathname}?${qs.stringify({ query })}`;
		const data: ShareData = { title, text, url };
		if (navigator && typeof navigator == 'object' && navigator.share) {
			await navigator.share(data);
		} else {
			try {
				const qr = qrcode(10, 'M');
				qr.addData(data.url);
				qr.make();
				const select = await Swal.fire({
					title: tr(data.title),
					html: `
					<div>
						<p>${tr(data.text)}</p>
						${qr.createImgTag(3, 6)}
					</div>
					<div style="display: flex; align-items: center; text-align: left;">
						<div class="input-group">
							<input type="text" value="${data.url}" readonly class="form-control"/>
							<button class="input-group-text clipboard-btn"><svg t="1719993917026" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3518" width="28" height="28"><path d="M682.666667 341.333333h128v469.333334H341.333333v-128H213.333333V213.333333h469.333334v128z m0 85.333334v256h-256v42.666666h298.666666v-298.666666h-42.666666zM298.666667 298.666667v298.666666h298.666666V298.666667H298.666667z" fill="#8a8a8a" p-id="3519"></path></svg></button>
						</div>
					</div>
					<div class="swal2-validation-message" id="swal2-validation-message" style="display: none;"></div>
					`,
					didOpen: () => {
						document.querySelector('.clipboard-btn').addEventListener('click', async () => {
							try {
								await this.setClipboardData(data.url);
								const icon = '<svg t="1719998602102" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4765" width="28" height="28"><path d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0z m0 947.2c-240.64 0-435.2-194.56-435.2-435.2S271.36 76.8 512 76.8s435.2 194.56 435.2 435.2-194.56 435.2-435.2 435.2z m266.24-578.56c0 10.24-5.12 20.48-10.24 25.6l-286.72 286.72c-5.12 5.12-15.36 10.24-25.6 10.24s-20.48-5.12-25.6-10.24l-163.84-163.84c-15.36-5.12-20.48-15.36-20.48-25.6 0-20.48 15.36-40.96 40.96-40.96 10.24 5.12 20.48 10.24 25.6 15.36l138.24 138.24 261.12-261.12c5.12-5.12 15.36-10.24 25.6-10.24 20.48-5.12 40.96 15.36 40.96 35.84z" fill="#6BC839" p-id="4766"></path></svg>';
								document.querySelector('.input-group-text').innerHTML = icon;
							} catch (error) {
								const tips: HTMLDivElement = document.querySelector('.swal2-validation-message');
								tips.innerHTML = tr('复制失败,请手动复制上方链接');
								tips.style.display = 'flex';
							}
						});
					},
					showDenyButton: false,
					showConfirmButton: true,
					confirmButtonText: tr('确认'),
				});
				if (select.isConfirmed) {
					await this.setClipboardData(`${tr(data.text)} ${data.url}`);
				} else {
					throw new Error(tr('操作被取消'));
				}
			} catch (error) {
				console.error(error);
				this.setClipboardData(data.url);
			}
		}
	}

	async validateRuntime(params: VerifiedRuntimeInfo) {
		const hostname = location.hostname;
		if (!PRODUCTION) {
			const debugDomains = [
				/localhost/,
				/127\.0\.0\.1/,
				/192\.168\.\d+\.\d+/,
				/\w+\.tiny\.fun/,
				/\w+\.tinyfun\.studio/,
			];
			for (const domain of debugDomains) {
				if (hostname.match(domain)) {
					return true;
				}
			}
		}
		return (params.domain || []).includes(hostname) || hostname === 'localhost';
	}

	/**
	 * 渲染文字到贴图，不支持换行
	 * 该函数主要用于渲染用户名称等不易使用游戏字体进行渲染的文字内容
	 */
	renderText(text: string, style: Partial<TextStyle>): Promise<ArrayBuffer> {
		return this.canvas.renderText(text, style);
	}

	/** 加载图像内容 */
	loadImageBuffer(url: string): Promise<ArrayBuffer> {
		return this.canvas.loadImageBuffer(url);
	}
	protected canvas = new WebCanvas({ defaultFont: DefaultWebFont[this.os.name] });
}

DefinePlatfrom(WebPlatform);
