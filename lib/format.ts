export const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XOF",
  minimumFractionDigits: 0, // Le FCFA n'a pas de centimes couramment utilisés
  maximumFractionDigits: 0,
});

// Fonction helper pour l'affichage propre (ex: "15 000 CFA")
export function formatPrice(price: number | string | undefined | null) {
    if (!price) return formatter.format(0);
    return formatter.format(Number(price));
}