// https://www.vmi.lt/evmi/documents/20142/391017/Individualios+veiklos+apmokestinimo+tavrka+nuo+2018-01-01+%C4%AF+nauj%C4%85+KMK.pdf/35dee9e6-df89-da04-265d-60b67b404657?t=1543400149072
// https://www.sodra.lt/lt/situacijos/imoku-tarifai-savarankiskai-dirbantiems
// https://www.sodra.lt/lt/skaiciuokles/individualios_veiklos_skaiciuokle

const income = 1000
const profit = income - income * 0.3;

console.log("Apmokestinamas pelnas:", profit)

const gpm = profit < 20_000 ? profit * 0.05 : profit > 35_000 ? profit * 0.15 : profit * 0.15 - profit * (0.1 - 2/300_000 * (profit - 20_000));

console.log("GPM: ", gpm)

const sodros_baze = profit * 0.9;

console.log("Sodros bazė: ", sodros_baze)

const vsd = sodros_baze * (12.52 + 3) / 100;

console.log("VSD: ", vsd)

const nedraustas = true;
let psd_from_income = sodros_baze * 6.98 / 100;

let psd = psd_from_income;
if (nedraustas) {
  // 2021 - 642
  // 2022 - 730
  psd = Math.max(Math.round(840 * 6.98) / 100 * 12, psd_from_income);
}

console.log("PSD: ", psd)
