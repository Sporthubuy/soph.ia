// url=https://www.figma.com/design/yfxASgccpiepeijz9AjGQf/Soph.ia
// source=src/components/ui/input.tsx
// component=Input
import figma from 'figma'

const instance = figma.selectedInstance

// Extract placeholder text
const placeholder = instance.getString('Placeholder') || 'Enter text...'

// Extract input type
const inputType = instance.getEnum('Type', {
  'Text': 'text',
  'Email': 'email',
  'Password': 'password',
  'Number': 'number',
  'Tel': 'tel',
  'URL': 'url',
})

// Extract disabled state
const disabled = instance.getBoolean('Disabled')

// Extract error state
const hasError = instance.getBoolean('Error')

// Extract value
const value = instance.getString('Value')

export default {
  example: figma.code`
    <Input
      type="${inputType}"
      placeholder="${placeholder}"
      ${value ? `value="${value}"` : ''}
      ${disabled ? 'disabled' : ''}
      ${hasError ? 'aria-invalid="true"' : ''}
    />
  `,
  imports: ['import { Input } from "@/components/ui/input"'],
  id: 'input',
  metadata: {
    nestable: false,
    props: {
      type: inputType,
      placeholder,
      value,
      disabled,
      error: hasError,
    }
  }
}
