import {AttachmentBuilder, EmbedBuilder} from "discord.js";

export interface EmbedWithAttachment {
    embedBuilder: EmbedBuilder,
    attachment?: AttachmentBuilder | null
}
