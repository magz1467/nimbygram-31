# Planning Pulse Portal

## Project info

**URL**: https://lovable.dev/projects/106f7ed5-6c9b-4088-ba7e-3d7443df8f58

## How can I edit this code?

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/106f7ed5-6c9b-4088-ba7e-3d7443df8f58) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

## Running Tests

To run tests locally, you must create a `.env` file with the following environment variables:
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase project's service role key
- `SUPABASE_URL`: Your Supabase project's URL

Collect these by going to the project in supabase -> project settings (in the bottom left corner) -> API settings

```sh
git clone git@github.com:magz1467/planning-pulse-portal.git
cd planning-pulse-portal
npm i

echo "SUPABASE_SERVICE_ROLE_KEY=___________" >> ./supabase/.env
echo "SUPABASE_URL=https://jposqxdboetyioymfswd.supabase.com" >> ./supabase/.env
```

## Running Tests

```
npx vitest .
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/106f7ed5-6c9b-4088-ba7e-3d7443df8f58) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
