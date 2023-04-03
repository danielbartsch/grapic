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

export const roundAxis = ({
  minValue,
  maxValue,
  step,
}: {
  minValue: number
  maxValue: number
  step: number
}) => ({
  min: Math.floor(minValue / step) * step,
  max: Math.ceil(maxValue / step) * step,
})

export const getAxisTicks = ({
  minValue,
  maxValue,
}: {
  minValue: number
  maxValue: number
}) => {
  const nearestStep = getNearestStep({ maxValue, minValue })
  const steps = []

  let min = minValue

  steps.push(min)
  while (min < maxValue) {
    min += nearestStep
    steps.push(min)
  }
  return steps
}
