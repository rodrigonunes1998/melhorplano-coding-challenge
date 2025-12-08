import test from "node:test";
import assert from "node:assert/strict";
import { Plan } from "../models/plan";
import {
  applyFilters,
  // funções internas não exportadas não são testadas diretamente
} from "../services/utils/filters";
import * as Filters from "../services/utils/filters";

const planos: Plan[] = [
  { id: 1, name: "Basic", speed: "100Mbps", price: 80, operator: "Vivo", city: "São Paulo", dataCap: 200 },
  { id: 2, name: "Premium", speed: "300Mbps", price: 150, operator: "Claro", city: "Rio de Janeiro", dataCap: 500 },
  { id: 3, name: "Gamer", speed: "600Mbps", price: 220, operator: "Vivo", city: "São Paulo", dataCap: 1000 },
  { id: 4, name: "Lite", speed: "50Mbps", price: 60, operator: "Oi", city: "Recife", dataCap: 100 },
];

test("filterMinPrice mantém apenas planos com preço >= mínimo", () => {
  const resultado = (Filters as any).filterMinPrice(planos, 100);
  assert.deepStrictEqual(
    resultado.map((p: Plan) => p.id),
    [2, 3],
    "Planos com preço abaixo de 100 devem ser removidos"
  );
});

test("filterMaxPrice mantém apenas planos com preço <= máximo", () => {
  const resultado = (Filters as any).filterMaxPrice(planos, 100);
  assert.deepStrictEqual(
    resultado.map((p: Plan) => p.id),
    [1, 4],
    "Planos com preço acima de 100 devem ser removidos"
  );
});

test("filterMinDataCap mantém apenas planos com franquia >= mínimo", () => {
  const resultado = (Filters as any).filterMinDataCap(planos, 300);
  assert.deepStrictEqual(
    resultado.map((p: Plan) => p.id),
    [2, 3],
    "Planos com franquia abaixo de 300GB devem ser removidos"
  );
});

test("filterMaxDataCap mantém apenas planos com franquia <= máximo", () => {
  const resultado = (Filters as any).filterMaxDataCap(planos, 300);
  assert.deepStrictEqual(
    resultado.map((p: Plan) => p.id),
    [1, 4],
    "Planos com franquia acima de 300GB devem ser removidos"
  );
});

test("filterOperator faz comparação case-insensitive", () => {
  const resultado = (Filters as any).filterOperator(planos, "vivo");
  assert.deepStrictEqual(
    resultado.map((p: Plan) => p.id),
    [1, 3],
    "Deve retornar somente planos da operadora informada"
  );
});

test("filterCity filtra por cidade (case-insensitive)", () => {
  const resultado = (Filters as any).filterCity(planos, "são paulo");
  assert.deepStrictEqual(
    resultado.map((p: Plan) => p.id),
    [1, 3],
    "Deve retornar somente planos da cidade informada"
  );
});

test("filterName filtra por nome exato (case-insensitive)", () => {
  const resultado = (Filters as any).filterName(planos, "gamer");
  assert.deepStrictEqual(
    resultado.map((p: Plan) => p.id),
    [3],
    "Deve retornar somente planos com o nome informado"
  );
});

test("applyFilters retorna todos quando nenhum filtro é informado", () => {
  const resultado = applyFilters(planos, {});
  assert.equal(resultado.length, planos.length, "Sem filtros, nada deve ser removido");
});

test("applyFilters aplica múltiplos filtros em sequência", () => {
  const resultado = applyFilters(planos, {
    minPrice: 80,
    maxPrice: 200,
    maxDataCap: 700,
    operator: "Vivo",
  });

  assert.deepStrictEqual(
    resultado.map((p) => p.id),
    [1],
    "Deve restar apenas o plano Vivo com preço entre 80 e 200 e franquia <= 700GB"
  );
});
