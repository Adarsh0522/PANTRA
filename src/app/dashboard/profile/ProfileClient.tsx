"use client";

import { useState, useEffect } from "react";
import { User, Building, Settings, Laptop, LogOut, CheckCircle2, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileClientProps {
  userMobile: string;
}

export function ProfileClient({ userMobile }: ProfileClientProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    center_name: "",
    flat_door: "",
    road_street: "",
    post_office: "",
    area_locality: "",
    district_city: "",
    state_ut: "",
    country: "INDIA",
    pin_code: "",
    ao_area_code: "",
    ao_type: "",
    ao_range_code: "",
    ao_number: "",
  });

  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      
      if (data.profile) {
        setFormData(prev => ({ ...prev, ...data.profile }));
      }
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert("Failed to save profile. Please try again.");
      }
    } catch (e) {
      alert("Error saving profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutDevice = async (sessionId: string) => {
    try {
      const res = await fetch("/api/auth/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      } else {
        alert("Failed to logout device");
      }
    } catch (err) {
      alert("Error logging out device");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          Settings Configure
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Manage your default preferences for instant auto-fill across all PAN forms.
        </p>
      </div>

      {/* Basic Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-slate-800">Basic Details</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Mobile Number</label>
            <input type="text" value={userMobile} readOnly className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm font-medium cursor-not-allowed" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Full Name</label>
            <input type="text" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm font-medium transition-all" placeholder="E.g. John Doe" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Email Address</label>
            <input type="email" value={formData.email || ""} readOnly className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm font-medium cursor-not-allowed" placeholder="john@example.com" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Center Name</label>
            <input type="text" value={formData.center_name} onChange={e => setFormData({ ...formData, center_name: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm font-medium transition-all" placeholder="E.g. CSC Center VIP Road" />
          </div>
        </div>
      </div>

      {/* Office Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Building className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-slate-800">Office Details (Auto-fill Address)</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Flat / Door / Building</label>
            <input type="text" value={formData.flat_door} onChange={e => setFormData({ ...formData, flat_door: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-sm font-medium" />
          </div>
          <div className="lg:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Road / Street / Block</label>
            <input type="text" value={formData.road_street} onChange={e => setFormData({ ...formData, road_street: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-sm font-medium" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Post Office</label>
            <input type="text" value={formData.post_office} onChange={e => setFormData({ ...formData, post_office: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-sm font-medium" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Area / Locality</label>
            <input type="text" value={formData.area_locality} onChange={e => setFormData({ ...formData, area_locality: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-sm font-medium" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">District / City</label>
            <input type="text" value={formData.district_city} onChange={e => setFormData({ ...formData, district_city: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-sm font-medium" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">State / UT</label>
            <input type="text" value={formData.state_ut} onChange={e => setFormData({ ...formData, state_ut: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-sm font-medium" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">PIN Code</label>
            <input type="text" maxLength={6} value={formData.pin_code} onChange={e => setFormData({ ...formData, pin_code: e.target.value.replace(/\D/g, '') })} className="w-full h-11 px-4 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-sm font-medium" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Country</label>
            <input type="text" value={formData.country} readOnly className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm font-medium cursor-not-allowed" />
          </div>
        </div>
      </div>

      {/* PAN Defaults (AO Code) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Settings className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-slate-800">AO Code Defaults</h2>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Area Code</label>
            <input type="text" maxLength={3} value={formData.ao_area_code} onChange={e => setFormData({ ...formData, ao_area_code: e.target.value.toUpperCase() })} className="w-full h-11 px-4 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-sm font-medium uppercase" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">AO Type</label>
            <input type="text" maxLength={2} value={formData.ao_type} onChange={e => setFormData({ ...formData, ao_type: e.target.value.toUpperCase() })} className="w-full h-11 px-4 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-sm font-medium uppercase" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Range Code</label>
            <input type="text" maxLength={3} value={formData.ao_range_code} onChange={e => setFormData({ ...formData, ao_range_code: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-sm font-medium" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">AO Number</label>
            <input type="text" maxLength={2} value={formData.ao_number} onChange={e => setFormData({ ...formData, ao_number: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-sm font-medium" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Auto-fill Preferences
        </button>
      </div>

      {/* Login Devices (Device Security) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Laptop className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-slate-800">Active Login Sessions</h2>
          <span className="ml-auto text-xs font-bold text-slate-400 uppercase tracking-widest">Max 2 Devices Allowed</span>
        </div>
        <div className="divide-y divide-slate-100">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No active sessions found.</div>
          ) : (
            sessions.map((session, idx) => {
              const isCurrent = idx === sessions.length - 1; // Assuming most recent is current for display 
              // Alternatively, we could visually just list them.
              return (
                <div key={session.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      {session.device_info.includes("Mobile") ? "Mobile Device" : "Desktop Device"}
                      {isCurrent && <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] uppercase tracking-wider font-black">Current</span>}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      <span className="font-medium text-slate-600">IP:</span> {session.ip_address || "Unknown"}
                      <span className="mx-2 text-slate-300">•</span>
                      <span className="font-medium text-slate-600">Last Active:</span> {new Date(session.last_active_at).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-sm truncate">{session.device_info}</p>
                  </div>
                  
                  <button 
                    onClick={() => handleLogoutDevice(session.id)}
                    className="shrink-0 flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold transition-all border border-transparent hover:border-red-100"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout Device
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <div className={cn(
        "fixed bottom-8 right-8 bg-slate-900 border border-slate-700 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-medium transition-all duration-300 z-50",
        showToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      )}>
        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        <span className="text-sm">Profile saved. Your details will be auto-filled in PAN forms.</span>
      </div>
    </div>
  );
}
