import { roundAxis } from "./axisrounding"
const { createCanvas } = require("canvas")
const fs = require("fs")

const valueToCoordinate = (value, minValue, maxValue, maxCoordinate) =>
  ((value - minValue) / (maxValue - minValue)) * maxCoordinate

const WIDTH = 900
const HEIGHT = 600
const PADDING_LEFT = 15
const PADDING_RIGHT = 15
const PADDING_Y = 15
const DRAW_WIDTH = WIDTH - (PADDING_LEFT + PADDING_RIGHT)
const DRAW_HEIGHT = HEIGHT - PADDING_Y * 2

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

  const minValue = Math.min(...validData.map(({ value }) => value))
  const minValueDataPoint = validData.find(({ value }) => value === minValue)

  const maxValue = Math.max(...validData.map(({ value }) => value))
  const maxValueDataPoint = validData.find(({ value }) => value === maxValue)

  const canvas = createCanvas(WIDTH, HEIGHT)
  const context = canvas.getContext("2d")
  context.fillStyle = "#F5F7F2"
  context.fillRect(0, 0, WIDTH, HEIGHT)

  context.font = "15px monospace"
  context.textBaseline = "alphabetic"

  const minTime = validData[0].time
  const maxTime = validData[validData.length - 1].time
  const timeSpan = maxTime - minTime

  const HOUR_MS = 1000 * 60 * 60
  Array.from({ length: Math.ceil(timeSpan / HOUR_MS) }).forEach((_, index) => {
    const time = HOUR_MS * index + minTime
    const hour = new Date(time).getHours()
    drawVerticalLine({
      label: hour % 3 === 0 ? hour + "h" : "",
      x: PADDING_LEFT + valueToCoordinate(time, minTime, maxTime, DRAW_WIDTH),
      context,
      width: hour % 6 === 0 ? 2 : 1,
      lineColor: hour % 6 === 0 ? "#bbb" : "#ddd",
      textColor: "#333",
    })
  })

  const { min, max } = roundAxis({
    minValue: minValueDataPoint.value,
    maxValue: maxValueDataPoint.value,
  })

  const dataPoints = validData.map(({ time, value }) => ({
    x: PADDING_LEFT + valueToCoordinate(time, minTime, maxTime, DRAW_WIDTH),
    y:
      PADDING_Y -
      (valueToCoordinate(value, min, max, DRAW_HEIGHT) - DRAW_HEIGHT),
  }))

  if (markers) {
    markers.forEach(({ time, value }) =>
      drawVerticalLine({
        label: value,
        x: PADDING_LEFT + valueToCoordinate(time, minTime, maxTime, DRAW_WIDTH),
        context,
        width: 2,
        lineColor: "#dda900",
        textColor: "#dda900",
      })
    )
  }

  context.beginPath()
  context.strokeStyle = "#333"
  context.lineWidth = 1
  context.moveTo(dataPoints[0].x, dataPoints[0].y)
  dataPoints.slice(1).forEach(({ x, y }) => {
    context.lineTo(x, y)
  })
  context.stroke()

  context.textBaseline = "middle"
  context.font = "30px monospace"

  const nowValueData = validData[validData.length - 1]
  const nowText = nowValueData.value + unit
  const nowValueCoordinate = dataPoints[dataPoints.length - 1]
  const measuredNow = context.measureText(nowText)
  const nowX = DRAW_WIDTH - measuredNow.width
  const nowY = nowValueCoordinate.y
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
  context.fillRect(nowValueCoordinate.x - 2, nowValueCoordinate.y - 2, 4, 4)

  context.fillStyle = "#333"
  context.fillText(maxValueDataPoint.value + unit, PADDING_LEFT, PADDING_Y * 2)
  context.fillText(
    minValueDataPoint.value + unit,
    PADDING_LEFT,
    HEIGHT - PADDING_Y * 2
  )
  context.fillText(
    title,
    WIDTH - PADDING_RIGHT - context.measureText(title).width,
    PADDING_Y * 2
  )

  const outStream = fs.createWriteStream(fileName)
  canvas.createPNGStream().pipe(outStream)
  return outStream
}

const drawVerticalLine = ({
  label = "",
  x,
  context,
  width,
  lineColor,
  textColor,
}: {
  label?: string
  x: number
  context: CanvasRenderingContext2D
  width: number
  lineColor: string
  textColor: string
}) => {
  context.beginPath()
  context.moveTo(x, PADDING_Y)
  context.lineTo(x, HEIGHT - PADDING_Y)
  context.save()
  context.translate(x, HEIGHT - PADDING_Y)
  context.rotate((Math.PI * 3) / 2)
  context.strokeStyle = lineColor
  context.fillStyle = textColor
  context.fillText(label, 36, -3)
  context.lineWidth = width
  context.stroke()
  context.restore()
}
