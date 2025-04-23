import React from 'react';
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
import AdbIcon from '@mui/icons-material/Adb';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const pages = ["Home", "Verify", "Register", "Files", "About", "Contact"];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, principal, logout } = useAuth?.() || {};

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

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: 'rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(8px)',
        boxShadow: 'none',
        backgroundImage: 'none',
        zIndex: 1100,
        '& .MuiToolbar-root': {
          padding: '0.5rem 1rem',
        }
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo for desktop */}
          <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: '#6366f1' }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'black',
              textDecoration: 'none',
              textShadow: '0px 0px 5px rgba(0, 0, 0, 0.2)',
            }}
          >
            PROOFNEST
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="open navigation"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              sx={{ color: '#6366f1' }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiPaper-root': {
                  backgroundColor: 'rgba(30, 30, 40, 0.9)',
                  backdropFilter: 'blur(10px)',
                  color: '#f8fafc',
                  borderRadius: '8px',
                  mt: 1
                }
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={() => handleNavClick(page)}>
                  <Typography sx={{ textAlign: 'center', color: 'black' }}>{page}</Typography>
                </MenuItem>
              ))}
              {isAuthenticated ? (
                <MenuItem onClick={() => { logout(); handleCloseNavMenu(); }}>
                  <Typography sx={{ textAlign: 'center', color: 'black' }}>Logout</Typography>
                </MenuItem>
              ) : (
                <MenuItem onClick={() => { navigate('/login'); handleCloseNavMenu(); }}>
                  <Typography sx={{ textAlign: 'center', color: 'black' }}>Login</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Logo for mobile */}
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: '#6366f1' }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'black',
              textDecoration: 'none',
              textShadow: '0px 0px 5px rgba(0, 0, 0, 0.2)',
            }}
          >
            PROOFNEST
          </Typography>

          {/* Desktop menu links */}
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => handleNavClick(page)}
                sx={{
                  my: 2.4,
                  mx: 1.5,
                  color: 'black',
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  textShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)',
                  backgroundImage: 'none',
                  '&:hover': {
                    background: 'rgba(99, 102, 241, 0.15)',
                    borderRadius: '8px',
                  }
                }}
              >
                {page}
              </Button>
            ))}
            {isAuthenticated ? (
              <Button
                onClick={logout}
                sx={{
                  my: 2.4,
                  mx: 1.5,
                  color: 'black',
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  textShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)',
                  '&:hover': {
                    background: 'rgba(239, 68, 68, 0.15)',
                    borderRadius: '8px',
                  }
                }}
              >
                Logout
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                sx={{
                  my: 2,
                  px: 3,
                  py: 0.5,
                  color: 'white',
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)',
                  '&:hover': {
                    boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;
