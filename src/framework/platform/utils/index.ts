import { globalGet, globalSet } from 'framework/tiny/core/global';

export function DefinePlatfrom(type: new () => Platform) {
	globalSet('getPlatform', function getPlatform() {
		let platform: Platform = globalGet('platform');
		if (platform) return platform;
		platform = new type;
		globalSet("platform", platform);
		console.log('[platform]', '当前平台', platform);
		return platform;
	});
}
