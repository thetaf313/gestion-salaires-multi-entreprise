import { useState, useEffect } from "react";
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
  Users,
  UserPlus,
  Calendar,
  FileText,
  CreditCard,
  BarChart3,
  Clock,
  CalendarClock,
  TrendingUp,
  QrCode,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceMenuOpen, setAttendanceMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsLoading(true);
    logout();
    navigate("/login");
  };

  const isAttendanceActive = () => {
    return (
      location.pathname.includes("/attendance") ||
      location.pathname.includes("/smart-clock") ||
      location.pathname.includes("/work-schedule") ||
      location.pathname.includes("/attendance-stats") ||
      location.pathname.includes("/employee-qr-codes")
    );
  };

  // Ouvrir automatiquement le sous-menu si on est sur une page de pointage
  useEffect(() => {
    if (isAttendanceActive()) {
      setAttendanceMenuOpen(true);
    }
  }, [location.pathname]);

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
    // Menu spécifiques aux ADMIN (gestion de leur propre entreprise)
    {
      icon: Users,
      label: "Employés",
      path: user?.companyId
        ? `/company/${user.companyId}/employees`
        : "/employees",
      roles: ["ADMIN"],
    },
    {
      icon: UserPlus,
      label: "Utilisateurs",
      path: user?.companyId ? `/company/${user.companyId}/users` : "/users",
      roles: ["ADMIN"],
    },
    {
      icon: Calendar,
      label: "Cycles de Paie",
      path: user?.companyId
        ? `/company/${user.companyId}/payroll-cycles`
        : "/payroll-cycles",
      roles: ["ADMIN"],
    },
    {
      icon: FileText,
      label: "Bulletins",
      path: user?.companyId
        ? `/company/${user.companyId}/payslips`
        : "/payslips",
      roles: ["ADMIN"],
    },
    {
      icon: CreditCard,
      label: "Paiements",
      path: user?.companyId
        ? `/company/${user.companyId}/payments`
        : "/payments",
      roles: ["ADMIN"],
    },
    {
      icon: BarChart3,
      label: "Rapports",
      path: user?.companyId ? `/company/${user.companyId}/reports` : "/reports",
      roles: ["ADMIN"],
    },
    {
      icon: Clock,
      label: "Pointage",
      roles: ["ADMIN"],
      isSubmenu: true,
      submenuItems: [
        {
          icon: Clock,
          label: "Pointage Intelligent",
          path: user?.companyId
            ? `/company/${user.companyId}/smart-clock`
            : "/smart-clock",
        },
        {
          icon: Clock,
          label: "Gestion Pointage",
          path: user?.companyId
            ? `/company/${user.companyId}/attendance`
            : "/attendance",
        },
        {
          icon: CalendarClock,
          label: "Horaires de travail",
          path: user?.companyId
            ? `/company/${user.companyId}/work-schedule`
            : "/work-schedule",
        },
        {
          icon: TrendingUp,
          label: "Statistiques",
          path: user?.companyId
            ? `/company/${user.companyId}/attendance-stats`
            : "/attendance-stats",
        },
        {
          icon: QrCode,
          label: "QR Codes Employés",
          path: user?.companyId
            ? `/company/${user.companyId}/employee-qr-codes`
            : "/employee-qr-codes",
        },
      ],
    },
    {
      icon: Settings,
      label: "Paramètres",
      path:
        user?.role === "ADMIN" && user?.companyId
          ? `/company/${user.companyId}/company-settings`
          : "/settings",
      roles: ["SUPER_ADMIN", "ADMIN"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  const isActive = (path) => {
    // Pour le dashboard, on vérifie si on est sur le dashboard principal ou celui d'une entreprise
    if (path === "/dashboard") {
      return (
        location.pathname === "/dashboard" ||
        location.pathname.match(/^\/company\/[\w-]+\/dashboard$/)
      );
    }
    // Pour les autres chemins, on vérifie la correspondance exacte
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex md:w-64 bg-white shadow-lg flex-col fixed h-full z-30">
        <div className="p-6 border-b flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-800">Gestion Salaires</h1>
          <p className="text-sm text-gray-500 mt-1">Multi-Entreprise</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;

            // Si c'est un sous-menu
            if (item.isSubmenu) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setAttendanceMenuOpen(!attendanceMenuOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      isAttendanceActive()
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {attendanceMenuOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>

                  {attendanceMenuOpen && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.submenuItems.map((subItem) => {
                        const SubIcon = subItem.icon;
                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                              isActive(subItem.path)
                                ? "bg-blue-50 text-blue-600 border border-blue-100"
                                : "text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            <SubIcon size={16} />
                            <span>{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Menu normal
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
          <div className="w-64 bg-white h-full shadow-lg flex flex-col">
            <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
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

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;

                // Si c'est un sous-menu
                if (item.isSubmenu) {
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() =>
                          setAttendanceMenuOpen(!attendanceMenuOpen)
                        }
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                          isAttendanceActive()
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon size={20} />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {attendanceMenuOpen ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>

                      {attendanceMenuOpen && (
                        <div className="ml-6 mt-2 space-y-1">
                          {item.submenuItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            return (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                                  isActive(subItem.path)
                                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                                    : "text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                <SubIcon size={16} />
                                <span>{subItem.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Menu normal
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
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4 sticky top-0 z-40">
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
              <Popover className="bg-[#00000005]">
                <PopoverTrigger>
                  <Card className="px-4 py-2 bg-gray-50">
                    <div className="flex items-center space-x-3">
                      {/* <User size={16} className="text-gray-500" /> */}
                      <div className="text-sm">
                        <div className="font-medium text-gray-700">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user?.role}
                        </div>
                      </div>
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>
                          {user?.firstName.charAt(0)}
                          {user?.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </Card>
                </PopoverTrigger>
                {/* <PopoverContent className="w-48 hover:bg-slate-50">
      
                  <div
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer"
                    >
                    <LogOut size={16} />
                    <span>Déconnexion</span>
                  </div>
                </PopoverContent> */}
                <PopoverContent className="w-56" align="end">
                  <div className="flex flex-col space-y-1">
                    {/* Infos utilisateur dans le menu mobile */}
                    <div className="md:hidden pb-2 border-b">
                      <p className="font-medium text-sm">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start h-8"
                      onClick={() => {
                        // TODO: Implémenter page de profil
                        alert("Page de profil à implémenter");
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start h-8"
                      onClick={() => {
                        // TODO: Implémenter page de paramètres
                        alert("Page de paramètres à implémenter");
                      }}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </Button>

                    <div className="border-t pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                        disabled={isLoading}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        {isLoading ? "Déconnexion..." : "Se déconnecter"}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen bg-gray-50">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
