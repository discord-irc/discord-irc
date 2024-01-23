// TODO: this should probably be a plugin
//       not sure if mobile support is a core feature everyone wants
//       or if desktop users or even mobile users want a way to toggle the
//       desktop mode even on small resolutions

const burgerMenu: HTMLElement = document.querySelector('.burger-menu-mobile-toggle')
const layoutDiv: HTMLElement = document.querySelector('.layout')
burgerMenu.addEventListener('click', () => {
  layoutDiv.classList.toggle('collapse-left-pane')
})

const collapseOnMobile = () => {
  const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
  if (width > 700) {
    layoutDiv.classList.remove('collapse-left-pane')
  } else {
    layoutDiv.classList.add('collapse-left-pane')
  }
}

window.addEventListener('resize', collapseOnMobile)
collapseOnMobile()
