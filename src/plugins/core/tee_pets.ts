import BasePlugin from '../base_plugin'

import '../../css/plugins/tee_pets.css'

class TeePetsPlugin extends BasePlugin {
  layoutDiv: HTMLElement

  constructor () {
    super('tee_pets')
  }

  onInit (): void {
    console.log('tee pets init ...')
    this.layoutDiv = document.querySelector('.layout')
    this.layoutDiv.insertAdjacentHTML(
      'beforeend',
      `
      <div class="tee-pets-world">
        <div class="tee-pet"></div>
      </div> <!-- tee-pets-world -->
      `
    )
  }

  onTick (): void {
  }
}

export default TeePetsPlugin
