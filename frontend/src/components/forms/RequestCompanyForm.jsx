import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Upload } from "lucide-react"
import { useState } from "react"

const RequestCompanyForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    employeeCount: "",
    message: "",
    logo: null
  })

  const [logoPreview, setLogoPreview] = useState("")

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({...prev, logo: file}))
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-black/40 backdrop-blur-xl border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">Faire une demande</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Logo upload */}
          <div className="col-span-2 flex justify-center mb-4">
            <div className="relative">
              <input
                type="file"
                id="logo"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <label
                htmlFor="logo"
                className="flex flex-col items-center justify-center w-32 h-32 rounded-full 
                  bg-white/30 border-2 border-dashed border-white/40 cursor-pointer
                  hover:bg-white/40 transition-all duration-200"
              >
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-white/80" />
                    <span className="text-sm text-white/80 mt-2">Logo</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-white">Nom de l'entreprise</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              required
              className="bg-white/30 border-white/30 text-white placeholder:text-white/60"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName" className="text-white">Nom du contact</Label>
            <Input
              id="contactName"
              value={formData.contactName}
              onChange={(e) => setFormData({...formData, contactName: e.target.value})}
              required
              className="bg-white/30 border-white/30 text-white placeholder:text-white/60"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              className="bg-white/30 border-white/30 text-white placeholder:text-white/60"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
              className="bg-white/30 border-white/30 text-white placeholder:text-white/60"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="address" className="text-white">Adresse</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              required
              className="bg-white/30 border-white/30 text-white placeholder:text-white/60"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="employeeCount" className="text-white">Nombre d'employés</Label>
            <Input
              id="employeeCount"
              type="number"
              value={formData.employeeCount}
              onChange={(e) => setFormData({...formData, employeeCount: e.target.value})}
              required
              className="bg-white/30 border-white/30 text-white placeholder:text-white/60"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="message" className="text-white">Message (optionnel)</Label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              rows={3}
              className="w-full rounded-md bg-white/10 border border-white/20 text-white 
                placeholder:text-white/60 focus:border-white/30 focus:ring-0"
            />
          </div>

          <div className="col-span-2 flex justify-end gap-2">
            <Button 
              type="button" 
              onClick={onClose}
              variant="ghost" 
              className="text-white hover:bg-white/20"
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              className="bg-white/30 hover:bg-white/40 text-white border border-white/20"
            >
              Envoyer la demande
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default RequestCompanyForm