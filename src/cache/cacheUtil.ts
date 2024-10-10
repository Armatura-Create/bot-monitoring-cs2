import * as fs from 'fs';
import * as path from 'path';
import {ServerDto} from "../types/ServerDto";
import {typedConfig} from "../index";

// Путь к файлу кэша
const cacheFilePath = path.join(__dirname, 'cache.json');
const cacheLastAttachmentMapsFilePath = path.join(__dirname, 'cache_maps.json');
const cacheOnlineStats = path.join(__dirname, 'cache_online_stats.json');

interface CacheData {
    [key: string]: ServerDto
}

interface CacheLastAttachmentMaps {
    [key: string]: string
}

interface CacheOnlineStats {
    [key: string]: {
        [key: string]: {
            [key: string]: number
        }
    }
}

export function loadCache(): CacheData {
    if (!fs.existsSync(cacheFilePath)) {
        fs.writeFileSync(cacheFilePath, JSON.stringify({}, null, 4), 'utf-8');
        return {};
    }

    const rawData = fs.readFileSync(cacheFilePath, 'utf-8');
    return JSON.parse(rawData) as CacheData;
}

export function loadCacheLastAttachmentMaps(): CacheLastAttachmentMaps {
    if (!fs.existsSync(cacheLastAttachmentMapsFilePath)) {
        fs.writeFileSync(cacheLastAttachmentMapsFilePath, JSON.stringify({}, null, 4), 'utf-8');
        return {};
    }

    const rawData = fs.readFileSync(cacheLastAttachmentMapsFilePath, 'utf-8');
    return JSON.parse(rawData) as CacheLastAttachmentMaps;
}

export function loadCacheOnlineStats() : CacheOnlineStats {
    if (!fs.existsSync(cacheOnlineStats)) {
        fs.writeFileSync(cacheOnlineStats, JSON.stringify({}, null, 4), 'utf-8');
        return {};
    }

    const rawData = fs.readFileSync(cacheOnlineStats, 'utf-8');
    return JSON.parse(rawData) as CacheOnlineStats;
}

export function updateCache(ip_port: string, serverData: ServerDto): void {
    const cache = loadCache();
    cache[ip_port] = serverData;
    saveCache(cache, cacheFilePath);
    updateOnlineStats(ip_port, serverData.players.length);
}

export function updateCacheLastAttachmentMaps(ip_port: string, map: string): void {
    const cache = loadCacheLastAttachmentMaps();
    cache[ip_port] = map;
    saveCache(cache, cacheLastAttachmentMapsFilePath);
}

function updateOnlineStats(serverIp: string, currentPlayers: number) {
    const now = new Date();
    const currentHour = new Intl.DateTimeFormat(typedConfig.locale, {
        timeZone: typedConfig.time_zone,
        hour: '2-digit',
        hour12: false,
    }).format(now);

    const currentDate = new Intl.DateTimeFormat(typedConfig.locale, {
        timeZone: typedConfig.time_zone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(now);

    const cache = loadCacheOnlineStats();

    if (!cache[serverIp]) {
        cache[serverIp] = {};
    }

    if (!cache[serverIp][currentDate]) {
        cache[serverIp][currentDate] = {};
    }

    const currentMaxOnline = cache[serverIp][currentDate][currentHour] || 0;

    if (currentPlayers >= currentMaxOnline) {
        cache[serverIp][currentDate][currentHour] = currentPlayers;
    }

    fs.writeFileSync(cacheOnlineStats, JSON.stringify(cache, null, 4), 'utf-8');
}

export function getOnlineStats(serverIp: string, date: string): { [key: string]: number } {
    const cache = loadCacheOnlineStats();
    return cache[serverIp]?.[date] || {};
}

export function getCacheData(ip_port: string): ServerDto | null {
    const cache = loadCache();
    return cache[ip_port] || null;
}

export function getCacheLastAttachmentMaps(ip_port: string): string | null {
    const cache = loadCacheLastAttachmentMaps();
    return cache[ip_port] || null;
}

export function saveCache(cache: CacheData | CacheLastAttachmentMaps, pathFile: string): void {
    fs.writeFileSync(pathFile, JSON.stringify(cache, null, 4), 'utf-8');
}

export function clearCache(): void {
    fs.writeFileSync(cacheFilePath, JSON.stringify({}, null, 4), 'utf-8');
    fs.writeFileSync(cacheLastAttachmentMapsFilePath, JSON.stringify({}, null, 4), 'utf-8');
}
