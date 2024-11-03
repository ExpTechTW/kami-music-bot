import { SlashCommandBuilder } from 'discord.js';

import { KamiCommand } from '@/core/command';
import { KamiMusicPlayer } from '@/core/player';

export default new KamiCommand({
  builder: new SlashCommandBuilder()
    .setName('connect')
    .setNameLocalization('zh-TW', '加入語音')
    .setDescription('Connect to the voice channel you currently in.')
    .setDescriptionLocalization('zh-TW', '嘗試讓機器人加入語音頻道，當機器人突然離開語音頻道時可以用這個指令'),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const member = interaction.member;

    const text = interaction.channel;
    const voice = interaction.member.voice.channel;

    if (!voice || !text) {
      void interaction.editReply({
        content: '你需要在語音頻道內才能使用這個指令',
      });
      return;
    }

    const player = this.players.get(guild.id);

    if (!player) {
      this.players.set(
        guild.id,
        new KamiMusicPlayer(
          this,
          member,
          text,
          voice,
        ),
      );

      await interaction.editReply({
        content: `📥 ${voice}`,
      });
      return;
    }

    const isMemberPlayerOwner = player.locked && player.owner.id == member.id;
    const isMemberVoiceSameAsPlayerVoice = player.voice.id == voice.id;

    if (!isMemberPlayerOwner && !isMemberVoiceSameAsPlayerVoice) {
      void interaction.editReply({
        content: '你沒有權限和這個播放器互動',
      });
      return;
    }

    player.connect(voice);

    await interaction.editReply({
      content: isMemberVoiceSameAsPlayerVoice ? `🔄️ ${voice}` : `📥 ${voice}`,
    });
  },
});
