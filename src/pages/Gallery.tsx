import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageSlot } from '../components/common/ImageSlot';
import { CafeReel } from '../components/common/CafeReel';
import { Dialog } from '../components/common/Dialog';
import { DevHint } from '../components/common/bits';
import { hasImage, imageFiles, images, publicPath, type ImageId } from '../data/images';
import { useDocumentTitle } from '../hooks';

/**
 * Real photographs of the café only (never generated images). The order sets the top row
 * (the reel, then the first two photos); each caption describes what is actually pictured.
 */
const curated: { id: ImageId; caption: string }[] = [
  { id: 'GAL-01', caption: 'The village mural' },
  { id: 'ATM-02', caption: 'A table under the flower paintings' },
  { id: 'READ-01', caption: 'Reading, with coffee' },
  { id: 'GAL-03', caption: 'A painted mask' },
  { id: 'ATM-06', caption: 'A wall of painted faces' },
  { id: 'GAL-04', caption: 'The green mask' },
  { id: 'GAL-02', caption: 'A lamp-lit corner' },
  { id: 'ATM-05', caption: 'Pendant lamps over the wooden wall' },
  { id: 'GAL-05', caption: '' },
  { id: 'GAL-06', caption: '' },
  { id: 'GAL-07', caption: '' },
  { id: 'GAL-08', caption: '' },
  { id: 'GAL-09', caption: '' },
];

type Tile = { kind: 'reel'; height: number } | { kind: 'photo'; id: ImageId; caption: string; index: number; height: number };

const CAPTION = 0.12; // caption height, as a fraction of the column width

function useColumnCount() {
  const read = () => (window.matchMedia('(min-width: 64rem)').matches ? 3 : window.matchMedia('(min-width: 40rem)').matches ? 2 : 1);
  const [count, setCount] = useState(read);
  useEffect(() => {
    const queries = ['(min-width: 64rem)', '(min-width: 40rem)'].map((q) => window.matchMedia(q));
    const onChange = () => setCount(read());
    queries.forEach((q) => q.addEventListener('change', onChange));
    return () => queries.forEach((q) => q.removeEventListener('change', onChange));
  }, []);
  return count;
}

/** Masonry: each tile goes into the currently shortest column, so the top row keeps the curated order. */
function distribute(tiles: Tile[], columns: number) {
  const cols: Tile[][] = Array.from({ length: columns }, () => []);
  const heights = new Array(columns).fill(0);
  for (const tile of tiles) {
    const shortest = heights.indexOf(Math.min(...heights));
    cols[shortest].push(tile);
    heights[shortest] += tile.height;
  }
  return cols;
}

export default function Gallery() {
  useDocumentTitle('Gallery');
  // Only photos supplied for their own slot are shown (no stand-ins or fallbacks here).
  const photos = curated.filter(({ id }) => hasImage(id) && imageFiles(id)!.key === images[id].file);
  const hasReel = hasImage('CAFE-VID');
  const columns = useColumnCount();
  const [open, setOpen] = useState<number | null>(null);

  const layout = useMemo(() => {
    const tiles: Tile[] = [];
    if (hasReel) tiles.push({ kind: 'reel', height: 16 / 9 + CAPTION });
    photos.forEach((p, index) => {
      const [w, h] = imageFiles(p.id)!.ratio;
      tiles.push({ kind: 'photo', id: p.id, caption: p.caption, index, height: h / w + (p.caption ? CAPTION : 0) });
    });
    return distribute(tiles, columns);
  }, [columns, hasReel, photos]);

  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, step]);

  const current = open !== null ? photos[open] : null;
  const file = current ? imageFiles(current.id) : null;
  const empty = photos.length === 0 && !hasReel;
  const sizes = columns === 3 ? '(min-width: 80rem) 24rem, 30vw' : columns === 2 ? '46vw' : '92vw';

  return (
    <div className="gallery-page surface-walnut grain on-dark">
      <header className="container gallery-hero">
        <h1 className="page-title">Gallery</h1>
        <p className="page-lead">Painted masks, a village mural, lantern light and walls full of art. A look around the café.</p>
        {empty && <p className="gallery-hero__pending">Photographs of the café will appear here.</p>}
      </header>

      <div className="container">
        <div className="masonry" style={{ '--columns': columns } as React.CSSProperties}>
          {layout.map((col, c) => (
            <div key={c} className="masonry__col">
              {col.map((tile) =>
                tile.kind === 'reel' ? (
                  <div key="reel" className="masonry__item masonry__item--reel">
                    <CafeReel caption="A walk around the café" sizes={sizes} />
                  </div>
                ) : (
                  <figure key={tile.id} className="masonry__item" style={{ '--i': tile.index } as React.CSSProperties}>
                    <button type="button" className="masonry__open" onClick={() => setOpen(tile.index)} aria-label={`Open photo: ${images[tile.id].alt}`}>
                      <ImageSlot id={tile.id} sizes={sizes} />
                    </button>
                    {tile.caption && <figcaption className="masonry__caption">{tile.caption}</figcaption>}
                  </figure>
                ),
              )}
            </div>
          ))}
        </div>
        <DevHint>
          Site owner: add more café photos as assets-src/images/gallery/gallery-05.jpg to gallery-09.jpg and they appear here automatically.
        </DevHint>
      </div>

      <Dialog open={open !== null} onClose={() => setOpen(null)} title={current?.caption || 'Photo'} className="lightbox on-dark">
        {current && file && (
          <figure className="lightbox__figure">
            <img src={publicPath(file.fallback)} alt={images[current.id].alt} width={file.width} height={file.height} />
            <figcaption>
              <span className="tabular">
                {open! + 1} / {photos.length}
              </span>
            </figcaption>
            {photos.length > 1 && (
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
