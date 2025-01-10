# React Chart Container

React Chart Container is a React component that can wrap chart elements and handle it's `init`, `update` and `resize` event properly.

## Why you need React Chart Container?

If you render a chart on an element like div with some library like [ECharts](https://echarts.apache.org/zh/index.html), you'll have to consider all the concepts bellow:

* init a chart instance and render it on the target element
* handle resizing of the chart when size of any of the ancestral elements changing or the browser window size changing
* handle updatingof the chart when data or chart setting changing
* handle loading status when fetching chart data
* destroy chart instance at proper time

it's really annoying to do all the things.

React Chart Container can help you with all the stuff above.
## Installation

React Chart Container can be installed by npm or yarn.

```bash
# yarn
yarn add @awey/react-chart-container

# npm
npm install @awey/react-chart-container
```

And you should import the component, style and hook.
```ts
import { ReactChartContainer, useReactChartContainer } from '@awey/react-chart-container'
import '@awey/react-chart-container/lib/style.css'
```

## Usage

A typical example is as bellow:

```tsx
import { FC, useEffect, useState } from 'react'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { GridComponent } from 'echarts/components'
import { TimelineData, getMockData } from './mock-data'
import { ReactChartContainer, useReactChartContainer } from '../react-chart-container'
import k from './k'

echarts.use([LineChart, CanvasRenderer, GridComponent])

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

function App () {
  const [mockData, setMockData] = useState(getMockData())

  const { elRef, onReady, onResize } = useReactChartContainer<echarts.ECharts, TimelineData, string>({
    init: (el, d) => {
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
    resize: (graph, size) => graph.resize(),
    update: (graph, d) => {
      graph.setOption({
        series: transformData(d)
      }, { lazyUpdate: true, replaceMerge: 'series' })
    },
    destroy: graph => graph.dispose()
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
```

## API

### `ReactChartContainer`

| prop | type | required/default | description |
| ---- | ---- | ---- | ---- |
| `onReady` | `() => void` | - | the callback of container ready |
| `onResize` | `(size: Rect) =>  void` | - | the callback of container resizing |
| `loading` | `boolean` | `false` | indecate loading status |
| `className` | `string` | `''` | class name |

### `useReactChartContainer`

```ts
const useReactChartContainer: <
  GraphType,
  Data,
  Settings = undefined
>(
  chart: Chart<GraphType, Data, Settings>,
  data: Data,
  settings: Settings
) => {
  elRef: MutableRefObject<null>;
  graphRef: GraphRef<GraphType>;
  onResize: (size: Rect) => void;
  onReady: () => void;
}

interface Chart<GraphType, Data> {
  init (element: HTMLDivElement, data: Data): GraphType
  resize (graph: GraphType, data: Data): void
  update (graph: GraphType, data: Data): void
  destroy (graph: GraphType): void
}

export type GraphRef<GraphType> = MutableRefObject<GraphType | null>
```
