const hero = document.getElementById("landing-hero");
const stage = document.querySelector<HTMLElement>(".landing-hero-stage");

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function updateLandingProgress(): void {
  if (!hero || !stage) return;
  const rect = hero.getBoundingClientRect();
  const isPinned = rect.top <= 0 && rect.bottom > window.innerHeight;
  const isComplete = rect.bottom <= window.innerHeight;
  const maxScroll = Math.max(1, rect.height - window.innerHeight);
  const progress = clamp(-rect.top / maxScroll, 0, 1);
  const merge = clamp(progress / 0.38, 0, 1);
  const water = clamp((progress - 0.28) / 0.34, 0, 1);
  const growth = clamp((progress - 0.62) / 0.28, 0, 1);
  const final = clamp((progress - 0.42) / 0.3, 0, 1);

  hero.classList.toggle("is-pinned", isPinned);
  hero.classList.toggle("is-complete", isComplete);
  stage.style.setProperty("--landing-progress", progress.toFixed(4));
  stage.style.setProperty("--merge-progress", merge.toFixed(4));
  stage.style.setProperty("--water-progress", water.toFixed(4));
  stage.style.setProperty("--growth-progress", growth.toFixed(4));
  stage.style.setProperty("--final-progress", final.toFixed(4));
  stage.dataset.phase = growth > 0.55 ? "growth" : water > 0.3 ? "water" : merge > 0.7 ? "merge" : "intro";
}

updateLandingProgress();
window.addEventListener("scroll", updateLandingProgress, { passive: true });
window.addEventListener("resize", updateLandingProgress);
