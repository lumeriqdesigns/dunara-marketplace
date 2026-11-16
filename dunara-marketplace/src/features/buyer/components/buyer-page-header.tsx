type Props = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function BuyerPageHeader({ title, description, actions }: Props) {
  return (
    <header className="buy-page-header">
      <div>
        <p className="buy-eyebrow">Buyer workspace</p>
        <h1>{title}</h1>
        {description && <p className="buy-desc">{description}</p>}
      </div>
      {actions && <div className="buy-page-actions">{actions}</div>}
    </header>
  );
}
