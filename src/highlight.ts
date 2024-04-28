// import hljs from 'highlight.js' // works but is slow because it bloats in too many langs
import hljs from 'highlight.js/lib/core'
import plaintext from 'highlight.js/lib/languages/plaintext'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import rust from 'highlight.js/lib/languages/rust'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import yaml from 'highlight.js/lib/languages/yaml'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import shell from 'highlight.js/lib/languages/shell'

let registered = false

export const getHljs = () => {
  if (registered) {
    return hljs
  }
  hljs.registerLanguage('plaintext', plaintext)
  hljs.registerLanguage('javascript', javascript)
  hljs.registerLanguage('python', python)
  hljs.registerLanguage('c', c)
  hljs.registerLanguage('cpp', cpp)
  hljs.registerLanguage('rust', rust)
  hljs.registerLanguage('html', xml)
  hljs.registerLanguage('xml', xml)
  hljs.registerLanguage('css', css)
  hljs.registerLanguage('dockerfile', dockerfile)
  hljs.registerLanguage('yaml', yaml)
  hljs.registerLanguage('json', json)
  hljs.registerLanguage('bash', bash)
  hljs.registerLanguage('shell', shell)
  registered = true
  return hljs
}

