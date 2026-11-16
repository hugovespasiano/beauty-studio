# AGENTS.md - Governança dos Agentes de IA (Beauty Studio)

## 1. Missão
Este documento estabelece as diretrizes e fronteiras operacionais para todos os agentes de IA atuando no desenvolvimento e manutenção do **Beauty Studio Pro**.

## 2. Princípios Inegociáveis
1. **Privacidade Absoluta (Zero-Cloud / On-Device First):** Nenhuma foto, biometria facial, mapa de contorno ou coordenada de imagem pode ser transmitida para servidores externos. Todo o processamento de visão computacional, retoque e inpainting deve ocorrer exclusivamente no dispositivo do usuário (Samsung Galaxy S25 / Android NPU & GPU).
2. **Edição Não Destrutiva:** As fotografias originais nunca são sobrescritas. O usuário sempre tem acesso ao comparador em tempo real e ao botão de restauração.
3. **Desempenho Térmico e de Memória:** O Snapdragon 8 Elite e os 12GB de RAM devem ser utilizados com eficiência, sem provocar superaquecimento ou travamentos por Out Of Memory (OOM) ao carregar imagens em alta resolução.
4. **Sem Dependência de APIs Pagas:** Todo motor de processamento deve ser baseado em bibliotecas abertas ou modelos locais (WebGL Shaders, MediaPipe, ONNX Runtime Web).

## 3. Matriz de Responsabilidades dos Agentes
* **Core Image Agent:** Responsável pelos algoritmos de deformação (Liquify), suavização de pele (Bilateral Filter) e inpainting (LaMa / Laplace).
* **UI/UX Agent:** Responsável pelos componentes táteis, layout responsivo para smartphone (orientação retrato/paisagem), transições suaves e acessibilidade.
* **Security & Audit Agent:** Responsável por auditar permissões de AndroidManifest.xml, integridade do storage e compliance com LGPD/GDPR.
