import {GameDig} from 'gamedig';
import {ServerDto} from "../types/ServerDto";
import {log} from "./utils";
import {getCacheData, updateCache} from "../cache/cacheUtil";

// Функция для запроса данных о сервере
export async function getServerData(ip: string, port: number): Promise<ServerDto> {
    try {
        const state = await GameDig.query({
            type: 'csgo',
            host: ip,
            port: port,
            maxRetries: 2,
            socketTimeout: 1000,
            attemptTimeout: 1000
        });

        const result: ServerDto = {
            status: 'ONLINE',
            name: state.name,
            map: state.map,
            maxPlayers: state.maxplayers,
            players: state.players
        };

        updateCache(`${ip}:${port}`, result);

        return result;
    } catch (error) {
        log('Fetching server data from cache');

        const cacheData = getCacheData(`${ip}:${port}`);

        if (cacheData != null) {
            cacheData.status = 'OFFLINE';
            cacheData.players = [];

            return cacheData;
        } else {
            return {
                status: 'OFFLINE',
                name: 'Unknown',
                map: 'Unknown',
                maxPlayers: 0,
                players: []
            };
        }
    }
}
