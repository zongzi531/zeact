import invariant from '@/vendor/core/invariant'

const ZzeactOwner = {
  isValidOwner (object) {
    return !!(
      object &&
      typeof object.attachRef === 'function' &&
      typeof object.detachRef === 'function'
    )
  },
  addComponentAsRefTo (component, ref, owner) {
    invariant(
      ZzeactOwner.isValidOwner(owner),
      'addComponentAsRefTo(...): Only a ReactOwner can have refs.'
    )
    owner.attachRef(ref, component)
  },
  removeComponentAsRefFrom (component, ref, owner) {
    invariant(
      ZzeactOwner.isValidOwner(owner),
      'removeComponentAsRefFrom(...): Only a ReactOwner can have refs.'
    )
    // Check that `component` is still the current ref because we do not want to
    // detach the ref if another component stole it.
    if (owner.refs[ref] === component) {
      owner.detachRef(ref)
    }
  },
  Mixin: {
    attachRef (ref, component) {
      invariant(
        component.isOwnedBy(this),
        'attachRef(%s, ...): Only a component\'s owner can store a ref to it.',
        ref
      )
      const refs = this.refs || (this.refs = {})
      refs[ref] = component
    },
    detachRef (ref) {
      delete this.refs[ref]
    },
  },
}

export default ZzeactOwner
