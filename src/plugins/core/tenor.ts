import BasePlugin from "../base_plugin"

class TenorPlugin extends BasePlugin {
    constructor() {
        super('tenor')
    }

    onInit(): void {
        console.log("tenor plugin loaded")
        require('./external/tenor_embed.js')
    }

    onEnrichUrl(url: string): string | null {
        if (url.startsWith('https://tenor.com/search/') || url === 'https://tenor.com/embed.js') {
            // do not double anchor tag the urls we inserted in the embedd
            return url
        }
        const tenorMatch = url.match('https://tenor.com/view/[^ ]+\-([0-9]+)')
        if (!tenorMatch) {
            console.log("url does not match!!!!!!!!!!! url=" + url)
            return null
        }
        const tenorId = tenorMatch[1]
        console.log("tenor got message")
        // https://tenor.com/view/mean-people-rude-ignorant-spiteful-hurtful-gif-19113534
        return `
        <div class="tenor-gif-embed" data-postid="${tenorId}" data-share-method="host" data-aspect-ratio="1" data-width="100%">
            <a href="${url}">Mean People Rude GIF</a>
            from
            <a href="https://tenor.com/search/mean+people-gifs">Mean People GIFs</a>
        </div>
        `
    }
}

export default TenorPlugin
