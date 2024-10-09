import {Server} from "./Server";
import {Player} from "gamedig/index";

export interface ServerDto {
    status: 'ONLINE' | 'OFFLINE';
    name: string;
    map: string;
    maxPlayers: number;
    players: Player[];
}

export type CombinedServer = Server & ServerDto;
