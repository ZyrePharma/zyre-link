"use client"

import { useState, useRef, useEffect } from "react"
import { Loader2, Upload, GripHorizontal, Building2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: {
    id: string
    name: string
    logoUrl: string | null
    cardTemplateUrl: string | null
  } | null
  onSuccess: (company: any) => void
}

export function CompanyDialog({ open, onOpenChange, company, onSuccess }: CompanyDialogProps) {
  const [name, setName] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [templateUrl, setTemplateUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const logoInputRef = useRef<HTMLInputElement>(null)
  const templateInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false)

  useEffect(() => {
    if (open) {
      setName(company?.name || "")
      setLogoUrl(company?.logoUrl || "")
      setTemplateUrl(company?.cardTemplateUrl || "")
    }
  }, [open, company])

  const handleUpload = async (file: File, type: "logo" | "template") => {
    const isLogo = type === "logo"
    isLogo ? setIsUploadingLogo(true) : setIsUploadingTemplate(true)
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", `companies/${type}`)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Upload failed")
      }

      const data = await res.json()
      isLogo ? setLogoUrl(data.url) : setTemplateUrl(data.url)
      toast.success(`${type === 'logo' ? 'Logo' : 'Template'} uploaded successfully`)
    } catch (error: any) {
      toast.error(error.message || `Failed to upload ${type}`)
    } finally {
      isLogo ? setIsUploadingLogo(false) : setIsUploadingTemplate(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Company name is required")
      return
    }

    setIsLoading(true)
    try {
      const url = company 
        ? `/api/admin/companies/${company.id}`
        : `/api/admin/companies`
        
      const res = await fetch(url, {
        method: company ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          logoUrl: logoUrl || null,
          cardTemplateUrl: templateUrl || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to save company")
      }

      const data = await res.json()
      toast.success(company ? "Company updated" : "Company created")
      onSuccess(data)
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{company ? "Edit Company" : "Add Company"}</DialogTitle>
          <DialogDescription>
            {company ? "Update company details." : "Create a new company to assign users to."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              placeholder="Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Company Logo</Label>
            <div className="flex gap-4 items-start">
              <div className="w-16 h-16 border rounded bg-muted/30 flex items-center justify-center shrink-0 overflow-hidden">
                {logoUrl ? (
                   // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-6 h-6 text-muted-foreground/50" />
                )}
              </div>
              <div className="space-y-2 flex-1">
                <input
                  type="file"
                  ref={logoInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(file, "logo")
                    if (e.target) e.target.value = ""
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  disabled={isUploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {isUploadingLogo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Upload Logo
                </Button>
                <Input
                  placeholder="Or logo URL..."
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Card Template Background (Optional)</Label>
            <div className="flex flex-col gap-2">
              {templateUrl && (
                <div className="w-full aspect-[1.6] rounded border overflow-hidden relative group">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={templateUrl} alt="Template" className="w-full h-full object-fill" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                     <Button type="button" variant="destructive" size="sm" onClick={() => setTemplateUrl("")}>Remove</Button>
                  </div>
                </div>
              )}
              
              {!templateUrl && (
                 <div className="flex gap-2">
                   <input
                    type="file"
                    ref={templateInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUpload(file, "template")
                      if (e.target) e.target.value = ""
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    disabled={isUploadingTemplate}
                    onClick={() => templateInputRef.current?.click()}
                  >
                    {isUploadingTemplate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Upload Template Image
                  </Button>
                 </div>
              )}
              <Input
                placeholder="Or template URL..."
                value={templateUrl}
                onChange={(e) => setTemplateUrl(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isUploadingLogo || isUploadingTemplate}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {company ? "Save Changes" : "Create Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
