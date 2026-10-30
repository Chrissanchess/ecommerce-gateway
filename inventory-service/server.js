const express = require('express');
const app = express();
const PORT = process.env.PORT || 3002;

const inventory = {
  'P-101': { productId: 'P-101', available_units: 15, warehouse_location: 'Almacén Chihuahua - Pasillo B3', estimated_delivery_days: 2 },
  'P-102': { productId: 'P-102', available_units: 3,  warehouse_location: 'Almacén CDMX - Pasillo A1',      estimated_delivery_days: 4 },
  'P-103': { productId: 'P-103', available_units: 0,  warehouse_location: 'Almacén Monterrey - Pasillo C2', estimated_delivery_days: 7 }
};

app.get('/microservices/inventory/:productId', (req, res) => {
  const item = inventory[req.params.productId];
  if (!item) {
    return res.status(404).json({
      error: 'INVENTORY_NOT_FOUND',
      message: `Sin registro de inventario para ${req.params.productId}`
    });
  }
  res.json(item);
});

app.listen(PORT, () => console.log(`Inventory service en http://localhost:${PORT}`));