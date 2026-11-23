import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PlateArt, type Dish } from '../art/Plates';
import { BasilLeaf, Chilli, Corn, Garlic, MintLeaf, Peppercorns, StarAnise, TomatoSlice } from '../art/Ingredients';
import { ImageSlot } from '../common/ImageSlot';
import { DietMark, Ornament, Price } from '../common/bits';
import { ProductDialog } from '../menu/ProductDialog';
import { fromPrice, fullName, getCategory, needsChoices, productsInCategory } from '../../data/menu';
import { hasImage, type ImageId } from '../../data/images';
import { useAddToOrder } from '../../hooks/useAddToOrder';
import { useReveal } from '../../hooks';

const plates: { dish: Dish; categoryId: string; imageId: ImageId; line: string }[] = [
  { dish: 'momo', categoryId: 'momo', imageId: 'PLATE-01', line: 'Steamed, fried or pan fried.' },
  { dish: 'pizza', categoryId: 'pizza', imageId: 'PLATE-02', line: 'From a pocket pizza to a chicken farmhouse.' },
  { dish: 'burger', categoryId: 'burger', imageId: 'PLATE-03', line: 'Single or double patty, with a cheese slice if you like.' },
  { dish: 'fried', categoryId: 'fried-special', imageId: 'PLATE-04', line: 'Nuggets, strips, wings and a Kolkata style vetki fry.' },
  { dish: 'fries', categoryId: 'french-fries', imageId: 'PLATE-05', line: 'Salted, peri-peri, or loaded with chicken.' },
  { dish: 'desserts', categoryId: 'desserts', imageId: 'PLATE-06', line: 'Cake, brownie and muffins to finish.' },
];

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

function Plate({ entry, uid, className = '' }: { entry: (typeof plates)[number]; uid: string; className?: string }) {
  return hasImage(entry.imageId) ? (
    <div className={`plate-photo ${className}`}>
      <ImageSlot id={entry.imageId} bare fit="contain" sizes="(min-width: 52rem) 30rem, 80vw" />
    </div>
  ) : (
    <PlateArt dish={entry.dish} uid={uid} className={className} />
  );
}

/** "From our kitchen": floating ingredients and plates that spin in, with real menu items. */
export function FoodShowcase() {
  const [selected, setSelected] = useState(0);
  const [spin, setSpin] = useState(0);
  const { add, choosing, confirm, close } = useAddToOrder();
  const rowRef = useReveal<HTMLDivElement>({ threshold: 0.2 });
  const entry = plates[selected];
  const category = getCategory(entry.categoryId)!;
  const items = productsInCategory(entry.categoryId);
  const shown = items.slice(0, 5);

  const select = (i: number) => {
    if (i === selected) return;
    setSelected(i);
    setSpin((n) => n + 1);
  };

  return (
    <section className="kitchen textured surface-parchment" aria-labelledby="kitchen-title">
      <div className="kitchen__float" aria-hidden="true">
        {floating.map(({ C, cls }, i) => (
          <C key={i} className={`kitchen__ing ${cls}`} />
        ))}
      </div>

      <div className="container kitchen__inner">
        <header className="kitchen__header">
          <Ornament />
          <h2 id="kitchen-title" className="section-title">
            From our kitchen
          </h2>
          <p className="section-lead">Momos, pizzas, burgers and fried favourites. Pick a plate.</p>
        </header>

        <div className="kitchen__feature">
          <div className="kitchen__stage">
            <div className="kitchen__plate" key={spin}>
              <Plate entry={entry} uid={`feature-${entry.dish}`} className="kitchen__plate-art" />
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
          {plates.map((p, i) => (
            <button
              key={p.dish}
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
                const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + plates.length) % plates.length;
                select(n);
                document.getElementById(`kitchen-tab-${n}`)?.focus();
              }}
            >
              <span className="kitchen__thumb-plate">
                <Plate entry={p} uid={`thumb-${p.dish}`} />
              </span>
              <span className="kitchen__thumb-name">{getCategory(p.categoryId)!.name}</span>
            </button>
          ))}
        </div>
      </div>
      <ProductDialog product={choosing} onClose={close} onConfirm={confirm} />
    </section>
  );
}
