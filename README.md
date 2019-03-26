# Zzeact

Zzeact is a JavaScript library to learn the source code of React.

## Todo

- [x] **DOM render**
- [x] **Event**
- [x] **LifeCycle**
- [x] **React Components**
- [x] **Components Update**
- [ ] **JSX**

## Install

```bash
yarn add zzeact
```

```bash
npm install zzeact --save
```

## Quick Start

```javascript
var Examples = Zzeact.createClass({
  render: () => Zzeact.DOM.p(
    {
      style: {
        margin: 0,
        fontSize: 16,
        color: 'red'
      }
    },
    'Zzeact is rendered'
  )
})

Zzeact.renderComponent(
  Examples(null, 'children'),
  document.getElementById('container')
)
```

Now, You can using `type="text/jsx"` beacuse i integrated `JSXTransformer.js`

```jsx
/**
 * @jsx Zzeact.DOM
 */
const ExampleApplication = Zzeact.createClass({
  render: function () {
    const style = { margin: 0, fontSize: 16, color: 'red' }
    return <p style={style}>Zzeact is rendered</p>
  }
})

Zzeact.renderComponent(
  <ExampleApplication />,
  document.getElementById('container')
)
```

Or, you can see [examples](https://github.com/zongzi531/zzeact/tree/master/examples).

## License

[MIT](https://github.com/zongzi531/zzeact/blob/master/LICENSE)
