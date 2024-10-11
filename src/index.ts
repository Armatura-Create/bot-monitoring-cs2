import * as dotenv from 'dotenv';
import {Client, GatewayIntentBits} from 'discord.js';
import {log} from './utils/utils';
import {sendMessage, updateMessage} from './bot';
import {Config} from "./types/Config";
import path from "path";
import fs from "fs";
import {Server} from "./types/Server";
import {createPlayerStatsEmbed, createServerOnline} from "./embeds/statsPlayers";
import {clearCache, getCacheData, getOnlineStats} from "./cache/cacheUtil";
import translate from "./translator/translator";
import {generateChart} from "./utils/canvasCreate";

dotenv.config();

const configFilePath = process.env.CONFIG_FILE_PATH || 'config.json';

const fullConfigPath = path.resolve(__dirname, '..', configFilePath);

if (!fs.existsSync(fullConfigPath)) {
    throw new Error(`Config file not found at path: ${fullConfigPath}`);
}

function convertBigNumbersAndBooleans(jsonString: string): string {
    jsonString = jsonString.replace(/:\s*([\d]{15,})/g, (match, p1) => {
        return `: "${p1}"`;
    });

    jsonString = jsonString.replace(/:\s*"true"/g, ': true').replace(/:\s*"false"/g, ': false');

    return jsonString;
}

function readAndUpdateConfigFile(filePath: string) {
    try {
        let rawData = fs.readFileSync(filePath, 'utf8');
        rawData = convertBigNumbersAndBooleans(rawData);
        let config = JSON.parse(rawData);
        fs.writeFileSync(filePath, JSON.stringify(config, null, 4), 'utf8');
        return config;
    } catch (error) {
        console.error('Error reading or writing the JSON file:', error);
        throw error;
    }
}

const config = readAndUpdateConfigFile(configFilePath);

export const typedConfig: Config = config as Config;

const interval = Math.max(typedConfig.update_interval || 30, 30) * 1000;

const client = new Client({intents: [GatewayIntentBits.Guilds]});

client.once('ready', () => {
    console.log('Bot is online!');

    clearCache();

    if (Array.isArray(typedConfig.servers) && typedConfig.servers.length > 0) {
        const duplicates = checkDuplicateServers(typedConfig.servers);

        if (duplicates.length > 0) {
            console.error(`Duplicate servers found with ip:port: ${duplicates.join(', ')}`);
            client.destroy();
            process.exit(1);
        }
    } else {
        console.error('No servers found in the configuration');
        client.destroy();
        process.exit(1);
    }

    typedConfig.servers.forEach((server, index) => {
        if (!server.message_id) {
            sendMessage(client, server, typedConfig.channel_id.trim())
                .then(() => {
                    log(`Message sent ${server.ip_port}`);
                })
                .catch(error => {
                    log(`Error sending message: ${error}`);
                });
        } else {
            updateMessage(client, server, typedConfig.channel_id.trim())
                .then(() => {
                    log(`Message updated ${server.ip_port}`);
                })
                .catch(error => {
                    log(`Error updating message: ${error}`);
                });
        }

        setInterval(() => {
            updateMessage(client, server, typedConfig.channel_id.trim())
                .then(() => {
                    log(`Message updated ${server.ip_port}`);
                })
                .catch(error => {
                    log(`Error updating message: ${error}`);
                });
        }, interval + index);
    });
});

client.on('interactionCreate', async interaction => {
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
            generateChart(stats)
                .then(image => {

                    let serverOnline = createServerOnline(serverName, image);

                    interaction.reply(
                        {
                            embeds: [serverOnline.embed],
                            files: [serverOnline.attachment],
                            ephemeral: true
                        }
                    );
                })
                .catch(() => {
                    interaction.reply({content: translate('error_stats'), ephemeral: true});
                })
        } else {
            await interaction.reply({content: translate('not_found_stats'), ephemeral: true});
        }
    }
});

function checkDuplicateServers(servers: Server[]): string[] {
    const seen = new Set();
    const duplicates: string[] = [];

    servers.forEach(server => {
        if (seen.has(server.ip_port)) {
            duplicates.push(server.ip_port);
        } else {
            seen.add(server.ip_port);
        }
    });

    return duplicates;
}

process.on('SIGINT', async () => {
    console.log('Bot is shutting down (SIGINT)');
    await client.destroy();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Bot is shutting down (SIGTERM)');
    await client.destroy();
    process.exit(0);
});

client.login(typedConfig.bot_token)
    .then(() => {
        console.log('Bot logged in successfully!');
    })
    .catch(err => {
        console.error('Error logging in: ', err);
        process.exit(1);
    });

