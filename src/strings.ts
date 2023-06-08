/**
 * Finds the last index of the needle in the haystack
 *
 * @param haystack the string to be searched in
 * @param needle the needle string to be searched in the haystack
 * @returns index of needle or -1 if not found
 */
export const getLastIndex = (haystack: string, needle: string): number => {
	return haystack.length - 1 - haystack.split('').reverse().indexOf(needle)
}

/**
 * Finds the last index of the needle in the haystack
 * but is only looking for needles that are prefixed with a space
 * or are the first character of the haystack
 *
 * If you just want to get the last index no matter its prefix
 * use `getLastIndex()` instead
 *
 * @param haystack the string to be searched in
 * @param needle the needle string to be searched in the haystack
 * @returns index of needle or -1 if not found
 */
export const getLastIndexSpaced = (haystack: string, needle: string): number => {
	for (let i = haystack.length - 1; i >= 0; i--) {
		if (i > 0 && haystack[i - 1] !== ' ') {
			continue
		}
		if (haystack[i] === needle) {
			return i
		}
	}
	return -1
}
