import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaFingerprint, FaLock, FaArrowRight } from 'react-icons/fa';

const pages = ["Home", "Verify", "Register", "Files", "About", "Blog","Contact"];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth?.() || {};

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleNavClick = (page) => {
    if (page === "Home") {
      navigate('/');
    } else if (page === "Verify") {
      navigate('/verify');
    } else if (page === "Register" || page === "Register-Asset") {
      navigate('/register');
    } else {
      navigate(`/${page.toLowerCase()}`);
    }
    handleCloseNavMenu();
  };

  const isActive = (page) => {
    if (page === "Home" && location.pathname === "/") return true;
    return location.pathname === `/${page.toLowerCase()}`;
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(12px)',
        boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.1)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(231, 233, 255, 0.7)' : 'none',
        transition: 'all 0.3s ease',
        zIndex: 1100,
        '& .MuiToolbar-root': {
          padding: '0.5rem 1rem',
        }
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo for desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <div className="relative mr-2">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full opacity-30 blur-md"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-lg">
                <FaFingerprint className="text-white text-xl" />
              </div>
            </div>

          </motion.div>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="open navigation"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              sx={{
                color: '#6366f1',
                '&:hover': {
                  background: 'rgba(99, 102, 241, 0.1)',
                }
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiPaper-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(231, 233, 255, 0.7)',
                  mt: 1.5,
                  overflow: 'hidden',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }
              }}
            >
              {pages.map((page, index) => (
                <MenuItem
                  key={page}
                  onClick={() => handleNavClick(page)}
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    }
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Typography sx={{
                      textAlign: 'center',
                      color: isActive(page) ? '#6366f1' : 'black',
                      fontWeight: isActive(page) ? 600 : 400
                    }}>
                      {page}
                    </Typography>
                  </motion.div>
                </MenuItem>
              ))}
              {isAuthenticated ? (
                <MenuItem
                  onClick={() => { logout(); handleCloseNavMenu(); }}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    }
                  }}
                >
                  <Typography sx={{ textAlign: 'center', color: '#ef4444' }}>Logout</Typography>
                </MenuItem>
              ) : (
                <MenuItem
                  onClick={() => { navigate('/login'); handleCloseNavMenu(); }}
                  sx={{
                    background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
                    m: 1,
                    borderRadius: '8px',
                    '&:hover': {
                      opacity: 0.9,
                    }
                  }}
                >
                  <Typography sx={{ textAlign: 'center', color: 'white' }}>Login</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Logo for mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', flexGrow: 1 }}
          >
            <div className="flex items-center">

              <Typography
                variant="h5"
                noWrap
                component="a"
                href="/"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '.2rem',
                  background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textDecoration: 'none',
                }}
              >
                PROOFNEST
              </Typography>
            </div>
          </motion.div>

          {/* Desktop menu links */}
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {pages.map((page) => (
              <motion.div
                key={page}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleNavClick(page)}
                  sx={{
                    my: 2,
                    mx: 1.5,
                    color: isActive(page) ? '#6366f1' : 'rgba(0, 0, 0, 0.8)',
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: isActive(page) ? 600 : 500,
                    textTransform: 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#6366f1',
                      '&::after': {
                        transform: 'scaleX(1)',
                      }
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '2px',
                      backgroundColor: '#6366f1',
                      transform: isActive(page) ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'bottom left',
                      transition: 'transform 0.3s ease',
                    }
                  }}
                >
                  {page}
                </Button>
              </motion.div>
            ))}
            {isAuthenticated ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={logout}
                  sx={{
                    my: 2,
                    mx: 1.5,
                    color: '#ef4444',
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    }
                  }}
                >
                  Logout
                </Button>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate('/login')}
                  sx={{
                    my: 1.5,
                    ml: 2,
                    px: 3.5,
                    py: 1,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px -3px rgba(99, 102, 241, 0.4)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 20px -5px rgba(99, 102, 241, 0.5)',
                    }
                  }}
                >
                  Login <FaArrowRight style={{ fontSize: '0.75rem', marginLeft: '4px' }} />
                </Button>
              </motion.div>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;
