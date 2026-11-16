# 🗺️ ROADMAP - Beauty Studio Pro

Planejamento estratégico de desenvolvimento do **Beauty Studio Pro**, focado no hardware do **Samsung Galaxy S25 (Snapdragon 8 Elite / 12 GB RAM / GPU Adreno)** com arquitetura **100% On-Device** (Zero Custo de Nuvem / Privacidade Total).

---

## 📌 Visão do Produto
* **Público-Alvo Inicial:** Uso pessoal e profissional para a esposa (estúdio de estética / fotos de procedimentos / beleza pessoal).
* **Público Comercial:** Venda na Google Play Store (R$ 19,90/mês, R$ 97/ano, R$ 147 vitalício) e B2B para clínicas de estética.
* **Diferencial Inegociável:** Processamento 100% local no aparelho, fotos nunca enviadas para servidores, sem mensalidade obrigatória, exportação em resolução original (até 50 MP).

---

## 🚀 Fases de Entrega

### ✅ Fase 1: Fundação & MVP Funcional (Concluída)
- [x] Arquitetura base com React 19 + TypeScript + Vite + Tailwind CSS.
- [x] Integração nativa com **Capacitor** para plataforma Android.
- [x] Canvas interativo com suporte a toque, zoom, pan e histórico (Undo/Redo/Reset).
- [x] **Afinar Rosto (V-Line):** Deformação automática e manual (Liquify Push).
- [x] **Pele & Poros:** Filtro bilateral preservador de bordas com controle de Glow.
- [x] **Borracha Inteligente:** Remoção de manchas e espinhas com inpainting local automático.
- [x] **Modelador Corporal:** Pincel de cintura e contorno de silhueta.
- [x] **Brilho Capilar:** Realce de reflexos e mechas de salão.
- [x] **Luz Studio:** Ajustes de temperatura (Golden Hour), contraste e exposição.
- [x] **Maquiagem Virtual:** Batom com paleta de cores (Matte e Gloss).
- [x] **Sorriso & Olhar:** Clareamento dental e anti-olheiras.
- [x] **Post Instagram:** Gerador de cartão Antes x Depois 4:5 para Stories/Feed.
- [x] Governança de Agentes (`AGENTS.md`, `SECURITY_AGENT.md`, `ADR-0001`).

---

### ⏳ Fase 2: IA Local com MediaPipe & Visão Computacional (Próxima Etapa)
- [ ] **MediaPipe Face Mesh (468 pontos):**
  - Detecção automática instantânea dos marcos faciais da usuária ao abrir a foto.
  - Alinhamento automático milimétrico do queixo, boca, olhos e nariz sem necessidade de marcação manual.
- [ ] **OpenMakeupSDK Facial Mapping:**
  - Aplicação de delineador, sombra com esfumado e correção de falhas em sobrancelhas.
  - Lentes de contato virtuais sutis (mel, verde, avelã, azul).
- [ ] **Remoção de Fundo / Efeito Bokeh:**
  - Segmentação do sujeito com desfoque de lente fotográfica (85mm f/1.4).

---

### ⏳ Fase 3: LaMa ONNX Inpainting (Borracha Mágica Avançada)
- [ ] Integração do modelo LaMa quantizado (`onnxruntime-web` com backend WebGPU).
- [ ] Remoção de pessoas inteiras no fundo e postes/objetos com preenchimento generativo local.
- [ ] Benchmark de consumo de bateria e temperatura térmica no Galaxy S25.

---

### ⏳ Fase 4: Otimização Mobile & Publicação (Play Store)
- [ ] Build do APK/AAB assinado para Android.
- [ ] Teste físico com fotos reais de alta resolução (12 MP e 50 MP) no Galaxy S25.
- [ ] Integração de faturamento in-app (Google Play Billing / RevenueCat) para compra vitalícia ou anual.
- [ ] Configuração de exportação direta para o álbum de fotos do Android via `@capacitor/filesystem`.

---

## 💻 Como continuar o desenvolvimento em outro notebook

1. Instale o **Node.js (versão 20+)** e o **Git**.
2. Clone o repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd beauty-studio
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Abra o projeto Android no Android Studio:
   ```bash
   npx cap open android
   ```
