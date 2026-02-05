'use client';

export default function MobileMenuButton() {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('toggle-sidebar'));
  };

  return (
    <button
      onClick={handleClick}
      className="lg:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      aria-label="Toggle menu"
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
}
