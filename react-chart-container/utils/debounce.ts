const debounce = <T extends Function>(cb: T, delay: number, immediate?: boolean) => {
  let timer: null | number = null
  const context = this

  return () => {
    if (immediate) {
      if (!timer) {
        cb.call(context)
        timer = window.setTimeout(() => {
          window.clearTimeout(timer!)
          timer = null
        })
      }
    } else {
      if (timer) {
        window.clearTimeout(timer)
      }
      timer = window.setTimeout(() => {
        cb.call(context)
        window.clearTimeout(timer!)
        timer = null
      }, delay)
    }
  }
}

export default debounce
