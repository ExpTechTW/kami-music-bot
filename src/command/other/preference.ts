import {
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandIntegerOption,
  SlashCommandSubcommandGroupBuilder,
  SlashCommandBooleanOption,
} from "discord.js";
import { RepeatMode } from "../../class/KamiMusicPlayer";
import type { Command } from "..";
const modeString = [
  "不重複",
  "循環",
  "單曲重複",
  "隨機",
  "隨機（不重複）",
  "平均隨機",
  "倒序",
  "倒序循環",
];

export default {
  data: new SlashCommandBuilder()
    .setName("preference")
    .setNameLocalization("zh-TW", "偏好設定")
    .setDescription("Player preference settings")
    .setDescriptionLocalization("zh-TW", "設定播放器偏好設定")
    .addSubcommandGroup(
      new SlashCommandSubcommandGroupBuilder()
        .setName("volume")
        .setNameLocalization("zh-TW", "音量")
        .setDescription("Set the initial playback volume.")
        .setDescriptionLocalization("zh-TW", "設定播放器初始音量")
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("percentage")
            .setNameLocalization("zh-TW", "百分比")
            .setDescription("Set playback volume in percentage.")
            .setDescriptionLocalization("zh-TW", "使用百分比來設定播放音量。")
            .addIntegerOption(
              new SlashCommandIntegerOption()
                .setName("value")
                .setNameLocalization("zh-TW", "值")
                .setDescription("The percentage to set to.")
                .setDescriptionLocalization("zh-TW", "要設定的百分比。")
                .setMinValue(0)
            )
            .addBooleanOption(
              new SlashCommandBooleanOption()
                .setName("global")
                .setNameLocalization("zh-TW", "全域")
                .setDescription("Make this preference global scoped.")
                .setDescriptionLocalization("zh-TW", "將這個設定設為全域設定")
            )
        )
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("decibels")
            .setNameLocalization("zh-TW", "分貝")
            .setDescription("Set playback volume in decibels.")
            .setDescriptionLocalization("zh-TW", "使用分貝數來設定播放音量。")
            .addIntegerOption(
              new SlashCommandIntegerOption()
                .setName("value")
                .setNameLocalization("zh-TW", "值")
                .setDescription("The decibels to set to.")
                .setDescriptionLocalization("zh-TW", "要設定的分貝數。")
                .setMinValue(0)
            )
            .addBooleanOption(
              new SlashCommandBooleanOption()
                .setName("global")
                .setNameLocalization("zh-TW", "全域")
                .setDescription("Make this preference global scoped.")
                .setDescriptionLocalization("zh-TW", "將這個設定設為全域設定")
            )
        )
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("log")
            .setNameLocalization("zh-TW", "對數")
            .setDescription(
              "Set playback volume in a logarithmic scale percentage."
            )
            .setDescriptionLocalization(
              "zh-TW",
              "使用對數百分比來設定播放音量。"
            )
            .addIntegerOption(
              new SlashCommandIntegerOption()
                .setName("value")
                .setNameLocalization("zh-TW", "值")
                .setDescription("The percentage to set to.")
                .setDescriptionLocalization("zh-TW", "要設定的百分比。")
                .setMinValue(0)
            )
            .addBooleanOption(
              new SlashCommandBooleanOption()
                .setName("global")
                .setNameLocalization("zh-TW", "全域")
                .setDescription("Make this preference global scoped.")
                .setDescriptionLocalization("zh-TW", "將這個設定設為全域設定")
            )
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("list")
        .setNameLocalization("zh-TW", "目前")
        .setDescription("List all preference settings.")
        .setDescriptionLocalization("zh-TW", "顯示所有偏好設定。")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("lock")
        .setNameLocalization("zh-TW", "鎖定")
        .setDescription(
          "Set the initial lock state to make the player only listen to commands from its owner."
        )
        .setDescriptionLocalization(
          "zh-TW",
          "設定是否讓播放器初始只接受播放器擁有者的指令。"
        )
        .addBooleanOption(
          new SlashCommandBooleanOption()
            .setName("state")
            .setNameLocalization("zh-TW", "狀態")
            .setDescription("The lock state to set to.")
            .setDescriptionLocalization("zh-TW", "設定鎖定狀態")
        )
        .addBooleanOption(
          new SlashCommandBooleanOption()
            .setName("global")
            .setNameLocalization("zh-TW", "全域")
            .setDescription("Make this preference global scoped.")
            .setDescriptionLocalization("zh-TW", "將這個設定設為全域設定")
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("repeat")
        .setNameLocalization("zh-TW", "重複")
        .setDescription("Set the initial playback repeat mode.")
        .setDescriptionLocalization("zh-TW", "設定循環模式。")
        .addIntegerOption(
          new SlashCommandIntegerOption()
            .setName("mode")
            .setNameLocalization("zh-TW", "模式")
            .setDescription("The repeat mode to set to.")
            .setDescriptionLocalization("zh-TW", "循環模式")
            .setChoices(
              ...[
                {
                  name: "No Repeat",
                  name_localizations: { "zh-TW": "不重複" },
                  value: RepeatMode.NoRepeat,
                },
                {
                  name: "Repeat Queue",
                  name_localizations: { "zh-TW": "循環" },
                  value: RepeatMode.RepeatQueue,
                },
                {
                  name: "Repeat Current",
                  name_localizations: { "zh-TW": "單曲重複" },
                  value: RepeatMode.RepeatCurrent,
                },
                {
                  name: "Random",
                  name_localizations: { "zh-TW": "隨機" },
                  value: RepeatMode.Random,
                },
                {
                  name: "Random Without Repeat",
                  name_localizations: { "zh-TW": "隨機（不重複）" },
                  value: RepeatMode.RandomNoRepeat,
                },
                {
                  name: "Backward",
                  name_localizations: { "zh-TW": "倒序播放" },
                  value: RepeatMode.Backward,
                },
                {
                  name: "Backward Repeat Queue",
                  name_localizations: { "zh-TW": "倒序循環" },
                  value: RepeatMode.BackwardRepeatQueue,
                },
              ]
            )
        )
        .addBooleanOption(
          new SlashCommandBooleanOption()
            .setName("global")
            .setNameLocalization("zh-TW", "全域")
            .setDescription("Make this preference global scoped.")
            .setDescriptionLocalization("zh-TW", "將這個設定設為全域設定")
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("status")
        .setNameLocalization("zh-TW", "語音頻道狀態")
        .setDescription(
          "Set the initial state to whether update the channel state based on currently playing."
        )
        .setDescriptionLocalization(
          "zh-TW",
          "設定是否讓播放器初始在換歌時更新頻道狀態。"
        )
        .addBooleanOption(
          new SlashCommandBooleanOption()
            .setName("state")
            .setNameLocalization("zh-TW", "狀態")
            .setDescription("The lock state to set to.")
            .setDescriptionLocalization("zh-TW", "設定換歌時是否更新頻道狀態。")
        )
        .addBooleanOption(
          new SlashCommandBooleanOption()
            .setName("global")
            .setNameLocalization("zh-TW", "全域")
            .setDescription("Make this preference global scoped.")
            .setDescriptionLocalization("zh-TW", "將這個設定設為全域設定")
        )
    )
    .setDMPermission(false),
  defer: true,
  ephemeral: true,

  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    try {
      const subcmdgrp = interaction.options.getSubcommandGroup(false);
      const subcmd = interaction.options.getSubcommand(false);
      const is_global = interaction.options.getBoolean("global") ?? false;
      const userPreference =
        interaction.client.setting.user.data[interaction.member.id];
      const settingKey = subcmdgrp ?? subcmd;

      let embed = new EmbedBuilder()
        .setColor(interaction.client.Color.Success)
        .setAuthor({
          name: `偏好設定 | ${is_global ? "全域" : interaction.guild.name}`,
          iconURL: is_global
            ? interaction.user.avatarURL()
            : interaction.guild.iconURL(),
        })
        .setTimestamp();

      if (is_global) {
        userPreference.global ??= {};
      } else {
        userPreference[interaction.guild.id] ??= {};
      }

      switch (settingKey) {
        case "list": {
          embed = embed
            .setAuthor({
              name: `偏好設定 | ${interaction.member.displayName}`,
              iconURL: interaction.member.displayAvatarURL(),
            })
            .setDescription("有 ✅ 者為播放器初始將使用的值")
            .setFields([
              {
                name: "🔊 音量",
                value: `${interaction.guild.name} *${userPreference?.[interaction.guild.id]?.volumeString != undefined ? `*${userPreference?.[interaction.guild.id]?.volumeString} (${userPreference?.[interaction.guild.id]?.volume})*` : "`未設定`"}*${userPreference?.[interaction.guild.id]?.volumeString != undefined ? " ✅" : ""}\n全域 *${userPreference?.global?.volumeString != undefined ? `*${userPreference?.global?.volumeString} (${userPreference?.global?.volume})*` : "`未設定`"}*${userPreference?.[interaction.guild.id]?.volumeString == undefined && userPreference?.global?.volumeString != undefined ? " ✅" : ""}\n預設值 **100% (1)**${userPreference?.[interaction.guild.id]?.volumeString == undefined && userPreference?.global?.volumeString == undefined ? " ✅" : ""}`,
                inline: true,
              },
              {
                name: "🔒 鎖定",
                value: `${interaction.guild.name} *${userPreference?.[interaction.guild.id]?.locked != undefined ? `*${userPreference?.[interaction.guild.id]?.locked ? "鎖定" : "未鎖定"}*` : "`未設定`"}*${userPreference?.[interaction.guild.id]?.locked != undefined ? " ✅" : ""}\n全域 *${userPreference?.global?.locked != undefined ? `*${userPreference?.global?.locked ? "鎖定" : "未鎖定"}*` : "`未設定`"}*${userPreference?.[interaction.guild.id]?.locked == undefined && userPreference?.global?.locked != undefined ? " ✅" : ""}\n預設值 **未鎖定**${userPreference?.[interaction.guild.id]?.locked == undefined && userPreference?.global?.locked == undefined ? " ✅" : ""}`,
                inline: true,
              },
              {
                name: "🔁 循環模式",
                value: `${interaction.guild.name} *${userPreference?.[interaction.guild.id]?.repeat != undefined ? `*${modeString[userPreference?.[interaction.guild.id]?.repeat]}*` : "`未設定`"}*${userPreference?.[interaction.guild.id]?.repeat != undefined ? " ✅" : ""}\n全域 *${userPreference?.global?.repeat != undefined ? `*${modeString[userPreference?.global?.repeat]}*` : "`未設定`"}*${userPreference?.[interaction.guild.id]?.repeat == undefined && userPreference?.global?.repeat != undefined ? " ✅" : ""}\n預設值 **${modeString[0]}**${userPreference?.[interaction.guild.id]?.repeat == undefined && userPreference?.global?.repeat == undefined ? " ✅" : ""}`,
                inline: true,
              },
            ]);
          break;
        }

        case "volume": {
          const inputValue = interaction.options.getInteger("value");

          if (inputValue == null) {
            userPreference[is_global ? "global" : interaction.guild.id].volume =
              undefined;
            userPreference[
              is_global ? "global" : interaction.guild.id
            ].volumeString = undefined;
            embed = embed.setDescription("已將初始音量設為 *`未設定`*");
            break;
          }

          let settingValue;
          let volumeString = "";

          switch (subcmd) {
            case "percentage": {
              settingValue = inputValue / 100;
              volumeString = `${inputValue}%`;
              break;
            }

            case "decibels": {
              settingValue = Math.pow(10, inputValue / 20) / 100;
              volumeString = `${inputValue}dB`;
              break;
            }

            case "log": {
              settingValue = Math.pow((4 * inputValue) / 25, 1.660964) / 100;
              volumeString = `${inputValue}%log`;
              break;
            }

            default:
              break;
          }

          userPreference[is_global ? "global" : interaction.guild.id].volume =
            settingValue;
          userPreference[
            is_global ? "global" : interaction.guild.id
          ].volumeString = volumeString;
          embed = embed.setDescription(
            `已將初始音量設為 **${volumeString}** (${settingValue})`
          );
          break;
        }

        case "lock": {
          const settingValue = interaction.options.getBoolean("state");
          userPreference[is_global ? "global" : interaction.guild.id].locked =
            settingValue;
          embed = embed.setDescription(
            `已將初始鎖定狀態設為 *${settingValue == true ? "*鎖定*" : settingValue == false ? "*未鎖定*" : "`未設定`"}*`
          );
          break;
        }

        case "repeat": {
          const settingValue = interaction.options.getBoolean("mode");
          userPreference[is_global ? "global" : interaction.guild.id].repeat =
            settingValue;
          embed = embed.setDescription(
            `已將初始循環模式設為 *${settingValue != null ? `${modeString[settingValue]}` : "`未設定`"}*`
          );
          break;
        }

        case "status": {
          const settingValue = interaction.options.getBoolean("status");
          userPreference[is_global ? "global" : interaction.guild.id].status =
            settingValue;
          embed = embed.setDescription(
            `${settingValue == true ? "將在歌曲變換時設定語音頻道狀態" : "歌曲變換時**__不會__**設定語音頻道狀態"}`
          );
          break;
        }

        default:
          break;
      }

      interaction.client.setting.user.save();
      await interaction.editReply({ embeds: [embed], ephemeral: true });
    } catch (e) {
      const errCase = {
        ERR_USER_NOT_IN_VOICE: "你必須在語音頻道內才能使用這個指令",
        ERR_USER_NOT_IN_SAME_VOICE: "你和我在同一個語音頻道內才能使用這個指令",
        ERR_NO_PLAYER: "現在沒有在放音樂",
        ERR_PLAYER_LOCKED: "你沒有權限和這個播放器互動",
      }[e.message];

      const embed = new EmbedBuilder()
        .setColor(interaction.client.Color.Error)
        .setTitle(`${interaction.client.EmbedIcon.Error} 錯誤`);

      if (!errCase) {
        embed
          .setDescription(`發生了預料之外的錯誤：\`${e.message}\``)
          .setFooter({ text: "ERR_UNCAUGHT_EXCEPTION" });
        console.error(e);
      } else {
        embed.setDescription(errCase).setFooter({ text: e.message });
      }

      if (this.defer) {
        if (!this.ephemeral) {
          await interaction.deleteReply().catch(() => void 0);
        }
      }

      await interaction.followUp({ embeds: [embed], ephemeral: true });
    }
  },
} satisfies Command;
