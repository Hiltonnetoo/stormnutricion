import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, onAuthStateChanged, User } from "../services/firebaseService";
import { getPatientPortalProfile } from "../services/firebaseService";
import type { PatientPortalProfile } from "../types";

interface AuthContextType {
  currentUser: User | null;
  userRole: "nutritionist" | "patient" | null;
  patientProfile: PatientPortalProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  patientProfile: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"nutritionist" | "patient" | null>(
    null,
  );
  const [patientProfile, setPatientProfile] =
    useState<PatientPortalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getPatientPortalProfile(user.uid);
        if (profile) {
          setUserRole("patient");
          setPatientProfile(profile);
        } else {
          setUserRole("nutritionist");
          setPatientProfile(null);
        }
      } else {
        setUserRole(null);
        setPatientProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{ currentUser, userRole, patientProfile, loading }}
    >
      {loading ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <svg
            className="animate-spin h-8 w-8 text-sage-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
