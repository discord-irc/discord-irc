class BasePlugin {
    pluginName: string
    active: boolean

    constructor(pluginName: string) {
        this.pluginName = pluginName
        this.active = false
    }

    isActive(): boolean {
        return this.active
    }

    deactivate(): void {
        this.active = false
    }

    activate(): void {
        this.active = true
    }

    onInit(): void {
    }

    onTick(): void {
    }

    onPreEnrichText(text: string): string {
        return text
    }

    onEnrichUrl(url: string): string | null {
        return null
    }

    onSwitchChannel(oldServer: string, oldChannel: string, newServer: string, newChannel: string): void {
    }

    onKeydown(event: KeyboardEvent): void {
    }
}

export default BasePlugin