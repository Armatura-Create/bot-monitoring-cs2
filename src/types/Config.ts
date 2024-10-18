import {Server} from "./Server";

export interface Config {
    type: 'individual_messages' | 'one_message';
    one_message_config: {
        message_id: string;
        color: string;
        image_author: string;
    };
    bot_token: string;
    use_plugin: boolean;
    locale: string;
    update_interval: number;
    one_message_id: string;
    channel_id: string;
    debug: boolean;
    time_zone: string;
    servers: Server[];
}
