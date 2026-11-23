import { Link, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Header } from '../navigation/Header';
import { Footer } from './Footer';
import { useCart } from '../../state/CartContext';
import { formatINR } from '../../utils/pricing';
import { hasImage, imageFiles, publicPath } from '../../data/images';

/** Exposes the parchment texture (TEX-01) to CSS once it is supplied. */
const texture = hasImage('TEX-01') ? `url("${publicPath(imageFiles('TEX-01')!.fallback)}")` : undefined;

function CartBar() {
  const { totals } = useCart();
  const { pathname } = useLocation();
  if (totals.itemCount === 0 || pathname === '/order') return null;
  return (
    <div className="cart-bar">
      <Link to="/order" className="cart-bar__link">
        <ShoppingBag size={18} strokeWidth={1.6} aria-hidden="true" />
        <span>
          {totals.itemCount} item{totals.itemCount === 1 ? '' : 's'}
        </span>
        <span className="cart-bar__total tabular">{formatINR(totals.subtotal)}</span>
        <span className="cart-bar__cta">View order</span>
      </Link>
    </div>
  );
}

export function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="site" style={texture ? ({ '--paper-texture': texture } as React.CSSProperties) : undefined}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div id="top-sentinel" aria-hidden="true" />
      <Header />
      <main id="main" key={pathname} className="page-enter" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <CartBar />
      <ScrollRestoration />
    </div>
  );
}
