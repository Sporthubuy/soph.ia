import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('debe renderizar con texto', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('debe renderizar con variant prop', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('debe renderizar con size prop', () => {
      render(<Button size="lg">Large Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('States', () => {
    it('debe estar deshabilitado cuando disabled=true', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('debe tener pointer-events-none cuando está deshabilitado', () => {
      const { container } = render(<Button disabled>Disabled</Button>)
      const button = container.querySelector('button')
      expect(button).toHaveClass('disabled:pointer-events-none')
    })
  })

  describe('Interactions', () => {
    it('debe disparar onClick cuando se clickea', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button onClick={handleClick}>Click</Button>)
      const button = screen.getByRole('button')
      
      await user.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('no debe disparar onClick cuando está deshabilitado', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button disabled onClick={handleClick}>Disabled</Button>)
      const button = screen.getByRole('button')
      
      await user.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('debe ser accesible por keyboard', async () => {
      const user = userEvent.setup()
      render(<Button>Focus me</Button>)
      const button = screen.getByRole('button')
      
      await user.tab()
      expect(button).toHaveFocus()
    })

    it('debe tener aria-label cuando es necesario', () => {
      render(<Button aria-label="Close dialog">×</Button>)
      const button = screen.getByLabelText('Close dialog')
      expect(button).toBeInTheDocument()
    })
  })
})
