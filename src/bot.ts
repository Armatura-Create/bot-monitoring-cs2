import {Client, TextChannel} from 'discord.js';
import {createEmbed, createOneEmbed} from './embeds/monitor';
import {log, updateConfig, updateConfig_Server} from './utils/utils';
import {getServerData} from './utils/sourceQuery';
import {Server} from "./types/Server";
import {CombinedServer} from "./types/ServerDto";
import {typedConfig} from "./index";

const maxRetries = 10;

export async function sendMessage(client: Client, server: Server, channelId: string): Promise<void> {

    if (!channelId) {
        throw Error('Channel ID is not defined');
    }

    const channel = client.channels.cache.get(channelId) as TextChannel;
    if (!channel) {
        throw Error('Channel not found');
    }

    log("check server data: " + server.ip_port);

    const serverData = await getServerData(server);

    if (serverData) {
        const combinedData = {...server, ...serverData} as CombinedServer;
        const embed = createEmbed(combinedData);

        let messageId: string;

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

        if (messageId !== "") {
            server.message_id = messageId;
            updateConfig_Server(server);
        }

    } else {
        log('Server is not available and not found cache data');
    }
}

export async function sendOneMessage(client: Client, servers: Server[], channelId: string): Promise<void> {
    if (!channelId) {
        throw Error('Channel ID is not defined');
    }

    const channel = client.channels.cache.get(channelId) as TextChannel;
    if (!channel) {
        throw Error('Channel not found');
    }

    const serverData = await Promise.all(servers.map(server => getServerData(server)));

    if (serverData && serverData.length == servers.length) {
        const combinedData = servers.map((server, index) => {
            return {...server, ...serverData[index]} as CombinedServer;
        });

        const embed = createOneEmbed(combinedData);

        const message = await channel.send({embeds: [embed]});

        if (message?.id) {
            typedConfig.compact_config.message_id = message.id;
            updateConfig(typedConfig);
        }

    } else {
        log('Server is not available and not found cache data');
    }

}

export async function updateMessage(client: Client, server: Server, channelId: string): Promise<void> {

    if (!channelId) {
        throw new Error('Channel ID is not defined');
    }

    const channel = client.channels.cache.get(channelId) as TextChannel;
    if (!channel) {
        throw new Error('Channel not found');
    }

    if (!server.message_id) {
        return sendMessage(client, server, channelId);
    }

    const serverData = await getServerData(server);

    if (serverData) {

        let attempt = 0;
        let success = false;

        while (attempt < maxRetries) {
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
            }

            attempt++;
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 4000));
            }
        }

        if (!success) {
            log('Failed to update message send New Message');
            return sendMessage(client, server, channelId);
        }
    } else {
        log('Server is not available and not found cache data');
    }
}

export async function updateOneMessage(client: Client, servers: Server[], channelId: string): Promise<void> {
    if (!channelId) {
        throw Error('Channel ID is not defined');
    }

    const channel = client.channels.cache.get(channelId) as TextChannel;
    if (!channel) {
        throw Error('Channel not found');
    }

    if (!typedConfig.compact_config.message_id) {
        return sendOneMessage(client, servers, channelId);
    }

    const serverData = await Promise.all(servers.map(server => getServerData(server)));

    if (serverData && serverData.length == servers.length) {
        const combinedData = servers.map((server, index) => {
            return {...server, ...serverData[index]} as CombinedServer;
        });

        const embed = createOneEmbed(combinedData);

        let attempt = 0;
        let success = false;

        while (attempt < maxRetries) {

            try {
                const message = await channel.messages.fetch(typedConfig.compact_config.message_id);
                await message.edit({embeds: [embed]});
            } catch (error) {
                log('Error fetching or updating message:', error);
            }

            attempt++;
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 4000));
            }
        }

        if (!success) {
            log('Failed to update message send New Message');
            return sendOneMessage(client, servers, channelId);
        }

    } else {
        log('Server is not available and not found cache data');
    }
}
