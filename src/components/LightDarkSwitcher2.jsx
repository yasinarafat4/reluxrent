'use client';
import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';

export default function LightDarkSwitcher2() {
  const { theme, toggleTheme } = useReluxRentAppContext();

  if (!theme) {
    return null;
  }

  return (
    <>
      <div className="fixed left-[-50px] top-[200px] z-99999 transition-all duration-300 hover:left-0 2xl:top-[300px]">
        <button onClick={toggleTheme} className="theme-controller flex h-10 w-[90px] items-center rounded-l-lg bg-black px-[10px] text-white dark:bg-white dark:text-black dark:shadow-lg">
          {theme === 'light' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-10px block w-5" viewBox="0 0 512 512">
                <path
                  d="M160 136c0-30.62 4.51-61.61 16-88C99.57 81.27 48 159.32 48 248c0 119.29 96.71 216 216 216 88.68 0 166.73-51.57 200-128-26.39 11.49-57.38 16-88 16-119.29 0-216-96.71-216-216z"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="32"
                ></path>
              </svg>
              <span className="block ps-3 text-base">Dark</span>
            </>
          ) : (
            <>
              <svg className="mr-10px block w-5 animate-spinT" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeMiterlimit="10"
                  strokeWidth="32"
                  d="M256 48v48M256 416v48M403.08 108.92l-33.94 33.94M142.86 369.14l-33.94 33.94M464 256h-48M96 256H48M403.08 403.08l-33.94-33.94M142.86 142.86l-33.94-33.94"
                ></path>
                <circle cx="256" cy="256" r="80" fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="32"></circle>
              </svg>
              <span className="block ps-3 text-base">Light</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
