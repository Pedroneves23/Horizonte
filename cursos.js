const searchInput = document.querySelector("[data-course-search]");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const categories = [...document.querySelectorAll("[data-category]")];
const status = document.querySelector("[data-course-status]");
const emptyState = document.querySelector("[data-course-empty]");

let activeFilter = "all";

const setCategoryOpen = (category, shouldOpen) => {
  category.classList.toggle("is-open", shouldOpen);
  category.querySelector("header").setAttribute("aria-expanded", String(shouldOpen));
};

categories.forEach((category, index) => {
  const trigger = category.querySelector("header");
  const list = category.querySelector("ul");
  list.id = `cursos-area-${index + 1}`;
  trigger.setAttribute("role", "button");
  trigger.setAttribute("tabindex", "0");
  trigger.setAttribute("aria-controls", list.id);
  trigger.setAttribute("aria-expanded", "false");

  const toggle = () => setCategoryOpen(category, !category.classList.contains("is-open"));
  trigger.addEventListener("click", toggle);
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  });
});

const normalize = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const updateCatalog = () => {
  const query = normalize(searchInput.value);
  let visibleCourses = 0;
  let visibleCategories = 0;

  categories.forEach((category) => {
    const matchesCategory = activeFilter === "all" || category.dataset.category === activeFilter;
    let matchesInside = 0;

    category.querySelectorAll("li").forEach((course) => {
      const matchesSearch = !query || normalize(course.textContent).includes(query);
      const isVisible = matchesCategory && matchesSearch;
      course.hidden = !isVisible;
      if (isVisible) matchesInside += 1;
    });

    const showCategory = matchesInside > 0;
    category.hidden = !showCategory;
    if (query && showCategory) setCategoryOpen(category, true);
    if (showCategory) {
      visibleCategories += 1;
      visibleCourses += matchesInside;
    }
  });

  status.textContent = `${visibleCourses} ${visibleCourses === 1 ? "curso" : "cursos"} em ${visibleCategories} ${visibleCategories === 1 ? "área" : "áreas"}`;
  emptyState.hidden = visibleCourses !== 0;
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    updateCatalog();
  });
});

searchInput.addEventListener("input", updateCatalog);
updateCatalog();
