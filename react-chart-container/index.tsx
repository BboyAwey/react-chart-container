import { FC, useCallback, useEffect, useRef, useMemo, MutableRefObject, useState, PropsWithChildren, ReactNode } from 'react'
import { addListener, removeListener } from 'resize-detector'
import './style.css'
import { useDebounce, useUnmount, useWatch } from './utils/hooks'
import later from './utils/later'

const DELAY = 200

export type GraphRef<GraphType> = MutableRefObject<GraphType | null>

export interface Chart<GraphType, Data, Settings = undefined> {
  init (element: HTMLDivElement, data: Data, settings?: Settings): GraphType
  resize (graphRef: GraphRef<GraphType>, data: Data, settings?: Settings): void
  update (graphRef: GraphRef<GraphType>, data: Data, settings?: Settings): void
  destroy (graphRef: GraphRef<GraphType>, element: HTMLDivElement): void
}

// this hook will generate element ref, graph ref,
// ready handle and resize handler for ChartContainer
// and handle update logic for charts
export const useReactChartContainer = <GraphType, Data, Settings = undefined>(
  chart: Chart<GraphType, Data, Settings>,
  data: Data,
  settings?: Settings
) => {
  const elRef = useRef(null)
  const graphRef: GraphRef<GraphType> = useRef(null)
  const destroyed = useRef<boolean>(false)

  const updateChart = useDebounce(() => chart.update(graphRef, data, settings), DELAY)

  const onReady = useCallback(() => {
    if (destroyed.current) return
    if (!graphRef.current && elRef.current) {
      graphRef.current = chart.init(elRef.current!, data, settings)
      updateChart()
    }
  }, [chart, data, settings, updateChart])

  const onResize = useCallback(() => {
    !destroyed.current && chart.resize(graphRef, data, settings)
  }, [chart, data, destroyed, settings])

  useWatch([data, settings], () => {
    graphRef.current && updateChart()
  })

  useUnmount(() => {
    if (!destroyed.current) chart.destroy(graphRef, elRef.current!)
    destroyed.current = true
  })
  return { elRef, graphRef, onResize, onReady }
}

export interface Rect {
  width: number
  height: number
}

export interface ReactChartContainerProps extends PropsWithChildren {
  onReady: (size: Rect) => void
  spinIcon: ReactNode
  onResize?: (size: Rect) => void
  loading?: boolean
  className?: string
}

export const ReactChartContainer: FC<ReactChartContainerProps> = props => {
  const ref = useRef<HTMLDivElement>(null)

  // handle ready, only trigger ready once
  const onReady = useMemo(() => props.onReady, [props.onReady])
  useEffect(() => {
    if (!ref.current) return
    later(() => {
      if (!ref.current) return
      onReady instanceof Function && onReady(
        ref.current.getBoundingClientRect()
      )
    })
  }, [onReady])

  // handle resize
  const onResize = useMemo(() => props.onResize, [props.onResize])
  const handleResize = useCallback(() => {
    if (!ref.current) return
    const { width, height } = ref.current.getBoundingClientRect()
    onResize && onResize({ width, height })
  }, [onResize])

  // element resize listener, drag event will trigger element resize listener,
  useEffect(() => {
    const container = ref.current
    if (!container) return
    addListener(container, handleResize)
    return () => {
      removeListener(container, handleResize)
    }
  }, [handleResize])

  // and we should resize when chart container rerender if size is change, drag end event will trigger rerender resize
  const [lastRect, setLastRect] = useState<[number, number]>([0, 0])
  useEffect(() => {
    if (!ref.current) return
    const { width, height } = ref.current.getBoundingClientRect()
    if (width !== lastRect[0] || height !== lastRect[1]) {
      onResize && onResize({ width, height })
      setLastRect([width, height])
    }
  }, [lastRect, onResize])

  return <div className={['react-chart-container', props.className].filter(Boolean).join(' ')} ref={ref}>
    {props.children}
    <div className="react-chart-container-loading" style={{ display: props.loading ? 'flex' : 'none' }}>
      <div className="react-chart-container-loading-spin">{props.spinIcon}</div>
    </div>
  </div>
}
