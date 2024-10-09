import {Client, TextChannel} from 'discord.js';
import {createEmbed} from './embeds/monitor';
import {updateConfig, log} from './utils/utils';
import {getServerData} from './utils/sourceQuery';
import {Server} from "./types/Server";
import {CombinedServer} from "./types/ServerDto";

export async function sendMessage(client: Client, server: Server, channelId: string): Promise<void> {

    if (!channelId) {
        console.log('Channel ID is not defined');
        return;
    }

    const channel = client.channels.cache.get(channelId) as TextChannel;
    if (!channel) {
        console.log('Channel not found');
        return;
    }

    log("check server data: " + server.ip_port);

    const [ip, port] = server.ip_port.split(':');
    const serverPort = Number.parseInt(port);

    const serverData = await getServerData(ip, serverPort);

    if (serverData) {
        const combinedData = {...server, ...serverData} as CombinedServer;
        const embed = createEmbed(combinedData);

        let messageId = ""

        if (embed.attachment && embed.components) {
            const message = await channel.send({embeds: [embed.embedBuilder], files: [embed.attachment], components: [embed.components]});
            messageId = message.id;
        } else if (embed.attachment) {
            const message = await channel.send({embeds: [embed.embedBuilder], files: [embed.attachment]});
            messageId = message.id;
        } else if (embed.components) {
            const message = await channel.send({embeds: [embed.embedBuilder], components: [embed.components]});
            messageId = message.id;
        } else {
            const message = await channel.send({embeds: [embed.embedBuilder]});
            messageId = message.id;
        }

        if (messageId) {
            server.message_id = messageId;
            updateConfig(server);
        }

    } else {
        log('Server is not available and not found cache data');
    }
}


export async function updateMessage(client: Client, server: Server, channelId: string): Promise<void> {

    if (!channelId) {
        console.log('Channel ID is not defined');
        return;
    }

    const channel = client.channels.cache.get(channelId) as TextChannel;
    if (!channel) {
        console.log('Channel not found');
        return;
    }

    if (!server.message_id) {
        console.log('Message ID is not defined for the server');
        return;
    }

    const [ip, port] = server.ip_port.split(':');
    const serverPort = Number.parseInt(port);

    const serverData = await getServerData(ip, serverPort);

    if (serverData) {
        try {
            const message = await channel.messages.fetch(server.message_id);
            const combinedData = {...server, ...serverData} as CombinedServer;
            const embed = createEmbed(combinedData);

            if (embed.attachment && embed.components) {
                await message.edit({embeds: [embed.embedBuilder], files: [embed.attachment], components: [embed.components]});
            } else if (embed.attachment) {
                await message.edit({embeds: [embed.embedBuilder], files: [embed.attachment]});
            } else if (embed.components) {
                await message.edit({embeds: [embed.embedBuilder], components: [embed.components]});
            } else {
                await message.edit({embeds: [embed.embedBuilder]});
            }
        } catch (error) {
            log('Error fetching or updating message:', error);
            log('Try to send new message');
            sendMessage(client, server, channelId);
        }
    } else {
        log('Server is not available and not found cache data');
    }
}
