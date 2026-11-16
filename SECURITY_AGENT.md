# SECURITY_AGENT.md - Auditoria de Privacidade e Segurança Local

## 1. Escopo de Segurança
O Beauty Studio processa imagens biométricas de rosto e corpo de usuárias. A sensibilidade desses dados exige auditoria contínua de permissões e vazamento de dados.

## 2. Checklist de Auditoria Obrigatório
* [x] **Permissões de Rede:** O app NÃO deve solicitar permissões de envio indiscriminado de dados. Não há telemetria de fotos.
* [x] **Armazenamento Seguro:** As imagens exportadas são salvas na galeria do usuário através da MediaStore API do Android, com isolamento de sandbox de app.
* [x] **Limpeza de Buffer:** Buffers de textura WebGL e Canvas são descartados após o processamento para evitar retenção residual de dados sensíveis na memória RAM.
* [x] **Sem SDKs Invasivos:** Proibida a inclusão de SDKs de anúncios intrusivos ou trackers que leiam o armazenamento do aparelho.
