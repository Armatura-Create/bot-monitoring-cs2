import { Client, Interaction } from 'discord.js';
import translate from "../translator/translator";
import {typedConfig} from "../index";
import {createPlayerStatsEmbed, createServerOnline} from "../embeds/statsPlayers";
import {getCacheData, getOnlineStats} from "../cache/cacheUtil";
import {generateChart} from "../utils/canvasCreate";

export function handleInteractions(client: Client) {
    client.on('interactionCreate', async (interaction: Interaction) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.includes('playerStatsButton')) {
            const ip_port = interaction.customId.split('_')[1];

            const players = getCacheData(ip_port)?.players || [];
            const serverName = getCacheData(ip_port)?.name || 'Unknown';

            const embed = createPlayerStatsEmbed(players, serverName);

            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }

        if (interaction.customId.includes('showOnlineStats')) {
            const ip_port = interaction.customId.split('_')[1];

            const currentDate = new Intl.DateTimeFormat(typedConfig.locale, {
                timeZone: typedConfig.time_zone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(new Date());

            const stats = getOnlineStats(ip_port, currentDate);
            const serverName = getCacheData(ip_port)?.name || translate('title_stats');

            if (stats && Object.keys(stats).length > 0) {
                try {
                    const image = await generateChart(stats);

                    const serverOnline = createServerOnline(serverName, image);

                    await interaction.reply({
                        embeds: [serverOnline.embed],
                        files: [serverOnline.attachment],
                        ephemeral: true
                    });
                } catch (error) {
                    await interaction.reply({
                        content: translate('error_stats'),
                        ephemeral: true
                    });
                }
            } else {
                await interaction.reply({
                    content: translate('not_found_stats'),
                    ephemeral: true
                });
            }
        }
    });
}
