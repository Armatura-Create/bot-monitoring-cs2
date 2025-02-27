import {ActionRowBuilder, APIEmbedField, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} from 'discord.js';
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

    log('Server data for embed:', server);

    if (!server.ip_port || server.ip_port === '') {
        log('IP PORT is not defined');
    }

    if (!server.map || server.map === '') {
        log('Map is not defined');
    }

    if (!server.players) {
        log('Players is not defined');
    }

    let fields : APIEmbedField[] = [];

    if (server.show_status) {
        fields.push({
            name: `**${translate('status')}**`,
            value: `\`\`\`fix\n${server.status}\`\`\``,
            inline: false
        });
    }

    fields.push(
        {
            name: `**${translate('map')}**`,
            value: `\`\`\`fix\n${!server.show_status ? '---' : server.map}\`\`\``,
            inline: true
        },
        {
            name: `**${translate('players')}**`,
            value: `\`\`\`ml\n${!server.show_status ? '-' : server.players.length} / ${server.maxPlayers} \`\`\``,
            inline: true
        },
        {
            name: `**${translate('connect')}**`,
            value: `\`\`\`fix\n${server.ip_port}\`\`\``,
            inline: false
        }
    );

    let embedBuilder = new EmbedBuilder()
        .setColor(hexToColorResolvable(server.status == 'ONLINE' ? server.color : '#FF0000'))
        .addFields(fields);

    if (server.url && isValidUrl(server.url)) {
        embedBuilder.setURL(server.url);
    }

    if (server.image_author && isValidUrl(server.image_author)) {
        embedBuilder.setAuthor({name: server.name, iconURL: server.image_author});
    } else {
        embedBuilder.setTitle(server.name);
    }

    let attachment = null;

    if (server.map_settings?.active) {
        const imagePath = path.join(__dirname, '../..', 'map_images', `${server.map}.webp`);

        const lastMap = getCacheLastAttachmentMaps(server.ip_port);

        if (server.map_settings.image && isValidUrl(server.map_settings.image)) {
            log(`Map image URL: ${server.map_settings.image}`);
            embedBuilder.setImage(server.map_settings.image);
        } else if (fs.existsSync(imagePath)) {
            log(`Map image exists: ${imagePath}`);
            if (lastMap !== server.map) {
                attachment = new AttachmentBuilder(imagePath);
                updateCacheLastAttachmentMaps(server.ip_port, server.map);
            }
            embedBuilder.setImage(`attachment://${server.map}.webp`);
        } else {
            if (lastMap !== 'not_found') {
                attachment = new AttachmentBuilder(path.join(__dirname, '../..', 'map_images', `not_found.webp`));
                updateCacheLastAttachmentMaps(server.ip_port, 'not_found');
            }
            embedBuilder.setImage(`attachment://not_found.webp`);
        }
    }


    if (server.image_thumbnail && isValidUrl(server.image_thumbnail)) {
        embedBuilder.setThumbnail(server.image_thumbnail);
    }

    if (server.footer?.icon && isValidUrl(server.footer.icon)) {
        embedBuilder.setFooter({text: `${translate('last_update')} ${formattedDate}`, iconURL: server.footer.icon});
    } else {
        embedBuilder.setFooter({text: `${translate('last_update')} ${formattedDate}`});
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

        buttons.addComponents(playersButton);
    }

    if (server.buttons?.online_stats?.active) {
        const onlineStatsButton =
            new ButtonBuilder()
                .setCustomId(`showOnlineStats_${server.ip_port}`)
                .setLabel(translate('show_online_stats'))
                .setStyle(ButtonStyle.Primary);
        buttons.addComponents(onlineStatsButton);
    }

    if (buttons.components.length > 0 && buttons.components.length <= 5) {
        return {embedBuilder: embedBuilder, attachment: attachment, components: buttons};
    } else {
        return {embedBuilder: embedBuilder, attachment: attachment, components: null};
    }
}

export function createOneEmbed(servers: CombinedServer[]): EmbedBuilder {

    const formattedDate = getFormattedDate(typedConfig.locale);

    let embedBuilder = new EmbedBuilder()
        .setColor(hexToColorResolvable(typedConfig.compact_config.color || '#FFFFFF'));

    let fields : APIEmbedField[] = [];

    servers.forEach((server, index) => {

        if (!server.ip_port || server.ip_port === '') {
            log('IP PORT is not defined');
        }

        if (!server.map || server.map === '') {
            log('Map is not defined');
        }

        if (!server.players) {
            log('Players is not defined');
        }
        
        fields.push({
            name: `**${translate('server')}**`,
            value: `\`\`\`\n${(server.status === 'OFFLINE' ? ` [${server.status}]` : server.name)}\`\`\``,
            inline: false
        });

        if (server.show_status) {
            fields.push({
                name: `**${translate('status')}**`,
                value: `\`\`\`fix\n${server.status}\`\`\``,
                inline: false
            });
        }

        fields.push(
            {
                name: `**${translate('map')}**`,
                value: `\`\`\`fix\n${!server.show_status && server.status === 'OFFLINE' ? '---' : server.map}\`\`\``,
                inline: true
            },
            {
                name: `**${translate('players')}**`,
                value: `\`\`\`ml\n${server.status === 'OFFLINE' ? 'OFFLINE' : server.players.length} / ${server.status === 'OFFLINE' ? 'OFFLINE' : server.maxPlayers} \`\`\``,
                inline: true
            },
            {
                name: `**${translate('connect')}**`,
                value: `\`\`\`fix\n${server.ip_port}\`\`\``,
                inline: true
            }
        );
    });

    embedBuilder.addFields(fields);

    if (typedConfig.compact_config.footer?.icon && isValidUrl(typedConfig.compact_config.footer.icon)) {
        embedBuilder.setFooter({text: `${translate('last_update')} ${formattedDate}`, iconURL: typedConfig.compact_config.footer.icon});
    } else {
        embedBuilder.setFooter({text: `${translate('last_update')} ${formattedDate}`});
    }

    return embedBuilder;
}
