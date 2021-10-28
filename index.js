// connect our server
const db = require("./db/connection");
const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");

// inital function with questions
const whatToDo = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "whatToDo",
        message: "What would you like to do?",
        choices: [
          "view all departments",
          "view all roles",
          "view all employees",
          "add a department",
          "add a role",
          "add an employee",
          "update an employee",
        ],
      },
    ])
    .then((answers) => {
      const { whatToDo } = answers;

      if (whatToDo === "view all departments") {
        viewDepartments();
      } else if (whatToDo === "view all roles") {
        viewRoles();
      } else if (whatToDo === "view all employees") {
        viewEmployees();
      } else if (whatToDo === "add a department") {
        addDepartment();
      } else if (whatToDo === "add a role") {
        addRole();
      } else if (whatToDo === "add an employee") {
        addEmployee();
      } else if (whatToDo === "update an employee") {
        updateEmployee();
      }
    });
};

// view all departments
const viewDepartments = () => {
  // name and ids from list
  const sql = `SELECT * FROM department`;

  db.query(sql, (err, rows) => {
    // if error occurs
    if (err) {
      throw err;
    }

    // show us our departments
    console.table(rows);

    // re ask what to do
    whatToDo();
  });
};

// view all roles
const viewRoles = () => {
  const sql = `SELECT * FROM role`;

  db.query(sql, (err, rows) => {
    // if error occurs
    if (err) {
      throw err;
    }

    // show us our roles
    console.table(rows);

    // re ask what to do
    whatToDo();
  });
};

// view all employees
const viewEmployees = () => {
  const sql = `SELECT employee.id, employee.first_name, employee.last_name, title, salary, name AS department, CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name 
  FROM department
  JOIN role ON role.department_id = department.id
  JOIN employee ON employee.role_id = role.id
  LEFT JOIN employee manager ON employee.manager_id = manager.id;`;

  db.query(sql, (err, rows) => {
    // if error occurs
    if (err) {
      throw err;
    }

    // show us our departments
    console.table(rows);

    // re ask what to do
    whatToDo();
  });
};


// add a department
const addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "newDepartment",
        message: "Enter new department name: ",
      },
    ])
    .then((answers) => {
      const { newDepartment } = answers;

      const sql = `INSERT INTO department (name) VALUE (?)`;

      const params = [newDepartment];

      db.query(sql, params, (err, result) => {
        // if error occurs
        if (err) {
          throw err;
        }

        // tell user it was created
        console.log("new department added");

        // re ask what to do
        whatToDo();
      });
    });
};


// add a new role
const addRole = () => {

  const department = `SELECT * FROM department`;
  db.query(department, (err, res) => {
    if (err) throw err;

    const departmentList = res.map(({name, id}) => ({name: name, value: id}))

    inquirer.prompt([
      // name , salary , department
      {
        type: "input",
        name: "name",
        message: "Enter the new role name: ",
      },
      {
        type: "input",
        name: "sal",
        message: "Enter salary for the role",
      },
      {
        type: "list",
        name: "department",
        choices: departmentList,
        message: "Which department is this in",
      },
    ])
    .then((answers) => {
      const {name, sal, department} = answers

      const newRole = `INSERT INTO role SET ?`
      const params =
      {
        title: name,
        salary: sal,
        department_id: department
      }

      db.query(newRole, params, (err, res) => {

        if (err) throw err;
        console.log("Employee has been updated!");
      
        viewRoles();

      })
    
    })
  })
};


// add a new employee
const addEmployee = () => {

  const sqlRole = `SELECT * FROM role;`

  db.query(sqlRole, function(err, res) {
    if (err) throw err;
        
        const roles = res.map(({title, id}) => ({name: title, value: id}))

        inquirer
          .prompt([
              {
                name: "firstname",
                type: "input",
                message: "What is the employee's first name?",
              },
              {
                name: "lastname",
                type: "input",
                message: "What is the employee's last name?"
              },
              {
                  name: "role",
                  type: "list",
                  message: "What is the employee's role?",
                  choices: roles
              },
              {
                name: "manager",
                type: "input",
                message: "What is the employee's manager's ID#?"
              }
          ])
          .then(function(answer) {
            // our answers extracted from object 
            const {firstname, lastname, role, manager} = answer;
            // our query instructions 
            const insert = `INSERT INTO employee SET ?`

            // is how our table in roles is 
            const params = 
            {
              first_name: firstname,
              last_name: lastname,
              role_id: role,
              manager_id: manager
            };

            db.query(insert, params, (err, res) => {
              // if err 
              if (err) throw err;

              // tell user employee was added 
              console.log("Employee was successfully added");
              
              // show the employees
              viewEmployees();
            })
              
          })
                  
  })
  
}





// Function | Update Employee Role
function updateEmployee() {

  // get employees from employee table 
  const employeeSql = `SELECT * FROM employee`;

  db.query(employeeSql, (err, data) => {
    if (err) throw err; 

    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));

    inquirer
    .prompt([
      {
        type: 'list',
        name: 'name',
        message: "Which employee would you like to update?",
        choices: employees
      }
    ])
      .then(answer => {
        const employee = answer.name;
        const params = []; 
        params.push(employee);

        const roleSql = `SELECT * FROM role`;

        db.query(roleSql, (err, data) => {
          if (err) throw err; 

          const roles = data.map(({ id, title }) => ({ name: title, value: id }));
          
            inquirer.prompt([
              {
                type: 'list',
                name: 'role',
                message: "What is the employee's new role?",
                choices: roles
              }
            ])
                .then(roleChoice => {
                const role = roleChoice.role;
                params.push(role); 
                
                let employee = params[0]
                params[0] = role
                params[1] = employee 

                const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

                db.query(sql, params, (err, result) => {
                  if (err) throw err;
                console.log("Employee has been updated!");
              
                viewEmployees();
          });
        });
      });
    });
  });
};


whatToDo();

// npm init
// npm install --save mysql2
// npm install inquirer
// npm install console.table --save
