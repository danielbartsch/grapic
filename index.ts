const { createCanvas } = require("canvas")
const fs = require("fs")

const valueToCoordinate = (value, minValue, maxValue, maxCoordinate) =>
  ((value - minValue) / (maxValue - minValue)) * maxCoordinate

export const getGraph = ({
  data,
  markers,
  fileName,
  unit = "",
  title = "",
}: {
  data: Array<{ time: number; value: number }>
  markers?: Array<{ time: number; value: string }>
  fileName: string
  unit?: string
  title?: string
}) => {
  // sorting, so results are consistent (otherwise order is not guaranteed)
  const validData = data
    .sort((a, b) => a.time - b.time)
    .filter(({ value }) => Number.isFinite(value))

  const minimalTemperature = Math.min(...validData.map(({ value }) => value))
  const minimalTempData = validData.find(
    ({ value }) => value === minimalTemperature
  )

  const maximalTemperature = Math.max(...validData.map(({ value }) => value))
  const maximalTempData = validData.find(
    ({ value }) => value === maximalTemperature
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

  const timeSpan = validData[validData.length - 1].time - validData[0].time
  const minTime = validData[0].time
  const maxTime = validData[validData.length - 1].time

  const HOUR_MS = 1000 * 60 * 60
  Array.from({ length: Math.ceil(timeSpan / HOUR_MS) }).forEach((_, index) => {
    const time = HOUR_MS * index + minTime
    const x = paddingX + valueToCoordinate(time, minTime, maxTime, drawWidth)

    context.beginPath()
    context.moveTo(x, paddingY)
    context.lineTo(x, HEIGHT - paddingY)
    const hour = new Date(time).getHours()
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

  const temperaturePoints = validData.map(({ time, value }) => ({
    x: paddingX + valueToCoordinate(time, minTime, maxTime, drawWidth),
    y:
      paddingY -
      (valueToCoordinate(
        value,
        minimalTempData.value,
        maximalTempData.value,
        drawHeight
      ) -
        drawHeight),
  }))

  if (markers) {
    markers.forEach(({ time, value }) => {
      const x = paddingX + valueToCoordinate(time, minTime, maxTime, drawWidth)
      context.beginPath()
      context.moveTo(x, paddingY)
      context.lineTo(x, HEIGHT - paddingY)
      context.save()
      context.translate(x, HEIGHT - paddingY)
      context.rotate((Math.PI * 3) / 2)
      context.strokeStyle = "#dda900"
      context.fillStyle = "#dda900"
      context.fillText(value, 36, -3)
      context.lineWidth = 2
      context.stroke()
      context.restore()
    })
  }

  context.beginPath()
  context.strokeStyle = "#333"
  context.moveTo(temperaturePoints[0].x, temperaturePoints[0].y)
  temperaturePoints.slice(1).forEach(({ x, y }) => {
    context.lineTo(x, y)
  })
  context.stroke()

  context.textBaseline = "middle"
  context.font = "30px monospace"

  const nowText = nowTempData.value + unit
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
  context.fillText(maximalTempData.value + unit, paddingX, paddingY * 2)
  context.fillText(
    minimalTempData.value + unit,
    paddingX,
    HEIGHT - paddingY * 2
  )
  context.fillText(
    title,
    WIDTH - paddingX - context.measureText(title).width,
    paddingY * 2
  )

  const outStream = fs.createWriteStream(fileName)
  canvas.createPNGStream().pipe(outStream)
  return outStream
}
