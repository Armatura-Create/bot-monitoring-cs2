import fs from 'fs';
import path from 'path';
import config from '../../config.json';
import {ColorResolvable} from "discord.js";
import {Config} from "../types/Config";
import {Server} from "../types/Server";

const typedConfig: Config = config as Config;

export function updateConfig(server: Server): void {
    const serverIndex = typedConfig.servers.findIndex(s => s.connect_link === server.connect_link);
    if (serverIndex !== -1) {
        typedConfig.servers[serverIndex] = server;
        fs.writeFileSync(path.join(__dirname, '../../config.json'), JSON.stringify(typedConfig, null, 4));
    }
}

export function hexToColorResolvable(color: string): ColorResolvable {
    if (color.startsWith('#') && color.length === 7) {
        return color as ColorResolvable; // Преобразуем строку HEX в ColorResolvable
    } else {
        throw new Error('Invalid color format'); // Можно добавить обработку ошибок
    }
}

export function getFormattedDate(locale: string): string {
    const now = new Date();
    return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
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
