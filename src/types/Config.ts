import {Server} from "./Server";

export interface Config {
    compact: boolean;
    compact_config: {
        message_id?: string;
        color?: string;
        image_author?: string;
        footer?: {
            icon?: string;
        };
    };
    bot_token: string;
    use_plugin: boolean;
    locale: string;
    update_interval: number;
    channel_id: string;
    debug: boolean;
    time_zone: string;
    servers: Server[];
}
