const emoteMappings: Record<string, string> = {
    'wormy': '1055668586691178568',
    'ass': '1010609071902171226',
    'trollchungus': '1010641652920098887',
    'gigachad': '960830678465933403',
    'justatest': '572499997178986510',
    'feelsbadman': '391614770303991808',
    'feelsamazingman': '391614823655538699',
    'greenthing': '623706333677617203',
    'monkalaugh': '757185761840857109',
    'monkaS': '397449067661099008',
    'nouis': '745612528834445313',
    'troll': '490644344341135380',
    'pepeH': '46273591700684802',
    'poggers2': '46273591700684802',
    'hisnail': '768893210726367232',
    'f3': '397431188941438976',
    'f4': '397431204552376320',
    'angry': '395753905650270232',
    'banhammer': '392813948858269696',
    'bluekitty': '34668349791980748',
    'bluestripe': '346683497802366976',
    'boo': '395753917062971402',
    'brownbear': '346683497701834762',
    'cammo': '346683496842133504',
    'cammostripes': '346683496476966913',
    'ddnet': '391727274824826880',
    'ddnet_lgbt': '854799059402227782',
    'flag_unk': '519687837868883993',
    'frozen': '385929852022161418',
    'fury': '395753924432494596',
    'gg': '422062383687794689',
    'giftee_green': '783751485736747008',
    'giftee_red': '783751448664080466',
    'happy': '395753933089406976',
    'heartw': '395753947396046850',
    'hey': '395753956711858196',
    'kek': '623709640789852179',
    'jaouis': '771825988556292096',
    'lol': '460429405328506900',
    'mmm': '395753965410582538',

    'rocket': 'rocket',
}
// TODO: :fuckyousnail: :monkalaugh: :monkaS: :troll: :nouis:
const animatedEmoteMappings: Record<string, string> = {
    'Catxplosion': '1082715870893195274', // https://cdn.discordapp.com/emojis/1082715870893195274.gif?size=80&quality=lossless
    'nekospin': '1039804721378111548',
    'whooo': '631548554267328514',
    'yeee': '631547536288514051',
    'hotcoffee': '635654970275921960',
    'danceclown': '773516781158662144',
    'cagentpatpat': '785420444924248085',
    'kekw_1': '1022786101443829770',
    'kekw_2': '1022786191868842014',
    'banouis': '1063776702544744498',
    'pepewideeyes': '1022785384146550885',
    'Deadneko': '823430684680781879',
    'aPES_RoastedPepe': '596259843174563840',
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
