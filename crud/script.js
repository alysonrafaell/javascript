const form = document.getElementById("form");
const username = document.getElementById("username");
const ddn = document.getElementById("ddn");
const cpf = document.getElementById("cpf");
const cep = document.getElementById("cep");
const rua = document.getElementById("rua");
const num = document.getElementById("num");
const bairro = document.getElementById("bairro");
const cidade = document.getElementById("cidade");
const ddd = document.getElementById("ddd");
const telefone = document.getElementById("telefone");
const email = document.getElementById("email");



    form.addEventListener("submit", (event) =>{
        event.preventDefault();
        
        checkform();
})

username.addEventListener("blur", ()=>{
    checkInputUsername();
})
ddn.addEventListener("blur", ()=>{
    checkInputDdn();
})
cpf.addEventListener("blur", ()=>{
    checkInputCpf();
})
cep.addEventListener("blur", ()=>{
    checkInputCep();
})
rua.addEventListener("blur", ()=>{
    checkInputRua();
})

ddd.addEventListener("blur", ()=>{
    checkInputDdd();
})
telefone.addEventListener("blur", ()=>{
    checkInputTelefone();
})
email.addEventListener("blur", ()=>{
    checkInputEmail();
})
cidade.addEventListener("blur", ()=>{
    checkInputCidade();
})
num.addEventListener("blur", ()=>{
    checkInputNum();
})
bairro.addEventListener("blur", ()=>{
    checkInputBairro();
})





function checkInputUsername (){
    const usernameOnlyRegex =/^[A-Za-z\s]+$/; 
    const usernameValue = username.value;
    if(usernameValue === ""){
    erroInput(username, "Nome obrigatóro.")
    }else if(!usernameOnlyRegex.test(usernameValue)){
erroInput(username, "Nome deve ter somente letras.")
    }else{
const formItem = username.parentElement;
formItem.className= "meio"}
}

function checkInputDdn (){
    const ddnValue = ddn.value;
    if(ddnValue === ""){
        erroInput(ddn,"Data de nascimento obrigatório.")
    }else{
        const formItem = ddn.parentElement;
        formItem.className ="meio"
    }
}

function checkInputCpf(){
    const cpfOnlyRegex = /^[0-9]{11}$/;
    const cpfValue = cpf.value;
    if(cpfValue === ""){
        erroInput(cpf, "Cpf obrigatório.")
    }else if(!cpfOnlyRegex.test (cpfValue)){
        erroInput(cpf, "Cpf somente aceita número e deve ter 11 dígitos")
    }else{
    const formItem = cpf.parentElement;
    formItem.className = "meio"}
}


function checkInputCep(){
    const cepOnlyRegex =  /^[0-9]{8}$/;
    const cepValue = cep.value;
    if(cepValue === ""){
        erroInput(cep, "Cep obrigatório.")
    }else if(!cepOnlyRegex.test(cepValue)){
        erroInput(cep, "Apenas números são permitidos e o valor deve ter até 8 dígitos.")
    }else{
        const formItem = cep.parentElement;
    formItem.className = "meio"
    }
    
}

function checkInputRua(){
    const ruaValue = rua.value;
    if(ruaValue === ""){
        erroInput(rua, "Rua é obrigatório.")
    }else{
        const formItem = rua.parentElement;
        formItem.className = "meio"
    }
}

function checkInputNum(){
    const numValue = num.value;
    const numOnlyRegex = /^[A-Za-z0-9\s]+$/;
    if(numValue === ""){
            erroInput(num, "Nº obrigatório.")
    }else if(!numOnlyRegex.test (numValue) || numValue.length > 7){
       erroInput(num, "Número deve conter apenas letras e números e ter no máximo 7 caracteres.")
    }else{const formItem = num.parentElement;
            formItem.className = "meio"}
    }

   
    function checkInputBairro(){
        const bairroOnlyRegex = /^[A-Za-z\s]+$/;
    
        const bairroValue = bairro.value;
    
        if(bairroValue === ""){
                erroInput(bairro, "Bairro obrigatório.")
        }
        else if(!bairroOnlyRegex.test (bairroValue)){
            erroInput(bairro, "Bairro deve ter exclusivamente letras e ter até 20 dígitos.")
        }
        else{const formItem = bairro.parentElement;
    formItem.className = "meio"}
        
    }

function checkInputCidade(){
    const cidadeOnlyRegex = /^[A-Za-z\s]+$/;
    const cidadeValue = cidade.value;
    if(cidadeValue === ""){
            erroInput(cidade, "Cidade obrigatório.")
    }else if(!cidadeOnlyRegex.test (cidadeValue) || cidadeValue.length > 20){
        erroInput(cidade,"Cidade deve ter  exclusivamente letras e até 20 dígitos.")
    }else{
    const formItem = cidade.parentElement;
    formItem.className = "meio"}
}


function checkInputDdd(){
    const dddOnlyRegex = /^[0-9]{3}$/;
    const dddValue = ddd.value;
    if(dddValue === ""){
            erroInput(ddd, "DDD obrigatório.")
    }else if(!dddOnlyRegex.test (dddValue)){
       erroInput(ddd, "DDD  deve ter exclusivamente 3 números.")
    }else{ const formItem = ddd.parentElement;
        formItem.className = "meio"}
}


function checkInputTelefone(){
    const telefoneOnlyRegex = /^[0-9\s]{1,11}$/
    const telefoneValue = telefone.value;

    if(telefoneValue === ""){
            erroInput(telefone, "Telefone obrigatório.")
    }else if(!telefoneOnlyRegex.test (telefoneValue) || telefoneValue.replace(/\s+/g,'').length !== 11){
        erroInput(telefone, "O telefone precisa ter 11 dígitos e somente ter números.")
    }else{
        const formItem = telefone.parentElement;
        formItem.className ="meio"
    }

}

function checkInputEmail(){
    const emailValue = email.value;
    if(emailValue === ""){
            erroInput(email, "Cidade obrigatório.")
    }else{
        const formItem = email.parentElement;
        formItem.className = "meio"
    }
}

function checkform(){
    checkInputUsername();
        checkInputDdn();
        checkInputCpf();
        checkInputCep();
        checkInputRua();
        checkInputNum();
        checkInputBairro();
        checkInputCidade();
        checkInputDdd();
        checkInputTelefone();
        checkInputEmail();


        const formItems = form.querySelectorAll(".meio.erro")

        const isValid = [...formItems].every( (item) =>{
            return item.className === "meio"
        });
           
       if(isValid){
            window.location.href = "pag2.html";
       }
}





function erroInput(input, message){
    const formItem = input.parentElement;
    const textMessage = formItem.querySelector("a")

    textMessage.innerText = message;
     formItem.className = "meio erro"
}
