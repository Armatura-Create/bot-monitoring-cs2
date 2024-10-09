export interface Server {
    server_name?: string;
    message_id?: string;
    url?: string;
    color: string;
    ip_port: string;
    image_thumbnail?: string;
    image_author?: string;
    image_map?: string;
    footer?: {
        icon?: string;
    };
    buttons?: {
        connect?: {
            active: boolean;
            url: string;
        },
        players?: {
            active: boolean;
        }
    }
}
