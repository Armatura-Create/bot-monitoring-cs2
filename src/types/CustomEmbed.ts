import {ActionRowBuilder, AttachmentBuilder, ButtonBuilder, EmbedBuilder} from "discord.js";

export interface CustomEmbed {
    embedBuilder: EmbedBuilder,
    attachment?: AttachmentBuilder | null
    components?: ActionRowBuilder<ButtonBuilder> | null
}
