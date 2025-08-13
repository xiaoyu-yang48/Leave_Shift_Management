import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">P&G Shift Management</Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
          {/* admin login */}
          {user.role === 'admin' ? (
            <>
            <Link to="/admin_home" className="mr-4">Request Center</Link>
            <Link to="/admin_shift" className="mr-4">Shifts</Link>
            </>
          ) : (
            // employee login
            <>
            <Link to="/home" className="mr-4">Home</Link>
            <Link to="/leave" className="mr-4">Leave</Link>
            <Link to="/overtime" className="mr-4">Overtime</Link>
            <Link to="/request_status" className="mr-4">My Requests</Link>
            </>
          )}

            {/* shared func logout */}
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-700"
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
