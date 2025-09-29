// Test de connexion API
const testAPIConnection = async () => {
  try {
    console.log('🧪 Test de connexion à l\'API...');
    
    // Test de l'endpoint de base
    const baseResponse = await fetch('http://localhost:3003/api');
    console.log('📡 Statut de base:', baseResponse.status);
    const baseText = await baseResponse.text();
    console.log('📄 Réponse de base:', baseText);
    
    // Test de connexion avec les credentials de test
    const loginResponse = await fetch('http://localhost:3003/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'superadmin@gestion-salaires.com',
        password: 'superadmin123'
      })
    });
    
    console.log('🔐 Statut de connexion:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('📋 Réponse de connexion:', loginData);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
};

// Fonction à appeler depuis la console du navigateur
window.testAPIConnection = testAPIConnection;

console.log('🛠️ Script de test chargé. Tapez "testAPIConnection()" dans la console pour tester.');
export default testAPIConnection;