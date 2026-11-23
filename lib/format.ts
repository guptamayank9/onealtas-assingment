export const formatContext = (n: number | null) => {
  if (!n) return "-";
  if (n >= 1_000_000) return `${n / 1_000_000}M`;
  return `${Math.round(n / 1000)}K`;
};

export const formatPrice = (n: number | null) => {
  if (n === null) return "-";
  return `$${n < 1 ? n.toFixed(3) : n.toFixed(2)}`;
};