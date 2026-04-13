import { NextRequest, NextResponse } from 'next/server';

const SHOP = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

type ShopifyProduct = {
  title: string;
  handle: string;
  onlineStoreUrl: string | null;
  images?: {
    nodes?: Array<{
      url: string;
      altText: string | null;
    }>;
  };
  variants?: {
    nodes?: Array<{
      id: string;
      title: string;
      sku: string | null;
      quantityAvailable: number | null;
      image?: {
        url: string;
        altText: string | null;
      } | null;
      price: {
        amount: string;
        currencyCode: string;
      };
    }>;
  };
};

type ShopifyResponse = {
  data?: {
    search?: {
      nodes?: ShopifyProduct[];
    };
  };
  errors?: unknown;
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

async function runShopifySearch(query: string): Promise<ShopifyProduct[]> {
  const graphqlQuery = `
    query SearchProducts($query: String!) {
      search(first: 20, types: PRODUCT, query: $query) {
        nodes {
          ... on Product {
            title
            handle
            onlineStoreUrl
            images(first: 4) {
              nodes {
                url
                altText
              }
            }
            variants(first: 100) {
              nodes {
                id
                title
                sku
                quantityAvailable
                image {
                  url
                  altText
                }
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(`https://${SHOP}/api/2026-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN as string,
    },
    body: JSON.stringify({
      query: graphqlQuery,
      variables: { query },
    }),
    cache: 'no-store',
  });

  const json = (await response.json()) as ShopifyResponse;

  if (!response.ok || json.errors) {
    throw new Error('Erreur Shopify');
  }

  return json.data?.search?.nodes ?? [];
}

export async function GET(request: NextRequest) {
  try {
    if (!SHOP || !TOKEN) {
      return NextResponse.json(
        { error: 'Variables Shopify manquantes dans Vercel.' },
        { status: 500 }
      );
    }

    const rawQuery = request.nextUrl.searchParams.get('q')?.trim() || '';

    if (!rawQuery) {
      return NextResponse.json({ items: [] });
    }

    const normalizedQuery = normalize(rawQuery);
    const words = normalizedQuery.split(/\s+/).filter(Boolean);

    const searchQueries = Array.from(
      new Set([rawQuery, ...words])
    ).filter(Boolean);

    const allProductsMap = new Map<string, ShopifyProduct>();

    for (const q of searchQueries) {
      try {
        const products = await runShopifySearch(q);
        for (const product of products) {
          allProductsMap.set(product.handle, product);
        }
      } catch {
        // ignore une recherche partielle qui échoue
      }
    }

    const products = Array.from(allProductsMap.values());

    const items = products.flatMap((product) => {
      const productImages = product.images?.nodes ?? [];
      const variants = product.variants?.nodes ?? [];

      return variants
        .filter((variant) => {
          const haystack = normalize(
            [
              product.title,
              variant.title ?? '',
              variant.sku ?? '',
            ].join(' ')
          );

          return words.every((word) => haystack.includes(word));
        })
        .map((variant) => {
          const variantNumericId = variant.id.split('/').pop() || '';

          return {
            id: variant.id,
            sku: variant.sku ?? '',
            variant:
              variant.title && variant.title !== 'Default Title'
                ? `${product.title} / ${variant.title}`
                : product.title,
            price: Number(variant.price.amount).toFixed(2),
            stock: variant.quantityAvailable ?? 0,
            productUrl: product.onlineStoreUrl
              ? `${product.onlineStoreUrl}?variant=${variantNumericId}`
              : `https://${SHOP}/products/${product.handle}?variant=${variantNumericId}`,
            variantImage: variant.image?.url || productImages[0]?.url || '',
            image1: productImages[1]?.url || '',
            image2: productImages[2]?.url || '',
            image3: productImages[3]?.url || '',
          };
        });
    });

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: String(error) },
      { status: 500 }
    );
  }
}