import type { ComponentType } from 'react'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  to?: string
}

import { template as compactoTemplate } from './compacto'
import { template as compraTemplate } from './compra'

export const TEMPLATES: Record<string, TemplateEntry> = {
  compacto: compactoTemplate,
  compra: compraTemplate,
}
