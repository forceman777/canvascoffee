import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, ShoppingBag } from 'lucide-react';
import { Wordmark } from '../common/Wordmark';
import { Dialog } from '../common/Dialog';
import { useCart } from '../../state/CartContext';
import { navItems } from './navItems';
import { site } from '../../config/site';

/** Pages whose first screen is dark get light header text. */
const darkTopRoutes = ['/reservations', '/gallery', '/contact'];

export function Header() {
  const { pathname } = useLocation();
  const { totals } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dark = darkTopRoutes.includes(pathname);

  useEffect(() => {
    // A sentinel at the top of the page avoids a continuous scroll handler.
    const sentinel = document.getElementById('top-sentinel');
    if (!sentinel || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting));
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const count = totals.itemCount;
  const orderLabel = count > 0 ? `Order, ${count} item${count === 1 ? '' : 's'}` : 'Order now';

  return (
    <header className={`site-header ${dark ? 'site-header--dark on-dark' : 'site-header--light'} ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="site-header__inner container">
        <Link to="/" className="site-header__brand" aria-label={`${site.name}, home`}>
          <Wordmark size="sm" />
        </Link>

        <nav className="site-nav" aria-label="Main">
          <ul role="list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === '/'} className="site-nav__link">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <Link to="/order" className="order-pill" aria-label={orderLabel}>
            <ShoppingBag size={18} strokeWidth={1.6} aria-hidden="true" />
            <span className="order-pill__text">Order now</span>
            {count > 0 && (
              <span className="order-pill__count tabular" aria-hidden="true">
                {count}
              </span>
            )}
          </Link>
          <button type="button" className="menu-toggle" onClick={() => setMenuOpen(true)} aria-haspopup="dialog" aria-expanded={menuOpen}>
            <MenuIcon size={22} strokeWidth={1.6} aria-hidden="true" />
            <span className="visually-hidden">Open navigation</span>
          </button>
        </div>
      </div>

      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} title="Navigation" hideTitle variant="sheet" className="mobile-nav on-dark">
        <nav aria-label="Main (mobile)">
          <Wordmark size="md" className="mobile-nav__brand" />
          <ul role="list" className="mobile-nav__list">
            {navItems.map((item, i) => (
              <li key={item.to} style={{ animationDelay: `${60 + i * 40}ms` }}>
                <NavLink to={item.to} end={item.to === '/'} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link to="/order" className="btn btn--brass btn--block" onClick={() => setMenuOpen(false)}>
            <span className="btn__label">{count > 0 ? `View order (${count})` : 'Order now'}</span>
          </Link>
          <p className="mobile-nav__meta">{site.locality}</p>
        </nav>
      </Dialog>
    </header>
  );
}
