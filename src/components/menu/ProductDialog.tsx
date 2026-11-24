import { useEffect, useState } from 'react';
import { Dialog } from '../common/Dialog';
import { Button } from '../common/Button';
import { DietMark, Price, QuantityStepper } from '../common/bits';
import { addOnsForProduct, getCategory } from '../../data/menu';
import { itemPhoto } from '../../data/images';
import { Picture } from '../common/ImageSlot';
import { formatINR, unitPrice, type LineSelection } from '../../utils/pricing';
import { site } from '../../config/site';
import type { Product } from '../../types/menu';

interface Props {
  product: Product | null;
  /** Existing selection when editing a line in the order. */
  initial?: LineSelection;
  onClose: () => void;
  onConfirm: (selection: LineSelection) => void;
}

/** Product panel: preparation, add-ons and quantity, with a live total. */
export function ProductDialog({ product, initial, onClose, onConfirm }: Props) {
  const [variantId, setVariantId] = useState<string | undefined>();
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) return;
    setVariantId(initial?.variantId ?? product.variants?.[0]?.id);
    setAddOnIds(initial?.addOnIds ?? []);
    setQuantity(initial?.quantity ?? 1);
  }, [product, initial]);

  if (!product) return <Dialog open={false} onClose={onClose} title="">{null}</Dialog>;

  const category = getCategory(product.categoryId);
  const extras = addOnsForProduct(product);
  const selection = { productId: product.id, variantId: product.variants ? variantId : undefined, addOnIds };
  let unit = 0;
  try {
    unit = unitPrice(selection);
  } catch {
    unit = 0;
  }
  const photo = itemPhoto(product.id);
  const editing = Boolean(initial);

  return (
    <Dialog open={Boolean(product)} onClose={onClose} title={product.name} className="product-dialog">
      <form
        className="product-dialog__form"
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm({ ...selection, quantity });
        }}
      >
        {photo && (
          <figure className={`product-dialog__photo ${photo.cutout ? 'is-cutout' : ''}`}>
            <Picture image={photo} sizes="(min-width: 40rem) 32rem, 100vw" alt={photo.alt || product.name} priority />
            {site.menuImagesAreIllustrative && <figcaption>Illustrative image</figcaption>}
          </figure>
        )}
        <p className="product-dialog__meta">
          <DietMark diet={product.diet} />
          <span>{category?.name}</span>
          {product.subgroup && <span>{product.subgroup}</span>}
          {product.portion && <span>{product.portion}</span>}
        </p>

        {product.variants && product.variants.length > 1 && (
          <fieldset className="choice-group">
            <legend>Preparation</legend>
            {product.variants.map((v) => (
              <label key={v.id} className={`choice ${variantId === v.id ? 'is-selected' : ''}`}>
                <input type="radio" name="variant" value={v.id} checked={variantId === v.id} onChange={() => setVariantId(v.id)} />
                <span className="choice__label">{v.label}</span>
                <Price amount={v.price} className="choice__price" />
              </label>
            ))}
          </fieldset>
        )}
        {product.variants && product.variants.length === 1 && (
          <p className="product-dialog__single">
            Available {product.variants[0].label.toLowerCase()} only, <Price amount={product.variants[0].price} />.
          </p>
        )}
        {!product.variants && (
          <p className="product-dialog__single">
            <Price amount={product.price as number} /> each
          </p>
        )}

        {extras.length > 0 && (
          <fieldset className="choice-group">
            <legend>Add-ons</legend>
            {extras.map((a) => {
              const checked = addOnIds.includes(a.id);
              return (
                <label key={a.id} className={`choice choice--check ${checked ? 'is-selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setAddOnIds(checked ? addOnIds.filter((x) => x !== a.id) : [...addOnIds, a.id])}
                  />
                  <span className="choice__label">{a.name}</span>
                  <span className="choice__price tabular">+{formatINR(a.price)}</span>
                </label>
              );
            })}
          </fieldset>
        )}

        <div className="product-dialog__footer">
          <QuantityStepper value={quantity} onChange={(n) => setQuantity(Math.max(1, n))} max={site.ordering.maxQuantityPerLine} label={`Quantity of ${product.name}`} />
          <Button type="submit" variant="primary" disabled={unit === 0}>
            {editing ? 'Update order' : 'Add to order'} · <span className="tabular">{formatINR(unit * quantity)}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
