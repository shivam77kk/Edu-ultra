"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileQuestion, Sparkles, Loader2, CheckCircle, XCircle } from "lucide-react";
import api from "@/lib/axios";

export default function QuizGeneratorPage() {
    const [topic, setTopic] = useState("");
    const [numQuestions, setNumQuestions] = useState(5);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    const generateQuiz = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setLoading(true);
        setQuiz(null);
        setAnswers({});
        setShowResults(false);

        try {
            const { data } = await api.post("/ai/quiz", { topic, numQuestions });
            setQuiz(data.quiz);
        } catch (error) {
            alert("Failed to generate quiz. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const submitQuiz = () => {
        setShowResults(true);
    };

    const calculateScore = () => {
        if (!quiz || !quiz.questions) return 0;
        let correct = 0;
        quiz.questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) correct++;
        });
        return correct;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">AI Quiz Generator</h1>
                <p className="text-gray-400">Generate custom quizzes to test your knowledge</p>
            </div>

            {/* Form */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <form onSubmit={generateQuiz} className="space-y-4">
                    <div>
                        <label className="block text-white font-medium mb-2">Quiz Topic</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., JavaScript Basics, World History, Biology..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-white font-medium mb-2">Number of Questions</label>
                        <select
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={5}>5 Questions</option>
                            <option value={10}>10 Questions</option>
                            <option value={15}>15 Questions</option>
                            <option value={20}>20 Questions</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Generating Quiz...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                <span>Generate Quiz</span>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Quiz */}
            {quiz && quiz.questions && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    {quiz.questions.map((question, index) => (
                        <div key={index} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                            <div className="flex items-start space-x-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                    {index + 1}
                                </div>
                                <h3 className="text-white font-semibold text-lg flex-1">{question.question}</h3>
                                {showResults && (
                                    answers[index] === question.correctAnswer ? (
                                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                                    )
                                )}
                            </div>
                            <div className="space-y-2">
                                {question.options?.map((option, optIndex) => (
                                    <label
                                        key={optIndex}
                                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${answers[index] === option
                                            ? "bg-purple-600/30 border-2 border-purple-500"
                                            : "bg-white/5 border-2 border-transparent hover:bg-white/10"
                                            } ${showResults && option === question.correctAnswer
                                                ? "bg-green-600/30 border-green-500"
                                                : showResults && answers[index] === option && option !== question.correctAnswer
                                                    ? "bg-red-600/30 border-red-500"
                                                    : ""
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${index}`}
                                            value={option}
                                            checked={answers[index] === option}
                                            onChange={(e) => setAnswers({ ...answers, [index]: e.target.value })}
                                            disabled={showResults}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-white">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}

                    {!showResults ? (
                        <button
                            onClick={submitQuiz}
                            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center justify-center space-x-2"
                        >
                            <FileQuestion className="w-5 h-5" />
                            <span>Submit Quiz</span>
                        </button>
                    ) : (
                        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6 text-center">
                            <h3 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h3>
                            <p className="text-gray-300 text-lg">
                                You scored <span className="text-green-400 font-bold">{calculateScore()}</span> out of{" "}
                                <span className="font-bold">{quiz.questions.length}</span>
                            </p>
                            <p className="text-gray-400 mt-2">
                                {(calculateScore() / quiz.questions.length) * 100}% Correct
                            </p>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
