import Image from "next/image"

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md flex flex-col items-center">
        <Image src="/logo.png" alt="My Dream Board" width={140} height={140} priority />
        <h1 className="mt-6 text-3xl font-bold text-primary text-center">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground text-center">{subtitle}</p>
        <div className="mt-8 w-full">{children}</div>
      </div>
    </div>
  )
}
