import { getGraph } from "../index"

getGraph({
  data: [
    { ms: 1000 * 60 * 60 * 0, val: 10 },
    { ms: 1000 * 60 * 60 * 24, val: 100 },
  ],
  fileName: __dirname + "/two24h.png",
  title: "two24h",
})

getGraph({
  data: [
    { ms: 1000 * 60 * 60 * 0, val: 10 },
    { ms: 1000 * 60 * 60 * 1, val: 30 },
    { ms: 1000 * 60 * 60 * 2, val: 10 },
    { ms: 1000 * 60 * 60 * 3, val: 100 },
  ],
  fileName: __dirname + "/3h.png",
  title: "3h",
})

getGraph({
  data: [
    { ms: 1000 * 60 * 60 * 0, val: -10 },
    { ms: 1000 * 60 * 60 * 12, val: 20 },
  ],
  fileName: __dirname + "/negativeValues.png",
  title: "negativeValues",
})
