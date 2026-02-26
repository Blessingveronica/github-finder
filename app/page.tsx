import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a14] px-6 font-sans">
      <main className="flex max-w-xl flex-col items-center text-center">
        <div className="mb-8 text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-300">
          GitHub API
        </div>
        <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
          GitHub{" "}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Profile Finder
          </span>
        </h1>
        <p className="mb-10 max-w-md text-base leading-relaxed text-zinc-400">
          Search any GitHub user and explore their repositories, stats, and activity.
        </p>
        <Link
          href="/Github-finder"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 font-bold text-white shadow-[0_0_30px_rgba(124,58,237,0.35)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(124,58,237,0.45)] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#0a0a14]"
        >
          Open Finder
          <span aria-hidden>→</span>
        </Link>
        <p className="mt-8 text-sm text-zinc-500">
          Built with Next.js · GitHub REST API
        </p>
      </main>
    </div>
  );
}
