import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { addOns, categories, categoriesInGroup, fullName, menuGroups, products, productsInCategory } from '../data/menu';
import { MenuItem } from '../components/menu/MenuItem';
import { ProductDialog } from '../components/menu/ProductDialog';
import { ImageSlot } from '../components/common/ImageSlot';
import { DietMark, EmptyState, Price } from '../components/common/bits';
import { Button } from '../components/common/Button';
import { useCart } from '../state/CartContext';
import { useAddToOrder } from '../hooks/useAddToOrder';
import { useDocumentTitle, usePrefersReducedMotion } from '../hooks';
import { site } from '../config/site';
import type { Product } from '../types/menu';

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export default function MenuPage() {
  useDocumentTitle('Menu');
  const { lines } = useCart();
  const { add, choosing, confirm, close } = useAddToOrder();
  const reduced = usePrefersReducedMotion();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const [active, setActive] = useState(categories[0].id);
  const chipsRef = useRef<HTMLDivElement>(null);

  const q = normalise(deferred);
  const matches = useMemo(() => {
    if (!q) return null;
    const words = q.split(' ');
    return new Set(
      products
        .filter((p) => {
          const hay = normalise(`${fullName(p)} ${p.subgroup ?? ''} ${p.categoryId}`);
          return words.every((w) => hay.includes(w));
        })
        .map((p) => p.id),
    );
  }, [q]);

  const visible = (p: Product) => !matches || matches.has(p.id);
  const inOrder = (id: string) => lines.filter((l) => l.productId === id).reduce((n, l) => n + l.quantity, 0);

  // Scroll-spy: highlight the category currently being read.
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-category]'));
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive((hit.target as HTMLElement).dataset.category!);
      },
      { rootMargin: '-35% 0px -55% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [matches]);

  // Keep the active chip in view in the horizontal (mobile) category bar.
  useEffect(() => {
    const bar = chipsRef.current;
    const chip = bar?.querySelector<HTMLElement>(`[data-chip="${active}"]`);
    if (!bar || !chip || bar.scrollWidth <= bar.clientWidth) return;
    bar.scrollTo({ left: chip.offsetLeft - bar.clientWidth / 2 + chip.offsetWidth / 2, behavior: reduced ? 'auto' : 'smooth' });
  }, [active, reduced]);

  // Deep links such as /menu#momo.
  useEffect(() => {
    const id = location.hash.slice(1);
    if (!id) return;
    // Wait for layout (fonts, lazy page) before jumping, then jump without animation.
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior }), 60);
    return () => window.clearTimeout(t);
  }, [location.hash]);

  const jump = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
    el.querySelector<HTMLElement>('h3')?.focus({ preventScroll: true });
    setActive(id);
  };

  const resultCount = matches?.size ?? products.length;

  return (
    <div className="menu-page surface-ivory">
      <header className="menu-hero textured surface-parchment">
        <div className="container menu-hero__inner">
          <h1 className="menu-hero__title">Menu</h1>
          <p className="menu-hero__lead">
            Drinks, food and mocktails, with prices in rupees. Choose what you like and send it as an order for delivery.
          </p>
          <div className="menu-search" role="search">
            <Search size={18} strokeWidth={1.6} aria-hidden="true" />
            <label htmlFor="menu-search" className="visually-hidden">
              Search the menu
            </label>
            <input
              id="menu-search"
              type="search"
              placeholder="Search: momo, mojito, chicken…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              enterKeyHint="search"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
          </div>
          <p className="menu-hero__legend">
            <span>
              <DietMark diet="veg" /> Vegetarian
            </span>
            <span>
              <DietMark diet="nonveg" /> Non-vegetarian
            </span>
            <span className="menu-hero__legend-note">Marked only where the menu states it.</span>
          </p>
          <p className="visually-hidden" aria-live="polite">
            {matches ? `${resultCount} item${resultCount === 1 ? '' : 's'} found` : ''}
          </p>
        </div>
      </header>

      <div className="menu-chips" ref={chipsRef} aria-label="Menu sections">
        {categories.map((c) => {
          const has = productsInCategory(c.id).some(visible);
          if (!has) return null;
          return (
            <a key={c.id} href={`#${c.id}`} data-chip={c.id} className={`chip ${active === c.id ? 'is-active' : ''}`} onClick={jump(c.id)} aria-current={active === c.id ? 'true' : undefined}>
              {c.name}
            </a>
          );
        })}
      </div>

      <div className="container menu-layout">
        <nav className="menu-index" aria-label="Menu contents">
          {menuGroups.map((g) => (
            <div key={g.id} className="menu-index__group">
              <p className="menu-index__group-name">{g.name}</p>
              <ol role="list">
                {categoriesInGroup(g.id).map((c) => {
                  const has = productsInCategory(c.id).some(visible);
                  return (
                    <li key={c.id}>
                      <a href={`#${c.id}`} onClick={jump(c.id)} className={`${active === c.id ? 'is-active' : ''} ${has ? '' : 'is-empty'}`} aria-current={active === c.id ? 'true' : undefined}>
                        <span className="oldstyle">{c.number}</span> {c.name}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </nav>

        <div className="menu-content">
          {matches && matches.size === 0 && (
            <EmptyState title={`Nothing on the menu matches “${query.trim()}”`} action={<Button variant="secondary" onClick={() => setQuery('')}>Clear search</Button>}>
              <p>Try a shorter word, such as “momo”, “pizza” or “tea”.</p>
            </EmptyState>
          )}
          {menuGroups.map((g) => {
            const cats = categoriesInGroup(g.id).filter((c) => productsInCategory(c.id).some(visible));
            if (cats.length === 0) return null;
            return (
              <section key={g.id} className="menu-group" aria-labelledby={`group-${g.id}`}>
                <h2 id={`group-${g.id}`} className="menu-group__title">
                  {g.name}
                </h2>
                {cats.map((c) => {
                  const items = productsInCategory(c.id).filter(visible);
                  const subgroups = [...new Set(items.map((p) => p.subgroup).filter(Boolean))] as string[];
                  const catAddOns = addOns.filter((a) => a.categoryId === c.id);
                  return (
                    <div key={c.id} id={c.id} data-category={c.id} className="menu-category">
                      <div className="menu-category__media">
                        <ImageSlot id={c.imageId} sizes="(min-width: 64rem) 22rem, 100vw" />
                        {site.menuImagesAreIllustrative && <p className="menu-category__note">Illustrative image</p>}
                      </div>
                      <div className="menu-category__body">
                        <h3 id={`cat-${c.id}`} className="menu-category__title" tabIndex={-1}>
                          <span className="menu-category__num oldstyle" aria-hidden="true">
                            {c.number}
                          </span>
                          {c.name}
                        </h3>
                        {subgroups.length > 0 ? (
                          subgroups.map((sg) => (
                            <div key={sg} className="menu-subgroup">
                              <h4 className="menu-subgroup__title">{sg}</h4>
                              <ul role="list" className="menu-list">
                                {items.filter((p) => p.subgroup === sg).map((p) => (
                                  <MenuItem key={p.id} product={p} inOrder={inOrder(p.id)} onAdd={add} query={deferred.trim()} />
                                ))}
                              </ul>
                            </div>
                          ))
                        ) : (
                          <ul role="list" className="menu-list">
                            {items.map((p) => (
                              <MenuItem key={p.id} product={p} inOrder={inOrder(p.id)} onAdd={add} query={deferred.trim()} />
                            ))}
                          </ul>
                        )}
                        {c.id === 'momo' && <p className="menu-category__aside">Preparations: Steam / Fried / Pan Fried. Kurkure Momo is served fried.</p>}
                        {catAddOns.length > 0 && (
                          <p className="menu-addon">
                            {catAddOns.map((a) => (
                              <span key={a.id}>
                                {a.name} <Price amount={a.price} />
                              </span>
                            ))}
                            <span className="menu-addon__hint">Choose it when you add a {c.name.toLowerCase()}.</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>
      </div>

      <ProductDialog product={choosing} onClose={close} onConfirm={confirm} />
    </div>
  );
}
