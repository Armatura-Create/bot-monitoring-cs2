import * as fs from 'fs';
import * as path from 'path';
import {ServerDto} from "../types/ServerDto";

// Путь к файлу кэша
const cacheFilePath = path.join(__dirname, 'cache.json');
const cacheLastAttachmentMapsFilePath = path.join(__dirname, 'cache_maps.json');

interface CacheData {
    [key: string]: ServerDto
}

interface CacheLastAttachmentMaps {
    [key: string]: string
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

export function updateCache(ip_port: string, serverData: ServerDto): void {
    const cache = loadCache();
    cache[ip_port] = serverData;
    saveCache(cache, cacheFilePath);
}

export function updateCacheLastAttachmentMaps(ip_port: string, map: string): void {
    const cache = loadCacheLastAttachmentMaps();
    cache[ip_port] = map;
    saveCache(cache, cacheLastAttachmentMapsFilePath);
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
