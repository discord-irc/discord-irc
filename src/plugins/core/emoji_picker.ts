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
    selectionIndex: number
    messageInp: HTMLInputElement

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
        this.selectionIndex = 0
    }

    onInit(): void {
        this.renderList()
        this.emojiSearchForm.addEventListener('submit', (event) => this.onSearchSubmit(event))
        this.emojiSearchInput.addEventListener('keyup', () => this.onSearchKey())
        this.emojiListDom.addEventListener('click', (event) => this.clickList(event))
        document.addEventListener('keydown', (event) => event.key === 'Escape' && this.hide())
        document.addEventListener('click', (event) => this.onGlobalClick(event))
        this.toggleButton.addEventListener('click', () => this.toggle())
        // TODO: select on hover
        // TODO: switch selection on arrow key
        // TODO: pick selection on enter
    }

    toggle() {
        this.emojiPaneDom.classList.toggle('active')
    }

    hide() {
        this.emojiPaneDom.classList.remove('active')
    }
    
    show() {
        this.emojiPaneDom.classList.add('active')
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

    onSearchKey() {
        const search: string = this.emojiSearchInput.value
        this.renderList(search.toLowerCase())
    }

    onSearchSubmit(event: SubmitEvent) {
        event.preventDefault()
        const search: string = this.emojiSearchInput.value
        this.renderList(search.toLowerCase())
    }

    selectEmoji(index: number) {
        this.selectionIndex = index
        const emojis: NodeListOf<HTMLElement> = this.emojiListDom.querySelectorAll('.emote')
        const currentSelection: HTMLElement | null = this.emojiListDom.querySelector('.emoji-selected')
        if (currentSelection) {
            currentSelection.classList.remove('emoji-selected')
        }
        emojis[index].classList.add('emoji-selected')
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
        this.selectEmoji(0)
    }
}

export default EmojiPickerPlugin
