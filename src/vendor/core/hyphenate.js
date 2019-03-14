const hyphenate = string => string.replace(/([A-Z])/g, '-$1').toLowerCase()

export default hyphenate
