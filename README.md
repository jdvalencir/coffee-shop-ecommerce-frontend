# Hispania Coffee

Frontend e-commerce para una tienda de café de especialidad. La app permite explorar el catálogo, ver el detalle de cada producto y completar una compra con checkout integrado y pago conectado a Wompi en entorno sandbox.

<img width="1902" height="940" alt="image" src="https://github.com/user-attachments/assets/877e10a8-76cb-428e-8c07-af5e6591931e" />


## Información de la app

### Qué hace

- Muestra un catálogo de cafés con filtros por nivel de tueste y búsqueda por nombre, origen o notas.
- Tiene vista de detalle por producto con información ampliada, stock y atributos del café.
- Ejecuta el checkout dentro de modales, sin sacar al usuario del flujo principal.
- Captura datos de entrega, tokeniza la tarjeta y envía la transacción al backend.
- Persiste parte del estado del checkout en `localStorage` para tolerar refresh.
- Soporta tema claro/oscuro.

### Flujo principal

| Paso | Ruta o estado | Descripción |
|---|---|---|
| 1 | `/` o `/products` | Catálogo principal con hero, filtros y cards de producto |
| 2 | `/products/:id` | Vista de detalle con información extendida del café |
| 3 | Modal `checkout` | Formulario de entrega + datos de tarjeta |
| 4 | Modal `summary` | Resumen del pago antes de confirmar |
| 5 | Modal `status` | Estado final de la transacción |

### Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript + Vite 7 |
| Estado | Redux Toolkit + React Redux |
| Routing | React Router DOM 7 |
| UI | Tailwind CSS 4 + Radix UI + CVA |
| Formularios | React Hook Form + Zod |
| HTTP | Axios + `fetch` |
| Testing | Jest 30 + Testing Library |
| Package manager | pnpm |

## Capturas de pantalla

Usa esta sección para dejar evidencia visual de la app funcionando. Reemplaza los paths por imágenes reales del proyecto.

### Catálogo principal

<img width="1908" height="894" alt="image" src="https://github.com/user-attachments/assets/546f00bb-acea-483e-a62f-6707697f39c7" />

### Detalle de producto

<img width="1901" height="926" alt="image" src="https://github.com/user-attachments/assets/0a3213f3-be74-4f94-90b7-0f8ad8757571" />

### Checkout y resumen

<img width="1917" height="938" alt="image" src="https://github.com/user-attachments/assets/a65453c3-8053-4c49-9214-3079bb69e601" />


### Estado final de la compra
<img width="1902" height="944" alt="image" src="https://github.com/user-attachments/assets/464c0bc2-6e45-4173-985d-c247532599f1" />

<img width="1903" height="943" alt="image" src="https://github.com/user-attachments/assets/2864246c-32c3-4c91-9919-a3352334bb05" />


## Cómo correr la app

### Requisitos

- Node.js 22 o compatible con el proyecto
- pnpm 10

### Instalación

```bash
pnpm install
```

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto.

| Variable | Obligatoria | Descripción |
|---|---|---|
| `VITE_API_BASE_URL` | No | URL base del backend. Si no existe, algunas lecturas usan fallback/mock local y otras peticiones usan `http://localhost:3001` |
| `VITE_PAYMENT_TOKENIZATION_URL` | No | Endpoint de tokenización de la pasarela. Por defecto usa el sandbox de Wompi |
| `VITE_PAYMENT_PUBLIC_KEY` | Sí, para pagar | Llave pública usada para tokenizar la tarjeta |

Ejemplo:

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_PAYMENT_TOKENIZATION_URL=https://api-sandbox.co.uat.wompi.dev/v1/tokens/cards
VITE_PAYMENT_PUBLIC_KEY=pub_test_xxxxxxxxxxxxx
```

### Comandos principales

```bash
# Levantar entorno local
pnpm dev

# Compilar producción
pnpm build

# Previsualizar build local
pnpm preview

# Linter
pnpm lint
```

### Testing

```bash
# Ejecutar tests
pnpm test

# Modo watch
pnpm test:watch

# Coverage
pnpm test:coverage
```

## Coverage

Última ejecución verificada localmente con `pnpm exec jest --coverage --runInBand`.

### Resumen global

| Métrica | Resultado | Threshold |
|---|---:|---:|
| Statements | 90.71% | 80% |
| Branches | 82.33% | 80% |
| Functions | 89.79% | 80% |
| Lines | 92.07% | 80% |

### Resumen por área

| Área | % Stmts | % Branch | % Funcs | % Lines |
|---|---:|---:|---:|---:|
| `components/checkout` | 93.10% | 95.08% | 95.23% | 92.59% |
| `components/product` | 100.00% | 100.00% | 100.00% | 100.00% |
| `components/ui` | 96.15% | 84.21% | 92.59% | 96.11% |
| `contexts` | 100.00% | 91.66% | 100.00% | 100.00% |
| `lib` | 100.00% | 75.00% | 100.00% | 100.00% |
| `pages/ProductDetailPage` | 70.68% | 55.71% | 66.66% | 77.55% |
| `pages/ProductPage` | 78.33% | 74.57% | 75.00% | 76.78% |
| `schemas` | 100.00% | 100.00% | 100.00% | 100.00% |
| `services` | 100.00% | 100.00% | 100.00% | 100.00% |
| `store` | 100.00% | 95.00% | 100.00% | 100.00% |
| `store/slices` | 95.00% | 80.00% | 100.00% | 97.29% |
| `utils` | 94.11% | 94.11% | 100.00% | 98.07% |

<img width="917" height="874" alt="image" src="https://github.com/user-attachments/assets/a99e48e6-c202-4bda-b88d-c6706b3e1689" />

## GitHub Actions

El proyecto tiene un workflow en [`.github/workflows/deploy-s3.yml`](/home/jdvalencir/coffee-shop-ecommerce-frontend/.github/workflows/deploy-s3.yml) para build y despliegue automático del frontend.

### Cuándo se ejecuta

- En cada `push` a la rama `main`
- Manualmente con `workflow_dispatch`

### Qué hace el pipeline

1. Hace checkout del repositorio.
2. Instala `pnpm` v10.
3. Configura Node.js 22.
4. Ejecuta `pnpm install --frozen-lockfile`.
5. Corre la suite de tests con `pnpm exec jest --runInBand`.
6. Construye la app con `pnpm build`.
7. Configura credenciales AWS.
8. Sincroniza `dist/` al bucket S3 con `aws s3 sync --delete`.
9. Re-sube `index.html` con `Cache-Control: no-cache` para evitar servir HTML stale.
10. Invalida CloudFront si existe `CLOUDFRONT_DISTRIBUTION_ID`.

### Variables y secretos necesarios

| Tipo | Nombre | Uso |
|---|---|---|
| Secret | `AWS_ACCESS_KEY_ID` | Credencial AWS para desplegar |
| Secret | `AWS_SECRET_ACCESS_KEY` | Credencial AWS para desplegar |
| Variable | `AWS_REGION` | Región del bucket |
| Variable | `S3_BUCKET` | Nombre del bucket destino |
| Variable | `VITE_API_BASE_URL` | URL base del backend en build de producción |
| Variable | `VITE_PAYMENT_TOKENIZATION_URL` | URL de tokenización en build de producción |
| Variable | `VITE_PAYMENT_PUBLIC_KEY` | Llave pública de la pasarela en build de producción |
| Variable | `CLOUDFRONT_DISTRIBUTION_ID` | Opcional. Si existe, invalida cache |

### Resultado esperado

Cada deploy publica los archivos estáticos del frontend en S3 y deja `index.html` sin cache agresivo para que nuevas versiones se reflejen más rápido.

## Estructura base del proyecto

```text
src/
├── components/
│   ├── checkout/          # Flujo de checkout, resumen y estado final
│   ├── product/           # Card de producto
│   └── ui/                # Primitivos de interfaz reutilizables
├── contexts/              # Theme provider
├── hooks/                 # Lógica de pago y consulta de estado
├── pages/
│   ├── ProductPage/       # Catálogo principal
│   └── ProductDetailPage/ # Vista detalle
├── schemas/               # Validación de formularios
├── services/              # API y acceso a datos
├── store/                 # Redux store y slices
└── utils/                 # Formateadores, validaciones y persistencia
```
