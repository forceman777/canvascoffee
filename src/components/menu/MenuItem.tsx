import { Plus } from 'lucide-react';
import { DietMark, Price } from '../common/bits';
import { fullName, needsChoices } from '../../data/menu';
import { itemPhoto } from '../../data/images';
import { Picture } from '../common/ImageSlot';
import type { Product } from '../../types/menu';

interface Props {
  product: Product;
  inOrder: number;
  onAdd: (p: Product) => void;
  /** Opens the product panel with its photo. */
  onView?: (p: Product) => void;
  /** Highlight matches when searching. */
  query?: string;
}

function highlight(text: string, query?: string) {
  if (!query) return text;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

/** One line of the printed-style menu: name, dotted leader, price, add button. */
export function MenuItem({ product, inOrder, onAdd, onView, query }: Props) {
  const photo = onView ? itemPhoto(product.id) : null;
  const multi = (product.variants?.length ?? 0) > 1;
  const choose = needsChoices(product);
  return (
    <li className="menu-item">
      <div className="menu-item__line">
        {photo && (
          <button type="button" className={`menu-item__thumb ${photo.cutout ? '' : 'is-photo'}`} onClick={() => onView!(product)} aria-label={`View photo of ${fullName(product)}`} aria-haspopup="dialog">
            <Picture image={photo} sizes="3rem" alt="" />
          </button>
        )}
        <DietMark diet={product.diet} />
        <span className="menu-item__name">
          {highlight(product.name, query)}
          {product.portion && <span className="menu-item__portion"> ({product.portion})</span>}
        </span>
        <span className="menu-item__leader" aria-hidden="true" />
        {multi ? (
          <span className="menu-item__price">
            <span className="menu-item__from">from</span> <Price amount={Math.min(...product.variants!.map((v) => v.price))} />
          </span>
        ) : (
          <Price amount={product.variants ? product.variants[0].price : (product.price as number)} className="menu-item__price" />
        )}
        <button
          type="button"
          className="menu-item__add"
          onClick={() => onAdd(product)}
          aria-label={`${choose ? 'Choose options for' : 'Add'} ${fullName(product)}`}
          aria-haspopup={choose ? 'dialog' : undefined}
        >
          <Plus size={16} strokeWidth={1.8} aria-hidden="true" />
          <span>{choose ? 'Choose' : 'Add'}</span>
        </button>
      </div>
      {(product.variants || inOrder > 0) && (
        <div className="menu-item__detail">
          {product.variants && (
            <span className="menu-item__variants">
              {product.variants.map((v, i) => (
                <span key={v.id}>
                  {i > 0 && <span aria-hidden="true"> / </span>}
                  {v.label} <span className="tabular">₹{v.price}</span>
                </span>
              ))}
            </span>
          )}
          {inOrder > 0 && <span className="menu-item__in-order">{inOrder} in your order</span>}
        </div>
      )}
    </li>
  );
}
