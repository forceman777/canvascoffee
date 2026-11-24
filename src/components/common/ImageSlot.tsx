import { useState, type ReactNode } from 'react';
import { ImageOff } from 'lucide-react';
import { images, imageFiles, publicPath, type ImageId, type ResolvedImage } from '../../data/images';
import { site } from '../../config/site';

interface Props {
  id: ImageId;
  /** Responsive sizes hint, e.g. "(min-width: 64rem) 50vw, 100vw". */
  sizes?: string;
  /** Above-the-fold images load eagerly with high priority. */
  priority?: boolean;
  fit?: 'cover' | 'contain';
  /** CSS object-position for art-directed crops. */
  position?: string;
  className?: string;
  /** Override the ratio box (e.g. a 4:3 image shown in a 16:9 strip). */
  ratio?: [number, number];
  /** Rendered inside the placeholder (e.g. interim illustration). */
  placeholderArt?: ReactNode;
  /** No ratio box or frame: the image fills its parent. */
  bare?: boolean;
  /** Override the alt text (e.g. when the image is decorative in this context). */
  alt?: string;
}

/** srcset for the generated responsive files of an asset. */
export function sourceSet(entry: Pick<ResolvedImage, 'key' | 'widths'>, ext: string) {
  return entry.widths.map((w) => `${publicPath(`${entry.key}-${w}.${ext}`)} ${w}w`).join(', ');
}

/** A responsive <picture> for a resolved asset. */
export function Picture({
  image,
  sizes,
  alt,
  priority,
  fit,
  position,
  onLoad,
  onError,
  className,
}: {
  image: ResolvedImage;
  sizes: string;
  alt: string;
  priority?: boolean;
  fit?: 'cover' | 'contain';
  position?: string;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
}) {
  return (
    <picture className={className}>
      <source type="image/webp" srcSet={sourceSet(image, 'webp')} sizes={sizes} />
      <img
        src={publicPath(image.fallback)}
        width={image.width}
        height={image.height}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        // React 18 warns on the camelCase prop; the lowercase attribute is passed through.
        {...(priority ? { fetchpriority: 'high' } : {})}
        onLoad={onLoad}
        onError={onError}
        style={fit || position ? { objectFit: fit, objectPosition: position } : undefined}
      />
    </picture>
  );
}

/**
 * Renders a supplied image (responsive WebP + fallback) or, if it has not been supplied,
 * a clearly identified placeholder of the same aspect ratio. Layout never shifts when the
 * real file arrives. Transparent cut-outs are shown whole at their own proportions.
 */
export function ImageSlot({ id, sizes = '100vw', priority, fit, position, className = '', ratio, placeholderArt, bare, alt }: Props) {
  const spec = images[id];
  const image = imageFiles(id);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (image && !failed) {
    const [rw, rh] = ratio ?? (image.cutout ? [image.width, image.height] : image.ratio);
    const style = bare ? undefined : { aspectRatio: `${rw} / ${rh}` };
    const classes = ['image-slot', bare && 'image-slot--bare', image.cutout && 'image-slot--cutout', loaded && 'is-loaded', className].filter(Boolean).join(' ');
    return (
      <div className={classes} style={style}>
        <Picture
          image={image}
          sizes={sizes}
          alt={alt ?? (image.decorative ? '' : image.alt)}
          priority={priority}
          fit={fit ?? (image.cutout ? 'contain' : 'cover')}
          position={position}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  const [rw, rh] = ratio ?? spec.ratio;
  const style = bare ? undefined : { aspectRatio: `${rw} / ${rh}` };
  return (
    <div
      className={`image-slot image-slot--placeholder tone-${spec.tone} ${bare ? 'image-slot--bare' : ''} ${className}`}
      style={style}
      role={spec.decorative ? undefined : 'img'}
      aria-label={spec.decorative ? undefined : `${spec.alt} (image coming soon)`}
      aria-hidden={spec.decorative ? true : undefined}
    >
      {placeholderArt && <div className="image-slot__art">{placeholderArt}</div>}
      {site.previewMode && (
        <div className="image-slot__label" aria-hidden="true">
          <ImageOff size={14} strokeWidth={1.6} />
          <span>
            <strong>{id}</strong> {spec.label}
            <small>
              {spec.file}.{spec.ext} · {rw}:{rh}
            </small>
          </span>
        </div>
      )}
    </div>
  );
}
