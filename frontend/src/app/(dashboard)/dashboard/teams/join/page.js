"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Loader2, Users } from "lucide-react";

export default function JoinTeamPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const inviteCode = searchParams.get("code");
    const [status, setStatus] = useState("joining"); 

    useEffect(() => {
        if (!inviteCode) {
            setStatus("error");
            return;
        }

        const joinTeam = async () => {
            try {
                const { data } = await api.post("/collaboration/teams/join-invite", { inviteCode });
                setStatus("success");
                setTimeout(() => {
                    router.push(`/dashboard/teams/${data.data._id}`);
                }, 1500);
            } catch (error) {
                console.error("Join failed:", error);
                setStatus("error");
            }
        };

        joinTeam();
    }, [inviteCode, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
                {status === "joining" && (
                    <>
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Joining Team...</h2>
                        <p className="text-gray-400">Please wait while we verify your invite.</p>
                    </>
                )}
                {status === "success" && (
                    <>
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-6 h-6 text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Successfully Joined!</h2>
                        <p className="text-gray-400">Redirecting to team chat...</p>
                    </>
                )}
                {status === "error" && (
                    <>
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-6 h-6 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Failed to Join</h2>
                        <p className="text-gray-400 mb-4">The invite link may be invalid or expired.</p>
                        <button
                            onClick={() => router.push("/dashboard/teams")}
                            className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
                        >
                            Back to Teams
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
