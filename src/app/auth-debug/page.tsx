"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function AuthDebug() {
  const { data: session, status } = useSession();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog(`Session status: ${status}`);
    if (session?.user) {
      addLog(`User logged in: ${session.user.email}`);
    }
  }, [session, status]);

  const handleTestGoogle = async () => {
    addLog("Starting Google OAuth test...");
    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/auth-debug"
      });
      addLog(`signIn result: ${JSON.stringify(result)}`);
      
      if (result?.url) {
        addLog(`Got redirect URL: ${result.url}`);
        window.location.href = result.url;
      }
    } catch (error) {
      addLog(`Error: ${(error as any).message}`);
    }
  };

  const handleTestCredentials = async () => {
    addLog("Testing credentials provider...");
    const result = await signIn("credentials", {
      redirect: false,
      email: "test@example.com",
      password: "test@123"
    });
    addLog(`Credentials result: ${JSON.stringify(result)}`);
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <Nav />
      <div className="flex-1 p-8 pt-32">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Auth Debug Page</h1>

          {/* Session Info */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h2 className="font-semibold mb-2">Session Info</h2>
            <p>Status: <span className="font-mono">{status}</span></p>
            {session?.user && (
              <>
                <p>Email: <span className="font-mono">{session.user.email}</span></p>
                <p>Name: <span className="font-mono">{session.user.name}</span></p>
                <p>Role: <span className="font-mono">{(session.user as any)?.role}</span></p>
              </>
            )}
          </div>

          {/* Test Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleTestGoogle}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Google OAuth
            </button>
            <button
              onClick={handleTestCredentials}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Test Credentials
            </button>
            {session && (
              <button
                onClick={() => signOut()}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            )}
          </div>

          {/* Logs */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Debug Logs</h2>
            <div className="bg-white p-3 rounded max-h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs yet</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-gray-700">{log}</div>
                ))
              )}
            </div>
          </div>

          {/* Environment Info */}
          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <h2 className="font-semibold mb-2">Environment</h2>
            <p>NEXTAUTH_URL: <span className="font-mono">{process.env.NEXTAUTH_URL || "Not set"}</span></p>
            <p>API Base: <span className="font-mono">http://localhost:3001</span></p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}