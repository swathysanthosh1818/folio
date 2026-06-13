import requests
import json
import os
from datetime import datetime

# ─── CONFIG ──────────────────────────────────────────────────────────────────

GITHUB_USERNAME = os.environ["GITHUB_USERNAME"]
GITHUB_TOKEN    = os.environ["GITHUB_TOKEN"]

# Repos to skip (add any you don't want on portfolio)
SKIP_REPOS = [
    f"{GITHUB_USERNAME}.github.io",
    "portfolio",
    "config",
]

# ─── FETCH REPOS ─────────────────────────────────────────────────────────────

def fetch_repos():
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

    repos = []
    page = 1

    while True:
        url = f"https://api.github.com/user/repos?per_page=100&page={page}&sort=updated"
        res = requests.get(url, headers=headers)

        if res.status_code != 200:
            print(f"❌ GitHub API error: {res.status_code} — {res.text}")
            break

        data = res.json()
        if not data:
            break

        repos.extend(data)
        page += 1

    print(f"✅ Fetched {len(repos)} total repos from GitHub")
    return repos


# ─── PROCESS REPOS ───────────────────────────────────────────────────────────

def process_repos(repos):
    projects = []

    for repo in repos:
        name = repo.get("name", "")

        # Skip forks and excluded repos
        if repo.get("fork"):
            continue
        if name.lower() in [r.lower() for r in SKIP_REPOS]:
            continue

        # Format date nicely
        raw_date = repo.get("updated_at", "")
        try:
            dt = datetime.strptime(raw_date, "%Y-%m-%dT%H:%M:%SZ")
            formatted_date = dt.strftime("%b %Y")  # e.g. "Jan 2025"
        except:
            formatted_date = ""

        # Get language — fallback to "Code"
        language = repo.get("language") or "Code"

        # Build project object
        project = {
            "name":        repo.get("name", ""),
            "description": repo.get("description") or "No description provided.",
            "language":    language,
            "stars":       repo.get("stargazers_count", 0),
            "forks":       repo.get("forks_count", 0),
            "url":         repo.get("html_url", ""),
            "homepage":    repo.get("homepage") or "",
            "updated":     formatted_date,
            "topics":      repo.get("topics", []),
            "visibility":  repo.get("visibility", "public"),
        }

        projects.append(project)

    # Sort by most recently updated
    projects.sort(key=lambda x: x["updated"], reverse=True)

    print(f"✅ Processed {len(projects)} projects (skipped forks & excluded repos)")
    return projects


# ─── SAVE JSON ───────────────────────────────────────────────────────────────

def save_json(projects):
    output = {
        "generated_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "total":        len(projects),
        "projects":     projects
    }

    with open("projects.json", "w") as f:
        json.dump(output, f, indent=2)

    print(f"✅ projects.json saved with {len(projects)} projects")


# ─── MAIN ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print(f"🔍 Fetching repos for @{GITHUB_USERNAME}...")
    repos    = fetch_repos()
    projects = process_repos(repos)
    save_json(projects)
