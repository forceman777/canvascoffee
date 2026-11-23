import { useState, type ReactNode } from 'react';
import { ImageOff } from 'lucide-react';
import { images, imageFiles, publicPath, type ImageId, type ManifestEntry } from '../../data/images';
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
}

export function sourceSet(entry: ManifestEntry, file: string, ext: string) {
  const dir = file.replace(/[^/]+$/, '');
  const base = file.split('/').pop();
  return entry.widths.map((w) => `${publicPath(`${dir}${base}-${w}.${ext}`)} ${w}w`).join(', ');
}

/**
 * Renders a supplied image (responsive WebP + fallback) or, if it has not been supplied,
 * a clearly identified placeholder of the same aspect ratio. Layout never shifts when the
 * real file arrives.
 */
export function ImageSlot({ id, sizes = '100vw', priority, fit = 'cover', position, className = '', ratio, placeholderArt, bare }: Props) {
  const spec = images[id];
  const entry = imageFiles(id);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [rw, rh] = ratio ?? spec.ratio;
  const style = bare ? undefined : { aspectRatio: `${rw} / ${rh}` };

  if (entry && !failed) {
    return (
      <div className={`image-slot ${bare ? 'image-slot--bare' : ''} ${loaded ? 'is-loaded' : ''} ${className}`} style={style}>
        <picture>
          <source type="image/webp" srcSet={sourceSet(entry, spec.file, 'webp')} sizes={sizes} />
          <img
            src={publicPath(entry.fallback)}
            width={entry.width}
            height={entry.height}
            alt={spec.decorative ? '' : spec.alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            // React 18 warns on the camelCase prop; the lowercase attribute is passed through.
            {...(priority ? { fetchpriority: 'high' } : {})}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            style={{ objectFit: fit, objectPosition: position }}
          />
        </picture>
      </div>
    );
  }

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
