import {APIEmbedField, EmbedBuilder} from "discord.js";
import translate from "../translator/translator";

interface Player {
    name?: string;
    raw?: { [key: string]: any };
    ping?: number;
    score?: number;
    team?: string;
    address?: string;
}

export function createPlayerStatsEmbed(playersData: Player[]) {
    return new EmbedBuilder()
        .setTitle(translate('players'))
        .addFields(
            playersData.map(playerData => createPlayerField(playerData))
        );
}

function createPlayerField(playerData: Player): APIEmbedField {

    console.log(playerData);

    const time = playerData.raw && formatTime(playerData.raw['time']) || '00:00';
    const score = playerData.raw && playerData.raw['score'] || playerData.score || 0;
    return {
        name: playerData.name || 'Unknown Name',
        value: `${translate('score')}: ${score}\n${translate('time_played')}: ${time}`,
        inline: true
    };
}

function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else {
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
}
