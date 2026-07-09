import React, { useState, useRef, useEffect } from "react";
import { Send, User } from "lucide-react";
import { useSendChatMessage, ChatSource } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import botAvatar from "@assets/__(4)_1783575225786.jpeg";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
}

export default function AssistantPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const sendChat = useSendChatMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    const newMsg: Message = { role: 'user', content: text };
    const newHistory = [...messages, newMsg];
    setMessages(newHistory);
    setInput("");

    const historyPayload = messages.map(m => ({ role: m.role, content: m.content }));

    sendChat.mutate({ data: { message: text, history: historyPayload } }, {
      onSuccess: (res) => {
        setMessages([...newHistory, { role: 'assistant', content: res.answer, sources: res.sources }]);
      }
    });
  };

  const examplePrompts = [
    "Have we done a CETP project above 500 KLD?",
    "What results did we get for Waaree Energies?",
    "Pitch angle for textile ZLD client",
    "Standard approach for pharma effluent"
  ];

  return (
    <div className="flex-1 p-6 h-[calc(100vh)] flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto">
      
      {/* Left: Chat Display */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm h-full">
        <div className="bg-primary px-6 py-4 border-b flex items-center justify-between shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-3 text-primary-foreground tracking-wide">
            <div className="bg-white p-0.5 rounded-full shadow-sm">
              <img src={botAvatar} alt="BD Assistant" className="w-8 h-8 rounded-full object-cover" />
            </div>
            BD Assistant
          </h2>
          <span className="text-primary-foreground/70 text-sm font-medium">Knowledge Base AI</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50 dark:bg-background">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center border-4 border-primary/10">
                <img src={botAvatar} alt="BD Assistant" className="w-20 h-20 rounded-full object-cover" />
              </div>
              <div className="max-w-md">
                <h3 className="text-2xl font-bold mb-3 tracking-tight">How can I assist you?</h3>
                <p className="text-muted-foreground mb-8 text-base">Ask me anything about past case studies, technical specifications, or previous client solutions.</p>
                <div className="flex flex-col gap-3">
                  {examplePrompts.map((p, i) => (
                    <Button 
                      key={i} 
                      variant="outline" 
                      className="text-sm rounded-xl py-6 bg-white hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all justify-start px-6 shadow-sm" 
                      onClick={() => handleSend(p)}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="flex-shrink-0 mt-1">
                  {m.role === 'user' ? (
                    <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shadow-md border-2 border-white">
                      <User className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="bg-white p-0.5 rounded-full shadow-md border-2 border-primary/20">
                      <img src={botAvatar} alt="Assistant" className="w-9 h-9 rounded-full object-cover" />
                    </div>
                  )}
                </div>
                <div className={`max-w-[85%] ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-white dark:bg-card border border-border shadow-sm'} rounded-2xl p-5`}>
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed font-medium">
                    {m.content}
                  </p>
                  
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-border flex flex-wrap gap-2 items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2">Citations:</span>
                      {m.sources.map(s => (
                        <div key={s.id} className="text-xs bg-muted/50 border px-3 py-1.5 rounded-md text-foreground font-medium flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                          {s.clientName} <span className="text-muted-foreground font-normal">({s.sector})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {sendChat.isPending && (
            <div className="flex gap-4">
               <div className="bg-white p-0.5 rounded-full shadow-md border-2 border-primary/20 h-max">
                <img src={botAvatar} alt="Assistant" className="w-9 h-9 rounded-full object-cover opacity-60" />
              </div>
              <div className="bg-white dark:bg-card rounded-2xl p-5 shadow-sm border flex items-center h-[52px]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce" style={{animationDelay: '0.15s'}}></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce" style={{animationDelay: '0.3s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Right: Input Area */}
      <div className="w-full lg:w-[400px] flex flex-col gap-4">
        <Card className="flex-1 flex flex-col shadow-sm border-border">
          <CardHeader className="pb-4 bg-muted/20 border-b">
            <CardTitle className="text-lg">Query Input</CardTitle>
            <CardDescription>Formulate your query for the BD knowledge base.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-6">
            <Textarea 
              className="flex-1 min-h-[200px] lg:min-h-0 resize-none border-0 focus-visible:ring-0 px-0 text-base leading-relaxed bg-transparent" 
              placeholder="E.g. What is the standard recovery rate for textile ZLD plants using MBR and RO technologies?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
            />
            <div className="pt-6 mt-auto border-t">
              <Button 
                size="lg"
                className="w-full font-bold text-base h-12" 
                disabled={!input.trim() || sendChat.isPending}
                onClick={() => handleSend(input)}
              >
                <Send className="w-5 h-5 mr-2" />
                Analyze Query
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
