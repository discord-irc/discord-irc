/*
    emoteMappings

    mapping emote names to their cdn id on discord

    if you want to get new emotes send the emote with \:emotename:
    from discord to get its id. Then run ./download_emotes.sh
    to download the png files from the discord cdn.

    The cdn urls look like this:
    https://cdn.discordapp.com/emojis/572499997178986510.png

    And adjust the style.css to add a class for every emote you add that
    then uses the downloaded image as background image. Like this:

    .emote.gigachad {
        background-image: url("img/emotes/gigachad.png");
    }
*/
const emoteMappings: Record<string, string> = {
  wormy: '1055668586691178568',
  ass: '1010609071902171226',
  trollchungus: '1010641652920098887',
  gigachad: '960830678465933403',
  justatest: '572499997178986510',
  feelsbadman: '391614770303991808',
  feelsamazingman: '391614823655538699',
  feelsgoodman: '568782509421232163',
  greenthing: '623706333677617203',
  fuckyousnail: '691290240266141766',
  monkalaugh: '757185761840857109',
  monkaS: '397449067661099008',
  nouis: '745612528834445313',
  troll: '490644344341135380',
  rust: '920765596289880074',
  pepeH: '462735917006848020',
  pepedead: '773232467658145822',
  '5492_EzPepe': '980468999554994188',
  poggers2: '1008007455936094328',
  poggers: '546812233867329556',
  hisnail: '768893210726367232',
  f3: '397431188941438976',
  f4: '397431204552376320',
  angry: '395753905650270232',
  banhammer: '392813948858269696',
  deviltee: '849753391374008370',
  cateeholic: '849742650076823577',
  bluekitty: '346683497919807488',
  bluestripe: '346683497802366976',
  boo: '395753917062971402',
  brownbear: '346683497701834762',
  cammo: '346683496842133504',
  cammostripes: '346683496476966913',
  ddnet: '391727274824826880',
  ddnet_lgbt: '854799059402227782',
  flag_unk: '519687837868883993',
  frozen: '385929852022161418',
  fury: '395753924432494596',
  gg: '422062383687794689',
  giftee_green: '783751485736747008',
  giftee_red: '783751448664080466',
  happy: '395753933089406976',
  heartw: '395753947396046850',
  hey: '395753956711858196',
  kek: '623709640789852179',
  jaouis: '771825988556292096',
  lol: '460429405328506900',
  mmm: '395753965410582538',
  tee_thinking: '478629518358085653',
  owo: '1154794204871008397',
  pepeW: '1132828868982624256'
}

/*
    animatedEmoteMappings

    Similar to emoteMappings it is mapping emote names to discord cdn ids
    The difference is that these are not static pngs but animated gif files.

    Their cdn urls look like this:
    https://cdn.discordapp.com/emojis/1082715870893195274.gif?size=80&quality=lossless

    We do not download the gifs to render them on our side.
    We just display the discord cdn link as a img tag for now.

    They do have a different format than the regular emotes.
    When sent to discord they will look like this <a:Catxplosion:1082715870893195274>
    while regular emotes look like this <:troll:490644344341135380>
*/
const animatedEmoteMappings: Record<string, string> = {
  Catxplosion: '1082715870893195274',
  nekospin: '1039804721378111548',
  whooo: '631548554267328514',
  yeee: '631547536288514051',
  hotcoffee: '635654970275921960',
  danceclown: '773516781158662144',
  cagentpatpat: '785420444924248085',
  kekw_1: '1022786101443829770',
  kekw_2: '1022786191868842014',
  banouis: '1063776702544744498',
  pepewideeyes: '1022785384146550885',
  Deadneko: '823430684680781879',
  aPES_RoastedPepe: '596259843174563840',
  pepeFASTJAM: '799388844491276311',
  POGGERS2: '882364244065157210'
}

const unicodeEmoteMappings: Record<string, string> = {
  checkmarkbutton: '✅',
  checkmark: '✔',
  crossmark: '❌',
  rocket: '🚀',
  rainbow_flag: '🏳️‍🌈',
  deciduous_tree: '🌳',
  bug: '🐛',
  penguin: '🐧',
  joy: '😂',
  see_no_evil: '🙈',
  red_heart: '❤',
  '+1': '👍',
  '-1': '👎',
  brain: '🧠',
  eye: '👁',
  tongue: '👅',
  facepalm: '🤦',
  shrug: '🤷',
  beer: '🍺',
  wine: '🍷',
  dollar: '💵',
  heavy_dollar_sign: '💲',
  money_with_wings: '💸',
  moai: '🗿',
  kubernetes: '☸',
  trademark: '™',
  sos: '🆘',
  snowflake: '❄',
  sunglasses: '🕶',
  robot: '🤖',
  fr: '🇫🇷',
  de: '🇩🇪',
  ru: '🇷🇺',
  ua: '🇺🇦'
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

export const getUnicodeByName = (unicodeName: string): string | null => {
  return unicodeEmoteMappings[unicodeName] || null
}

/**
 * returns custom discord emotes and unicode emote names
 *
 * if you want only discord custom use
 * getDiscordEmoteNames()
 *
 * @param type either custom or animated
 * @returns array of emote names as strings
 */
export const getAllEmoteNames = (type: string = 'custom'): string[] => {
  let lookupObj = emoteMappings
  if (type === 'animated') {
    lookupObj = animatedEmoteMappings
  }
  return Object.keys(lookupObj).concat(Object.keys(unicodeEmoteMappings))
}

/**
 * Returns all custom discord emotes
 * no standard unicode emotes
 *
 * if you want both discord custom and unicode emotes use
 * getAllEmoteNames()
 *
 * @param type either custom or animated
 * @returns array of emote names as strings
 */
export const getDiscordEmoteNames = (type: string = 'custom'): string[] => {
  let lookupObj = emoteMappings
  if (type === 'animated') {
    lookupObj = animatedEmoteMappings
  }
  return Object.keys(lookupObj)
}
