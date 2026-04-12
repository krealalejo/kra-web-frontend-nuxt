import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

export const blogPostSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug must be lowercase alphanumeric + hyphens (1–128 chars)')
    .max(128, 'Slug must be lowercase alphanumeric + hyphens (1–128 chars)')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric + hyphens (1–128 chars)'),
  title: z
    .string()
    .min(1, 'Title required (1–256 characters)')
    .max(256, 'Title required (1–256 characters)'),
  content: z
    .string()
    .max(200_000, 'Content required (max 200,000 characters)'),
})

export type CreateBlogPostFormData = z.infer<typeof blogPostSchema>

export interface UseBlogPostFormOptions {
  initialValues?: Partial<CreateBlogPostFormData>
}

export function useBlogPostForm(options: UseBlogPostFormOptions = {}) {
  const form = useForm<CreateBlogPostFormData>({
    validationSchema: toTypedSchema(blogPostSchema),
    initialValues: {
      slug: options.initialValues?.slug ?? '',
      title: options.initialValues?.title ?? '',
      content: options.initialValues?.content ?? '',
    },
  })

  const { value: slug, errorMessage: slugError } = useField<string>('slug')
  const { value: title, errorMessage: titleError } = useField<string>('title')
  const { value: content, errorMessage: contentError } = useField<string>('content')

  return {
    slug,
    title,
    content,
    slugError,
    titleError,
    contentError,
    isSubmitting: form.isSubmitting,
    handleSubmit: form.handleSubmit,
    resetForm: form.resetForm,
    setValues: form.setValues,
  }
}
