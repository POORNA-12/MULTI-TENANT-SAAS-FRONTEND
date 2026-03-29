export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen bg-portal-bg flex items-center justify-center px-4 py-8">
            {/* Subtle background decoration */}
<div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-96 h-96 bg-portal-primary/5 rounded-full blur-3xl" />
    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-portal-primary/5 rounded-full blur-3xl" />
</div>

            {/* Content */}
            <div className="relative z-10 w-full">{children}</div>
        </div>
    );
}
