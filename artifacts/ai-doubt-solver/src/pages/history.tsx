import { useState } from "react"
import { 
  useListNotesHistory, 
  getListNotesHistoryQueryKey,
  useListQuizHistory,
  getListQuizHistoryQueryKey,
  useDeleteSavedNote
} from "@workspace/api-client-react"
import { FileText, BrainCircuit, Calendar, Trash2, ExternalLink } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "wouter"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/format"
import { useToast } from "@/hooks/use-toast"

export default function HistoryPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const { data: notesHistory, isLoading: isLoadingNotes } = useListNotesHistory({
    query: { queryKey: getListNotesHistoryQueryKey() }
  })
  
  const { data: quizHistory, isLoading: isLoadingQuizzes } = useListQuizHistory({
    query: { queryKey: getListQuizHistoryQueryKey() }
  })

  const deleteNote = useDeleteSavedNote()

  const handleDeleteNote = (id: number) => {
    deleteNote.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotesHistoryQueryKey() })
        toast({ title: "Deleted", description: "Note successfully removed." })
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to delete note.", variant: "destructive" })
      }
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your History</h1>
        <p className="text-muted-foreground">Review your saved notes and past quiz performances.</p>
      </div>

      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Saved Notes
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" /> Quiz History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="space-y-4">
          {isLoadingNotes ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent><Skeleton className="h-20 w-full" /></CardContent>
                </Card>
              ))}
            </div>
          ) : notesHistory?.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No saved notes</h3>
              <p className="text-muted-foreground mt-1 mb-4">You haven't generated any notes yet.</p>
              <Link href="/notes">
                <Button>Create Notes</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {notesHistory?.map((note) => (
                <Card key={note.id} className="flex flex-col hover-elevate">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {formatDate(note.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pb-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {note.notes}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteNote(note.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => {
                      const element = document.createElement("a")
                      const fileBlob = new Blob([note.notes], { type: "text/plain" })
                      element.href = URL.createObjectURL(fileBlob)
                      element.download = `${note.title || "Notes"}.txt`
                      document.body.appendChild(element)
                      element.click()
                      document.body.removeChild(element)
                    }}>
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          {isLoadingQuizzes ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent><Skeleton className="h-20 w-full" /></CardContent>
                </Card>
              ))}
            </div>
          ) : quizHistory?.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
              <BrainCircuit className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No quiz history</h3>
              <p className="text-muted-foreground mt-1 mb-4">You haven't taken any quizzes yet.</p>
              <Link href="/quiz">
                <Button>Take a Quiz</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {quizHistory?.map((quiz) => (
                <Card key={quiz.id} className="flex flex-col hover-elevate">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-1">{quiz.topic}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {formatDate(quiz.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Questions</span>
                        <span className="font-medium">{quiz.questionCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Attempts</span>
                        <span className="font-medium">{quiz.attempts}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Best Score</span>
                        <span className="font-medium text-primary">
                          {quiz.bestScore !== null && quiz.bestScore !== undefined ? `${quiz.bestScore}%` : '-'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}