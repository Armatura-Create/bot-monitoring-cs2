import {ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} from 'discord.js';
import {getFormattedDate, hexToColorResolvable, isValidUrl, log} from '../utils/utils';
import translate from '../translator/translator';
import {CombinedServer} from "../types/ServerDto";
import path from "path";
import fs from "fs";
import {CustomEmbed} from "../types/CustomEmbed";
import * as dotenv from "dotenv";
import {Config} from "../types/Config";

dotenv.config();

const configFilePath = process.env.CONFIG_FILE_PATH || 'config.json'; // Установить путь по умолчанию, если переменной нет

const fullConfigPath = path.resolve(__dirname, '../..', configFilePath);

if (!fs.existsSync(fullConfigPath)) {
    throw new Error(`Config file not found at path: ${fullConfigPath}`);
}

const config = require(fullConfigPath);

const typedConfig: Config = config as Config;

export function createEmbed(server: CombinedServer): CustomEmbed {
    const formattedDate = getFormattedDate(typedConfig.locale);
    const imagePath = path.join(__dirname, '../..', 'map_images', `${server.map}.webp`);

    let title = server.server_name ? server.server_name : server.name;

    log(`Server data for embed:`, server);

    if (!server.ip_port || server.ip_port === '') {
        log('IP PORT is not defined');
    }

    if (!server.map || server.map === '') {
        log('Map is not defined');
    }

    if (!server.players || server.players === '') {
        log('Players is not defined or empty');
    }

    let embed = new EmbedBuilder()
        .setColor(hexToColorResolvable(server.status == 'ONLINE' ? server.color : '#FF0000'))
        .addFields(
            {
                name: `**${translate(config.locale, 'status')}**`,
                value: `\`\`\`fix\n${server.status}\`\`\``,
                inline: false
            },
            {
                name: `**${translate(config.locale, 'map')}**`,
                value: `\`\`\`fix\n${server.map}\`\`\``,
                inline: true
            },
            {
                name: `**${translate(config.locale, 'players')}**`,
                value: `\`\`\`m1\n${server.players}\`\`\``,
                inline: true
            },
            {
                name: `**${translate(config.locale, 'connect')}**`,
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

    if (server.image_map && isValidUrl(server.image_map)) {
        log(`Map image URL: ${server.image_map}`);
        embed.setImage(server.image_map);
    } else if (fs.existsSync(imagePath)) {
        log(`Map image exists: ${imagePath}`);
        attachment = new AttachmentBuilder(imagePath);
        embed.setImage(`attachment://${server.map}.webp`);
    } else {
        log(`Map image not found: ${imagePath}`);
    }

    if (server.image_thumbnail && isValidUrl(server.image_thumbnail)) {
        embed.setThumbnail(server.image_thumbnail);
    }

    if (server.footer?.icon && isValidUrl(server.footer.icon)) {
        embed.setFooter({text: `${translate(config.locale, 'last_update')} ${formattedDate}`, iconURL: server.footer.icon});
    } else {
        embed.setFooter({text: `${translate(config.locale, 'last_update')} ${formattedDate}`});
    }


    const buttons = new ActionRowBuilder<ButtonBuilder>()

    if (server.buttons?.connect && server.buttons.connect.active && server.buttons.connect.url && isValidUrl(server.buttons.connect.url)) {
        const connectButton = new ButtonBuilder()
            .setLabel(translate(config.locale, 'connect'))
            .setStyle(ButtonStyle.Link)
            .setURL(server.buttons.connect.url);
        buttons.addComponents(connectButton);
    }

    return {embedBuilder: embed, attachment: attachment, components: buttons};
}
