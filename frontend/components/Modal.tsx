import { FormEvent, useState } from "react";
import styles from "../styles/Modal.module.scss";
import { fetchRecomendedPlan } from "../services/api";

const USAGE_TYPES = [
  { value: "tv", label: "TV e streaming", icon: "📺", helper: "Filmes, séries e canais." },
  { value: "chat", label: "Apps de chat", icon: "💬", helper: "WhatsApp, Meet, Teams." },
  { value: "gamer", label: "Gamer", icon: "🎮", helper: "Baixa latência e estabilidade." },
];

type FormValues = {
  city: string;
  maxBudget: string;
  usage: string;
  operator: string;
};

type RecommendedPlan = {
  id: number;
  name: string;
  speed: string;
  price: number;
  operator: string;
  city: string;
  dataCap?: number;
  emphasis?: boolean;
};

type ModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (values: FormValues) => void;
  cities: string[],
  operators: string[]
};

export default function Modal({ open, onClose, onSubmit, cities, operators }: ModalProps) {
  const [form, setForm] = useState<FormValues>({
    city: "",
    maxBudget: "",
    usage: USAGE_TYPES[0].value,
    operator: "",
  });
  const [step, setStep] = useState<"form" | "results">("form");
  const [recommendedPlans, setRecommendedPlans] = useState<RecommendedPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 3;

  if (!open) return null;

  function updateField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    console.log("Opcao selecionada: ",value);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleClose() {
    setStep("form");
    setRecommendedPlans([]);
    setPage(0);
    setError(null);
    setLoading(false);
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendedPlans([]);
    setStep("results");
    setPage(0);

    try {
      const payload = {
        city: form.city || undefined,
        maxPrice: form.maxBudget ? Number(form.maxBudget) : undefined,
        typeUse: form.usage,
        operator: form.operator || undefined,
      };

      const response = await fetchRecomendedPlan(payload);
      const plans = Array.isArray(response)
        ? response
        : (response?.plans as RecommendedPlan[]) ?? [];

      setRecommendedPlans(plans);
      onSubmit?.(form);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Não foi possível buscar recomendações agora.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(recommendedPlans.length / pageSize));
  const visiblePlans = recommendedPlans.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-modal-title"
      onClick={(e) => {
        if (e.currentTarget === e.target) {
          handleClose();
        }
      }}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>MP</span>
            <div className={styles.brandText}>
              <span className={styles.title} id="plan-modal-title">
                Monte o plano ideal
              </span>
              <span className={styles.subtitle}>
                Usamos as mesmas cores e pegada visual do menu para guiar sua escolha.
              </span>
            </div>
          </div>
          <button type="button" className={styles.closeButton} aria-label="Fechar modal" onClick={handleClose}>
            ✕
          </button>
        </header>

        <div className={styles.content}>
          {step === "form" && (
            <>
              <p className={styles.lead}>
                Conte como você pretende usar a conexão e filtramos as ofertas que combinam com o seu perfil.
              </p>

              <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.field}>
                  <span className={styles.label}>Cidade</span>
                  <select
                    name="city"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Selecione</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Orçamento máximo (R$)</span>
                  <input
                    type="number"
                    name="maxBudget"
                    placeholder="Ex.: 150"
                    min={0}
                    value={form.maxBudget}
                    onChange={(e) => updateField("maxBudget", e.target.value)}
                    className={styles.input}
                  />
                </label>

                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <div className={styles.labelRow}>
                    <span className={styles.label}>Tipo de uso</span>
                    <span className={styles.helper}>Escolha uma prioridade</span>
                  </div>
                  <div className={styles.usageGrid}>
                    {USAGE_TYPES.map((usage) => (
                      <button
                        key={usage.value}
                        type="button"
                        onClick={() => updateField("usage", usage.value)}
                        className={`${styles.usageCard} ${
                          form.usage === usage.value ? styles.active : ""
                        }`}
                      >
                        <span className={styles.usageIcon}>{usage.icon}</span>
                        <div className={styles.usageCopy}>
                          <span className={styles.usageTitle}>{usage.label}</span>
                          <span className={styles.usageHelper}>{usage.helper}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <label className={styles.field}>
                  <span className={styles.label}>Operadora</span>
                  <select
                    name="operator"
                    value={form.operator}
                    onChange={(e) => updateField("operator", e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Quero comparar todas</option>
                    {operators.map((operator) => (
                      <option key={operator} value={operator}>
                        {operator}
                      </option>
                    ))}
                  </select>
                </label>

                <div className={styles.actions}>
                  <button type="button" className={styles.ghostButton} onClick={handleClose}>
                    Cancelar
                  </button>
                  <button type="submit" className={styles.primaryButton} disabled={loading}>
                    {loading ? "Buscando..." : "Ver recomendações"}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === "results" && (
            <div className={styles.resultsStep}>
              <div className={styles.resultsHeader}>
                <div>
                  <p className={styles.label}>Planos recomendados</p>
                  <p className={styles.lead}>
                    Escolhemos com base no seu perfil. Ajuste os filtros se quiser refinar.
                  </p>
                </div>
                <div className={styles.resultsActions}>
                  <button
                    type="button"
                    className={styles.ghostButton}
                    onClick={() => {
                      setStep("form");
                      setRecommendedPlans([]);
                      setError(null);
                      setLoading(false);
                      setPage(0);
                    }}
                  >
                    Ajustar filtros
                  </button>
                  <button type="button" className={styles.primaryButton} onClick={handleClose}>
                    Fechar
                  </button>
                </div>
              </div>

              {error && <div className={styles.errorBox}>{error}</div>}

              {loading && (
                <div className={styles.loadingBox}>
                  <span className={styles.spinner} aria-hidden />
                  <span>Buscando recomendações...</span>
                </div>
              )}

              {!loading && !error && recommendedPlans.length === 0 && (
                <div className={styles.emptyState}>
                  <span role="img" aria-label="Sem resultados" className={styles.emptyEmoji}>
                    🔍
                  </span>
                  <p>Nenhum plano recomendado para este perfil. Ajuste os filtros e tente novamente.</p>
                </div>
              )}

              {!loading && !error && recommendedPlans.length > 0 && (
                <div className={styles.carouselWrapper}>
                  <div className={styles.carouselControls}>
                    <button
                      type="button"
                      className={styles.ghostButton}
                      onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                      disabled={page === 0}
                    >
                      ← Anterior
                    </button>
                    <div className={styles.carouselStatus}>
                      {page + 1} / {totalPages}
                    </div>
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                      disabled={page >= totalPages - 1}
                    >
                      Próximo →
                    </button>
                  </div>

                  <div className={styles.carousel}>
                    {visiblePlans.map((plan, index) => (
                      <article
                        key={plan.id ?? `${plan.name}-${index}`}
                        className={`${styles.planCard} ${plan.emphasis ? styles.featuredCard : ""}`}
                      >
                        {plan.emphasis && <span className={styles.featuredBadge}>Mais recomendado</span>}
                        <div className={styles.cardHeader}>
                          <div>
                            <p className={styles.planName}>{plan.name}</p>
                            <p className={styles.planMeta}>
                              {plan.operator} • {plan.city}
                            </p>
                          </div>
                          <span className={styles.planPrice}>
                            R$ {Number(plan.price).toFixed(2)}
                            <small>/mês</small>
                          </span>
                        </div>
                        <div className={styles.cardBody}>
                          <div className={styles.planStat}>
                            <span className={styles.statLabel}>Velocidade</span>
                            <strong className={styles.statValue}>{plan.speed}</strong>
                          </div>
                          <div className={styles.planStat}>
                            <span className={styles.statLabel}>Franquia</span>
                            <strong className={styles.statValue}>
                              {plan.dataCap ? `${plan.dataCap} GB` : "Ilimitado"}
                            </strong>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
