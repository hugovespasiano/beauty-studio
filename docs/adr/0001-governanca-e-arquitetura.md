# ADR 0001: Escolha da Arquitetura e Governança do Beauty Studio

## Status
Aprovado / Implementado

## Contexto
O usuário necessita de um estúdio móvel de edição e retoque estético (afinar rosto, modelar corpo, suavizar pele, borracha inteligente de manchas) para uso pessoal e profissional em um Samsung Galaxy S25. Os apps de mercado (Facetune, Remini, AirBrush) cobram mensalidades caras (R$ 200 a R$ 800/ano), enviam fotos para a nuvem e comprimem a qualidade da câmera.

## Decisão
1. **Stack Tecnológica:** React 19 + TypeScript + Vite + Tailwind CSS + Capacitor para empacotamento Android.
2. **Estratégia de Processamento:** 100% On-Device (no aparelho). Utilização de WebGL / Canvas / WebAssembly para executar cálculos de deformação (Liquify) e inpainting diretamente no Snapdragon 8 Elite e GPU Adreno.
3. **Custo de Operação:** R$ 0,00 recorrentes de infraestrutura (zero chamadas de API em nuvem).
4. **Viabilidade Comercial:** Licenciamento vitalício (R$ 147 a R$ 197) e anual (R$ 97), oferecendo como diferencial privacidade total e velocidade instantânea.

## Consequências
- Zero risco de vazamento de fotos em servidores terceiros.
- Zero despesa mensal de hospedagem/GPU em nuvem.
- Alta margem de lucro em eventuais vendas comerciais.
