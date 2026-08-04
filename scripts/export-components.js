const fs = require('fs');
const path = require('path');

const componentMetadata = {
  button: {
    name: 'Button',
    description: 'Primary CTA button',
    variants: ['default', 'secondary', 'outline', 'ghost', 'destructive'],
    sizes: ['sm', 'md', 'lg']
  },
  input: {
    name: 'Input',
    description: 'Text input field',
    variants: ['default', 'error']
  },
  card: {
    name: 'Card',
    description: 'Content container',
    variants: ['elevated', 'outline']
  }
};

const output = {
  exportedAt: new Date().toISOString(),
  framework: 'Next.js + shadcn/ui',
  totalComponents: Object.keys(componentMetadata).length,
  components: componentMetadata
};

fs.writeFileSync(
  path.join(__dirname, '../figma-components.json'),
  JSON.stringify(output, null, 2)
);

console.log('✅ Componentes exportados a figma-components.json');
console.log(`📦 Total: ${output.totalComponents} componentes`);
