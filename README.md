# SCRBL

Kids build a world by drawing it, and parents tell stories set in that world.

A child sketches characters, places, pets and magic objects. A helper called Pip asks about each drawing, the kid picks an art style, and SCRBL turns the sketch into finished art. Parents then use Story Time to turn that world into illustrated picture books to read together.

## What's in the app

| Tab | Who | What it does |
| --- | --- | --- |
| Create | Kid | Pick what to draw, draw it, answer Pip's questions, pick a style and colours, choose one of 3 versions |
| My Art | Kid | Every drawing, with its original sketch, in automatic folders by kind and in folders the kid makes |
| Bookshelf | Kid and parent | Finished books, read page by page |
| Story Time | Parent, behind a grown-up check | Pick the cast, a theme and a real-life moment, draft a book, edit every page, save it |

## Current state

- The app runs on iPad, iPhone, Android and web from one Expo codebase.
- Everything is saved on the device. There are no accounts or backend yet.
- AI is stubbed behind one interface, `src/services/ai.ts`. Until the backend exists:
  - Art is previewed on device by restyling the kid's own lines (`src/components/art-view.tsx`).
  - Books come from a fixed template (`src/world/draft-book.ts`).
  - Pip's first line reacts to the colours and shapes drawn (`src/world/questions.ts`).

## Run it

```bash
npm install
npx expo start        # then press i for the iOS simulator, a for Android, w for web
npm test              # unit tests
npm run typecheck
npx expo lint
```

## Code map

```
src/app/            screens (Expo Router): tabs, creation detail, book reader
src/components/     drawing pad, art and page rendering, parent gate, UI kit
src/features/create the kid's create flow
src/services/ai.ts  the one place the app asks AI for anything
src/world/          types, catalog of styles/themes, store, folders, book drafting
```

## Next steps

1. Backend: accounts with parental consent, cloud sync, credits, and the AI proxy with safety filters.
2. Sketch-to-art: test image models on real kids' sketches and plug the winner into `AiService.makeArt`.
3. Story model: replace the template in `AiService.draftBook`, with page illustrations that reuse each character.
4. Read-aloud, subscriptions through the App Store, and an iPad development build with Apple Pencil tuning.

The product plan lives in the project's SCRBL Product Plan doc.
