class UserController {

    constructor(formIdCreate, formIdUpdate, tableId) {
        this.formElCreate = document.getElementById(formIdCreate);
        this.formElUpdate = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);
        this.onSubmit();
        this.onEdit();
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

                tr.dataset.user = JSON.stringify(values);

                this.updateCount();
                this.showPanelCreate();


                this.getPhoto(this.formElUpdate).then(
                    (content) => {
                        /*check if have a new content, else, result._photo get the old photo*/
                        values.photo ? result._photo = content : result._photo = JSON.parse(tr.dataset.user)._photo;

                        tr.innerHTML = `
                            <td><img src="${result._photo}" alt="User Image" class="img-circle img-sm"></td>
                            <td>${result._name}</td>
                            <td>${result._email}</td>
                            <td>${result._admin ? 'Sim' : 'Não'}</td>
                            <td>${Utils.dataFormat(result._register)}</td>
                            <td>
                                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                                <button type="button" class="btn btn-delete btn-danger btn-xs btn-flat">Excluir</button>
                            </td>
                        `;
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

                //values from form
                let values = this.getValues(this.formElCreate);
                if (!values) return false;

                this.getPhoto(this.formElCreate).then(
                    (content) => {
                        /*essa função vai receber o conteudo do meu arquivo*/
                        values.photo = content;
                        this.addLine(values);

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
                //form verification
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
                <button type="button" class="btn btn-delete btn-danger btn-xs btn-flat">Excluir</button>
            </td>`;

        this.addEventsTr(tr);
        this.tableEl.appendChild(tr);
        this.updateCount();
    }

    addEventsTr(tr) {
        //edit data from old user

        tr.querySelector(".btn-delete").addEventListener("click", e => {
            if (confirm("Deseja realmente excluir?")) {
                tr.remove();
                this.updateCount();
            }
        }


        )

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