// Seletor de provider: escolhe mock ou real conforme a env SEFAZ_PROVIDER.
import * as mock from "./mock.js";
import * as real from "./real.js";

const PROVIDER = (process.env.SEFAZ_PROVIDER || "mock").toLowerCase();

const provider = PROVIDER === "real" ? real : mock;

export const nomeProvider = provider.nome;
export const consultar = provider.consultar;
