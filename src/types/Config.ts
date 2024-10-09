import {Server} from "./Server";

export interface Config {
    bot_token: string;
    use_plugin: boolean;
    locale: string;
    update_interval: number;
    chanel_id: string;
    debug: boolean;
    servers: Server[];
}
