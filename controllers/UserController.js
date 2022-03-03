class UserController {

    constructor(formId, tableId) {
        this.formEl = document.getElementById(formId);
        this.tableEl = document.getElementById(tableId);
        this.onSubmit();
    }


    onSubmit() {
        this.formEl.addEventListener("submit",
            event => {
                event.preventDefault();

                //peega os valores do formúlário
                let values = this.getValues();

                this.getPhoto().then(
                    (content)=>{
                        /*essa função vai receber o conteudo do meu arquivo*/
                        values.photo = content;
                        this.addLine(values);
                    },
                    (e)=>{
                        alert(e);
                    }

                );
            });
    }

    getPhoto() {
        return new Promise( (resolve, reject) => {
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

                fileReader.onerror = (e) =>{
                    reject(e);
                }

                fileReader.readAsDataURL(file);
            }        
        )


    }


    getValues() {
        let user = {};
        //captura dos dados ao evento submit dentro do formulário
        [...this.formEl.elements].forEach(
            function (field, index) {
                if (field.name == "gender" && field.checked) {
                    user[field.name] = field.value;
                } else {
                    user[field.name] = field.value;
                }
            }
        );

        return new User(
            user.name, user.gender, user.birth,
            user.country, user.email, user.password,
            user.photo, user.admin
        );
    }

    addLine(dataUser) {
        this.tableEl.innerHTML = `
            <tr>
                <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
                <td>${dataUser.name}</td>
                <td>${dataUser.email}</td>
                <td>${dataUser.admin}</td>
                <td>${dataUser.birth}</td>
                <td>
                    <button type="button" class="btn btn-primary btn-xs btn-flat">Editar</button>
                    <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
                </td>
            </tr>`
            ;
    }



}