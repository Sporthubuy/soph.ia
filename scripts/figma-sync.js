const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FILE_ID = process.env.FIGMA_FILE_ID;

if (!FIGMA_TOKEN || !FILE_ID) {
  console.error('❌ Error: Falta FIGMA_TOKEN o FIGMA_FILE_ID en .env.local');
  process.exit(1);
}

const figmaApi = axios.create({
  baseURL: 'https://api.figma.com/v1',
  headers: { 'X-Figma-Token': FIGMA_TOKEN }
});

async function syncComponents() {
  try {
    console.log('📡 Conectando a Figma...');

    const response = await figmaApi.get(`/files/${FILE_ID}`);

    console.log(`✅ Conectado al file: ${response.data.name}`);
    console.log(`📦 Componentes encontrados: ${Object.keys(response.data.components || {}).length}`);

    Object.entries(response.data.components || {}).forEach(([id, comp]) => {
      console.log(`  ✓ ${comp.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

syncComponents();
