import { NextResponse } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(req) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/login'], // add more if needed
};
