import { NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();

  if (!username) {
    return NextResponse.json(
      { error: "Username is required." },
      { status: 400 }
    );
  }

  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "GitHub-Finder-App",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`${GITHUB_API}/users/${encodeURIComponent(username)}`, { headers }),
      fetch(
        `${GITHUB_API}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`,
        { headers }
      ),
    ]);

    if (!userRes.ok) {
      if (userRes.status === 404) {
        return NextResponse.json(
          { error: `User "${username}" not found.` },
          { status: 404 }
        );
      }
      const err = await userRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || "Failed to fetch user." },
        { status: userRes.status }
      );
    }

    const user = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];

    return NextResponse.json({ user, repos });
  } catch (err) {
    console.error("GitHub API error:", err);
    return NextResponse.json(
      { error: "Unable to reach GitHub. Try again later." },
      { status: 502 }
    );
  }
}
