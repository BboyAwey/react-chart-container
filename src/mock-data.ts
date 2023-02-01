const randomNum = () => Math.random() * 1234.56
// let c = -1000
const randomPoint = () => {
  const p = randomNum()
  // const band = Math.floor(Math.random() * 5000)
  // return [
  //   p,
  //   p + band,
  //   p - band,
  //   p + band * 2,
  //   p - band * 2,
  //   // c += 50
  // ]
  return p
}

const getTimestamps = (from: number, to: number, count: number) => {
  const interval = Math.floor((to - from) / count)
  const res = []
  for (let i = 0; i < count; i++) {
    res.push(Number(from) + interval * i)
  }
  return res
}

const randomTimelineData = (count: number) => {
  const res = []
  for (let i = 0; i < count; i++) {
    res.push(randomPoint())
  }
  return res
}

const from = 1604295219694
const to = 1604297619694
const count = 100

export interface TimelineData {
  timestamps: number[]
  values: {
    name: string
    alias: string
    data: number[]
  }[]
}

export const getMockData: () => TimelineData = () => ({
  timestamps: getTimestamps(from, to, count),
  values: [
    { name: 'cpu_usage', data: randomTimelineData(count), alias: 'a' }
    // { name: 'process.agent', data: randomTimelineData(count), alias: 'b' },
    // { name: 'ntp.offset', data: randomTimelineData(count), alias: 'c' },
    // { name: 'trace_agent.heap_alloc', data: randomTimelineData(count), alias: 'd' }
  ]
})
