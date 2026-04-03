import React from 'react';

export function BrowserRouter({ children }) {
  return <>{children}</>;
}

export function Routes({ children }) {
  return <>{children}</>;
}

export function Route({ element }) {
  return element;
}

export function NavLink({ children, to, ...props }) {
  return (
    <a href={to} {...props}>
      {children}
    </a>
  );
}
