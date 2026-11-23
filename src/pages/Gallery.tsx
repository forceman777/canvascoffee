import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageSlot } from '../components/common/ImageSlot';
import { Dialog } from '../components/common/Dialog';
import { hasImage, imageFiles, images, publicPath, type ImageId } from '../data/images';
import { useDocumentTitle } from '../hooks';

const slots: ImageId[] = ['GAL-01', 'GAL-02', 'GAL-03', 'GAL-04', 'GAL-05', 'GAL-06', 'GAL-07', 'GAL-08', 'GAL-09'];

export default function Gallery() {
  useDocumentTitle('Gallery');
  const real = slots.filter(hasImage);
  const [open, setOpen] = useState<number | null>(null);

  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + real.length) % real.length)), [real.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, step]);

  const current = open !== null ? real[open] : null;
  const file = current ? imageFiles(current) : null;

  return (
    <div className="gallery-page surface-walnut grain on-dark">
      <header className="container gallery-hero">
        <h1 className="page-title">Gallery</h1>
        <p className="page-lead">Cups, plates and corners of the café, photographed as they are.</p>
        {real.length === 0 && (
          <p className="gallery-hero__pending">Photographs of the café will appear here. Each frame below shows where one goes.</p>
        )}
      </header>
      <div className="container">
        <ul role="list" className="gallery-grid">
          {slots.map((id) => {
            const index = real.indexOf(id);
            const ratio = images[id].ratio;
            const shape = ratio[0] > ratio[1] ? 'wide' : ratio[0] < ratio[1] ? 'tall' : 'square';
            return (
              <li key={id} className={`gallery-grid__item gallery-grid__item--${shape}`}>
                {index >= 0 ? (
                  <button type="button" className="gallery-grid__open" onClick={() => setOpen(index)} aria-label={`Open photo: ${images[id].alt}`}>
                    <ImageSlot id={id} sizes="(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw" />
                  </button>
                ) : (
                  <ImageSlot id={id} sizes="33vw" />
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <Dialog open={open !== null} onClose={() => setOpen(null)} title={current ? images[current].alt : 'Photo'} className="lightbox on-dark">
        {current && file && (
          <figure className="lightbox__figure">
            <img src={publicPath(file.fallback)} alt={images[current].alt} width={file.width} height={file.height} />
            <figcaption>
              <span className="tabular">
                {open! + 1} / {real.length}
              </span>
            </figcaption>
            {real.length > 1 && (
              <div className="lightbox__nav">
                <button type="button" onClick={() => step(-1)} aria-label="Previous photo">
                  <ChevronLeft size={22} />
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next photo">
                  <ChevronRight size={22} />
                </button>
              </div>
            )}
          </figure>
        )}
      </Dialog>
    </div>
  );
}
