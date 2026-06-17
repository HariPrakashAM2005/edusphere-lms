import React, { useState } from 'react';
import { Search, Trophy, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { LeaderboardUser } from '../../hooks/useGamification';

interface LeaderboardTableProps {
  users: LeaderboardUser[];
}

export default function LeaderboardTable({ users }: LeaderboardTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter users based on search query
  const filteredUsers = users.filter((u) =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-xl">🥇</span>;
      case 2:
        return <span className="text-xl">🥈</span>;
      case 3:
        return <span className="text-xl">🥉</span>;
      default:
        return <span className="text-xs font-black text-gray-550 dark:text-gray-400">#{rank}</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      
      {/* Table Header Filter Search */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-850 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-2.5">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Rankings</h3>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search peer rankings..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // reset to first page on search
            }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white transition"
          />
        </div>
      </div>

      {/* Rankings List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-950/20 border-b border-gray-100 dark:border-gray-850 text-xxs font-bold uppercase tracking-wider text-gray-450 dark:text-gray-500">
              <th className="py-3 px-6 text-center w-20">Rank</th>
              <th className="py-3 px-6">Student</th>
              <th className="py-3 px-6 text-center">Level</th>
              <th className="py-3 px-6 text-right w-32">Total XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((u) => (
                <tr
                  key={u.userId}
                  className={`transition hover:bg-gray-50/30 dark:hover:bg-gray-900/30 ${
                    u.isCurrentUser
                      ? 'bg-blue-50/30 dark:bg-blue-950/10 font-bold border-l-4 border-l-blue-500'
                      : ''
                  }`}
                >
                  <td className="py-4 px-6 text-center align-middle font-bold">
                    {getRankBadge(u.rank)}
                  </td>
                  <td className="py-4 px-6 align-middle">
                    <div className="flex items-center space-x-3">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center border shadow-xs ${
                        u.isCurrentUser 
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900 text-blue-600 dark:text-blue-400' 
                          : 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center space-x-1.5">
                          <span>{u.firstName} {u.lastName}</span>
                          {u.isCurrentUser && (
                            <span className="text-[9px] font-black uppercase bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center align-middle">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-extrabold rounded-lg bg-gray-105 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      Lvl {u.level}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right align-middle text-sm font-black text-blue-650 dark:text-blue-400">
                    {u.score.toLocaleString()} XP
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  No rankings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-5 border-t border-gray-100 dark:border-gray-850 flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
          <span>
            Showing {startIndex + 1} to {Math.min(filteredUsers.length, startIndex + itemsPerPage)} of {filteredUsers.length} peers
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-55 dark:hover:bg-gray-850 disabled:opacity-40 disabled:hover:bg-transparent transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-55 dark:hover:bg-gray-850 disabled:opacity-40 disabled:hover:bg-transparent transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
