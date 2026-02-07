// lib/currency.ts

export const EXCHANGE_RATE = 655.957;

const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XOF",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Convertit un prix EUR (base de données) en XOF (entier)
 * Accepte: number, string, ou Prisma.Decimal (via type any)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertToXof(priceInEur: number | string | any): number {
  if (priceInEur === null || priceInEur === undefined) return 0;
  
  // Si c'est un Decimal Prisma, il possède souvent une méthode .toNumber()
  // Sinon, la fonction standard Number() appelle .toString() implicitement
  const price = typeof priceInEur === 'object' && 'toNumber' in priceInEur
    ? priceInEur.toNumber()
    : Number(priceInEur);

  // On arrondit à l'entier le plus proche
  return Math.round(price * EXCHANGE_RATE);
}

/**
 * Formate un prix EUR directement en chaîne "15 000 FCFA"
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatPrice(priceInEur: number | string | any) {
  const xofPrice = convertToXof(priceInEur);
  return formatter.format(xofPrice);
}