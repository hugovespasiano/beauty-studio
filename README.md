# 💄 Beauty Studio Pro

Aplicativo de edição estética facial e corporal de alta precisão com processamento **100% On-Device** (executado localmente no dispositivo), desenvolvido com foco no **Samsung Galaxy S25** (Snapdragon 8 Elite).

---

## ✨ Recursos Implementados

1. **🌟 Afinar Rosto & Mandíbula:**
   - Modo automático de contorno V-Line.
   - Pincel interativo de modelagem (Liquify / Deformação de malha).
2. **✨ Suavização de Pele & Poros:**
   - Filtro bilateral preservador de bordas: suaviza marcas e poros sem deixar a pele artificial ou com aspecto de plástico.
   - Controle de *Skin Glow* e radiância.
3. **🪄 Borracha Inteligente (Inpainting):**
   - Remova espinhas, manchas ou fios soltos pintando sobre a área. O motor local preenche e mescla a textura ao soltar o dedo.
4. **💃 Modelador Corporal:**
   - Pincel de contorno e modelagem de cintura e silhueta.
5. **💇‍♀️ Brilho Capilar:**
   - Realce de luz e reflexos naturais no cabelo.
6. **☀️ Luz Studio & Golden Hour:**
   - Ajustes de temperatura de cor, contraste de estúdio e iluminação suave.
7. **👁️ Comparador Antes x Depois:**
   - Botão para inspecionar instantaneamente a foto original a qualquer momento.
8. **💾 Exportação em Alta Resolução:**
   - Download imediato da foto final preservando a nitidez da imagem.

---

## 🚀 Como Rodar o Projeto

### Modo Web / Preview Rápido:
```bash
cd beauty-studio
npm run dev
```

### Compilar para Android (Capacitor):
```bash
npm run build
npx cap sync
npx cap open android
```
*(Abra no Android Studio e instale diretamente no seu Galaxy S25 via cabo USB ou Wi-Fi debugging).*
