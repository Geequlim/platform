
export class WechatLocalStorage implements LocalStorage {
	getItem(key: string): string {
		return wx.getStorageSync(key);
	}

	setItem(key: string, value: string): void {
		wx.setStorageSync(key, value);
	}

	clear() {
		wx.clearStorageSync();
	}

	removeItem(key: string) {
		wx.removeStorageSync(key);
	}
}
