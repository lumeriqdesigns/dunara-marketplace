type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function AdminPageHeader({
  eyebrow = "Admin",
  title,
  description,
  actions
}: Props) {
  return (
    <header className="adm-page-header">
      <div>
        <p className="adm-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="adm-desc">{description}</p>}
      </div>
      {actions && <div className="adm-page-actions">{actions}</div>}
    </header>
  );
}
