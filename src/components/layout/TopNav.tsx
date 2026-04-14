import { NavLink } from 'react-router-dom'

export function TopNav() {
  const linkBase = 'rounded-lg px-4 py-2 text-sm font-medium transition-colors'
  const activeClass = 'bg-primary text-primary-foreground'
  const inactiveClass =
    'text-muted-foreground hover:bg-muted hover:text-foreground'

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <h1 className="text-lg font-semibold text-foreground">Asset Fuel Tracker</h1>

        <nav className="flex items-center gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${linkBase} ${isActive ? activeClass : inactiveClass}`
            }
          >
            Fuel Form
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? activeClass : inactiveClass}`
            }
          >
		  
            Dashboard
          </NavLink>
		  
		  <NavLink
            to="/manage"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? activeClass : inactiveClass}`
            }
          >
		  
            Manage
          </NavLink>
		  
        </nav>
      </div>
    </header>
  )
}