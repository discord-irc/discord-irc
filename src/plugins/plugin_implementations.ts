import { AlertMessage } from "../socket.io";
import BasePlugin from "./base_plugin";
import { getPluginThatImplements, getPlugins } from "./plugins";

export type PluginImplementation = 'alert'

export class AlertPluginImplementation extends BasePlugin {
  constructor(pluginName: string) {
    super(pluginName)
    this.implementations.push('alert')
  }

  addAlert (msg: AlertMessage): void {
  }
}

export const getPluginThatImplementsAlert = (): AlertPluginImplementation | null => {
  return getPluginThatImplements('alert') as AlertPluginImplementation | null
}

export type IPluginImplementation = AlertPluginImplementation | BasePlugin
