import {Server} from "./Server";

export interface Config {
    bot_token: string;
    use_plugin: boolean | string;
    locale: string;
    update_interval: number;
    channel_id: string;
    debug: boolean | string;
    time_zone: string;
    servers: Server[];
}
