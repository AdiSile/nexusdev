"use client";

// ═══════════════════════════════════════════════════════════════
// COMPONENTA INPUT FIELD (REUTILIZABILĂ)
// ═══════════════════════════════════════════════════════════════

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
}

export default function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
  required,
  rows,
}: InputFieldProps) {
  const inputClasses =
    "w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-xs uppercase tracking-wider text-foreground-dim font-medium"
        style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
      >
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      {rows ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          className={inputClasses}
          style={{
            fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            resize: "vertical",
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
        />
      )}
    </label>
  );
}