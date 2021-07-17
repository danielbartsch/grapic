const STEP = 5

export const roundAxis = ({
  minValue,
  maxValue,
}: {
  minValue: number
  maxValue: number
}) => {
  return {
    min: Math.floor(minValue / STEP) * STEP,
    max: Math.ceil(maxValue / STEP) * STEP,
  }
}

export const getAxisTicks = ({
  minValue,
  maxValue,
}: {
  minValue: number
  maxValue: number
}) => {
  const steps = []

  let min = minValue

  steps.push(min)
  while (min < maxValue) {
    min += STEP
    steps.push(min)
  }
  return steps
}
