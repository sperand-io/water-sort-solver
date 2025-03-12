import { Outlet } from '@tanstack/react-router';
import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Water Sort Puzzle Solver</h1>
          <p className="text-blue-100">Solve your puzzles with AI-powered image recognition and the <a href="https://en.wikipedia.org/wiki/Breadth-first_search" target="_blank" rel="noopener noreferrer" className="text-blue-100 underline">BFS</a> algorithm</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 mt-10">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600 text-sm">
          <p>Chris Sperandio &copy; {new Date().getFullYear()}</p>
          <p className="mt-1">
            <a 
              href="https://github.com/sperand-io/water-sort-solver" 
              className="text-blue-600 hover:underline"
              target="_blank" 
              rel="noopener noreferrer"
            >
              GitHub Repository
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;