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

export async function GET(request: NextRequest) {
  try {
    if (!SHOP || !TOKEN) {
      return NextResponse.json(
        { error: 'Variables Shopify manquantes dans Vercel.' },
        { status: 500 }
      );
    }

    const q = request.nextUrl.searchParams.get('q')?.trim() || '';

    if (!q) {
      return NextResponse.json({ items: [] });
    }

    const graphqlQuery = `
      query SearchProducts($query: String!) {
        search(first: 12, types: PRODUCT, query: $query) {
          nodes {
            ... on Product {
              title
              handle
              onlineStoreUrl
              images(first: 3) {
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
        variables: { query: q },
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
          const haystack = [
            product.title,
            variant.title ?? '',
            variant.sku ?? '',
          ]
            .join(' ')
            .toLowerCase();

          return haystack.includes(q.toLowerCase());
        })
        .map((variant) => ({
          id: variant.id,
          sku: variant.sku ?? '',
          variant:
            variant.title && variant.title !== 'Default Title'
              ? `${product.title} / ${variant.title}`
              : product.title,
          price: new Intl.NumberFormat('fr-CH', {
            style: 'currency',
            currency: variant.price.currencyCode || 'CHF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(Number(variant.price.amount)),
          stock: variant.quantityAvailable ?? 0,
          productUrl: product.onlineStoreUrl ?? `https://${SHOP}/products/${product.handle}`,
          variantImage: variant.image?.url || productImages[0]?.url || '',
          image1: productImages[0]?.url || '',
          image2: productImages[1]?.url || '',
          image3: productImages[2]?.url || '',
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