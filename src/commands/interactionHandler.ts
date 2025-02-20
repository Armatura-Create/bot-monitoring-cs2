import {ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, Interaction, MessageFlags, StringSelectMenuBuilder} from 'discord.js';
import translate from "../translator/translator";
import {typedConfig} from "../index";
import {createPlayerStatsEmbed, createServerOnline} from "../embeds/statsPlayers";
import {getCacheData, getOnlineStats} from "../cache/cacheUtil";
import {generateChart} from "../utils/canvasCreate";

export function handleInteractions(client: Client) {
    client.on('interactionCreate', async (interaction: Interaction) => {

        if (interaction.isStringSelectMenu() && interaction.customId === 'serverSelect') {
            const ip_port = interaction.values[0];

            const buttons = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`playerStatsButton_${ip_port}`)
                        .setLabel(translate('players_stats'))
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`showOnlineStats_${ip_port}`)
                        .setLabel(translate('show_online_stats'))
                        .setStyle(ButtonStyle.Primary)
                );

            await interaction.deferReply({flags: MessageFlags.Ephemeral});
            await interaction.editReply({
                content: translate('selected_server') + `: **${ip_port}**.` + ` ${translate('select_action')}`,
                components: [buttons]
            });
        }

        if (!interaction.isButton()) return;

        if (interaction.customId === 'selectServer') {
            const serverOptions = typedConfig.servers.map(server => ({
                label: getCacheData(server.ip_port)?.name || 'Unknown',
                value: server.ip_port
            }));

            if (serverOptions.length === 0) {
                await interaction.reply({content: translate('not_available_servers'), flags: MessageFlags.Ephemeral});
                return;
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('serverSelect')
                .setPlaceholder(translate('select_server'))
                .addOptions(serverOptions);

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

            await interaction.deferReply({flags: MessageFlags.Ephemeral});
            await interaction.editReply({
                content: translate('select_server_for_stats'),
                components: [row]
            });
        }

        if (interaction.customId.startsWith('playerStatsButton')) {
            const ip_port = interaction.customId.split('_')[1];

            const players = getCacheData(ip_port)?.players || [];
            const serverName = getCacheData(ip_port)?.name || 'Unknown';

            const embed = createPlayerStatsEmbed(players, serverName);

            await interaction.deferReply({flags: MessageFlags.Ephemeral});
            await interaction.editReply({
                embeds: [embed]
            });
        }

        if (interaction.isButton() && interaction.customId.startsWith('showOnlineStats')) {
            const ip_port = interaction.customId.split('_')[1];

            const stats = getOnlineStats(ip_port, new Date().toISOString().split('T')[0]);
            const serverName = getCacheData(ip_port)?.name || translate('title_stats');

            await interaction.deferReply({flags: MessageFlags.Ephemeral});

            if (stats && Object.keys(stats).length > 0) {
                try {
                    const image = await generateChart(stats);
                    const serverOnline = createServerOnline(serverName, image);

                    await interaction.editReply({
                        embeds: [serverOnline.embed],
                        files: [serverOnline.attachment]
                    });
                } catch (error) {
                    await interaction.editReply({
                        content: translate('error_stats')
                    });
                }
            } else {
                await interaction.editReply({
                    content: translate('not_found_stats')
                });
            }
        }
    });
}
