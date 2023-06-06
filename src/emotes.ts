const emoteMappings: Record<string, string> = {
    'wormy': '1055668586691178568',
    'ass': '1010609071902171226',
    'trollchungus': 'trollchungus',
    'gigachad': '960830678465933403',
    'justatest': '572499997178986510',
    'pepeH': '46273591700684802',
}

/*
    justatest => 572499997178986510
*/
export const getDiscordEmoteIdByName = (emoteName: string): string | null => {
    return emoteMappings[emoteName] || null
}

/*
    572499997178986510 => justatest
*/
export const getDiscordEmoteNameById = (emoteId: string): string | null => {
    return Object.keys(emoteMappings).find(key => emoteMappings[key] === emoteId) || null
}
