/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor Sheet Partials
    "systems/dav20/templates/actors/parts/actor-abilities.html",
    "systems/dav20/templates/actors/parts/actor-disciplines.html",
    "systems/dav20/templates/actors/parts/actor-combat.html",
    "systems/dav20/templates/actors/parts/actor-background.html",

  ]);
};
