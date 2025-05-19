
// Script para garantir redirecionamento imediato para a página de login
(function() {
  // Verificar se está na rota raiz ou em outra página não autenticada
  if (window.location.pathname === '/' || 
      window.location.pathname === '' || 
      window.location.pathname === '/index.html') {
    console.log('Redirecionamento imediato para /login');
    // Usar uma abordagem mais forte com replace para evitar histórico
    window.location.replace('/login');
  }
})();
