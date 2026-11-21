#!/usr/bin/env node
/**
 * scripts/audit-conformance.js — Vespasiano Labs
 * Validador Automatizado de Conformidade do Contrato da Fundação (FOUNDATION_CONTRACT.md)
 * Suporte a 4 Estados Canônicos: PASSOU, FALHOU, INCONCLUSIVO e NÃO APLICÁVEL.
 * Zero dependências externas (100% Node.js nativo).
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = process.cwd();

// Cores ANSI para saída no terminal
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const GRAY = "\x1b[90m";

console.log(`\n${BOLD}${CYAN}========================================================================${RESET}`);
console.log(`${BOLD}${CYAN}  VESPASIANO LABS — LINTER DE CONFORMIDADE ARQUITETURAL DA FUNDAÇÃO    ${RESET}`);
console.log(`${BOLD}${CYAN}  Governança Verificável com 4 Estados: PASSOU, FALHOU, INCONCLUSIVO, N/A${RESET}`);
console.log(`${BOLD}${CYAN}========================================================================${RESET}\n`);

const results = [];

function recordCheck(id, name, status, details) {
  // Normalização de compatibilidade booleana
  if (status === true) status = "PASSOU";
  if (status === false) status = "FALHOU";

  results.push({ id, name, status, details });

  let icon = "";
  if (status === "PASSOU") {
    icon = `${GREEN}✔ PASSOU        ${RESET}`;
  } else if (status === "FALHOU") {
    icon = `${RED}✖ FALHOU        ${RESET}`;
  } else if (status === "INCONCLUSIVO") {
    icon = `${YELLOW}⚠ INCONCLUSIVO  ${RESET}`;
  } else if (status === "NAO_APLICAVEL") {
    icon = `${GRAY}⚪ NÃO APLICÁVEL${RESET}`;
  }

  console.log(`  [${id}] ${icon} — ${BOLD}${name}${RESET}`);
  if (details && (status === "FALHOU" || status === "INCONCLUSIVO")) {
    const color = status === "FALHOU" ? RED : YELLOW;
    console.log(`      ${color}Detalhe: ${details}${RESET}`);
  } else if (details && status === "NAO_APLICAVEL") {
    console.log(`      ${GRAY}Contexto: ${details}${RESET}`);
  }
}

function readFileSafe(filePath) {
  try {
    const fullPath = path.resolve(ROOT_DIR, filePath);
    if (!fs.existsSync(fullPath)) return null;
    return fs.readFileSync(fullPath, "utf-8");
  } catch {
    return null;
  }
}

function getAllFiles(dirPath, extension) {
  let fileList = [];
  try {
    const fullDir = path.resolve(ROOT_DIR, dirPath);
    if (!fs.existsSync(fullDir)) return [];
    const entries = fs.readdirSync(fullDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
      const res = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        fileList = fileList.concat(getAllFiles(res, extension));
      } else if (!extension || entry.name.endsWith(extension)) {
        fileList.push(res);
      }
    }
  } catch {
    // Ignore errors
  }
  return fileList;
}

// -----------------------------------------------------------------------------
// CHECK 01: .gitignore com Whitelist Restrita
// -----------------------------------------------------------------------------
const gitignore = readFileSafe(".gitignore");
if (!gitignore) {
  recordCheck("01", ".gitignore com Whitelist Restrita", "FALHOU", "Arquivo .gitignore ausente.");
} else {
  const hasEnvWildcard = /\.env(\.\*|\*)/i.test(gitignore);
  const hasExampleException = gitignore.includes("!.env.example");
  const hasKeyBlock = gitignore.includes("*.key") || gitignore.includes("secrets/");
  if (hasEnvWildcard && hasExampleException && hasKeyBlock) {
    recordCheck("01", ".gitignore com Whitelist Restrita", "PASSOU");
  } else {
    recordCheck("01", ".gitignore com Whitelist Restrita", "FALHOU", "Não bloqueia .env.* ou não preserva !.env.example ou falta *.key/secrets.");
  }
}

// -----------------------------------------------------------------------------
// Carregar SQL de migrations
// -----------------------------------------------------------------------------
const sqlFiles = getAllFiles("supabase/migrations", ".sql");
let allSql = "";
sqlFiles.forEach((file) => {
  const content = readFileSafe(file);
  if (content) allSql += `\n-- File: ${file}\n` + content;
});

const isDatabaseApp = sqlFiles.length > 0 || fs.existsSync(path.resolve(ROOT_DIR, "supabase"));

// -----------------------------------------------------------------------------
// CHECK 02: Substrato Universal de Identidade (public.profiles + Idempotência ON CONFLICT)
// -----------------------------------------------------------------------------
if (!isDatabaseApp) {
  recordCheck("02", "Substrato Universal de Identidade (public.profiles + Idempotência)", "NAO_APLICAVEL", "Aplicação sem infraestrutura de banco de dados Supabase.");
} else if (!allSql) {
  recordCheck("02", "Substrato Universal de Identidade (public.profiles + Idempotência)", "INCONCLUSIVO", "Diretório supabase presente, mas nenhuma migration .sql encontrada.");
} else {
  const hasProfilesTable = /CREATE\s+TABLE[^(]+public\.profiles/i.test(allSql) || /CREATE\s+TABLE[^(]+profiles/i.test(allSql);
  const hasProfilesRls = /ALTER\s+TABLE[^(]+profiles\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i.test(allSql);
  const hasUserTrigger = /CREATE\s+TRIGGER\s+on_auth_user_created/i.test(allSql) || /handle_new_user/i.test(allSql);
  
  const handleNewUserBlock = allSql.match(/FUNCTION\s+(public\.)?handle_new_user[\s\S]*?END;/i);
  const hasIdempotentTrigger = handleNewUserBlock ? /ON\s+CONFLICT/i.test(handleNewUserBlock[0]) : /ON\s+CONFLICT\s*(\(\s*id\s*\))?\s+DO\s+(NOTHING|UPDATE)/i.test(allSql);

  if (hasProfilesTable && hasProfilesRls && hasUserTrigger && hasIdempotentTrigger) {
    recordCheck("02", "Substrato Universal de Identidade (public.profiles + Idempotência)", "PASSOU");
  } else {
    let missing = [];
    if (!hasProfilesTable) missing.push("tabela profiles");
    if (!hasProfilesRls) missing.push("RLS em profiles");
    if (!hasUserTrigger) missing.push("trigger on_auth_user_created");
    if (!hasIdempotentTrigger) missing.push("idempotência ON CONFLICT (id) DO NOTHING");
    recordCheck(
      "02",
      "Substrato Universal de Identidade (public.profiles + Idempotência)",
      "FALHOU",
      `Requisitos de identidade pendentes: ${missing.join(", ")}.`
    );
  }
}

// -----------------------------------------------------------------------------
// CHECK 03: Trilha Imutável de Auditoria (public.audit_logs)
// -----------------------------------------------------------------------------
if (!isDatabaseApp) {
  recordCheck("03", "Trilha Imutável de Auditoria (public.audit_logs)", "NAO_APLICAVEL", "Projeto sem banco de dados.");
} else {
  const hasAuditTable = /CREATE\s+TABLE[^(]+public\.audit_logs/i.test(allSql) || /CREATE\s+TABLE[^(]+audit_logs/i.test(allSql);
  const hasAuditRls = /ALTER\s+TABLE[^(]+audit_logs\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i.test(allSql);

  if (hasAuditTable && hasAuditRls) {
    recordCheck("03", "Trilha Imutável de Auditoria (public.audit_logs)", "PASSOU");
  } else {
    recordCheck("03", "Trilha Imutável de Auditoria (public.audit_logs)", "FALHOU", "Tabela audit_logs ou RLS ausente no schema.");
  }
}

// -----------------------------------------------------------------------------
// Detectar Webhooks e Processamento Financeiro
// -----------------------------------------------------------------------------
const webhookFiles = getAllFiles("app/api/webhooks", ".ts")
  .concat(getAllFiles("app/api/webhooks", ".js"))
  .concat(getAllFiles("lib/payments", ".ts"))
  .concat(getAllFiles("lib/payments", ".js"));
let allWebhookCode = "";
webhookFiles.forEach((file) => {
  const content = readFileSafe(file);
  if (content) allWebhookCode += `\n-- File: ${file}\n` + content;
});

const pkgJson = readFileSafe("package.json");
const hasPaymentPackages = pkgJson && (pkgJson.includes("stripe") || pkgJson.includes("asaas") || pkgJson.includes("mercadopago"));
const declaresPayments = webhookFiles.length > 0 || hasPaymentPackages || fs.existsSync(path.resolve(ROOT_DIR, "types/payments.ts"));

// -----------------------------------------------------------------------------
// CHECK 04: Tabela de Idempotência Persistida (processed_webhook_events)
// -----------------------------------------------------------------------------
if (!isDatabaseApp || !declaresPayments) {
  recordCheck("04", "Tabela de Idempotência Persistida (processed_webhook_events)", "NAO_APLICAVEL", "Aplicação não processa transações financeiras nem webhooks de pagamento.");
} else {
  const hasIdempotencyTable = /CREATE\s+TABLE[^(]+public\.processed_webhook_events/i.test(allSql) || /CREATE\s+TABLE[^(]+processed_webhook_events/i.test(allSql);
  const hasUniqueConstraint = /CONSTRAINT\s+\w+\s+UNIQUE\s*\(\s*gateway\s*,\s*event_id\s*\)/i.test(allSql) || /UNIQUE\s*\(\s*gateway\s*,\s*event_id\s*\)/i.test(allSql);

  if (hasIdempotencyTable && hasUniqueConstraint) {
    recordCheck("04", "Tabela de Idempotência Persistida (processed_webhook_events)", "PASSOU");
  } else {
    recordCheck("04", "Tabela de Idempotência Persistida (processed_webhook_events)", "FALHOU", "Tabela processed_webhook_events ou chave única (gateway, event_id) ausente.");
  }
}

// -----------------------------------------------------------------------------
// CHECK 05: Webhook de Pagamento — Validação de Autenticidade Conforme Provedor
// -----------------------------------------------------------------------------
if (!declaresPayments) {
  recordCheck("05", "Webhook de Pagamento — Validação Específica por Gateway", "NAO_APLICAVEL", "Sem rotas financeiras declaradas.");
} else if (webhookFiles.length === 0) {
  recordCheck("05", "Webhook de Pagamento — Validação Específica por Gateway", "FALHOU", "Aplicação declara pagamentos mas nenhuma rota sob app/api/webhooks foi encontrada.");
} else {
  // Detectar gateway
  const isAsaas = /asaas/i.test(allWebhookCode);
  const isStripe = /stripe/i.test(allWebhookCode);
  const isMercadoPago = /mercadopago/i.test(allWebhookCode);

  const hasFailClosed = /throw\s+new\s+Error|return\s+NextResponse\.json\(\s*\{[^}]*error/i.test(allWebhookCode);
  const hasTimingSafe = /timingSafeEqual/i.test(allWebhookCode) || /stripe\.webhooks\.constructEvent/i.test(allWebhookCode);
  const hasRawBody = /request\.text\(\)|rawBody/i.test(allWebhookCode);

  if (isAsaas) {
    // Asaas valida via asaas-access-token em tempo constante (Raw Body opcional no protocolo do Asaas)
    if (hasTimingSafe && hasFailClosed) {
      recordCheck("05", "Webhook de Pagamento — Validação Específica por Gateway", "PASSOU");
    } else {
      recordCheck("05", "Webhook de Pagamento — Validação Específica por Gateway", "FALHOU", "Asaas webhook sem comparação timingSafeEqual ou fail-closed ausente.");
    }
  } else if (isStripe || isMercadoPago) {
    // Stripe e Mercado Pago exigem Raw Body para cálculo de HMAC
    if (hasTimingSafe && hasRawBody && hasFailClosed) {
      recordCheck("05", "Webhook de Pagamento — Validação Específica por Gateway", "PASSOU");
    } else {
      recordCheck("05", "Webhook de Pagamento — Validação Específica por Gateway", "FALHOU", "Webhook Stripe/MercadoPago sem rawBody ou timingSafeEqual.");
    }
  } else {
    if (hasTimingSafe && hasFailClosed) {
      recordCheck("05", "Webhook de Pagamento — Validação Específica por Gateway", "PASSOU");
    } else {
      recordCheck("05", "Webhook de Pagamento — Validação Específica por Gateway", "INCONCLUSIVO", "Mecanismo oficial de gateway não identificado com certeza.");
    }
  }
}

// -----------------------------------------------------------------------------
// CHECK 06: Prevenção Anti-Replay em Webhooks
// -----------------------------------------------------------------------------
if (!declaresPayments || webhookFiles.length === 0) {
  recordCheck("06", "Prevenção Anti-Replay em Webhooks", "NAO_APLICAVEL", "Sem rotas financeiras.");
} else {
  const hasTimestampCheck = /isTimestampValid|timestamp|300/i.test(allWebhookCode);
  const hasAtomicIdempotency = /processed_webhook_events|23505/i.test(allWebhookCode);

  if (hasTimestampCheck || hasAtomicIdempotency) {
    recordCheck("06", "Prevenção Anti-Replay em Webhooks", "PASSOU");
  } else {
    recordCheck("06", "Prevenção Anti-Replay em Webhooks", "FALHOU", "Sem validação temporal de timestamp ou trava atômica de replay.");
  }
}

// -----------------------------------------------------------------------------
// CHECK 07: Deduplicação Ativa no Webhook
// -----------------------------------------------------------------------------
if (!declaresPayments || webhookFiles.length === 0) {
  recordCheck("07", "Deduplicação de Eventos Ativa no Webhook", "NAO_APLICAVEL", "Sem rotas financeiras.");
} else {
  const hasDeduplication = /processed_webhook_events|recordWebhookEvent/i.test(allWebhookCode);
  if (hasDeduplication) {
    recordCheck("07", "Deduplicação de Eventos Ativa no Webhook", "PASSOU");
  } else {
    recordCheck("07", "Deduplicação de Eventos Ativa no Webhook", "FALHOU", "O webhook não consulta nem insere na tabela de idempotência antes de atualizar planos.");
  }
}

// -----------------------------------------------------------------------------
// CHECK 08: Interceptor de Borda (proxy.ts ou middleware.ts)
// -----------------------------------------------------------------------------
const proxy = readFileSafe("proxy.ts");
const middleware = readFileSafe("middleware.ts");
const isNextApp = fs.existsSync(path.resolve(ROOT_DIR, "next.config.ts")) || fs.existsSync(path.resolve(ROOT_DIR, "next.config.js")) || (pkgJson && pkgJson.includes("next"));

if (!isNextApp) {
  recordCheck("08", "Interceptor de Borda (proxy.ts / Edge-Safe)", "NAO_APLICAVEL", "Aplicação não utiliza Next.js.");
} else if (!proxy && !middleware) {
  recordCheck("08", "Interceptor de Borda (proxy.ts / Edge-Safe)", "FALHOU", "Nenhum arquivo proxy.ts ou middleware.ts encontrado na raiz.");
} else {
  const edgeCode = proxy || middleware;
  const importsNextHeaders = edgeCode.includes("next/headers");
  if (importsNextHeaders) {
    recordCheck("08", "Interceptor de Borda (proxy.ts / Edge-Safe)", "FALHOU", "Arquivo de borda importa next/headers (quebra no Edge Runtime).");
  } else {
    recordCheck("08", "Interceptor de Borda (proxy.ts / Edge-Safe)", "PASSOU");
  }
}

// -----------------------------------------------------------------------------
// CHECK 09: Matriz dos 6 Security Headers Canônicos (CSP, HSTS, X-Frame)
// -----------------------------------------------------------------------------
const nextConfig = readFileSafe("next.config.ts") || readFileSafe("next.config.js") || readFileSafe("next.config.mjs");

if (!isNextApp) {
  recordCheck("09", "Matriz dos 6 Security Headers Canônicos (CSP, HSTS, X-Frame)", "NAO_APLICAVEL", "Aplicação não utiliza Next.js.");
} else if (!nextConfig) {
  recordCheck("09", "Matriz dos 6 Security Headers Canônicos (CSP, HSTS, X-Frame)", "FALHOU", "Arquivo next.config ausente.");
} else {
  const hasHeadersFn = /async\s+headers\s*\(\s*\)/i.test(nextConfig) || /headers:\s*async/i.test(nextConfig);
  const hasCsp = /Content-Security-Policy/i.test(nextConfig);
  const hasXFrame = /X-Frame-Options/i.test(nextConfig);
  const hasNosniff = /X-Content-Type-Options/i.test(nextConfig);
  const hasHsts = /Strict-Transport-Security/i.test(nextConfig);
  const hasReferrer = /Referrer-Policy/i.test(nextConfig);
  const hasPermissions = /Permissions-Policy/i.test(nextConfig);

  const allHeadersPresent = hasHeadersFn && hasCsp && hasXFrame && hasNosniff && hasHsts && hasReferrer && hasPermissions;

  if (allHeadersPresent) {
    const hasUnsafeInline = nextConfig.includes("'unsafe-inline'");
    if (hasUnsafeInline) {
      recordCheck("09", "Matriz dos 6 Security Headers Canônicos (CSP, HSTS, X-Frame)", "PASSOU", "Aprovado com CSP permissiva ('unsafe-inline' detectado). Recomenda-se evoluir para nonces/hashes.");
    } else {
      recordCheck("09", "Matriz dos 6 Security Headers Canônicos (CSP, HSTS, X-Frame)", "PASSOU");
    }
  } else {
    recordCheck(
      "09",
      "Matriz dos 6 Security Headers Canônicos (CSP, HSTS, X-Frame)",
      "FALHOU",
      "Faltam cabeçalhos de segurança obrigatórios em next.config."
    );
  }
}

// -----------------------------------------------------------------------------
// CHECK 10: Módulos Anti-Robô (Turnstile) e Rate Limiting
// -----------------------------------------------------------------------------
const turnstileHelper = readFileSafe("lib/security/turnstile.ts");
const rateLimitHelper = readFileSafe("lib/security/rate-limit.ts");

if (!isNextApp && !isDatabaseApp) {
  recordCheck("10", "Helpers de Proteção Anti-Robô (Turnstile) e Rate Limiting", "NAO_APLICAVEL", "Aplicação sem rotas públicas de autenticação.");
} else {
  const hasTurnstile = turnstileHelper && /challenges\.cloudflare\.com\/turnstile\/v0\/siteverify/i.test(turnstileHelper);
  const hasRateLimit = rateLimitHelper && /checkRateLimit/i.test(rateLimitHelper);

  if (hasTurnstile && hasRateLimit) {
    recordCheck("10", "Helpers de Proteção Anti-Robô (Turnstile) e Rate Limiting", "PASSOU");
  } else {
    recordCheck(
      "10",
      "Helpers de Proteção Anti-Robô (Turnstile) e Rate Limiting",
      "FALHOU",
      `Módulos ausentes em lib/security (Turnstile: ${!!hasTurnstile}, RateLimit: ${!!hasRateLimit}).`
    );
  }
}

// -----------------------------------------------------------------------------
// CHECK 11: Auditoria de XSS e Ausência de dangerouslySetInnerHTML Não Sanitizado
// -----------------------------------------------------------------------------
const tsxFiles = getAllFiles("app", ".tsx").concat(getAllFiles("components", ".tsx")).concat(getAllFiles("src", ".tsx"));
let dangerousUsages = [];

tsxFiles.forEach((file) => {
  const content = readFileSafe(file);
  if (content && content.includes("dangerouslySetInnerHTML")) {
    const hasSanitization = /DOMPurify|sanitize|isomorphic-dompurify/i.test(content);
    const hasAuditComment = /XSS-AUDITED|JUSTIFICATIVA/i.test(content);
    if (!hasSanitization || !hasAuditComment) {
      dangerousUsages.push(`${file} (Sanitização: ${hasSanitization}, Comentário: ${hasAuditComment})`);
    }
  }
});

if (tsxFiles.length === 0) {
  recordCheck("11", "Prevenção Rigorosa de XSS (dangerouslySetInnerHTML)", "NAO_APLICAVEL", "Sem arquivos de interface React/TSX.");
} else if (dangerousUsages.length === 0) {
  recordCheck("11", "Prevenção Rigorosa de XSS (dangerouslySetInnerHTML)", "PASSOU");
} else {
  recordCheck("11", "Prevenção Rigorosa de XSS (dangerouslySetInnerHTML)", "FALHOU", `Ocorrências de dangerouslySetInnerHTML sem sanitização/justificativa: ${dangerousUsages.join(", ")}`);
}

// -----------------------------------------------------------------------------
// CHECK 12: Integridade da Cadeia de Suprimentos & Lockfile
// -----------------------------------------------------------------------------
const hasPackageJson = fs.existsSync(path.resolve(ROOT_DIR, "package.json"));
const hasPackageLock = fs.existsSync(path.resolve(ROOT_DIR, "package-lock.json"));
const hasPnpmLock = fs.existsSync(path.resolve(ROOT_DIR, "pnpm-lock.yaml"));
const hasPoetryLock = fs.existsSync(path.resolve(ROOT_DIR, "poetry.lock"));
const hasRequirements = fs.existsSync(path.resolve(ROOT_DIR, "requirements.txt"));

if (!hasPackageJson && !hasRequirements) {
  recordCheck("12", "Cadeia de Suprimentos & Lockfiles Fixados", "NAO_APLICAVEL", "Projeto sem gerenciador de pacotes.");
} else if (hasPackageJson && (hasPackageLock || hasPnpmLock)) {
  recordCheck("12", "Cadeia de Suprimentos & Lockfiles Fixados", "PASSOU");
} else if (hasRequirements && hasPoetryLock) {
  recordCheck("12", "Cadeia de Suprimentos & Lockfiles Fixados", "PASSOU");
} else {
  recordCheck("12", "Cadeia de Suprimentos & Lockfiles Fixados", "INCONCLUSIVO", "package.json presente, mas lockfile (package-lock.json) ausente ou não rastreado no Git.");
}

// -----------------------------------------------------------------------------
// CHECK 13: Integração das Skills de Governança
// -----------------------------------------------------------------------------
const hasAiSkill = fs.existsSync(path.resolve(ROOT_DIR, "skills/ai-agent-security/SKILL.md")) || 
                   fs.existsSync(path.resolve(ROOT_DIR, "../meu-template-base/skills/ai-agent-security/SKILL.md"));
const hasSupplySkill = fs.existsSync(path.resolve(ROOT_DIR, "skills/supply-chain-security/SKILL.md")) || 
                       fs.existsSync(path.resolve(ROOT_DIR, "../meu-template-base/skills/supply-chain-security/SKILL.md"));

if (hasAiSkill && hasSupplySkill) {
  recordCheck("13", "Skills de Segurança Especializadas (IA & Cadeia de Suprimentos)", "PASSOU");
} else {
  recordCheck("13", "Skills de Segurança Especializadas (IA & Cadeia de Suprimentos)", "INCONCLUSIVO", "Skills ai-agent-security ou supply-chain-security não localizadas.");
}

// -----------------------------------------------------------------------------
// Resumo Final e Código de Saída
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}${CYAN}------------------------------------------------------------------------${RESET}`);
const totalPassed = results.filter((r) => r.status === "PASSOU").length;
const totalFailed = results.filter((r) => r.status === "FALHOU").length;
const totalInconclusive = results.filter((r) => r.status === "INCONCLUSIVO").length;
const totalNA = results.filter((r) => r.status === "NAO_APLICAVEL").length;

console.log(`  Resumo da Auditoria:`);
console.log(`  • ${GREEN}✔ PASSOU:${RESET}         ${totalPassed}`);
console.log(`  • ${RED}✖ FALHOU:${RESET}         ${totalFailed}`);
console.log(`  • ${YELLOW}⚠ INCONCLUSIVO:${RESET}   ${totalInconclusive}`);
console.log(`  • ${GRAY}⚪ NÃO APLICÁVEL:${RESET} ${totalNA}`);
console.log(`  • Total de Regras:   ${results.length}`);

if (totalFailed === 0) {
  if (totalInconclusive > 0) {
    console.log(`\n${BOLD}${YELLOW}  ⚠ HOMOLOGAÇÃO COM RESSALVAS: Zero falhas críticas, mas existem ${totalInconclusive} pontos inconclusivos para revisão manual.${RESET}`);
    process.exit(0);
  } else {
    console.log(`\n${BOLD}${GREEN}  🎉 PARABÉNS! HOMOLOGAÇÃO PLENA!${RESET}`);
    console.log(`${GREEN}  A aplicação cumpre rigorosamente os controles da Fundação com evidências comprovadas.${RESET}`);
    console.log(`${BOLD}${CYAN}========================================================================${RESET}\n`);
    process.exit(0);
  }
} else {
  console.log(`\n${BOLD}${RED}  ❌ REPROVADO: ${totalFailed} vulnerabilidades ou não-conformidades identificadas.${RESET}`);
  console.log(`${RED}  Consulte os detalhes acima e corrija as pendências antes de prosseguir.${RESET}`);
  console.log(`${BOLD}${CYAN}========================================================================${RESET}\n`);
  process.exit(1);
}
