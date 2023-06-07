export const getLastIndex = (haystack: string, needle: string): number => {
	return haystack.length - 1 - haystack.split('').reverse().indexOf(needle)
}