function later (cb: Function, interval = 0) {
  const timer = setTimeout(() => {
    cb()
    clearTimeout(timer)
  }, interval)
}

export default later
