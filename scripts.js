
const Modal = {
    open() {
        document.querySelector('.modal-overlay')
            .classList.add('active')
    },
    close() {
        document.querySelector('.modal-overlay')
            .classList.remove('active')

        let enabled = document.querySelectorAll('.input-group')

        for (let i = 0; i < 3; i++) {
            enabled[i].classList.add('disabled')
        }

        document.querySelector(".input-group-out")
            .setAttribute('hidden', 'true')

        document.querySelector(".input-group-in")
            .setAttribute('hidden', 'true')

        document.querySelector(".recado")
            .classList.remove('disabled')
    },
    in() {
        Form.clearFields();
        let enabled = document.querySelectorAll('.input-group')
        for (let i = 0; i < 3; i++) {
            enabled[i].classList.remove('disabled')
        }

        document.querySelector(".input-group-out")
            .setAttribute('hidden', 'true')
        document.querySelector(".input-group-in")
            .removeAttribute('hidden')
        document.querySelector(".recado")
            .classList.add('disabled')

    },
    out() {
        Form.clearFields();
        let enabled = document.querySelectorAll('.input-group')
        for (let i = 0; i < 3; i++) {
            enabled[i].classList.remove('disabled')
        }

        document.querySelector(".input-group-in")
            .setAttribute('hidden', 'true')
        document.querySelector(".input-group-out")
            .removeAttribute('hidden')
        document.querySelector(".recado")
            .classList.add('disabled')

    },
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    },
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },

    // somar as entradas
    incomes() {
        let income = 0;
        //pegar todas as transações, para cada transação
        Transaction.all.forEach(transaction => {
            //se ela for > 0 
            /*if (transaction.amount > 0) {
                //somar a uma variavel e retornar variavel
                income += transaction.amount
            }*/
            if (transaction.typeOut == "") {
                console.log('income')
                income += transaction.amount
            }
        })
        return income
    },

    // somar as saidas; adicionar os types
    expenses() {
        let expense = 0;
        //tipos
        let food = 0; let nFood = 0;
        let home = 0; let nHome = 0;
        let products = 0; let nProducts = 0;
        let cosmetics = 0; let nCosmetics = 0;
        let others = 0; let nOthers = 0;

        //pegar todas as transações, para cada transação
        Transaction.all.forEach(transaction => {
            if (transaction.typeIn == "" || transaction.amount < 0) {
                expense -= Math.abs(transaction.amount)
                let tipo = transaction.typeOut
                switch (tipo) {
                    case 'Outros':
                        others += transaction.amount;
                        nOthers = Utils.formatToGraph(others);
                        break;

                    case 'Cosméticos':
                        cosmetics += transaction.amount;
                        nCosmetics = Utils.formatToGraph(cosmetics);
                        break;

                    case 'Produtos':
                        products += transaction.amount;
                        nProducts = Utils.formatToGraph(products);
                        break;

                    case 'Alimentação':
                        food += transaction.amount;
                        nFood = Utils.formatToGraph(food);
                        break;

                    case 'Gastos domiciliares':
                        home += transaction.amount;
                        nHome = Utils.formatToGraph(home);
                        break;
                }
            }
        })

        return { expense, nOthers, nCosmetics, nProducts, nFood, nHome }

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
    },


    //mudar aqui
    innerHTMLTransaction(transaction, index) {
        let type
        let CSSclass = ''
        if (transaction.typeOut == "") {
            CSSclass = "income"
            type = transaction.typeIn
        } else {
            CSSclass = "expense"
            type = transaction.typeOut
        }

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
       
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="type-in">${type}</td>
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

    formatToGraph(value) {
        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        return value
    },

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
    typeIn: document.querySelector('input#type-in'),
    typeOut: document.querySelector('input#type-out'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
            typeIn: Form.typeIn.value,
            typeOut: Form.typeOut.value,
        }
    },

    validateFields() {
        const { description, amount, date, typeIn, typeOut } = Form.getValues();

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "" || typeIn.trim() === "" && typeOut.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }

    },

    formatValues() {
        let { description, amount, typeIn, typeOut, date } = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        //type = Utils.formatAmount(type)
        return {
            description, amount, date, typeIn, typeOut
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
        Form.typeIn.value = ""
        Form.typeOut.value = ""
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
    if (Transaction.expenses().expense == 0) {
        zeroGraphic()
    } else {
        google.charts.load('current', { 'packages': ['corechart'] });
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {

            var data = google.visualization.arrayToDataTable([
                ['Setores', 'Gastos por Setores'],
                ['Gastos domiciliares', (Transaction.expenses().nHome)],
                ['Alimentação', (Transaction.expenses().nFood)],
                ['Produtos', (Transaction.expenses().nProducts)],
                ['Cosméticos', (Transaction.expenses().nCosmetics)],
                ['Outros', (Transaction.expenses().nOthers)]
            ]);

            var options = {
                title: 'Onde mais gastei:'
            };

            var chart = new google.visualization.PieChart(document.getElementById('piechart'));

            chart.draw(data, options);
        }
    }

}

function zeroGraphic() {
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {

        var data = google.visualization.arrayToDataTable([
            ['Setores', 'Gastos por Setores'],
            ['Insira um novo gasto', 100],
            ['No botão nova transação', 100]
        ]);

        var options = {
            title: 'Onde mais gastei:'
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
        zeroGraphic()

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
//console.log(Transaction.expenses().nFood)   
App.init()

