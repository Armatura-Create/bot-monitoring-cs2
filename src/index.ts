import * as dotenv from 'dotenv';
import {Client, GatewayIntentBits} from 'discord.js';
import {log} from './utils/utils';
import {sendMessage, sendOneMessage, updateMessage, updateOneMessage} from './bot';
import {Config} from "./types/Config";
import path from "path";
import fs from "fs";
import {Server} from "./types/Server";
import {clearCache} from "./cache/cacheUtil";
import {handleInteractions} from "./commands/interactionHandler";

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

function updateMissingFields(config: Config): Config {
    if (!config.hasOwnProperty('compact')) {
        config.compact = false;
    }

    if (!config.hasOwnProperty('send_new_message_if_failed')) {
        config.send_new_message_if_failed = false;
    }

    if (!config.compact_config) {
        config.compact_config = {};
    }

    if (!config.compact_config.footer) {
        config.compact_config.footer = {};
    }

    if (!config.compact_config.footer.icon) {
        config.compact_config.footer.icon = 'https://cdn.patchbot.io/games/11/counter_strike_go_sm.webp';
    }

    if (!config.compact_config.color) {
        config.compact_config.color = '#FFFFFF';
    }

    if (!config.compact_config.image_author) {
        config.compact_config.image_author = '';
    }

    if (!config.compact_config.message_id) {
        config.compact_config.message_id = '';
    }

    if (!config.update_interval) {
        config.update_interval = 30;
    }

    config.servers.forEach((server: any) => {
        if (!server.hasOwnProperty('show_status')) {
            server.show_status = true;
        }

        if (!server.map_settings) {
            server.map_settings = {active: false};
        }

        if (!server.buttons) {
            server.buttons = {};
        }
        if (!server.buttons.connect) {
            server.buttons.connect = {active: false, url: ''};
        }
        if (!server.buttons.players) {
            server.buttons.players = {active: false};
        }
        if (!server.buttons.online_stats) {
            server.buttons.online_stats = {active: false};
        }
    });

    return config;
}

function readAndUpdateConfigFile(filePath: string): Config {
    try {
        let rawData = fs.readFileSync(filePath, 'utf8');
        rawData = convertBigNumbersAndBooleans(rawData);
        let config = JSON.parse(rawData) as Config;

        config = updateMissingFields(config);

        fs.writeFileSync(filePath, JSON.stringify(config, null, 4), 'utf8');

        return config;
    } catch (error) {
        console.error('Error reading or writing the JSON file:', error);
        throw error;
    }
}

export const typedConfig = readAndUpdateConfigFile(fullConfigPath);

const interval = Math.max(typedConfig.update_interval || 30, 30) * 1000;

const client = new Client({intents: [GatewayIntentBits.Guilds]});

client.once('ready', () => {
    console.log('Bot is online!');

    handleInteractions(client);

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

    if (!typedConfig.compact) {
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
    } else {
        if (!typedConfig.compact_config.message_id) {
            sendOneMessage(client, typedConfig.servers, typedConfig.channel_id.trim())
                .then(() => {
                    log('One message sent');
                })
                .catch(error => {
                    log(`Error sending one message: ${error}`);
                });
        } else {
            updateOneMessage(client, typedConfig.servers, typedConfig.channel_id.trim())
                .then(() => {
                    log('One message updated');
                })
                .catch(error => {
                    log(`Error updating one message: ${error}`);
                });
        }

        setInterval(() => {
            updateOneMessage(client, typedConfig.servers, typedConfig.channel_id.trim())
                .then(() => {
                    log('One message updated');
                })
                .catch(error => {
                    log(`Error updating one message: ${error}`);
                });
        }, interval);
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

