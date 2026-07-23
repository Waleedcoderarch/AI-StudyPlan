import { useState, useEffect } from "react"
import { useGenerateQuiz, useSubmitQuizResult } from "@workspace/api-client-react"
import { BrainCircuit, Loader2, CheckCircle2, XCircle, Timer, ArrowRight, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { formatTime } from "@/lib/format"
import { Textarea } from "@/components/ui/textarea"

type QuizState = "setup" | "generating" | "active" | "submitting" | "results"

export default function QuizPage() {
  const { toast } = useToast()
  
  const [topic, setTopic] = useState("")
  const [content, setContent] = useState("")
  const [questionCount, setQuestionCount] = useState(5)
  
  const [quizState, setQuizState] = useState<QuizState>("setup")
  const [quiz, setQuiz] = useState<any>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  
  const [timer, setTimer] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)
  
  const [result, setResult] = useState<any>(null)

  const generateQuiz = useGenerateQuiz()
  const submitResult = useSubmitQuizResult()

  // Timer logic
  useEffect(() => {
    if (quizState === "active") {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
      setTimerInterval(interval)
      return () => clearInterval(interval)
    } else if (timerInterval) {
      clearInterval(timerInterval)
    }
  }, [quizState])

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Please enter a topic for the quiz.", variant: "destructive" })
      return
    }

    setQuizState("generating")
    generateQuiz.mutate(
      { data: { topic, content: content || undefined, questionCount } },
      {
        onSuccess: (data) => {
          setQuiz(data)
          setAnswers(new Array(data.questions.length).fill(-1))
          setTimer(0)
          setCurrentQuestionIndex(0)
          setQuizState("active")
        },
        onError: () => {
          setQuizState("setup")
          toast({ title: "Generation failed", description: "Could not generate quiz. Try again.", variant: "destructive" })
        }
      }
    )
  }

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = optionIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    if (answers.includes(-1)) {
      toast({ title: "Incomplete", description: "Please answer all questions before submitting.", variant: "destructive" })
      return
    }

    setQuizState("submitting")
    submitResult.mutate(
      { id: quiz.id, data: { answers, timeTaken: timer } },
      {
        onSuccess: (data) => {
          setResult(data)
          setQuizState("results")
        },
        onError: () => {
          setQuizState("active")
          toast({ title: "Submission failed", description: "Could not submit quiz results.", variant: "destructive" })
        }
      }
    )
  }

  const handleRestart = () => {
    setQuizState("setup")
    setQuiz(null)
    setResult(null)
    setTopic("")
    setContent("")
    setTimer(0)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6 animate-in fade-in duration-500">
      
      {quizState === "setup" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Quiz Generator</h1>
            <p className="text-muted-foreground">Test your knowledge. Generate a custom quiz on any topic.</p>
          </div>
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" /> Setup Quiz
              </CardTitle>
              <CardDescription>Enter a topic or paste text to base the questions on.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="E.g., Quantum Physics, React Hooks..." />
              </div>
              <div className="space-y-2">
                <Label>Source Text (Optional)</Label>
                <Textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  placeholder="Paste specific notes or text you want the quiz to cover..." 
                  className="min-h-[120px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Number of Questions ({questionCount})</Label>
                <Input 
                  type="number" 
                  min={1} max={20} 
                  value={questionCount} 
                  onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)} 
                />
              </div>
              <Button className="w-full" onClick={handleGenerate} disabled={!topic.trim()}>
                Generate Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {quizState === "generating" && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="text-xl font-medium">Crafting your quiz...</h2>
          <p className="text-muted-foreground text-center max-w-sm">Generating challenging questions based on your topic. This might take a few seconds.</p>
        </div>
      )}

      {(quizState === "active" || quizState === "submitting") && quiz && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{quiz.topic}</h2>
            <div className="flex items-center gap-2 text-muted-foreground bg-muted px-3 py-1 rounded-full text-sm font-medium">
              <Timer className="h-4 w-4" /> {formatTime(timer)}
            </div>
          </div>

          <Progress value={((currentQuestionIndex + 1) / quiz.questions.length) * 100} className="h-2" />

          <Card className="hover-elevate">
            <CardHeader>
              <CardDescription>Question {currentQuestionIndex + 1} of {quiz.questions.length}</CardDescription>
              <CardTitle className="text-lg leading-relaxed">{quiz.questions[currentQuestionIndex].question}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={answers[currentQuestionIndex] !== -1 ? answers[currentQuestionIndex].toString() : undefined}
                onValueChange={(val) => handleAnswerSelect(parseInt(val))}
                className="space-y-3"
              >
                {quiz.questions[currentQuestionIndex].options.map((opt: string, i: number) => (
                  <div key={i} className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent/50 transition-colors has-[[data-state=checked]]:bg-accent has-[[data-state=checked]]:border-primary">
                    <RadioGroupItem value={i.toString()} id={`opt-${i}`} />
                    <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer font-normal text-base leading-relaxed">
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0 || quizState === "submitting"}>
                Previous
              </Button>
              
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button onClick={handleSubmit} disabled={quizState === "submitting"}>
                  {quizState === "submitting" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={answers[currentQuestionIndex] === -1}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )}

      {quizState === "results" && result && quiz && (
        <div className="space-y-8 max-w-3xl mx-auto">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">{result.percentage}%</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Quiz Completed!</h2>
                <p className="text-muted-foreground">
                  You scored {result.score} out of {result.totalQuestions} in {formatTime(result.timeTaken || 0)}.
                </p>
              </div>
              <Button onClick={handleRestart} variant="outline" className="mt-2">
                <RotateCcw className="mr-2 h-4 w-4" /> Start New Quiz
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Review Answers</h3>
            {quiz.questions.map((q: any, i: number) => {
              const isCorrect = result.correctAnswers[i] === result.answers[i]
              return (
                <Card key={q.id} className={isCorrect ? "border-green-500/50" : "border-red-500/50"}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <CardDescription>Question {i + 1}</CardDescription>
                        <CardTitle className="text-base font-medium leading-relaxed mt-1">{q.question}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {q.options.map((opt: string, optIdx: number) => {
                        const isSelected = result.answers[i] === optIdx
                        const isActuallyCorrect = result.correctAnswers[i] === optIdx
                        
                        let badgeClass = "border-transparent"
                        if (isActuallyCorrect) badgeClass = "bg-green-500/10 border-green-500 text-green-700 dark:text-green-400"
                        else if (isSelected && !isActuallyCorrect) badgeClass = "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400"
                        
                        return (
                          <div key={optIdx} className={`p-3 border rounded-md text-sm ${badgeClass} ${!isSelected && !isActuallyCorrect ? 'bg-muted/50 text-muted-foreground' : 'font-medium'}`}>
                            {opt}
                            {isActuallyCorrect && <CheckCircle2 className="inline ml-2 h-4 w-4" />}
                            {isSelected && !isActuallyCorrect && <XCircle className="inline ml-2 h-4 w-4" />}
                          </div>
                        )
                      })}
                    </div>
                    <div className="bg-accent/50 p-4 rounded-lg text-sm text-accent-foreground border">
                      <span className="font-bold block mb-1">Explanation:</span>
                      {q.explanation}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}