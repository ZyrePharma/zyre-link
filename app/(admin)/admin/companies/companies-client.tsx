"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Building2, Pencil, Trash2, Image as ImageIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CompanyDialog } from "./company-dialog"

interface CompanyWithStats {
  id: string
  name: string
  logoUrl: string | null
  cardTemplateUrl: string | null
  createdAt: Date
  _count: {
    users: number
  }
}

interface CompaniesClientProps {
  initialCompanies: CompanyWithStats[]
}

export function CompaniesClient({ initialCompanies }: CompaniesClientProps) {
  const router = useRouter()
  const [companies, setCompanies] = useState(initialCompanies)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<CompanyWithStats | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (company: CompanyWithStats) => {
    if (company._count.users > 0) {
      toast.error("Cannot delete company with assigned users")
      return
    }

    if (!confirm(`Are you sure you want to delete ${company.name}?`)) return

    setIsDeleting(company.id)
    try {
      const res = await fetch(`/api/admin/companies/${company.id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete company")

      setCompanies(companies.filter(c => c.id !== company.id))
      toast.success("Company deleted successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to delete company")
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => {
          setEditingCompany(null)
          setIsDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Company
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Card key={company.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {company.logoUrl ? (
                   // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logoUrl} alt={company.name} className="h-6 w-6 rounded object-contain" />
                ) : (
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                )}
                {company.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setEditingCompany(company)
                    setIsDialogOpen(true)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={company._count.users > 0 || isDeleting === company.id}
                  onClick={() => handleDelete(company)}
                >
                  {isDeleting === company.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{company._count.users}</div>
              <p className="text-xs text-muted-foreground mb-4">
                Assigned users
              </p>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ImageIcon className="h-3 w-3" />
                <span>Template: {company.cardTemplateUrl ? "Custom" : "Default"}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Added {format(new Date(company.createdAt), "MMM d, yyyy")}
              </div>
            </CardContent>
          </Card>
        ))}

        {companies.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed">
            <Building2 className="h-8 w-8 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No companies found</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Create a company to assign users to, and customize their NFC card templates and logos.
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => {
                setEditingCompany(null)
                setIsDialogOpen(true)
              }}
            >
              Add your first company
            </Button>
          </div>
        )}
      </div>

      <CompanyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        company={editingCompany}
        onSuccess={(savedCompany) => {
          if (editingCompany) {
            setCompanies(companies.map(c => c.id === savedCompany.id ? { ...c, ...savedCompany } : c))
          } else {
            setCompanies([{ ...savedCompany, _count: { users: 0 }, createdAt: new Date() }, ...companies])
          }
          router.refresh()
        }}
      />
    </div>
  )
}
