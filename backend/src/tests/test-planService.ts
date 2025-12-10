import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { filtersPlansBySpeedAndPrice, searchPlans, getAllPlansOnlyWithPrice } from "../services/planService";
import * as PlanRepository from "../infraestructure/repositories/PlanRepository";
import { cloneMockPlans } from "./mocks/planMock";

beforeEach(() => {
  // @ts-ignore: sobrescrita do repositório apenas no contexto de testes
  PlanRepository.getAllPlans = () => cloneMockPlans();
});

test("filtersPlansBySpeedAndPrice filtra por velocidade mínima e preço máximo", async() => {
  const resultado = await filtersPlansBySpeedAndPrice({ minSpeedMbps: 150, maxPrice: 150 });

  assert.deepStrictEqual(
    resultado.map((p) => p.id),
    [4],
    "Deve manter apenas planos com velocidade >=150Mbps e preço <=150"
  );
});

test("filtersPlansBySpeedAndPrice sem filtros retorna todos do repositório mockado", async() => {
  const resultado = await filtersPlansBySpeedAndPrice();
  const totalMock = cloneMockPlans().length;
  assert.equal(resultado.length, totalMock, "Sem filtros, deve trazer todos os planos");
});

test("searchPlans filtra por operador e cidade, respeitando paginação", async () => {
  const { plans, total, totalPages, page, pageSize } = await searchPlans(
    { operator: "Vivo", city: "São Paulo" },
    1,
    2
  );

  assert.equal(total, 3, "Há 3 planos Vivo em São Paulo");
  assert.equal(totalPages, 2, "Com pageSize 2, deve ter 2 páginas");
  assert.equal(plans.length, 2, "Primeira página retorna 2 itens");
  assert.deepStrictEqual(
    plans.map((p) => p.id),
    [1, 2],
    "A ordem original deve ser preservada sem critério de ordenação"
  );
  assert.equal(page, 1);
  assert.equal(pageSize, 2);
});

test("searchPlans ordena por preço do maior para o menor", async() => {
  const { plans } = await searchPlans({ sorted: "price", order: "max" }, 1, 3);
  const prices = plans.map((p) => p.price);

  assert.deepStrictEqual(prices, [300, 200, 150], "Top 3 preços devem vir em ordem decrescente");
});

test("searchPlans aplica filtro de franquia mínima", async() => {
  const { plans, total } = await searchPlans({ minDataCap: 1000 }, 1, 10);

  assert.equal(total, 2, "Há 2 planos com franquia >= 1000GB");
  assert.ok(plans.every((p) => p.dataCap >= 1000), "Todos os planos retornados respeitam o limite mínimo");
});

test("getAllPlansOnlyWithPrice retorna nomes em maiúsculo e só planos com preço definido",async () => {
  const resultado = await getAllPlansOnlyWithPrice();

  assert.ok((resultado).every((p) => typeof p.price === "number"), "Todos os planos devem ter preço definido");
  assert.ok(resultado.every((p) => p.name === p.name.toUpperCase()), "Todos os nomes devem estar em maiúsculas");
});
