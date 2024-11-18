import {GameDig} from 'gamedig';
import {ServerDto} from "../types/ServerDto";
import {log} from "./utils";
import {getCacheData, updateCache} from "../cache/cacheUtil";
import {Server} from "../types/Server";

export async function getServerData(server: Server): Promise<ServerDto> {

    const [ip, port] = server.ip_port.split(':');
    const serverPort = Number.parseInt(port);

    try {
        const state = await GameDig.query({
            type: 'csgo',
            host: ip,
            port: serverPort,
            maxRetries: 2,
            socketTimeout: 1000,
            attemptTimeout: 1000
        });

        const result: ServerDto = {
            status: 'ONLINE',
            name: server.server_name && server.server_name !== '' ? server.server_name : state.name,
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
                name: server.server_name && server.server_name !== '' ? server.server_name : 'Unknown',
                map: 'Unknown',
                maxPlayers: 0,
                players: []
            };
        }
    }
}
