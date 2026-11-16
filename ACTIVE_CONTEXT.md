# ACTIVE_CONTEXT.md - Estado do Projeto Beauty Studio Pro

## Identificação do Projeto
- **Nome:** Beauty Studio Pro
- **Repositório:** beauty-studio
- **Aparelho de Referência:** Samsung Galaxy S25 5G (Snapdragon 8 Elite, 12 GB RAM, Adreno GPU)
- **Princípio Arquitetural:** 100% On-Device / Zero Custo de Nuvem / Sem telemetria de fotos.

---

## Estrutura do Código e Módulos

```
beauty-studio/
├── src/
│   ├── assets/
│   │   └── samplePortrait.ts       # Retrato de teste em alta resolução embutido
│   ├── engine/
│   │   ├── warpEngine.ts           # Deformação facial (V-Line) e modelagem corporal
│   │   ├── skinEngine.ts           # Suavização bilateral de pele e controle de Glow
│   │   ├── eraserEngine.ts         # Inpainting local automático para espinhas e manchas
│   │   ├── filtersEngine.ts        # Luz Studio, Golden Hour e brilho capilar
│   │   └── makeupEngine.ts         # Batom (matte/gloss), dentes, anti-olheiras e Instagram
│   ├── components/
│   │   ├── CanvasEditor.tsx        # Canvas principal, suporte a toque, compare e histórico
│   │   ├── Header.tsx              # Barra superior, upload, exportação, undo/redo
│   │   └── Toolbar.tsx             # Barra inferior com 8 categorias de ferramentas
│   ├── App.tsx                     # Orquestrador principal da aplicação
│   └── index.css                   # Tailwind v4 e tema Dark Studio
├── android/                        # Projeto nativo gerado pelo Capacitor
├── docs/
│   └── adr/
│       └── 0001-governanca-e-arquitetura.md
├── AGENTS.md                       # Governança de IA e limites éticos
├── SECURITY_AGENT.md               # Auditoria de segurança e privacidade local
├── ROADMAP.md                      # Roteiro das fases e próximas implementações
└── README.md                       # Instruções de instalação e build
```

---

## Status Técnico
* **Compilação Web:** ✅ Testada com `npm run build` (zero erros TypeScript, bundle otimizado).
* **Capacitor Android:** ✅ Plataforma `android` adicionada e sincronizada com sucesso (`npx cap sync`).
* **Servidor Local:** Configurado para rodar com `npm run dev` (ou `npm.cmd run dev` no Windows).

---

## Procedimento para retomar no outro Notebook
1. Clonar o repositório do GitHub.
2. Rodar `npm install`.
3. Para testar na web: `npm run dev` (ou `npm.cmd run dev`).
4. Para compilar o APK: abrir a pasta `android` no Android Studio e executar no Galaxy S25.
