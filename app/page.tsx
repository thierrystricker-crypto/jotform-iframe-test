'use client';

import { useMemo, useState } from 'react';

type Item = {
  id: number;
  sku: string;
  variant: string;
  price: string;
  stock: number;
  variantImage: string;
  image1: string;
  image2: string;
  image3: string;
};

const fakeResults: Item[] = [
  {
    id: 1,
    sku: "SKU-1001",
    variant: "Chaise Luxembourg / Cactus",
    price: "CHF 329.–",
    stock: 12,
    variantImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80",
    image1: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80",
    image2: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=500&q=80",
    image3: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 2,
    sku: "SKU-1002",
    variant: "Table Bellevie / Gris Argile",
    price: "CHF 1'249.–",
    stock: 3,
    variantImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80",
    image1: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=500&q=80",
    image2: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=500&q=80",
    image3: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 3,
    sku: "SKU-1003",
    variant: "Parasol Glatz / 300x300 / Anthracite",
    price: "CHF 2'990.–",
    stock: 0,
    variantImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80",
    image1: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80",
    image2: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=500&q=80",
    image3: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 4,
    sku: "FERM-2048",
    variant: "Fauteuil Luxembourg / Réglisse",
    price: "CHF 459.–",
    stock: 6,
    variantImage: "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=500&q=80",
    image1: "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=500&q=80",
    image2: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=500&q=80",
    image3: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 5,
    sku: "GLATZ-7788",
    variant: "Parasol Glatz / 350x350 / Blanc",
    price: "CHF 3'290.–",
    stock: 2,
    variantImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80",
    image1: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80",
    image2: "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=500&q=80",
    image3: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=500&q=80",
  },
];

export default function Page() {
  const [query, setQuery] = useState("");
  const [manualCopyText, setManualCopyText] = useState("");

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fakeResults;

    return fakeResults.filter((item) => {
      return (
        item.sku.toLowerCase().includes(q) ||
        item.variant.toLowerCase().includes(q) ||
        item.price.toLowerCase().includes(q)
      );
    });
  }, [query]);

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setManualCopyText(text);
    } catch {
      setManualCopyText(text);
      setTimeout(() => {
        const el = document.getElementById("manual-copy-input") as HTMLInputElement | null;
        if (el) {
          el.focus();
          el.select();
        }
      }, 50);
      alert("Copie automatique bloquée. Le texte est placé dans la zone de secours, puis fais Ctrl+C.");
    }
  }

  function handleClear() {
    setQuery("");
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Recherche articles test</h1>
        <p style={styles.subtitle}>
          Version interactive de test pour iframe Jotform.
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
          {filteredResults.length} variante(s) affichée(s)
        </div>

        <div style={styles.manualCopyBox}>
          <div style={styles.manualCopyLabel}>
            Zone de copie manuelle de secours
          </div>
          <input
            id="manual-copy-input"
            type="text"
            value={manualCopyText}
            readOnly
            style={styles.manualCopyInput}
            placeholder="Le texte à copier apparaîtra ici"
            onFocus={(e) => e.currentTarget.select()}
          />
        </div>

        <div style={styles.results}>
          {filteredResults.map((item) => {
            const copyText = `${item.sku} - ${item.variant} - ${item.price}`;

            return (
              <div key={item.id} style={styles.card}>
                <div style={styles.images}>
                  <ImageBox src={item.variantImage} label="Var." />
                  <ImageBox src={item.image1} label="1" />
                  <ImageBox src={item.image2} label="2" />
                  <ImageBox src={item.image3} label="3" />
                </div>

                <div style={styles.meta}>
                  <div style={styles.row}><strong>SKU</strong><span>{item.sku}</span></div>
                  <div style={styles.row}><strong>Variante</strong><span>{item.variant}</span></div>
                  <div style={styles.row}><strong>Prix</strong><span>{item.price}</span></div>
                  <div style={styles.row}>
                    <strong>Stock</strong>
                    <span style={item.stock === 0 ? styles.stockZero : item.stock <= 2 ? styles.stockLow : styles.stockOk}>
                      {item.stock}
                    </span>
                  </div>
                </div>

                <div style={styles.actions}>
                  <button
                    style={styles.copyButton}
                    onClick={() => handleCopy(copyText)}
                  >
                    Copier
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredResults.length === 0 && (
          <div style={styles.noResult}>
            Aucun résultat pour cette recherche.
          </div>
        )}
      </div>
    </main>
  );
}

function ImageBox({ src, label }: { src: string; label: string }) {
  return (
    <div style={styles.imageBox}>
      <img src={src} alt={label} style={styles.image} />
      <div style={styles.imageLabel}>{label}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    margin: 0,
    minHeight: "100vh",
    background: "#111",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
    padding: "14px 10px 20px",
  },
  container: {
    maxWidth: "1320px",
    margin: "0 auto",
  },
  title: {
    margin: "0 0 6px 0",
    fontSize: "24px",
    lineHeight: 1.15,
  },
  subtitle: {
    margin: "0 0 12px 0",
    color: "#bdbdbd",
    fontSize: "14px",
  },
  searchBar: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "10px",
  },
  input: {
    flex: "1 1 420px",
    minWidth: "220px",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #333",
    background: "#1b1b1b",
    color: "#fff",
    fontSize: "15px",
  },
  clearButton: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "none",
    background: "#333",
    color: "#fff",
    cursor: "pointer",
    minWidth: "110px",
    fontWeight: 700,
  },
  status: {
    marginBottom: "10px",
    color: "#bdbdbd",
    fontSize: "13px",
  },
  manualCopyBox: {
    marginBottom: "12px",
    padding: "10px",
    borderRadius: "12px",
    border: "1px solid #2c2c2c",
    background: "#1a1a1a",
  },
  manualCopyLabel: {
    marginBottom: "6px",
    color: "#bdbdbd",
    fontSize: "12px",
  },
  manualCopyInput: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #333",
    background: "#101010",
    color: "#fff",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  results: {
    display: "grid",
    gap: "10px",
  },
  card: {
    display: "grid",
    gridTemplateColumns: "260px minmax(0, 1fr) 130px",
    gap: "12px",
    background: "#1a1a1a",
    border: "1px solid #2c2c2c",
    borderRadius: "14px",
    padding: "10px",
    alignItems: "center",
  },
  images: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "6px",
  },
  imageBox: {
    position: "relative",
    aspectRatio: "1 / 1",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #333",
    background: "#222",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  imageLabel: {
    position: "absolute",
    left: "4px",
    bottom: "4px",
    fontSize: "10px",
    background: "rgba(0,0,0,.72)",
    padding: "3px 5px",
    borderRadius: "20px",
  },
  meta: {
    display: "grid",
    gap: "6px",
    minWidth: 0,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "78px minmax(0, 1fr)",
    gap: "8px",
    alignItems: "start",
    fontSize: "14px",
  },
  actions: {
    alignSelf: "center",
  },
  copyButton: {
    width: "100%",
    padding: "11px 12px",
    borderRadius: "10px",
    border: "none",
    background: "#2d6cdf",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  stockOk: {
    color: "#7ee28a",
    fontWeight: 700,
  },
  stockLow: {
    color: "#ffd66b",
    fontWeight: 700,
  },
  stockZero: {
    color: "#ff8d8d",
    fontWeight: 700,
  },
  noResult: {
    marginTop: "14px",
    padding: "14px",
    borderRadius: "12px",
    background: "#1a1a1a",
    border: "1px solid #2c2c2c",
    color: "#d0d0d0",
  },
};