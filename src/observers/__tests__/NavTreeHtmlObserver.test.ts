import NavTreeHtmlObserver, { INavTreeHtmlObservable } from '../NavTreeHtmlObserver'

class TestObservable implements INavTreeHtmlObservable {
  elem: HTMLElement | null = document.createElement('div')
  build = jest.fn()
}

describe('<NavTreeHtmlObserver> class', () => {
  let observer: NavTreeHtmlObserver
  let observable: TestObservable
  beforeEach(() => {
    observer = new NavTreeHtmlObserver()
    observable = new TestObservable()
  })

  describe('<subscribe> method', () => {
    it('should call unsubscribe', () => {
      observer.unsubscribe = jest.fn()
      observer.subscribe(observable)

      expect(observer.unsubscribe).toBeCalled()
    })

    it('should set html change event', () => {
      observer.mutationObserver.observe = jest.fn()
      observer.subscribe(observable)

      expect(observer.mutationObserver.observe).toBeCalled()
    })

    it('should not set html change event if element is not defined', () => {
      observable.elem = null
      observer.mutationObserver.observe = jest.fn()
      observer.subscribe(observable)

      expect(observer.mutationObserver.observe).not.toBeCalled()
    })
  })

  describe('<unsubscribe> method', () => {
    it('should call disconnect', () => {
      observer.subscribe(observable)

      observer.mutationObserver.disconnect = jest.fn()
      observer.unsubscribe()

      expect(observer.mutationObserver.disconnect).toBeCalled()
    })
  })

  describe('<onHtmlChangeDetected> method', () => {
    it('should handle html change event', () => {
      observer.subscribe(observable)
      observer.onHtmlChangeDetected()

      expect(observable.build).toBeCalledWith(observable.elem)
    })

    it('should unsubscribe if observable is not set', () => {
      observer.unsubscribe = jest.fn()

      observer.onHtmlChangeDetected()

      expect(observer.unsubscribe).toBeCalled()
    })

    it('should unsubscribe if observable lose html element link', () => {
      observer.unsubscribe = jest.fn()
      observer.subscribe(observable)
      observable.elem = null

      observer.onHtmlChangeDetected()

      expect(observer.unsubscribe).toBeCalled()
    })
  })
})
