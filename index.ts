import { getAxisTicks, roundAxis } from "./axisrounding"
const { createCanvas } = require("canvas")
const fs = require("fs")

const WIDTH = 900
const HEIGHT = 600
const PADDING_LEFT = 45
const PADDING_RIGHT = 15
const PADDING_Y = 15
const DRAW_WIDTH = WIDTH - (PADDING_LEFT + PADDING_RIGHT)
const DRAW_HEIGHT = HEIGHT - PADDING_Y * 2

type DataPoint = {
  time: number
  value: number
}

export const getGraph = ({
  data,
  markers,
  fileName,
  unit = "",
  title = "",
}: {
  data: Array<DataPoint>
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
      x: dataPointToXCoordinate(
        { value: 0, time },
        { min: minTime, max: maxTime }
      ),
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

  drawYAxis({
    context,
    ticks: getAxisTicks({ minValue: min, maxValue: max }),
    min,
    max,
  })

  const dataPoints = validData.map((dataPoint) =>
    dataPointToCoordinate(dataPoint, {
      minTime,
      maxTime,
      minValue: min,
      maxValue: max,
    })
  )

  if (markers) {
    markers.forEach(({ time, value }) =>
      drawVerticalLine({
        label: value,
        x: dataPointToXCoordinate(
          { time, value: 0 },
          { min: minTime, max: maxTime }
        ),
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

  const lastDataPoint = validData[validData.length - 1]
  drawDataPointLabel({
    context,
    dataPoint: lastDataPoint,
    label: lastDataPoint.value + unit,
    maxTime,
    maxValue: max,
    minTime,
    minValue: min,
  })

  drawDataPointLabel({
    context,
    dataPoint: maxValueDataPoint,
    label: "max " + maxValueDataPoint.value + unit,
    maxTime,
    maxValue: max,
    minTime,
    minValue: min,
  })

  drawDataPointLabel({
    context,
    dataPoint: minValueDataPoint,
    label: "min " + minValueDataPoint.value + unit,
    maxTime,
    maxValue: max,
    minTime,
    minValue: min,
  })

  context.fillStyle = "#333"
  context.fillText(
    title,
    WIDTH - PADDING_RIGHT - context.measureText(title).width,
    PADDING_Y * 2
  )

  const outStream = fs.createWriteStream(fileName)
  canvas.createPNGStream().pipe(outStream)
  return outStream
}

const valueToCoordinate = (value, minValue, maxValue, maxCoordinate) =>
  ((value - minValue) / (maxValue - minValue)) * maxCoordinate

const dataPointToXCoordinate = ({ time }: DataPoint, { min, max }) =>
  PADDING_LEFT + valueToCoordinate(time, min, max, DRAW_WIDTH)

const dataPointToYCoordinate = ({ value }: DataPoint, { min, max }) =>
  PADDING_Y - (valueToCoordinate(value, min, max, DRAW_HEIGHT) - DRAW_HEIGHT)

const dataPointToCoordinate = (
  dataPoint: DataPoint,
  { minTime, maxTime, minValue, maxValue }
) => ({
  x: dataPointToXCoordinate(dataPoint, { min: minTime, max: maxTime }),
  y: dataPointToYCoordinate(dataPoint, { min: minValue, max: maxValue }),
})

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

const drawYAxis = ({ context, ticks, min, max }) => {
  context.beginPath()
  context.moveTo(PADDING_LEFT, PADDING_Y)
  context.lineTo(PADDING_LEFT, PADDING_Y + DRAW_HEIGHT)
  context.stroke()
  const axisPadding = 8

  context.textBaseline = "middle"
  ticks.forEach((tickY) => {
    const y = dataPointToYCoordinate({ value: tickY, time: 0 }, { min, max })
    context.fillStyle = "#333"
    context.fillText(
      tickY,
      PADDING_LEFT - context.measureText(tickY).width - axisPadding * 1.5,
      y
    )
    context.beginPath()
    context.moveTo(PADDING_LEFT, y)
    context.lineTo(PADDING_LEFT - axisPadding, y)
    context.stroke()
  })
}

const drawDataPointLabel = ({
  context,
  dataPoint,
  label,
  maxTime,
  maxValue,
  minTime,
  minValue,
}: {
  dataPoint: DataPoint
  label: string
  context: CanvasRenderingContext2D
  maxTime: number
  maxValue: number
  minTime: number
  minValue: number
}) => {
  const { x, y } = dataPointToCoordinate(dataPoint, {
    minTime,
    maxTime,
    minValue,
    maxValue,
  })
  context.textBaseline = "middle"
  context.font = "30px monospace"
  const measuredLabel = context.measureText(label)
  const labelDataPointGap = 32
  const newX = x - measuredLabel.width - labelDataPointGap
  const labelBoxPadding = 8
  context.fillStyle = "#fff8"
  context.fillRect(
    newX - labelBoxPadding,
    y - measuredLabel.actualBoundingBoxAscent - labelBoxPadding,
    measuredLabel.width + labelBoxPadding * 2,
    measuredLabel.actualBoundingBoxAscent +
      measuredLabel.actualBoundingBoxDescent +
      labelBoxPadding * 2
  )
  context.fillStyle = "#f65"
  context.fillText(label, newX, y)
  context.fillRect(x - 2, y - 2, 4, 4)
}
