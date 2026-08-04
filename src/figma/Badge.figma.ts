// url=https://www.figma.com/design/yfxASgccpiepeijz9AjGQf/Soph.ia
// source=src/components/ui/badge.tsx
// component=Badge
import figma from 'figma'

const instance = figma.selectedInstance

// Extract label text
const label = instance.getString('Label') || 'Badge'

// Extract status color
const status = instance.getEnum('Status', {
  'Default': 'default',
  'Success': 'success',
  'Pending': 'pending',
  'Error': 'error',
  'Info': 'info',
})

// Extract variant (default or outline)
const variant = instance.getEnum('Variant', {
  'Default': 'default',
  'Outline': 'outline',
})

// Map status to color class
let colorClass = 'bg-gray-500/90'
if (status === 'success') colorClass = 'bg-green-500/90'
else if (status === 'pending') colorClass = 'bg-yellow-500/90'
else if (status === 'error') colorClass = 'bg-red-500/90'
else if (status === 'info') colorClass = 'bg-blue-500/90'

export default {
  example: figma.code`
    <Badge ${variant === 'outline' ? 'variant="outline"' : `className="${colorClass}"`}>
      ${label}
    </Badge>
  `,
  imports: ['import { Badge } from "@/components/ui/badge"'],
  id: 'badge',
  metadata: {
    nestable: false,
    props: {
      status,
      variant,
      label,
    }
  }
}
