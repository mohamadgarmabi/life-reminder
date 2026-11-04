import { cn } from '#/modules/shell/utils/cn'
import { Slider as SliderPrimitive } from 'radix-ui'
import { sliderVariants, sliderTrackVariants, sliderRangeVariants, sliderThumbVariants } from './slider.styles'
import type { SliderProps } from './slider.types'

// Direction (RTL) comes from the app's DirectionProvider, which Radix reads itself.
const Slider = ({ className, label, ...props }: SliderProps) => {
  return (
    <SliderPrimitive.Root data-slot="slider" className={cn(sliderVariants(), className)} {...props}>
      <SliderPrimitive.Track data-slot="slider-track" className={sliderTrackVariants()}>
        <SliderPrimitive.Range data-slot="slider-range" className={sliderRangeVariants()} />
      </SliderPrimitive.Track>
      {(props.value ?? props.defaultValue ?? [0]).map((_, i) => (
        <SliderPrimitive.Thumb key={i} data-slot="slider-thumb" aria-label={label} className={sliderThumbVariants()} />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
