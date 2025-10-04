// src/components/Navbar.tsx
// Navbar with body-portal cart drawer (no clipping), auto width, robust cart normalization.

import { Link } from "react-router-dom";
import { useState } from "react";
import { LogIn, User, LogOut } from "lucide-react";
import CartDrawer from "./CartDrawer";
import LoginModal from "./LoginModal";
import { useCart } from "../store/cart";
import { useAuth } from "../store/auth";

export default function Navbar() {
  const BRAND = "MiniShop";
  const { state } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const items = Array.isArray(state?.items) ? state.items : [];
  const count = items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b">
        <div className="mx-auto max-w-7xl px-6">
          <div className="h-14 flex items-center justify-between">
            {/* Brand clickable */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-xl
                           bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500
                           shadow-sm ring-1 ring-black/10"
                aria-hidden
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12h5M15 12h5" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 5v2M12 17v2M5 12a7 7 0 0 1 14 0" />
                </svg>
              </span>

              <span
                className="text-lg font-semibold tracking-tight
                           bg-clip-text text-transparent
                           bg-[linear-gradient(90deg,#0ea5e9,#22d3ee,#3b82f6)]
                           drop-shadow-[0_0_8px_rgba(59,130,246,0.15)]"
              >
                {BRAND}
              </span>

              <span className="ml-1 rounded-full border px-2 py-0.5 text-xs text-slate-600 bg-white/60">
                demo
              </span>
            </Link>

            {/* User actions */}
            <div className="flex items-center gap-2">
              {/* Login/User button */}
              {isAuthenticated && user ? (
                <div className="relative group">
                  <button
                    className="flex items-center gap-2 rounded-lg border px-3 py-1.5
                               text-sm text-slate-700 bg-white hover:bg-slate-50 transition"
                  >
                    <User size={16} />
                    <span>{user.name || user.email}</span>
                  </button>

                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg
                                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                  transition-all duration-200">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700
                                 hover:bg-slate-50 rounded-lg transition"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="flex items-center gap-2 rounded-lg border px-3 py-1.5
                             text-sm text-slate-700 bg-white hover:bg-slate-50 transition"
                >
                  <LogIn size={16} />
                  Login
                </button>
              )}

              {/* Cart button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-1 rounded-lg border px-3 py-1.5
                           text-sm text-slate-700 bg-white hover:bg-slate-50 transition"
              >
                🛒 Cart
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
