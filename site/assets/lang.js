// English home page only: a first visit from a phone set to Arabic goes to the Arabic page.
// A language the visitor picked on the site always wins.
(function () {
  try {
    if (localStorage.getItem('site.lang')) return;
    var first = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    if (/^ar(-|$)/i.test(first)) location.replace('ar/' + location.search + location.hash);
  } catch (e) { /* storage blocked: stay on this page */ }
})();
