import { LazyLoadImage } from 'react-lazy-load-image-component'
import type { ImageProps } from './image.type'
import { cn } from '#/modules/shell/utils/cn'

const Image = (props: ImageProps) => {
  const { ...rest } = props
  return (
    <div className='relative size-full overflow-hidden [&_img]:h-full'>
      <LazyLoadImage
        alt={rest.alt}
        effect="blur"
        wrapperProps={{
          style: { transitionDelay: '1s',  height:"100%"},
        }}
        src={rest.src}
        {...rest}
        className={cn(rest.className, "inset-0 size-fit")}
      />
    </div>
  )
}

export default Image
