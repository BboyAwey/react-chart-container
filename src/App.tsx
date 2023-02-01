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

  const { elRef, onReady, onResize } = useReactChartContainer<echarts.ECharts, TimelineData, string>({
    init: (el, d, _s) => {
      // console.log('settings in init function:', s)
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
    resize: (graphRef) => graphRef.current?.resize(),
    update: (graphRef, d, _s) => {
      // console.log('settings in update function:', s)
      graphRef.current?.setOption({
        series: transformData(d)
      }, { lazyUpdate: true, replaceMerge: 'series' })
    },
    destroy: (graphRef, _el) => graphRef.current?.dispose()
  }, mockData as TimelineData, 'hello')

  useEffect(() => {
    window.setInterval(() => {
      setMockData(getMockData())
    }, 3000)
  }, [])

  return (
    <div >
      <ReactChartContainer
        onReady={onReady}
        onResize={onResize}
        spinIcon={<Spin />}
        loading={false}>
        <div ref={elRef} style={{ height: 400 }}></div>
      </ReactChartContainer>
    </div>
  )
}

export default App
