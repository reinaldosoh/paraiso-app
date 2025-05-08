export default defineNuxtRouteMiddleware(async (to, from) => {
  // Não verificar autenticação na página inicial ou páginas de auth
  if (to.path === '/' || to.path.includes('/auth')) {
    return;
  }

  const nuxtApp = useNuxtApp();
  
  // Se o plugin ainda não estiver disponível, redirecionar para a página inicial
  if (!nuxtApp.$supabase) {
    return navigateTo('/');
  }

  // Verificar a sessão do usuário
  const { data } = await nuxtApp.$supabase.auth.getSession();
  
  // Se o usuário não estiver autenticado, redirecionar para a página inicial
  if (!data.session) {
    return navigateTo('/');
  }
});
