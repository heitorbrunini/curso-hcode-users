class UserController {

    constructor(formId, tableId) {
        this.formEl = document.getElementById(formId);
        this.tableEl = document.getElementById(tableId);
        this.onSubmit();
        this.onEditCancel();
    }

    onEditCancel(){
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click",e=>{
            this.showPanelCreate();
        })
    }


    onSubmit() {
        this.formEl.addEventListener("submit",
            event => {
                event.preventDefault();

                let btn =  this.formEl.querySelector("[type=submit]");
                btn.disabled = true;

                //peega os valores do formúlário
                let values = this.getValues();
                if (!values) return false;

                this.getPhoto().then(
                    (content) => {
                        /*essa função vai receber o conteudo do meu arquivo*/
                        values.photo = content;
                        this.addLine(values);

                        this.formEl.reset();
                        btn.disabled = false;
                    },
                    (e) => {
                        alert(e);
                    }

                );
            });
    }

    getPhoto() {
        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();

            //filtrando elemeentos do formulário apenas por quem for de nome foto
            let elements = [...this.formEl.elements].filter(
                item => {
                    if (item.name === 'photo') {
                        return item;
                    };
                }
            )

            //apontando para o arquivo que está no elemento filtrado
            let file = elements[0].files[0];

            //após carregar o arquivo será realizada uma função recebida de parametro com o arquivo carregado
            fileReader.onload = () => {
                resolve(fileReader.result);
            };

            fileReader.onerror = (e) => {
                reject(e);
            }
            file ? fileReader.readAsDataURL(file) : resolve('dist/img/boxed-bg.jpg');
        }
        )


    }


    getValues() {
        let user = {};
        let isValid = true;
        //captura dos dados ao evento submit dentro do formulário
        [...this.formEl.elements].forEach(
            function (field, index) {

                if (['name','email','password'].indexOf(field.name) > -1 && !field.value){
                        field.parentElement.classList.add('has-error');
                        isValid = false;
                }

                if (field.name == "gender" && field.checked) {

                    user[field.name] = field.value;

                } else if (field.name == 'admin') {

                    user[field.name] == field.checked;

                } else {

                    user[field.name] = field.value;

                }
            }
        );

        if (!isValid){
            return false;
        }
        return new User(
            user.name, user.gender, user.birth,
            user.country, user.email, user.password,
            user.photo, user.admin
        );
    }

    addLine(dataUser) {
        let tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser);
        
        tr.innerHTML = `
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${dataUser.admin ? 'Sim' : 'Não'}</td>
            <td>${Utils.dataFormat(dataUser.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
            </td>`;
        
            //edit data from old user
            tr.querySelector(".btn-edit").addEventListener("click", e=>{
            let json = JSON.parse(tr.dataset.user); form-user-update
            let form = document.querySelector("#form-user-update");
            //get data
            for (let name in json){
                let field = form.querySelector("[name="+name.replace("_","")+"]");
                
                if (field){
                    if (field.type == 'file') continue;
                    field.value = json[name];
                } 
            }

            this.showPanelUpdate();
        })
        this.tableEl.appendChild(tr);
    }

    showPanelCreate(){
        document.querySelector("#box-user-create").style.display="block";
        document.querySelector("#box-user-update").style.display="none";
    }

    showPanelUpdate(){
        document.querySelector("#box-user-create").style.display="none";
        document.querySelector("#box-user-update").style.display="block";        
    }

    updateCount(){
       let numbersUsers = 0;
       let numberAdmin = 0;
       [...this.tableEl.children].forEach( tr => {
            numbersUsers++;
            let user = JSON.parse (tr.dataset.user);
            if (user._admin) numberAdmin ++;  
        });
        
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;
        document.querySelector("#number-users").innerHTML = numbersUsers;
    }



}