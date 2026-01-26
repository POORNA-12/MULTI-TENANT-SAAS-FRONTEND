export default function TenantXLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* ICON */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect width="64" height="64" rx="14" fill="#F97316" />

        <line x1="32" y1="16" x2="16" y2="32" stroke="white" strokeWidth="4" />
        <line x1="32" y1="16" x2="48" y2="32" stroke="white" strokeWidth="4" />
        <line x1="32" y1="48" x2="16" y2="32" stroke="white" strokeWidth="4" />
        <line x1="32" y1="48" x2="48" y2="32" stroke="white" strokeWidth="4" />

        <circle cx="32" cy="16" r="4" fill="white" />
        <circle cx="16" cy="32" r="4" fill="white" />
        <circle cx="48" cy="32" r="4" fill="white" />
        <circle cx="32" cy="48" r="4" fill="white" />
        <circle cx="32" cy="32" r="4" fill="white" />
      </svg>

      {/* TEXT */}
      <span className="text-[22px] font-extrabold leading-none text-black">
        TenantX
      </span>
    </div>
  );
}
