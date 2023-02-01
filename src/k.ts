const numberUnits = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'B']

export default function k (num: number | bigint | string, round?: boolean): string {
  // handle ilegal num
  if (typeof num === 'number' && !(num <= Number.MAX_SAFE_INTEGER)) {
    // not precise here
    console.warn(`k: your number '${num}' has been transformed to bigint ${BigInt(num)}, but this is not precise and may cause problems. If your number is bigger than Number.MAX_SAFE_INTEGER, you should represent it with BigInt or string`)
    num = BigInt(num)
  }
  const originNumStr = num.toString()
  if (!(/(\d+)|(\d+\.\d+)/).test(originNumStr)) {
    return num.toString()
  }

  // handle origin dicemal
  let originDicemalStr = ''
  if ((/(\d+\.\d+)/).test(originNumStr)) {
    originDicemalStr = originNumStr.split('.')[1]
  }

  const originIntStr = originNumStr.split('.')[0]
  let uIndex = Math.floor((originIntStr.length - 1) / 3)

  // // if run out of units then use scientific notation
  // if (uIndex >= numberUnits.length) {

  // }
  uIndex = uIndex < numberUnits.length ? uIndex : (numberUnits.length - 1)

  let dicemal = originIntStr.slice(-uIndex * 3) + originDicemalStr
  if (Array.prototype.every.call(dicemal, c => c === '0')) {
    dicemal = ''
  } else {
    dicemal = dicemal.slice(0, 3)
    if (dicemal.length > 2) {
      if (Number(dicemal[2]) >= 5) {
        dicemal = Number(dicemal.slice(0, 2)) + 1 + ''
      } else {
        dicemal = dicemal.slice(0, 2)
      }
    }
  }

  // calc base k
  const base = BigInt('1' + '0'.repeat(uIndex * 3))
  const bi = BigInt(originIntStr)
  const resNum = bi / base

  // calc final result
  return (
    (
      !round
        ? (resNum.toString() + (dicemal ? ('.' + dicemal.padEnd(2, '0')) : '.00'))
        : resNum + BigInt(Number(dicemal[0]) >= 5 ? (resNum > 0 ? 1 : -1) : 0)
    ) + numberUnits[uIndex]
  )
}

// console.log(k(-12919.00, true))
