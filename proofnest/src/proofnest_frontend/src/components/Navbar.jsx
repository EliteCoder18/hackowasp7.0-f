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
      position="sticky"
      sx={{
        bgcolor: 'black',
        top: 0,
        zIndex: 1100,
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '0.9px',
        }
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo for desktop */}
          <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: 'white' }} />
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
              color: 'white',
              textDecoration: 'none',
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
              sx={{ color: 'white' }}
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
                  backgroundColor: '#111',
                  color: 'white'
                }
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={() => handleNavClick(page)}>
                  <Typography sx={{ textAlign: 'center', color: 'white' }}>{page}</Typography>
                </MenuItem>
              ))}
              {isAuthenticated ? (
                <MenuItem onClick={() => { logout(); handleCloseNavMenu(); }}>
                  <Typography sx={{ textAlign: 'center', color: 'white' }}>Logout</Typography>
                </MenuItem>
              ) : (
                <MenuItem onClick={() => { navigate('/login'); handleCloseNavMenu(); }}>
                  <Typography sx={{ textAlign: 'center', color: 'white' }}>Login</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Logo for mobile */}
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: 'white' }} />
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
              color: 'white',
              textDecoration: 'none',
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
                  mx: 3,
                  color: 'white',
                  display: 'block',
                  '&:hover': {
                    background: 'linear-gradient(to right, rgba(74, 222, 128, 0.1), rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))',
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
                  mx: 3,
                  color: 'white',
                  display: 'block',
                  '&:hover': {
                    background: 'linear-gradient(to right, rgba(74, 222, 128, 0.1), rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))',
                  }
                }}
              >
                Logout
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                sx={{
                  my: 2.4,
                  mx: 3,
                  color: 'white',
                  display: 'block',
                  '&:hover': {
                    background: 'linear-gradient(to right, rgba(74, 222, 128, 0.1), rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))',
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
