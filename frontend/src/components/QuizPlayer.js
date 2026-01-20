'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Award } from 'lucide-react';

export default function QuizPlayer({ quiz, onComplete }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [timeLeft, setTimeLeft] = useState(quiz.duration * 60 || 1800); // in seconds
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (!showResults && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !showResults) {
            handleSubmit();
        }
    }, [timeLeft, showResults]);

    const handleAnswerSelect = (answer) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [currentQuestion]: answer
        });
    };

    const handleNext = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = () => {
        let correctCount = 0;
        quiz.questions.forEach((q, index) => {
            if (selectedAnswers[index] === q.correctAnswer) {
                correctCount++;
            }
        });
        setScore(correctCount);
        setShowResults(true);
        if (onComplete) {
            onComplete({ score: correctCount, total: quiz.questions.length });
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    if (showResults) {
        const percentage = (score / quiz.questions.length) * 100;
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto"
            >
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <Award className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Completed!</h2>
                    <div className="text-6xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                        {percentage.toFixed(0)}%
                    </div>
                    <p className="text-xl text-gray-600 mb-8">
                        You scored {score} out of {quiz.questions.length}
                    </p>

                    <div className="space-y-3 mb-8">
                        {quiz.questions.map((q, index) => {
                            const isCorrect = selectedAnswers[index] === q.correctAnswer;
                            return (
                                <div
                                    key={index}
                                    className={`p-4 rounded-lg border-2 ${isCorrect
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {isCorrect ? (
                                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                                        ) : (
                                            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                                        )}
                                        <div className="flex-1 text-left">
                                            <p className="font-medium text-gray-800 mb-1">
                                                Question {index + 1}: {q.question}
                                            </p>
                                            {!isCorrect && (
                                                <p className="text-sm text-gray-600">
                                                    Correct answer: <span className="font-semibold text-green-700">{q.correctAnswer}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                    >
                        Take Another Quiz
                    </button>
                </div>
            </motion.div>
        );
    }

    const question = quiz.questions[currentQuestion];

    return (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">{quiz.title}</h2>
                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                        <Clock className="w-5 h-5" />
                        <span className="font-semibold">{formatTime(timeLeft)}</span>
                    </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="bg-white h-2 rounded-full"
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <p className="text-sm mt-2 opacity-90">
                    Question {currentQuestion + 1} of {quiz.questions.length}
                </p>
            </div>

            {/* Question */}
            <div className="p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">
                            {question.question}
                        </h3>

                        <div className="space-y-3">
                            {question.options.map((option, index) => (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleAnswerSelect(option)}
                                    className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all ${selectedAnswers[currentQuestion] === option
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-blue-300 text-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedAnswers[currentQuestion] === option
                                                ? 'border-blue-500 bg-blue-500'
                                                : 'border-gray-300'
                                            }`}>
                                            {selectedAnswers[currentQuestion] === option && (
                                                <div className="w-3 h-3 bg-white rounded-full" />
                                            )}
                                        </div>
                                        <span>{option}</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="border-t border-gray-200 p-6 flex items-center justify-between">
                <button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Previous
                </button>

                <div className="flex gap-2">
                    {quiz.questions.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentQuestion(index)}
                            className={`w-10 h-10 rounded-lg font-semibold transition-all ${index === currentQuestion
                                    ? 'bg-blue-600 text-white'
                                    : selectedAnswers[index]
                                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>

                {currentQuestion === quiz.questions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                    >
                        Submit Quiz
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        disabled={!selectedAnswers[currentQuestion]}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
}
