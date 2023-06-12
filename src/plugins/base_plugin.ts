class BasePlugin {
    pluginName: string

    constructor(pluginName: string) {
        this.pluginName = pluginName
    }

    onInit(): void {
    }

    onTick(): void {
    }

    onSwitchChannel(oldServer: string, oldChannel: string, newServer: string, newChannel: string): void {
    }

    onKeydown(event: KeyboardEvent): void {
    }
}

export default BasePlugin