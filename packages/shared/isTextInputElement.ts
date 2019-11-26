const supportedInputTypes: {[key: string]: true | void} = {
  color: true,
  date: true,
  datetime: true,
  'datetime-local': true,
  email: true,
  month: true,
  number: true,
  password: true,
  range: true,
  search: true,
  tel: true,
  text: true,
  time: true,
  url: true,
  week: true,
}

function isTextInputElement(elem?: HTMLElement): boolean {
  const nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase()

  if (nodeName === 'input') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return !!supportedInputTypes[((elem as any) as HTMLInputElement).type]
  }

  if (nodeName === 'textarea') {
    return true
  }

  return false
}

export default isTextInputElement
