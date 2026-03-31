# Cubo 3D — Three.js

Aplicação web 3D interativa desenvolvida com [Three.js](https://threejs.org/), exibindo um cubo em uma cena com iluminação, sombras e câmera em perspectiva totalmente controlável pelo mouse.

---

## Demonstração

Abra o arquivo `index.html` em qualquer navegador moderno — nenhuma instalação é necessária.

---

## Funcionalidades

- Cubo 3D com material Phong e arestas destacadas
- Câmera em perspectiva com FOV de 60°
- Rotação automática suave enquanto o usuário não interage
- Controles completos de câmera via mouse e toque
- Iluminação com luz ambiente, direcional (com sombra) e dois pontos de cor
- HUD exibindo posição da câmera em tempo real
- Adaptação automática ao redimensionamento da janela

---

## Como executar

### Opção 1 — direto no navegador (sem servidor)

1. Faça o download ou clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/cubo-3d-threejs.git
   cd cubo-3d-threejs
   ```

2. Abra o arquivo `index.html` diretamente no seu navegador (duplo clique ou arraste para a janela).

> A biblioteca Three.js é carregada via CDN, então é necessária conexão com a internet na primeira execução (ou enquanto não houver cache).

### Opção 2 — servidor local (recomendado para desenvolvimento)

Com Python:
```bash
python -m http.server 8080
# Acesse: http://localhost:8080
```

Com Node.js (npx):
```bash
npx serve .
```

---

## Controles de câmera

| Ação | Resultado |
|---|---|
| Arrastar (botão esquerdo) | Rotacionar a câmera em órbita |
| Scroll do mouse | Aproximar / afastar (zoom) |
| Arrastar (botão direito) | Mover o ponto de interesse (pan) |
| Arrastar com um dedo (touch) | Rotacionar |

---

## Estrutura do projeto

```
cubo-3d-threejs/
├── index.html   # Página principal
├── style.css    # Estilos (layout, HUD, painel de controles)
├── main.js      # Lógica Three.js (cena, câmera, objetos, animação)
└── README.md    # Documentação
```

---

## Câmera e perspectiva — conceitos

### PerspectiveCamera

A câmera utilizada é a `THREE.PerspectiveCamera`, que simula a visão humana através da **projeção em perspectiva**. Objetos mais distantes aparecem menores, criando a sensação de profundidade.

Seus quatro parâmetros principais são:

```js
new THREE.PerspectiveCamera(fov, aspectRatio, near, far)
```

| Parâmetro | Valor usado | Significado |
|---|---|---|
| `fov` | `60°` | Campo de visão vertical (ângulo da "lente") |
| `aspectRatio` | `largura / altura` | Proporção da janela — atualizado no resize |
| `near` | `0.1` | Distância mínima de renderização |
| `far` | `100` | Distância máxima de renderização |

### Controle orbital

A câmera orbita em torno da origem usando **coordenadas esféricas** (raio, theta, phi), convertidas para coordenadas cartesianas a cada frame:

```
x = r · sin(φ) · sin(θ)
y = r · cos(φ)
z = r · sin(φ) · cos(θ)
```

Isso permite rotação suave sem gimbal lock e com controle independente de zoom (raio) e pan (deslocamento do ponto de interesse).

---

## Tecnologias

- [Three.js r128](https://threejs.org/) — renderização 3D WebGL
- HTML5 / CSS3 / JavaScript puro — sem frameworks adicionais

---

## Licença

MIT