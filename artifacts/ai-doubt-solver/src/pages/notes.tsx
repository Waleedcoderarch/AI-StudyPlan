import { useState } from "react"
import { useUploadPdf, useGenerateNotes } from "@workspace/api-client-react"
import { FileUp, FileText, Loader2, Download, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

export default function Notes() {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [pdfSource, setPdfSource] = useState<string>("")
  const [generatedNotes, setGeneratedNotes] = useState<string>("")
  const [notesTitle, setNotesTitle] = useState<string>("")

  const uploadPdf = useUploadPdf()
  const generateNotes = useGenerateNotes()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      // Reset state
      setExtractedText("")
      setGeneratedNotes("")
      setPdfSource(e.target.files[0].name)
    }
  }

  const handleUpload = () => {
    if (!file) return

    uploadPdf.mutate(
      { data: { file } },
      {
        onSuccess: (data) => {
          setExtractedText(data.text)
          toast({
            title: "Success",
            description: `Extracted ${data.wordCount} words from ${data.pageCount} pages.`
          })
        },
        onError: () => {
          toast({
            title: "Upload failed",
            description: "Could not process the PDF. Please try again.",
            variant: "destructive"
          })
        }
      }
    )
  }

  const handleGenerateNotes = () => {
    if (!extractedText) return

    generateNotes.mutate(
      { data: { content: extractedText, title: notesTitle || "PDF Notes", source: pdfSource } },
      {
        onSuccess: (data) => {
          setGeneratedNotes(data.notes)
          toast({
            title: "Notes Generated",
            description: "Successfully created structured notes."
          })
        },
        onError: () => {
          toast({
            title: "Generation failed",
            description: "Failed to generate notes.",
            variant: "destructive"
          })
        }
      }
    )
  }

  const handleDownload = () => {
    if (!generatedNotes) return
    const element = document.createElement("a")
    const fileBlob = new Blob([generatedNotes], { type: "text/plain" })
    element.href = URL.createObjectURL(fileBlob)
    element.download = `${notesTitle || "Notes"}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Notes Generator</h1>
        <p className="text-muted-foreground">Upload a PDF to extract text and generate structured study notes.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5" /> Upload PDF
              </CardTitle>
              <CardDescription>Select a PDF document to begin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                type="file" 
                accept="application/pdf" 
                onChange={handleFileChange}
                disabled={uploadPdf.isPending || generateNotes.isPending}
              />
              {file && (
                <div className="text-sm text-muted-foreground">
                  Selected: <span className="font-medium text-foreground">{file.name}</span>
                </div>
              )}
              <Button 
                className="w-full" 
                onClick={handleUpload} 
                disabled={!file || uploadPdf.isPending}
              >
                {uploadPdf.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  "Extract Text"
                )}
              </Button>
            </CardContent>
          </Card>

          {extractedText && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" /> Generate Notes
                </CardTitle>
                <CardDescription>Create structured study notes from the extracted text.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes Title</label>
                  <Input 
                    value={notesTitle} 
                    onChange={(e) => setNotesTitle(e.target.value)} 
                    placeholder="E.g., Chapter 1 Summary" 
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleGenerateNotes} 
                  disabled={generateNotes.isPending || !extractedText}
                >
                  {generateNotes.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    "Generate Structured Notes"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6 h-full flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> 
                  Result
                </div>
                {generatedNotes && (
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden min-h-[400px]">
              <ScrollArea className="flex-1 p-6 bg-muted/30">
                {generatedNotes ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {generatedNotes}
                  </div>
                ) : extractedText ? (
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-[20]">
                    {extractedText.substring(0, 1500)}
                    {extractedText.length > 1500 && "...\n\n[Content truncated for preview. Click Generate to process full text.]"}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    Upload a PDF and generate notes to see them here.
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}