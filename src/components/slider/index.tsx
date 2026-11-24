import { cn } from '#/modules/shell/utils/cn'
import { RangeSlider } from '#/components/liquid-glass/controls/RangeSlider'
import type { SliderProps } from './slider.types'

const Slider = ({ className, label, value, defaultValue, onValueChange, disabled, min, max, step, name }: SliderProps) => {
  const initial = value?.[0] ?? defaultValue?.[0] ?? min ?? 0

  return (
    <div data-slot="slider" className={cn(disabled && 'pointer-events-none opacity-50', className)}>
      <RangeSlider
        label={label}
        value={initial}
        onChange={(next) => onValueChange?.([next])}
        min={min}
        max={max}
        step={step}
        name={name}
        showValue={false}
      />
    </div>
  )
}

export { Slider }
