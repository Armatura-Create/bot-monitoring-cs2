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

    log("check server data: " + server.connect_link);

    const [ip, port] = server.connect_link.split(':');
    const serverPort = Number.parseInt(port);

    const serverData = await getServerData(ip, serverPort);

    if (serverData) {
        const combinedData = {...server, ...serverData} as CombinedServer;
        const embed = createEmbed(combinedData);

        if (embed.attachment != null) {
            const message = await channel.send({embeds: [embed.embedBuilder], files: [embed.attachment]});
            server.message_id = message.id;
            updateConfig(server);
        } else {
            const message = await channel.send({embeds: [embed.embedBuilder]});
            server.message_id = message.id;
            updateConfig(server);
        }

    } else {
        log('Server is not available');
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

    const [ip, port] = server.connect_link.split(':');
    const serverPort = Number.parseInt(port);

    const serverData = await getServerData(ip, serverPort);

    if (serverData) {
        try {
            const message = await channel.messages.fetch(server.message_id);
            const combinedData = {...server, ...serverData} as CombinedServer;
            const embed = createEmbed(combinedData);

            if (embed.attachment) {
                await message.edit({embeds: [embed.embedBuilder], files: [embed.attachment]});
            } else {
                await message.edit({embeds: [embed.embedBuilder]});
            }
        } catch (error) {
            console.log('Error fetching or updating message:', error);
        }
    }
}
