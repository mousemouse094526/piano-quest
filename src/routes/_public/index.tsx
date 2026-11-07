import { createRoute, type SearchSchemaInput } from '@tanstack/react-router';
import { NoteNameQuiz } from '@/features/note-name-quiz/components/NoteNameQuiz';
import { parseQuizSearch, type QuizSearch } from '@/features/note-name-quiz/search';
import { rootRoute } from '@/routes/__root';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  // ADR-0002: Mode bar values live in the URL; bad or missing ones fall back to defaults.
  // `SearchSchemaInput` marks every param optional on the way in, so `<Link to="/">`
  // needs no `search`; the output is always complete.
  validateSearch: (raw: Partial<Record<keyof QuizSearch, unknown>> & SearchSchemaInput) =>
    parseQuizSearch(raw),
  component: NoteNameQuiz,
});
