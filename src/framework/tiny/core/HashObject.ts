export type Nullable<T> = T | null;

/**
 * 框架内所有对象的基类，为对象实例提供唯一的hashCode值。
 */
export interface IHashObject {
	/**
	 * 返回此对象唯一的哈希值,用于唯一确定一个对象。hashCode为大于等于1的整数。
	 */
	readonly hashCode: number;
}

/**
 * 哈希计数
 */
let $hashCount: number = 0;

/** 生成新的 HashCode */
export function GenerateObjectHashCode() {
	return ++$hashCount;
}

export class HashObject implements IHashObject {
	private $hashCode = GenerateObjectHashCode();
	get hashCode() {
		return this.$hashCode;
	}
}
