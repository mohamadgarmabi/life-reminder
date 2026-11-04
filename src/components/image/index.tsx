import { LazyLoadImage } from 'react-lazy-load-image-component'
import type { ImageProps } from './image.type'
import { cn } from '#/modules/shell/utils/cn'

// Fills its box by default; the caller's className (e.g. object-cover, size-20) wins.
const Image = ({ className, ...rest }: ImageProps) => {
  return (
    <div className="relative size-full overflow-hidden">
      <LazyLoadImage
        effect="blur"
        // The library wraps the img in an inline span; make it fill the box too.
        wrapperProps={{ style: { transitionDelay: '1s', display: 'block', width: '100%', height: '100%' } }}
        {...rest}
        className={cn('size-full', className)}
      />
    </div>
  )
}

export default Image
