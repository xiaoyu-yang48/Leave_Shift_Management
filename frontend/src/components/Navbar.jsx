import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../logo.svg'; 

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-green-200 text-black p-4 flex justify-between items-center">

      <div className="flex items-center gap-2 flex-shrink-0">
        <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
          <Link to="/" className="text-2xl font-bold leading-none tracking-tight">P&G Shift Management</Link>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
          {/* admin login */}
          {user.role === 'admin' ? (
            <>
            <Link to="/admin_home" className="mr-2 hover:underline">Home</Link>
            <Link to="/admin_shift" className="mr-2 hover:underline">Shift</Link>
            <Link to="/admin_rule" className="mr-2 hover:underline">Rules</Link>
            <Link to="/admin_overtime" className="mr-2 hover:underline">Request Center</Link>
            </>
          ) : (
            // employee login
            <>
            <Link to="/home" className="mr-2 hover:underline">Home</Link>
            <Link to="/availability" className="mr-2 hover:underline">Availability</Link>
            <Link to="/leave" className="mr-2 hover:underline">Leave</Link>
            <Link to="/request_status" className="mr-2 hover:underline">Request Status</Link>
            </>
          )}

            {/* shared func logout */}
            <button
              onClick={handleLogout}
              className="bg-green-500 px-4 py-2 rounded hover:bg-green-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">Login</Link>
            <Link
              to="/register"
              className="bg-green-500 px-4 py-2 rounded hover:bg-green-700"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
