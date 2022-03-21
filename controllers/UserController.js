class UserController {

    constructor(formIdCreate, formIdUpdate, tableId) {
        this.formElCreate = document.getElementById(formIdCreate);
        this.formElUpdate = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);
        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }

    onEdit() {
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e => {
            this.showPanelCreate();
        });

        this.formElUpdate.addEventListener("submit",
            event => {
                event.preventDefault();

                let btn = this.formElUpdate.querySelector("[type=submit]");
                btn.disabled = true;

                let values = this.getValues(this.formElUpdate);
                if (!values) return false;

                let index = this.formElUpdate.dataset.trIndex;
                let tr = this.tableEl.rows[index];

                let result = Object.assign({}, JSON.parse(tr.dataset.user), values)

                this.updateCount();
                this.showPanelCreate();

                this.getPhoto(this.formElUpdate).then(
                    (content) => {
                        /*check if have a new content, else, result._photo get the old photo*/
                        values.photo ? result._photo = content : result._photo = JSON.parse(tr.dataset.user)._photo;

                        let user = new User();
                        user.loadFromJSON(result);

                        user.save();

                        this.getTr(user, tr);

                        this.formElUpdate.reset();
                        btn.disabled = false;
                    },
                    (e) => {
                        alert(e);
                    }
                );
            }
        );
    }


    onSubmit() {
        this.formElCreate.addEventListener("submit",
            event => {
                event.preventDefault();

                let btn = this.formElCreate.querySelector("[type=submit]");
                btn.disabled = true;

                /*User values from form*/
                let values = this.getValues(this.formElCreate);
                if (!values) return false;

                this.getPhoto(this.formElCreate).then(
                    /*sucess with file, content is the file that getPhoto returns*/ 
                    (content) => {
                        values.photo = content;

                        /*method to save himself in localStorage*/
                        values.save();
                        this.addLine(values);

                        /*finish operation*/
                        this.formElCreate.reset();
                        btn.disabled = false;
                    },
                    (e) => {
                        alert(e);
                    }
                );
            });
    }

    getValues(formElCreate) {
        let user = {};
        let isValid = true;

        [...formElCreate.elements].forEach(
            function (field, index) {
                /*required fields from form verification*/
                if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {
                    field.parentElement.classList.add('has-error');
                    isValid = false;
                }

                if (field.name == "gender" && field.checked) {
                    user[field.name] = field.value;
                } else if (field.name == "admin") {
                    user[field.name] = field.checked;
                } else {
                    user[field.name] = field.value;
                }
            }
        );

        if (!isValid) {
            return false;
        }

        return new User(
            user.name, user.gender, user.birth,
            user.country, user.email, user.password,
            user.photo, user.admin
        );
    }

    /*Get all Users from Storage and put in the view*/
    selectAll() {
        let users = User.getUserStorage();
        users.forEach(
            dataUser => {
                let user = new User();
                user.loadFromJSON(dataUser);
                this.addLine(user);
            }
        )
    }
    
    addLine(dataUser) {
        let tr = this.getTr(dataUser);
        
        this.tableEl.appendChild(tr);
        this.updateCount();
    }

    getTr(dataUser, tr = null) {
        if (tr === null) tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = `
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${dataUser.admin ? 'Sim' : 'Não'}</td>
            <td>${Utils.dataFormat(dataUser.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-delete btn-danger btn-xs btn-flat">Excluir</button>
            </td>`;
        this.addEventsTr(tr)
        return tr;
    }

    addEventsTr(tr) {
        /*delete user*/
        tr.querySelector(".btn-delete").addEventListener("click", e => {
            if (confirm("Deseja realmente excluir?")) {
                let user = new User();

                user.loadFromJSON(JSON.parse(tr.dataset.user));

                user.remove();

                tr.remove();
                this.updateCount();
            }
        });

        /*edit data from old user*/
        tr.querySelector(".btn-edit").addEventListener("click",
            e => {
                let json = JSON.parse(tr.dataset.user);

                this.formElUpdate.dataset.trIndex = tr.sectionRowIndex;

                //get data
                for (let name in json) {
                    let field = this.formElUpdate.querySelector("[name=" + name.replace("_", "") + "]");

                    if (field) {
                        switch (field.type) {
                            case 'file':
                                continue;
                            case 'radio':
                                field = this.formElUpdate.querySelector("[name=" + name.replace("_", "") + "][value=" + json.name + "]");
                                break;
                            case 'checkbox':
                                field.checked = json[name];
                                break;
                            default:
                                field.value = json[name];
                                break;
                        }
                    }
                }
                this.formElUpdate.querySelector(".photo").src = json._photo;

                this.showPanelUpdate();
            })
    }

    showPanelCreate() {
        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";
    }

    showPanelUpdate() {
        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";
    }

    /*update count from admin and normal users in the view*/
    updateCount() {
        let numbersUsers = 0;
        let numberAdmin = 0;
        [...this.tableEl.children].forEach(tr => {
            numbersUsers++;
            let user = JSON.parse(tr.dataset.user);
            if (user._admin) numberAdmin++;
        });

        document.querySelector("#number-users-admin").innerHTML = numberAdmin;
        document.querySelector("#number-users").innerHTML = numbersUsers;
    }

    getPhoto(formEl) {
        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();

            //filtrando elemeentos do formulário apenas por quem for de nome foto
            let elements = [...formEl.elements].filter(
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

}