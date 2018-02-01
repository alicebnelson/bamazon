//Dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

//Connection
var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root", //your username
    password: "root", //your password
    database: "bamazon_db"
});

connection.connect(function(err){
    if (err) throw err;
    start(); //runs the program
    
    
});

function displayTable(){ //makes a table to display all the inventory
    connection.query('SELECT item_id, product_name, price FROM products', function(err, result){
        if(err) console.log(err);
        var table = new Table({
            head: ['Item Id#', 'Product Name', 'Price'], //table header
            style: {
                compact: false,
                colAligns: ['center'],
            }
        });

        //loops through each item in the mysql database and pushes that information into a new row in the table
        for(var i = 0; i < result.length; i++){
            table.push(
                [result[i].item_id, result[i].product_name, result[i].price]
            );
        }
        console.log(table.toString()); //converts table to string and displays table
    });
}

displayTable();
function start(){
    connection.query("SELECT * FROM products", function(err, result){ //work in the products table
        if (err) throw err;
        
        inquirer.prompt([ //starts asking user questions
        {
          name: "idNumber",
          type: "input",
          message: "What is the ID number of the item you want to purchase?"
        },{
          name: "quantity",
          type: "input",
          message: "How many do you want to buy?"   
        },
        ]).then(function(answers){
          //set captured input as variables and passes variables as parameters  
          var quantityInput = answers.quantity;
          var idInput = answers.idNumber;
          purchase(idInput, quantityInput);  
        }, function(error){
            console.log(error);
        });
       
    });

}

function purchase(idNumber, NeededQuantity){
    //chekcing product quantity to see if item is in stock. If so, subtract quantity and update. If not, display alert for user
    connection.query('SELECT * FROM products WHERE item_id = ' + idNumber, function(err, response){
        if (err) throw err;
        if (NeededQuantity <= response[0].stock_quantity){
            var totalCost = response[0].price * NeededQuantity;
            console.log("That'll be " + NeededQuantity + " " + response[0].product_name + " for " + totalCost + ". Come again!");
            connection.query('UPDATE products SET stock_quantity = stock_quantity - ' + NeededQuantity + ' WHERE item_id = ' + idNumber);     
        } else {
            console.log("Sorry. We don't have enough " + response[0].product_name + " in stock.");
        };
    });
}