(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let loaderDismissed = false;

  function waitForImageElement(image) {
    if (image.complete) {
      if (image.naturalWidth > 0 && typeof image.decode === "function") {
        return image.decode().catch(function () {
          return undefined;
        });
      }

      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const done = () => {
        image.removeEventListener("load", done);
        image.removeEventListener("error", done);
        resolve();
      };

      image.addEventListener("load", done, { once: true });
      image.addEventListener("error", done, { once: true });
    });
  }

  function preloadSource(src) {
    if (!src) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const image = new Image();

      image.onload = resolve;
      image.onerror = resolve;
      image.src = src;
    });
  }

  function hidePageLoader() {
    if (loaderDismissed) {
      return;
    }

    loaderDismissed = true;

    const loader = document.querySelector(".page-loader");

    if (!loader) {
      document.body.classList.remove("is-loading");
      return;
    }

    loader.classList.add("is-hidden");
    window.setTimeout(() => {
      document.body.classList.remove("is-loading");
      loader.remove();
    }, 480);
  }

  function initPageLoader() {
    const criticalImages = Array.from(document.images).filter(
      (image) => image.dataset.preloadCritical === "true" || image.loading !== "lazy"
    );
    const imageTasks = criticalImages.map(waitForImageElement);
    const backgroundTasks = Array.from(
      document.querySelectorAll("[data-preload-bg][data-preload-critical]")
    ).map(
      (element) => preloadSource(element.dataset.preloadBg)
    );
    const allAssetsReady = Promise.allSettled(imageTasks.concat(backgroundTasks));
    const safetyTimeout = new Promise((resolve) => window.setTimeout(resolve, 4500));

    Promise.race([allAssetsReady, safetyTimeout]).then(hidePageLoader);
    window.addEventListener("load", hidePageLoader, { once: true });
  }

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
    initPageLoader();
  });
})();
