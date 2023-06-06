const emoteMappings: Record<string, string> = {
    'wormy': '1055668586691178568',
    'ass': '1010609071902171226',
    'trollchungus': '1010641652920098887',
    'gigachad': '960830678465933403',
    'justatest': '572499997178986510',
    'feelsbadman': '391614770303991808',
    'pepeH': '46273591700684802',
    'poggers2': '46273591700684802',
    'hisnail': '768893210726367232',
    'f3': '397431188941438976',
    'f4': '397431204552376320',
    'rocket': 'rocket',
}
// TODO: :fuckyousnail: :banhammer: :feelsamazingman: :greenthing: :kek: :monkalaugh: :monkaS: :troll: :nouis: 
const animatedEmoteMappings: Record<string, string> = {
    'Catxplosion': '1082715870893195274', // https://cdn.discordapp.com/emojis/1082715870893195274.gif?size=80&quality=lossless
}

/*
    justatest => 572499997178986510
*/
export const getDiscordEmoteIdByName = (emoteName: string, type: string = 'custom'): string | null => {
    let lookupObj = emoteMappings
    if (type === 'animated') {
        lookupObj = animatedEmoteMappings
    }
    return lookupObj[emoteName] || null
}

/*
    572499997178986510 => justatest
*/
export const getDiscordEmoteNameById = (emoteId: string, type: string = 'custom'): string | null => {
    let lookupObj = emoteMappings
    if (type === 'animated') {
        lookupObj = animatedEmoteMappings
    }
    return Object.keys(lookupObj).find(key => lookupObj[key] === emoteId) || null
}
