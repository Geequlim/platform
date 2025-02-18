/**
 * 对文件路径的一些操作，针对的是 C:/A/B/C/D/example.ts这种格式
 */
export const path = {

	/**
	 * 格式化文件路径，"C:/A/B//C//D//example.ts"=>"C:/A/B/C/D/example.ts"
	 * @param filename 传入的文件路径
	 */
	normalize: (filename: string) => {
		// 检查是否包含协议 (https://, file://, wxfile:// 等)
		const protocolMatch = filename.match(/^([a-z]+:\/\/)/);
		let protocol = '';

		if (protocolMatch) {
			// 提取协议部分，如 "http://"
			protocol = protocolMatch[1];
			// 去除协议部分，处理剩下的路径
			filename = filename.replace(protocol, '');
		}

		// 将所有反斜杠替换为正斜杠
		filename = filename.replace(/\\/g, '/');

		// 删除多余的斜杠
		filename = filename.replace(/\/+/g, '/');

		// 如果有协议，则将协议加回去
		return protocol + filename;
	},

	/**
	 * 根据文件路径得到文件名字，"C:/A/B/example.ts"=>"example.ts"
	 * @param filename 传入的文件路径
	 * @return 文件的名字
	 */
	basename: (filename: string): string => {
		filename = path.normalize(filename);
		return filename.substring(filename.lastIndexOf('/') + 1);
	},

	/**
	 * 文件所在文件夹路径，"C:/A/B/example.ts"=>"C:/A/B"
	 * @param path 传入的文件路径
	 * @return 文件所在文件夹的地址
	 */
	dirname: (filename: string): string => {
		filename = path.normalize(filename);
		// 检查路径是否包含协议前缀 (例如 'tinyfs://')
		const protocolIndex = filename.indexOf('://');
		let prefix = '';
		if (protocolIndex !== -1) {
			prefix = filename.substring(0, protocolIndex + 3);
			filename = filename.substring(protocolIndex + 3);
		}
		const dir = filename.substring(0, filename.lastIndexOf('/'));
		return prefix + dir;
	},

	/**
	 * 获得文件拓展名 " text.txt" => "txt"
	 * @param path 传入的文件路径
	 */
	extension: (filename: string): string => {
		const pos = filename.lastIndexOf('.');
		if (pos >= 0 && pos < filename.length - 1) {
			return filename.substring(pos + 1, filename.length);
		}
		return '';
	},

	/**
	 * 获得文件拓展名 " text.yaml.txt" => "yaml.txt"
	 * @param path 传入的文件路径
	 */
	fullExtension: (filename: string): string => {
		filename = path.basename(filename);
		const pos = filename.indexOf('.');
		if (pos >= 0 && pos < filename.length - 1) {
			return filename.substring(pos + 1, filename.length);
		}
		return '';
	},

	join(dir: string, ...pathes: string[]) {
		let ret = dir;
		for (const p of pathes) {
			if (p) {
				ret += '/' + p;
			}
		}
		return ret;
	}
};
