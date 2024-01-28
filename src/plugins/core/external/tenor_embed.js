/* eslint-disable */
// source: https://tenor.com/embed.js
// the code in this file belongs to tenor.com
// edited by ChillerDragon to reduce tracking

if (!false) {
  const __ry_imported = true;
  (function () {
    let installed = false
    const embedurl = 'https://tenor.com/embed/'
    const canonical = document.querySelector("link[rel='canonical']")

    function ready () {
      if (!false) {
        installed = true
        const elts = document.querySelectorAll('.tenor-embed:not([data-processed]), .tenor-gif-embed:not([data-processed])')
        for (let i = 0; i < elts.length; ++i) {
          e = elts[i]
          e.setAttribute('data-processed', true)
          let embedSubPath = e.getAttribute('data-postid')
          if (!embedSubPath) {
            embedSubPath = e.getAttribute('data-type')
          }
          if (!embedSubPath) {
            embedSubPath = e.getAttribute('data-insights-term')
            if (embedSubPath) {
              embedSubPath = 'insights/' + embedSubPath.replace(/\s+/g, '-')
              embedSubPath += '?range=' + e.getAttribute('data-range')
              embedSubPath += '&timestamp=' + e.getAttribute('data-timestamp')
            }
          }

          const iframe = document.createElement('iframe')
          iframe.setAttribute('frameborder', '0')
          iframe.setAttribute('allowtransparency', 'true')
          iframe.setAttribute('allowfullscreen', 'true')
          iframe.setAttribute('scrolling', 'no')
          var root
          if (e.hasAttribute('data-height')) {
            iframe.setAttribute('width', e.getAttribute('data-width'))
            iframe.setAttribute('height', e.getAttribute('data-height'))
            root = iframe
          } else {
            const framewrapper = document.createElement('div')
            const aspect = e.getAttribute('data-aspect-ratio') || 1.33
            e.setAttribute('style',
              'width:' + e.getAttribute('data-width') + ';' +
                'position:relative;')
            framewrapper.setAttribute('style',
              'padding-top:' + (1 / aspect) * 100 + '%;')
            iframe.setAttribute('style',
              'position:absolute;top:0;left:0;width:100%;height:100%;')
            framewrapper.appendChild(iframe)
            root = framewrapper
          }
          const url = embedurl + embedSubPath
          iframe.setAttribute('src', url)
          e.innerHTML = ''
          e.appendChild(root)
        }
      }
    }

    function readystatechange () {
      if (document.readyState === 'complete') ready()
    }

    if (document.readyState === 'complete' || (
      !document.attachEvent && document.readyState === 'interactive')) {
      setTimeout(ready, 1)
    } else {
      if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', ready, false)
        window.addEventListener('load', ready, false)
      } else {
        document.attachEvent('onreadystatechange', readystatechange)
        window.attachEvent('onload', ready)
      }
    }
  })()
}
