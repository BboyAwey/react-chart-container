import { FC, useCallback, useEffect, useRef, useMemo, MutableRefObject, useState, PropsWithChildren, ReactNode } from 'react'
import { addListener, removeListener } from 'resize-detector'
import './style.css'
import { useDebounce, useWatch } from './utils/hooks'
import later from './utils/later'

const DELAY = 200

export type GraphRef<GraphType> = MutableRefObject<GraphType | null>

export interface Rect {
  width: number
  height: number
}

export interface Chart<GraphType, Data> {
  init (element: HTMLDivElement, data: Data): GraphType
  update (graphRef: GraphType, data: Data): void
  resize (graphRef: GraphType, data: Data, size: Rect): void
  destroy (graphRef: GraphType): void
}

// this hook will generate element ref, graph ref,
// render handle and resize handler for ChartContainer
// and handle update logic for charts
export const useReactChartContainer = <GraphType, Data>(
  chart: Chart<GraphType, Data>,
  data: Data
) => {
  const elRef = useRef(null)
  const graphRef: GraphRef<GraphType> = useRef(null)

  const updateChart = useDebounce(() => {
    if (!graphRef.current || !elRef.current) return
    chart.update(graphRef.current, data)
  }, DELAY)

  useWatch([data], () => {
    graphRef.current && updateChart()
  })

  const onReady = useCallback(() => {
    if (!elRef.current || graphRef.current) return
    graphRef.current = chart.init(elRef.current, data)
  }, [chart, data])

  const onResize = useCallback((size: Rect) => {
    if (!graphRef.current) return
    chart.resize(graphRef.current, data, size)
  }, [chart, data])

  const onDestroy = useCallback(() => {
    if (!graphRef.current) return
    chart.destroy(graphRef.current)
    graphRef.current = null
  }, [chart])

  return { elRef, graphRef, onReady, onResize, onDestroy }
}

export interface ReactChartContainerProps extends PropsWithChildren {
  onReady: (size: Rect) => void
  onResize?: (size: Rect) => void
  onDestroy?: () => void
  spinIcon: ReactNode
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
      onReady && onReady(
        ref.current.getBoundingClientRect()
      )
    })

    return () => {
      props.onDestroy && props.onDestroy()
    }
  }, [onReady, props])

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
