import invariant from '@/shared/invariant'

import voidElementTags from './voidElementTags'

const HTML = '__html'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function assertValidProps(tag: string, props?: any): void {
  if (!props) {
    return
  }
  if (voidElementTags[tag]) {
    invariant(
      props.children == null && props.dangerouslySetInnerHTML == null,
      '%s is a void element tag and must neither have `children` nor ' +
        'use `dangerouslySetInnerHTML`.%s',
      tag,
      '',
    )
  }
  if (props.dangerouslySetInnerHTML != null) {
    invariant(
      props.children == null,
      'Can only set one of `children` or `props.dangerouslySetInnerHTML`.',
    )
    invariant(
      typeof props.dangerouslySetInnerHTML === 'object' &&
        HTML in props.dangerouslySetInnerHTML,
      '`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. ' +
        'Please visit https://fb.me/react-invariant-dangerously-set-inner-html ' +
        'for more information.',
    )
  }
  invariant(
    props.style == null || typeof props.style === 'object',
    'The `style` prop expects a mapping from style properties to values, ' +
      'not a string. For example, style={{marginRight: spacing + \'em\'}} when ' +
      'using JSX.%s',
    '',
  )
}

export default assertValidProps
