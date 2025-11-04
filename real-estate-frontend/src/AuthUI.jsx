import { useAuth } from './AuthProvider';
import { supabase } from './supabaseClient';

function AuthUI() {
  const { user } = useAuth();

  async function signIn() {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="auth-ui">
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <button onClick={signIn}>Sign In with Google</button>
      )}
    </div>
  );
}

export default AuthUI;
