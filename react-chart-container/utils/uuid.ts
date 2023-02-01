const uuid = (): string => {
  const gen = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  return `${gen() + gen()}-${gen()}-${gen()}-${gen()}-${gen() + gen() + gen()}`
}

export default uuid
