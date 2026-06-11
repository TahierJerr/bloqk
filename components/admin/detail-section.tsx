// Kaartje met kop voor de detailpagina's in het admin-paneel
export function DetailSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {title}
            </h2>
            <div className="mt-4">{children}</div>
        </section>
    );
}
