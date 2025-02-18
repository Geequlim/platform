import { dataUriToBuffer } from 'data-uri-to-buffer';
import { TinyObject } from 'framework/tiny/core/TinyObject';

export const DefaultWebFont: Record<OSType, string> = {
	'ios': 'PingFangSC-Regular',
	'android': 'Noto Sans CJK SC',
	'windows': 'Microsoft YaHei',
	'macos': 'PingFangSC-Regular',
	'linux': 'Microsoft YaHei',
	'unknown': 'Arial',
	'devtools': 'Microsoft YaHei',
};

export class WebCanvas extends TinyObject {

	protected $canvas: HTMLCanvasElement;
	get canvas() {
		if (!this.$canvas) {
			this.$canvas = this.createCanvas();
		}
		return this.$canvas;
	}

	dispose() {
		this.$canvas = null;
	}

	constructor(readonly options: { defaultFont?: string; } = {}) {
		super();
	}

	createCanvas() {
		return document.createElement('canvas');
	}

	createImage() {
		return new Image();
	}

	/**
	 * 渲染文字到贴图，不支持换行
	 * 该函数主要用于渲染用户名称等不易使用游戏字体进行渲染的文字内容
	 */
	renderText(text: string, style: Partial<TextStyle>): Promise<ArrayBuffer> {
		return new Promise((resolve, reject) => {
			try {
				const canvas = this.canvas;
				const ctx = canvas.getContext('2d');
				const fontSize = style.fontSize || 16;
				const font = `${style.bold ? 'bold ' : ''}${style.italic ? 'italic ' : ''}${fontSize}px '${style.font || this.options.defaultFont || 'Arial'}'`;
				ctx.font = font;
				const m = ctx.measureText(text);
				const width = Math.ceil(m.width) + 4;
				let height = Math.ceil(m.fontBoundingBoxAscent + (m.actualBoundingBoxDescent || m.fontBoundingBoxDescent));
				if (!height) height = style.fontSize * 1.2;
				canvas.width = width;
				canvas.height = height;
				ctx.clearRect(0, 0, width, height);

				ctx.font = font;
				ctx.fillStyle = style.color || 'white';

				if (style.strokeWidth) {
					ctx.strokeStyle = style.strokeColor || 'black';
					ctx.lineWidth = style.strokeWidth;
				}
				ctx.fillText(text, 0, m.actualBoundingBoxAscent || m.fontBoundingBoxAscent);
				if (style.strokeWidth) {
					ctx.strokeText(text, 0, m.actualBoundingBoxAscent || m.fontBoundingBoxAscent);
				}
				const dataURL = canvas.toDataURL('image/png');
				const ret = dataUriToBuffer(dataURL);
				resolve(ret.buffer);
			} catch (error) {
				reject(error);
			}
		});
	}

	/** 加载图像内容 */
	loadImageBuffer(url: string): Promise<ArrayBuffer> {
		return new Promise((resolve, reject) => {
			const img = this.createImage();
			const clear = () => {
				img.src = '';
				img.onload = null;
				img.onerror = null;
			};
			img.onload = () => {
				const canvas = this.canvas;
				canvas.width = img.width;
				canvas.height = img.height;
				const ctx = canvas.getContext('2d');
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(img, 0, 0);
				clear();
				const dataURL = canvas.toDataURL('image/png');
				const ret = dataUriToBuffer(dataURL);
				resolve(ret.buffer);
			};
			img.onerror = (evt) => {
				clear();
				reject(new Error('Failed to load image at ' + url));
			};
			img.crossOrigin = 'anonymous';
			img.src = url;
		});
	}
}
