export interface Server {
    server_name?: string;
    message_id?: string;
    url?: string;
    color: string;
    connect_link: string;
    image_thumbnail?: string;
    image_author?: string;
    image_map?: string;
    footer?: {
        icon?: string;
    };
}
