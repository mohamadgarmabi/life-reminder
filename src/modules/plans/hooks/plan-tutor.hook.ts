import type { ChangeEvent, FormEvent } from 'react'
import { useId, useState } from 'react'
import { askAiText } from '#/modules/shell/apis/ai.api'
import type { ChatMessage } from '#/modules/shell/apis/ai.api'
import { cn } from '#/modules/shell/utils/cn'
import { t } from '#/modules/shell/utils/i18n'
import type { Plan } from '#/modules/plans/types'

/** The worker accepts 40; older turns are dropped so long lessons keep working. */
const HISTORY_LIMIT = 20

const STARTERS = ['plans.tutorStarterBegin', 'plans.tutorStarterPlan', 'plans.tutorStarterExercise'] as const

const usePlanTutor = (plan: Plan) => {
  const inputId = useId()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const topic = plan.description ? `${plan.title}\n${plan.description}` : plan.title

  const send = async (text: string) => {
    if (!text || isSending) return
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setDraft('')
    setError(null)
    setIsSending(true)
    try {
      const reply = await askAiText({ mode: 'tutor', topic, messages: next.slice(-HISTORY_LIMIT) })
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
    } catch (e) {
      setError(e instanceof Error ? e.message : t('plans.tutorNoReply'))
    } finally {
      setIsSending(false)
    }
  }

  return {
    inputId,
    draft,
    error,
    isSending,
    isEmpty: messages.length === 0,
    canSend: !!draft.trim() && !isSending,
    intro: t('plans.tutorIntro', { title: plan.title }),
    messages: messages.map((m, i) => ({
      key: i,
      text: m.content,
      className: cn(
        'max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap',
        m.role === 'user' ? 'self-start bg-primary text-primary-foreground' : 'self-end bg-muted',
      ),
    })),
    starters: STARTERS.map((key) => {
      const label = t(key)
      return { label, onSelect: () => void send(label) }
    }),
    handleDraftChange: (e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value),
    handleSubmit: (e: FormEvent) => {
      e.preventDefault()
      void send(draft.trim())
    },
  }
}

export { usePlanTutor }
