"use strict";

// SABOTAGEM CP05 (Prova 2) - código VULNERÁVEL de propósito.
// A "calculadora rápida" avalia o texto digitado pelo usuário com eval().
// Qualquer JavaScript digitado no campo (ou injetado via link) é executado
// no contexto da página: é exatamente isso que o Semgrep precisa barrar.
function calcular(expressao) {
  return eval(expressao);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("calc-form");
  const entrada = document.getElementById("calc-input");
  const saida = document.getElementById("calc-output");

  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saida.textContent = String(calcular(entrada.value));
  });

  // Permite compartilhar uma conta pelo link: /#2*21 já mostra o resultado
  if (window.location.hash.length > 1) {
    const doLink = decodeURIComponent(window.location.hash.slice(1));
    entrada.value = doLink;
    saida.textContent = String(calcular(doLink));
  }
});
