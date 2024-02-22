export const getElementOrThrow = (cssSelector: string): HTMLElement => {
  const element: HTMLElement | null = document.querySelector(cssSelector)
  if (!element) {
    throw `Element not found '${cssSelector}'`
  }
  return element
}
