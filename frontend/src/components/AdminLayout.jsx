import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Building2,
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
      roles: ["SUPER_ADMIN", "ADMIN", "CASHIER"],
    },
    {
      icon: Building2,
      label: "Entreprises",
      path: "/companies",
      roles: ["SUPER_ADMIN"], // Seulement pour super admin
    },
    {
      icon: Settings,
      label: "Paramètres",
      path: "/settings",
      roles: ["SUPER_ADMIN", "ADMIN"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <div className={`hidden md:flex md:w-64 bg-white shadow-lg flex-col`}>
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Gestion Salaires</h1>
          <p className="text-sm text-gray-500 mt-1">Multi-Entreprise</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="w-64 bg-white h-full shadow-lg">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Gestion Salaires
                </h1>
                <p className="text-sm text-gray-500 mt-1">Multi-Entreprise</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={20} />
              </Button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </Button>
              <h2 className="text-lg font-semibold text-gray-800">
                {filteredMenuItems.find((item) => isActive(item.path))?.label ||
                  "Dashboard"}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              {/* User Info */}
              <Card className="px-4 py-2 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <User size={16} className="text-gray-500" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-700">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{user?.role}</div>
                  </div>
                </div>
              </Card>

              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>Déconnexion</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
