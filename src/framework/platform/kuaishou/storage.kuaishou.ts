
export class KuaishouLocalStorage implements LocalStorage {
	getItem(key: string): string {
		return ks.getStorageSync(key);
	}

	setItem(key: string, value: string): void {
		ks.setStorageSync(key, value);
	}

	clear() {
		ks.clearStorageSync();
	}

	removeItem(key: string) {
		ks.removeStorageSync(key);
	}
}
