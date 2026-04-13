'use client';

import { useState } from 'react';

export default function Page() {
  const [manualCopyText, setManualCopyText] = useState("");

  const fakeResults = [
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
  ];

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert("Texte copié.");
    } catch {
      setManualCopyText(text);

      setTimeout(() => {
        const el = document.getElementById("manual-copy-input") as HTMLInputElement | null;
        if (el) {
          el.focus();
          el.select();
        }
      }, 50);

      alert("Copie automatique bloquée dans l’iframe.\nLe texte est sélectionné en bas : fais Ctrl+C.");
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Test moteur recherche Jotform</h1>
        <p style={styles.subtitle}>
          Version statique de test pour vérifier l’affichage dans un iframe Jotform.
        </p>

        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="Rechercher un article, une variante ou un SKU"
            style={styles.input}
          />
          <button style={styles.clearButton}>Effacer</button>
        </div>

        <div style={styles.status}>3 variantes de test affichées</div>

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
            placeholder="Si la copie automatique est bloquée, le texte apparaîtra ici"
            onFocus={(e) => e.currentTarget.select()}
          />
        </div>

        <div style={styles.results}>
          {fakeResults.map((item) => {
            const copyText = `${item.sku} - ${item.variant} - ${item.price}`;

            return (
              <div key={item.id} style={styles.card}>
                <div style={styles.images}>
                  <ImageBox src={item.variantImage} label="Variante" />
                  <ImageBox src={item.image1} label="Image 1" />
                  <ImageBox src={item.image2} label="Image 2" />
                  <ImageBox src={item.image3} label="Image 3" />
                </div>

                <div style={styles.meta}>
                  <div><strong>SKU :</strong> {item.sku}</div>
                  <div><strong>Variante :</strong> {item.variant}</div>
                  <div><strong>Prix :</strong> {item.price}</div>
                  <div>
                    <strong>Stock :</strong>{" "}
                    <span style={item.stock === 0 ? styles.stockZero : styles.stockOk}>
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
    padding: "20px 12px",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "28px",
  },
  subtitle: {
    margin: "0 0 18px 0",
    color: "#bdbdbd",
  },
  searchBar: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "14px",
  },
  input: {
    flex: "1 1 500px",
    minWidth: "260px",
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid #333",
    background: "#1b1b1b",
    color: "#fff",
    fontSize: "16px",
  },
  clearButton: {
    padding: "14px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#333",
    color: "#fff",
    cursor: "pointer",
  },
  status: {
    marginBottom: "14px",
    color: "#bdbdbd",
    fontSize: "14px",
  },
  manualCopyBox: {
    marginBottom: "16px",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #2c2c2c",
    background: "#1a1a1a",
  },
  manualCopyLabel: {
    marginBottom: "8px",
    color: "#bdbdbd",
    fontSize: "13px",
  },
  manualCopyInput: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #333",
    background: "#101010",
    color: "#fff",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  results: {
    display: "grid",
    gap: "14px",
  },
  card: {
    display: "grid",
    gridTemplateColumns: "360px 1fr 170px",
    gap: "14px",
    background: "#1a1a1a",
    border: "1px solid #2c2c2c",
    borderRadius: "14px",
    padding: "12px",
    alignItems: "start",
  },
  images: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
  },
  imageBox: {
    position: "relative",
    aspectRatio: "1 / 1",
    borderRadius: "10px",
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
    left: "6px",
    bottom: "6px",
    fontSize: "11px",
    background: "rgba(0,0,0,.72)",
    padding: "4px 6px",
    borderRadius: "20px",
  },
  meta: {
    display: "grid",
    gap: "8px",
    alignSelf: "center",
  },
  actions: {
    alignSelf: "center",
  },
  copyButton: {
    width: "100%",
    padding: "12px 14px",
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
  stockZero: {
    color: "#ff8d8d",
    fontWeight: 700,
  },
};