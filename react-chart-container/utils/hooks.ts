import { useEffect, useMemo, useRef, useState } from 'react'
import { deepEqual } from 'fast-equals'
import copy from 'fast-copy'
import debounce from './debounce'

export const useUnmount = (fn: () => void) => {
  const fnRef = useRef(fn)
  fnRef.current = fn

  const effect = () => () => fnRef.current()
  useEffect(effect, [])
}

export const useWatch = <StateType>(
  state: StateType,
  callback: (state: StateType, prevState: StateType) => void
) => {
  const [prevState, setPrevState] = useState<StateType>(state)
  useEffect(() => {
    if (!deepEqual(state, prevState)) {
      callback(state, prevState)
      setPrevState(copy(state))
    }
  }, [callback, prevState, state])
}

export const useDebounce = (cb: Function, delay: number) => {
  return useMemo(() => {
    return debounce(() => cb(), delay)
  }, [cb, delay])
}
