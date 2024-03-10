import BasePlugin from '../base_plugin'

import '../../css/plugins/search_messages.css'

class SearchMessagesPlugin extends BasePlugin {
  /**
     * the main div holding basically the whole view port
     *
     * it has the grid that splits the whole menu
     * we can insert our search pane at the end of this div
     * and then align our selfs in the grid
     */
  layoutDiv: HTMLElement

  /**
     * pluginButtonInputButtonContainer
     *
     * div inside the message send from
     * designed to be inserted with plugin buttons
     */
  pluginButtonInputButtonContainer: HTMLElement

  /**
     * searchBoxDom
     *
     * is the visible box with
     * search and result previews
     */
  searchBoxDom: HTMLElement

  /**
     * searchPaneDom
     *
     * is the whole pane
     * more than the visible popup
     * it is responsible for aligning the
     * actual searchBoxDom
     * to the bottom right
     */
  searchPaneDom: HTMLElement
  searchInput: HTMLInputElement
  searchForm: HTMLInputElement
  toggleButton: HTMLElement
  messageInp: HTMLInputElement

  constructor () {
    super('search_messages')
  }

  onInit (): void {
    this.pluginButtonInputButtonContainer = document.querySelector('.plugin-input-buttons')
    this.layoutDiv = document.querySelector('.layout')

    this.pluginButtonInputButtonContainer.insertAdjacentHTML('beforeend', '<div class="search-messages-toggle"></div>')
    this.layoutDiv.insertAdjacentHTML(
      'beforeend',
            `<div class="search-messages-pane">
            <div class="search-messages-box ui-box-rounding">
                <form action="" class="search-messages-form">
                    <input type="text" name="search-messages-input" id="search-messages-input" placeholder="Search messasges">
                </form>
                <hr>
                <div class="results-preview"></div>
            </div> <!-- search-messages-box -->
            </div> <!-- search-messages-pane -->`
    )

    this.searchBoxDom = document.querySelector('.search-messages-box')
    this.searchPaneDom = document.querySelector('.search-messages-pane')
    this.searchInput = document.querySelector('#search-messages-input')
    this.searchForm = document.querySelector('.search-messages-form')
    this.toggleButton = document.querySelector('.search-messages-toggle')
    this.messageInp = document.querySelector('#message-input')

    this.searchForm.addEventListener('submit', (event) => this.onSearchSubmit(event))
    this.searchInput.addEventListener('keyup', (event) => this.onSearchKey(event))
    document.addEventListener('keydown', (event) => this.onDocumentKey(event))
    document.addEventListener('click', (event) => this.onGlobalClick(event))
    this.toggleButton.addEventListener('click', () => this.toggle())
  }

  onDocumentKey (event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.hide()
    }
  }

  toggle (): void {
    if (this.searchPaneDom.classList.contains('active')) {
      this.hide()
    } else {
      this.show()
    }
  }

  hide (): void {
    if (!this.searchPaneDom.classList.contains('active')) {
      return
    }
    this.searchPaneDom.classList.remove('active')
    this.messageInp.focus()
  }

  show (): void {
    this.searchPaneDom.classList.add('active')
    this.searchInput.focus()
  }

  onGlobalClick (event: MouseEvent): void {
    // cast EventTarget to HTMLElement
    const clickTarget: HTMLElement | null = event.target as HTMLElement | null
    if (clickTarget == null) {
      return
    }
    if (clickTarget.innerHTML === '') {
      return
    }
    if (!this.searchBoxDom.contains(clickTarget)) {
      // clicked outside of the
      // search messages box
      // hide it
      this.hide()
    }
  }

  onSearchKey (event: KeyboardEvent): void {
    // do not reset list while arrow key selecting elements
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      return
    }
    const search: string = this.searchInput.value
    console.log(`searching for: ${search}`)
  }

  onSearchSubmit (event: SubmitEvent): void {
    event.preventDefault()
    const search: string = this.searchInput.value
    console.log(`todo do we even need this searching for: ${search}`)
  }
}

export default SearchMessagesPlugin
