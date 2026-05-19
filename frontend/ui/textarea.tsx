import { TextareaHTMLAttributes } from "react";
import clsx from "clsx";

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        "min-h-[140px] w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition",
        "placeholder:text-slate-500 focus:border-glow/50 focus:bg-white/[0.08]",
        props.className
      )}
    />
  );
}
