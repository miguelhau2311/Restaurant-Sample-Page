import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UtensilsCrossed, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FocusTrap from 'focus-trap-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Menu' },
    { path: '/reservations', label: 'Reservations' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ].filter(item => item.path !== location.pathname);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5 },
    exit: { opacity: 0 },
  };

  const menuVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
    exit: { x: '100%' },
  };

  const listVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const iconVariants = {
    closed: { rotate: 0 },
    open: { rotate: 45 },
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Burger Button */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-3 bg-orange-600 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <motion.div
              variants={iconVariants}
              initial="closed"
              animate={isOpen ? 'open' : 'closed'}
              transition={{ duration: 0.3 }}
              className="relative w-6 h-6"
            >
              <span
                className={`block absolute h-0.5 w-6 bg-white transform transition duration-300 ease-in-out ${
                  isOpen ? 'rotate-45 top-2.5' : 'top-1'
                }`}
              ></span>
              <span
                className={`block absolute h-0.5 w-6 bg-white transform transition duration-300 ease-in-out ${
                  isOpen ? 'opacity-0' : 'top-2.5'
                }`}
              ></span>
              <span
                className={`block absolute h-0.5 w-6 bg-white transform transition duration-300 ease-in-out ${
                  isOpen ? '-rotate-45 top-2.5' : 'top-4'
                }`}
              ></span>
            </motion.div>
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black z-40"
                onClick={closeMenu}
                aria-hidden="true"
              />

              <FocusTrap>
                <motion.nav
                  id="mobile-menu"
                  variants={menuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
                  className="fixed right-0 top-0 h-full w-[85vw] max-w-72 bg-white shadow-lg z-50 flex flex-col"
                  aria-label="Mobile Navigation"
                >
                  <div className="flex justify-between items-center p-6 border-b">
                    <Link to="/" className="flex items-center" onClick={closeMenu}>
                      <UtensilsCrossed className="h-6 w-6 text-orange-600" />
                      <span className="ml-2 text-xl font-bold text-gray-900">Gourmet Haven</span>
                    </Link>
                    <button
                      onClick={closeMenu}
                      className="p-2 bg-gray-200 rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-400"
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5 text-gray-700" />
                    </button>
                  </div>
                  <div className="mt-8 px-6 flex-1">
                    <motion.ul
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="space-y-6"
                    >
                      {menuItems.map(item => (
                        <motion.li key={item.path} variants={itemVariants}>
                          <Link
                            to={item.path}
                            onClick={closeMenu}
                            className="block text-lg text-gray-700 hover:text-orange-600 transition-colors"
                          >
                            {item.label}
                          </Link>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </div>
                </motion.nav>
              </FocusTrap>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Navigation */}
      <nav className="bg-white shadow-lg w-full">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <Link to="/" className="flex items-center">
              <UtensilsCrossed className="h-6 w-6 text-orange-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Gourmet Haven</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              {menuItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
