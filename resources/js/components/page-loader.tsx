export default function PageLoader() {
    return (
        <div className="flex h-full min-h-64 w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <img
                    src="/logo.jpeg"
                    alt="Loading"
                    className="h-16 w-16 animate-spin object-contain"
                />
                <p className="text-sm text-muted-foreground">Loading…</p>
            </div>
        </div>
    );
}
