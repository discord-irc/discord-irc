import { getDiscordEmoteNames } from "../../emotes";
import BasePlugin from "../base_plugin";

import '../../css/plugins/typing_emoji_panel.css'

export default class TypingEmojiPanelPlugin extends BasePlugin {
    /**
     * the main div holding basically the whole view port
     *
     * it has the grid that splits the whole menu
     * we can insert our emoji pane at the end of this div
     * and then align our selfs in the grid
     */
    layoutDiv: HTMLDivElement;

    /**
     * emojis
     *
     * list of emojis which are found
     * according to user input
     */
    emojis: string[];

    /**
     * emojiStartPos
     *
     * position which corresponds to first char of
     * the emoji name
     *
     * @example
     * user wrote "hello :justatest: world"
     * emojiStartPos would be 6
     */
    emojiStartPos: number;

    /**
     * typingEmojiPanel
     *
     * is the div which holds the list of emojis
     */
    typingEmojiPanel: HTMLDivElement;

    currentEmoji: string;
    caretPosition: number;
    messageInp: HTMLInputElement;
    isVisible: boolean;

    constructor() {
        super('typing_emoji_panel')

        this.currentEmoji = '';
        this.emojis = [];
        this.layoutDiv = document.querySelector('.layout');
        this.layoutDiv.insertAdjacentHTML('beforeend', `<div id="typing-emoji-panel"></div>`);
        this.typingEmojiPanel = document.querySelector('#typing-emoji-panel');
        this.messageInp = document.querySelector('#message-input');
        this.caretPosition = 0;
    }

    hide(): void {
        this.typingEmojiPanel.classList.remove('active');
        this.isVisible = false;
    }

    show(): void {
        this.typingEmojiPanel.classList.add('active');
        this.isVisible = true;
    }

    onInit(): void {
        this.messageInp.addEventListener('input', () => {
            const emojis = this.typingEmojiPanel.querySelectorAll<HTMLDivElement>('[data-emoji-name]');

            if (emojis.length > 0) {
                this.currentEmoji = emojis[0].dataset.emojiName;
            }
        })
        this.messageInp.addEventListener('keydown', (event) => this.onDocumentKey(event));
        this.messageInp.addEventListener('keyup', () => this.update());
        this.messageInp.addEventListener('click', () => this.update());
        this.typingEmojiPanel.addEventListener('click', (e) => {
            let target: HTMLElement = e.target as HTMLDivElement;

            if (!target.dataset.emojiName) {
                target = target.parentElement;
            }

            this.insertEmoji(target.dataset.emojiName);
        });
        document.addEventListener('click', (event) => this.onGlobalClick(event))
        this.renderList();
    }

    onGlobalClick(event: MouseEvent) {
        const clickTarget: HTMLElement = event.target as HTMLElement

        if (!this.typingEmojiPanel.contains(clickTarget) && event.target != this.messageInp) {
            this.hide()
        }
    }

    onDocumentKey(e: KeyboardEvent): void {
        if (e.key == 'ArrowUp') {
            e.preventDefault();
            this.selectPrevEmoji();
        } else if (e.key == 'ArrowDown') {
            e.preventDefault();
            this.selectNextEmoji();
        } else if (e.key == 'Tab' && this.isVisible) {
            e.preventDefault();
            this.insertEmoji(this.currentEmoji);
        }

        this.update();
    }

    selectNextEmoji() {
        let index = this.emojis.indexOf(this.currentEmoji);

        if (index + 1 != this.emojis.length) {
            this.currentEmoji = this.emojis[index + 1];
        } else {
            this.currentEmoji = this.emojis[0];
        }
    }

    selectPrevEmoji() {
        let index = this.emojis.indexOf(this.currentEmoji);

        if (index == 0) {
            this.currentEmoji = this.emojis[this.emojis.length - 1];
        } else {
            this.currentEmoji = this.emojis[index - 1];
        }
    }

    insertEmoji(emojiName: string) {
        let inputValue = this.messageInp.value;
        emojiName = `:${emojiName}:`;

        this.messageInp.value = inputValue.substring(0, this.emojiStartPos) + emojiName + inputValue.substring(this.caretPosition);
        this.messageInp.focus();
        this.messageInp.selectionStart = this.messageInp.selectionEnd = this.emojiStartPos + emojiName.length;
        this.update();
    }

    update(): void {
        this.caretPosition = this.messageInp.selectionStart;

        let emojiName: string = '';
        let string = this.messageInp.value;

        if (this.caretPosition > 0) {
            for (let i = this.caretPosition - 1; i >= 0; i--) {
                if (string[i] == ':') {
                    emojiName = string.slice(i + 1, this.caretPosition);
                    this.emojiStartPos = i;

                    break;
                }
                if (string[i] == ' ') {
                    break;
                }
            }
        }

        if (emojiName.length > 2) {
            this.show()
        } else {
            this.hide()
        }

        this.emojis = getDiscordEmoteNames().filter(emoji => emoji.includes(emojiName));
        this.renderList();
    }

    renderList(): void {
        this.typingEmojiPanel.innerHTML = '';
        this.emojis.forEach(emojiName => {
            this.typingEmojiPanel.insertAdjacentHTML('beforeend',
                `<div class="typing-emoji-panel-emoji ${emojiName == this.currentEmoji ? "emoji-selected" : ""}" data-emoji-name="${emojiName}">
                     <div class="emote emote-${emojiName}"></div>
                     <span style="margin-left: 10px">:${emojiName}:</span>
                 </div>`
            );
        });
    }
}
