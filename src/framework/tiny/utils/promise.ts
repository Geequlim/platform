import 'finally-polyfill';
const actions = {} as Record<string| number, Promise<any> & { refcount: number } >;

/**
 * 避免异步请求在执行过程中被多次执行，如果第一次执行没有完成，后续的请求将直接返回正在执行的操作
 * @param id 用于识别相同操作行为的ID
 * @param action 真正执行操作的行为
 */
export function avoidRepeat<T>(id: string | number, action: ()=> Promise<T>) {
	let a = actions[id];
	if (!a) {
		a = action() as Promise<T> & { refcount: number; };
		a.refcount = 1;
		actions[id] = a;
	} else {
		a.refcount += 1;
	}
	a.finally(() => {
		a.refcount -= 1;
		if (a.refcount <= 0) {
			delete actions[id];
		}
	});
	return a as Promise<T>;
}
