# E-Commerce Gateway - Composite API

API Compuesta (API Aggregator) que unifica 3 servicios en un solo contrato JSON:
catálogo de productos, inventario y tipo de cambio USD/MXN (Frankfurter API).

## Requisitos
- Node.js 18 o superior
- Git

## Instalación
```bash
git clone https://github.com/Chrissanchess/ecommerce-gateway.git
cd ecommerce-gateway
npm install
```

## Ejecución
```bash
npm run start:all
```

| Servicio | Puerto | Endpoint |
|---|---|---|
| Catálogo | 3001 | GET /microservices/products/{id} |
| Inventario | 3002 | GET /microservices/inventory/{productId} |
| Composite API | 3000 | GET /api/v1/product-summary/{id} |

Productos de prueba: P-101, P-102 (stock bajo), P-103 (sin stock).

## Ejemplo
`GET http://localhost:3000/api/v1/product-summary/P-101`

```json
{
  "product_id": "P-101",
  "title": "Laptop Gamer XYZ",
  "price_usd": 1200,
  "price_mxn": 22497,
  "stock_status": "IN_STOCK",
  "available_units": 15,
  "warehouse_location": "Almacén Chihuahua - Pasillo B3",
  "estimated_delivery_days": 2,
  "currency_conversion_source": "Frankfurter External API",
  "status": "SUCCESS"
}
```

## Tolerancia a fallos
- Catálogo caído: 502 con `status: ERROR`. Producto inexistente: 404 con `status: ERROR`.
- Inventario o divisas caídos: 200 con `status: PARTIAL` y arreglo `warnings`.
- Cada petición tiene timeout de 3 segundos.

## Flujo de ramas (Gitflow)
`main` (producción) · `develop` (integración) · `feature/*` · `release/*`