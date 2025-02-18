
export class BytedanceLocalStorage implements LocalStorage {
	getItem(key: string): string {
		return tt.getStorageSync(key);
	}

	setItem(key: string, value: string): void {
		tt.setStorageSync(key, value);
	}

	clear() {
		tt.clearStorageSync();
	}

	removeItem(key: string) {
		tt.removeStorageSync(key);
	}
}
