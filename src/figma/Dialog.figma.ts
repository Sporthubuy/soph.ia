// url=https://www.figma.com/design/yfxASgccpiepeijz9AjGQf/Soph.ia
// source=src/components/ui/dialog.tsx
// component=Dialog
import figma from 'figma'

const instance = figma.selectedInstance

// Extract dialog title
const title = instance.getString('Title') || 'Dialog'

// Extract dialog type (alert, confirmation, etc)
const dialogType = instance.getEnum('Type', {
  'Alert': 'alert',
  'Confirmation': 'confirmation',
  'Action': 'action',
  'Info': 'info',
})

// Extract content slot
const content = instance.getSlot('Content')

// Extract button actions slot
const actions = instance.getSlot('Actions')

export default {
  example: figma.code`
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>${title}</DialogTitle>
        </DialogHeader>
        <div>
          ${content}
        </div>
        ${actions ? figma.code`<DialogFooter>${actions}</DialogFooter>` : ''}
      </DialogContent>
    </Dialog>
  `,
  imports: [
    'import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"'
  ],
  id: 'dialog',
  metadata: {
    nestable: true,
    props: {
      type: dialogType,
      title,
    }
  }
}
