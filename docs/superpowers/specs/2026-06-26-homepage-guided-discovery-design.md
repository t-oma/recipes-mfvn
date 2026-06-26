# Homepage Guided Discovery Design

## Context

The current homepage has strong visual sections, but its structure feels closer to a generic landing page than a recipe discovery experience. The redesign should make the page feel native to a recipe product: practical, decision-oriented, and useful within the first few seconds.

The selected direction is guided discovery with a light personal cookbook layer. The homepage should help visitors answer: "What should I cook today?" It should also give signed-in users a reason to return through saved or recently viewed recipes.

## Goals

- Make recipe discovery the primary job of the homepage.
- Help users narrow choices by cooking intent, time, difficulty, and meal context.
- Keep existing useful homepage content where it supports discovery.
- Add one engagement-focused personal block without making the homepage feel account-first.
- Reuse existing frontend patterns, Vue Query data fetching, and recipe/category card components where possible.

## Non-Goals

- Building a full recipe search results page.
- Building a recommendation engine.
- Adding new backend endpoints unless existing query support is insufficient during implementation.
- Redesigning the recipe details page, authentication pages, or global layout.

## Recommended Structure

### 1. Hero: Cooking Intent

Replace the generic hero messaging with a more useful first-screen prompt:

- Primary headline: "What do you want to cook today?"
- Supporting copy focused on tested recipes and practical filtering.
- Search input for recipe keywords or ingredients.
- Quick chips such as `Under 30 min`, `Easy dinner`, `Breakfast`, and `Vegetarian`.
- A compact "Recipe of the Day" or featured recipe panel with title, cooking time, difficulty, and rating.

The hero should feel like a starting point, not a static promotion. Search and chips should route users into recipe discovery using supported recipe query params where possible.

### 2. Decision Helper Tiles

Add a section near the top with cooking-situation tiles instead of only generic categories:

- "Have 15 minutes?"
- "Cooking for family"
- "Use leftovers"
- "Beginner friendly"

Each tile should represent a practical user intent and link to an appropriate recipe query or filtered recipe view. If a specific query is not yet supported, the tile can initially link to the closest supported filter while keeping copy honest.

### 3. Popular Recipes

Keep the current popular recipes section but reframe it around user behavior:

- Title option: "Popular this week" or "Recipes people are saving now"
- Continue using the existing popular recipe query sorted by popularity.
- Keep recipe cards scannable with image, title, cooking time, difficulty, rating, and favorite action.

This section should follow the hero and decision helpers, so users first choose an intent and then see social proof.

### 4. Personal Cookbook Block

Add one personal engagement block below the main discovery sections:

- For signed-in users: show saved recipes, recently viewed recipes, or a "cook again" style prompt if available.
- For guests: show a light call to action to save recipes and build a personal cookbook.

This block should not dominate the page. It is a helpful return-user layer, not the main homepage purpose.

### 5. Supporting Lower Sections

Keep lower-page support sections, but make them secondary:

- Categories can stay, preferably lower than decision helpers.
- Reviews can remain as trust support.
- Newsletter can remain as a weekly meal inspiration CTA.
- "Today’s Pick" can be merged into the hero feature panel or kept only if it does not duplicate the hero.

## Components

- `HomeHero`: revise toward search, quick chips, and a functional featured recipe panel.
- `DecisionHelperTiles`: new homepage section for cooking situations.
- `RecipeCard`: continue reusing existing recipe cards for popular recipes.
- `PersonalCookbookBlock`: new section with signed-in and guest states.
- `SectionHeader`, `WidthContainer`, and existing layout primitives should continue to shape section rhythm.

## Data Flow

- Popular recipes continue using `recipeListOptions({ sort: "popularity", order: "desc", limit })`.
- Category data can continue using `categoryListOptions`.
- Hero chips should map to existing recipe query fields where possible:
  - time-based chips use `maxCookingTime`;
  - difficulty chips use `difficulty`;
  - meal chips use `mealType`;
  - search uses the shared search query field.
- Personal cookbook data should prefer existing authenticated user/favorites queries. Recently viewed recipes can be deferred if there is no existing source.

## Empty, Loading, And Error States

- Search and chips should remain available even when recipe queries are loading.
- Popular recipes and categories should keep skeleton states.
- If personalized data is unavailable, signed-in users should see a useful fallback such as favorite recipe suggestions or popular recipes.
- Guests should see a non-blocking sign-in prompt, not an error-like empty state.
- Network errors should be shown inline and should not collapse the whole homepage.

## Testing And Verification

- Add focused component tests for new conditional states if the project already has suitable frontend test helpers.
- Verify query param generation for hero chips and decision helper tiles.
- Run the frontend typecheck or the root typecheck before implementation is considered complete.
- Visually verify desktop and mobile layouts, especially the hero search, tile grid, recipe cards, and personal block.

## Open Decisions For Implementation

- Final copy can be adjusted during implementation, but the page purpose should stay discovery-first.
- The "Recipe of the Day" source can initially remain static if there is no existing endpoint for a curated recipe.
- Recently viewed recipes should be deferred unless an existing client-side source already exists.

## Approval

This design reflects the selected direction from brainstorming: guided discovery with hero search, decision helper tiles, popular recipes, and one light personal cookbook block.
