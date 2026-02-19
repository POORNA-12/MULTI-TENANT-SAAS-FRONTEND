import AuthHeader from "../components/AuthHeader";
import AuthFooter from "../components/AuthFooter";
import AuthFeaturePanel from "../components/AuthFeaturePanel";

export default function AuthLayout({ children }) {
    return (
        <div className="bg-background-light text-[#0e141b] min-h-screen flex flex-col font-sans">
            <AuthHeader />
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-5 gap-0 shadow-sm rounded overflow-hidden aws-card bg-white border border-[#d0dbe7]">
                    <div className="md:col-span-3 p-8 md:p-12">
                        {children}
                    </div>
                    <AuthFeaturePanel />
                </div>
            </main>
            <AuthFooter />
        </div>
    );
}
