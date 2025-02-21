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

            let find = typedConfig.servers.find(server => server.ip_port === ip_port);

            if (!find || (find.buttons?.connect?.active === false && find.buttons?.players?.active === false && find.buttons?.online_stats?.active === false)) {
                await interaction.reply({content: translate('not_available_servers'), flags: MessageFlags.Ephemeral});
                return;
            }

            const buttons = new ActionRowBuilder<ButtonBuilder>();

            if (find.buttons?.connect?.active) {
                const connectButton = new ButtonBuilder()
                    .setLabel(translate('connect'))
                    .setStyle(ButtonStyle.Link)
                    .setURL(find.buttons.connect.url);
                buttons.addComponents(connectButton);
            }

            if (find.buttons?.players?.active && (getCacheData(ip_port)?.players || []).length > 0) {
                const playersButton = new ButtonBuilder()
                    .setCustomId(`playerStatsButton_${ip_port}`)
                    .setLabel(translate('players_stats'))
                    .setStyle(ButtonStyle.Primary)

                buttons.addComponents(playersButton);
            }

            if (find.buttons?.online_stats?.active) {
                const onlineStatsButton =
                    new ButtonBuilder()
                        .setCustomId(`showOnlineStats_${ip_port}`)
                        .setLabel(translate('show_online_stats'))
                        .setStyle(ButtonStyle.Primary);
                buttons.addComponents(onlineStatsButton);
            }


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

        if (interaction.customId.startsWith('showOnlineStats')) {
            const ip_port = interaction.customId.split('_')[1];

            const currentDate = new Intl.DateTimeFormat(typedConfig.locale, {
                timeZone: typedConfig.time_zone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(new Date());

            const stats = getOnlineStats(ip_port, currentDate);
            const serverName = getCacheData(ip_port)?.name || translate('title_stats');

            await interaction.deferReply({flags: MessageFlags.Ephemeral});

            if (stats && Object.keys(stats).length > 0) {
                try {
                    const image = await generateChart(serverName, stats);
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
