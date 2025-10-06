import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";
import EmployeeQRCodesSection from "../components/EmployeeQRCodesSection";

const EmployeeQRCodesPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      {/* En-tête de navigation */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => navigate(`/company/${companyId}`)}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au tableau de bord
        </Button>
      </div>

      {/* Section principale */}
      <EmployeeQRCodesSection companyId={companyId} />
    </div>
  );
};

export default EmployeeQRCodesPage;
