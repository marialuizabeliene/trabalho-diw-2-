const usuariosValidos = [
  { usuario: "admin", senha: "admin123" },
  { usuario: "usuario", senha: "senha123" }
];

const formLogin = document.getElementById("loginForm");
if(formLogin){
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const usuario = document.getElementById("username").value.trim();
    const senha = document.getElementById("password").value.trim();

    const usuarioEncontrado = usuariosValidos.find(u => u.usuario === usuario && u.senha === senha);
    if(usuarioEncontrado){
      localStorage.setItem("usuarioLogado", usuario);
      alert("Login realizado com sucesso!");
      window.location.href = "index.html";
    } else {
      alert("Usuário ou senha inválidos");
    }
  });
}
