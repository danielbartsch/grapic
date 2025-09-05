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

const STEP_ABBREVIATIONS = [
  { label: "µ", power: -6 }, // 0.000,001
  { label: "m", power: -3 }, // 0.001
  { label: "c", power: -2 }, // 0.01
  { label: "", power: 0 }, // 1
  { label: "k", power: 3 }, // 1,000
  { label: "M", power: 6 }, // 1,000,000
  { label: "G", power: 9 }, // 1,000,000,000
]
const axisTickOptionWithSI = (value) => {
  const abbreviationIndex =
    value === 0
      ? STEP_ABBREVIATIONS.findIndex(({ power }) => power === 0)
      : STEP_ABBREVIATIONS.findIndex(
          (_, index) =>
            Math.abs(value) < 10 ** STEP_ABBREVIATIONS[index + 1].power
        )

  const SIreducedNumber =
    value / 10 ** STEP_ABBREVIATIONS[abbreviationIndex].power

  const floatingPointRoundedValue =
    SIreducedNumber === Math.floor(SIreducedNumber)
      ? SIreducedNumber
      : SIreducedNumber.toFixed(1)

  return {
    value,
    label:
      floatingPointRoundedValue + STEP_ABBREVIATIONS[abbreviationIndex].label,
  }
}

export const getAxisTicks = ({
  minValue,
  maxValue,
  step,
}: {
  minValue: number
  maxValue: number
  step: number
}) => {
  const steps: Array<{ value: number; label: string }> = []

  let min = minValue

  steps.push(axisTickOptionWithSI(min))
  while (min < maxValue) {
    min += step
    steps.push(axisTickOptionWithSI(min))
  }
  return steps
}
