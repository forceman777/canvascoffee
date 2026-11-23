import { ButtonLink } from '../components/common/Button';
import { EmptyState } from '../components/common/bits';
import { useDocumentTitle } from '../hooks';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="surface-ivory not-found">
      <div className="container">
        <h1 className="visually-hidden">Page not found</h1>
        <EmptyState title="This page is not on the menu" action={<ButtonLink to="/">Go to the home page</ButtonLink>}>
          <p>The link may be old or mistyped.</p>
        </EmptyState>
      </div>
    </div>
  );
}
