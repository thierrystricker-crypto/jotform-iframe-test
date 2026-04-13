'use client';

import { useEffect, useMemo, useState } from 'react';

type Item = {
  id: string;
  sku: string;
  variant: string;
  price: string;
  stock: number;
  productUrl: string;
  variantImage: string;
  image1: string;
  image2: string;
  image3: string;
};

export default function Page() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCopyId, setOpenCopyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    const controller = new AbortController();

    async function runSearch() {
      if (!trimmedQuery) {
        setItems([]);
        setError('');
        return;
      }

      try {
        setLoading(true);
        setError('');

        const res = await fetch(
          `/api/shopify-search?q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal }
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || 'Erreur de recherche');
        }

        setItems(json.items || []);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message || 'Erreur inconnue');
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    }

    const t = setTimeout(runSearch, 250);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [trimmedQuery]);

  async function handleSmartCopy(item: Item) {
    const text = `${item.sku} - ${item.variant} - ${item.price}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(item.id);
      setOpenCopyId(null);

      setTimeout(() => {
        setCopiedId((prev) => (prev === item.id ? null : prev));
      }, 1400);
    } catch {
      setOpenCopyId(item.id);

      setTimeout(() => {
        const el = document.getElementById(`copy-input-${item.id}`) as HTMLInputElement | null;
        if (el) {
          el.focus();
          el.select();
        }
      }, 50);
    }
  }

  function handleClear() {
    setQuery('');
    setItems([]);
    setError('');
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Recherche articles Shopify</h1>
        <p style={styles.subtitle}>
          Recherche réelle sur Shopify : SKU, variante, prix, stock, images.
        </p>

        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="Rechercher un article, une variante ou un SKU"
            style={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button style={styles.clearButton} onClick={handleClear}>
            Effacer
          </button>
        </div>

        <div style={styles.status}>
          {!trimmedQuery
            ? 'Tape une recherche pour interroger Shopify.'
            : loading
              ? 'Recherche en cours…'
              : `${items.length} variante(s) affichée(s)`}
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.results}>
          {items.map((item) => {
            const copyText = `${item.sku} - ${item.variant} - ${item.price}`;
            const isOpen = openCopyId === item.id;
            const isCopied = copiedId === item.id;

            return (
              <div key={item.id} style={styles.cardWrap}>
                <div style={styles.card}>
                  <div style={styles.images}>
                    <ImageBox src={item.variantImage} label="Var." />
                    <ImageBox src={item.image1} label="2" />
                    <ImageBox src={item.image2} label="3" />
                    <ImageBox src={item.image3} label="4" />
                  </div>

                  <div style={styles.meta}>
                    <div style={styles.row}>
                      <strong>SKU</strong>
                      <span>{item.sku || '—'}</span>
                    </div>
                    <div style={styles.row}>
                      <strong>Variante</strong>
                      <span>{item.variant}</span>
                    </div>
                    <div style={styles.row}>
                      <strong>Prix</strong>
                      <span>{item.price}</span>
                    </div>
                    <div style={styles.row}>
                      <strong>Stock</strong>
                      <span
                        style={
                          item.stock === 0
                            ? styles.stockZero
                            : item.stock <= 2
                              ? styles.stockLow
                              : styles.stockOk
                        }
                      >
                        {item.stock}
                      </span>
                    </div>
                    <div style={styles.row}>
                      <strong>Produit</strong>
                      <a
                        href={item.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.link}
                      >
                        Ouvrir
                      </a>
                    </div>
                  </div>

                  <div style={styles.actions}>
                    <button
                      style={isCopied ? styles.copyButtonSuccess : styles.copyButton}
                      onClick={() => handleSmartCopy(item)}
                    >
                      {isCopied ? 'Copié' : 'Copier / afficher'}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div style={styles.copyPanel}>
                    <div style={styles.copyPanelLabel}>Texte à copier</div>
                    <input
                      id={`copy-input-${item.id}`}
                      type="text"
                      readOnly
                      value={copyText}
                      style={styles.copyPanelInput}
                      onFocus={(e) => e.currentTarget.select()}
                    />
                    <div style={styles.copyHint}>
                      Sur iPad : appui dans le champ puis copier.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!loading && trimmedQuery && items.length === 0 && !error && (
          <div style={styles.noResult}>Aucun résultat pour cette recherche.</div>
        )}
      </div>
    </main>
  );
}

function ImageBox({ src, label }: { src: string; label: string }) {
  if (!src) {
    return <div style={{ ...styles.imageBox, ...styles.emptyImageBox }} />;
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      style={styles.imageLink}
      title="Ouvrir l’image"
    >
      <div style={styles.imageBox}>
        <img src={src} alt={label} style={styles.image} />
        <div style={styles.imageLabel}>{label}</div>
      </div>
    </a>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    margin: 0,
    minHeight: '100vh',
    background: '#111',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
    padding: '14px 10px 20px',
  },
  container: {
    maxWidth: '1320px',
    margin: '0 auto',
  },
  title: {
    margin: '0 0 6px 0',
    fontSize: '24px',
    lineHeight: 1.15,
  },
  subtitle: {
    margin: '0 0 12px 0',
    color: '#bdbdbd',
    fontSize: '14px',
  },
  searchBar: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '10px',
  },
  input: {
    flex: '1 1 420px',
    minWidth: '220px',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #333',
    background: '#1b1b1b',
    color: '#fff',
    fontSize: '15px',
  },
  clearButton: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: 'none',
    background: '#333',
    color: '#fff',
    cursor: 'pointer',
    minWidth: '110px',
    fontWeight: 700,
  },
  status: {
    marginBottom: '10px',
    color: '#bdbdbd',
    fontSize: '13px',
  },
  errorBox: {
    marginBottom: '12px',
    padding: '12px',
    borderRadius: '12px',
    background: '#3a1717',
    border: '1px solid #6e2b2b',
    color: '#ffd5d5',
  },
  results: {
    display: 'grid',
    gap: '10px',
  },
  cardWrap: {
    display: 'grid',
    gap: '8px',
  },
  card: {
    display: 'grid',
    gridTemplateColumns: '260px minmax(0, 1fr) 140px',
    gap: '12px',
    background: '#1a1a1a',
    border: '1px solid #2c2c2c',
    borderRadius: '14px',
    padding: '10px',
    alignItems: 'center',
  },
  images: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '6px',
  },
  imageLink: {
    display: 'block',
    textDecoration: 'none',
  },
  imageBox: {
    position: 'relative',
    aspectRatio: '1 / 1',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #333',
    background: '#222',
  },
  emptyImageBox: {
    opacity: 0.35,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  imageLabel: {
    position: 'absolute',
    left: '4px',
    bottom: '4px',
    fontSize: '10px',
    background: 'rgba(0,0,0,.72)',
    padding: '3px 5px',
    borderRadius: '20px',
    color: '#fff',
  },
  meta: {
    display: 'grid',
    gap: '6px',
    minWidth: 0,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '78px minmax(0, 1fr)',
    gap: '8px',
    alignItems: 'start',
    fontSize: '14px',
  },
  link: {
    color: '#7fb0ff',
  },
  actions: {
    alignSelf: 'center',
  },
  copyButton: {
    width: '100%',
    padding: '11px 12px',
    borderRadius: '10px',
    border: 'none',
    background: '#2d6cdf',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  copyButtonSuccess: {
    width: '100%',
    padding: '11px 12px',
    borderRadius: '10px',
    border: 'none',
    background: '#2d9d55',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  copyPanel: {
    padding: '10px',
    borderRadius: '12px',
    background: '#151515',
    border: '1px solid #2c2c2c',
  },
  copyPanelLabel: {
    marginBottom: '6px',
    fontSize: '12px',
    color: '#bdbdbd',
  },
  copyPanelInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #333',
    background: '#0f0f0f',
    color: '#fff',
    fontSize: '14px',
  },
  copyHint: {
    marginTop: '6px',
    fontSize: '12px',
    color: '#9f9f9f',
  },
  stockOk: {
    color: '#7ee28a',
    fontWeight: 700,
  },
  stockLow: {
    color: '#ffd66b',
    fontWeight: 700,
  },
  stockZero: {
    color: '#ff8d8d',
    fontWeight: 700,
  },
  noResult: {
    marginTop: '14px',
    padding: '14px',
    borderRadius: '12px',
    background: '#1a1a1a',
    border: '1px solid #2c2c2c',
    color: '#d0d0d0',
  },
};