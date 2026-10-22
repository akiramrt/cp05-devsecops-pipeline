"use strict";

// Detalhes de cada etapa do pipeline. Todo texto é inserido com textContent
// (nunca innerHTML), então nada aqui é interpretado como HTML ou código.
const STAGES = {
  commit: {
    title: "Commit / Pull Request",
    what: "O workflow security.yml dispara em todo push e em todo pull_request. Os três jobs rodam em paralelo, em runners descartáveis do GitHub Actions.",
    why: "Segurança que depende de alguém lembrar de rodar uma ferramenta não é segurança. O gatilho automático garante que nenhuma mudança escapa da verificação.",
    fail: "Se qualquer job falhar, o check fica vermelho e a proteção do branch main impede o merge."
  },
  gitleaks: {
    title: "Gitleaks — segredos no histórico",
    what: "Varre os commits enviados procurando padrões de credenciais: chaves de API, tokens, chaves privadas, senhas com alta entropia.",
    why: "Um segredo commitado fica para sempre no histórico do Git e é coletado por robôs em minutos. Barrar antes do merge é muito mais barato do que revogar e investigar depois.",
    fail: "Prova 1: um commit com uma chave de API falsa faz o job gitleaks falhar."
  },
  semgrep: {
    title: "Semgrep — código vulnerável (SAST)",
    what: "Análise estática do código-fonte com as regras da comunidade (p/default) e uma regra própria que proíbe eval() e new Function().",
    why: "eval() executa texto como código: se esse texto vier do usuário, o atacante executa o que quiser no navegador da vítima (XSS / injeção de código).",
    fail: "Prova 2: uma calculadora que usa eval() no texto digitado faz o job semgrep falhar apontando arquivo e linha."
  },
  trivy: {
    title: "Docker build + Trivy — CVEs da imagem",
    what: "Constrói a imagem do site a partir do Dockerfile e escaneia sistema operacional e pacotes da imagem contra bases de vulnerabilidades conhecidas.",
    why: "O código pode estar perfeito e mesmo assim a imagem carregar uma biblioteca do sistema com CVE crítico explorável remotamente.",
    fail: "Prova 3: a imagem do site passa limpa; uma imagem base antiga (bônus) é barrada por CVEs CRITICAL."
  },
  merge: {
    title: "Merge liberado",
    what: "Só com os três checks verdes o pull request pode entrar no main. A regra de proteção do branch exige gitleaks, semgrep e trivy aprovados.",
    why: "O pipeline vira um portão: não é um relatório que alguém lê depois, é uma barreira que impede a mudança insegura de chegar em produção.",
    fail: "Qualquer check vermelho mantém o botão de merge bloqueado."
  }
};

function setText(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  }
}

function selectStage(name) {
  const stage = Object.hasOwn(STAGES, name) ? STAGES[name] : null;
  if (!stage) {
    return;
  }

  setText("stage-detail-title", stage.title);
  setText("stage-detail-what", "O que faz: " + stage.what);
  setText("stage-detail-why", "Por que importa: " + stage.why);
  setText("stage-detail-fail", stage.fail);

  document.querySelectorAll(".stage").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.stage === name));
  });
}

function showLoadedAt() {
  const target = document.getElementById("loaded-at");
  if (!target) {
    return;
  }
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium"
  });
  target.textContent = formatter.format(new Date());
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".stage").forEach((button) => {
    button.addEventListener("click", () => selectStage(button.dataset.stage));
  });

  selectStage("gitleaks");
  showLoadedAt();
});
