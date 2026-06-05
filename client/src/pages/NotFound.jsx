import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { HelpCircle, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-sky-500/10 p-5 rounded-3xl text-sky-400 border border-sky-500/15 mb-6">
        <HelpCircle className="w-12 h-12" />
      </div>
      <h1 className="font-display font-bold text-5xl text-white tracking-tight">
        404
      </h1>
      <p className="text-xl font-display font-medium text-slate-300 mt-2">
        Page Not Found
      </p>
      <p className="text-slate-500 text-sm max-w-sm mt-3 leading-relaxed">
        The page you are looking for does not exist, has been removed, or is
        temporarily unavailable.
      </p>

      <button
        onClick={handleGoBack}
        className="flex items-center gap-2 mt-8 px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium text-sm transition-all shadow-md active:scale-[0.98]"
      >
        <ArrowLeft className="w-4 h-4 text-sky-400" />
        <span>Back to Safety</span>
      </button>
    </div>
  );
};

export default NotFound;
