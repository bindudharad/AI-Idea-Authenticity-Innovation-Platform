import { InputHTMLAttributes } from "react";
import clsx from "clsx";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition",
        "placeholder:text-slate-500 focus:border-glow/50 focus:bg-white/[0.08]",
        props.className
      )}
    />
  );
}
