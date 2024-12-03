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

/* let usdInput = document.querySelector("#usd")

let brlInput = document.querySelector("#brl")


usdInput.addEventListener("keyup", () =>{
    console.log(usdInput.value)
    
})

brlInput.addEventListener("keyup", ()=>{
    console.log("Apertou no campo BRL.")
})*/

let dolar = 6.07


let usdInput = document.querySelector("#usd")

let brlInput = document.querySelector("#brl")


usdInput.addEventListener("keyup",() =>{
    
converter("usd-to-brl")

})


brlInput.addEventListener("keyup",() =>{
    converter("brl-to-usd")
})


usdInput.addEventListener("blur", () =>{
    usdInput.value = formatCurrency(usdInput.value)
})

brlInput.addEventListener("blur", () =>{
    brlInput.value = formatCurrency(brlInput.value)
})


usdInput.value = "1,00"
converter("usd-to-brl")


//funções

function formatCurrency(value){

    //ajustar o valor
    let fixedValue = fixValue(value)
    //utilizar função de formatar
    let options = {
        useGrouping: false,
        minimumFractionDigits: 2
    }
    
    //retorna o valor formatado
    let formatter = new Intl.NumberFormat("pt-BR", options)
    return formatter.format(fixedValue)
}

function fixValue(value){
    let fixedValue = value.replace("," , ".")
    let  floatValue = parseFloat(fixedValue) 

    if (value.trim() === "") {
        return 0;
    }
    if (isNaN(floatValue)) {
        return 0; // Retorna 0 se não for um número válido
    }
    return floatValue
}

function converter(type){
if(type == "usd-to-brl"){
    //ajustar o valor
    let fixedValue = fixValue(usdInput.value)
    //converter o valor
     let result = fixedValue * dolar 
      result = result.toFixed(2); //pegar os decimais desse numero e transforma em dois
    //mostra no campo de real 
    brlInput.value = formatCurrency(result)
}
if( type == "brl-to-usd"){
    //ajustar o valor
    let fixedValue = fixValue(brlInput.value)

    //converter o valor
    let result = fixedValue / dolar
    result = result.toFixed(2);
    //mostra no campo de real
    usdInput.value = formatCurrency (result)
}

}

