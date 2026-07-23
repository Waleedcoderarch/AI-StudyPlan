import { useQuery } from "@tanstack/react-query"
import { 
  useGetStatsOverview, 
  getGetStatsOverviewQueryKey 
} from "@workspace/api-client-react"
import { 
  MessageSquare, 
  FileText, 
  BrainCircuit, 
  Trophy,
  ArrowRight
} from "lucide-react"
import { Link } from "wouter"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const { data: stats, isLoading } = useGetStatsOverview({
    query: {
      queryKey: getGetStatsOverviewQueryKey()
    }
  })

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">Here is an overview of your learning journey so far.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalConversations || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">AI doubt solving sessions</p>
          </CardContent>
        </Card>
        
        <Card className="bg-chart-2/5 border-chart-2/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalMessages || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total interactions</p>
          </CardContent>
        </Card>

        <Card className="bg-chart-3/5 border-chart-3/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saved Notes</CardTitle>
            <FileText className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalNotes || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">PDFs converted to structured notes</p>
          </CardContent>
        </Card>

        <Card className="bg-chart-4/5 border-chart-4/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
            <BrainCircuit className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalQuizzes || 0}
            </div>
            {stats?.averageQuizScore != null && (
              <p className="text-xs text-muted-foreground mt-1">Avg Score: {stats.averageQuizScore.toFixed(1)}%</p>
            )}
            {stats?.averageQuizScore == null && (
              <p className="text-xs text-muted-foreground mt-1">No quizzes taken yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="flex flex-col h-full hover-elevate">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Doubt Solver</CardTitle>
            <CardDescription>Get instant explanations for complex topics.</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto pt-4">
            <Link href="/chat">
              <Button className="w-full group">
                Ask a Question
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full hover-elevate">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center mb-2">
              <FileText className="h-5 w-5 text-chart-3" />
            </div>
            <CardTitle>Notes Generator</CardTitle>
            <CardDescription>Upload a PDF and instantly get structured, readable notes.</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto pt-4">
            <Link href="/notes">
              <Button variant="secondary" className="w-full group">
                Generate Notes
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full hover-elevate">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center mb-2">
              <BrainCircuit className="h-5 w-5 text-chart-4" />
            </div>
            <CardTitle>Quiz Yourself</CardTitle>
            <CardDescription>Test your knowledge on any topic with interactive quizzes.</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto pt-4">
            <Link href="/quiz">
              <Button variant="outline" className="w-full group">
                Start a Quiz
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}