(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initRevealAnimations() {
    const revealElements = document.querySelectorAll(".reveal");

    revealElements.forEach((element) => {
      const delay = Number(element.dataset.delay || 0);
      element.style.setProperty("--reveal-delay", `${delay}ms`);
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    revealElements.forEach((element) => observer.observe(element));
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function initCountdown() {
    const countdown = document.querySelector(".hero__countdown");

    if (!countdown) {
      return;
    }

    const targetDate = countdown.dataset.targetDate;
    const targetTime = new Date(targetDate).getTime();

    if (Number.isNaN(targetTime)) {
      return;
    }

    const units = {
      days: countdown.querySelector("[data-unit='days']"),
      hours: countdown.querySelector("[data-unit='hours']"),
      minutes: countdown.querySelector("[data-unit='minutes']"),
      seconds: countdown.querySelector("[data-unit='seconds']"),
    };

    const updateCountdown = () => {
      const now = Date.now();
      const distance = Math.max(targetTime - now, 0);

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      units.days.textContent = pad(days);
      units.hours.textContent = pad(hours);
      units.minutes.textContent = pad(minutes);
      units.seconds.textContent = pad(seconds);
    };

    updateCountdown();
    window.setInterval(updateCountdown, 1000);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initRevealAnimations();
    initCountdown();
  });
})();
