'use client';

interface DashboardStats {
  users: number;
  documents: number;
  emailTemplates: number;
}

interface DashboardStatsClientProps {
  stats: DashboardStats;
}

export default function DashboardStatsClient({ stats }: DashboardStatsClientProps) {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.users,
      icon: '👥',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Documents Uploaded',
      value: stats.documents,
      icon: '📄',
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Email Templates',
      value: stats.emailTemplates,
      icon: '📧',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {statCards.map((card) => (
        <div
          key={card.title}
          className={`rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-gray-900 transition-shadow hover:shadow-md ${card.bgColor}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </p>
              <p className={`mt-2 text-3xl font-bold ${card.textColor}`}>
                {card.value.toLocaleString()}
              </p>
            </div>
            <div className={`${card.color} rounded-full p-3 text-2xl`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
