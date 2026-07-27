import { useEffect, useState } from 'react'
import { FileText, Search, Plus, File, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getDocuments, createDocument, deleteDocument, DocumentItem } from '@/services/documents'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function Documentacao() {
  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [search, setSearch] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [openModal, setOpenModal] = useState(false)

  const loadDocs = async () => {
    const data = await getDocuments()
    setDocs(data)
  }

  useEffect(() => {
    loadDocs()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    await createDocument({ title: newTitle, category: newCategory || 'Geral' })
    setNewTitle('')
    setNewCategory('')
    setOpenModal(false)
    loadDocs()
  }

  const handleDelete = async (id: string) => {
    await deleteDocument(id)
    loadDocs()
  }

  const filteredDocs = docs.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentação</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Biblioteca unificada de manuais, procedimentos e normas operacionais Padtec.
          </p>
        </div>

        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
              <Plus className="w-4 h-4 mr-1.5" /> Novo Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Documento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label className="text-xs">Título do Documento</Label>
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Categoria</Label>
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Ex: Procedimentos"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 text-white">
                Salvar Documento
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar documento..."
          className="pl-9 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => (
          <Card key={doc.id} className="border-border shadow-sm flex flex-col justify-between">
            <CardHeader className="p-5 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <File className="w-5 h-5 text-blue-600 shrink-0" />
                  <CardTitle className="text-sm font-bold leading-snug">{doc.title}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(doc.id)}
                  className="text-muted-foreground hover:text-red-500 h-8 w-8"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <span className="inline-block px-2.5 py-1 bg-muted rounded-full text-[11px] font-medium text-muted-foreground">
                {doc.category || 'Manuais'}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
