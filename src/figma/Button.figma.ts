// url=https://www.figma.com/design/yfxASgccpiepeijz9AjGQf/Soph.ia
// source=src/components/ui/button.tsx
// component=Button
import figma from 'figma'

const instance = figma.selectedInstance

// Extract text content (label)
const label = instance.getString('Label') || 'Button'

// Extract variant property
const variant = instance.getEnum('Variant', {
  'Default': 'default',
  'Outline': 'outline',
  'Secondary': 'secondary',
  'Ghost': 'ghost',
  'Destructive': 'destructive',
  'Link': 'link',
})

// Extract size property
const size = instance.getEnum('Size', {
  'XS': 'xs',
  'Small': 'sm',
  'Default': 'default',
  'Large': 'lg',
  'Icon': 'icon',
  'Icon XS': 'icon-xs',
  'Icon Small': 'icon-sm',
  'Icon Large': 'icon-lg',
})

// Extract disabled state
const disabled = instance.getBoolean('Disabled', { true: 'disabled', false: '' })

// Extract icon if present
const iconSlot = instance.getSlot('Icon')

export default {
  example: figma.code`
    <Button
      variant="${variant}"
      size="${size}"
      ${disabled ? 'disabled' : ''}
    >
      ${label}
    </Button>
  `,
  imports: ['import { Button } from "@/components/ui/button"'],
  id: 'button',
  metadata: {
    nestable: true,
    props: {
      variant,
      size,
      disabled: disabled === 'disabled',
      label,
    }
  }
}
