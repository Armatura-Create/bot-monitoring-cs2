import {GameDig} from 'gamedig';
import {ServerDto} from "../types/ServerDto";
import {log} from "./utils";

// Функция для запроса данных о сервере
export async function getServerData(ip: string, port: number): Promise<ServerDto | null> {
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
            players: `${state.players.length} / ${state.maxplayers}`
        };

        //TODO Save server data to cache

        return result;
    } catch (error) {
        log('Error fetching server data:', error);

        log('Fetching server data from cache');

        return null;
    }
}
