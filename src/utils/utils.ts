import fs from 'fs';
import path from 'path';
import {ColorResolvable} from "discord.js";
import {Server} from "../types/Server";
import {typedConfig} from "../index";
import {Config} from "../types/Config";

export function updateConfig_Server(server: Server): void {
    const serverIndex = typedConfig.servers.findIndex(s => s.ip_port === server.ip_port);
    if (serverIndex !== -1) {
        log(`Update server messageId: ${server.ip_port}`, server.message_id);
        typedConfig.servers[serverIndex] = server;

        const configFilePath = process.env.CONFIG_FILE_PATH || 'config.json';

        fs.writeFileSync(path.join(__dirname, '../../', configFilePath), JSON.stringify(typedConfig, null, 4));
    }
}

export function updateConfig(config: Config): void {
    const configFilePath = process.env.CONFIG_FILE_PATH || 'config.json';
    fs.writeFileSync(path.join(__dirname, '../../', configFilePath), JSON.stringify(config, null, 4));
}

export function hexToColorResolvable(color: string): ColorResolvable {
    if (color.startsWith('#') && color.length === 7) {
        return color as ColorResolvable;
    } else {
        throw new Error('Invalid color format');
    }
}

export function getFormattedDate(locale: string): string {
    const now = new Date();
    return new Intl.DateTimeFormat(locale, {
        timeZone: typedConfig.time_zone,
        month: 'short',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric'
    }).format(now);
}

export function isValidUrl(imageUrl: string): boolean {
    const urlPattern = /^(https?:\/\/[^\s]+)$/i;
    return urlPattern.test(imageUrl);
}

export function log(message: string, object?: any | null): void {
    if (typedConfig.debug) {
        if (object != null) {
            console.log(message, object);
        } else {
            console.log(message);
        }
    }
}
