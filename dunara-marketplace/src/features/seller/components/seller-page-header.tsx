type Props = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function SellerPageHeader({ title, description, actions }: Props) {
  return (
    <header className="sel-page-header">
      <div>
        <p className="sel-eyebrow">Seller workspace</p>
        <h1>{title}</h1>
        {description && <p className="sel-desc">{description}</p>}
      </div>
      {actions && <div className="sel-page-actions">{actions}</div>}
    </header>
  );
}
