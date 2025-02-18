export type Nullable<T> = T | null | undefined;

/**
 * 在数组中随机抽取一个元素
 * @param list 要抽取的数组
 */
export function randomOne<T>(list: readonly T[]): Nullable<T> {
	if (!Array.isArray(list) || !list.length) return undefined;
	const idx = Math.floor(list.length * Math.random());
	return list[idx];
}

/**
 * 合并两个集合,不会出现重复元素，返回无序的并集
 *
 * @export
 * @template T
 * @param {IterableIterator<T>} a 集合A
 * @param {IterableIterator<T>} b 集合B
 * @returns {IterableIterator<T>} 并集
 */
export function merge<T>(a: IterableIterator<T>, b: IterableIterator<T>): IterableIterator<T> {
	const set = new Set<T>(a);
	for (const bi of b) {
		set.add(bi);
	}

	return set.values();
}

/**
 * 从数组中移除元素
 *
 * @export
 * @template T 数组类型
 * @param {T[]} array 数组对象
 * @param {T} element 要移除的元素
 * @returns 返回移除元素后的原数组对象
 */
export function arrayErase<T>(array: T[], element: T) {
	const index = array.indexOf(element, 0);
	if (index > -1) {
		array.splice(index, 1);
	}
	return array;
}

/** 随机打乱数组 */
export function shuffleArray<T>(array: T[]) {
	for (let i = array.length - 1; i > 0; i--) {
		const rand = Math.floor(Math.random() * (i + 1));
		[array[i], array[rand]] = [array[rand], array[i]];
	}
}

/**
 * 将大的数组拆分成多个小的数组
 * @param array 源数组
 * @param chunkSize 拆分出的每组大小上限
 * @returns 拆分后的二维数组
 */
export function splitArray<T>(array: T[], chunkSize: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		const chunk = array.slice(i, i + chunkSize);
		chunks.push(chunk);
	}
	return chunks;
}

/** 获取数组最后一个元素 */
export function last<T>(array: T[]): T {
	return array[array.length - 1];
}

/** 获取数组首个元素 */
export function first<T>(array: T[]): T {
	return array[0];
}

export function randomRange(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

export function wait(duration: number) {
	return new Promise(resolve => setTimeout(resolve, duration));
}



/** 补齐字符个数 */
export function pad(str: string | number, len: number, prefix: string = '0') {
	str = str.toString();
	const count = len - str.length;
	if (count <= 0) return str;
	return prefix.repeat(count) + str;
}

/** 转为16进制数 */
export function toHex(i: number) {
	const str = i.toString(16);
	if (i <= 15) return ('0' + str).toUpperCase();
	return str.toUpperCase();
}


/**
 * 格式化时间字符串
 * @param seconds 时间长度，单位为秒
 * @param toFixed 精确到秒后多少位
 * @param dayUnit 天数展示方法，用于支持多语言和复数
 * @returns 形如 `1天02:05:43.123`
 */
export function formatTime(seconds: number, toFixed = 0, dayUnit = (days: number) => `${days}天`) {
	let ret = '';
	if (seconds >= 86400) {
		ret += dayUnit(Math.floor(seconds / 86400));
	}
	if (seconds >= 3600) {
		ret += pad(Math.floor(seconds % 86400 / 3600), 2, '0');
		ret += ':';
	}
	if (seconds >= 60) {
		ret += pad(Math.floor(seconds % 3600 / 60), 2, '0');
		ret += ':';
	}
	if (seconds > 0) {
		ret += pad(Math.floor(seconds % 60), 2, '0');
		if (toFixed > 0) {
			const nano = seconds - Math.floor(seconds);
			ret += '.' + nano.toFixed(toFixed).substring(2);
		}
	}
	return ret;
}

export function sec2msEx(result: number, showM: boolean = true): string {
	let ms = (result - Math.floor(result)).toFixed(3);
	ms = ms.split('.')[1];
	let m = Math.floor(result / 60);
	let s = Math.floor(result - m * 60);
	if (showM) {
		// @ts-expect-error
		if (m < 10) m = `0${m}`;
		// @ts-expect-error
		if (s < 10) s = `0${s}`;
		return `${m}:${s}.${ms}`;
	}
	else return `${s}.${ms}`;
}

/**
 * @deprecated 使用 formatTime
 */
export const formatSeconds = formatTime;

// 取一个id,weight列表按weight的随机id
export function pickByWeight(list: { id: string, weight: number; }[]) {
	list = list.filter(v => v.weight > 0);
	if (list.length === 0) return null;
	const weightList: number[] = [];
	let totalWeight = 0;
	list.forEach(item => {
		totalWeight += item.weight;
		weightList.push(totalWeight);
	});
	const rand = Math.random() * totalWeight;
	for (let i = 0; i < weightList.length; i++) {
		if (rand <= weightList[i]) {
			return list[i].id;
		}
	}
	return null;
}

//插值
export function lerp(x: number, y: number, r: number) {
	return x + (y - x) * r;
}
