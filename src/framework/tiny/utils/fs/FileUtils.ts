/* eslint-disable @typescript-eslint/no-explicit-any */
import { path } from '../path';

export default class FileUtils {

	/**
	 * 获取目录下的文件列表
	 * @param fs 文件系统对象
	 * @param dir 目录
	 * @param recursive 是否递归列出子目录下的文件
	 * @returns
	 */
	static async getFiles(fs: IFilesSystem, dir: string, recursive: boolean = false) {
		const stat = await fs.stat(dir);
		if (!stat || !stat.isDirectory()) throw new Error(`${dir} is not a directory`);
		let files: string[] = [];

		const entries = await fs.readdir(dir);
		for (const entry of entries) {
			const res = path.join(dir, entry);
			const stat = await fs.stat(res);
			if (stat.isFile()) {
				files.push(res);
			} else if (stat.isDirectory() && recursive) {
				files = files.concat(files, await this.getFiles(fs, res, recursive));
			}
		}
		return files;
	}
}
