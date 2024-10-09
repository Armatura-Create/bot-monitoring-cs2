import fs from 'fs';
import path from 'path';
import {ColorResolvable} from "discord.js";
import {Config} from "../types/Config";
import {Server} from "../types/Server";
import * as dotenv from "dotenv";

dotenv.config();

const configFilePath = process.env.CONFIG_FILE_PATH || 'config.json'; // Установить путь по умолчанию, если переменной нет

const fullConfigPath = path.resolve(__dirname, '../..', configFilePath);

if (!fs.existsSync(fullConfigPath)) {
    throw new Error(`Config file not found at path: ${fullConfigPath}`);
}

const config = require(fullConfigPath);

const typedConfig: Config = config as Config;

export function updateConfig(server: Server): void {
    const serverIndex = typedConfig.servers.findIndex(s => s.ip_port === server.ip_port);
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
