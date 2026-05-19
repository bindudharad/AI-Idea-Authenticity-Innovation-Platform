type AvatarProps = {
  name: string;
};

export function Avatar({ name }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-glow/90 to-coral/90 text-sm font-bold text-ink">
      {initials}
    </div>
  );
}
