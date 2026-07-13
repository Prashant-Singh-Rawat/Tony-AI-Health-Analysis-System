export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1 w-full">
      {label && (
        <label className="text-xs font-semibold text-text-muted select-none">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 bg-bg-surface border border-border-subtle hover:border-brand-primary/50 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl text-sm text-text-main placeholder-text-muted transition-colors outline-none
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
