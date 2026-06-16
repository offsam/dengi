import type { AutoVehicleRecord } from "./types";
import type { AutoVehicle } from "../vehicle";
import { resolveLoanAprPercent, syncLoanInterestFromApr } from "../loan";

export type AutoVehicleLoanStats = {
  monthlyPayment: number;
  annualRatePercent: number;
  /** Примерные проценты в ближайшем ежемесячном платеже */
  monthlyInterest: number;
  remaining: number;
  paidPrincipal: number;
  paidInterest: number;
  /** Сумма всех платежей по кредиту (ежемесячных + досрочных) */
  totalPaid: number;
  loanPaymentsCount: number;
  /** Примерный остаток процентов до погашения */
  remainingInterestApprox: number;
  /** Цена покупки авто */
  purchasePrice: number;
  /** Изначальная сумма кредита */
  loanAmount: number;
  /** Всего платежей по графику */
  paymentsTotal: number;
  /** Осталось платежей по графику */
  paymentsRemaining: number;
};

function estimateRemainingInterest(vehicle: AutoVehicle) {
  const { remaining, loanPayment, loanInterest } = vehicle;
  if (remaining <= 0 || loanPayment <= 0) {
    return 0;
  }

  const monthlyRate = remaining > 0 ? loanInterest / remaining : 0;
  if (monthlyRate <= 0) {
    const principalPerPayment = Math.max(0, loanPayment - loanInterest);
    const paymentsLeft =
      principalPerPayment > 0 ? Math.ceil(remaining / principalPerPayment) : 0;
    return Math.round(paymentsLeft * loanInterest);
  }

  let balance = remaining;
  let totalInterest = 0;
  let safety = 600;

  while (balance > 0.01 && safety > 0) {
    const interest = balance * monthlyRate;
    const principal = loanPayment - interest;

    if (principal <= 0) {
      break;
    }

    if (principal >= balance) {
      totalInterest += interest;
      break;
    }

    totalInterest += interest;
    balance -= principal;
    safety -= 1;
  }

  return Math.round(totalInterest);
}

function sortPaymentsChronologically(records: AutoVehicleRecord[]) {
  return [...records]
    .filter((record) => record.kind === "payment")
    .sort(
      (left, right) =>
        new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime()
    );
}

/** Сводка по кредиту: условия авто + фактические суммы из записей платежей */
export function computeAutoVehicleLoanStats(
  vehicle: AutoVehicle,
  records: AutoVehicleRecord[]
): AutoVehicleLoanStats {
  const annualRatePercent = resolveLoanAprPercent(vehicle);
  const monthlyRate = annualRatePercent / 100 / 12;
  const payments = sortPaymentsChronologically(records);

  let balance = Math.max(0, vehicle.purchasePrice);
  let totalPaid = 0;
  let paidInterest = 0;
  let paidPrincipal = 0;
  let loanPaymentsCount = 0;

  for (const payment of payments) {
    const amount = Math.max(0, payment.amount);
    totalPaid += amount;

    if (payment.paymentType === "insurance") {
      continue;
    }

    if (payment.paymentType === "extra") {
      paidPrincipal += amount;
      balance = Math.max(0, balance - amount);
      continue;
    }

    loanPaymentsCount += 1;

    if (balance <= 0) {
      continue;
    }

    const interestCharge =
      monthlyRate > 0 ? syncLoanInterestFromApr(balance, annualRatePercent) : 0;
    const interestPaid = Math.min(amount, interestCharge);
    const principalPaid = Math.max(0, amount - interestPaid);

    paidInterest += interestPaid;
    paidPrincipal += principalPaid;
    balance = Math.max(0, balance - principalPaid);
  }

  const remaining = Math.round(balance);
  const monthlyInterest = syncLoanInterestFromApr(remaining, annualRatePercent);
  const purchasePrice = Math.max(0, vehicle.purchasePrice);
  const hasLoan =
    vehicle.financingType !== "cash" &&
    vehicle.status !== "sold" &&
    (vehicle.loanTermMonths > 0 || vehicle.loanPayment > 0);
  const loanAmount = hasLoan ? purchasePrice : 0;
  const paymentsTotal = hasLoan ? Math.max(0, vehicle.loanTermMonths) : 0;
  const paymentsRemaining = hasLoan
    ? Math.max(0, paymentsTotal - loanPaymentsCount)
    : 0;

  return {
    monthlyPayment: vehicle.loanPayment,
    annualRatePercent,
    monthlyInterest,
    remaining,
    paidPrincipal,
    paidInterest,
    totalPaid,
    loanPaymentsCount,
    remainingInterestApprox: estimateRemainingInterest({
      ...vehicle,
      remaining,
      loanInterest: monthlyInterest,
    }),
    purchasePrice,
    loanAmount,
    paymentsTotal,
    paymentsRemaining,
  };
}
