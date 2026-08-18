"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  listAreas,
  createArea,
  updateArea,
  deleteArea,
  listPriorities,
  createPriority,
  updatePriority,
  deletePriority,
  listQuotes,
  createQuote,
  updateQuote,
  deleteQuote,
  listCoverMoods,
  deleteCoverMood,
} from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

type EditState<T> = { open: boolean; item: T | null }

export default function ContentPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Content Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage areas of life, priorities, quotes, and cover moods
        </p>
      </div>

      <Tabs defaultValue="areas" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="areas">Areas of Life</TabsTrigger>
          <TabsTrigger value="priorities">Priorities</TabsTrigger>
          <TabsTrigger value="quotes">Motivation Quotes</TabsTrigger>
          <TabsTrigger value="cover-moods">Cover Moods</TabsTrigger>
        </TabsList>

        <TabsContent value="areas">
          <AreasTab />
        </TabsContent>
        <TabsContent value="priorities">
          <PrioritiesTab />
        </TabsContent>
        <TabsContent value="quotes">
          <QuotesTab />
        </TabsContent>
        <TabsContent value="cover-moods">
          <CoverMoodsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AreasTab() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editState, setEditState] = useState<EditState<any>>({ open: false, item: null })
  const [form, setForm] = useState({ name: "", icon: "", color: "#6366f1", order: 0 })

  const { data, isLoading } = useQuery({
    queryKey: ["areas"],
    queryFn: async () => {
      const res = await listAreas()
      return res.data.data
    },
  })

  const createMutation = useMutation({
    mutationFn: () => createArea(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] })
      setCreateOpen(false)
      setForm({ name: "", icon: "", color: "#6366f1", order: 0 })
      toast.success("Area created")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: () => updateArea(editState.item!._id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] })
      setEditState({ open: false, item: null })
      toast.success("Area updated")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteArea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] })
      toast.success("Area deleted")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const openEdit = (item: any) => {
    setForm({ name: item.name, icon: item.icon || "", color: item.color || "#6366f1", order: item.order || 0 })
    setEditState({ open: true, item })
  }

  return (
    <ContentTable
      title="Areas of Life"
      isLoading={isLoading}
      data={data}
      columns={["Name", "Icon", "Color", "Status"]}
      renderRow={(item: any) => (
        <>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell>{item.icon || "—"}</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full border"
                style={{ backgroundColor: item.color }}
              />
              {item.color}
            </div>
          </TableCell>
          <TableCell>
            <Badge variant={item.isActive !== false ? "success" : "secondary"}>
              {item.isActive !== false ? "Active" : "Inactive"}
            </Badge>
          </TableCell>
        </>
      )}
      onEdit={openEdit}
      onDelete={(id) => deleteMutation.mutate(id)}
      createOpen={createOpen}
      setCreateOpen={setCreateOpen}
      createForm={form}
      setCreateForm={setForm}
      onCreateSubmit={() => createMutation.mutate()}
      isCreating={createMutation.isPending}
      editOpen={editState.open}
      setEditOpen={(v) => setEditState({ ...editState, open: v })}
      onEditSubmit={() => updateMutation.mutate()}
      isEditing={updateMutation.isPending}
    />
  )
}

function PrioritiesTab() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editState, setEditState] = useState<EditState<any>>({ open: false, item: null })
  const [form, setForm] = useState({ name: "", color: "#10b981", weight: 5, order: 0 })

  const { data, isLoading } = useQuery({
    queryKey: ["priorities"],
    queryFn: async () => {
      const res = await listPriorities()
      return res.data.data
    },
  })

  const createMutation = useMutation({
    mutationFn: () => createPriority(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priorities"] })
      setCreateOpen(false)
      setForm({ name: "", color: "#10b981", weight: 5, order: 0 })
      toast.success("Priority created")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: () => updatePriority(editState.item!._id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priorities"] })
      setEditState({ open: false, item: null })
      toast.success("Priority updated")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePriority(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priorities"] })
      toast.success("Priority deleted")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const openEdit = (item: any) => {
    setForm({ name: item.name, color: item.color || "#10b981", weight: item.weight || 5, order: item.order || 0 })
    setEditState({ open: true, item })
  }

  return (
    <ContentTable
      title="Priorities"
      isLoading={isLoading}
      data={data}
      columns={["Name", "Color", "Weight", "Status"]}
      renderRow={(item: any) => (
        <>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: item.color }} />
              {item.color}
            </div>
          </TableCell>
          <TableCell>{item.weight}</TableCell>
          <TableCell>
            <Badge variant={item.isActive !== false ? "success" : "secondary"}>
              {item.isActive !== false ? "Active" : "Inactive"}
            </Badge>
          </TableCell>
        </>
      )}
      onEdit={openEdit}
      onDelete={(id) => deleteMutation.mutate(id)}
      createOpen={createOpen}
      setCreateOpen={setCreateOpen}
      createForm={form}
      setCreateForm={setForm}
      onCreateSubmit={() => createMutation.mutate()}
      isCreating={createMutation.isPending}
      editOpen={editState.open}
      setEditOpen={(v) => setEditState({ ...editState, open: v })}
      onEditSubmit={() => updateMutation.mutate()}
      isEditing={updateMutation.isPending}
    />
  )
}

function QuotesTab() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editState, setEditState] = useState<EditState<any>>({ open: false, item: null })
  const [form, setForm] = useState({ text: "", author: "" })

  const { data, isLoading } = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const res = await listQuotes()
      return res.data.data
    },
  })

  const createMutation = useMutation({
    mutationFn: () => createQuote(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] })
      setCreateOpen(false)
      setForm({ text: "", author: "" })
      toast.success("Quote created")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: () => updateQuote(editState.item!._id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] })
      setEditState({ open: false, item: null })
      toast.success("Quote updated")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] })
      toast.success("Quote deleted")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const openEdit = (item: any) => {
    setForm({ text: item.text, author: item.author || "" })
    setEditState({ open: true, item })
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Motivation Quotes</h3>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Quote</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Quote</DialogTitle>
              <DialogDescription>Add a new motivation quote</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Quote Text</Label>
                <Textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="Your limitation—it's only your imagination."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Author</Label>
                <Input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="Unknown"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Quote
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {data?.map((item: any) => (
            <div
              key={item._id}
              className="flex items-start justify-between p-4 rounded-lg border bg-card"
            >
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm font-medium">&ldquo;{item.text}&rdquo;</p>
                <p className="text-xs text-muted-foreground mt-1">— {item.author || "Unknown"}</p>
                <Badge variant={item.isActive !== false ? "success" : "secondary"} className="mt-2">
                  {item.isActive !== false ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEdit(item)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => deleteMutation.mutate(item._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {(!data || data.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-8">No quotes found</p>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editState.open} onOpenChange={(v) => setEditState({ ...editState, open: v })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Quote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Quote Text</Label>
              <Textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Author</Label>
              <Input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function CoverMoodsTab() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["cover-moods"],
    queryFn: async () => {
      const res = await listCoverMoods()
      return res.data.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCoverMood(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cover-moods"] })
      toast.success("Cover mood deleted")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <>
      <h3 className="text-lg font-medium mb-4">Cover Moods</h3>
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {data?.map((item: any) => (
            <div
              key={item._id}
              className="relative group rounded-lg overflow-hidden border aspect-[3/4]"
            >
              <img
                src={item.image?.url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <p className="text-white text-sm font-medium px-2 text-center">
                  {item.title || "Untitled"}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(item._id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete
                </Button>
              </div>
              {!item.isActive && (
                <Badge variant="secondary" className="absolute top-2 left-2">
                  Inactive
                </Badge>
              )}
            </div>
          ))}
          {(!data || data.length === 0) && (
            <p className="text-sm text-muted-foreground col-span-full text-center py-8">
              No cover moods found
            </p>
          )}
        </div>
      )}
    </>
  )
}

// ─── Reusable Content Table ────────────────────────
function ContentTable({
  title,
  isLoading,
  data,
  columns,
  renderRow,
  onEdit,
  onDelete,
  createOpen,
  setCreateOpen,
  createForm,
  setCreateForm,
  onCreateSubmit,
  isCreating,
  editOpen,
  setEditOpen,
  onEditSubmit,
  isEditing,
}: {
  title: string
  isLoading: boolean
  data: any[] | undefined
  columns: string[]
  renderRow: (item: any) => React.ReactNode
  onEdit: (item: any) => void
  onDelete: (id: string) => void
  createOpen: boolean
  setCreateOpen: (v: boolean) => void
  createForm: any
  setCreateForm: (v: any) => void
  onCreateSubmit: () => void
  isCreating: boolean
  editOpen: boolean
  setEditOpen: (v: boolean) => void
  onEditSubmit: () => void
  isEditing: boolean
}) {
  const fields = columns.filter((c) => c !== "Status" && c !== "Weight")

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create {title.slice(0, -1)}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {fields.map((field) => (
                <div key={field} className="space-y-2">
                  <Label>{field}</Label>
                  {field === "Color" ? (
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={createForm.color || "#6366f1"}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, color: e.target.value })
                        }
                        className="w-12 p-1 h-9"
                      />
                      <Input
                        value={createForm.color || ""}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, color: e.target.value })
                        }
                        className="flex-1"
                      />
                    </div>
                  ) : field === "Icon" ? (
                    <Input
                      value={createForm.icon || ""}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, icon: e.target.value })
                      }
                      placeholder="emoji or icon name"
                    />
                  ) : (
                    <Input
                      value={createForm[field.toLowerCase()] || ""}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          [field.toLowerCase()]: e.target.value,
                        })
                      }
                    />
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={onCreateSubmit} disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col}>{col}</TableHead>
              ))}
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Skeleton className="h-8 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              : data?.map((item: any) => (
                  <TableRow key={item._id}>
                    {renderRow(item)}
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => onDelete(item._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            {(!data || data.length === 0) && (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                  No items found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {title.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {fields.map((field) => (
              <div key={field} className="space-y-2">
                <Label>{field}</Label>
                {field === "Color" ? (
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={createForm.color || "#6366f1"}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, color: e.target.value })
                      }
                      className="w-12 p-1 h-9"
                    />
                    <Input
                      value={createForm.color || ""}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, color: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                ) : field === "Icon" ? (
                  <Input
                    value={createForm.icon || ""}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, icon: e.target.value })
                    }
                  />
                ) : (
                  <Input
                    value={createForm[field.toLowerCase()] || ""}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        [field.toLowerCase()]: e.target.value,
                      })
                    }
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={onEditSubmit} disabled={isEditing}>
              {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}