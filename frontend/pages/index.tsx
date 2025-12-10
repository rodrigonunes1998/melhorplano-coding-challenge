import { useEffect, useState } from "react";
import api, { fetchFilteredPlans, PlanSearchParams } from "../services/api";
import PlanCard from "../components/PlanCard";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import styles from "../styles/Home.module.scss";
import Modal from "../components/Modal";

interface Plan {
  id: number;
  name: string;
  speed: string;
  price: number;
  operator: string;
  city: string;
  dataCap: number;
  benefits?: string[];
}

interface PaginatedPlans {
  plans: Plan[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const OPERATORS = ["Vivo", "Claro", "TIM", "Oi"];
const CITIES = [
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Curitiba",
  "Recife",
  "Porto Alegre",
  "Salvador",
  "Fortaleza",
  "Brasília",
];

const SORTED = {
  Preço: "price",
  Franquia: "dataCap",
  Velocidade: "speed",
};

const ORDERS = {
  "Menor Preço": "min",
  "Maior Preço": "max",
  "Menor Franquia": "min",
  "Maior Franquia": "max",
  "Menor Velocidade": "min",
  "Maior Velocidade": "max",
};

export default function Home() {
  const [filters, setFilters] = useState<PlanSearchParams>({
    page: 1,
    pageSize: 5,
  });
  const [result, setResult] = useState<PaginatedPlans | null>(null);
  const [loading, setLoading] = useState(false);
  const [planNames, setPlanNames] = useState<string[]>([]);
  const [planCities, setPlanCities] = useState<string[]>([]);
  const [planOperators, setPlanOperators] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchFilteredPlans(filters)
      .then(setResult)
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    // Buscar nomes dos planos ao montar
    api
      .get("/plans/search", { params: { page: 1, pageSize: 1000 } })
      .then((res) => {
        const names = res.data.plans.map((p: any) => p.name);
        const namesOperators = res.data.plans.map((p: any)=> p.operator);
        const nameCities = res.data.plans.map((p: any)=> p.city);
        setPlanNames(Array.from(new Set(names)));
        setPlanOperators(Array.from(new Set(namesOperators)));
        setPlanCities(Array.from(new Set(nameCities)));
      });
  }, []);




  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value ? value : undefined,
      page: 1,
    }));
  }

  function handlePageChange(newPage: number) {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }

  return (
    <>
      <Menu />
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {/* Sidebar de Filtros */}
        <aside
          style={{
            width: 300,
            minHeight: 500,
            background: "#f7fafc",
            borderRadius: 16,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            padding: 32,
            marginRight: 32,
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          <h2
            style={{
              color: "#00897b",
              fontWeight: 700,
              fontSize: 20,
              marginBottom: 16,
            }}
          >
            Filtrar planos
            <button
              onClick={() => setShowModal(true)}
              aria-label="Abrir Modal"
              title="Abrir Modal"
              style={{
                background: "linear-gradient(90deg, #00b38f 60%, #00997a 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 9999,
                width: 56,
                height: 56,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px #00b38f22",
                transition: "filter 0.2s, transform 0.1s",
                position: "relative",
                float: "right"
              }}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "scale(0.98)")
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
              
            >
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: -2,
                  borderRadius: "inherit",
                  border: "2px solid rgba(255,255,255,0.55)",
                  animation: "ringPulse 1.6s ease-out infinite",
                  pointerEvents: "none",
                }}
              />
              <span
                aria-hidden="true"
                style={{
                  fontSize: 22,
                  lineHeight: 1,
                  animation: "iconPulse 1.6s ease-in-out infinite",
                }}
              >
                ✨
              </span>
            </button>
            <Modal
              open={showModal}
              onClose={() => setShowModal(false)}
              onSubmit={(values) => console.log(values)}
              cities={planCities}
              operators={planOperators}
            />
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <label style={{ color: "#00897b", fontWeight: 600, fontSize: 15 }}>
              Nome do plano
            </label>
            <select
              name="name"
              onChange={handleChange}
              defaultValue=""
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1.5px solid #b2dfdb",
                background: "#fff",
                fontSize: 15,
              }}
            >
              <option value="">Selecione</option>
              {planNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <label style={{ color: "#00897b", fontWeight: 600, fontSize: 15 }}>
              Operadora
            </label>
            <select
              name="operator"
              onChange={handleChange}
              defaultValue=""
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1.5px solid #b2dfdb",
                background: "#fff",
                fontSize: 15,
              }}
            >
              <option value="">Selecione</option>
              {OPERATORS.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            <label style={{ color: "#00897b", fontWeight: 600, fontSize: 15 }}>
              Cidade
            </label>
            <select
              name="city"
              onChange={handleChange}
              defaultValue=""
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1.5px solid #b2dfdb",
                background: "#fff",
                fontSize: 15,
              }}
            >
              <option value="">Selecione</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <label style={{ color: "#00897b", fontWeight: 600, fontSize: 15 }}>
              Preço
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="number"
                name="minPrice"
                placeholder="Mín."
                onChange={handleChange}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "2px solid #009688",
                  background: "#fff",
                  fontSize: 16,
                  width: 110,
                  outline: "none",
                  transition: "border 0.2s",
                }}
              />
              <input
                type="number"
                name="maxPrice"
                placeholder="Máx."
                onChange={handleChange}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "2px solid #b2dfdb",
                  background: "#fff",
                  fontSize: 16,
                  width: 110,
                  outline: "none",
                  transition: "border 0.2s",
                }}
              />
              <button
                type="button"
                style={{
                  background: "#009688",
                  border: "none",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  marginLeft: 4,
                }}
                title="Buscar por preço"
                tabIndex={-1}
                disabled
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" stroke="#fff" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#fff" />
                </svg>
              </button>
            </div>
            <label style={{ color: "#00897b", fontWeight: 600, fontSize: 15 }}>
              Franquia (GB)
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="number"
                name="minDataCap"
                placeholder="Mín."
                onChange={handleChange}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "2px solid #009688",
                  background: "#fff",
                  fontSize: 16,
                  width: 110,
                  outline: "none",
                  transition: "border 0.2s",
                }}
              />
              <input
                type="number"
                name="maxDataCap"
                placeholder="Máx."
                onChange={handleChange}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "2px solid #b2dfdb",
                  background: "#fff",
                  fontSize: 16,
                  width: 110,
                  outline: "none",
                  transition: "border 0.2s",
                }}
              />
              <button
                type="button"
                style={{
                  background: "#009688",
                  border: "none",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  marginLeft: 4,
                }}
                title="Buscar por franquia"
                tabIndex={-1}
                disabled
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" stroke="#fff" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#fff" />
                </svg>
              </button>
            </div>
            <label style={{ color: "#00897b", fontWeight: 600, fontSize: 15 }}>
              Classificar por:
            </label>
            <select
              name="sorted"
              onChange={handleChange}
              defaultValue=""
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1.5px solid #b2dfdb",
                background: "#fff",
                fontSize: 15,
              }}
            >
              <option value="">Selecione</option>
              {Object.entries(SORTED).map(([key, value]) => {
                return (
                  <option key={key} value={value}>
                    {key}
                  </option>
                );
              })}
            </select>
            <label style={{ color: "#00897b", fontWeight: 600, fontSize: 15 }}>
              Ordernar por:
            </label>
            <select
              name="order"
              onChange={handleChange}
              defaultValue=""
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1.5px solid #b2dfdb",
                background: "#fff",
                fontSize: 15,
              }}
            >
              <option value="">Selecione</option>
              {Object.entries(ORDERS).map(([key, value]) => {
                return (
                  <option key={key} value={value}>
                    {key}
                  </option>
                );
              })}
            </select>
          </div>
        </aside>
        {/* Conteúdo principal */}
        <div className={styles.container} style={{ flex: 1 }}>
          <h1 className={styles.titulo}>Buscar ofertas de planos</h1>
          <p className={styles.subtitulo}>
            Filtre por preço, franquia, operadora, cidade, nome e navegue pelos
            resultados!
          </p>
          {/* Resultados */}
          {loading ? (
            <div style={{ textAlign: "center", margin: 32 }}>Carregando...</div>
          ) : result && result.plans.length > 0 ? (
            <>
              <section className={styles.planos}>
                {result.plans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </section>
              {/* Paginação */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: 24,
                }}
              >
                <button
                  onClick={() => handlePageChange(result.page - 1)}
                  disabled={result.page === 1}
                  style={{
                    marginRight: 12,
                    padding: "8px 18px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    background: result.page === 1 ? "#eee" : "#fff",
                    cursor: result.page === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Anterior
                </button>
                <span style={{ alignSelf: "center", fontWeight: 500 }}>
                  Página {result.page} de {result.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(result.page + 1)}
                  disabled={result.page === result.totalPages}
                  style={{
                    marginLeft: 12,
                    padding: "8px 18px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    background:
                      result.page === result.totalPages ? "#eee" : "#fff",
                    cursor:
                      result.page === result.totalPages
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Próxima
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", margin: 32 }}>
              Nenhum plano encontrado.
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
