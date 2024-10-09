import {Client, GatewayIntentBits} from 'discord.js';
import {log} from './utils/utils';
import {sendMessage, updateMessage} from './bot';
import config from '../config.json';
import {Config} from "./types/Config";

const typedConfig: Config = config as Config;

const interval = Math.max(typedConfig.update_interval || 30, 30) * 1000;

const client = new Client({intents: [GatewayIntentBits.Guilds]});

client.once('ready', () => {
    console.log('Bot is online!');

    typedConfig.servers.forEach(server => {
        if (!server.message_id) {
            sendMessage(client, server, typedConfig.chanel_id.trim())
                .then(() => {
                    log(`Message sent ${server.connect_link}`);
                })
                .catch(error => {
                    log(`Error sending message: ${error}`);
                });
        } else {
            updateMessage(client, server, typedConfig.chanel_id.trim())
                .then(() => {
                    log(`Message updated ${server.connect_link}`);
                })
                .catch(error => {
                    log(`Error updating message: ${error}`);
                });
        }

        setInterval(() => {
            updateMessage(client, server, typedConfig.chanel_id.trim())
                .then(() => {
                    log(`Message updated ${server.connect_link}`);
                })
                .catch(error => {
                    log(`Error updating message: ${error}`);
                });
        }, interval);
    });
});

client.login(typedConfig.bot_token);

process.on('SIGTERM', () => {
    console.log('Bot is shutting down');
    client.destroy();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Bot is shutting down');
    client.destroy();
    process.exit(0);
});
