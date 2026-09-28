/**
 * FitPulse — Main Entry Point
 * Wraps all feature module code in DOMContentLoaded.
 * Load order in index.html must be:
 *   state.js → auth.js → register.js → dashboard.js → charts.js
 *   → profile.js → messages.js → workouts.js → diet.js
 *   → progress.js → settings.js → i18n.js → admin.js → main.js
 */

document.addEventListener('DOMContentLoaded', () => {

    // ── Injected from: js/state.js ────────────────────────────────────────────
    //# include state.js

    // ── Injected from: js/auth.js ─────────────────────────────────────────────
    //# include auth.js

    // ── Injected from: js/register.js ────────────────────────────────────────
    //# include register.js

    // ── Injected from: js/dashboard.js ───────────────────────────────────────
    //# include dashboard.js

    // ── Injected from: js/charts.js ──────────────────────────────────────────
    //# include charts.js

    // ── Injected from: js/profile.js ─────────────────────────────────────────
    //# include profile.js

    // ── Injected from: js/messages.js ────────────────────────────────────────
    //# include messages.js

    // ── Injected from: js/workouts.js ────────────────────────────────────────
    //# include workouts.js

    // ── Injected from: js/diet.js ────────────────────────────────────────────
    //# include diet.js

    // ── Injected from: js/progress.js ────────────────────────────────────────
    //# include progress.js

    // ── Injected from: js/settings.js ────────────────────────────────────────
    //# include settings.js

    // ── Injected from: js/i18n.js ────────────────────────────────────────────
    //# include i18n.js

    // ── Injected from: js/admin.js ───────────────────────────────────────────
    //# include admin.js

});
