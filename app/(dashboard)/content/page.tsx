"use client"

import { useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  listAreas,
  createArea,
  deleteArea,
  listPriorities,
  createPriority,
  deletePriority,
  listQuotes,
  createQuote,
  deleteQuote,
  listCoverMoods,
  createCoverMoods,
  deleteCoverMood,
} from "@/lib/api"
import type { AreaOfLife, Priority, MotivationQuote, CoverMood } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, Trash2, X, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add content</h1>
        <p className="text-sm text-muted-foreground">
          Manage areas of life, priorities, motivation speeches, and mood covers
        </p>
      </div>

      <ChipSection
        title="Area of life"
        queryKey="areas"
        list={listAreas}
        create={createArea}
        remove={deleteArea}
        addLabel="Add Area of Life"
        placeholder="e.g. Family"
      />

      <ChipSection
        title="Priority"
        queryKey="priorities"
        list={listPriorities}
        create={createPriority}
        remove={deletePriority}
        addLabel="Add Priority"
        placeholder="e.g. High"
      />

      <MotivationSpeechCard />

      <CoverMoodGrid />
    </div>
  )
}

// ─── Reusable chip picker (Area of life / Priority) ────────────
function ChipSection({
  title,
  queryKey,
  list,
  create,
  remove,
  addLabel,
  placeholder,
}: {
  title: string
  queryKey: string
  list: () => Promise<{ data: { data: (AreaOfLife | Priority)[] } }>
  create: (data: { name: string }) => Promise<unknown>
  remove: (id: string) => Promise<unknown>
  addLabel: string
  placeholder: string
}) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => (await list()).data.data,
  })

  const createMutation = useMutation({
    mutationFn: () => create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      setName("")
      setOpen(false)
      toast.success(`${title} added`)
    },
    onError: (error: Error) => toast.error(error.message || `Failed to add ${title.toLowerCase()}`),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      toast.success(`${title} removed`)
    },
    onError: (error: Error) => toast.error(error.message || "Failed to remove"),
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-primary">{title}</h3>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="flex h-6 w-6 items-center justify-center rounded-full border border-primary text-primary hover:bg-primary/10">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent>
            <p className="text-sm font-medium mb-2">{addLabel}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (name.trim()) createMutation.mutate()
              }}
              className="flex gap-2"
            >
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={placeholder}
              />
              <Button type="submit" size="sm" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add +"}
              </Button>
            </form>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 w-24 rounded-full" />)
        ) : (
          <>
            {data?.map((item) => (
              <span
                key={item._id}
                className="group flex items-center gap-1.5 rounded-full bg-card border px-4 py-2 text-sm font-medium"
              >
                {item.name}
                <button
                  onClick={() => deleteMutation.mutate(item._id)}
                  className="hidden group-hover:inline-flex text-muted-foreground hover:text-destructive"
                  title={`Remove ${item.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            {data?.length === 0 && (
              <p className="text-sm text-muted-foreground">No {title.toLowerCase()} yet</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Motivation Speech ───────────────────────────────
function MotivationSpeechCard() {
  const queryClient = useQueryClient()
  const [text, setText] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => (await listQuotes()).data.data,
  })

  const createMutation = useMutation({
    mutationFn: () => createQuote({ text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] })
      setText("")
      toast.success("Motivation speech added")
    },
    onError: (error: Error) => toast.error(error.message || "Failed to add"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] })
      toast.success("Motivation speech removed")
    },
    onError: (error: Error) => toast.error(error.message || "Failed to remove"),
  })

  return (
    <div className="rounded-xl border-2 border-primary/30 p-5 space-y-3">
      <h3 className="font-semibold text-primary">Motivation speech</h3>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
        ) : (
          <>
            {data?.map((quote: MotivationQuote) => (
              <div key={quote._id} className="flex items-start justify-between gap-3 py-1">
                <p className="text-sm text-foreground/80">{quote.text}</p>
                <button
                  onClick={() => deleteMutation.mutate(quote._id)}
                  className="shrink-0 text-destructive hover:text-destructive/80"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {data?.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No entries yet</p>
            )}
          </>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (text.trim()) createMutation.mutate()
        }}
        className="flex gap-2"
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Significantly increases bleeding risk due to additive anticoagulant effects."
          className="flex-1"
        />
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
          Add +
        </Button>
      </form>
    </div>
  )
}

// ─── Mood Cover ───────────────────────────────────────
function CoverMoodGrid() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["cover-moods"],
    queryFn: async () => (await listCoverMoods()).data.data,
  })

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => createCoverMoods(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cover-moods"] })
      toast.success("Mood cover uploaded")
    },
    onError: (error: Error) => toast.error(error.message || "Failed to upload"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCoverMood(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cover-moods"] })
      toast.success("Mood cover removed")
    },
    onError: (error: Error) => toast.error(error.message || "Failed to remove"),
  })

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-primary">Mood Cover</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="aspect-3/4 rounded-xl bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/70 transition-colors"
        >
          {uploadMutation.isPending ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Upload className="h-6 w-6" />
          )}
          <span className="text-xs font-medium px-2 text-center">Upload Cover Mood</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            if (files.length) uploadMutation.mutate(files)
            e.target.value = ""
          }}
        />

        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-3/4 rounded-xl" />
            ))
          : data?.map((mood: CoverMood) => (
              <div key={mood._id} className="relative group aspect-3/4 rounded-xl overflow-hidden border">
                <img src={mood.image?.url} alt={mood.title || "Cover mood"} className="w-full h-full object-cover" />
                <button
                  onClick={() => deleteMutation.mutate(mood._id)}
                  title="Remove"
                  className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-md bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                {!mood.isActive && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                    Inactive
                  </span>
                )}
              </div>
            ))}
      </div>
    </div>
  )
}
