import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from 'sonner';
import apiClient from "@/api/axios";

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kiểm tra token lưu trong localStorage khi khởi động
  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      console.log("Auth check on startup - Token exists:", !!storedToken);

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log("User restored from localStorage:", parsedUser);
        } catch (err) {
          // Xóa localStorage nếu JSON không hợp lệ
          console.error("Error parsing stored user:", err);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Attempting login with:", { email, password });
      
      const response = await apiClient.post("/auth/login", { email, password });
      const { user, token } = response.data;
      
      console.log("Login successful:", { user, token });
      
      // Lưu thông tin đăng nhập vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      // Cập nhật state
      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
      
      // Hiển thị thông báo thành công
      toast.success("Đăng nhập thành công!");
      
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || "Đăng nhập thất bại";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Xóa dữ liệu đăng nhập khỏi localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Reset state
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Hiển thị thông báo
    toast.info("Đã đăng xuất");
    
    // Chuyển hướng về trang login (tùy chọn, có thể xử lý ở component)
    window.location.href = "/#/login";
  };

  const authContextValue: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};