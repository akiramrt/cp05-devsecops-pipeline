"use strict";

// SABOTAGEM CP05 (Prova 1) - segredo FALSO commitado de propósito.
// Configuração da integração de pagamentos, com a chave de API escrita direto
// no código (o erro que causou o incidente da Arcanjosa). A chave NÃO é real.
const PAYMENT_API_URL = "https://api.pagamentos.arcanjosa.example/v1";
const PAYMENT_API_KEY = "x7Qm9Lr2Vb8Tn4Wp6Zs1Hc3Jd5Kf0Gy";

window.ARCANJOSA_CONFIG = Object.freeze({
  paymentApiUrl: PAYMENT_API_URL,
  paymentApiKey: PAYMENT_API_KEY
});
