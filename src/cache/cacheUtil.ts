import * as fs from 'fs';
import * as path from 'path';
import {ServerDto} from "../types/ServerDto";

// Путь к файлу кэша
const cacheFilePath = path.join(__dirname, 'cache.json');

interface CacheData {
    [key: string]: ServerDto
}

export function loadCache(): CacheData {
    if (!fs.existsSync(cacheFilePath)) {
        fs.writeFileSync(cacheFilePath, JSON.stringify({}, null, 4), 'utf-8');
        return {};
    }

    const rawData = fs.readFileSync(cacheFilePath, 'utf-8');
    return JSON.parse(rawData) as CacheData;
}

export function saveCache(cache: CacheData): void {
    fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 4), 'utf-8');
}

// Обновление данных в кэше
export function updateCache(ip_port: string, serverData: ServerDto): void {
    const cache = loadCache();
    cache[ip_port] = serverData;
    saveCache(cache);
}

// Получение данных из кэша по ip_port
export function getCacheData(ip_port: string): ServerDto | null {
    const cache = loadCache();
    return cache[ip_port] || null;
}
