"use client";

import QRCode from "react-qr-code";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin } from "lucide-react";

interface InPersonCheckInProps {
    courseId: string;
    lessonId: string;
    userId: string;
    location: string | null;
    dateTime: Date | null;
    isCompleted: boolean;
}

export const InPersonCheckIn = ({
    courseId,
    lessonId,
    userId,
    location,
    dateTime,
    isCompleted,
}: InPersonCheckInProps) => {
    const [baseUrl, setBaseUrl] = useState("");

    useEffect(() => {
        setBaseUrl(window.location.origin);
    }, []);

    if (!baseUrl) return null;

    const scanUrl = `${baseUrl}/teacher/courses/${courseId}/lessons/${lessonId}/scan?userId=${userId}`;

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-900 rounded-xl w-full h-full min-h-[400px]">
            {isCompleted ? (
                <div className="flex flex-col items-center text-emerald-400 gap-y-4">
                    <div className="bg-emerald-400/20 p-4 rounded-full">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Presença Confirmada!</h3>
                    <p className="text-slate-400">O formador já registrou sua presença nesta aula.</p>
                </div>
            ) : (
                <div className="flex flex-col items-center max-w-md w-full text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">Check-in Presencial</h3>
                    <p className="text-slate-400 mb-8 max-w-sm">
                        Apresente este QR Code ao formador para registrar sua presença na aula.
                    </p>

                    <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 transition-transform hover:scale-105">
                        <QRCode
                            value={scanUrl}
                            size={256}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-y-3 w-full max-w-md bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center gap-x-3 text-slate-300">
                    <MapPin className="h-5 w-5 text-sky-400" />
                    <span>{location || "Local não informado"}</span>
                </div>
                {dateTime && (
                    <div className="flex items-center gap-x-3 text-slate-300">
                        <Calendar className="h-5 w-5 text-sky-400" />
                        <span>{format(new Date(dateTime), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
