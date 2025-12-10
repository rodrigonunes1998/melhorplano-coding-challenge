import { Plan } from "../../models/plan";

export const mockPlans: Plan[] = [
  { id: 1, name: "Plano A", speed: "100Mbps", price: 100, operator: "Vivo", city: "São Paulo", dataCap: 200 },
  { id: 2, name: "Plano B", speed: "200Mbps", price: 200, operator: "Vivo", city: "São Paulo", dataCap: 1200 },
  { id: 3, name: "Plano C", speed: "50Mbps", price: 80, operator: "Claro", city: "Rio de Janeiro", dataCap: 300 },
  { id: 4, name: "Plano D", speed: "150Mbps", price: 150, operator: "TIM", city: "Belo Horizonte", dataCap: 800 },
  { id: 5, name: "Plano E", speed: "500Mbps", price: 300, operator: "Vivo", city: "São Paulo", dataCap: 1400 },
  { id: 6, name: "Plano F", speed: "70Mbps", price: 90, operator: "Vivo", city: "Salvador", dataCap: 100 },
];

export function cloneMockPlans(): Plan[] {
  return mockPlans.map((plan) => ({ ...plan }));
}
