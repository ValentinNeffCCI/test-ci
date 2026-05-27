import { useState, useEffect } from "react";
import "./App.css";

interface Item {
  id: number;
  name: string;
  created_at: string;
}

function App() {
  const [message, setMessage] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = () => {
    fetch("/api/items")
      .then((res) => res.json())
      .then((data) => setItems(data.items || []))
      .catch((err) => console.error("Error fetching items:", err));
  };

  const handlePing = () => {
    fetch("/api/ping")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setIsLoading(true);
    fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newItemName }),
    })
      .then((res) => res.json())
      .then(() => {
        setNewItemName("");
        fetchItems();
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <main className="app-container">
      <header className="glass-header">
        <h1>React Starter</h1>
        <button className="ping-button" onClick={handlePing}>
          Ping API
        </button>
        {message && <span className="ping-badge">{message}</span>}
      </header>

      <section className="content-grid">
        <div className="glass-card add-item-card">
          <h2>Ajouter un Item</h2>
          <form onSubmit={handleAddItem}>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Nom de l'item..."
              className="glass-input"
            />
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? "..." : "Ajouter"}
            </button>
          </form>
        </div>

        <div className="glass-card items-card">
          <h2>Items récents</h2>
          <div className="items-list">
            {items.length === 0 ? (
              <p className="empty-state">Aucun item pour le moment.</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="item-row">
                  <span className="item-name">{item.name}</span>
                  <span className="item-date">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
