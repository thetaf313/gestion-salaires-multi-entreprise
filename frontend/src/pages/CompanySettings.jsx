import React, { useState, useEffect, useRef } from 'react';
import { companyService } from '../services/companyService';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, Camera, MapPin, Phone, Mail, CreditCard, Calendar, Check, X } from "lucide-react";

const CompanySettings = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    currency: 'XOF',
    payPeriodType: 'MONTHLY'
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const data = await companyService.getMyCompany();
      setCompany(data);
      setFormData({
        name: data.name || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        currency: data.currency || 'XOF',
        payPeriodType: data.payPeriodType || 'MONTHLY'
      });
    } catch (error) {
      toast.error('Erreur lors du chargement des données de l\'entreprise');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedCompany = await companyService.updateMyCompany(formData);
      setCompany(updatedCompany);
      toast.success('Informations de l\'entreprise mises à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des informations');
      console.error('Erreur:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérification du type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image');
      return;
    }

    // Vérification de la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (5MB maximum)');
      return;
    }

    try {
      setUploading(true);
      const response = await companyService.uploadLogo(file);
      setCompany(prev => ({
        ...prev,
        logo: response.logoUrl
      }));
      toast.success('Logo mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'upload du logo');
      console.error('Erreur:', error);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name) => {
    if (!name) return 'E';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres de l'entreprise</h1>
        <p className="text-gray-600 mt-2">
          Gérez les informations et paramètres de votre entreprise
        </p>
      </div>

      <div className="grid gap-6">
        {/* Section Logo et informations principales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Profil de l'entreprise
            </CardTitle>
            <CardDescription>
              Logo et informations principales de votre entreprise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={company?.logo} alt={company?.name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(company?.name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={triggerFileUpload}
                  disabled={uploading}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{company?.name}</h3>
                <p className="text-gray-600 text-sm">
                  {uploading ? 'Upload en cours...' : 'Cliquez sur l\'icône pour modifier le logo'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={company?.isActive ? "default" : "secondary"}>
                    {company?.isActive ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Actif
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 mr-1" />
                        Inactif
                      </>
                    )}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Créé le {formatDate(company?.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'entreprise</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nom de votre entreprise"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@entreprise.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+221 XX XXX XXXX"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  <SelectTrigger>
                    <CreditCard className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XOF">XOF (Franc CFA)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    <SelectItem value="USD">USD (Dollar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Adresse complète de l'entreprise"
                  className="pl-10 min-h-[80px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Paramètres de paie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Paramètres de paie
            </CardTitle>
            <CardDescription>
              Configuration des cycles de paie et paramètres financiers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payPeriodType">Périodicité de paie</Label>
                <Select
                  value={formData.payPeriodType}
                  onValueChange={(value) => handleInputChange('payPeriodType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">Hebdomadaire</SelectItem>
                    <SelectItem value="BIWEEKLY">Bimensuel</SelectItem>
                    <SelectItem value="MONTHLY">Mensuel</SelectItem>
                    <SelectItem value="QUARTERLY">Trimestriel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Devise d'affichage</Label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{formData.currency}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {formData.currency === 'XOF' ? 'Franc CFA' : 
                     formData.currency === 'EUR' ? 'Euro' : 'Dollar américain'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={fetchCompanyData}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="min-w-[100px]"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;