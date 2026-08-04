// Shared breadcrumb trail used across Enterprise, Solutions, Services, and
// Developer pages so the Protocol -> Enterprise -> Solutions/Services
// hierarchy is visible on every page that sits below the top level, not
// just implied by the nav menu. Uses the same schema.org BreadcrumbList
// microdata convention already established in GovVsSovPage.tsx.

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items, className = '' }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={`max-w-7xl mx-auto px-6 pt-6 pb-0 ${className}`}>
      <ol className="flex flex-wrap items-center gap-2 text-xs text-white/35" itemScope itemType="https://schema.org/BreadcrumbList">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            <span itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              {item.href ? (
                <a href={item.href} className="hover:text-white/60 transition-colors" itemProp="item">
                  <span itemProp="name">{item.label}</span>
                </a>
              ) : (
                <span className="text-white/55" itemProp="name">{item.label}</span>
              )}
              <meta itemProp="position" content={String(index + 1)} />
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
