# Snooker Tracker

Your snooker game companion, tracking scores and compiling performance metrics to help you get better!

Built as a progressive web app using Svelte/SvelteKit, running on Cloudflare Pages and Cloudflare Workers, using Durable Objects and KV for game states, and D1 for historical results for analysis.

## Developing 🧑‍💻

Running the dev server:

```bash
❯ nvm use --install-if-missing
❯ npm ci
❯ npm run dev
```

You can now visit [http://localhost:5173/](http://localhost:5173/), and you're off to the races! 🏇

## Hygiene 🚿

Formatting with `prettier` and linting with `eslint`:

```bash
❯ npm run lint
```

Run the test suite:

```bash
❯ npm run test
```

`husky` automatically runs linting and tests in a pre-commit hook. To opt out from this when you just need to get a commit done, you can pass `--no-verify` to `git commit`:

```bash
❯ git commit -m '[WIP] send help' --no-verify
```

## Deployment ☁

Automatically deploys to Cloudflare Pages, sending `main` to [snooker.hubinette.me](https://snooker.hubinette.me) and PR branches to temporary previews.

There configuration is managed in [./terraform](terraform).
