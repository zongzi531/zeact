interface ZzeactDOM extends UsingDefault {
  render: Function
}

const ZzeactDOM: ZzeactDOM = {
  render(
    element: ZzeactElement,
    container: HTMLElement,
    callback?: Function,
  ) {
    console.log(element, container, callback)
  }
}

export default ZzeactDOM
