import ExecutionEnvironment from '@/environment/ExecutionEnvironment'

let contentKey = null

const getTextContentAccessor = () => {
  if (!contentKey && ExecutionEnvironment.canUseDOM) {
    contentKey = 'innerText' in document.createElement('div')
      ? 'innerText'
      : 'textContent'
  }
  return contentKey
}

export default getTextContentAccessor
