import { createRoute } from '@tanstack/react-router';
import { NoteNameQuiz } from '@/features/note-name-quiz/components/NoteNameQuiz';
import { rootRoute } from '@/routes/__root';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: NoteNameQuiz,
});
