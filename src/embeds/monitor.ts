import {ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} from 'discord.js';
import {getFormattedDate, hexToColorResolvable, isValidUrl, log} from '../utils/utils';
import translate from '../translator/translator';
import {CombinedServer} from "../types/ServerDto";
import path from "path";
import fs from "fs";
import {CustomEmbed} from "../types/CustomEmbed";
import {typedConfig} from "../index";
import {getCacheLastAttachmentMaps, updateCacheLastAttachmentMaps} from "../cache/cacheUtil";

export function createEmbed(server: CombinedServer): CustomEmbed {
    const formattedDate = getFormattedDate(typedConfig.locale);

    let title = server.server_name ? server.server_name : server.name;

    log('Server data for embed:', server);

    if (!server.ip_port || server.ip_port === '') {
        log('IP PORT is not defined');
    }

    if (!server.map || server.map === '') {
        log('Map is not defined');
    }

    if (!server.players) {
        log('Players is not defined or empty');
    }

    let embed = new EmbedBuilder()
        .setColor(hexToColorResolvable(server.status == 'ONLINE' ? server.color : '#FF0000'))
        .addFields(
            {
                name: `**${translate('status')}**`,
                value: `\`\`\`fix\n${server.status}\`\`\``,
                inline: false
            },
            {
                name: `**${translate('map')}**`,
                value: `\`\`\`fix\n${server.map}\`\`\``,
                inline: true
            },
            {
                name: `**${translate('players')}**`,
                value: `\`\`\`ml\n${server.players.length} / ${server.maxPlayers} \`\`\``,
                inline: true
            },
            {
                name: `**${translate('connect')}**`,
                value: `\`\`\`fix\n${server.ip_port}\`\`\``,
                inline: false
            }
        );

    if (server.url && isValidUrl(server.url)) {
        embed.setURL(server.url);
    }

    if (server.image_author && isValidUrl(server.image_author)) {
        embed.setAuthor({name: title, iconURL: server.image_author});
    } else {
        embed.setTitle(title);
    }

    let attachment = null;

    if (server.image_map_active) {
        const imagePath = path.join(__dirname, '../..', 'map_images', `${server.map}.webp`);

        const lastMap = getCacheLastAttachmentMaps(server.ip_port);

        if (server.image_map && isValidUrl(server.image_map)) {
            log(`Map image URL: ${server.image_map}`);
            embed.setImage(server.image_map);
        } else if (fs.existsSync(imagePath)) {
            log(`Map image exists: ${imagePath}`);
            if (lastMap !== server.map) {
                attachment = new AttachmentBuilder(imagePath);
                updateCacheLastAttachmentMaps(server.ip_port, server.map);
            }
            embed.setImage(`attachment://${server.map}.webp`);
        } else {
            if (lastMap !== 'not_found') {
                attachment = new AttachmentBuilder(path.join(__dirname, '../..', 'map_images', `not_found.webp`));
                updateCacheLastAttachmentMaps(server.ip_port, 'not_found');
            }
            embed.setImage(`attachment://not_found.webp`);
        }
    }


    if (server.image_thumbnail && isValidUrl(server.image_thumbnail)) {
        embed.setThumbnail(server.image_thumbnail);
    }

    if (server.footer?.icon && isValidUrl(server.footer.icon)) {
        embed.setFooter({text: `${translate('last_update')} ${formattedDate}`, iconURL: server.footer.icon});
    } else {
        embed.setFooter({text: `${translate('last_update')} ${formattedDate}`});
    }


    const buttons = new ActionRowBuilder<ButtonBuilder>()

    if (server.buttons?.connect && server.buttons?.connect.active && server.buttons.connect.url && isValidUrl(server.buttons.connect.url)) {
        const connectButton = new ButtonBuilder()
            .setLabel(translate('connect'))
            .setStyle(ButtonStyle.Link)
            .setURL(server.buttons.connect.url);
        buttons.addComponents(connectButton);
    }

    if (server.buttons?.players?.active && server.players.length > 0) {
        const playersButton = new ButtonBuilder()
            .setCustomId(`playerStatsButton_${server.ip_port}`)
            .setLabel(translate('players_stats'))
            .setStyle(ButtonStyle.Primary)

        buttons.addComponents(
            playersButton
        );
    }

    return {embedBuilder: embed, attachment: attachment, components: buttons};
}
