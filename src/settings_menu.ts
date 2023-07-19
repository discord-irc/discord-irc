import { activatePlugin, deactivatePlugin, getPlugins } from "./plugins/plugins"

const settingsButton: HTMLInputElement = document.querySelector('.settings-button')

let menuActive = false

const menuContainer: HTMLElement = document.querySelector('.menu-todo-should-not-be-here')

const deactivateMenu = () => {
    const pane: HTMLElement = document.querySelector('.channel-list-pane')
    pane.classList.remove('settings-active')
    menuContainer.innerHTML = ''
}

const activateMenu = () => {
    const pane: HTMLElement = document.querySelector('.channel-list-pane')
    pane.classList.add('settings-active')
    let menuContent = '<h1>plugins</h1>'
    menuContent = '<div class="plugin-list">'
    getPlugins().forEach((plugin) => {
        menuContent += `
            <div>
                <input id="plugin-toggler" data-plugin-name="${plugin.pluginName}" type="checkbox" ${plugin.isActive()  ? 'checked' : ''} />
                <span>${plugin.pluginName}</span>
            </div>`
    })
    menuContent += '</div> <!-- plugin-list -->'
    menuContainer.insertAdjacentHTML(
        'beforeend',
        menuContent
    )
    document.querySelectorAll('#plugin-toggler').forEach((pluginCheckbox: HTMLInputElement) => {
        pluginCheckbox.addEventListener('change', () => {
            if (pluginCheckbox.checked) {
                activatePlugin(pluginCheckbox.dataset.pluginName)
            } else {
                deactivatePlugin(pluginCheckbox.dataset.pluginName)
            }
        })
    })
}

const toggleMenu = () => {
    if (menuActive) {
        deactivateMenu()
    } else {
        activateMenu()
    }
    menuActive = !menuActive
}

settingsButton.addEventListener('click', () => {
    toggleMenu()
})
