import { FC, useEffect, useState } from 'react'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { GridComponent } from 'echarts/components'
import { TimelineData, getMockData } from './mock-data'
import { ReactChartContainer, useReactChartContainer } from '../react-chart-container'
import k from './k'

const Spin: FC = () => <div>Loading...</div>

function transformData (data: TimelineData) {
  return data.values.map(line => {
    return {
      type: 'line',
      name: line.name,
      id: line.alias + ':::' + line.name,
      data: line.data.map((point, index) => {
        if (!data.timestamps[index]) return null
        return {
          name: data.timestamps[index],
          value: [data.timestamps[index], point]
        }
      })
    }
  })
}

echarts.use([LineChart, CanvasRenderer, GridComponent])

function App () {
  const [mockData, setMockData] = useState(getMockData())

  const { elRef, onReady, onResize, onDestroy } = useReactChartContainer<echarts.ECharts, TimelineData>({
    init: (el, d) => {
      console.log('init', el, d)
      const instance = echarts.init(el)

      instance.setOption({
        xAxis: {
          type: 'time'
        },
        yAxis: {
          type: 'value',
          axisLabel: { formatter: (v: number) => k(v) }
        },
        grid: {
          show: true,
          left: 56,
          bottom: 24,
          right: 8,
          top: 28
        },
        series: transformData(d)
      }, { lazyUpdate: true })

      return instance
    },
    update: (graph, d) => {
      console.log('update:', d)
      graph.setOption({
        series: transformData(d)
      }, { lazyUpdate: true, replaceMerge: 'series' })
    },
    resize: graph => {
      console.log('resize', graph)
      graph.resize()
    },
    destroy: graph => {
      console.log('destroy', graph)
      graph.dispose()
    }
  }, mockData as TimelineData)

  useEffect(() => {
    window.setInterval(() => {
      setMockData(getMockData())
    }, 3000)
  }, [])

  const [display, setDisplay] = useState(true)

  return (
    <div >
      {
        display && <ReactChartContainer
          onReady={onReady}
          onResize={onResize}
          onDestroy={onDestroy}
          spinIcon={<Spin />}
          loading={false}>
          <div ref={elRef} style={{ height: 400 }}></div>
        </ReactChartContainer>
      }
      <p>
        <button onClick={() => setDisplay(!display)}>toggle chart display</button>
      </p>
    </div>
  )
}

export default App
