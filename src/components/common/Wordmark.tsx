import { imageFiles, publicPath } from '../../data/images';

const logo = imageFiles('BRAND-01');

/**
 * Brand mark. Uses the official logo (assets-src/images/brand/logo.svg or logo.png) when
 * supplied; otherwise a typographic wordmark whose "O" is a brass ring, the site's one motif.
 */
export function Wordmark({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  if (logo) {
    return <img src={publicPath(logo.fallback)} alt="Canvas O Coffee" className={`wordmark-logo wordmark-logo--${size} ${className}`} />;
  }
  return (
    <span className={`wordmark wordmark--${size} ${className}`}>
      <span className="wordmark__word">Canvas</span>
      <span className="wordmark__ring" aria-hidden="true" />
      <span className="visually-hidden"> O </span>
      <span className="wordmark__word">Coffee</span>
    </span>
  );
}
