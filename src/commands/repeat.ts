import { Colors, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption } from 'discord.js';
import { RepeatMode, RepeatModeName } from '@/core/player';
import { KamiCommand } from '@/core/command';

const modeOption = new SlashCommandIntegerOption()
  .setName('mode')
  .setDescription('Change the repeat mode of the player')
  .addChoices(
    {
      name: RepeatModeName[RepeatMode.Forward],
      value: RepeatMode.Forward,
    },
    {
      name: RepeatModeName[RepeatMode.RepeatQueue],
      value: RepeatMode.RepeatQueue,
    },
    {
      name: RepeatModeName[RepeatMode.RepeatCurrent],
      value: RepeatMode.RepeatQueue,
    },
    {
      name: RepeatModeName[RepeatMode.Random],
      value: RepeatMode.Random,
    },
    {
      name: RepeatModeName[RepeatMode.RandomNoRepeat],
      value: RepeatMode.RandomNoRepeat,
    },
    {
      name: RepeatModeName[RepeatMode.TrueRandom],
      value: RepeatMode.TrueRandom,
    },
    {
      name: RepeatModeName[RepeatMode.Backward],
      value: RepeatMode.Backward,
    },
    {
      name: RepeatModeName[RepeatMode.BackwardRepeatQueue],
      value: RepeatMode.BackwardRepeatQueue,
    },
  )
  .setRequired(true);

export default new KamiCommand({
  builder: new SlashCommandBuilder()
    .setName('repeat')
    .setDescription('Change the repeat mode of the player')
    .addIntegerOption(modeOption),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `循環模式 | ${interaction.guild.name}`,
        iconURL: interaction.guild.iconURL() ?? undefined,
      });

    const edit = () => interaction.editReply({
      embeds: [embed],
    });

    const player = this.players.get(interaction.guild.id);

    if (!player) {
      embed
        .setColor(Colors.Red)
        .setDescription('❌ 沒有播放器');

      await edit();
      return;
    }

    if (!player.canInteract(interaction.member)) {
      embed
        .setColor(Colors.Red)
        .setDescription('❌ 你沒有權限和這個播放器互動');

      await edit();
      return;
    }

    const mode = interaction.options.getInteger('mode', true) as RepeatMode;
    player.repeat = mode;

    embed
      .setColor(Colors.Green)
      .setDescription(`✅ 已將循環模式切換為 ${RepeatModeName[mode]}`)
      .setTimestamp();

    await edit();
  },
});