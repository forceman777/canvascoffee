import { Link, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Header } from '../navigation/Header';
import { Footer } from './Footer';
import { useCart } from '../../state/CartContext';
import { formatINR } from '../../utils/pricing';
import { hasImage, imageFiles, publicPath } from '../../data/images';
import { site } from '../../config/site';

/** Exposes the parchment texture (TEX-01) to CSS once it is supplied. */
const texture = hasImage('TEX-01') ? `url("${publicPath(imageFiles('TEX-01')!.fallback)}")` : undefined;

/** Business details for search engines (Google, Maps), built only from confirmed facts. */
const businessData = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'CafeOrCoffeeShop',
  name: site.name,
  ...(site.contact.address ? { address: { '@type': 'PostalAddress', streetAddress: 'College Road, Deuli', addressLocality: 'Belda', addressRegion: 'West Bengal', postalCode: '721424', addressCountry: 'IN' } } : {}),
  ...(site.contact.geo ? { geo: { '@type': 'GeoCoordinates', latitude: site.contact.geo.lat, longitude: site.contact.geo.lng } } : {}),
  ...(site.contact.phone ? { telephone: site.contact.phone.replace(/\s/g, '') } : {}),
  ...(site.contact.mapUrl ? { hasMap: site.contact.mapUrl } : {}),
  servesCuisine: ['Coffee', 'Tea', 'Momo', 'Pizza', 'Burgers'],
});

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: businessData }} />
    </div>
  );
}
