import {Server} from "./Server";

export interface Config {
    bot_token: string;
    use_plugin: boolean;
    locale: string;
    update_interval: number;
    channel_id: string;
    debug: boolean;
    servers: Server[];
}
