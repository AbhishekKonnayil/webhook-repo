import { useEffect, useState } from "react";

export interface Event {
  _id: string;
  action: "PUSH" | "PULL_REQUEST" | "MERGE";
  author: string;
  from_branch: string | null;
  request_id: string;
  timestamp: string;
  to_branch: string;
}

const PushIcon = () => (
  <svg
    className="w-5 h-5 text-indigo-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
);

const PullRequestIcon = () => (
  <svg
    className="w-5 h-5 text-emerald-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
    />
  </svg>
);

const MergeIcon = () => (
  <svg
    className="w-5 h-5 text-purple-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
    />
  </svg>
);

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = "http://localhost:5000/events";

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    // Polling every 15 seconds
    const interval = setInterval(fetchEvents, 15000);
    return () => clearInterval(interval);
  }, []);

  console.log(events.map((event) => event.timestamp));

  const formatDate = (dateString: string) => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return new Intl.DateTimeFormat(undefined, {
      timeZone: userTimeZone,
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-white shadow-sm border border-slate-200">
            <svg
              className="w-8 h-8 text-slate-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">
            GitHub Events
          </h1>
          <p className="mt-3 text-lg text-slate-500">
            Real-time feed of repository activities
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 backdrop-blur-sm">
            <p className="text-slate-500 text-lg">No recent events found.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line for the timeline */}
            <div className="absolute top-0 bottom-0 left-8 w-px bg-slate-200 hidden sm:block"></div>

            <div className="space-y-6">
              {events.map((event) => {
                const isPush = event.action === "PUSH";
                const isMerge = event.action === "MERGE";

                return (
                  <div
                    key={event._id}
                    className="relative flex items-start group"
                  >
                    {/* Timeline dot */}
                    <div className="hidden sm:flex items-center justify-center absolute left-8 -ml-3.5 mt-5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-transform duration-300 group-hover:scale-110 ${
                          isPush
                            ? "bg-indigo-50 text-indigo-500"
                            : isMerge
                              ? "bg-purple-50 text-purple-500"
                              : "bg-emerald-50 text-emerald-500"
                        }`}
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${isPush ? "bg-indigo-500" : isMerge ? "bg-purple-500" : "bg-emerald-500"}`}
                        ></div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="w-full sm:ml-16 bg-white hover:bg-slate-50 transition-colors duration-300 border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md">
                      <div className="p-5 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-lg ${isPush ? "bg-indigo-50" : isMerge ? "bg-purple-50" : "bg-emerald-50"}`}
                            >
                              {isPush ? (
                                <PushIcon />
                              ) : isMerge ? (
                                <MergeIcon />
                              ) : (
                                <PullRequestIcon />
                              )}
                            </div>
                            <span
                              className={`text-sm font-semibold tracking-wide uppercase ${isPush ? "text-indigo-600" : isMerge ? "text-purple-600" : "text-emerald-600"}`}
                            >
                              {isPush
                                ? "Push"
                                : isMerge
                                  ? "Merge Request"
                                  : "Pull Request"}
                            </span>
                          </div>
                          <time className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                            {formatDate(event.timestamp)}
                          </time>
                        </div>

                        <div className="mt-2 text-slate-600 text-lg leading-relaxed">
                          {isPush && (
                            <p>
                              <span className="font-semibold text-slate-900">
                                {event.author}
                              </span>{" "}
                              pushed to{" "}
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 mx-1">
                                {event.to_branch}
                              </span>
                            </p>
                          )}
                          {!isPush && !isMerge && (
                            <p>
                              <span className="font-semibold text-slate-900">
                                {event.author}
                              </span>{" "}
                              submitted a pull request from{" "}
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-slate-100 text-slate-700 border border-slate-300 mx-1">
                                {event.from_branch}
                              </span>{" "}
                              to{" "}
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 mx-1">
                                {event.to_branch}
                              </span>
                            </p>
                          )}
                          {isMerge && (
                            <p>
                              <span className="font-semibold text-slate-900">
                                {event.author}
                              </span>{" "}
                              merged branch{" "}
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-slate-100 text-slate-700 border border-slate-300 mx-1">
                                {event.from_branch}
                              </span>{" "}
                              to{" "}
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 mx-1">
                                {event.to_branch}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
