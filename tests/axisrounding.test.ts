import { test, assertEqual, run } from "@danielbartsch/testing"
import { roundAxis, getAxisTicks } from "../axisrounding"

test("same value", () => {
  assertEqual(roundAxis({ minValue: 0, maxValue: 0, step: 5 }), {
    min: 0,
    max: 0,
  })
})
test("nearest small number", () => {
  assertEqual(roundAxis({ minValue: 0, maxValue: 4.3, step: 5 }), {
    min: 0,
    max: 5,
  })
})
test("nearest bigger number", () => {
  assertEqual(roundAxis({ minValue: 0, maxValue: 43, step: 5 }), {
    min: 0,
    max: 45,
  })
  assertEqual(roundAxis({ minValue: 13, maxValue: 26, step: 5 }), {
    min: 10,
    max: 30,
  })
})
test("nearest negative number", () => {
  assertEqual(roundAxis({ minValue: -4, maxValue: 2, step: 5 }), {
    min: -5,
    max: 5,
  })
})
test("floating point", () => {
  assertEqual(roundAxis({ minValue: 17.5, maxValue: 37.1, step: 5 }), {
    min: 15,
    max: 40,
  })
})

test("positive", () => {
  assertEqual(getAxisTicks({ minValue: 0, maxValue: 100, step: 20 }), [
    { value: 0, label: "0" },
    { value: 20, label: "20" },
    { value: 40, label: "40" },
    { value: 60, label: "60" },
    { value: 80, label: "80" },
    { value: 100, label: "100" },
  ])
})
test("spanning negative + positive", () => {
  assertEqual(
    getAxisTicks({ minValue: -30, maxValue: 150, step: 20 }),
    [-30, -10, 10, 30, 50, 70, 90, 110, 130, 150].map((val) => ({
      value: val,
      label: String(val),
    }))
  )
})
test("large numbers", () => {
  assertEqual(getAxisTicks({ minValue: -1500, maxValue: 4001, step: 1000 }), [
    { value: -1500, label: "-1.5k" },
    { value: -500, label: "-500" },
    { value: 500, label: "500" },
    { value: 1500, label: "1.5k" },
    { value: 2500, label: "2.5k" },
    { value: 3500, label: "3.5k" },
    { value: 4500, label: "4.5k" },
  ])
})

run()
