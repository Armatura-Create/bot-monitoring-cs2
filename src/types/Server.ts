export interface Server {
    server_name?: string;
    message_id?: string;
    url?: string;
    color: string;
    ip_port: string;
    image_thumbnail?: string;
    image_author?: string;
    map_settings?: {
        active: boolean;
        image?: string;
    };
    footer?: {
        icon?: string;
    };
    show_status?: boolean;
    buttons?: {
        connect?: {
            active: boolean;
            url: string;
        },
        players?: {
            active: boolean;
        },
        online_stats? : {
            active: boolean;
        }
    }
}
