"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileQuestion, Sparkles, Loader2, CheckCircle, XCircle, Trophy, RotateCcw } from "lucide-react";
import api from "@/lib/axios";

export default function QuizGeneratorPage() {
    const [topic, setTopic] = useState("");
    const [numQuestions, setNumQuestions] = useState(5);
    const [difficulty, setDifficulty] = useState("Medium");
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState("");

    const generateQuiz = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setLoading(true);
        setQuiz(null);
        setAnswers({});
        setShowResults(false);
        setError("");

        try {
            const { data } = await api.post("/ai/quiz", { topic, numQuestions, difficulty });
            if (data.success && data.quiz) {
                setQuiz(data.quiz);
            } else {
                setError("Failed to generate quiz. Please try again.");
            }
        } catch (error) {
            console.error("Quiz generation error:", error);
            setError(error.response?.data?.error || "Failed to generate quiz. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const submitQuiz = () => {
        setShowResults(true);
    };

    const resetQuiz = () => {
        setQuiz(null);
        setAnswers({});
        setShowResults(false);
        setError("");
    };

    const calculateScore = () => {
        if (!quiz || !quiz.questions) return 0;
        let correct = 0;
        quiz.questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) correct++;
        });
        return correct;
    };

    const getScoreColor = () => {
        const percentage = (calculateScore() / quiz.questions.length) * 100;
        if (percentage >= 80) return "text-green-400";
        if (percentage >= 60) return "text-yellow-400";
        return "text-red-400";
    };

    return (
        <div className="space-y-6 pb-8">
            {}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-white mb-2">AI Quiz Generator</h1>
                <p className="text-gray-400">Generate custom quizzes to test your knowledge</p>
            </motion.div>

            {}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
                <form onSubmit={generateQuiz} className="space-y-4">
                    <div>
                        <label className="block text-white font-medium mb-2">Quiz Topic</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., JavaScript Basics, World History, Biology..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white font-medium mb-2">Number of Questions</label>
                            <select
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            >
                                <option value={5}>5 Questions</option>
                                <option value={10}>10 Questions</option>
                                <option value={15}>15 Questions</option>
                                <option value={20}>20 Questions</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-white font-medium mb-2">Difficulty Level</label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all [&>option]:text-gray-900 [&>option]:bg-white"
                            >
                                <option value="Easy" className="text-gray-900 bg-white">Easy</option>
                                <option value="Medium" className="text-gray-900 bg-white">Medium</option>
                                <option value="Hard" className="text-gray-900 bg-white">Hard</option>
                            </select>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
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

                {}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {}
            <AnimatePresence>
                {quiz && quiz.questions && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        {quiz.questions.map((question, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all"
                            >
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
                                                className="w-4 h-4 accent-purple-600"
                                            />
                                            <span className="text-white flex-1">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </motion.div>
                        ))}

                        {!showResults ? (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={submitQuiz}
                                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
                            >
                                <FileQuestion className="w-5 h-5" />
                                <span>Submit Quiz</span>
                            </motion.button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-4"
                            >
                                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6 text-center">
                                    <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h3>
                                    <p className="text-gray-300 text-lg">
                                        You scored <span className={`${getScoreColor()} font-bold text-2xl`}>{calculateScore()}</span> out of{" "}
                                        <span className="font-bold">{quiz.questions.length}</span>
                                    </p>
                                    <p className={`${getScoreColor()} mt-2 text-xl font-semibold`}>
                                        {((calculateScore() / quiz.questions.length) * 100).toFixed(0)}% Correct
                                    </p>
                                </div>

                                {}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-white mb-4">📚 Review Your Answers</h3>
                                    {quiz.questions.map((question, index) => (
                                        <motion.div
                                            key={`review-${index}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                                        >
                                            <div className="flex items-start space-x-3 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-white font-semibold text-lg mb-3">{question.question}</h4>

                                                    {}
                                                    <div className="mb-4">
                                                        {answers[index] === question.correctAnswer ? (
                                                            <div className="flex items-center space-x-2 text-green-400">
                                                                <CheckCircle className="w-5 h-5" />
                                                                <span className="font-semibold">Correct!</span>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center space-x-2 text-red-400">
                                                                    <XCircle className="w-5 h-5" />
                                                                    <span className="font-semibold">Incorrect</span>
                                                                </div>
                                                                {answers[index] && (
                                                                    <p className="text-gray-400 text-sm ml-7">
                                                                        Your answer: <span className="text-red-400 font-medium">{answers[index]}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {}
                                                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-3">
                                                        <p className="text-green-400 font-semibold mb-1">✓ Correct Answer:</p>
                                                        <p className="text-white">{question.correctAnswer}</p>
                                                    </div>

                                                    {}
                                                    {question.explanation && (
                                                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                                            <p className="text-blue-400 font-semibold mb-1">💡 Explanation:</p>
                                                            <p className="text-gray-300 text-sm leading-relaxed">{question.explanation}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <button
                                    onClick={resetQuiz}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                    <span>Generate New Quiz</span>
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
