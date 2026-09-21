function sum(nums) {
  return nums.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0)
}
function averageFilled(nums) {
  const filled = nums.filter((n) => n !== 0)
  if (filled.length === 0) return 0
  return sum(filled) / filled.length
}

const starting = -15000
const income = [0, 0, 0, 0, 0, 0, 0, 0, 0, 24050, 16400, 15900]
const expenses = [0, 0, 0, 0, 0, 0, 0, 0, 0, 9679, 9825, 9413]
const net = income.map((v, i) => v - expenses[i])
const balance = []
for (let m = 0; m < 12; m++) {
  const prev = m === 0 ? starting : balance[m - 1]
  balance[m] = prev + net[m]
}

const expected = { oct: -629, nov: 5946, dec: 12433 }
const got = { oct: balance[9], nov: balance[10], dec: balance[11] }
console.log(JSON.stringify({ got, expected, avgIncome: Math.round(averageFilled(income)) }, null, 2))
if (got.oct !== expected.oct || got.nov !== expected.nov || got.dec !== expected.dec) {
  process.exit(1)
}
console.log('CALC_OK')
