/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-ignore
declare module globalThis {
	declare interface ISubPackage {
		name: string,
		root: string;
		priority?: 'bootstrap' | 'required' | 'optional';
	}

	type ITinyLibrary = { name: string, root: string, 'minify-ignore'?: boolean };

	declare interface ISubPackageLoadTask {
		onProgressUpdate?: (callback: (res: {
			progress: number;
			totalBytesWritten: number;
			totalBytesExpectedToWrite: number;
		}) => void) => void;
	}

	declare const config: {
		/** 项目名称 */
		name: string,
		/** 调试开关 */
		debug: boolean,
		/** 调试地址 */
		debugUrl: string;
		/** 平台名称 */
		platform: string,
		/** 渠道名称 */
		channel?: string,
		/** 分包配置 */
		subpackages?: ISubPackage[];
		/** 啰嗦模式 */
		verbose?: boolean;
		/** 分包加载器 */
		subpackage_loader?: (options: { name: string; success?(): void; fail?(err: string); }) => ISubPackageLoadTask;
		/** 配置要加载的依赖库 */
		libs: ITinyLibrary[];
		/** 资源信息 */
		resource?: {
			/** 资源根路径 */
			root_url?: string;
			/** 资源版本 */
			version?: string;
		},
		/** 包内资源清单 */
		assets?: {
			/** 生成时间 */
			time: number;
			/** 资源列表 */
			files: Readonly<Record<string, {
				/** 文件大小 */
				size: number;
				/** 最终修改时间 */
				mtime: number;
				/** MD5 值 */
				md5: string;
			}>>;
		};
	};

	/** 已经引入的库 */
	declare const libs: {
		[key: string]: any;
	};
	declare function load_script(url: string, callback: (value: unknown) => void, errorCallback: (err?: any) => void): void;
	declare function loadScriptsOneByOne( libs: string[], onload: ()=> void, onerror: (err: any)=> void): void;
}
