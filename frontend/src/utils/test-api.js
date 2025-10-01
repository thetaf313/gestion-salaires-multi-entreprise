// Test de connexion API
const testAPIConnection = async () => {
  try {
    console.log("🧪 Test de connexion à l'API...");

    // Test de l'endpoint de base
    const baseResponse = await fetch("http://localhost:3003/api");
    console.log("📡 Statut de base:", baseResponse.status);
    const baseText = await baseResponse.text();
    console.log("📄 Réponse de base:", baseText);

    // Test de connexion avec les credentials de test ADMIN
    console.log("\n🔐 Test de connexion ADMIN...");
    const loginResponse = await fetch("http://localhost:3003/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@techsolutions.com",
        password: "admin123",
      }),
    });

    console.log("🔐 Statut de connexion:", loginResponse.status);
    const loginData = await loginResponse.json();
    console.log("📋 Réponse de connexion:", loginData);

    if (loginData.data?.accessToken) {
      // Test du profil utilisateur avec le token
      console.log("\n👤 Test du profil utilisateur...");
      const profileResponse = await fetch(
        "http://localhost:3003/api/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${loginData.data.accessToken}`,
          },
        }
      );

      console.log("👤 Statut du profil:", profileResponse.status);
      const profileData = await profileResponse.json();
      console.log("📋 Données du profil:", profileData);

      if (profileData.data?.companyId) {
        console.log(
          "✅ L'utilisateur ADMIN a bien un companyId:",
          profileData.data.companyId
        );
        console.log("🏢 Entreprise:", profileData.data.company?.name);
      } else {
        console.log("❌ L'utilisateur ADMIN n'a pas de companyId");
      }
    }
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
  }
};

// Fonction à appeler depuis la console du navigateur
window.testAPIConnection = testAPIConnection;

console.log(
  '🛠️ Script de test chargé. Tapez "testAPIConnection()" dans la console pour tester.'
);
export default testAPIConnection;
