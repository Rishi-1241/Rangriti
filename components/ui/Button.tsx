import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.7rem]",
  md: "h-11 px-6",
  lg: "h-13 px-8",
  icon: "h-10 w-10 !p-0 !tracking-normal",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn("btn", `btn-${variant}`, sizes[size], "group", extra);
}

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <LoadingThread /> : null}
      <span className={cn("inline-flex items-center gap-2", loading && "opacity-70")}>{children}</span>
    </button>
  );
}

/** A thin travelling thread instead of a spinner. */
function LoadingThread() {
  return (
    <span aria-hidden className="absolute inset-x-5 bottom-2 h-px overflow-hidden rounded-full bg-current/20">
      <span className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-current/80 [animation:gleam_1.1s_var(--ease-draw)_infinite]" />
    </span>
  );
}
