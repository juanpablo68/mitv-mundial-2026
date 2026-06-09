"use client";

import { useEffect, useState } from "react";
import { LogIn, LogOut, ShieldCheck, UserCircle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Profile } from "../lib/types";

type AuthBarProps = {
  onAuthChange?: (userId: string | null, profile: Profile | null) => void;
};

export function AuthBar({ onAuthChange }: AuthBarProps) {
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");

  async function loadProfile(id: string, emailAddress: string | null) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,role")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      setMessage(`No se pudo leer el perfil: ${error.message}`);
      return null;
    }

    if (data) return data as Profile;

    const { data: created, error: insertError } = await supabase
      .from("profiles")
      .insert({ id, email: emailAddress, role: "viewer" })
      .select("id,email,role")
      .single();

    if (insertError) {
      setMessage(`No se pudo crear el perfil: ${insertError.message}`);
      return null;
    }

    return created as Profile;
  }

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      setUserId(user?.id || null);
      setUserEmail(user?.email || null);
      const loadedProfile = user ? await loadProfile(user.id, user.email || null) : null;
      setProfile(loadedProfile);
      onAuthChange?.(user?.id || null, loadedProfile);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user || null;
      setUserId(user?.id || null);
      setUserEmail(user?.email || null);
      const loadedProfile = user ? await loadProfile(user.id, user.email || null) : null;
      setProfile(loadedProfile);
      onAuthChange?.(user?.id || null, loadedProfile);
    });

    return () => subscription.subscription.unsubscribe();
  }, [onAuthChange]);

  async function signIn() {
    if (!supabase || !email.trim()) return;
    setMessage("Enviando enlace de acceso...");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined
      }
    });
    setMessage(error ? error.message : "Revisa tu correo para ingresar con enlace mágico.");
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUserId(null);
    setUserEmail(null);
    setProfile(null);
    onAuthChange?.(null, null);
  }

  if (!isSupabaseConfigured) {
    return (
      <section className="auth-bar warning-card">
        <div>
          <strong>Modo demostración</strong>
          <p>Para múltiples usuarios, pronósticos centralizados y panel administrador, configura Supabase en `.env.local` y ejecuta los SQL incluidos.</p>
        </div>
      </section>
    );
  }

  if (userId) {
    return (
      <section className="auth-bar">
        <div className="auth-identity">
          <UserCircle size={20} />
          <div>
            <strong>{userEmail}</strong>
            <span>{profile?.role === "admin" ? "Administrador" : "Usuario"}</span>
          </div>
          {profile?.role === "admin" && <a className="admin-link" href="/admin"><ShieldCheck size={16} /> Panel admin</a>}
        </div>
        <button className="ghost-button" onClick={signOut}><LogOut size={16} /> Salir</button>
      </section>
    );
  }

  return (
    <section className="auth-bar">
      <label>
        Correo para ingresar
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@empresa.com" type="email" />
      </label>
      <button onClick={signIn}><LogIn size={16} /> Enviar acceso</button>
      {message && <p className="inline-status">{message}</p>}
    </section>
  );
}
