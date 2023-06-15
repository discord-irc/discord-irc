import { getDiscordEmoteNames } from "../../emotes"
import BasePlugin from "../base_plugin"

import '../../css/plugins/emoji_picker.css'

class EmojiPickerPlugin extends BasePlugin {

    /**
     * the main div holding basically the whole view port
     *
     * it has the grid that splits the whole menu
     * we can insert our emoji pane at the end of this div
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
     * emojiPickerDom
     *
     * is the visible picker box with
     * search and all emojis
     */
    emojiPickerDom: HTMLElement

    /**
     * emojiPaneDom
     *
     * is the whole pane
     * more than the visible popup
     * it is responsible for aligning the
     * actual emojiPickerDom
     * to the bottom right
     */
    emojiPaneDom: HTMLElement
    emojiListDom: HTMLElement
    emojiSearchInput: HTMLInputElement
    emojiSearchForm: HTMLInputElement
    toggleButton: HTMLElement
    messageInp: HTMLInputElement
    numEmojiColumns: number

    constructor() {
        super('emoji_picker')

        this.pluginButtonInputButtonContainer = document.querySelector('.plugin-input-buttons')
        this.layoutDiv = document.querySelector('.layout')

        this.pluginButtonInputButtonContainer.insertAdjacentHTML('beforeend', '<div class="emoji-picker-toggle"></div>')
        this.layoutDiv.insertAdjacentHTML(
            'beforeend',
            `<div class="emoji-picker-pane">
            <div class="emoji-picker ui-box-rounding">
                <form action="" class="emoji-search-form">
                    <input type="text" name="emoji-search" id="emoji-search" placeholder="Search emoji">
                </form>
                <hr>
                <div class="emoji-picker-list"></div>
            </div> <!-- emoji-picker -->
            </div> <!-- emoji-picker-pane -->`
        )

        this.emojiPickerDom = document.querySelector('.emoji-picker')
        this.emojiPaneDom = document.querySelector('.emoji-picker-pane')
        this.emojiListDom = document.querySelector('.emoji-picker-list')
        this.emojiSearchInput = document.querySelector('#emoji-search')
        this.emojiSearchForm = document.querySelector('.emoji-search-form')
        this.toggleButton = document.querySelector('.emoji-picker-toggle')
        this.messageInp = document.querySelector('#message-input')

        this.numEmojiColumns = 9
        // apparently js can not use css trix
        // this.emojiListDom.style.gridTemplateColumns = `repeat(${this.numEmojiColumns}, 1fr);`
        this.emojiListDom.style.gridTemplateColumns = '1fr '.repeat(this.numEmojiColumns)
    }

    onInit(): void {
        this.renderList()
        this.emojiSearchForm.addEventListener('submit', (event) => this.onSearchSubmit(event))
        this.emojiSearchInput.addEventListener('keyup', (event) => this.onSearchKey(event))
        this.emojiListDom.addEventListener('click', (event) => this.clickList(event))
        document.addEventListener('keydown', (event) => this.onDocumentKey(event))
        document.addEventListener('click', (event) => this.onGlobalClick(event))
        this.toggleButton.addEventListener('click', () => this.toggle())
        // TODO: select on hover
    }

    onDocumentKey(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            this.hide()
        } else if (event.key === 'ArrowRight') {
            this.selectEmojiRight()
        } else if (event.key === 'ArrowLeft') {
            this.selectEmojiLeft()
        } else if (event.key === 'ArrowDown') {
            this.selectEmojiDown()
        } else if (event.key === 'ArrowDown') {
            this.selectEmojiUp()
        }
    }

    toggle() {
        if (this.emojiPaneDom.classList.contains('active')) {
            this.hide()
        } else {
            this.show()
        }
    }

    hide() {
        this.emojiPaneDom.classList.remove('active')
        this.messageInp.focus()
    }
    
    show() {
        this.emojiPaneDom.classList.add('active')
        this.emojiSearchInput.focus()
    }

    onGlobalClick(event: MouseEvent) {
        // cast EventTarget to HTMLElement
        const clickTarget: HTMLElement = event.target as HTMLElement
        if (!clickTarget) {
            return
        }
        if (!clickTarget.innerHTML) {
            return
        }
        if (!this.emojiPickerDom.contains(clickTarget)) {
            // clicked outside of the
            // emoji picker
            // hide it
            this.hide()
        }
    }

    clickList(event: MouseEvent) {
        // cast EventTarget to HTMLElement
        const emojiDiv: HTMLElement = event.target as HTMLElement
        if (!emojiDiv.classList.contains('emote')) {
            return
        }
        const emojiName: string = emojiDiv.dataset.emojiName
        this.messageInp.value += `:${emojiName}: `
    }

    onSearchKey(event: KeyboardEvent) {
        // do not reset list while arrow key selecting elements
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            return
        }
        const search: string = this.emojiSearchInput.value
        this.renderList(search.toLowerCase())
    }

    onSearchSubmit(event: SubmitEvent) {
        event.preventDefault()
        const currentSelection: HTMLElement | null = this.emojiListDom.querySelector('.emoji-selected')
        if (!currentSelection) {
            // for example when we search for a term that is not found
            return
        }
        const emojiName: string = currentSelection.dataset.emojiName
        this.messageInp.value += `:${emojiName}: `
    }

    selectFirstEmoji() {
        const emojis: NodeListOf<HTMLElement> = this.emojiListDom.querySelectorAll('.emote')
        const currentSelection: HTMLElement | null = this.emojiListDom.querySelector('.emoji-selected')
        if (currentSelection) {
            currentSelection.classList.remove('emoji-selected')
        }
        if (emojis.length > 0 && emojis[0]) {
            emojis[0].classList.add('emoji-selected')
        }
    }

    selectEmojiRight() {
        const currentSelection: HTMLElement | null = this.emojiListDom.querySelector('.emoji-selected')
        if (!currentSelection) {
            return
        }
        const next: HTMLElement | null = currentSelection.nextElementSibling as HTMLElement | null
        if (!next) {
            return
        }
        currentSelection.classList.remove('emoji-selected')
        next.classList.add('emoji-selected')
    }

    selectEmojiLeft() {
        const currentSelection: HTMLElement | null = this.emojiListDom.querySelector('.emoji-selected')
        if (!currentSelection) {
            return
        }
        const next: HTMLElement | null = currentSelection.previousElementSibling as HTMLElement | null
        if (!next) {
            return
        }
        currentSelection.classList.remove('emoji-selected')
        next.classList.add('emoji-selected')
    }

    selectEmojiOffset(offset: number) {
        const currentSelection: HTMLElement | null = this.emojiListDom.querySelector('.emoji-selected')
        if (!currentSelection) {
            return
        }
        const emojis: NodeListOf<HTMLElement> = this.emojiListDom.querySelectorAll('.emote')
        if (emojis.length < 1) {
            return
        }
        const index: number = Array.from(emojis).indexOf(currentSelection)
        if (index === -1) {
            console.log(`[!] Warning failed to get index when down selecting`)
            return
        }
        const newIndex: number = index + offset
        const target: HTMLElement | null = emojis[newIndex] || null
        if (!target) {
            // end of list
            return
        }
        currentSelection.classList.remove('emoji-selected')
        target.classList.add('emoji-selected')
    }

    selectEmojiDown() {
        this.selectEmojiOffset(this.numEmojiColumns)
    }

    selectEmojiUp() {
        this.selectEmojiOffset(-this.numEmojiColumns)
    }

    renderList(search: string = ''): void {
        this.emojiListDom.innerHTML = ''
        getDiscordEmoteNames().forEach((emojiName) => {
            if (!emojiName.toLowerCase().includes(search)) {
                return
            }
            this.emojiListDom.insertAdjacentHTML(
                'beforeend',
                `<div class="emote emote-${emojiName}" data-emoji-name="${emojiName}"></div>`
            )
        })
        this.selectFirstEmoji()
    }
}

export default EmojiPickerPlugin
