declare namespace wx {
	interface WebAudioContext {
		/** 获取当前上下文的时间戳。*/
		currentTime: number;
		/** 当前上下文的最终目标节点，一般是音频渲染设备 */
		destination: AudioDestinationNode;

		/** 异步解码一段资源为AudioBuffer。 */
		decodeAudioData(data: ArrayBuffer, success: (buffer: AudioBuffer) => void, fail: (err: string) => void);

		/** 创建一个BufferSourceNode实例，通过AudioBuffer对象来播放音频数据 */
		createBufferSource(): AudioBufferSourceNode;

		/** 创建一个GainNode */
		createGain(): GainNode;
	}
	/** 创建 WebAudio 上下文。 */
	function createWebAudioContext(): WebAudioContext;
}
