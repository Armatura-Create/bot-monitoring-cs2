import {Server} from "./Server";

export interface ServerDto {
    status: 'ONLINE' | 'OFFLINE';
    name: string;
    map: string;
    players: string;
}

export type CombinedServer = Server & ServerDto;
