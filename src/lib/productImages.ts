const PRODUCT_IMAGE_PATHS: Record<string, string> = {
  'sumatra mandheling': '/static/products/sumatra-mandheling.webp',
  'brazil santos': '/static/products/brasil-santos-blend.webp',
  'brasil santos': '/static/products/brasil-santos-blend.webp',
  'brasil santos blend': '/static/products/brasil-santos-blend.webp',
  'costa rica tarrazu': '/static/products/costa-rica-tarrazu.webp',
  'ethiopian yirgacheffe': '/static/products/etiopia-yirgacheffe.webp',
  'etiopia yirgacheffe': '/static/products/etiopia-yirgacheffe.webp',
  'colombian supremo': '/static/products/colombia-supremo.webp',
  'colombia supremo': '/static/products/colombia-supremo.webp',
  'guatemala antigua': '/static/products/guatemala-antigua-molido.webp',
  'guatemala antigua molido': '/static/products/guatemala-antigua-molido.webp',
};

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveProductImage(
  productName: string,
  fallbackImage?: string,
): string {
  const canonicalPath = PRODUCT_IMAGE_PATHS[normalizeName(productName)];

  if (canonicalPath) {
    return canonicalPath;
  }

  return fallbackImage ?? '';
}

export const CANONICAL_PRODUCT_IMAGE_URLS = {
  sumatraMandheling: '/static/products/sumatra-mandheling.webp',
  brasilSantosBlend: '/static/products/brasil-santos-blend.webp',
  costaRicaTarrazu: '/static/products/costa-rica-tarrazu.webp',
  etiopiaYirgacheffe: '/static/products/etiopia-yirgacheffe.webp',
  colombiaSupremo: '/static/products/colombia-supremo.webp',
  guatemalaAntiguaMolido: '/static/products/guatemala-antigua-molido.webp',
} as const;
