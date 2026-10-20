import type { CollectionConfig } from 'payload'

// Atomic counters are updated by the server through parameterized SQL, never through the public API.
export const AssistantLimits: CollectionConfig = {
  slug: 'assistant-limits', admin: { hidden: true }, timestamps: false,
  access: { read: () => false, create: () => false, update: () => false, delete: () => false },
  fields: [
    { name: 'bucket', type: 'text', required: true, unique: true },
    { name: 'hits', type: 'number', required: true },
    { name: 'expires', type: 'date', required: true, index: true },
  ],
}
