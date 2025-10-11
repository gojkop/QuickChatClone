/* Admin Console: override PostCSS config to avoid Tailwind requirement.
   This ensures Vercel does not try to load the root Tailwind plugin when building the admin subproject. */
module.exports = {
  tailwindcss: {},
  plugins: []
};
