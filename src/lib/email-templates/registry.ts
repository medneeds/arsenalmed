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
import { templateD1, templateD3, templateD5, templateD7 } from './sequencia'

export const TEMPLATES: Record<string, TemplateEntry> = {
  compacto: compactoTemplate,
  compra: compraTemplate,
  'sequencia-d1': templateD1,
  'sequencia-d3': templateD3,
  'sequencia-d5': templateD5,
  'sequencia-d7': templateD7,
}
