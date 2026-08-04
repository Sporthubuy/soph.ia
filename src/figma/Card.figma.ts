// url=https://www.figma.com/design/yfxASgccpiepeijz9AjGQf/Soph.ia
// source=src/components/ui/card.tsx
// component=Card
import figma from 'figma'

const instance = figma.selectedInstance

// Extract variant (elevated or outline)
const variant = instance.getEnum('Variant', {
  'Elevated': 'elevated',
  'Outline': 'outline',
})

// Extract title if present
const title = instance.getString('Title')

// Extract content slot
const content = instance.getSlot('Content')

export default {
  example: figma.code`
    <Card className="${variant === 'elevated' ? 'shadow-lg' : 'border'}">
      ${title ? figma.code`<CardHeader><CardTitle>${title}</CardTitle></CardHeader>` : ''}
      <CardContent>
        ${content}
      </CardContent>
    </Card>
  `,
  imports: [
    'import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"'
  ],
  id: 'card',
  metadata: {
    nestable: true,
    props: {
      variant,
      title,
    }
  }
}
