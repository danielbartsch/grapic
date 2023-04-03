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
  assertEqual(
    getAxisTicks({ minValue: 0, maxValue: 100 }),
    [0, 20, 40, 60, 80, 100]
  )
})
test("spanning negative + positive", () => {
  assertEqual(
    getAxisTicks({ minValue: -30, maxValue: 150 }),
    [-30, -10, 10, 30, 50, 70, 90, 110, 130, 150]
  )
})

run()
