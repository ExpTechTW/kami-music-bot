const { createAudioPlayer, entersState, joinVoiceChannel, NoSubscriberBehavior, VoiceConnectionStatus, AudioPlayerStatus, createAudioResource } = require("@discordjs/voice");
const { KamiMusicMetadata } = require("./KamiMusicMetadata");
const { Platform } = require("./KamiMusicMetadata");
const ytdl = require("ytdl-core");
// const { FFmpeg } = require("prism-media");

/**
 * @enum {String}
 */
const RepeatMode = Object.freeze({
	NoRepeat            : 0,
	RepeatQueue         : 1,
	RepeatCurrent       : 2,
	Random              : 3,
	RandomNoRepeat      : 4,
	TrueRandom          : 5,
	Backward            : 6,
	BackwardRepeatQueue : 7,
});

class KamiMusicPlayer {
	/**
	 * @param {import("discord.js").TextChannel} channel
	 * @param {import("discord.js").GuildMember} member
	 */
	constructor(channel, member) {
		/**
		 * @type {import("discord.js").Client}
		 */
		this.client = channel.client;

		/**
		 * @type {import("discord.js").TextChannel}
		 */
		this.channel = channel;

		/**
		 * @type {import("discord.js").Guild}
		 */
		this.guild = channel.guild;


		/**
		 * @type {import("discord.js").GuildMember}
		 */
		this.owner = member;

		const preference = this.client.setting.user[this.owner.id];

		/**
		 * @type {boolean}
		 */
		this.lock = preference?.lock ?? false;

		/**
		 * @type {import("@discordjs/voice").VoiceConnection}
		 */
		this.connection = joinVoiceChannel({
			channelId      : channel.id,
			guildId        : channel.guild.id,
			adapterCreator : channel.guild.voiceAdapterCreator,
		});

		/**
		 * @type {import("@discordjs/voice").AudioPlayer}
		 */
		this.player = createAudioPlayer({
			behaviors: {
				noSubscriber: NoSubscriberBehavior.Pause,
			},
		});

		/**
		 * @type {import("@discordjs/voice").PlayerSubscription}
		 */
		this.subscription = this.connection.subscribe(this.player);

		/**
		 * @type {KamiMusicMetadata[]}
		 */
		this.queue = [];

		/**
		 * @type {number}
		 */
		this.currentIndex = 0;

		/**
		 * @type {RepeatMode}
		 */
		this.repeat = preference?.repeat ?? RepeatMode.NoRepeat;

		/**
		 * @type {boolean}
		 */
		this.stopped = false;

		/**
		 * @type {number}
		 */
		this.volume = preference?.volume ?? 1;

		this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
			try {
				await Promise.race([
					entersState(this.connection, VoiceConnectionStatus.Signalling, 5_000),
					entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000),
				]);
			} catch (error) {
				this.destroy();
			}
		});
		this.player.on(AudioPlayerStatus.Playing, () => {
			this.current.error = undefined;
		});
		this.player.on(AudioPlayerStatus.Idle, (oldState) => {
			this._resource = null;
			this.current.cache = null;
			if (oldState.status == AudioPlayerStatus.Playing) {
				if (!this.paused && !this.stopped)
					switch (this.repeat) {
						case RepeatMode.NoRepeat: {
							if (this.currentIndex < (this.queue.length - 1))
								this.next();

							break;
						}

						case RepeatMode.RepeatQueue: {
							this.next();
							break;
						}

						case RepeatMode.RepeatCurrent: {
							this.play();
							break;
						}

						case RepeatMode.Random: {
							this.currentIndex = Math.floor(Math.random() * this.queue.length);
							this.play();
							break;
						}

						case RepeatMode.RandomNoRepeat: {
							if (this._randomQueue.length == 0)
								this._randomQueue = [...this.queue];

							this._randomQueue = this._randomQueue.sort(() => 0.5 - Math.random());
							const resource = this._randomQueue.shift();
							this.currentIndex = this.queue.indexOf(resource);

							this.play();
							break;
						}

						case RepeatMode.Backward: {
							if (this.currentIndex > 0)
								this.next();

							break;
						}

						case RepeatMode.BackwardRepeatQueue: {
							this.next();
							break;
						}

						default:
							break;
					}

				this.stopped = false;
			}
		});
		this.player.on("error", (error) => {
			console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
			console.error(error);
			this._resource = null;
			if (this.current?.error?.message != error.message) {
				this.current.error = error;
				this.play();
			} else if (this.repeat == RepeatMode.NoRepeat && this.currentIndex < (this.queue.length - 1)
				|| this.repeat == RepeatMode.RepeatQueue
				|| this.repeat == RepeatMode.Backward && this.currentIndex > 0
				|| this.repeat == RepeatMode.BackwardRepeatQueue)
				this.next();
			else if (this.repeat == RepeatMode.Random) {
				this.currentIndex = Math.floor(Math.random() * this.queue.length);
				this.play();
			} else if (this.repeat == RepeatMode.RandomNoRepeat) {
				if (this._randomQueue.length == 0)
					this._randomQueue = [...this.queue];

				this._randomQueue = this._randomQueue.sort(() => 0.5 - Math.random());
				const resource = this._randomQueue.shift();
				this.currentIndex = this.queue.indexOf(resource);

				this.play();
			}
		});
		this.client.players.set(this.guild.id, this);
	}

	/**
     * @return {KamiMusicMetadata}
     */
	get current() {
		return this.queue[this.currentIndex];
	}

	/**
     * @param {number} value
     */
	set currentIndex(value) {
		if (value < 0)
			value = this.queue.length - 1;
		if (value > (this.queue.length - 1))
			value = 0;
		this._currentIndex = value;
	}

	/**
     * @return {number}
     */
	get currentIndex() {
		return this._currentIndex;
	}

	/**
     * @return {number}
     */
	get nextIndex() {
		switch (this.repeat) {
			case RepeatMode.NoRepeat:
				if (this.currentIndex < (this.queue.length - 1))
					return this.currentIndex + 1;
				break;

			case RepeatMode.RepeatQueue:
				if (this.currentIndex < (this.queue.length - 1))
					return this.currentIndex + 1;
				else
					return 0;

			case RepeatMode.RepeatCurrent:
				return this.currentIndex;

			case RepeatMode.Backward:
				if (this.currentIndex > 0)
					return this.currentIndex - 1;
				break;

			case RepeatMode.BackwardRepeatQueue:
				if (this.currentIndex > 0)
					return this.currentIndex - 1;
				else
					return this.queue.length - 1;

			default:
				break;
		}
		return -1;
	}

	/**
     * @return {boolean}
     */
	get paused() {
		return this.player.state.status == AudioPlayerStatus.AutoPaused || this.player.state.status == AudioPlayerStatus.Paused;
	}

	/**
     * @param {number} value
     */
	set volume(value) {
		this._volume = value;
		if (this._resource)
			this._resource.volume.setVolume(this._volume / (1 / 0.4));
	}

	/**
     * @return {number}
     */
	get volume() {
		return this._volume;
	}

	/**
     * @param {number} value
     */
	set repeat(value) {
		if (value == RepeatMode.RandomNoRepeat)
			if (value != this.repeat)
				this._randomQueue = [...this.queue];

		this._repeat = value;
	}

	/**
     * @return {number}
     */
	get repeat() {
		return this._repeat;
	}

	/**
	 * @return {number}
	 */
	get playbackTime() {
		return this._resource?.playbackDuration ?? null;
	}

	/**
	 * @typedef Duration
	 * @property {number} second
	 * @property {number} minute
	 * @property {number} hour
	 * @property {number} day
	 */

	/**
	 * @return {Duration}
	 */
	get playbackTimeObject() {
		return this.playbackTime ? {
			second : ~~(this.playbackTime / 1000) % 60,
			minute : ~~(~~(this.playbackTime / 1000) / 60),
			hour   : ~~(~~(this.playbackTime / 1000) / (60 * 60)),
			day    : ~~(~~(this.playbackTime / 1000) / (60 * 60 * 24)),
		} : null;
	}

	/**
	 * @return {number}
	 */
	get formattedPlaybackTime() {
		if (this.playbackTimeObject) {
			const times = [];
			times.push(this.playbackTimeObject.day, this.playbackTimeObject.hour, this.playbackTimeObject.minute, this.playbackTimeObject.second);
			return times.reduce((a, v, i) => (v == 0 && i < 2) ? a : (v < 10) ? a.push(`0${v}`) && (a) : a.push(String(v)) && (a), []).join(":");
		}
		return null;
	}

	/**
	 * Add resources to the queue.
	 * @param {KamiMusicMetadata | KamiMusicMetadata[]} resource The resources to add.
	 * @param {?number} index The index resources should append after.
	 */
	addResource(resource, index = this.queue.length) {
		if (Array.isArray(resource))
			this.queue.splice(index, 0, ...resource);
		else
			this.queue.splice(index, 0, resource);

		if (this.repeat == RepeatMode.RandomNoRepeat)
			if (Array.isArray(resource))
				this._randomQueue.splice(index, 0, ...resource);
			else
				this._randomQueue.splice(index, 0, resource);

		if (![RepeatMode.Random, RepeatMode.RandomNoRepeat, RepeatMode.TrueRandom].includes(this.repeat))
			if (this.currentIndex > index)
				this.currentIndex += 1;

		if (this.player.state.status == AudioPlayerStatus.Idle) {
			if (![RepeatMode.Random, RepeatMode.RandomNoRepeat, RepeatMode.TrueRandom].includes(this.repeat))
				if (Array.isArray(resource))
					this.currentIndex = this.queue.indexOf(resource[0]);
				else
					this.currentIndex = this.queue.indexOf(resource);

			if (this.queue[this.nextIndex])
				if (!this.queue[this.nextIndex].cache)
					this.buffer(this.nextIndex);

			this.play();
		}
	}

	/**
	 * Remove a resource from the queue by index.
	 * @param {number} index The index of the resource to be removed.
	 * @return {?KamiMusicMetadata} The removed resource.
	 */
	removeIndex(index) {
		const resource = this.queue[index];
		if (resource instanceof KamiMusicMetadata) {
			this.queue.splice(index, 1);
			if (this.repeat == RepeatMode.RandomNoRepeat)
				if (this._randomQueue.includes(resource))
					this._randomQueue.splice(this._randomQueue.indexOf(resource), 1);

			if (![RepeatMode.Random, RepeatMode.RandomNoRepeat, RepeatMode.TrueRandom].includes(this.repeat))
				if (this.currentIndex > index && this.currentIndex > 0)
					this.currentIndex -= 1;

			if (this.currentIndex == index && this.player.state.status == AudioPlayerStatus.Playing)
				this.stop();

			return resource;
		}
		return null;
	}

	/**
	 * Remove a resource from the queue.
	 * @param {KamiMusicMetadata} resource The resource to be removed.
	 * @return {?number} The removed resource index.
	 */
	removeResource(resource) {
		const index = this.queue.indexOf(resource);
		if (index > -1) {
			this.queue.splice(index, 1);
			if (this.repeat == RepeatMode.RandomNoRepeat)
				if (this._randomQueue.includes(resource))
					this._randomQueue.splice(this._randomQueue.indexOf(resource), 1);

			if (![RepeatMode.Random, RepeatMode.RandomNoRepeat, RepeatMode.TrueRandom].includes(this.repeat))
				if (this.currentIndex > index && this.currentIndex > 0)
					this.currentIndex -= 1;

			if (this.currentIndex == index && this.player.state.status == AudioPlayerStatus.Playing)
				this.stop();

			return index;
		}
		return null;
	}

	/**
	 * Play resources.
	 * @param {?number} index The index of the resource to be played by the player.
	 */
	play(index = this.currentIndex) {
		console.log(this);
		const resource = this.queue[index];
		if (resource) {
			let stream = resource.cache;

			if (!stream)
				switch (resource.platform) {
					case Platform.Youtube: {
						let agent;
						/* Proxy
						if (resource.region.length)
							if (resource.region.includes("TW")) {
								console.log("Using proxy: JP");
								const Agent = require("https-proxy-agent");
								const proxy = "http://139.162.78.109:3128";
								// const proxy = "http://140.227.59.167:3180";
								agent = new Agent(proxy);
							}
						*/

						stream = ytdl(resource.url,
							{
								filter        : (format) => format.contentLength,
								quality       : "highestaudio",
								highWaterMark : 1 << 25,
								...(agent && { requestOptions: { agent } }),
							});
						break;
					}
					default:
						break;
				}

			if (stream) {
				this.currentIndex = index;
				/*
				const transcoderArgs = [
					"-analyzeduration", "0",
					"-loglevel", "0",
					"-f", "s16le",
					"-ar", "48000",
					"-ac", "2",
					"-af", `bass=g=${this.audiofilter.bass}`,
				];
				const transcoder = new FFmpeg({ args: transcoderArgs });
				*/
				const ar = createAudioResource(stream, {
					inlineVolume : true,
					metadata     : resource,
				});
				this._resource = ar;
				this.volume = this._volume;
				this.player.play(ar);
				this.buffer(this.nextIndex);
			}
		}
	}

	/**
	 * Pre-buffer a resource.
	 * @param {number} index The index of the resource to be buffered.
	 * @param {?boolean} force Whether or not the cache checking should be skipped.
	 */
	buffer(index, force = false) {
		const resource = this.queue[index];
		if (resource)
			if (!resource.cache || force) {
				let stream;
				switch (resource.platform) {
					case Platform.Youtube: {
						let agent;
						/* Proxy
						if (resource.region.length)
							if (resource.region.includes("TW")) {
								console.log("Using proxy: JP");
								const Agent = require("https-proxy-agent");
								const proxy = "http://139.162.78.109:3128";
								// const proxy = "http://140.227.59.167:3180";
								agent = new Agent(proxy);
							}
						*/

						stream = ytdl(resource.url,
							{
								filter        : (format) => format.contentLength,
								quality       : "highestaudio",
								highWaterMark : 1 << 25,
								...(agent && { requestOptions: { agent } }),
							});
						break;
					}
					default:
						break;
				}

				if (stream) {
					stream.on("error", (err) => {
						console.error(err);
						this.buffer(index);
					});
					stream.on("finish", () => {
						console.log("finished buffer", stream.readableLength);
						resource.cache = stream;
					});
				}
			}
	}

	/**
	 * Play the next resource.
	 * @returns {KamiMusicMetadata} The resource to be played.
	 */
	next() {
		if (this.repeat == RepeatMode.RandomNoRepeat) {
			if (this._randomQueue.length == 0)
				this._randomQueue = [...this.queue];

			this._randomQueue = this._randomQueue.sort(() => 0.5 - Math.random());
			const resource = this._randomQueue.shift();
			this.currentIndex = this.queue.indexOf(resource);
		} else if (this.repeat == RepeatMode.Backward || this.repeat == RepeatMode.BackwardRepeatQueue)
			this.currentIndex -= 1;
		else
			this.currentIndex += 1;

		this.play();
		return this.current;
	}

	/**
	 * Play the previous resource.
	 * @returns {KamiMusicMetadata} The resource to be played.
	 */
	prev() {
		if (this.repeat == RepeatMode.Backward || this.repeat == RepeatMode.BackwardRepeatQueue)
			this.currentIndex += 1;
		else
			this.currentIndex -= 1;

		this.play();
		return this.current;
	}


	/**
	 * Pause the player.
	 */
	pause() {
		this.player.pause();
	}

	/**
	 * Resume the player.
	 */
	resume() {
		this.player.unpause();
	}

	/**
	 * Stops the player and transitions to the next resource, if any.
	 * @param {boolean} force If `true`, the player won't transition into the next resource.
	 */
	stop(force = false) {
		if (force)
			this.stopped = true;

		this.player.stop();
	}

	/**
	 * Destroys the player.
	 */
	destroy() {
		this.connection.destroy();
		this.client.players.delete(this.guild.id);
	}

	/**
	 * Connects the player.
	 * @param {import("discord.js").VoiceChannel} channel
	 */
	connect(channel) {
		this.connection = joinVoiceChannel({
			channelId      : channel.id,
			guildId        : channel.guild.id,
			adapterCreator : channel.guild.voiceAdapterCreator,
		});
		this.subscription = this.connection.subscribe(this.player);
	}

	/**
	 * Reconnects the player.
	 */
	reconnect() {
		this.connection.rejoin();
	}
}

module.exports = { KamiMusicPlayer, RepeatMode };