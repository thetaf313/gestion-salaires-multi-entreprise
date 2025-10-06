import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Download, User } from "lucide-react";

const EmployeeQRGenerator = ({ employee }) => {
  const downloadQR = () => {
    const svg = document.getElementById(`qr-${employee.id}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${employee.employeeCode}_${employee.firstName}_${employee.lastName}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Card className="w-64">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center text-sm">
          <User className="w-4 h-4 mr-2" />
          {employee.firstName} {employee.lastName}
        </CardTitle>
        <p className="text-xs text-gray-500">{employee.employeeCode}</p>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex justify-center">
          <QRCodeSVG
            id={`qr-${employee.id}`}
            value={employee.employeeCode}
            size={150}
            level="M"
            includeMargin={true}
          />
        </div>
        <Button
          onClick={downloadQR}
          size="sm"
          variant="outline"
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          Télécharger QR
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmployeeQRGenerator;
