# Zzeact

> **I didn't plan to copy all the functions, this repository is only for learning projects.**

Zzeact is a JavaScript library to learn the source code of React `v16.8.6`.

## ~~Install~~

```bash
yarn add zzeact #0.3.5
```

## Quick Start

```javascript
class ExampleApplication extends Zzeact.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }
  handleClick() {
    console.log(this)
  }
  render() {
    return Zzeact.createElement('p', { onClick: this.handleClick }, 'Click me.')
  }
}

ZzeactDOM.render(
  Zzeact.createElement(ExampleApplication),
  document.getElementById('container')
)
```

Or, you can see [examples](https://github.com/zongzi531/zzeact/tree/master/examples).

## License

[MIT](https://github.com/zongzi531/zzeact/blob/master/LICENSE)
