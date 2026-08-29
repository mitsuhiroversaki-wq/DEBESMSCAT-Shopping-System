const pages = document.querySelectorAll('.page');
const navButtons = document.querySelectorAll('[data-page]');
const categoryPills = document.querySelectorAll('.category-pill');
const searchInput = document.getElementById('searchInput');

function showPage(targetPage) {
  pages.forEach((page) => {
    const isActive = page.id === `page-${targetPage}`;
    page.classList.toggle('active', isActive);
  });

  navButtons.forEach((button) => {
    const pageName = button.dataset.page;
    const isActive = pageName === targetPage;
    button.classList.toggle('active', isActive);
  });
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.page;
    if (target) {
      showPage(target);
    }
  });
});

categoryPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    categoryPills.forEach((item) => item.classList.remove('active'));
    pill.classList.add('active');
  });
});

if (searchInput) {
  searchInput.addEventListener('input', (event) => {
    const value = event.target.value.trim();
    const browsePage = document.getElementById('page-browse');
    const shell = browsePage?.querySelector('.empty-shell');

    if (!shell) return;

    const heading = shell.querySelector('h3');
    const copy = shell.querySelector('p');

    if (!value) {
      heading.textContent = 'No listings published yet';
      copy.textContent = 'Once campus sellers upload their products, they will appear in this catalog automatically.';
      return;
    }

    heading.textContent = 'No matching listings found';
    copy.textContent = `No results for “${value}” yet. Sellers will publish matching items as soon as the catalog is active.`;
  });
}
