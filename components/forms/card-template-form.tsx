import { useState, useRef, useEffect } from "react";
import { Loader2, Image as ImageIcon, Upload, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
  cardTemplateUrl: string | null;
}

interface CardTemplateFormProps {
  initialTemplateUrl: string | null;
  onSave: (url: string | null) => void;
  onCancel: () => void;
}

export function CardTemplateForm({ initialTemplateUrl, onSave, onCancel }: CardTemplateFormProps) {
  const [currentUrl, setCurrentUrl] = useState(initialTemplateUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        const res = await fetch("/api/admin/companies");
        if (res.ok) {
          const data = await res.json();
          setCompanies(data);
          if (data.length > 0) {
            setSelectedCompanyId(data[0].id);
            // If the first company has a template, preview it
            if (data[0].cardTemplateUrl) {
              setCurrentUrl(data[0].cardTemplateUrl);
            }
          }
        }
      } catch (error) {
        toast.error("Failed to load companies");
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedCompanyId(id);
    const company = companies.find(c => c.id === id);
    if (company) {
      setCurrentUrl(company.cardTemplateUrl);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "template");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Upload failed");
      }

      const data = await res.json();
      setCurrentUrl(data.url);
      toast.success("Template uploaded! Click Save to apply.");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) {
      toast.error("Please select a company");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/companies/${selectedCompanyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardTemplateUrl: currentUrl }),
      });
      
      if (!res.ok) throw new Error("Failed to save template");
      toast.success("Template saved successfully");
      onSave(currentUrl);
    } catch (error) {
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="light">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4 pt-2">
          {/* Company Selection */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Company</Label>
            <div className="relative">
              <select
                value={selectedCompanyId}
                onChange={handleCompanyChange}
                disabled={isLoadingCompanies}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium focus:ring-2 ring-primary/20 outline-none transition-all appearance-none pr-10"
              >
                {isLoadingCompanies ? (
                  <option>Loading companies...</option>
                ) : companies.length === 0 ? (
                  <option>No companies found</option>
                ) : (
                  companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))
                )}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Building2 className="h-4 w-4 text-muted-foreground opacity-50" />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
               <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Template Preview</Label>
               {currentUrl && <span className="text-[10px] text-muted-foreground/50 font-medium">8:5 Ratio</span>}
            </div>
            <div className="flex justify-center bg-muted/20 rounded-xl p-3 border border-border/50 shadow-inner">
               {currentUrl ? (
                 <div className="relative w-full max-w-[280px] aspect-[1.6] rounded-lg overflow-hidden border border-border shadow-sm">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img 
                     src={currentUrl} 
                     alt="Template Preview"  
                     className="object-cover w-full h-full"
                   />
                 </div>
               ) : (
                 <div className="w-full max-w-[280px] aspect-[1.6] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
                   <ImageIcon className="h-6 w-6 opacity-30" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">No Template</span>
                 </div>
               )}
            </div>
          </div>

          {/* Actions & Inputs */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex gap-2">
                <div className="flex-1 space-y-1.5">
                   <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Image URL</Label>
                   <Input 
                     value={currentUrl || ""}
                     onChange={(e) => setCurrentUrl(e.target.value)}
                     placeholder="https://..."
                     className="rounded-xl h-10 text-sm"
                   />
                </div>
                <div className="flex flex-col justify-end">
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     className="hidden" 
                     accept="image/*"
                     onChange={handleFileChange}
                   />
                   <Button 
                     type="button" 
                     variant="secondary" 
                     onClick={() => fileInputRef.current?.click()} 
                     disabled={isUploading || isLoadingCompanies}
                     className="rounded-xl h-10 px-4 gap-2 shadow-sm hover:shadow active:scale-[0.98] transition-all"
                     title="Upload new image"
                   >
                     {isUploading ? (
                       <Loader2 className="h-4 w-4 animate-spin" />
                     ) : (
                       <Upload className="h-4 w-4" />
                     )}
                     <span className="text-xs font-bold">Upload</span>
                   </Button>
                </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-border/50">
          <Button 
            type="button" 
            variant="ghost" 
            className="flex-1 rounded-xl h-10 text-xs font-bold text-muted-foreground hover:text-foreground transition-all" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-1 rounded-xl h-10 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all gap-2" 
            disabled={isSaving || isUploading || !selectedCompanyId}
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Save Design
          </Button>
        </div>
      </form>
    </div>
  );
}
