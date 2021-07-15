import { test, assertEqual, run } from "@danielbartsch/testing"
import { roundAxis } from "../axisrounding"

test("same value", () => {
  assertEqual(roundAxis({ minValue: 0, maxValue: 0 }), { min: 0, max: 0 })
})
test("nearest small number", () => {
  assertEqual(roundAxis({ minValue: 0, maxValue: 4.3 }), { min: 0, max: 5 })
})
test("nearest bigger number", () => {
  assertEqual(roundAxis({ minValue: 0, maxValue: 43 }), { min: 0, max: 50 })
  assertEqual(roundAxis({ minValue: 13, maxValue: 26 }), { min: 10, max: 30 })
})
test("nearest negative number", () => {
  assertEqual(roundAxis({ minValue: -4, maxValue: 2 }), { min: -5, max: 5 })
})

run()
