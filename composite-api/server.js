const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const CATALOG_URL = process.env.CATALOG_URL || 'http://localhost:3001';
const INVENTORY_URL = process.env.INVENTORY_URL || 'http://localhost:3002';
const FX_URL = 'https://api.frankfurter.app/latest?from=USD&to=MXN';
const TIMEOUT_MS = 3000;

// Cliente HTTP con timeout y manejo de status no-2xx
async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) {
    const err = new Error(`HTTP ${response.status} en ${url}`);
    err.status = response.status;
    throw err;
  }
  return response.json();
}

const round2 = (n) => Math.round(n * 100) / 100;

function stockStatus(units) {
  if (units === 0) return 'OUT_OF_STOCK';
  if (units <= 5) return 'LOW_STOCK';
  return 'IN_STOCK';
}

async function getProductSummary(req, res) {
  const { id } = req.params;

  // Consumo en PARALELO de los 3 servicios
  const [catalogR, inventoryR, fxR] = await Promise.allSettled([
    fetchJson(`${CATALOG_URL}/microservices/products/${id}`),
    fetchJson(`${INVENTORY_URL}/microservices/inventory/${id}`),
    fetchJson(FX_URL)
  ]);

  // Sin catálogo no hay producto: error total
  if (catalogR.status === 'rejected') {
    const notFound = catalogR.reason.status === 404;
    return res.status(notFound ? 404 : 502).json({
      product_id: id,
      status: 'ERROR',
      message: notFound
        ? `El producto ${id} no existe`
        : 'Servicio de catálogo no disponible'
    });
  }

  const product = catalogR.value;
  const warnings = [];

  // Inventario: degradación elegante
  let stock = {
    stock_status: 'UNKNOWN',
    available_units: null,
    warehouse_location: null,
    estimated_delivery_days: null
  };
  if (inventoryR.status === 'fulfilled') {
    const inv = inventoryR.value;
    stock = {
      stock_status: stockStatus(inv.available_units),
      available_units: inv.available_units,
      warehouse_location: inv.warehouse_location,
      estimated_delivery_days: inv.estimated_delivery_days
    };
  } else {
    warnings.push('Inventario no disponible');
  }

  // Divisas: degradación elegante
  let priceMxn = null;
  let fxSource = null;
  if (fxR.status === 'fulfilled' && fxR.value?.rates?.MXN) {
    priceMxn = round2(product.base_price_usd * fxR.value.rates.MXN);
    fxSource = 'Frankfurter External API';
  } else {
    warnings.push('Tipo de cambio no disponible');
  }

  const result = {
    product_id: product.id,
    title: product.name,
    price_usd: product.base_price_usd,
    price_mxn: priceMxn,
    ...stock,
    currency_conversion_source: fxSource,
    status: warnings.length === 0 ? 'SUCCESS' : 'PARTIAL'
  };
  if (warnings.length) result.warnings = warnings;

  res.json(result);
}

app.get('/api/v1/product-summary/:id', getProductSummary);
// Alias, porque el enunciado menciona las dos rutas
app.get('/api/v1/products/:id/summary', getProductSummary);

app.listen(PORT, () => console.log(`Composite API en http://localhost:${PORT}`));