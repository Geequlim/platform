/* eslint-disable camelcase */
import { PlatformType } from 'framework/common/constants';
import { wait } from 'framework/tiny/utils';
import { DefinePlatfrom } from '../utils';
import { WebPlatform } from '../web/platform.web';
import { DevGameRecorder } from './recorder.dev';

import capsuleHTML from './page/debug-panel.html';
import iphonexHTML from './page/iphonex.html';

function applyHtmlTemplate(html: string, root = document.body) {
	const div = document.createElement('div');
	div.innerHTML = html;
	const scripts: HTMLScriptElement[] = [];
	const newScripts: HTMLScriptElement[] = [];
	div.querySelectorAll('script').forEach(script => {
		scripts.push(script);
		const newScript = document.createElement('script');
		newScript.textContent = script.textContent;
		newScripts.push(newScript);
	});
	scripts.forEach(script => script.remove());
	root.appendChild(div);
	newScripts.forEach(s => document.body.appendChild(s));
	return div;
}

export class DevPlatform extends WebPlatform implements Platform {
	get type() { return PlatformType.Dev; }

	readonly recorder = new DevGameRecorder('idle');
	constructor() {
		super();
		applyHtmlTemplate(capsuleHTML);
		applyHtmlTemplate(iphonexHTML);
	}


	async showMiniGamePanel() {
		if (this.$launchOptions.location == 'sidebar_card') this.$launchOptions.location = '';
		await getPlatform().accept('打开侧边栏的结果', '模拟打开侧边栏', '成功', '失败');
		this.$launchOptions.launch_from = 'homepage';
		this.$launchOptions.location = 'sidebar_card';
		this.toast('切换程序焦点后可测试侧边栏启动参数');
	}


	async followProfile() {
		await getPlatform().accept('选择关注官方号的结果', '模拟关注官方号', '关注成功', '关注失败');
		await this.showLoading('');
		await wait(1500);
		await this.hideLoading();
		localStorage.setItem('platform.followed', 'true');
	}

	async checkFollowProfile() {
		await wait(1000);
		return JSON.parse(localStorage.getItem('platform.followed') || 'false');
	}

	async showUserGeneratedVideo(videoID: string) {
		let ret: { data: { gid: string; }; };
		try { ret = await this.http.get(`https://gate.snssdk.com/developer/api/get_gid_str?video_id=${videoID}`); } catch (error) {
			console.warn('通过抖音获取短视频信息出错', videoID);
		}
		const video = ret?.data?.gid || videoID;
		if (video) {
			const url = `https://www.douyin.com/video/${video}`;
			await this.accept(`通过抖音网页版查看内容`, '播放抖音短视频', '打开', '取消');
			window.open(url, '_blank');
		} else {
			this.toast('短视频参数有误', 'fail');
		}
	}

	async getUserInfo() {
		const cache = this.localStorage.getItem('platform.userinfo');
		if (cache) {
			return JSON.parse(cache) as IUserInfo;
		}
		const data = (await this.http.get('https://randomuser.me/api/')).results[0];
		const ui = {
			nickName: `${data.name.first} ${data.name.last}`,
			avatarUrl: data.picture.large.split('?')[0],
			gender: data.gender === 'Female' ? 2 : (data.gender === 'Male' ? 1 : 0)
		} as IUserInfo;
		this.localStorage.setItem('platform.userinfo', JSON.stringify(ui));
		return ui;
	}

	async joinCommunity(community: CommunityInfo) {
		await getPlatform().accept(`确认加入群组: ${community.name} ?`, '模拟加粉丝群', '加入', '取消');
	}

	async getCommunitys(master: IUserInfo) {
		await wait(500);
		return [
			{
				type: 'chat-group',
				name: '轻娱开发内测群',
				data: {
					avatar_uri: 'https://files.tinyfun.online/public/misc/group-avatar.jpeg',
					description: '轻娱游戏内测群，欢迎加入',
					entry_limit: ['无要求'],
					exist_num: 487,
					group_id: 'tiny-group-0001',
					group_name: '轻娱开发内测群0',
					max_num: 500,
					status: 'normal',
					tags: ['90后', '内测', '开发']
				}
			},
			{
				type: 'chat-group',
				name: '轻娱开发内测2群',
				data: {
					avatar_uri: 'https://files.tinyfun.online/public/misc/group-avatar.jpeg',
					description: '轻娱游戏内测群，欢迎加入',
					entry_limit: ['无要求'],
					exist_num: 500,
					group_id: 'tiny-group-0002',
					group_name: '轻娱开发内测2群',
					max_num: 500,
					status: 'full',
					tags: ['90后', '内测', '开发']
				}
			},
			{
				type: 'chat-group',
				name: '轻娱开发内测3群',
				data: {
					avatar_uri: 'https://files.tinyfun.online/public/misc/group-avatar.jpeg',
					description: '轻娱游戏内测群，欢迎加入',
					entry_limit: ['无要求'],
					exist_num: 500,
					group_id: 'tiny-group-0002',
					group_name: '轻娱开发内测3群',
					max_num: 500,
					status: 'ban',
					tags: ['90后', '内测', '开发']
				}
			}
		];
	}

	async openCustomerServiceConversation() {
		await getPlatform().alert(`模拟打开客服会话功能`, '打开客服会话');
	}

}
DefinePlatfrom(DevPlatform);
