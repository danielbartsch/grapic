import { getGraph } from "../index"

getGraph({
  data: [
    { time: 1000 * 60 * 60 * 0, value: 10 },
    { time: 1000 * 60 * 60 * 24, value: 100 },
  ],
  fileName: __dirname + "/two24h.png",
  title: "two24h",
})

getGraph({
  data: [
    { time: 1000 * 60 * 60 * 0, value: 10 },
    { time: 1000 * 60 * 60 * 1, value: 30 },
    { time: 1000 * 60 * 60 * 2, value: 10 },
    { time: 1000 * 60 * 60 * 3, value: 100 },
  ],
  fileName: __dirname + "/3h.png",
  title: "3h",
})

getGraph({
  data: [
    { time: 1000 * 60 * 60 * 0, value: -10 },
    { time: 1000 * 60 * 60 * 12, value: 20 },
  ],
  fileName: __dirname + "/negativeValues.png",
  title: "negativeValues",
})

getGraph({
  data: [
    { time: 1000 * 60 * 60 * 0, value: 2.35 },
    { time: 1000 * 60 * 60 * 1, value: 0.93 },
    { time: 1000 * 60 * 60 * 2, value: 0.04 },
    { time: 1000 * 60 * 60 * 3, value: 0.19 },
    { time: 1000 * 60 * 60 * 4, value: 0.53 },
    { time: 1000 * 60 * 60 * 5, value: 0.86 },
    { time: 1000 * 60 * 60 * 6, value: 1.53 },
    { time: 1000 * 60 * 60 * 7, value: 0.17 },
    { time: 1000 * 60 * 60 * 8, value: 0.1 },
    { time: 1000 * 60 * 60 * 9, value: 1.05 },
    { time: 1000 * 60 * 60 * 10, value: 0.17 },
    { time: 1000 * 60 * 60 * 11, value: 0.39 },
    { time: 1000 * 60 * 60 * 12, value: 1.74 },
    { time: 1000 * 60 * 60 * 13, value: 1.55 },
    { time: 1000 * 60 * 60 * 14, value: 0.17 },
    { time: 1000 * 60 * 60 * 15, value: 0.03 },
    { time: 1000 * 60 * 60 * 16, value: 0.33 },
    { time: 1000 * 60 * 60 * 17, value: 0.92 },
    { time: 1000 * 60 * 60 * 18, value: 1.42 },
    { time: 1000 * 60 * 60 * 19, value: 0.37 },
    { time: 1000 * 60 * 60 * 20, value: 0.0 },
    { time: 1000 * 60 * 60 * 21, value: 0.02 },
    { time: 1000 * 60 * 60 * 22, value: 0.11 },
    { time: 1000 * 60 * 60 * 23, value: 0.22 },
    { time: 1000 * 60 * 60 * 24, value: 0.0 },
    { time: 1000 * 60 * 60 * 25, value: 0.1 },
    { time: 1000 * 60 * 60 * 26, value: 0.45 },
    { time: 1000 * 60 * 60 * 27, value: 2.42 },
    { time: 1000 * 60 * 60 * 28, value: 0.27 },
    { time: 1000 * 60 * 60 * 29, value: 3.78 },
    { time: 1000 * 60 * 60 * 30, value: 0.58 },
    { time: 1000 * 60 * 60 * 31, value: 0.51 },
    { time: 1000 * 60 * 60 * 32, value: 0.62 },
    { time: 1000 * 60 * 60 * 33, value: 0.08 },
    { time: 1000 * 60 * 60 * 34, value: 0.03 },
    { time: 1000 * 60 * 60 * 35, value: 3.15 },
    { time: 1000 * 60 * 60 * 36, value: 0.01 },
    { time: 1000 * 60 * 60 * 37, value: 0.0 },
    { time: 1000 * 60 * 60 * 38, value: 0.87 },
    { time: 1000 * 60 * 60 * 39, value: 0.29 },
    { time: 1000 * 60 * 60 * 40, value: 0.75 },
  ],
  fileName: __dirname + "/days.png",
  title: "days",
})

getGraph({
  data: [
    { time: 1626123722819, value: 23.4 },
    { time: 1626126487619, value: 21.8 },
    { time: 1626129252419, value: 20.6 },
    { time: 1626131153219, value: 20.1 },
    { time: 1626133399619, value: 19.3 },
    { time: 1626139447619, value: 18.3 },
    { time: 1626145322819, value: 17.7 },
    { time: 1626151198019, value: 17.5 },
    { time: 1626154481219, value: 18.6 },
    { time: 1626157246019, value: 19.8 },
    { time: 1626160010819, value: 21.3 },
    { time: 1626162775619, value: 22.95 },
    { time: 1626165713219, value: 25.4 },
    { time: 1626168478019, value: 27.5 },
    { time: 1626171242819, value: 29.6 },
    { time: 1626174180419, value: 31.6 },
    { time: 1626176945219, value: 33.65 },
    { time: 1626179710019, value: 35.8 },
    { time: 1626183166019, value: 37.1 },
    { time: 1626187658819, value: 36.2 },
    { time: 1626190942019, value: 34.5 },
    { time: 1626193879619, value: 33.2 },
    { time: 1626197508419, value: 30.2 },
    { time: 1626200273219, value: 25.9 },
    { time: 1626203383619, value: 22.5 },
    { time: 1626206148419, value: 21 },
  ],
  fileName: __dirname + "/realworld.png",
  title: "13.7.2021",
  unit: "°C",
})

getGraph({
  data: [
    { time: 1626129252419, value: 20.6 },
    { time: 1626145322819, value: 17.7 },
    { time: 1626160010819, value: 21.3 },
    { time: 1626171242819, value: 29.6 },
    { time: 1626183166019, value: 37.1 },
    { time: 1626197508419, value: 30.2 },
  ],
  markers: [
    { time: (1626145322819 + 1626160010819) / 2, value: "Sonnenaufgang" },
    { time: 1626197508419, value: "Sonnenuntergang" },
  ],
  fileName: __dirname + "/marker.png",
  title: "13.7.2021",
  unit: "°C",
})
