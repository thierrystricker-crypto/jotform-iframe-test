import { NextRequest, NextResponse } from 'next/server';

const SHOP = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

type ShopifyResponse = {
  data?: {
    search?: {
      nodes?: Array<{
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
      }>;
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

    const words = normalize(rawQuery)
      .split(/\s+/)
      .filter(Boolean);

    const broadQuery = words.length === 1 ? words[0] : words.join(' OR ');

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
        'X-Shopify-Storefront-Access-Token': TOKEN,
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: { query: broadQuery },
      }),
      cache: 'no-store',
    });

    const json = (await response.json()) as ShopifyResponse;

    if (!response.ok || json.errors) {
      return NextResponse.json(
        { error: 'Erreur Shopify', details: json.errors ?? null },
        { status: 500 }
      );
    }

    const products = json.data?.search?.nodes ?? [];

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
        .map((variant) => ({
          id: variant.id,
          sku: variant.sku ?? '',
          variant:
            variant.title && variant.title !== 'Default Title'
              ? `${product.title} / ${variant.title}`
              : product.title,
          price: Number(variant.price.amount).toFixed(2),
          stock: variant.quantityAvailable ?? 0,
          productUrl:
            product.onlineStoreUrl ?? `https://${SHOP}/products/${product.handle}`,
          variantImage: variant.image?.url || productImages[0]?.url || '',
          image1: productImages[1]?.url || '',
          image2: productImages[2]?.url || '',
          image3: productImages[3]?.url || '',
        }));
    });

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: String(error) },
      { status: 500 }
    );
  }
}