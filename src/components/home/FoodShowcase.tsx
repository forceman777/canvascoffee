import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PlateArt, type Dish } from '../art/Plates';
import { BasilLeaf, Chilli, Corn, Garlic, MintLeaf, Peppercorns, StarAnise, TomatoSlice } from '../art/Ingredients';
import { Picture } from '../common/ImageSlot';
import { DietMark, Ornament, Price } from '../common/bits';
import { ProductDialog } from '../menu/ProductDialog';
import { fromPrice, fullName, getCategory, needsChoices, productsInCategory } from '../../data/menu';
import { hasImage, imageFiles, type ImageId } from '../../data/images';
import { useAddToOrder } from '../../hooks/useAddToOrder';
import { usePrefersReducedMotion, useReveal } from '../../hooks';
import { site } from '../../config/site';

interface Entry {
  key: string;
  categoryId: string;
  imageId: ImageId;
  /** Drawn stand-in, used only when too few photos have been supplied. */
  dish?: Dish;
  line: string;
}

const allEntries: Entry[] = [
  { key: 'momo', categoryId: 'momo', imageId: 'PLATE-01', dish: 'momo', line: 'Steamed, fried or pan fried.' },
  { key: 'pizza', categoryId: 'pizza', imageId: 'PLATE-02', dish: 'pizza', line: 'From a pocket pizza to a chicken farmhouse.' },
  { key: 'burger', categoryId: 'burger', imageId: 'PLATE-03', dish: 'burger', line: 'Single or double patty, with a cheese slice if you like.' },
  { key: 'bread', categoryId: 'bread-chaat', imageId: 'PLATE-07', line: 'Cheese garlic bread and corn masala chaat.' },
  { key: 'fried', categoryId: 'fried-special', imageId: 'PLATE-04', dish: 'fried', line: 'Nuggets, strips, wings and a Kolkata style vetki fry.' },
  { key: 'fries', categoryId: 'french-fries', imageId: 'PLATE-05', dish: 'fries', line: 'Salted, peri-peri, or loaded with chicken.' },
  { key: 'desserts', categoryId: 'desserts', imageId: 'PLATE-06', dish: 'desserts', line: 'Cake, brownie and muffins to finish.' },
];

/** Real photos when at least three are supplied, so the section never mixes styles. */
const withPhotos = allEntries.filter((e) => hasImage(e.imageId));
const usePhotos = withPhotos.length >= 3;
const entries = usePhotos ? withPhotos : allEntries.filter((e) => e.dish);

const floating = [
  { C: Chilli, cls: 'fi-1' },
  { C: BasilLeaf, cls: 'fi-2' },
  { C: TomatoSlice, cls: 'fi-3' },
  { C: Peppercorns, cls: 'fi-4' },
  { C: Garlic, cls: 'fi-5' },
  { C: Corn, cls: 'fi-6' },
  { C: StarAnise, cls: 'fi-7' },
  { C: MintLeaf, cls: 'fi-8' },
  { C: Chilli, cls: 'fi-9' },
  { C: BasilLeaf, cls: 'fi-10' },
];

function Dishes({ entry, uid, large }: { entry: Entry; uid: string; large?: boolean }) {
  if (usePhotos) {
    return <Picture image={imageFiles(entry.imageId)!} sizes={large ? '(min-width: 52rem) 40rem, 92vw' : '9rem'} alt={large ? imageFiles(entry.imageId)!.alt : ''} priority={false} />;
  }
  return <PlateArt dish={entry.dish!} uid={uid} className={large ? 'kitchen__plate-art' : undefined} />;
}

/** "From our kitchen": real dishes from the menu, with prices and add buttons. */
export function FoodShowcase() {
  const reduced = usePrefersReducedMotion();
  const [selected, setSelected] = useState(0);
  const [spin, setSpin] = useState(0);
  const { add, choosing, confirm, close } = useAddToOrder();
  const rowRef = useReveal<HTMLDivElement>({ threshold: 0.2 });
  const stageRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const entry = entries[selected];
  const category = getCategory(entry.categoryId)!;
  const items = productsInCategory(entry.categoryId);
  const shown = items.slice(0, 5);

  const select = (i: number) => {
    if (i === selected) return;
    setSelected(i);
    setSpin((n) => n + 1);
  };

  // Subtle 3D tilt toward the pointer (mouse only).
  const onTilt = (e: React.PointerEvent) => {
    if (reduced || e.pointerType !== 'mouse' || frame.current) return;
    const el = stageRef.current;
    if (!el) return;
    const { clientX, clientY } = e;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--tx', (((clientY - r.top) / r.height - 0.5) * -7).toFixed(2) + 'deg');
      el.style.setProperty('--ty', (((clientX - r.left) / r.width - 0.5) * 9).toFixed(2) + 'deg');
    });
  };
  const resetTilt = () => {
    stageRef.current?.style.setProperty('--tx', '0deg');
    stageRef.current?.style.setProperty('--ty', '0deg');
  };

  return (
    <section className={`kitchen textured surface-parchment ${usePhotos ? 'kitchen--photos' : ''}`} aria-labelledby="kitchen-title">
      {!usePhotos && (
        <div className="kitchen__float" aria-hidden="true">
          {floating.map(({ C, cls }, i) => (
            <C key={i} className={`kitchen__ing ${cls}`} />
          ))}
        </div>
      )}

      <div className="container kitchen__inner">
        <header className="kitchen__header">
          <Ornament />
          <h2 id="kitchen-title" className="section-title">
            From our kitchen
          </h2>
          <p className="section-lead">Momos, pizzas, burgers and more. Pick a dish.</p>
        </header>

        <div className="kitchen__feature">
          <div className="kitchen__stage" ref={stageRef} onPointerMove={onTilt} onPointerLeave={resetTilt}>
            <div className={usePhotos ? 'kitchen__tray' : 'kitchen__plate'} key={spin}>
              <Dishes entry={entry} uid={`feature-${entry.key}`} large />
            </div>
          </div>
          <div className="kitchen__panel" id="kitchen-panel" role="tabpanel" aria-labelledby={`kitchen-tab-${selected}`} key={`panel-${spin}`}>
            <p className="kitchen__count">
              {items.length} on the menu, from <Price amount={Math.min(...items.map(fromPrice))} />
            </p>
            <h3 className="kitchen__name">{category.name}</h3>
            <p className="kitchen__line">{entry.line}</p>
            <ul role="list" className="kitchen__items">
              {shown.map((p) => (
                <li key={p.id}>
                  <DietMark diet={p.diet} />
                  <span className="kitchen__item-name">{fullName(p)}</span>
                  <span className="kitchen__leader" aria-hidden="true" />
                  {p.variants && p.variants.length > 1 && <span className="kitchen__from">from</span>}
                  <Price amount={fromPrice(p)} />
                  <button type="button" className="kitchen__add" onClick={() => add(p)} aria-label={`${needsChoices(p) ? 'Choose options for' : 'Add'} ${fullName(p)}`}>
                    <Plus size={15} strokeWidth={2} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <Link to={`/menu#${entry.categoryId}`} className="btn btn--quiet">
              <span className="btn__label">{items.length > shown.length ? `See all ${items.length} ${category.name.toLowerCase()}` : `${category.name} on the menu`}</span>
            </Link>
          </div>
        </div>

        <div className="kitchen__row reveal-row" ref={rowRef} role="tablist" aria-label="Choose a dish">
          {entries.map((p, i) => (
            <button
              key={p.key}
              type="button"
              role="tab"
              id={`kitchen-tab-${i}`}
              aria-selected={i === selected}
              aria-controls="kitchen-panel"
              tabIndex={i === selected ? 0 : -1}
              className={`kitchen__thumb ${i === selected ? 'is-selected' : ''}`}
              style={{ '--i': i } as React.CSSProperties}
              onClick={() => select(i)}
              onKeyDown={(e) => {
                if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                e.preventDefault();
                const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + entries.length) % entries.length;
                select(n);
                document.getElementById(`kitchen-tab-${n}`)?.focus();
              }}
            >
              <span className="kitchen__thumb-plate">
                <Dishes entry={p} uid={`thumb-${p.key}`} />
              </span>
              <span className="kitchen__thumb-name">{getCategory(p.categoryId)!.name}</span>
            </button>
          ))}
        </div>
        {usePhotos && site.menuImagesAreIllustrative && <p className="kitchen__note">Photos are illustrative. Sides and dips shown may not be included.</p>}
      </div>
      <ProductDialog product={choosing} onClose={close} onConfirm={confirm} />
    </section>
  );
}
