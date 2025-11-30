// merge multi line code snippets into one big block

import BasePlugin from '../base_plugin'
import { getHljs } from '../../highlight'

class MultiLinePlugin extends BasePlugin {
  constructor () {
    super('multi_line')
  }

  onInit (): void {
  }

  onEnrichText (text: string): string {
    if (text.includes('\n')) {
      const lines = text.split('\n')
      let mergedLines = ''
      let inCodeBlock: null | string = null
      let currentCodeBlock = ''
      lines.forEach((line) => {
        const languages = [
          'c', 'rust',
          'c++', 'cpp', 'C++',
          'python', 'javascript',
          'xml', 'html', 'css',
          'dockerfile', 'yaml', 'json',
          'bash', 'shell'
        ]
        let isCodeBlockOpenLine: boolean = false
        if (inCodeBlock === null) {
          languages.forEach((lang) => {
            if (line === '```' + lang) {
              inCodeBlock = lang
            } else if (line === '```rs' || line === '```edlang') {
              inCodeBlock = 'rust'
            } else if (line === '```') {
              inCodeBlock = 'plaintext'
            } else {
              return
            }
            isCodeBlockOpenLine = true
          })
        }
        if (isCodeBlockOpenLine) {
          return
        }
        if (line === '```') {
          if (inCodeBlock !== null) {
            const codeHljs = getHljs().highlight(currentCodeBlock, { language: inCodeBlock }).value
            mergedLines += `<pre class="multi-line-code-snippet code-snippet">${codeHljs}</pre>`
            currentCodeBlock = ''
            inCodeBlock = null
          } else {
            console.log('WARNING UNEXPECTED ```')
          }
        } else if (inCodeBlock !== null) {
          currentCodeBlock += line + '\n'
        } else {
          mergedLines += line + '\n'
        }
      })
      text = mergedLines
      if (inCodeBlock) {
        text += '```'
        if (inCodeBlock !== 'plaintext') {
          text += inCodeBlock + '\n'
        } else {
          text += '\n'
        }
        text += currentCodeBlock
      }
    }
    return text
  }
}

export default MultiLinePlugin
