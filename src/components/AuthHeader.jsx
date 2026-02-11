import { Link } from "react-router-dom";

export default function AuthHeader() {
    return (
        <header className="flex h-14 items-center justify-between border-b border-solid border-[#d0dbe7] bg-white px-8 py-2">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="size-8 bg-orange-500 rounded flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[24px]">hub</span>
                </div>
                <h1 className="text-[#0e141b] text-lg font-bold leading-tight tracking-tight">
                    TenantX
                </h1>
            </Link>
            <div className="flex items-center gap-4 text-xs font-medium text-[#4e7397]">
                <a className="hover:text-black transition-colors" href="#">
                    English (US)
                </a>
                <a className="hover:text-black transition-colors" href="#">
                    Support
                </a>
            </div>
        </header>
    );
}
