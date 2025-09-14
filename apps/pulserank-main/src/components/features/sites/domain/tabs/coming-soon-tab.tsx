interface ComingSoonTabProps {
  title: string;
  description?: string;
}

export function ComingSoonTab({ title, description }: ComingSoonTabProps) {
  return (
    <div className="text-center text-muted-foreground py-8">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-sm">{description}</p>}
    </div>
  );
}
