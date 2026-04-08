import { useRef, useEffect, useState } from 'react';

export default function SearchBar({ value, onChange }) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (e) => {
    const v = e.target.value;
    setLocal(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), 200);
  };

  const handleClear = () => {
    setLocal('');
    onChange('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <svg
          className="w-5 h-5 text-slate-400 dark:text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>
      <input
        ref={inputRef}
        type="text"
        value={local}
        onChange={handleChange}
        placeholder='Search events, sports, venues... (press "/" to focus)'
        className="w-full h-12 pl-12 pr-12 text-base bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl
                   placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100
                   focus:outline-none focus:ring-2 focus:ring-olympic-blue/30 focus:border-olympic-blue
                   shadow-sm transition-all"
      />
      {local && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
