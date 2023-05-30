import { getAxisTicks, roundAxis } from "./axisrounding"
const { createCanvas } = require("canvas")
const fs = require("fs")

const WIDTH = 900
const HEIGHT = 600
const PADDING_LEFT = 55
const PADDING_RIGHT = 15
const PADDING_TOP = 10
const PADDING_BOTTOM = 10
const DRAW_WIDTH = WIDTH - (PADDING_LEFT + PADDING_RIGHT)
const DRAW_HEIGHT = HEIGHT - (PADDING_TOP + PADDING_BOTTOM)

type DataPoint = {
  time: number
  value: number
}

const MIN_STEP_COUNT = 6

const POSSIBLE_STEPS = Array.from({ length: 7 })
  .map((_, index) => [1, 2, 5].map((step) => step * 10 ** index))
  .reduce((acc, stepGroup) => acc.concat(stepGroup), [])

const getNearestStep = ({
  maxValue,
  minValue,
}: {
  maxValue: number
  minValue: number
}) => {
  const range = Math.abs(maxValue - minValue)
  const roughStep = range / MIN_STEP_COUNT

  return POSSIBLE_STEPS.reduce(
    (acc, step) => {
      const stepDiff = Math.abs(step - roughStep)
      return stepDiff < acc.diff
        ? { step, diff: stepDiff }
        : { step: acc.step, diff: acc.diff }
    },
    { step: 0, diff: Number.POSITIVE_INFINITY }
  ).step
}

export const getGraph = ({
  data,
  markers,
  fileName,
  unit = "",
}: {
  // data needs to already be sorted by time, starting with the oldest
  data: Array<Array<DataPoint>>
  markers?: Array<{ time: number; value: string }>
  fileName: string
  unit?: string
}) => {
  const {
    maxTimeDataPoint,
    maxValueDataPoint,
    minTimeDataPoint,
    minValueDataPoint,
  } = getMinMaxFromGroups(data)

  const canvas = createCanvas(WIDTH, HEIGHT)
  const context = canvas.getContext("2d")
  context.fillStyle = "#F5F7F2"
  context.fillRect(0, 0, WIDTH, HEIGHT)

  context.font = "16px monospace"
  context.textBaseline = "alphabetic"

  drawVerticalTimeLines(context, minTimeDataPoint.time, maxTimeDataPoint.time)

  const nearestYAxisStep = getNearestStep({
    minValue: minValueDataPoint.value,
    maxValue: maxValueDataPoint.value,
  })

  const { min, max } = roundAxis({
    minValue: minValueDataPoint.value,
    maxValue: maxValueDataPoint.value,
    step: nearestYAxisStep,
  })

  drawYAxis({
    context,
    ticks: getAxisTicks({
      minValue: min,
      maxValue: max,
      step: nearestYAxisStep,
    }),
    min,
    max,
    unit,
  })

  const dataPoints = data.map((dataGroup) =>
    dataGroup.map((dataPoint) =>
      dataPointToCoordinate(dataPoint, {
        minTime: minTimeDataPoint.time,
        maxTime: maxTimeDataPoint.time,
        minValue: min,
        maxValue: max,
      })
    )
  )

  if (markers) {
    markers.forEach(({ time, value }) =>
      drawVerticalLine({
        label: value,
        x: dataPointToXCoordinate(
          { time, value: 0 },
          { min: minTimeDataPoint.time, max: maxTimeDataPoint.time }
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
  dataPoints.forEach((dataGroup) => {
    context.moveTo(dataGroup[0].x, dataGroup[0].y)
    dataGroup.slice(1).forEach(({ x, y }) => {
      context.lineTo(x, y)
    })
  })
  context.stroke()

  drawDataPointLabel({
    context,
    dataPoint: maxTimeDataPoint,
    label: String(maxTimeDataPoint.value),
    maxTime: maxTimeDataPoint.time,
    maxValue: max,
    minTime: maxTimeDataPoint.time,
    minValue: min,
  })

  drawDataPointLabel({
    context,
    dataPoint: maxValueDataPoint,
    label: "max " + maxValueDataPoint.value,
    maxTime: maxTimeDataPoint.time,
    maxValue: max,
    minTime: minTimeDataPoint.time,
    minValue: min,
  })

  drawDataPointLabel({
    context,
    dataPoint: minValueDataPoint,
    label: "min " + minValueDataPoint.value,
    maxTime: maxTimeDataPoint.time,
    maxValue: max,
    minTime: maxTimeDataPoint.time,
    minValue: min,
  })

  const outStream = fs.createWriteStream(fileName)
  canvas.createPNGStream().pipe(outStream)

  return outStream
}

const getMinMaxFromGroups = (
  data: Array<Array<DataPoint>>
): {
  minValueDataPoint: DataPoint
  maxValueDataPoint: DataPoint
  minTimeDataPoint: DataPoint
  maxTimeDataPoint: DataPoint
} =>
  data.reduce(
    (aggregator, dataGroup) => {
      const minValue = Math.min(...dataGroup.map(({ value }) => value))
      const newMinValueDataPoint =
        minValue < aggregator.minValueDataPoint.value
          ? dataGroup.find(({ value }) => value === minValue)
          : aggregator.minValueDataPoint

      const maxValue = Math.max(...dataGroup.map(({ value }) => value))
      const newMaxValueDataPoint =
        maxValue > aggregator.maxValueDataPoint.value
          ? dataGroup.find(({ value }) => value === maxValue)
          : aggregator.maxValueDataPoint

      const minTime = dataGroup[0]
      const newMinTimeDataPoint =
        minTime.time < aggregator.minTimeDataPoint.time
          ? minTime
          : aggregator.minTimeDataPoint
      const maxTime = dataGroup[dataGroup.length - 1]
      const newMaxTimeDataPoint =
        maxTime.time > aggregator.maxTimeDataPoint.time
          ? maxTime
          : aggregator.maxTimeDataPoint

      return {
        minValueDataPoint: newMinValueDataPoint,
        maxValueDataPoint: newMaxValueDataPoint,
        minTimeDataPoint: newMinTimeDataPoint,
        maxTimeDataPoint: newMaxTimeDataPoint,
      }
    },
    {
      minValueDataPoint: { value: Number.POSITIVE_INFINITY, time: 0 },
      maxValueDataPoint: { value: Number.NEGATIVE_INFINITY, time: 0 },
      minTimeDataPoint: { value: 0, time: Number.POSITIVE_INFINITY },
      maxTimeDataPoint: { value: 0, time: Number.NEGATIVE_INFINITY },
    }
  )

const drawVerticalTimeLines = (
  context: CanvasRenderingContext2D,
  minTime: number,
  maxTime: number
) => {
  const timeSpan = maxTime - minTime
  const HOUR_MS = 1000 * 60 * 60

  if (timeSpan < HOUR_MS * 96) {
    drawVerticalLinesEveryNth({
      context,
      minTime,
      maxTime,
      nthMilliseconds: HOUR_MS,
      getProps: (time) => {
        const hour = new Date(time).getHours()

        return {
          label: hour % 3 === 0 ? hour + "h" : "",
          width: hour % 6 === 0 ? 2 : 1,
          lineColor: hour % 6 === 0 ? "#bbb" : "#ddd",
        }
      },
    })
  } else if (timeSpan < HOUR_MS * 24 * 10) {
    drawVerticalLinesEveryNth({
      context,
      minTime,
      maxTime,
      nthMilliseconds: HOUR_MS * 3,
      getProps: (time) => {
        const hour = new Date(time).getHours()

        const dateTime = new Date(time)

        let label = ""
        if (dateTime.getHours() === 0) {
          label = `${twoDigit(dateTime.getDate())}.${twoDigit(
            dateTime.getMonth() + 1
          )}`
        } else if (dateTime.getHours() === 12) {
          label = `${twoDigit(dateTime.getHours())}:${twoDigit(
            dateTime.getMinutes()
          )}`
        }

        return {
          label,
          width: hour % 8 === 0 ? 2 : 1,
          lineColor: hour % 8 === 0 ? "#bbb" : "#ddd",
        }
      },
    })
  } else if (timeSpan < HOUR_MS * 24 * 31) {
    drawVerticalLinesEveryNth({
      context,
      minTime,
      maxTime,
      nthMilliseconds: HOUR_MS * 24,
      getProps: (time) => {
        const dateTime = new Date(time)

        return {
          label:
            dateTime.getDate() % 2 === 0
              ? `${twoDigit(dateTime.getDate())}.${twoDigit(
                  dateTime.getMonth() + 1
                )}`
              : "",
          width: dateTime.getDate() % 2 === 0 ? 2 : 1,
          lineColor: dateTime.getDate() % 2 === 0 ? "#bbb" : "#ddd",
        }
      },
    })
  }
}

export const timesToNearestRemainderLess = (
  minTime: number,
  maxTime: number,
  nthMilliseconds: number,
  timezoneOffset: number = new Date().getTimezoneOffset() // minutes
) => {
  const timezoneOffsetMilliseconds = timezoneOffset * 60 * 1000
  return {
    minTime: minTime - (minTime % nthMilliseconds) + timezoneOffsetMilliseconds,
    maxTime: maxTime + (nthMilliseconds - (maxTime % nthMilliseconds)),
  }
}

const drawVerticalLinesEveryNth = ({
  context,
  minTime,
  maxTime,
  nthMilliseconds,
  getProps,
}: {
  context: CanvasRenderingContext2D
  minTime: number
  maxTime: number
  nthMilliseconds: number
  getProps: (
    time: number
  ) => Omit<
    Parameters<typeof drawVerticalLine>[0],
    "context" | "textColor" | "x"
  >
}) => {
  const {
    minTime: minTimeRoundedToNextNthMillisecondsDivider,
    maxTime: maxTimeRoundedToNextNthMillisecondsDivider,
  } = timesToNearestRemainderLess(minTime, maxTime, nthMilliseconds)
  const timeSpan =
    maxTimeRoundedToNextNthMillisecondsDivider -
    minTimeRoundedToNextNthMillisecondsDivider

  Array.from({ length: Math.ceil(timeSpan / nthMilliseconds) }).forEach(
    (_, index) => {
      const time =
        nthMilliseconds * index + minTimeRoundedToNextNthMillisecondsDivider
      drawVerticalLine({
        context,
        textColor: "#333",
        x: dataPointToXCoordinate(
          { value: 0, time },
          {
            min: minTime,
            max: maxTime,
          }
        ),
        ...getProps(time),
      })
    }
  )
}

const twoDigit = (number: number) => (number < 10 ? "0" + number : number)

const valueToCoordinate = (value, minValue, maxValue, maxCoordinate) =>
  ((value - minValue) / (maxValue - minValue)) * maxCoordinate

const dataPointToXCoordinate = ({ time }: DataPoint, { min, max }) =>
  PADDING_LEFT + valueToCoordinate(time, min, max, DRAW_WIDTH)

const dataPointToYCoordinate = ({ value }: DataPoint, { min, max }) =>
  PADDING_TOP - (valueToCoordinate(value, min, max, DRAW_HEIGHT) - DRAW_HEIGHT)

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
  if (x >= PADDING_LEFT) {
    context.textBaseline = "alphabetic"
    context.beginPath()
    context.moveTo(x, PADDING_TOP)
    context.lineTo(x, HEIGHT - PADDING_BOTTOM)
    context.save()
    context.translate(x, HEIGHT - PADDING_BOTTOM)
    context.rotate((Math.PI * 3) / 2)
    context.strokeStyle = lineColor
    context.fillStyle = textColor
    context.fillText(label, 36, -3)
    context.lineWidth = width
    context.stroke()
    context.restore()
  }
}

const AXIS_TICK_MARKER_LENGTH = 8
const FONT_PADDING_FROM_Y_AXIS = 4
const drawYAxis = ({
  context,
  ticks,
  min,
  max,
  unit,
}: {
  context: CanvasRenderingContext2D
  ticks: Array<{ value: number; label: string }>
  min: number
  max: number
  unit: string
}) => {
  context.beginPath()
  context.moveTo(PADDING_LEFT, PADDING_TOP)
  context.lineTo(PADDING_LEFT, PADDING_TOP + DRAW_HEIGHT)
  context.stroke()

  context.textBaseline = "middle"
  ticks.forEach(({ value: tickY, label: tickLabel }) => {
    const y = dataPointToYCoordinate({ value: tickY, time: 0 }, { min, max })
    context.fillStyle = "#333"
    context.fillText(
      tickLabel,
      PADDING_LEFT -
        context.measureText(tickLabel).width -
        (AXIS_TICK_MARKER_LENGTH + FONT_PADDING_FROM_Y_AXIS),
      y
    )
    context.beginPath()
    context.moveTo(PADDING_LEFT, y)
    context.lineTo(PADDING_LEFT - AXIS_TICK_MARKER_LENGTH, y)
    context.stroke()
  })

  context.fillText(unit, 0, HEIGHT / 2)
}

const LABEL_BOX_PADDING = 8
const POINT_SIZE = 6

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
  context.font = "24px monospace"
  const measuredLabel = context.measureText(label)
  const labelDataPointGap = 32
  const labelX =
    x - measuredLabel.width - labelDataPointGap < PADDING_LEFT
      ? x + labelDataPointGap
      : x - measuredLabel.width - labelDataPointGap

  const textHeight =
    measuredLabel.actualBoundingBoxAscent +
    measuredLabel.actualBoundingBoxDescent

  const dataLabelBoundaryBoxHeight = textHeight + LABEL_BOX_PADDING * 2
  const dataLabelBoundaryBox = {
    x: labelX - LABEL_BOX_PADDING,
    y: Math.min(
      Math.max(
        y - measuredLabel.actualBoundingBoxAscent - LABEL_BOX_PADDING,
        PADDING_TOP
      ),
      HEIGHT - PADDING_BOTTOM - dataLabelBoundaryBoxHeight
    ),
    width: measuredLabel.width + LABEL_BOX_PADDING * 2,
    height: dataLabelBoundaryBoxHeight,
  }
  context.fillStyle = "#fff8"
  context.fillRect(
    dataLabelBoundaryBox.x,
    dataLabelBoundaryBox.y,
    dataLabelBoundaryBox.width,
    dataLabelBoundaryBox.height
  )

  context.fillStyle = "#f65"
  context.fillText(
    label,
    labelX,
    dataLabelBoundaryBox.y + textHeight / 2 + LABEL_BOX_PADDING
  )

  context.beginPath()
  context.arc(x, y, POINT_SIZE / 2, 0, 2 * Math.PI, false)
  context.fill()
}
