const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

const products = {
  'P-101': {
    id: 'P-101',
    name: 'Laptop Gamer XYZ',
    description: 'Laptop gamer 16GB RAM, RTX 4060',
    category: 'Computadoras',
    base_price_usd: 1200.0
  },
  'P-102': {
    id: 'P-102',
    name: 'Mouse Inalámbrico Pro',
    description: 'Mouse ergonómico 4000 DPI',
    category: 'Accesorios',
    base_price_usd: 45.5
  },
  'P-103': {
    id: 'P-103',
    name: 'Monitor 27" 144Hz',
    description: 'Monitor IPS QHD',
    category: 'Monitores',
    base_price_usd: 320.0
  }
};

app.get('/microservices/products/:id', (req, res) => {
  const product = products[req.params.id];
  if (!product) {
    return res.status(404).json({
      error: 'PRODUCT_NOT_FOUND',
      message: `El producto ${req.params.id} no existe`
    });
  }
  res.json(product);
});

app.listen(PORT, () => console.log(`Catalog service en http://localhost:${PORT}`));