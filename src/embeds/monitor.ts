import {AttachmentBuilder, EmbedBuilder} from 'discord.js';
import {getFormattedDate, hexToColorResolvable, isValidUrl, log} from '../utils/utils';
import config from '../../config.json'; // Для этого нужно включить поддержку JSON в tsconfig
import translate from '../translator/translator';
import {CombinedServer} from "../types/ServerDto";
import path from "path";
import fs from "fs";
import {EmbedWithAttachment} from "../types/EmbedWithAttachment";


export function createEmbed(server: CombinedServer): EmbedWithAttachment {
    const formattedDate = getFormattedDate(config.locale);
    const imagePath = path.join(__dirname, '../..', 'map_image', `${server.map}.webp`);

    let title = server.server_name ? server.server_name : server.name;

    log(`Server data for embed:`, server);

    if (!server.connect_link || server.connect_link === '') {
        log('Connect link is not defined');
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
            {name: `${translate(config.locale, 'status')}`, value: `\`\`\`yaml\n${server.status}\`\`\``, inline: false},
            {name: translate(config.locale, 'map'), value: `\`\`\`yaml\n${server.map}\`\`\``, inline: true},
            {name: translate(config.locale, 'players'), value: `\`\`\`yaml\n${server.players}\`\`\``, inline: true},
            {name: translate(config.locale, 'connect'), value: `\`\`\`yaml\n${server.connect_link}\`\`\``, inline: false}
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
        embed.setImage(server.image_map);
    } else if (fs.existsSync(imagePath)) {
        log(`Map image exists: ${imagePath}`);
        attachment = new AttachmentBuilder(imagePath);
        embed.setImage(`attachment://${server.map}.webp`);
    }

    if (server.image_thumbnail && isValidUrl(server.image_thumbnail)) {
        embed.setThumbnail(server.image_thumbnail);
    }

    if (server.footer?.icon && isValidUrl(server.footer.icon)) {
        embed.setFooter({text: `${translate(config.locale, 'last_update')} ${formattedDate}`, iconURL: server.footer.icon});
    } else {
        embed.setFooter({text: `Last update: ${formattedDate}`});
    }

    return {embedBuilder : embed, attachment: attachment};
}
