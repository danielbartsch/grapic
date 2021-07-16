const STEP = [5, 10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000]

export const roundAxis = ({
  minValue,
  maxValue,
}: {
  minValue: number
  maxValue: number
}) => {
  const maxIsNegative = maxValue < 0
  const calculatingMaxValue = maxIsNegative ? -maxValue : maxValue
  const maxStepIndex = STEP.findIndex((value) => calculatingMaxValue < value)
  const actualMaxStep =
    STEP[maxStepIndex === -1 || maxStepIndex === 0 ? 0 : maxStepIndex - 1]
  const maxMethod = maxIsNegative ? "floor" : "ceil"
  const maxRounded =
    Math[maxMethod](calculatingMaxValue / actualMaxStep) * actualMaxStep

  const minIsNegative = minValue < 0
  const calculatingMinValue = minIsNegative ? -minValue : minValue
  const minStepIndex = STEP.findIndex((value) => calculatingMinValue < value)
  const actualMinStep =
    STEP[minStepIndex === -1 || minStepIndex === 0 ? 0 : minStepIndex - 1]
  const minMethod = minIsNegative ? "ceil" : "floor"
  const minRounded =
    Math[minMethod](calculatingMinValue / actualMinStep) * actualMinStep

  return {
    min: minIsNegative ? -minRounded : minRounded,
    max: maxIsNegative ? -maxRounded : maxRounded,
  }
}

export const getAxisTicks = ({
  minValue,
  maxValue,
}: {
  minValue: number
  maxValue: number
}) => {
  const maxTicks = 10

  const steps = []

  if (minValue < 0 && maxValue > 0) {
    const minSpan = Math.abs(minValue)
    const minTickStep = STEP.find((step) => minSpan / step <= maxTicks)
    const minStepCount = minSpan / minTickStep + 1

    for (let index = 0; index < minStepCount; index++) {
      steps.push(minValue + minTickStep * index)
    }

    const maxTickStep = STEP.find((step) => maxValue / step <= maxTicks)
    const maxStepCount = maxValue / maxTickStep + 1

    for (let index = 0; index < maxStepCount; index++) {
      steps.push(maxTickStep * index)
    }
  } else {
    const span = Math.abs(minValue) + Math.abs(maxValue)

    const tickStep = STEP.find((step) => span / step <= maxTicks)
    const stepCount = span / tickStep + 1
    for (let index = 0; index < stepCount; index++) {
      steps.push(minValue + tickStep * index)
    }
  }

  return steps
}
