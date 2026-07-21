export type FeedbackStatus = 'open' | 'in-progress' | 'done'

export type FeedbackCategory =
  | 'copy'
  | 'image'
  | 'layout'
  | 'remove'
  | 'add'
  | 'other'

export interface FeedbackNote {
  id: string
  /** Page the note was left on, e.g. "/models/professional-35" */
  path: string
  /** CSS selector path used to re-anchor the pin on later visits */
  selector: string
  /** Trimmed text of the target element — fallback when the selector goes stale */
  elementText: string
  /** Pin position within the target element, as a percentage of its box */
  xPercent: number
  yPercent: number
  comment: string
  category: FeedbackCategory
  status: FeedbackStatus
  /** Name the reviewer gave themselves, so JTH can tell who asked for what */
  author: string
  viewportWidth: number
  createdAt: string
  updatedAt: string
}

export type CreateFeedbackInput = Pick<
  FeedbackNote,
  | 'path'
  | 'selector'
  | 'elementText'
  | 'xPercent'
  | 'yPercent'
  | 'comment'
  | 'category'
  | 'author'
  | 'viewportWidth'
>

export type UpdateFeedbackInput = Partial<Pick<FeedbackNote, 'status' | 'comment'>>

export const FEEDBACK_CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: 'copy', label: 'Change the wording' },
  { value: 'image', label: 'Change the image' },
  { value: 'layout', label: 'Move or resize' },
  { value: 'remove', label: 'Remove this' },
  { value: 'add', label: 'Add something here' },
  { value: 'other', label: 'Something else' },
]
