"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface User {
  name: string;
  email: string;
  id: string;
  user: string;
}

const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
const BEARER_TOKEN = process.env.NEXT_PUBLIC_N8N_BEARER_TOKEN;

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Scroll chat to bottom
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setSessionId(crypto.randomUUID());

    const fetchUserAndMessages = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        router.push("/signin");
        return;
      }

      setUser(session.user);

      const { data: msgData } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });

      setMessages(msgData || []);
      setLoading(false);
    };

    fetchUserAndMessages();
  }, [router]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    if (!WEBHOOK_URL || !BEARER_TOKEN) {
      console.error("Webhook URL or Bearer Token is not configured properly.");
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          user_id: "assistant",
          content: "Oops! The chat system is not configured correctly. 😢",
          created_at: new Date().toISOString(),
        },
      ]);
      return;
    }

    // Add user's message to UI
    const userMessage: Message = {
      id: crypto.randomUUID(),
      user_id: user.id,
      content: newMessage,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    await supabase.from("messages").insert(userMessage);

    // Add temporary typing bubble
    const typingMessageId = crypto.randomUUID();
    const typingMessage: Message = {
      id: typingMessageId,
      user_id: "assistant",
      content: "Assistant is typing… ⏳",
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${String(BEARER_TOKEN)}`,
        },
        body: JSON.stringify({
          sessionId,
          chatInput: userMessage.content,
        }),
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status} - ${text}`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.warn("Webhook response is not JSON:", text);
        data = { output: "Sorry, I got an invalid response 😅" };
      }

      // Remove typing bubble
      setMessages(prev => prev.filter(msg => msg.id !== typingMessageId));

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        user_id: "assistant",
        content: data.output || "Sorry, I couldn't get a response. 😅",
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      await supabase.from("messages").insert(assistantMessage);
    } catch (error) {
      console.error("Error sending message to webhook:", error);
      // Replace typing bubble with error message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === typingMessageId
            ? { ...msg, content: "Oops! Something went wrong on my end. 😢" }
            : msg
        )
      );
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-neutral-950 text-neutral-200">
        <p className="animate-pulse text-xl">Loading your dashboard… ⏳</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen bg-neutral-950 text-neutral-200 antialiased font-sans">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-neutral-950 via-gray-900 to-gray-800" />

      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900/50 backdrop-blur-lg p-6 flex flex-col justify-between rounded-r-3xl shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-2">REIT Chat App</h2>
          <p className="text-sm text-gray-400 mb-6 truncate">Logged in as: {user?.email}</p>
          <div className="flex flex-col space-y-2">
            <button className="text-left p-3 rounded-xl bg-gray-700/50 hover:bg-gray-700/80 transition-colors">
              New Chat
            </button>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full py-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors font-semibold shadow-lg text-white"
        >
          Sign Out
        </button>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col p-8">
        <div className="flex-1 overflow-y-auto space-y-6 scrollbar-thumb-rounded scrollbar-track-transparent scrollbar-thumb-gray-600 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="bg-gray-800/60 p-8 rounded-2xl shadow-inner text-center max-w-xl animate-fade-in">
                <p className="text-xl font-medium text-gray-200 mb-4">Hi there!</p>
                <p className="text-gray-400">
                  Tell me about your portfolio and how you would like to make your investments in REITs. Using my dataset and analytical thinking, I will recommend the best performing REITs for your use-case.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.user_id === user?.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-4 rounded-3xl max-w-[70%] transition-transform duration-300 transform ${
                    msg.user_id === user?.id
                      ? "bg-blue-600/80 text-white shadow-lg animate-slide-in-right"
                      : "bg-gray-800/80 text-gray-100 shadow-md animate-slide-in-left"
                  }`}
                >
                  <p className="text-sm font-light text-gray-300 mb-1">
                    {msg.user_id === user?.id ? "You" : "Assistant"}
                  </p>
                  <p>{msg.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="mt-8 flex items-center bg-gray-800/60 p-2 rounded-full shadow-xl">
          <input
            className="flex-1 p-3 ml-2 rounded-full bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Type your message…"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors font-semibold text-white shadow-lg mr-2"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
