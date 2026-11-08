const repositoryList = document.querySelector("#starred");
const loadStatus = document.querySelector("#load-status");
const numberFormatter = new Intl.NumberFormat("en");

function isRepository(repository) {
  return (
    repository !== null &&
    typeof repository === "object" &&
    typeof repository.name === "string" &&
    typeof repository.owner === "string" &&
    typeof repository.description === "string" &&
    typeof repository.language === "string" &&
    Number.isFinite(repository.stars) &&
    typeof repository.url === "string" &&
    Array.isArray(repository.topics)
  );
}

function makeRepositoryCard(repository) {
  const item = document.createElement("li");
  item.className = "repository-card";

  const link = document.createElement("a");
  link.className = "repository-link";
  link.href = repository.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = repository.name;

  const owner = document.createElement("span");
  owner.className = "repository-owner";
  owner.textContent = ` / ${repository.owner}`;
  link.append(owner);

  const description = document.createElement("p");
  description.className = "repository-description";
  description.textContent = repository.description;

  const meta = document.createElement("div");
  meta.className = "repository-meta";

  const language = document.createElement("span");
  language.className = "repo-language";
  language.textContent = repository.language;
  meta.append(language);

  const stars = document.createElement("span");
  stars.textContent = `★ ${numberFormatter.format(repository.stars)}`;
  meta.append(stars);

  for (const topic of repository.topics) {
    if (typeof topic !== "string") {
      continue;
    }

    const topicLabel = document.createElement("span");
    topicLabel.className = "repo-topic";
    topicLabel.textContent = topic;
    meta.append(topicLabel);
  }

  item.append(link, description, meta);
  return item;
}

async function loadRepositories() {
  const requestStartedAt = performance.now();

  try {
    const response = await fetch("./events.json");
    if (!response.ok) {
      throw new Error(`Repository data request failed with status ${response.status}`);
    }

    const repositories = await response.json();
    if (!Array.isArray(repositories) || !repositories.every(isRepository)) {
      throw new Error("Repository data has an invalid format");
    }

    const fragment = document.createDocumentFragment();
    for (const repository of repositories) {
      fragment.append(makeRepositoryCard(repository));
    }

    repositoryList.replaceChildren(fragment);
    const totalStars = repositories.reduce((total, repository) => total + repository.stars, 0);
    loadStatus.textContent =
      repositories.length === 0
        ? "No starred repositories yet."
        : `Loaded ${numberFormatter.format(repositories.length)} starred repositories.`;
    console.info("Starred repositories loaded.", {
      repositoryCount: repositories.length,
      totalStars,
      loadTimeMs: Math.round(performance.now() - requestStartedAt)
    });
  } catch (error) {
    console.error("Could not load starred repositories.", {
      error,
      loadTimeMs: Math.round(performance.now() - requestStartedAt)
    });
    repositoryList.replaceChildren();

    const errorState = document.createElement("li");
    errorState.className = "empty-state";
    errorState.textContent = "Repository data could not be loaded. Please try again later.";
    repositoryList.append(errorState);
    loadStatus.textContent = "Could not load starred repositories.";
  }
}

loadRepositories();
