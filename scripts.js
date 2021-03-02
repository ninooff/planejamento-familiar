const Modal = {
    open() {
        document.querySelector('.modal-overlay')
            .classList.add('active')
    },
    close() {
        document.querySelector('.modal-overlay')
            .classList.remove('active')
    }
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    },
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)
        App.reload()
    },

    // somar as entradas
    incomes() {
        let income = 0;
        //pegar todas as transações, para cada transação
        Transaction.all.forEach(transaction => {
            //se ela for > 0 
            if (transaction.amount > 0) {
                //somar a uma variavel e retornar variavel
                income += transaction.amount
            }
        })
        return income
    },

    // somar as saidas; adicionar os types
    expenses() {
        let expense = 0;
        //tipos
        let food = 0;
        let home = 0;
        let products = 0;
        let cosmetics = 0;
        let others = 0;

        //pegar todas as transações, para cada transação
        Transaction.all.forEach(transaction => {
            //se ela for < 0 
            if (transaction.amount < 0) {
                //somar a uma variavel e retornar variavel
                expense += transaction.amount

                let tipo = transaction.type
                switch (tipo) {
                    case 'Outros' :
                        others += transaction.amount;
                        
                        break;

                    case 'Cosméticos' :
                        cosmetics += transaction.amount;
                        break;

                    case 'Produtos' :
                        products += transaction.amount;
                        break;

                    case 'Alimentação' :
                        food += transaction.amount;
                        break;

                    case 'Gastos domiciliares' :
                        home += transaction.amount;
                        break;
                }
            }
        })
        
        return {expense, others, cosmetics, products, food, home}

        },

    //entradas - saidas
    total() {
        return Transaction.incomes() + Transaction.expenses().expense
    },    
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
        console.log(Transaction.expenses().others)
    },


    
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense";

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
       
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="type">${transaction.type}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})"src="./assets/minus.svg" alt="Remover Transação">
            </td>
        
        `
       

        return html
    },

    updateBalance() {
        document.
            getElementById('incomeDisplay')
            //soma das entradas
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.
            getElementById('expenseDisplay')
            //soma das saídas
            .innerHTML = Utils.formatCurrency(Transaction.expenses().expense)
        document.
            getElementById('totalDisplay')
            //total
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {

    formatAmount(value) {
        value = value * 100
        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`

    },
    // formatação em real
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100


        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    },

}

const Form = {

    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    type: document.querySelector('input#type'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
            type: Form.type.value,
        }
    },

    validateFields() {
        const { description, amount, date, type } = Form.getValues();
        
        if (description.trim() === "" || amount.trim() === "" || date.trim() === "" || type.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }

    },

    formatValues() {
        let { description, amount, type, date } = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description, amount, date, type
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
        Form.type.value = ""
    },

    submit(event) {
        //freeza no console
        event.preventDefault()
        try {
            // verificar se todas as informações foram preenchidas
            Form.validateFields()
            // formatar os dados para salvar
            const transaction = Form.formatValues()
            // salvar 
            Form.saveTransaction(transaction)
            // apagar os dados do formulario 
            Form.clearFields()
            //modal feche
            Modal.close()
            // atualizar a aplicação com reload
            // ja tem no add
        } catch (error) {
            alert(error.message)
        }




    },

}


function Graphic() {
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {

      var data = google.visualization.arrayToDataTable([
        ['Setores', 'Gastos por Setores'],
        ['Gastos domiciliares', (Transaction.expenses().home)*=-1],
        ['Alimentação', (Transaction.expenses().food)*=-1],
        ['Produtos', (Transaction.expenses().products)*=-1],
        ['Cosméticos', (Transaction.expenses().cosmetics)*=-1],
        ['Outros', (Transaction.expenses().others)*=-1]
      ]);

      var options = {
        title: 'Onde mais gastei'
      };

      var chart = new google.visualization.PieChart(document.getElementById('piechart'));

      chart.draw(data, options);
    }
 }

const App = {
    init() {

        //rodando a const Transactions e e executando(para cada transação)
        // a função addTransaction
        /*Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })*/
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()
        Graphic()
        Storage.set(Transaction.all)

    },
    reload() {

        DOM.clearTransactions()

        App.init()
    },
}
App.init()

