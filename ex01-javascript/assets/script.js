//tipos de variáveis:  
//let idade = 80;// tipo de variável: número
//let nome = "Alyson";// tipo de variável: string

//let num1 = ((idade * (2+4))/2)//tipo de variável: usando calcúlo

//let logado = true //tipo variável: booleano

//array e objetos

//let ingredientes = ["farinha", "água", "sal", "corante"]



/*
let personagem = {
    nome: "Alyson",
    idade: 18,
    nivel: 16,
    forca: 7,
    magia: 0,
    vida: 3,
    aura: 6,
}
*/

//INPUT
//PROCESSA
//OUTPUT

/*function somar(a, b){
     let resultado = a + b;
    return resultado
}*/


/*
let idade = 20;

if(idade >= 18){
   
    console.log("Você é maior de idade.");
}else{
    console.log("Você é menor de idade.")
}
*/

/*let lista = ["calça", "bermuda", "camisa", "tênis "]

for(let item of lista){

    console.log( item)
}*/

function clique(){
    alert("clicado")
}


let botao = document.querySelector("#botao")


botao.addEventListener("click", () =>{
    clique()
})  

