import NotesList from './NotesList';

export const dynamic = 'force-dynamic';

export default function NotesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Personal Notes
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Keep your personal notes and reminders here.
        </p>
      </div>
      <NotesList />
    </div>
  );
}
