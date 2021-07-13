const { createCanvas } = require("canvas")
const fs = require("fs")

const valueToCoordinate = (value, minValue, maxValue, maxCoordinate) =>
  (value / (maxValue - minValue)) * maxCoordinate

const HOUR_MS = 1000 * 60 * 60

export const getGraph = ({
  data,
  fileName,
  unit = "",
  title = "",
}: {
  data: Array<{ ms: number; val: number }>
  fileName: string
  unit?: string
  title?: string
}) => {
  // sorting, so results are consistent (otherwise order is not guaranteed)
  const sortedData = data.sort((a, b) => a.ms - b.ms)

  const validData = sortedData.filter(({ val }) => Number.isFinite(val))

  const minimalTemperature = Math.min(...validData.map(({ val }) => val))
  const minimalTempData = validData.find(
    ({ val }) => val === minimalTemperature
  )

  const maximalTemperature = Math.max(...validData.map(({ val }) => val))
  const maximalTempData = validData.find(
    ({ val }) => val === maximalTemperature
  )

  const nowTempData = validData[validData.length - 1]

  const WIDTH = 900
  const HEIGHT = 600
  const canvas = createCanvas(WIDTH, HEIGHT)
  const context = canvas.getContext("2d")
  context.fillStyle = "#F5F7F2"
  context.fillRect(0, 0, WIDTH, HEIGHT)

  const paddingX = 15
  const paddingY = 15
  const drawWidth = WIDTH - paddingX * 2
  const drawHeight = HEIGHT - paddingY * 2

  context.font = "15px monospace"
  context.textBaseline = "alphabetic"
  context.fillStyle = "#333"

  const msSpan = sortedData[sortedData.length - 1].ms - sortedData[0].ms
  Array.from({ length: Math.floor(msSpan / HOUR_MS) }).forEach((_, index) => {
    const ms = HOUR_MS * index
    const x =
      paddingX + valueToCoordinate(ms - sortedData[0].ms, 0, msSpan, drawWidth)

    context.beginPath()
    context.moveTo(x, paddingY)
    context.lineTo(x, HEIGHT - paddingY)
    const hour = new Date(ms).getHours()
    if (hour % 3 === 0) {
      context.save()
      context.translate(x, HEIGHT - paddingY)
      context.rotate((Math.PI * 3) / 2)
      context.fillText(hour + "h", 36, -3)
      context.restore()
    }
    if (hour % 6 === 0) {
      context.lineWidth = 2
      context.strokeStyle = "#bbb"
    } else {
      context.lineWidth = 1
      context.strokeStyle = "#ddd"
    }
    context.stroke()
  })

  const temperaturePoints = sortedData.map(({ ms, val }) => ({
    x:
      paddingX + valueToCoordinate(ms - sortedData[0].ms, 0, msSpan, drawWidth),
    y:
      paddingY -
      (valueToCoordinate(
        val - minimalTempData.val,
        minimalTempData.val,
        maximalTempData.val,
        drawHeight
      ) -
        drawHeight),
  }))

  context.beginPath()
  context.strokeStyle = "#333"
  context.moveTo(temperaturePoints[0].x, temperaturePoints[0].y)
  temperaturePoints.slice(1).forEach(({ x, y }) => {
    context.lineTo(x, y)
  })
  context.stroke()

  const nowText = nowTempData.val + unit
  const nowTemperatureCoordinate =
    temperaturePoints[temperaturePoints.length - 1]
  const measuredNow = context.measureText(nowText)
  const nowX = WIDTH - paddingX * 2 - measuredNow.width
  const nowY = nowTemperatureCoordinate.y
  const padding = 5
  context.fillStyle = "#fff8"
  context.fillRect(
    nowX - padding,
    nowY - measuredNow.actualBoundingBoxAscent - padding,
    measuredNow.width + padding * 2,
    measuredNow.actualBoundingBoxAscent +
      measuredNow.actualBoundingBoxDescent +
      padding * 2
  )
  context.fillStyle = "#f65"
  context.fillText(nowText, nowX, nowY)
  context.fillRect(
    nowTemperatureCoordinate.x - 2,
    nowTemperatureCoordinate.y - 2,
    4,
    4
  )

  context.fillStyle = "#333"
  context.fillText(maximalTempData.val + unit, paddingX, paddingY * 2)
  context.fillText(minimalTempData.val + unit, paddingX, HEIGHT - paddingY * 2)
  context.fillText(
    title,
    WIDTH - paddingX - context.measureText(title).width,
    paddingY * 2
  )

  const outStream = fs.createWriteStream(fileName)
  canvas.createPNGStream().pipe(outStream)
  return outStream
}
