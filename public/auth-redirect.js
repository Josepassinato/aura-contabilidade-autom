
// Script para garantir redirecionamento imediato para a página de login
(function() {
  // Verificar se está na rota raiz
  if (window.location.pathname === '/' || 
      window.location.pathname === '' || 
      window.location.pathname === '/index.html') {
    console.log('Redirecionamento imediato para /login');
    window.location.href = '/login';
  }
})();
